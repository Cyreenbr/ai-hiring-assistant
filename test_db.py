# test_insert.py

from app.core.database import SessionLocal
from app.models.models import JobOffer

db = SessionLocal()

try:
    # Ajouter une offre test
    job = JobOffer(title="Test Job", company="Test Company", description="Description test")
    db.add(job)
    db.commit()
    db.refresh(job)
    print(f"✅ Offre insérée avec ID : {job.id}")
except Exception as e:
    print(f"❌ Erreur insertion : {e}")
finally:
    db.close()
