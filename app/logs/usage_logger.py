import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.db.session import AsyncSessionLocal
from app.db.models import ModelUsage

logger = logging.getLogger(__name__)

class UsageLogger:
    """Specialized logger to capture detailed Token sizes, Model Costs and durations."""
    
    async def log_usage(self, agent: str, model_name: str, tokens: int, duration_ms: int, task_id: Optional[int] = None) -> None:
        """
        Log precise tracking numbers of HuggingFace llama.cpp models.
        """
        # Stats file trace
        logger.debug(f"{agent} ({model_name}): {tokens} tokens in {duration_ms}ms")
        
        # DB Tracking table
        try:
            async with AsyncSessionLocal() as session:
                usage = ModelUsage(
                    agent=agent,
                    model_name=model_name,
                    tokens_used=tokens,
                    duration_ms=duration_ms,
                    task_id=task_id
                )
                session.add(usage)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to track ModelUsage into DB: {str(e)}")

usage_logger = UsageLogger()
