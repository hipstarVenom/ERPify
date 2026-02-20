# app/models/grade.py

from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from app.database import Base


class Grade(Base):
    __tablename__ = "grade"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    enrollment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("student.user_id"), # Assuming enrollment_id links to student's user_id or a separate enrollment table if it exists
        nullable=False
    )

    marks = Column(Integer, nullable=False)
    grade = Column(String(5), nullable=False)
    
    updated_time = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )
