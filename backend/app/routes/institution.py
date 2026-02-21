# app/routes/institution.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate, InstitutionResponse


router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create Institution
@router.post("/", response_model=InstitutionResponse)
def create_institution(institution: InstitutionCreate, db: Session = Depends(get_db)):

    new_institution = Institution(**institution.model_dump())

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return new_institution


# 🔹 GET - Get All Institutions
@router.get("/", response_model=List[InstitutionResponse])
def get_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()


# 🔹 GET - Get Institution By ID
@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(institution_id: str, db: Session = Depends(get_db)):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    return institution


# 🔹 DELETE - Delete Institution By ID
@router.delete("/{institution_id}")
def delete_institution(institution_id: str, db: Session = Depends(get_db)):
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    db.delete(institution)
    db.commit()
    return {"message": "Institution deleted successfully"}