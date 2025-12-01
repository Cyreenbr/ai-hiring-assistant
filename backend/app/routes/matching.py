from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.agents.cv_rag_agent import CVRAGAgent
from app.agents.job_analyzer import JobAnalyzerAgent
from app.agents.matching_agent import MatchingAgent

router = APIRouter(prefix="/api/match", tags=["matching"])

cv_agent = CVRAGAgent()
job_agent = JobAnalyzerAgent()
matching_agent = MatchingAgent()


@router.post("/")
async def match_cv_with_job(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Analyse un CV PDF + une offre d'emploi -> retourne le matching complet.
    """

    # 1️⃣ Enregistrer le PDF temporairement
    try:
        pdf_path = f"temp_{cv_file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(await cv_file.read())
    except:
        raise HTTPException(status_code=500, detail="Erreur lors de la lecture du fichier PDF.")

    # 2️⃣ Analyse du CV (RAG)
    cv_json = await cv_agent.analyze_cv(pdf_path)

    # 3️⃣ Analyse de l’offre
    job_json = await job_agent.analyze_job(job_description)

    # 4️⃣ Matching CV ↔ Offre
    result = await matching_agent.match(cv_json, job_json)

    return {
        "cv_analysis": cv_json,
        "job_analysis": job_json,
        "matching": result
    }
