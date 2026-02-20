# app/models/institution.py

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from app.database import Base


class Institution(Base):
    __tablename__ = "institution"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    name = Column(String(255), nullable=False)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )