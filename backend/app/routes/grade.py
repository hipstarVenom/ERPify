# app/routes/grade.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.grade import Grade
from app.schemas.grade import GradeCreate, GradeResponse


router = APIRouter(
    prefix="/grades",
    tags=["Grades"]
)


# 🔹 Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create Grade
@router.post("/", response_model=GradeResponse)
def create_grade(grade: GradeCreate, db: Session = Depends(get_db)):
    new_grade = Grade(**grade.model_dump())

    db.add(new_grade)
    db.commit()
    db.refresh(new_grade)

    return new_grade


# 🔹 GET - Get All Grades
@router.get("/", response_model=List[GradeResponse])
def get_grades(enrollment_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Grade)
    if enrollment_id:
        query = query.filter(Grade.enrollment_id == enrollment_id)
    return query.all()


# 🔹 POST - Bulk Update/Create Grades
@router.post("/bulk")
def bulk_grades(data: List[GradeCreate], db: Session = Depends(get_db)):
    for item in data:
        # Check if grade already exists for this enrollment
        existing = db.query(Grade).filter(Grade.enrollment_id == item.enrollment_id).first()
        if existing:
            existing.marks = item.marks
            existing.grade = item.grade
        else:
            db.add(Grade(**item.model_dump()))
    db.commit()
    return {"message": "Grades updated successfully"}


# 🔹 GET - Get Grade By ID
@router.get("/{grade_id}", response_model=GradeResponse)
def get_grade(grade_id: str, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade
