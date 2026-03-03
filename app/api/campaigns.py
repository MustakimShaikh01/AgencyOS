from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import Campaign, Task
from app.api.schemas import CampaignCreate, CampaignResponse, TaskResponse
from app.core.orchestrator import orchestrator

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.post("", response_model=CampaignResponse)
async def create_campaign(campaign_in: CampaignCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new campaign draft."""
    campaign = Campaign(
        name=campaign_in.name,
        brand_guidelines=f"[{campaign_in.industry.upper()}] {campaign_in.brand_guidelines}",
        workflow_type=campaign_in.workflow_type,
        total_budget=campaign_in.total_budget
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """List all campaigns."""
    result = await db.execute(select(Campaign).order_by(Campaign.created_at.desc()).limit(limit))
    return result.scalars().all()

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: int, db: AsyncSession = Depends(get_db)):
    """Get campaign details."""
    campaign = await db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/{campaign_id}/run")
async def run_campaign(campaign_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Trigger campaign execution asynchronously."""
    campaign = await db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    if campaign.status not in ["draft", "failed", "completed"]:
        raise HTTPException(status_code=400, detail="Campaign is already running or blocked")

    # Launch workflow looping orchestrator in background so HTTP returns quickly!
    background_tasks.add_task(orchestrator.run_campaign, campaign_id)
    
    return {"status": "accepted", "message": f"Campaign {campaign_id} queued for execution."}

@router.get("/{campaign_id}/tasks", response_model=List[TaskResponse])
async def get_campaign_tasks(campaign_id: int, db: AsyncSession = Depends(get_db)):
    """Get live generated tasks for a campaign."""
    result = await db.execute(select(Task).where(Task.campaign_id == campaign_id).order_by(Task.created_at.asc()))
    return result.scalars().all()
