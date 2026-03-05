from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Campaign Schemas
class CampaignCreate(BaseModel):
    name: str = Field(..., example="Summer Sale Promotion")
    brand_guidelines: str = Field(..., example="Fun, energetic, youthful tone.")
    industry: Optional[str] = Field(default="custom")
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
    campaign_id: int
    title: str
    description: Optional[str] = None
    assigned_agent: Optional[str]
    status: str
    risk_score: int
    revision_count: int
    output_content: Optional[str] = None
    platform: Optional[str] = None
    human_rating: Optional[int] = None
    human_feedback: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TaskRateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

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

class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    account_name: Optional[str]
    status: str
    two_fa_enabled: int
    last_verified: datetime

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
