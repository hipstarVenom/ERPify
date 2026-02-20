# app/schemas/department.py

from pydantic import BaseModel
from uuid import UUID


# 🔹 Create Department
class DepartmentCreate(BaseModel):
    institution_id: UUID
    name: str


# 🔹 Response
class DepartmentResponse(BaseModel):
    id: UUID
    institution_id: UUID
    name: str

    model_config = {
        "from_attributes": True
    }