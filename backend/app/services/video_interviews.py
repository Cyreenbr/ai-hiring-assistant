import os
from pathlib import Path
from fastapi import UploadFile
import aiofiles
import httpx
import subprocess
import shlex

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


async def save_upload(file: UploadFile, filename: str) -> str:
    dest = UPLOADS_DIR / filename
    contents = await file.read()
    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)
    # return only filename (no absolute path)
    return filename


async def transcribe_audio(path: str) -> str:
    """
    Call a configurable remote STT service. Set `STT_URL` in environment to the
    remote endpoint that accepts a multipart `file` upload and returns JSON
    containing transcription under `text` or `transcript`.
    If `STT_URL` is not set, returns a placeholder message.
    """
    stt_url = os.getenv("STT_URL")
    if not stt_url:
        return "Transcription not implemented. Configure STT_URL."

    # read file bytes
    try:
        # If file is a container/video (webm/mp4/mkv), convert to wav for STT compatibility
        path_obj = Path(path)
        suffix = path_obj.suffix.lower()
        audio_path = path
        if suffix in [".webm", ".mp4", ".mkv"]:
            wav_path = str(path_obj.with_suffix(".wav"))
            try:
                # call ffmpeg to extract audio as wav
                cmd = f"ffmpeg -y -i {shlex.quote(path)} -ar 16000 -ac 1 -vn {shlex.quote(wav_path)}"
                subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                audio_path = wav_path
            except Exception:
                # fallback to sending original file if conversion fails
                audio_path = path

        async with aiofiles.open(audio_path, "rb") as f:
            data = await f.read()
    except Exception as e:
        return f"Error reading file: {e}"

    filename = Path(path).name
    try:
        headers = {}
        stt_key = os.getenv("STT_API_KEY")
        stt_header = os.getenv("STT_API_HEADER_NAME", "Authorization")
        # attach key according to header name; if Authorization use Bearer schema
        if stt_key:
            if stt_header.lower() == "authorization":
                headers["Authorization"] = f"Bearer {stt_key}"
            else:
                headers[stt_header] = stt_key

        send_json = os.getenv("STT_SEND_JSON", "false").lower() in ("1", "true", "yes")
        file_field = os.getenv("STT_FILE_FIELD", "file")

        async with httpx.AsyncClient(timeout=120.0) as client:
            if send_json:
                # send base64-encoded content in JSON body
                import base64

                b64 = base64.b64encode(data).decode("ascii")
                payload = {"filename": filename, "content": b64}
                resp = await client.post(stt_url, json=payload, headers=headers)
            else:
                # multipart/form-data with configurable field name
                content_type = "audio/wav" if audio_path.lower().endswith(".wav") else "video/webm"
                files = {file_field: (filename, data, content_type)}
                resp = await client.post(stt_url, files=files, headers=headers)

            resp.raise_for_status()
            # try to parse JSON safely
            try:
                j = resp.json()
            except Exception:
                return resp.text

            return j.get("text") or j.get("transcript") or j.get("result") or j.get("data") or str(j)
    except Exception as e:
        return f"STT error: {e}"


