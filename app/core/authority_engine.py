from typing import List, Dict, Any, Optional
import logging
from app.agents.base_agent import BaseAgent
from app.db.models import Task

logger = logging.getLogger(__name__)

class AuthorityEngine:
    """Manages role-hierarchy, permissions, and escalation thresholds for agents."""
    
    # Levels mapped to capabilities
    # Level 1: Execute tasks only
    # Level 2: Execute + self-review
    # Level 3: Execute + approve own scope
    # Level 4: Approve others + escalate + budget control
    # Level 5: Full approval authority + override + final signoff
    
    def can_approve(self, agent: BaseAgent, task: Task) -> bool:
        """Check if agent has authority to approve content representing the company."""
        if agent.authority_level >= 5: # Level 5 always approves
            return True
        if agent.authority_level == 4 and task.risk_score < 70: 
            return True # Level 4 can approve if risk is low
        return False

    def can_escalate(self, agent: BaseAgent) -> bool:
        """Check if an agent has the right to block tasks or trigger escalations."""
        return agent.authority_level >= 4

    def check_budget_authority(self, agent: BaseAgent, amount: float) -> bool:
        """Check if an agent can approve spending tasks."""
        if agent.name == "finance_controller":
            return True
        # Base limits for levels
        limits = {5: 1000.0, 4: 500.0, 3: 100.0, 2: 0.0, 1: 0.0}
        return amount <= limits.get(agent.authority_level, 0.0)

    def get_approval_chain(self, workflow_type: str) -> List[str]:
        """Returns the necessary agent chain to get final approval for a workflow."""
        if workflow_type == "content_campaign":
            return ["content_writer", "approver", "risk_agent"]
        elif workflow_type == "ad_campaign":
            return ["ads_manager", "approver", "risk_agent"]
        elif workflow_type == "social_campaign":
            return ["social_manager", "approver", "risk_agent"]
        return ["approver", "risk_agent"]

    def enforce_authority(self, action: str, actor: BaseAgent) -> bool:
        """General check against standard rules."""
        required_level = 1
        
        match action:
            case "override_decision":
                required_level = 5
            case "block_task":
                required_level = 4
            case "distribute_budget":
                required_level = 3
            case "create_task":
                required_level = 3
                
        if actor.authority_level < required_level:
            logger.warning(
                f"Authority Block: {actor.name} (L{actor.authority_level}) "
                f"attempted {action} requiring L{required_level}"
            )
            return False
        return True

authority_engine = AuthorityEngine()
