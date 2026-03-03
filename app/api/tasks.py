from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import Task, Decision
from app.api.schemas import TaskResponse, DecisionResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """List recent tasks."""
    result = await db.execute(select(Task).order_by(Task.updated_at.desc()).limit(limit))
    return result.scalars().all()

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Details for a single task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
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
