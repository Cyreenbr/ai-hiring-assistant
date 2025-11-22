from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import jobs

app = FastAPI(title="AI Hiring Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(jobs.router)

@app.get("/")
async def root():
    return {"message": "AI Hiring Assistant API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}