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

@router.get("/faculty/{faculty_id}")
def get_faculty_attendance_summary(faculty_id: UUID, db: Session = Depends(get_db)):
    from app.models.course import Course
    # 1. Get all enrollments managed by this faculty
    enrollments = db.query(Enrollment).filter(Enrollment.faculty_id == faculty_id).all()
    
    if not enrollments:
        return []

    # 2. Group by course and calculate average attendance
    course_stats = {}
    for enrollment in enrollments:
        c_id = str(enrollment.course_id)
        if c_id not in course_stats:
            # Need to get course name
            course = db.query(Course).filter(Course.id == enrollment.course_id).first()
            course_stats[c_id] = {
                "course_id": c_id,
                "course_name": course.course_name if course else "Unknown",
                "total_student_classes": 0,
                "total_student_attended": 0
            }
        
        # Calculate attendance for this specific enrollment
        total_classes = db.query(func.count(Attendance.id)).filter(
            Attendance.enrollment_id == enrollment.id
        ).scalar() or 0
        
        attended_classes = db.query(func.count(Attendance.id)).filter(
            Attendance.enrollment_id == enrollment.id,
            Attendance.status == True
        ).scalar() or 0
        
        course_stats[c_id]["total_student_classes"] += int(total_classes)
        course_stats[c_id]["total_student_attended"] += int(attended_classes)

    # 3. Finalize percentages
    result = []
    for stats in course_stats.values():
        total = stats["total_student_classes"]
        attended = stats["total_student_attended"]
        percentage = (attended / total * 100) if total > 0 else 0
        result.append({
            "course_name": stats["course_name"],
            "attendance_percentage": round(float(percentage), 2)
        })
    
    return result