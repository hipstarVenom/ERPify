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

    institution_id = Column(
        UUID(as_uuid=True),
<<<<<<< HEAD
        ForeignKey("institution.id", ondelete="CASCADE"),
=======
>>>>>>> f718be1599240da8668d0dafb4e32e00c5fcdfb4
        nullable=False
    )

    enrollment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enrollment.id", ondelete="CASCADE"),
        nullable=False
    )

    marks = Column(Integer, nullable=False)
    grade = Column(String(5), nullable=False)
<<<<<<< HEAD
=======
    
>>>>>>> f718be1599240da8668d0dafb4e32e00c5fcdfb4
