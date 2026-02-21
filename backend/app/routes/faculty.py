# app/routes/faculty.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.faculty import Faculty
from app.schemas.faculty import FacultyCreate, FacultyResponse


router = APIRouter(
    prefix="/faculty",
    tags=["Faculty"]
)


# 🔹 Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create Faculty
@router.post("/", response_model=FacultyResponse)
def create_faculty(faculty: FacultyCreate, db: Session = Depends(get_db)):

    # Check if faculty already exists
    existing_faculty = db.query(Faculty).filter(
        Faculty.user_id == faculty.user_id
    ).first()

    if existing_faculty:
        raise HTTPException(status_code=400, detail="Faculty already exists")

    new_faculty = Faculty(**faculty.model_dump())

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return new_faculty


# 🔹 GET - Get All Faculty members
@router.get("/", response_model=List[FacultyResponse])
def get_faculties(db: Session = Depends(get_db)):
    faculties = db.query(Faculty).all()
    return faculties


# 🔹 GET - Get Faculty By ID
@router.get("/{user_id}", response_model=FacultyResponse)
def get_faculty(user_id: str, db: Session = Depends(get_db)):

    faculty = db.query(Faculty).filter(
        Faculty.user_id == user_id
    ).first()

    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    return faculty


# 🔹 DELETE - Delete Faculty By user_id
@router.delete("/{user_id}")
def delete_faculty(user_id: str, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.user_id == user_id).first()

    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    db.delete(faculty)
    db.commit()
    return {"message": "Faculty deleted successfully"}
