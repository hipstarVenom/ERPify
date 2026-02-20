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
def get_grades(db: Session = Depends(get_db)):
    return db.query(Grade).all()


# 🔹 GET - Get Grade By ID
@router.get("/{grade_id}", response_model=GradeResponse)
def get_grade(grade_id: str, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade
