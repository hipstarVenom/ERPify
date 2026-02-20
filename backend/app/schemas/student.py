# app/schemas/student.py

from pydantic import BaseModel
from uuid import UUID


# 🔹 Used when creating student (POST)
class StudentCreate(BaseModel):
    user_id: UUID
    department_id: UUID
    enrollment_number: str
    admission_year: int
    current_year: int


# 🔹 Used when returning student (GET)
class StudentResponse(BaseModel):
    user_id: UUID
    department_id: UUID
    enrollment_number: str
    admission_year: int
    current_year: int

    model_config = {
        "from_attributes": True
    }