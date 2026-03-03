from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class AdsManagerAgent(BaseAgent):
    """Ads Manager Agent responsible for ad copy variations and targeting."""
    
    name: str = "ads_manager"
    role: str = "Performance Ads Manager"
    authority_level: int = 2
    model_preference: str = "qwen"
    
    prompt_template: str = """You are the Performance Ads Manager at AgencyOS.

Task: {task_description}
Target Audience: {target_audience}
Platform: {platform}

Objectives:
- Create click-driven ad copy variations
- Specify exact audience targeting
- Define budget allocation logic

Return JSON:
{
  "targeting_strategy": "audience targeting text",
  "ad_variations": [
    {
      "headline": "catchy headline",
      "primary_text": "main ad copy",
      "call_to_action": "Buy Now, Learn More, etc."
    }
  ],
  "budget_allocation_advice": "where to spend",
  "expected_ctr_confidence": 0.0
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate an Ads Manager output."""
        required_keys = {"targeting_strategy", "ad_variations", "budget_allocation_advice", "expected_ctr_confidence"}
        if not required_keys.issubset(output.keys()):
            return False
            
        return isinstance(output.get("ad_variations"), list)
