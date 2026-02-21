# app/schemas/grade.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


# 🔹 Used when creating grade (POST)
class GradeCreate(BaseModel):
    institution_id: UUID
    enrollment_id: UUID
    marks: int
    grade: str


# 🔹 Used when returning grade (GET)
class GradeResponse(BaseModel):
    id: UUID
    institution_id: UUID
    enrollment_id: UUID
    marks: int
    grade: str

    model_config = {
        "from_attributes": True
    }
