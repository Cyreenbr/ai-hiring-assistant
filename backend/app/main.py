from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORT DES ROUTES
from app.routes import jobs
from app.routes import cv   # 👈 AJOUT IMPORTANT

app = FastAPI(title="AI Hiring Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES BACKEND
app.include_router(jobs.router)
app.include_router(cv.router)   # 👈 ON ACTIVE L’ENDPOINT CV

@app.get("/")
async def root():
    return {"message": "AI Hiring Assistant API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
