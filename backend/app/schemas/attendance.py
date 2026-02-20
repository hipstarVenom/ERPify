from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime

class AttendanceCreate(BaseModel):
    institution_id: UUID
    enrollment_id: UUID
    attendance_date: date
    status: bool

class AttendanceResponse(BaseModel):
    id: UUID
    institution_id: UUID
    enrollment_id: UUID
    attendance_date: date
    status: bool
    updated_at: datetime

    class Config:
        from_attributes = True