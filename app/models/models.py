from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class JobOffer(Base):
    __tablename__ = "job_offers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    location = Column(String(255))
    salary_min = Column(Float)
    salary_max = Column(Float)
    contract_type = Column(String(50))
    experience_required = Column(String(50))
    skills_required = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="active")
    
    # Relationships
    candidates = relationship("Candidate", back_populates="job_offer")
    matchings = relationship("Matching", back_populates="job_offer")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    cv_path = Column(String(500))
    cv_text = Column(Text)
    cv_embeddings = Column(JSON)
    
    # Parsed CV Data
    education = Column(JSON)
    experience = Column(JSON)
    skills = Column(JSON)
    languages = Column(JSON)
    certifications = Column(JSON)
    
    # Metadata
    years_of_experience = Column(Integer)
    current_position = Column(String(255))
    desired_position = Column(String(255))
    location = Column(String(255))
    availability = Column(String(50))
    
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job_offer = relationship("JobOffer", back_populates="candidates")
    matchings = relationship("Matching", back_populates="candidate")

class Matching(Base):
    __tablename__ = "matchings"
    
    id = Column(Integer, primary_key=True, index=True)
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    
    # Scoring
    overall_score = Column(Float, nullable=False)
    skills_score = Column(Float)
    experience_score = Column(Float)
    education_score = Column(Float)
    location_score = Column(Float)
    
    # Analysis
    matching_analysis = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    recommendation = Column(Text)
    
    # Status
    status = Column(String(50), default="pending")
    reviewed_by_hr = Column(Boolean, default=False)
    hr_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job_offer = relationship("JobOffer", back_populates="matchings")
    candidate = relationship("Candidate", back_populates="matchings")

class HRReport(Base):
    __tablename__ = "hr_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"))
    report_type = Column(String(50))
    content = Column(JSON)
    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(String(100))