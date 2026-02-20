from fastapi import FastAPI
from app.routes import course
from app.routes import attendance
from app.routes import attendance_summary

app = FastAPI(title="ERPify API")
app.include_router(course.router)
app.include_router(attendance.router)
app.include_router(attendance_summary.router)   