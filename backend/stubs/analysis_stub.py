from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Payload(BaseModel):
    transcript: str

@app.post("/analyze")
async def analyze(p: Payload):
    t = p.transcript.lower()
    scores = {"clarity": 80 if len(t) > 100 else 50, "technical": 60, "communication": 70, "confidence": 60}
    follow = ["Pouvez-vous donner un exemple concret ?"] if scores["technical"] < 65 else []
    rec = "Présélection" if scores["technical"] + scores["communication"] > 120 else "Revoir manuellement"
    return {"scores": scores, "follow_up_questions": follow, "recommendation": rec}
