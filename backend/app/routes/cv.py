from fastapi import APIRouter, UploadFile
from app.agents.cv_rag_agent import CVRAGAgent
import tempfile

router = APIRouter(prefix="/api/cv", tags=["cv"])
agent = CVRAGAgent()

@router.post("/analyze")
async def analyze_cv(file: UploadFile):

    # Sauvegarder le PDF temporairement
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        pdf_path = tmp.name

    result = await agent.analyze_cv(pdf_path)
    return {"analysis": result}
