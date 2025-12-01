import os
import json
import numpy as np
import requests
from dotenv import load_dotenv

from app.services.embeddings import embed_query

load_dotenv()


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calcule la similarité cosinus entre deux vecteurs 1D."""
    if vec1 is None or vec2 is None:
        return 0.0
    if vec1.ndim > 1:
        vec1 = vec1.ravel()
    if vec2.ndim > 1:
        vec2 = vec2.ravel()

    denom = (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    if denom == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / denom)


class MatchingAgent:

    def __init__(self):
        self.api_key = os.getenv("HF_TOKEN")
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        self.model = "meta-llama/Llama-3.1-8B-Instruct"

    # ---------- 1) MATCHING SEMANTIQUE DES COMPÉTENCES ----------

    def semantic_skill_matching(self, cv_skills, job_skills, threshold: float = 0.7):
        """
        Compare les compétences du CV et de l'offre de manière sémantique
        via embeddings + similarité cosinus.

        Retourne :
          - score (0-100)
          - matched (liste de compétences de l'offre couvertes)
          - missing (liste de compétences de l'offre non couvertes)
          - details (mapping job_skill -> {best_cv_skill, similarity})
        """
        if not job_skills:
            return 100, [], [], {}

        cv_skills_norm = [s.strip() for s in (cv_skills or []) if s and s.strip()]
        job_skills_norm = [s.strip() for s in (job_skills or []) if s and s.strip()]

        if not cv_skills_norm:
            # aucune compétence côté CV → score 0
            return 0, [], job_skills_norm, {}

        # Embeddings des compétences CV
        cv_vectors = []
        for skill in cv_skills_norm:
            vec = embed_query(skill)
            cv_vectors.append(vec)
        cv_vectors = np.vstack(cv_vectors)  # (n_cv, d)

        matched = []
        missing = []
        details = {}
        scores = []

        for job_skill in job_skills_norm:
            job_vec = embed_query(job_skill)
            # Similarités avec toutes les compétences CV
            sims = []
            for cv_vec in cv_vectors:
                sims.append(cosine_similarity(job_vec, cv_vec))
            sims = np.array(sims)

            best_idx = int(np.argmax(sims))
            best_sim = float(sims[best_idx])
            best_cv_skill = cv_skills_norm[best_idx]

            details[job_skill] = {
                "best_cv_skill": best_cv_skill,
                "similarity": round(best_sim, 3),
            }

            if best_sim >= threshold:
                matched.append(job_skill)
            else:
                missing.append(job_skill)

            scores.append(max(0.0, min(1.0, best_sim)))

        # Score global = moyenne des similarités, en %
        if scores:
            avg_score = round(float(np.mean(scores) * 100))
        else:
            avg_score = 0

        return avg_score, matched, missing, details

    # ---------- 2) MATCHING EXPÉRIENCE (SEMANTIQUE) ----------

    def compute_experience_score(self, cv_experiences, job_keywords, job_responsibilities):
        """
        Compare le texte des expériences du CV aux mots-clés et responsabilités de l'offre.
        Utilise embeddings + similarité cosinus.
        """
        if not cv_experiences:
            return 0

        # Texte côté CV
        cv_text_parts = []
        for exp in cv_experiences or []:
            title = exp.get("title", "") or ""
            company = exp.get("company", "") or ""
            period = exp.get("period", "") or ""
            tasks = " ".join(exp.get("tasks", []) or [])
            full = " ".join([title, company, period, tasks]).strip()
            if full:
                cv_text_parts.append(full)

        if not cv_text_parts:
            return 0

        cv_text = "\n".join(cv_text_parts)

        # Texte côté offre (keywords + responsibilities)
        offer_parts = []
        offer_parts.extend(job_keywords or [])
        offer_parts.extend(job_responsibilities or [])
        offer_text = "\n".join(offer_parts)

        if not offer_text.strip():
            return 100  # rien à comparer → on ne pénalise pas

        cv_vec = embed_query(cv_text)
        job_vec = embed_query(offer_text)

        sim = cosine_similarity(cv_vec, job_vec)
        sim_clamped = max(0.0, min(1.0, sim))

        return round(sim_clamped * 100)

    # ---------- 3) MATCHING SOFT SKILLS (simple, sans déduction) ----------

    def soft_skill_matching(self, cv_soft, job_soft):
        """
        Matching exact (pas de déduction) :
        - on compare les soft skills écrites dans le CV
          avec celles demandées dans l'offre.
        """
        if not job_soft:
            return 100, list(set(cv_soft or [])), []

        cv_set = set([s.lower() for s in (cv_soft or [])])
        job_set = set([s.lower() for s in (job_soft or [])])

        matched = list(job_set.intersection(cv_set))
        missing = list(job_set.difference(cv_set))

        score = round(100 * len(matched) / len(job_set)) if job_set else 100

        # On renvoie les soft skills avec casse d'origine pour la lisibilité
        matched_readable = [s for s in (cv_soft or []) if s.lower() in matched]

        return score, matched_readable, missing

    # ---------- 4) FONCTION PRINCIPALE ----------

    async def match(self, cv_json: dict, job_json: dict):

        # ----- 4.1 TECHNICAL SKILLS (SEMANTIQUE) -----
        tech_score, matched_tech, missing_tech, tech_details = self.semantic_skill_matching(
            cv_json.get("technical_skills", []),
            job_json.get("technical_skills", []),
            threshold=0.7,
        )

        # ----- 4.2 SOFT SKILLS -----
        soft_score, matched_soft, missing_soft = self.soft_skill_matching(
            cv_json.get("soft_skills", []),
            job_json.get("soft_skills", []),
        )

        # ----- 4.3 EXPÉRIENCE -----
        experience_score = self.compute_experience_score(
            cv_json.get("experiences", []),
            job_json.get("keywords", []),
            job_json.get("responsibilities", []),
        )

        # ----- 4.4 SCORE GLOBAL -----
        global_score = round(
            0.5 * tech_score +
            0.3 * experience_score +
            0.2 * soft_score
        )

        # ---------- 5) LLM : RÉSUMÉ RH SANS HALLUCINATIONS ----------

        allowed_technical_skills = list(set(
            (cv_json.get("technical_skills") or []) +
            (job_json.get("technical_skills") or [])
        ))

        allowed_soft_skills = list(set(
            (cv_json.get("soft_skills") or []) +
            (job_json.get("soft_skills") or [])
        ))

        prompt = f"""
Tu es un expert RH.

Tu reçois :
1) Le CV (JSON)
2) L'offre d'emploi (JSON)
3) Les scores de matching
4) Les correspondances de compétences

