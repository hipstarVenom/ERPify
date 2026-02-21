from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.student import Student
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.grade import Grade
from app.models.attendance_summary import AttendanceSummary
from app.schemas.student import StudentCreate, StudentResponse
from uuid import UUID

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

# 🔹 GET - Student Dashboard Data
@router.get("/{user_id}/dashboard")
def get_student_dashboard(user_id: UUID, db: Session = Depends(get_db)):
    # 1. Get student
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Get enrollments with course details
    enrollments = db.query(Enrollment, Course).join(
        Course, Enrollment.course_id == Course.id
    ).filter(Enrollment.student_id == user_id).all()

    # 3. Get attendance summaries
    attendance_summaries = db.query(AttendanceSummary, Course).join(
        Course, AttendanceSummary.course_id == Course.id
    ).filter(AttendanceSummary.student_id == user_id).all()

    # 4. Get grades
    grades = db.query(Grade, Course).join(
        Enrollment, Grade.enrollment_id == Enrollment.id
    ).join(
        Course, Enrollment.course_id == Course.id
    ).filter(Enrollment.student_id == user_id).all()

    return {
        "courses": [
            {"id": str(c.id), "name": c.course_name, "code": c.course_code} 
            for e, c in enrollments
        ],
        "attendance": [
            {
                "course_name": c.course_name,
                "total_classes": a.total_classes,
                "attended_classes": a.attended_classes,
                "attendance_percentage": float(a.attendance_percentage)
            }
            for a, c in attendance_summaries
        ],
        "grades": [
            {
                "course_name": c.course_name,
                "marks": g.marks,
                "grade": g.grade
            }
            for g, c in grades
        ]
    }

# 🔹 POST - Create Student
@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
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

# 🔹 DELETE - Delete Student By user_id
@router.delete("/{user_id}")
def delete_student(user_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == user_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}