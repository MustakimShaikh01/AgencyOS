from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class ApproverAgent(BaseAgent):
    """Approver agent responsible for final QA and scoring outputs."""
    
    name: str = "approver"
    role: str = "Quality Assurance Director"
    authority_level: int = 5
    model_preference: str = "mistral"
    
    prompt_template: str = """You are the Quality Assurance Director at AgencyOS.

Content to review:
{draft_content}

Brand Guidelines:
{brand_guidelines}

Evaluate on these dimensions (0-100 each):
1. Brand Alignment
2. Clarity and Readability
3. Persuasion Strength
4. Risk Level (higher = worse)
5. SEO Compliance

Return JSON:
{
  "approved": true,
  "overall_score": 0,
  "dimension_scores": {
    "brand_alignment": 0,
    "clarity": 0,
    "persuasion": 0,
    "risk_level": 0,
    "seo_compliance": 0
  },
  "issues": [],
  "revision_instructions": "detailed instructions if not approved",
  "confidence_score": 0.0
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate approver outputs."""
        required_keys = {"approved", "overall_score", "dimension_scores", "issues", "revision_instructions"}
        if not required_keys.issubset(output.keys()):
            return False
            
        dim_scores = output.get("dimension_scores", {})
        if not {"brand_alignment", "clarity", "persuasion", "risk_level"}.issubset(dim_scores.keys()):
            return False
            
        return True
