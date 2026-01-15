from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.jobs import router as jobs_router
from app.routes.cv import router as cv_router
from app.routes.matching import router as matching_router
from app.routes.orchestration import router as orchestrator_router
from app.routes.report import router as report_router
from app.routes.interviews import router as interviews_router

app = FastAPI(
    title="AI Hiring Assistant",
    description="Plateforme intelligente d’analyse d’offres, parsing de CV via RAG et matching candidat–poste.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router, prefix="/api/jobs")
app.include_router(cv_router, prefix="/api/cv")
app.include_router(matching_router)
app.include_router(orchestrator_router)
app.include_router(report_router)
app.include_router(interviews_router)

@app.get("/")
async def root():
    return {"message": "AI Hiring Assistant API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
