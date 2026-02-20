# app/routes/student.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# 🔹 Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create Student
@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):

    # Check if student already exists
    existing_student = db.query(Student).filter(
        Student.user_id == student.user_id
    ).first()

    if existing_student:
        raise HTTPException(status_code=400, detail="Student already exists")

    new_student = Student(**student.model_dump())

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# 🔹 GET - Get All Students
@router.get("/", response_model=List[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students


# 🔹 GET - Get Student By ID
@router.get("/{user_id}", response_model=StudentResponse)
def get_student(user_id: str, db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.user_id == user_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student