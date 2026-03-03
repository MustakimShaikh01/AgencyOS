from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class StrategistAgent(BaseAgent):
    """Strategist agent responsible for breaking campaigns into actionable sub-tasks."""
    
    name: str = "strategist"
    role: str = "Campaign Strategist"
    authority_level: int = 3
    model_preference: str = "qwen"
    
    prompt_template: str = """You are the Campaign Strategist at AgencyOS.

Campaign Brief:
{campaign_brief}

Brand Guidelines:
{brand_guidelines}

Budget: ${budget}

Break this campaign into actionable sub-tasks.
Assign each task to one of: content_writer, seo_agent, ads_manager, social_manager

Return JSON:
{
  "analysis_summary": "brief campaign analysis",
  "sub_tasks": [
    {
      "title": "task name",
      "description": "what needs to be done",
      "assigned_to": "agent_name",
      "budget": 0.0,
      "priority": "high|medium|low"
    }
  ],
  "confidence_score": 0.0
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate strategist outputs."""
        required_keys = {"analysis_summary", "sub_tasks", "confidence_score"}
        if not required_keys.issubset(output.keys()):
            return False
        
        if not isinstance(output.get("sub_tasks"), list):
            return False
            
        for task in output["sub_tasks"]:
            if not {"title", "assigned_to", "budget"}.issubset(task.keys()):
                return False
                
        return True
