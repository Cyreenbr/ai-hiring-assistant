# app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
from functools import lru_cache

# ----------------------------
# Settings (lire .env)
# ----------------------------
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()

# ----------------------------
# Database Engine
# ----------------------------
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Vérifie les connexions mortes
    pool_size=10,        # Nombre de connexions simultanées
    max_overflow=20      # Connexions supplémentaires si nécessaire
)

# Création de la session et du Base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------------------
# Dependency pour FastAPI
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
