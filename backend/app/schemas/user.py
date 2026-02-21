# app/schemas/user.py

from pydantic import BaseModel
from uuid import UUID
from typing import Optional


# 🔹 Create User
class UserCreate(BaseModel):
    institution_id: UUID
    first_name: str
    last_name: str
    role: str
    email: Optional[str] = None
    password_hash: Optional[str] = None


# 🔹 Response (never expose password_hash)
class UserResponse(BaseModel):
    id: UUID
    institution_id: UUID
    first_name: str
    last_name: str
    role: str
    email: Optional[str] = None

    model_config = {
        "from_attributes": True
    }