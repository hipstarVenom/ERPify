# app/models/faculty.py

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Faculty(Base):
    __tablename__ = "faculty"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user.id"),
        primary_key=True
    )

    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("department.id"),
        nullable=False
    )

    designation = Column(String, nullable=False)
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("course.id"),
        nullable=True
    )
