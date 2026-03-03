import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class WorkflowEngine:
    """Defines predefined sequences of agents needed to complete diverse campaigns."""

    workflows: Dict[str, List[str]] = {
        "content_campaign": [
            "strategist",
            "content_writer",
            "seo_agent",
            "approver",
            "risk_agent",
            "finance_controller",
        ],
        "ad_campaign": [
            "strategist",
            "ads_manager",
            "approver",
            "risk_agent",
            "finance_controller",
        ],
        "social_campaign": [
            "strategist",
            "content_writer",   # Base content creation
            "social_manager",   # Re-purposing
            "approver",
            "finance_controller",
        ]
    }

    def get_workflow(self, campaign_type: str) -> List[str]:
        """Resolves workflow type returning the sequence of agents."""
        if campaign_type not in self.workflows:
            logger.warning(f"Unknown workflow type {campaign_type}, defaulting to content_campaign")
            return self.workflows.get("content_campaign", [])
            
        return self.workflows[campaign_type]

workflow_engine = WorkflowEngine()
