import logging
from typing import Dict, Any, Tuple
from app.db.models import Task, Agent

logger = logging.getLogger(__name__)

class DecisionEngine:
    """Evaluates agent outputs against strict business rules."""

    # 1. risk_score > 70                → AUTO BLOCK task
    # 2. budget_overrun > 20%           → ESCALATE to Finance
    # 3. approval_score < 75            → SEND to REVISION
    # 4. confidence_score < 0.5         → AUTO ESCALATE
    # 5. 3 failed revisions             → DOWNGRADE agent XP
    # 6. approved first try             → BONUS XP
    # 7. risk_score < 20                → FAST-TRACK
    # 8. budget exhausted               → PAUSE all tasks
    
    def evaluate(self, agent_name: str, outputs: Dict[str, Any], task: Task) -> Tuple[str, str]:
        """
        Parses outputs and applies rules.
        Returns: Tuple(Next State: str, Reason/Instruction: str)
        """
        state = "APPROVED"
        reason = ""

        # Confidence Trap (Rule 4)
        confidence = float(outputs.get("confidence_score", 1.0))
        if confidence < 0.5:
            return "ESCALATED", f"{agent_name} lacks confidence ({confidence}). Manual override suggested."

        # Risk Engine (Rule 1 & Rule 7)
        if "risk_score" in outputs:
            risk = int(outputs["risk_score"])
            task.risk_score = risk
            
            if risk > 70:
                return "BLOCKED", f"High risk detected ({risk}). Content violates guidelines."
            elif risk < 20:
                pass # Fast-track logic handled by orchestration flow

        # Quality Assurance (Rule 3)
        if "overall_score" in outputs:
            score = int(outputs["overall_score"])
            task.approval_score = score
            
            if not outputs.get("approved") or score < 75:
                return "REVISION", outputs.get("revision_instructions", "Score too low.")
                
        # Finance Traps (Rule 2)
        if "overrun_percentage" in outputs:
            overrun = float(outputs["overrun_percentage"])
            if overrun > 20.0:
                return "ESCALATED", f"Budget overrun by {overrun}%. Escalate to finance."

        return state, reason

    def apply_xp_modifications(self, agent: Agent, rule_triggered: str) -> None:
        """Applies XP logic based on triggers (Rules 5, 6, 9, 10)."""
        base_xp = agent.xp or 0

        match rule_triggered:
            case "down_limit_revisions":
                base_xp -= 10
            case "first_pass_approval":
                base_xp += 15
            case "high_risk_block":
                base_xp -= 5
            case "fast_track_clean":
                base_xp += 5
                
        # Level up logic (Rule 9)
        if base_xp > 500 and agent.authority_level < 5:
            agent.authority_level += 1
            agent.xp = 0
            logger.info(f"Agent {agent.name} promoted to L{agent.authority_level}!")
            
        # Bench logic (Rule 10)
        elif base_xp < -50:
            agent.status = "inactive"
            logger.warning(f"Agent {agent.name} Benched! Negative XP.")
            
        else:
            agent.xp = base_xp

decision_engine = DecisionEngine()
