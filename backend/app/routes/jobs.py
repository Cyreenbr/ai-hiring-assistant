from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.job_analyzer import JobAnalyzerAgent

router = APIRouter(prefix="/api/jobs", tags=["jobs"])
analyzer = JobAnalyzerAgent()

class JobAnalysisRequest(BaseModel):
    description: str

@router.post("/analyze")
async def analyze_job(request: JobAnalysisRequest):
    try:
        analysis = await analyzer.analyze_job(request.description)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))