from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# ========== AUTH SCHEMAS ==========
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: str = Field(..., pattern="^(hr|candidate)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# ========== USER SCHEMAS ==========
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ========== HR PROFILE SCHEMAS ==========
class HRProfileCreate(BaseModel):
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None

class HRProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None

class HRProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    company_name: Optional[str]
    company_website: Optional[str]
    position: Optional[str]
    department: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ========== CANDIDATE PROFILE SCHEMAS ==========
class CandidateProfileCreate(BaseModel):
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = []
    experience_years: Optional[int] = None
    current_position: Optional[str] = None
    desired_position: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None

class CandidateProfileUpdate(CandidateProfileCreate):
    pass

class CandidateProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    resume_url: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    skills: Optional[List[str]]
    experience_years: Optional[int]
    current_position: Optional[str]
    desired_position: Optional[str]
    location: Optional[str]
    availability: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ========== JOB POSTING SCHEMAS ==========
class JobPostingCreate(BaseModel):
    title: str
    description: str
    requirements: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_required: Optional[int] = None
    salary_range: Optional[str] = None
    status: Optional[str] = "active"

class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_required: Optional[int] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None

class JobPostingResponse(BaseModel):
    id: UUID
    hr_id: UUID
    title: str
    description: str
    requirements: str
    location: Optional[str]
    job_type: Optional[str]
    experience_required: Optional[int]
    salary_range: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ========== APPLICATION SCHEMAS ==========
class ApplicationCreate(BaseModel):
    job_id: UUID
    resume_file: Optional[str] = None
    cover_letter: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    candidate_id: UUID
    resume_file: Optional[str]
    cover_letter: Optional[str]
    status: str
    ai_score: Optional[float]
    technical_score: Optional[float]
    soft_skills_score: Optional[float]
    experience_score: Optional[float]
    notes: Optional[str]
    applied_at: datetime
    
    class Config:
        from_attributes = True

# ========== INTERVIEW SCHEMAS ==========
class InterviewCreate(BaseModel):
    application_id: UUID
    scheduled_at: datetime
    duration: int = 60
    location: Optional[str] = None
    type: Optional[str] = None

class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    interviewer_notes: Optional[str] = None
    candidate_feedback: Optional[str] = None

class InterviewResponse(BaseModel):
    id: UUID
    application_id: UUID
    scheduled_at: datetime
    duration: int
    location: Optional[str]
    type: Optional[str]
    status: str
    interviewer_notes: Optional[str]
    candidate_feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True