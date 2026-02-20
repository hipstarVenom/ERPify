from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AttendanceResponse)
def create_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    attendance = Attendance(**data.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get("/", response_model=list[AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    return db.query(Attendance).all()