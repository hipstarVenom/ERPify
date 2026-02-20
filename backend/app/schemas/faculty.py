# app/schemas/faculty.py

from pydantic import BaseModel
from uuid import UUID


# 🔹 Used when creating faculty (POST)
class FacultyCreate(BaseModel):
    user_id: UUID
    department_id: UUID
    designation: str


# 🔹 Used when returning faculty (GET)
class FacultyResponse(BaseModel):
    user_id: UUID
    department_id: UUID
    designation: str

    model_config = {
        "from_attributes": True
    }
