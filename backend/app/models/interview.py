from pydantic import BaseModel
from typing import Optional


class Interview(BaseModel):
    id: str
    filename: str
    transcript: Optional[str] = None


class InterviewCreate(BaseModel):
    filename: str
