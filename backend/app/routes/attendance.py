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
    # Upsert logic: check if record exists for same day/enrollment
    existing = db.query(Attendance).filter(
        Attendance.enrollment_id == data.enrollment_id,
        Attendance.attendance_date == data.attendance_date
    ).first()
    
    if existing:
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        return existing
        
    attendance = Attendance(**data.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.post("/bulk")
def bulk_attendance(data: list[AttendanceCreate], db: Session = Depends(get_db)):
    for item in data:
        existing = db.query(Attendance).filter(
            Attendance.enrollment_id == item.enrollment_id,
            Attendance.attendance_date == item.attendance_date
        ).first()
        if existing:
            existing.status = item.status
        else:
            db.add(Attendance(**item.model_dump()))
    db.commit()
    return {"message": "Attendance updated successfully"}

@router.get("/", response_model=list[AttendanceResponse])
def get_attendance(enrollment_id: str = None, attendance_date: str = None, db: Session = Depends(get_db)):
    query = db.query(Attendance)
    if enrollment_id:
        query = query.filter(Attendance.enrollment_id == enrollment_id)
    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    return query.all()