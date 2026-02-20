from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from app.database import Base


class Enrollment(Base):
    __tablename__ = "enrollment"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    institution_id = Column(
        UUID(as_uuid=True),
        ForeignKey("institution.id", ondelete="CASCADE"),
        nullable=False
    )

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("student.user_id", ondelete="CASCADE"),
        nullable=False
    )

    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("course.id", ondelete="CASCADE"),
        nullable=False
    )

    semester_id = Column(String(50), nullable=False)

    status = Column(String(50), nullable=False, default="enrolled")