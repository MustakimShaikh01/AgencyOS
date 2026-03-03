from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Campaign Schemas
class CampaignCreate(BaseModel):
    name: str = Field(..., example="Summer Sale Promotion")
    brand_guidelines: str = Field(..., example="Fun, energetic, youthful tone.")
    workflow_type: str = Field(default="content_campaign")
    total_budget: float = Field(default=500.0)

class CampaignResponse(BaseModel):
    id: int
    name: str
    workflow_type: str
    total_budget: float
    spent_budget: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    assigned_agent: Optional[str]
    status: str
    risk_score: int
    revision_count: int
    output_content: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Agent Schemas
class AgentResponse(BaseModel):
    name: str
    role: str
    authority_level: int
    xp: int
    approval_rate: float
    status: str
    
    class Config:
        from_attributes = True

# Decision Schemas
class DecisionResponse(BaseModel):
    id: int
    agent: str
    decision_type: str
    score: Optional[float]
    reasoning: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ModelUsageResponse(BaseModel):
    model_name: str
    total_tokens: int
    total_calls: int
    
    model_config = {"protected_namespaces": ()}
    
class AgentPerformanceResponse(BaseModel):
    agent_name: str
    xp: int
    tasks_completed: int
