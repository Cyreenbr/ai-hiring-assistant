import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

class JobAnalyzerAgent:
    def __init__(self):

        self.api_key = os.getenv("HF_TOKEN")
        if not self.api_key:
            raise ValueError(
                "⚠️ HF_TOKEN non trouvé. Ajoutez dans votre fichier .env :\nHF_TOKEN=ton_token"
            )

        print(f"✓ Token Hugging Face chargé : {self.api_key[:10]}...")

        # URL HuggingFace Router
        self.api_url = "https://router.huggingface.co/v1/chat/completions"

        # Modèle choisi : Llama 3.1 Instruct
        self.model = "meta-llama/Llama-3.1-8B-Instruct"

        # Prompt renforcé pour JSON strict
        self.prompt = """
Tu es un agent expert en analyse d'offres d'emploi.
Tu dois retourner un JSON STRICT et VALIDE. STRICT signifie :
- pas de texte avant
- pas de texte après
- pas de commentaires
- pas de prose
- uniquement un JSON pur.

Voici l’offre :
----------------
{job_description}
----------------

Retourne EXACTEMENT ce format :

{{
  "title": "",
  "technical_skills": [],
  "soft_skills": [],
  "experience_level": "",
  "education_level": "",
  "responsibilities": [],
  "keywords": []
}}

Ne rajoute aucun texte ni explication.
"""

    async def analyze_job(self, job_description: str):
        """Analyse une offre d'emploi avec Llama 3.1 via HuggingFace"""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "Tu es un extracteur JSON. Réponds uniquement en JSON strict. Jamais de texte hors JSON."
                },
                {
                    "role": "user",
                    "content": self.prompt.format(job_description=job_description)
                }
            ],
            "max_tokens": 400
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload)

            if response.status_code != 200:
                return {
                    "error": f"HTTP {response.status_code}",
                    "details": response.text
                }

            data = response.json()
            text = data["choices"][0]["message"]["content"].strip()

            # Nettoyage des blocks ```json
            if text.startswith("```"):
                text = text.replace("```json", "")
                text = text.replace("```", "")
                text = text.strip()

            # Extraction JSON en cas de texte parasite
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                if start != -1 and end != -1:
                    json_clean = text[start:end]
                    return json.loads(json_clean)
            except:
                pass

            # Tentative brute
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {"raw_output": text}

        except Exception as e:
            return {"error": str(e)}
