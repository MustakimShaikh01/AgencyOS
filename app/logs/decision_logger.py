import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.db.session import AsyncSessionLocal
from app.db.models import Decision

logger = logging.getLogger(__name__)

class DecisionLogger:
    """Specialized logger to capture full agent outputs and reasonings."""
    
    async def log_decision(
        self, 
        task_id: int, 
        agent: str, 
        decision_type: str, 
        score: float, 
        reasoning: str, 
        full_json: Dict[str, Any]
    ) -> None:
        """
        Logs every sub-task decision including intermediate LLM JSON output to database.
        Decision types: APPROVED, REVISION, ESCALATED, BLOCKED, etc.
        """
        
        # Simple string-dump for terminal output parity
        logger.info(f"[{agent}] -> {decision_type} on Task#{task_id} (Score: {score}) | Reason: {reasoning}")
        
        # Full Audit
        try:
            async with AsyncSessionLocal() as session:
                decision = Decision(
                    task_id=task_id,
                    agent=agent,
                    decision_type=decision_type,
                    decision=decision_type,
                    score=score,
                    reasoning=reasoning,
                    full_output=json.dumps(full_json)
                )
                session.add(decision)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to persist Decision to DB: {str(e)}")

decision_logger = DecisionLogger()
