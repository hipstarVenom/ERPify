from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models.attendance_summary import AttendanceSummary
from app.models.attendance import Attendance
from app.models.enrollment import Enrollment
from app.schemas.attendance_summary import (
    AttendanceSummaryCreate,
    AttendanceSummaryResponse
)
from uuid import UUID

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

@router.get("/student/{student_id}", response_model=list[AttendanceSummaryResponse])
def get_student_attendance_summary(student_id: UUID, db: Session = Depends(get_db)):
    # 1. Get all enrollments for this student
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    
    summaries = []
    for enrollment in enrollments:
        # 2. Calculate attendance metrics
        total_classes = db.query(func.count(Attendance.id)).filter(
            Attendance.enrollment_id == enrollment.id
        ).scalar() or 0
        
        attended_classes = db.query(func.count(Attendance.id)).filter(
            Attendance.enrollment_id == enrollment.id,
            Attendance.status == True
        ).scalar() or 0
        
        percentage = (attended_classes / total_classes * 100) if total_classes > 0 else 0
        
        # 3. Update or create AttendanceSummary
        summary = db.query(AttendanceSummary).filter(
            AttendanceSummary.student_id == student_id,
            AttendanceSummary.course_id == enrollment.course_id
        ).first()
        
        if summary:
            summary.total_classes = total_classes
            summary.attended_classes = attended_classes
            summary.attendance_percentage = percentage
        else:
            summary = AttendanceSummary(
                institution_id=enrollment.institution_id,
                student_id=student_id,
                course_id=enrollment.course_id,
                semester_id=enrollment.semester_id,
                total_classes=total_classes,
                attended_classes=attended_classes,
                attendance_percentage=percentage
            )
            db.add(summary)
        
        db.commit()
        db.refresh(summary)
        summaries.append(summary)
        
    return summaries