from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine

from app.routes import course
from app.routes import attendance
from app.routes import attendance_summary
from app.routes import student
from app.routes import institution
from app.routes import department
from app.routes import user
from app.routes import faculty
from app.routes import grade
app = FastAPI(title="ERPify API")

app.include_router(course.router)
app.include_router(attendance.router)
app.include_router(attendance_summary.router)
app.include_router(student.router)
app.include_router(institution.router)
app.include_router(department.router)
app.include_router(user.router)
app.include_router(faculty.router)
app.include_router(grade.router)

@app.get("/db-test")
def test_db():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return {"status": "connected", "result": result.scalar()}
    except Exception as e:
        return {"status": "error", "message": str(e)}