# app/schemas/user.py

from pydantic import BaseModel
from uuid import UUID


# 🔹 Create User
class UserCreate(BaseModel):
    institution_id: UUID
    first_name: str
    last_name: str
    role: str


# 🔹 Response
class UserResponse(BaseModel):
    id: UUID
    institution_id: UUID
    first_name: str
    last_name: str
    role: str

    model_config = {
        "from_attributes": True
    }