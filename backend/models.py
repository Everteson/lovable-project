from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean
from sqlalchemy.sql import func
from database import Base
import uuid

class CommissionRequest(Base):
    __tablename__ = "commissions"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, nullable=False)
    discord_id = Column(String, nullable=False)
    email = Column(String, nullable=False)
    project_description = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, 50_paid, 100_paid, completed
    payment_status = Column(String, default="pending")  # pending, 50_paid, 100_paid
    progress_status = Column(String, default="in_queue")  # in_queue, waiting_payment, in_progress, completed
    file_reference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    image_url = Column(String, nullable=False)  # store relative path to the local file
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class SiteSetting(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="user")  # user, admin
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class PortfolioCategory(Base):
    __tablename__ = "portfolio_categories"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
