# app/routes/department.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentResponse


router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create Department
@router.post("/", response_model=DepartmentResponse)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db)):

    new_department = Department(**department.model_dump())

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department


# 🔹 GET - Get All Departments
@router.get("/", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


# 🔹 GET - Get Department By ID
@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(department_id: str, db: Session = Depends(get_db)):

    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    return department


# 🔹 DELETE - Delete Department By ID
@router.delete("/{department_id}")
def delete_department(department_id: str, db: Session = Depends(get_db)):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}