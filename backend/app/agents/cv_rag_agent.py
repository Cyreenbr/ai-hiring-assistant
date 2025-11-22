import os
import json
import requests
from dotenv import load_dotenv

from app.services.pdf_reader import extract_text_from_pdf
from app.services.chunking import split_into_chunks
from app.services.embeddings import emb_model, embed_chunks
from app.services.vector_store import VectorStore

load_dotenv()

class CVRAGAgent:

    def __init__(self):
        self.api_key = os.getenv("HF_TOKEN")
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        self.model = "meta-llama/Llama-3.1-8B-Instruct"

        # Stockage FAISS persistant (en mémoire)
        self.store = None

    async def analyze_cv(self, pdf_path: str):

        # 1. Extraction PDF
        text = extract_text_from_pdf(pdf_path)

        # 2. Chunking propre
        chunks = split_into_chunks(text, chunk_size=400, overlap=40)

        # 3. Embeddings
        vectors = embed_chunks(chunks)

        # 4. Initialiser FAISS une fois
        if self.store is None:
            self.store = VectorStore(dimension=vectors.shape[1])
            self.store.add(vectors)

        # 5. Retrieval : "résume ce CV"
        query_vec = emb_model.encode(["résume le CV de façon concise"])[0].reshape(1, -1)
        indices = self.store.search(query_vec, top_k=3)

        relevant_chunks = [chunks[i] for i in indices[0]]

        context = "\n\n".join(relevant_chunks)

        # 6. Prompt amélioré + few-shot JSON
        prompt = f"""
Tu es un expert RH spécialisé en extraction de CV.
Analyse UNIQUEMENT les informations contenues dans le texte suivant :

------------------------
{context}
------------------------

Retourne un JSON STRICT SANS TEXTE AVANT/APRÈS.

Exemple de format correct :
{{
    "name": "John Doe",
    "technical_skills": ["Python", "SQL"],
    "soft_skills": ["Communication", "Adaptabilité"],
    "experience_years": "3 ans",
    "education_level": "Licence Informatique",
    "projects": ["Application web de gestion", "Système de recommandation"]
}}

Maintenant, génère le JSON basé sur le CV fourni.
"""

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Tu es un extracteur JSON strict et précis."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 400
        }

        headers = {"Authorization": f"Bearer {self.api_key}"}

        resp = requests.post(self.api_url, json=payload, headers=headers)
        data = resp.json()

        raw_text = data["choices"][0]["message"]["content"]

        # 7. Nettoyage JSON
        try:
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            clean = raw_text[start:end]
            return json.loads(clean)
        except:
            return {"raw_output": raw_text}
