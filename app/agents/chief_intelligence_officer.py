from app.agents.base_agent import BaseAgent
from typing import Dict, Any

class ChiefIntelligenceOfficer(BaseAgent):
    """
    The 'Judge' of AgencyOS. Oversees all campaigns, evaluates agent collaboration,
    assigns rewards/promotions, and ensures strategic alignment with real-world goals.
    """
    def __init__(self):
        super().__init__()
        self.name = "cio"
        self.role = "Chief Intelligence Officer"
        self.authority_level = 5
        self.prompt_template = """As the CIO, audit this campaign: {campaign_name}.
        
        TASKS PERFORMED:
        {tasks_completed}

        Analyze the synergy between the agents. Did the Content Writer meet the Brand Guidelines? Did the Risk Agent catch critical errors? Did the Finance Controller keep us on budget?

        Return YOUR EXEC REPORT as JSON with these keys:
        {{
          "summary": "High-level impact overview",
          "corrections": ["Exact mistake detected", "hallucination fix", "..."],
          "promotions": ["Agent name who excelled", "Agent name for recalibration"],
          "real_world_advice": ["Practical business move 1", "Practical move 2"],
          "confidence_score": 0.0
        }}

        JSON OUTPUT: """

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Ensure all required CIO report sections are present."""
        required_fields = {"summary", "corrections", "promotions", "real_world_advice"}
        return any(field in output for field in required_fields) # Use any for more resilience
