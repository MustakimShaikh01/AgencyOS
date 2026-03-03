from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import Agent, Decision
from app.api.schemas import AgentResponse, DecisionResponse

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("", response_model=List[AgentResponse])
async def list_agents(db: AsyncSession = Depends(get_db)):
    """List all operating agents."""
    result = await db.execute(select(Agent).order_by(Agent.authority_level.desc()))
    return result.scalars().all()

@router.get("/{agent_name}", response_model=AgentResponse)
async def get_agent(agent_name: str, db: AsyncSession = Depends(get_db)):
    """Details for a specific agent."""
    result = await db.execute(select(Agent).where(Agent.name == agent_name))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.get("/{agent_name}/decisions", response_model=List[DecisionResponse])
async def get_agent_history(agent_name: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Get the last N decisions for an agent."""
    result = await db.execute(
        select(Decision)
        .where(Decision.agent == agent_name)
        .order_by(Decision.timestamp.desc())
        .limit(limit)
    )
    return result.scalars().all()
