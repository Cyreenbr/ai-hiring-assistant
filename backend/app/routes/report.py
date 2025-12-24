import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.agents.orchestrator_agent import OrchestratorAgent
from app.agents.report_agent import ReportAgent

router = APIRouter(prefix="/api/report", tags=["report"])

orchestrator = OrchestratorAgent()
report_agent = ReportAgent()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/generate")
async def generate_report(
    cv_file: UploadFile = File(..., description="CV du candidat (PDF)"),
    job_description: str = Form(..., description="Texte de l'offre d'emploi"),
):
    # 1️⃣ Vérification du type de fichier
    if cv_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF.")

    # 2️⃣ Sauvegarde temporaire
    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")

        content = await cv_file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement du fichier : {e}")

    try:
        # 3️⃣ Analyse complète via orchestrator (CV + Job + Matching)
        orchestration_result = await orchestrator.analyze_all(file_path, job_description)

        cv_analysis = orchestration_result.get("cv_analysis", {})
        job_analysis = orchestration_result.get("job_analysis", {})
        matching = orchestration_result.get("matching", {})

        # 4️⃣ Génération du rapport RH
        report = await report_agent.generate_report(cv_analysis, job_analysis, matching)

        # 5️⃣ Réponse combinée
        return {
            "cv_analysis": cv_analysis,
            "job_analysis": job_analysis,
            "matching": matching,
            "report": report,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 6️⃣ Nettoyage du fichier PDF temporaire
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
