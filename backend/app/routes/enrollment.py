from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
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

# 🔹 POST - Create Enrollment (with duplicate guard)
@router.post("/", response_model=EnrollmentResponse)
def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Enrollment).filter(
        Enrollment.student_id  == data.student_id,
        Enrollment.course_id   == data.course_id,
        Enrollment.semester_id == data.semester_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course for this semester")
    enrollment = Enrollment(**data.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

# 🔹 GET - Get Enrollments (optional filter by student_id)
@router.get("/", response_model=list[EnrollmentResponse])
def get_enrollments(student_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Enrollment)
    if student_id:
        query = query.filter(Enrollment.student_id == student_id)
    return query.all()

# 🔹 PATCH - Update Enrollment Status
class StatusUpdate(BaseModel):
    status: str

@router.patch("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment_status(enrollment_id: str, body: StatusUpdate, db: Session = Depends(get_db)):
    valid_statuses = {"enrolled", "completed", "dropped", "on_hold"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = body.status
    db.commit()
    db.refresh(enrollment)
    return enrollment

# 🔹 DELETE - Delete Enrollment by ID
@router.delete("/{enrollment_id}")
def delete_enrollment(enrollment_id: str, db: Session = Depends(get_db)):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()
    return {"message": "Enrollment deleted successfully"}