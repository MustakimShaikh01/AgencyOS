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
        self.authority_level = 10
        self.system_prompt = """
You are the Chief Intelligence Officer (CIO) and Final Executive Judge of AgencyOS. 
Your responsibility is to audit the entire output of a completed campaign and provide a high-level executive report.

REQUIRED OUTPUT SECTIONS (JSON Format):
1. 'summary': A visionary overview of the campaign's success and strategic impact.
2. 'corrections': Identify exact mistakes, hallucinations, or weak points in the content produced by lower-level agents and explain how a human should correct them.
3. 'promotions': Decide which agents deserve 'Level Ups' or 'Rewards' based on their precision, and who needs 'Recalibration'.
4. 'real_world_advice': Provide 3 extremely practical ways the human administrator can use this specific work to solve real-life problems or generate business revenue TODAY.

Be authoritative, critical yet helpful, and focused on real-world scalability.
"""

    async def build_prompt(self, task_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        campaign_name = task_data.get("campaign_name", "Unknown Campaign")
        tasks = task_data.get("tasks_completed", [])
        
        prompt = f"""
### CAMPAIGN PERFORMANCE REVIEW: {campaign_name} ###

The campaign has concluded. Below is the full breakdown of work performed by the AI fleet:

{tasks}

Analyze the synergy between the agents. Did the Content Writer meet the Brand Guidelines? Did the Risk Agent catch critical errors? Did the Finance Controller keep us on budget?

Provide your final judgement for the Enterprise Administrator.
"""
        return prompt

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Ensure all required CIO report sections are present."""
        required_fields = ["summary", "corrections", "promotions", "real_world_advice"]
        return all(field in output for field in required_fields)
