from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Form
from fastapi.responses import FileResponse
from app.services.video_interviews import (
    save_upload,
    transcribe_audio,
    UPLOADS_DIR,
    generate_questions,
    analyze_transcript,
    generate_report,
)
from uuid import uuid4

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.post("/upload")
async def upload_interview(
    file: UploadFile = File(...),
    job_id: int = Form(None),
    candidate_id: int = Form(None)
):
    interview_id = str(uuid4())
    filename = f"{interview_id}_{file.filename}"
    try:
        saved_filename = await save_upload(file, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    download_url = f"/api/interviews/download/{saved_filename}"
    return {
        "id": interview_id,
        "filename": saved_filename,
        "download_url": download_url,
        "job_id": job_id,
        "candidate_id": candidate_id
    }


@router.get("/download/{filename}")
async def download_interview(filename: str):
    file_path = f"app/uploads/{filename}"
    return FileResponse(file_path, filename=filename)


@router.post("/transcribe/{filename}")
async def transcribe(filename: str):
    file_path = str(UPLOADS_DIR / filename)
    transcript = await transcribe_audio(file_path)
    return {"filename": filename, "transcript": transcript}


@router.post("/generate_questions")
async def gen_questions(payload: dict = Body(...)):
    name = payload.get("candidate_name", "")
    job = payload.get("job_description", "")
    job_id = payload.get("job_id")
    questions = await generate_questions(name, job)
    return {"questions": questions, "job_id": job_id}


@router.post("/analyze/{filename}")
async def analyze(filename: str):
    # read transcript first via transcribe_audio or expect transcript in body
    transcript = None
    # Try to find transcript file or call transcribe
    file_path = str(UPLOADS_DIR / filename)
    transcript = await transcribe_audio(file_path)
    analysis = await analyze_transcript(transcript)
    return {"filename": filename, "transcript": transcript, "analysis": analysis}


@router.post("/report/{filename}")
async def report(filename: str, payload: dict = Body(...)):
    questions = payload.get("questions", [])
    analyses = payload.get("analyses", [])
    report_name = await generate_report(filename, questions, analyses)
    download_url = f"/api/interviews/download/{report_name}"
    return {"report": report_name, "download_url": download_url}
