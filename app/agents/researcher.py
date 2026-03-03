from app.agents.base_agent import BaseAgent
from typing import Dict, Any

class ResearcherAgent(BaseAgent):
    """
    Scours market data, identifies real-world trends, and provides deep-dive research
    to be stored in the Corporate Brain for future use.
    """
    def __init__(self):
        super().__init__()
        self.name = "researcher"
        self.role = "Market Research Lead"
        self.authority_level = 4
        self.system_prompt = """
You are the Market Research Lead for AgencyOS. 
Your job is to identify high-value insights, market gaps, and real-world implementation strategies.
You look for data points that help a human user apply AI results to actual business scenarios.
Your research is persistent—it will be stored and used by other agents in future campaigns.
"""

    async def build_prompt(self, task_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        topic = task_data.get("topic", "General AI Trends")
        prompt = f"""
### RESEARCH OBJECTIVE: {topic} ###

Scour our existing intelligence and external knowledge to provide a 3-point research summary on {topic}.
Focus on:
1. Current market saturation.
2. Low-hanging fruit for AI disruption.
3. Specific step-by-step implementation for a real-world user.

Format your response as a detailed research document.
"""
        return prompt

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Simple validation for researcher output."""
        # Researcher usually returns a free-form document but should be non-empty
        return len(str(output)) > 10
