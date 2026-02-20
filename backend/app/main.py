from fastapi import FastAPI
from app.routes import course

app = FastAPI(title="ERPify API")
app.include_router(course.router)