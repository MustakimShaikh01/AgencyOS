from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    authority_level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    approval_rate = Column(Float, default=1.0)
    efficiency_score = Column(Float, default=1.0)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand_guidelines = Column(Text)
    workflow_type = Column(String, default="content_campaign")
    total_budget = Column(Float, default=0.0)
    spent_budget = Column(Float, default=0.0)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tasks = relationship("Task", back_populates="campaign", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pending", index=True)
    assigned_agent = Column(String)
    budget = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)
    approval_score = Column(Integer, default=0)
    revision_count = Column(Integer, default=0)
    output_content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaign = relationship("Campaign", back_populates="tasks")
    decisions = relationship("Decision", back_populates="task", cascade="all, delete-orphan")

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), index=True, nullable=False)
    agent = Column(String, nullable=False)
    decision_type = Column(String, nullable=False)
    decision = Column(Text, nullable=False)
    score = Column(Float)
    reasoning = Column(Text)
    full_output = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("Task", back_populates="decisions")

class ModelUsage(Base):
    __tablename__ = "model_usage"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=True)
    agent = Column(String, index=True, nullable=False)
    model_name = Column(String, nullable=False)
    tokens_used = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    actor = Column(String, index=True, nullable=False)
    resource_type = Column(String)
    resource_id = Column(Integer)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