async def generate_questions(candidate_name: str = "", job_description: str = "") -> list:
    """Generate 3-5 personalized interview questions based on job description.
    If `QUESTIONS_URL` is configured, call it with JSON {candidate_name, job_description}.
    Otherwise return simple template questions tailored to the job.
    """
    questions_url = os.getenv("QUESTIONS_URL")
    if questions_url:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(questions_url, json={"candidate_name": candidate_name, "job_description": job_description})
                resp.raise_for_status()
                j = resp.json()
                return j.get("questions") or j.get("result") or j.get("data") or []
        except Exception:
            pass

    # Enhanced fallback generation based on job description analysis
    if job_description:
        # Extract key elements from job description
        job_lower = job_description.lower()

        # Common job categories and their specific questions
        if any(word in job_lower for word in ["python", "java", "javascript", "développeur", "developpeur", "dev", "coder", "programmeur"]):
            base = [
                f"Parlez-moi de votre expérience en développement et des technologies mentionnées dans cette offre : {job_description[:100]}...",
                "Décrivez un projet personnel ou professionnel où vous avez utilisé les technologies demandées.",
                "Comment abordez-vous la résolution de bugs complexes dans votre code ?",
                "Parlez-moi de votre expérience avec les tests unitaires et l'intégration continue.",
                "Comment vous tenez-vous à jour des nouvelles technologies et pratiques de développement ?",
            ]
        elif any(word in job_lower for word in ["data", "analyste", "analyst", "machine learning", "ml", "ai", "intelligence artificielle"]):
            base = [
                f"Parlez-moi de votre expérience en analyse de données et des outils mentionnés dans cette offre : {job_description[:100]}...",
                "Décrivez un projet où vous avez analysé un dataset important et quelles insights vous en avez tiré.",
                "Comment choisissez-vous entre différents algorithmes ou méthodes d'analyse ?",
                "Parlez-moi de votre expérience avec la visualisation de données.",
                "Comment gérez-vous la qualité et la fiabilité des données dans vos analyses ?",
            ]
        elif any(word in job_lower for word in ["manager", "gestion", "chef", "lead", "directeur"]):
            base = [
                f"Parlez-moi de votre expérience en management et des responsabilités mentionnées dans cette offre : {job_description[:100]}...",
                "Décrivez une situation où vous avez dû gérer une équipe face à un défi important.",
                "Comment motivez-vous vos équipes et gérez-vous les conflits ?",
                "Parlez-moi de votre approche pour définir des objectifs et mesurer les performances.",
                "Comment abordez-vous le développement professionnel de votre équipe ?",
            ]
        else:
            # Generic but personalized questions
            job_keywords = []
            if "expérience" in job_lower or "experience" in job_lower:
                job_keywords.append("votre expérience professionnelle")
            if any(word in job_lower for word in ["équipe", "team", "collaborat"]):
                job_keywords.append("le travail en équipe")
            if any(word in job_lower for word in ["client", "customer"]):
                job_keywords.append("la relation client")

            context_phrase = f"liée à {', '.join(job_keywords)}" if job_keywords else "principale"

            base = [
                f"Parlez-moi de votre expérience {context_phrase} pour ce poste : {job_description.split('.')[0] if job_description else 'ce rôle'}.",
                "Décrivez un challenge professionnel récent et comment vous l'avez résolu.",
                "Donnez un exemple concret où vous avez travaillé en équipe pour atteindre un objectif.",
                "Comment gérez-vous les priorités et respectez-vous les délais ?",
                f"Pourquoi êtes-vous intéressé{'e' if candidate_name else ''} par ce poste et cette entreprise ?",
            ]
    else:
        # No job description provided - generic questions
        base = [
            "Parlez-moi de votre expérience professionnelle principale.",
            "Décrivez un challenge technique ou professionnel récent et comment vous l'avez résolu.",
            "Donnez un exemple où vous avez travaillé en équipe pour atteindre un objectif.",
            "Comment gérez-vous les priorités et les deadlines ?",
            "Pourquoi voulez-vous rejoindre cette entreprise et ce rôle ?",
        ]

    # Personalize with candidate name if provided
    if candidate_name:
        base[0] = f"Bonjour {candidate_name}. {base[0]}"

    # return 4-5 questions
    return base[:5]


async def analyze_transcript(transcript: str) -> dict:
    """Analyze transcript using remote ANALYSIS_URL if configured.
    If not configured, return placeholder scores, suggested follow-ups and recommendation.
    """
    analysis_url = os.getenv("ANALYSIS_URL")
    if analysis_url:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(analysis_url, json={"transcript": transcript})
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            return {"error": str(e)}

    # fallback heuristic scoring (toy example)
    text = (transcript or "").lower()
    scores = {
        "clarity": 80 if len(text) > 100 else 50,
        "technical": 70 if any(w in text for w in ["python","java","sql","api"]) else 45,
        "communication": 85 if any(w in text for w in ["team","lead","collabor"]) else 60,
        "confidence": 75 if "".join(text.split()).count(" ")>20 else 50,
    }
    follow_ups = []
    if scores["technical"] < 60:
        follow_ups.append("Pouvez-vous détailler davantage l'aspect technique que vous avez mentionné ?")
    if scores["communication"] < 70:
        follow_ups.append("Pouvez-vous donner un exemple concret de collaboration en équipe ?")

    recommendation = "Suit le processus standard" if (scores["technical"]+scores["communication"])>130 else "Présélection manuelle recommandée"

    return {
        "scores": scores,
        "follow_up_questions": follow_ups,
        "recommendation": recommendation,
        "notes": "Auto-analysis fallback. Configure ANALYSIS_URL for richer results.",
    }


async def generate_report(filename: str, questions: list, analyses: list) -> str:
    """Create a simple JSON report saved under uploads and return the saved filename."""
    import json
    report = {
        "interview_file": filename,
        "questions": questions,
        "analyses": analyses,
    }
    report_name = f"report_{Path(filename).stem}_{int(Path(filename).stat().st_mtime) if Path(filename).exists() else int(__import__('time').time())}.json"
    dest = UPLOADS_DIR / report_name
    async with aiofiles.open(dest, "w", encoding="utf-8") as f:
        await f.write(json.dumps(report, ensure_ascii=False, indent=2))
    return report_name
