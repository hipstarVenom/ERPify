from pydantic import BaseModel
from uuid import UUID

class EnrollmentCreate(BaseModel):
    institution_id: UUID
    student_id: UUID
    course_id: UUID
    semester_id: str
    status: str

class EnrollmentResponse(BaseModel):
    id: UUID
    institution_id: UUID
    student_id: UUID
    course_id: UUID
    semester_id: str
    status: str

    class Config:
        from_attributes = True