from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CourseResponse)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    course = Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()