TU DOIS :
- Générer un résumé RH en JSON STRICT.
- Ne pas ajouter de texte hors JSON.
- Ne PAS inventer de compétences techniques qui ne figurent ni dans le CV ni dans l'offre.
- Ne PAS mentionner une compétence qui n'est pas dans cette liste :

Compétences techniques autorisées :
{allowed_technical_skills}

Soft skills autorisées :
{allowed_soft_skills}

CV_JSON :
{json.dumps(cv_json, ensure_ascii=False, indent=2)}

JOB_JSON :
{json.dumps(job_json, ensure_ascii=False, indent=2)}

SCORES :
- Score technique : {tech_score}
- Score soft skills : {soft_score}
- Score expérience : {experience_score}
- Score global : {global_score}

TECH_MATCH_DETAILS :
{json.dumps(tech_details, ensure_ascii=False, indent=2)}

Retourne STRICTEMENT ce JSON :

{{
  "summary": "",
  "recommendation": "",
  "strong_points": [],
  "weak_points": []
}}
"""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Tu es un expert RH. Tu réponds toujours avec un JSON valide, sans texte autour."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 600,
        }

        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            resp = requests.post(self.api_url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            llm_text = data["choices"][0]["message"]["content"]

            cleaned = (
                llm_text.replace("```json", "")
                .replace("```", "")
                .strip()
            )
            start = cleaned.find("{")
            end = cleaned.rfind("}") + 1

            llm_json = {}
            if start != -1 and end != -1:
                try:
                    llm_json = json.loads(cleaned[start:end])
                except Exception:
                    llm_json = {"raw_output": cleaned}
        except Exception as e:
            llm_json = {"error": str(e)}

        # ---------- 6) RÉSULTAT FINAL ----------
        return {
            "scores": {
                "global": global_score,
                "technical": tech_score,
                "soft_skills": soft_score,
                "experience": experience_score,
            },
            "technical": {
                "matched": matched_tech,
                "missing": missing_tech,
                "details": tech_details,
            },
            "soft_skills": {
                "matched": matched_soft,
                "missing": missing_soft,
            },
            "llm_analysis": llm_json,
        }
