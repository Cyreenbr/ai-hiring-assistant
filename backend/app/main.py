from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Base et modèles
from app.database import engine, Base
from app.models import *  # attention, ne fais pas de code lourd ici

# Routes
from app.routes.jobs import router as jobs_router
from app.routes.cv import router as cv_router
from app.routes.matching import router as matching_router
from app.routes.orchestration import router as orchestrator_router
from app.routes.report import router as report_router
from app.routes.interviews import router as interviews_router
from app.routes import auth

load_dotenv()

app = FastAPI(
    title="AI Hiring Assistant",
    description="Plateforme intelligente d’analyse d’offres, parsing de CV via RAG et matching candidat–poste.",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(jobs_router, prefix="/api/jobs")
app.include_router(cv_router, prefix="/api/cv")
app.include_router(matching_router)
app.include_router(orchestrator_router)
app.include_router(report_router)
app.include_router(interviews_router)
app.include_router(auth.router, prefix="/api/auth")


# =========================
# Startup events
# =========================
@app.on_event("startup")
def startup_event():
    print("🚀 Initialisation de la base de données...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées.")


# Endpoints root et health
@app.get("/")
async def root():
    return {
        "message": "AI Hiring Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}


# =========================
# Pour lancement direct
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
