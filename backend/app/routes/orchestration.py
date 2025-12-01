from fastapi import APIRouter, UploadFile, Form, HTTPException
from app.agents.cv_rag_agent import CVRAGAgent
from app.agents.job_analyzer import JobAnalyzerAgent
from app.agents.matching_agent import MatchingAgent
import tempfile
import shutil

router = APIRouter(prefix="/api/orchestration", tags=["Orchestration"])

cv_agent = CVRAGAgent()
job_agent = JobAnalyzerAgent()
matching_agent = MatchingAgent()

@router.post("/run")
async def orchestrate(
    file: UploadFile,
    job_text: str = Form(...)
):
    try:
        # 1️⃣ Sauver temporairement le fichier CV
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # 2️⃣ Analyse CV (ATTENTION: await obligatoire)
        cv_analysis = await cv_agent.analyze_cv(tmp_path)
        if isinstance(cv_analysis, dict) and "raw_output" in cv_analysis:
            raise HTTPException(status_code=400, detail="Erreur extraction CV")

        # 3️⃣ Analyse Job
        job_analysis = await job_agent.analyze_job(job_text)

        # 4️⃣ Matching
        matching_result = await matching_agent.match(cv_analysis, job_analysis)

        # 5️⃣ Retour global
        return {
            "cv_analysis": cv_analysis,
            "job_analysis": job_analysis,
            "matching": matching_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
