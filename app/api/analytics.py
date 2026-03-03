from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict

from app.db.session import get_db
from app.db.models import ModelUsage, Agent, AuditLog
from app.api.schemas import ModelUsageResponse, AgentPerformanceResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/model-usage", response_model=List[ModelUsageResponse])
async def get_model_usage(db: AsyncSession = Depends(get_db)):
    """Grouped token metrics for all LLMs used."""
    query = (
        select(
            ModelUsage.model_name,
            func.sum(ModelUsage.tokens_used).label("total_tokens"),
            func.count(ModelUsage.id).label("total_calls")
        )
        .group_by(ModelUsage.model_name)
    )
    result = await db.execute(query)
    
    return [
        {"model_name": row.model_name, "total_tokens": row.total_tokens or 0, "total_calls": row.total_calls}
        for row in result.all()
    ]

@router.get("/agent-performance", response_model=List[AgentPerformanceResponse])
async def get_agent_performance(db: AsyncSession = Depends(get_db)):
    """Retrieve XP and stats mapped per-agent."""
    # Since tasks doesn't directly link completed to agent in our simple schema, 
    # we just estimate or return active XP right now
    result = await db.execute(select(Agent))
    agents = result.scalars().all()
    
    return [
        {"agent_name": a.name, "xp": a.xp or 0, "tasks_completed": 0} # Placeholder counts here for V1
        for a in agents
    ]

@router.get("/audit-log")
async def get_audit_log(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieve entire full structured audit log dicts."""
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    audits = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "event": a.event_type,
            "actor": a.actor,
            "resource_type": a.resource_type,
            "resource_id": a.resource_id,
            "timestamp": a.timestamp,
            "details": a.details
        } for a in audits
    ]
