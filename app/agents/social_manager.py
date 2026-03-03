from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class SocialManagerAgent(BaseAgent):
    """Social Manager Agent responsible for platform adaptations and scheduling."""
    
    name: str = "social_manager"
    role: str = "Social Media Manager"
    authority_level: int = 2
    model_preference: str = "qwen"
    
    prompt_template: str = """You are the Social Media Manager at AgencyOS.

Task: {task_description}
Base Content: {content}

Objectives:
- Adapt the content for specific social platforms (Twitter/X, LinkedIn, Instagram)
- Create engaging hooks and hashtags
- Propose an optimal posting schedule

Return JSON:
{
  "platform_adaptations": {
    "twitter": "tweet text with #hashtags",
    "linkedin": "professional post with line breaks",
    "instagram": "visual-first caption with many #hashtags"
  },
  "recommended_hashtags": ["list", "of", "tags"],
  "posting_schedule_recommendation": "When to post for max engagement"
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate a Social Manager output."""
        required_keys = {"platform_adaptations", "recommended_hashtags"}
        if not required_keys.issubset(output.keys()):
            return False
            
        adaptations = output.get("platform_adaptations", {})
        if not {"twitter", "linkedin", "instagram"}.intersection(adaptations.keys()):
            return False
            
        return True
