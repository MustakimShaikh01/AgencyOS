from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class FinanceControllerAgent(BaseAgent):
    """Finance Controller responsible for budget and token cost management."""
    
    name: str = "finance_controller"
    role: str = "Finance Controller"
    authority_level: int = 4
    model_preference: str = "tinyllama"
    
    prompt_template: str = """You are the Finance Controller at AgencyOS.

Campaign Budget: ${total_budget}
Spent So Far: ${spent_budget}
Current Task Cost: ${task_cost}
Token Usage This Session: {tokens_used}

Analyze:
- Is the task cost within budget?
- Is there a budget overrun risk?
- Is cost efficiency acceptable?

Return JSON:
{
  "budget_status": "within_limit|approaching_limit|over_limit",
  "budget_remaining": 0.0,
  "overrun_percentage": 0.0,
  "cost_efficiency_score": 0,
  "approval_required": false,
  "recommendation": "proceed|pause|escalate"
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate finance controller outputs."""
        required_keys = {"budget_status", "budget_remaining", "overrun_percentage", "cost_efficiency_score", "recommendation"}
        return required_keys.issubset(output.keys())
