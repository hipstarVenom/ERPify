from pydantic import BaseModel
from uuid import UUID

class CourseCreate(BaseModel):
    institution_id: UUID
    department_id: UUID
    course_name: str
    course_code: str
    credits: int

class CourseResponse(BaseModel):
    id: UUID
    institution_id: UUID
    department_id: UUID
    course_name: str
    course_code: str
    credits: int

    class Config:
        from_attributes = True