from fastapi import APIRouter, UploadFile, File, Form
from app.agents.cv_rag_agent import CVRAGAgent
from app.agents.job_analyzer import JobAnalyzerAgent
from app.agents.matching_agent import MatchingAgent
import tempfile
import os

router = APIRouter(prefix="/api/match", tags=["Matching"])

cv_agent = CVRAGAgent()
job_agent = JobAnalyzerAgent()
matching_agent = MatchingAgent()


@router.post("/multi")
async def match_multiple_candidates(job_description: str = Form(...),
                                    cvs: list[UploadFile] = File(...)):
    """
    🚀 Prend UNE offre + plusieurs CV
    → Analyse chaque CV
    → Fait matching
    → Trie par score décroissant
    """
    # 1) Analyse de l’offre
    job_analysis = await job_agent.analyze_job(job_description)

    results = []

    # 2) Parcours des CV
    for cv in cvs:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await cv.read())
            temp_path = tmp.name

        # Analyse du CV
        cv_data = await cv_agent.analyze_cv(temp_path)

        # Matching
        match_result = await matching_agent.match(cv_data, job_analysis)

        results.append({
            "file_name": cv.filename,
            "candidate_name": cv_data.get("name", "Inconnu"),
            "scores": match_result.get("scores", {}),
            "global_score": match_result["scores"]["global"],
            "details": match_result
        })

        os.remove(temp_path)

    # 3) TRI PAR SCORE DÉCROISSANT
    results_sorted = sorted(results, key=lambda x: x["global_score"], reverse=True)

    return {
        "job_title": job_analysis.get("title", "Offre analysée"),
        "candidate_count": len(results_sorted),
        "ranked_candidates": results_sorted
    }
