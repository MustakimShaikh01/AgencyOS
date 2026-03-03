from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class RiskAgent(BaseAgent):
    """Risk agent responsible for identifying compliance, legal, and brand risks."""
    
    name: str = "risk_agent"
    role: str = "Chief Compliance and Risk Officer"
    authority_level: int = 4
    model_preference: str = "mistral"
    
    prompt_template: str = """You are the Chief Compliance and Risk Officer at AgencyOS.

Content to analyze:
{content}

Detect any of the following:
- False or unsubstantiated claims
- Legal risk (copyright, defamation, false advertising)
- Ethical concerns (discrimination, manipulation)
- Brand reputation risk
- Regulatory compliance issues

Return JSON:
{
  "risk_score": 0,
  "risk_flags": ["specific issue 1", "specific issue 2"],
  "risk_categories": ["legal", "ethical", "brand"],
  "escalation_required": false,
  "recommended_changes": "what to fix"
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate risk agent outputs."""
        required_keys = {"risk_score", "risk_flags", "risk_categories", "escalation_required"}
        return required_keys.issubset(output.keys())
