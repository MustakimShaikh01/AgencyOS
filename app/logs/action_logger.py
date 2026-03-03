import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.db.session import AsyncSessionLocal
from app.db.models import AuditLog

logger = logging.getLogger(__name__)

class ActionLogger:
    """Logs system-wide state changes and major actions to DB and file."""
    
    async def log(self, event_type: str, actor: str, resource_type: str, resource_id: Optional[int], details: Dict[str, Any]) -> None:
        """Asynchronously writes a structured log of an action."""
        
        # File/Console Log (JSON formatted)
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "actor": actor,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details
        }
        logger.info(f"ACTION: {json.dumps(log_entry)}")
        
        # Database Audit Log
        try:
            async with AsyncSessionLocal() as session:
                audit = AuditLog(
                    event_type=event_type,
                    actor=actor,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details=json.dumps(details)
                )
                session.add(audit)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to persist ActionLog mapping to DB: {str(e)}")

action_logger = ActionLogger()
