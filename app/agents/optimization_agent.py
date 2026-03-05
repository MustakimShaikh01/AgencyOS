from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class OptimizationAgent(BaseAgent):
    """Optimization agent responsible for LLM efficiency, coordination, and guiding slow tasks.
    """
    name: str = "performance_lead"
    role: str = "Systems Optimization Lead"
    authority_level: int = 5
    model_preference: str = "qwen" # Mistral missing, use qwen
    
    prompt_template: str = """You are the Systems Optimization Lead at AgencyOS.
    
    Current System Performance:
    - Task Latency: {latency_info}
    - Accuracy Metrics: {accuracy_info}
    - Slow Agents: {slow_agents}

    GUIDELINES:
    1. Identify bottlenecks in workflows.
    2. Guide slow LLMs to more efficient prompt structures.
    3. Ensure all agents follow the 'correct way' for scalable work.
    4. Propose immediate fixes to speed up the process.

    Return YOUR RESPONSE as JSON matching this format:
    {{
      "system_audit": "...",
      "optimization_plan": [
        {{ "target": "agent_name", "guidance": "...", "suggested_prompt_fix": "..." }}
      ],
      "scalability_advice": "...",
      "is_critical": false,
      "confidence_score": 0.0
    }}

    JSON OUTPUT: """

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        required_keys = {"system_audit", "optimization_plan", "scalability_advice", "confidence_score"}
        return required_keys.issubset(output.keys())
