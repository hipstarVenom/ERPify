from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Course(Base):
    __tablename__ = "course"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("department.id", ondelete="CASCADE"), nullable=False)
    course_name = Column(String, nullable=False)
    course_code = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)