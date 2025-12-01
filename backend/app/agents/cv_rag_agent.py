import os
import json
import requests
import numpy as np
from dotenv import load_dotenv

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunking import split_into_chunks
from app.services.embeddings import embed_chunks, embed_query
from app.services.vector_store import VectorStore

load_dotenv()


class CVRAGAgent:

    def __init__(self):
        self.api_key = os.getenv("HF_TOKEN")
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        self.model = "meta-llama/Llama-3.1-8B-Instruct"

        # Index FAISS (en mémoire)
        self.store = None

    async def analyze_cv(self, pdf_path: str):

        # 1️⃣ Extraction du texte du CV
        text = extract_text_from_pdf(pdf_path)

        # 2️⃣ Découpage en chunks
        chunks = split_into_chunks(text, chunk_size=800, overlap=80)

        # 3️⃣ Embeddings locaux
        vectors = embed_chunks(chunks)

        # 4️⃣ Initialisation FAISS
        if self.store is None:
            self.store = VectorStore(dimension=vectors.shape[1])
            self.store.add(vectors)

        # 5️⃣ Embedding de la requête
        query_vec = embed_query(
            "extrait toutes les informations importantes du CV : "
            "expériences, formations, projets, compétences techniques, soft skills, langues, certifications"
        ).reshape(1, -1)

        # Recherche des chunks pertinents
        indices = self.store.search(query_vec, top_k=5)
        relevant_chunks = [chunks[i] for i in indices[0]]

        context = "\n\n".join(relevant_chunks)

        # 6️⃣ Prompt STRICT (⚠️ soft skills NON déduites)
        prompt = f"""
Tu es un expert RH chargé d’extraire les informations d’un CV.

TU DOIS :
- répondre UNIQUEMENT en JSON pur
- ne PAS ajouter de phrases hors JSON
- ne PAS utiliser ```json
- respecter EXACTEMENT la structure demandée
- NE PAS mélanger expériences et éducation
- NE PAS inventer de compétences techniques
- NE PAS DÉDUIRE les soft skills : n’inclus dans "soft_skills" que celles qui sont
  clairement écrites dans le texte (ex: section Compétences, Soft Skills, Qualités…).
  Si tu n'es pas sûr → laisse "soft_skills": [].

Analyse UNIQUEMENT le texte suivant :

------------------------
{context}
------------------------

Retourne STRICTEMENT ce JSON :

{{
 "name": "",
 "contact": {{
    "email": "",
    "phone": ""
 }},
 "profile_summary": "",
 "experiences": [
    {{
      "title": "",
      "company": "",
      "period": "",
      "tasks": []
    }}
 ],
 "education": [
    {{
      "degree": "",
      "specialization": "",
      "school": "",
      "year": ""
    }}
 ],
 "technical_skills": [],
 "soft_skills": [],
 "languages": [],
 "projects": [
    {{
      "name": "",
      "description": "",
      "technologies": []
    }}
 ],
 "certifications": [],
 "interests": []
}}

RÈGLES IMPORTANTES :
- EXPERIENCES = uniquement stages / emplois
- EDUCATION = uniquement diplômes / écoles
- Ne crée PAS de soft skills si elles ne sont pas écrites clairement dans le CV.
- Si une info est introuvable → laisse vide ou []
"""

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Tu es un extracteur JSON strict."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1500
        }

        headers = {"Authorization": f"Bearer {self.api_key}"}

        resp = requests.post(self.api_url, json=payload, headers=headers)
        data = resp.json()

        # 7️⃣ Résultat brut
        raw_text = data["choices"][0]["message"]["content"]

        # 🔥 8️⃣ Nettoyage robuste du JSON
        cleaned = (
            raw_text.replace("```json", "")
                    .replace("```", "")
                    .strip()
        )

        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1

        if start != -1 and end != -1:
            json_content = cleaned[start:end]
            try:
                cv_data = json.loads(json_content)
            except Exception as e:
                return {
                    "error": "json_parse_failed",
                    "details": str(e),
                    "partial_json": json_content,
                    "raw_output": raw_text
                }

            # ✅ 9️⃣ Fusionner les technologies des projets dans technical_skills
            #    (pour inclure FastAPI, RAG, LangChain, etc.)
            tech_skills = cv_data.get("technical_skills", []) or []
            project_techs = []

            for proj in cv_data.get("projects", []) or []:
                project_techs.extend(proj.get("technologies", []) or [])

            all_techs = sorted(set(tech_skills + project_techs))
            cv_data["technical_skills"] = all_techs

            return cv_data

        # Si rien n'a fonctionné → renvoyer la sortie brute
        return {"raw_output": raw_text}
