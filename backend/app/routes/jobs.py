from fastapi import APIRouter, HTTPException, Body
from app.agents.job_analyzer import JobAnalyzerAgent

# Routeur configuré
router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Instance de l'agent
analyzer = JobAnalyzerAgent()

@router.post("/analyze")
async def analyze_job(description: str = Body(..., media_type="text/plain")):
    """
    Analyse une offre d'emploi envoyée en texte brut.
    Ex : 
        On cherche un stagiaire développeur Python...
    """
    try:
        analysis = await analyzer.analyze_job(description)
        return {"analysis": analysis}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
