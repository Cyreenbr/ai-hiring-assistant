from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QPayload(BaseModel):
    candidate_name: str = ""
    job_description: str = ""

@app.post("/questions")
async def questions(p: QPayload):
    base = [
        f"Parlez de votre expérience liée à { (p.job_description.split()[0] if p.job_description else 'ce poste') }.",
        "Décrivez un challenge technique récent et comment vous l'avez résolu.",
        "Donnez un exemple où vous avez travaillé en équipe.",
    ]
    return {"questions": base}
