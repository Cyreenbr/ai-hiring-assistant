from pydantic import BaseModel
from typing import Optional


class Interview(BaseModel):
    id: str
    filename: str
    transcript: Optional[str] = None
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None


class InterviewCreate(BaseModel):
    filename: str
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None