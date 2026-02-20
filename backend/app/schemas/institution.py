# app/schemas/institution.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


# 🔹 Create Institution
class InstitutionCreate(BaseModel):
    name: str


# 🔹 Response
class InstitutionResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }