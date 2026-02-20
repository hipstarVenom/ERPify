# app/models/student.py

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Student(Base):
    __tablename__ = "student"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        primary_key=True
    )

    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("department.id"),
        nullable=False
    )

    enrollment_number = Column(String, nullable=False)
    admission_year = Column(Integer, nullable=False)
    current_year = Column(Integer, nullable=False)