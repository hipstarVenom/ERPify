from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class AttendanceSummary(Base):
    __tablename__ = "attendance_summary"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), nullable=False)
    student_id = Column(UUID(as_uuid=True), nullable=False)
    course_id = Column(UUID(as_uuid=True), nullable=False)
    semester_id = Column(String, nullable=False)

    total_classes = Column(Integer, default=0)
    attended_classes = Column(Integer, default=0)
    attendance_percentage = Column(Numeric, default=0)