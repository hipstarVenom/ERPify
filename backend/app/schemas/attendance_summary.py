from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal

class AttendanceSummaryCreate(BaseModel):
    institution_id: UUID
    student_id: UUID
    course_id: UUID
    semester_id: str
    total_classes: int
    attended_classes: int
    attendance_percentage: Decimal

class AttendanceSummaryResponse(BaseModel):
    id: UUID
    institution_id: UUID
    student_id: UUID
    course_id: UUID
    semester_id: str
    total_classes: int
    attended_classes: int
    attendance_percentage: Decimal

    class Config:
        from_attributes = True