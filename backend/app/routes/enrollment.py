from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.enrollment import Enrollment
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse

router = APIRouter(prefix="/enrollment", tags=["Enrollment"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EnrollmentResponse)
def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    enrollment = Enrollment(**data.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.get("/", response_model=list[EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()