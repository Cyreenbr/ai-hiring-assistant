from fastapi import FastAPI, File, UploadFile
app = FastAPI()

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # read file but ignore content: return demo transcription
    await file.read()
    return {"text": "Transcription de démonstration : bonjour, ceci est un test."}
