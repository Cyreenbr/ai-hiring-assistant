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

        # Index FAISS unique et persistant
        self.store = None

    async def analyze_cv(self, pdf_path: str):

        # 1️⃣ Extraction du texte du CV
        text = extract_text_from_pdf(pdf_path)

        # Si CV vide → renvoyer JSON vide propre
        if not text or len(text.strip()) < 20:
            return {
                "name": "",
                "contact": {"email": "", "phone": ""},
                "profile_summary": "",
                "experiences": [],
                "education": [],
                "technical_skills": [],
                "soft_skills": [],
                "languages": [],
                "projects": [],
                "certifications": [],
                "interests": []
            }

        # 2️⃣ Découpage en chunks
        chunks = split_into_chunks(text, chunk_size=800, overlap=80)

        if len(chunks) == 0:
            chunks = [text]  # fallback minimal

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

        # 6️⃣ Recherche robuste (ÉVITE l’erreur IndexError)
        k = min(5, len(chunks))
        indices = self.store.search(query_vec, top_k=k)

        # Filtrer indices invalides
        valid_indices = []
        for i in indices[0]:
            if isinstance(i, int) and 0 <= i < len(chunks):
                valid_indices.append(i)

        # Fallback si aucun chunk valide
        if not valid_indices:
            relevant_chunks = [chunks[0]]
        else:
            relevant_chunks = [chunks[i] for i in valid_indices]

        context = "\n\n".join(relevant_chunks)

        # 7️⃣ Prompt STRICT (pas de soft skills inventés)
        prompt = f"""
Tu es un extracteur de CV. Réponds en JSON STRICT uniquement.

Ne déduis PAS de soft skills : n’ajoute dans "soft_skills" que celles clairement écrites dans le CV.

Analyse uniquement le texte suivant :

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

        raw_text = data["choices"][0]["message"]["content"]

        # 8️⃣ Nettoyage JSON
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

            # 9️⃣ Fusionner technologies des projets dans technical_skills
            tech_skills = cv_data.get("technical_skills", []) or []
            project_techs = []

            for proj in cv_data.get("projects", []) or []:
                project_techs.extend(proj.get("technologies", []) or [])

            cv_data["technical_skills"] = sorted(set(tech_skills + project_techs))

            return cv_data

        return {"raw_output": raw_text}
