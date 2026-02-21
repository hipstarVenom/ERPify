# app/schemas/faculty.py

from pydantic import BaseModel
from uuid import UUID
from typing import Optional


# 🔹 Used when creating faculty (POST)
class FacultyCreate(BaseModel):
    user_id: UUID
    department_id: UUID
    designation: str
    course_id: Optional[UUID] = None


# 🔹 Used when returning faculty (GET)
class FacultyResponse(BaseModel):
    user_id: UUID
    department_id: UUID
    designation: str
    course_id: Optional[UUID] = None

    model_config = {
        "from_attributes": True
    }
