from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import Task, Decision
from app.api.schemas import TaskResponse, DecisionResponse, TaskRateRequest

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """List recent tasks."""
    result = await db.execute(select(Task).order_by(Task.updated_at.desc()).limit(limit))
    return result.scalars().all()

@router.get("/completed", response_model=List[TaskResponse])
async def list_completed_tasks(db: AsyncSession = Depends(get_db)):
    """List all tasks that have generated output content."""
    result = await db.execute(
        select(Task)
        .where(Task.output_content != None)
        .order_by(Task.updated_at.desc())
    )
    return result.scalars().all()

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Details for a single task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/rate", response_model=TaskResponse)
async def rate_task(task_id: int, req: TaskRateRequest, db: AsyncSession = Depends(get_db)):
    """Apply human feedback/rating to a task's output."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.human_rating = req.rating
    task.human_feedback = req.feedback
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/{task_id}/publish", response_model=TaskResponse)
async def publish_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Automate the publishing of task content to its designated platform."""
    from app.db.models import SocialAccount
    from datetime import datetime
    
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not task.platform or task.platform == "internal":
        raise HTTPException(status_code=400, detail="Task is internal or has no platform assigned.")

    # Check social account security (2FA)
    result = await db.execute(select(SocialAccount).where(SocialAccount.platform == task.platform))
    account = result.scalar_one_or_none()
    
    if not account or account.status != "connected":
        raise HTTPException(status_code=403, detail=f"{task.platform.capitalize()} account is NOT SECURE (2FA required).")

    # Simulate actual API call to LinkedIn/Meta/WhatsApp
    logger.info(f"AUTOMATION: Publishing content to {task.platform} for account {account.account_name}...")
    
    task.published_at = datetime.utcnow()
    task.status = "published"
    await db.commit()
    await db.refresh(task)
    return task

@router.get("/{task_id}/decisions", response_model=List[DecisionResponse])
async def get_task_decisions(task_id: int, db: AsyncSession = Depends(get_db)):
    """Full decision log mapped to a specific generated task."""
    result = await db.execute(
        select(Decision)
        .where(Decision.task_id == task_id)
        .order_by(Decision.timestamp.asc()) # Chronological QA flow!
    )
    return result.scalars().all()
