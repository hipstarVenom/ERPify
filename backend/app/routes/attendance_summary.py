from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.attendance_summary import AttendanceSummary
from app.schemas.attendance_summary import (
    AttendanceSummaryCreate,
    AttendanceSummaryResponse
)

router = APIRouter(prefix="/attendance-summary", tags=["Attendance Summary"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AttendanceSummaryResponse)
def create_summary(data: AttendanceSummaryCreate, db: Session = Depends(get_db)):
    summary = AttendanceSummary(**data.model_dump())
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary

@router.get("/", response_model=list[AttendanceSummaryResponse])
def get_summaries(db: Session = Depends(get_db)):
    return db.query(AttendanceSummary).all()