# app/routes/grade.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
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


# 🔹 Helper function for automatic grading
def calculate_grade(marks: int) -> str:
    if marks >= 95: return "O"  # Outstanding
    if marks >= 90: return "A+" # Excellent+
    if marks >= 80: return "A"  # Excellent
    if marks >= 70: return "B+" # Good+
    if marks >= 60: return "B"  # Good
    if marks >= 50: return "C"  # Average
    return "U"                  # Re-appear / Fail


# 🔹 POST - Create Grade
@router.post("/", response_model=GradeResponse)
def create_grade(grade: GradeCreate, db: Session = Depends(get_db)):
    # Calculate grade automatically if not provided or to ensure consistency
    evaluated_grade = calculate_grade(grade.marks)
    
    existing = db.query(Grade).filter(Grade.enrollment_id == grade.enrollment_id).first()
    if existing:
        existing.marks = grade.marks
        existing.grade = evaluated_grade
        db.commit()
        db.refresh(existing)
        return existing

    new_grade = Grade(
        institution_id=grade.institution_id,
        enrollment_id=grade.enrollment_id,
        marks=grade.marks,
        grade=evaluated_grade
    )

    db.add(new_grade)
    db.commit()
    db.refresh(new_grade)

    return new_grade


# 🔹 POST - Bulk Create/Update Grades
@router.post("/bulk")
def bulk_grades(data: List[GradeCreate], db: Session = Depends(get_db)):
    for item in data:
        evaluated_grade = calculate_grade(item.marks)
        existing = db.query(Grade).filter(Grade.enrollment_id == item.enrollment_id).first()
        
        if existing:
            existing.marks = item.marks
            existing.grade = evaluated_grade
        else:
            db.add(Grade(
                institution_id=item.institution_id,
                enrollment_id=item.enrollment_id,
                marks=item.marks,
                grade=evaluated_grade
            ))
    
    db.commit()
    return {"message": "Grades updated successfully"}


# 🔹 GET - Get All Grades
@router.get("/", response_model=List[GradeResponse])
<<<<<<< HEAD
def get_grades(enrollment_id: str = None, db: Session = Depends(get_db)):
=======
def get_grades(enrollment_id: Optional[str] = None, db: Session = Depends(get_db)):
>>>>>>> f718be1599240da8668d0dafb4e32e00c5fcdfb4
    query = db.query(Grade)
    if enrollment_id:
        query = query.filter(Grade.enrollment_id == enrollment_id)
    return query.all()
<<<<<<< HEAD


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
=======
>>>>>>> f718be1599240da8668d0dafb4e32e00c5fcdfb4


# 🔹 GET - Get Grade By ID
@router.get("/{grade_id}", response_model=GradeResponse)
def get_grade(grade_id: str, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade

