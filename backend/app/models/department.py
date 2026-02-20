# app/models/department.py

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from app.database import Base


class Department(Base):
    __tablename__ = "department"

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

    name = Column(String(255), nullable=False)