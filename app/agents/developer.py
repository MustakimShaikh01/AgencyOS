from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class DeveloperAgent(BaseAgent):
    """ Developer agent responsible for generating code and technical architecture.
    """
    name: str = "developer"
    role: str = "Senior Software Engineer"
    authority_level: int = 2
    model_preference: str = "qwen"
    
    prompt_template: str = """You are a Senior Software Engineer at AgencyOS.
    
    Task: {task_description}
    Code Requirements:
    - Clean, modular, and well-documented
    - Scalable architecture
    - Follows modern best practices
    - Secure by design
    
    Current Project Context:
    - Language/Framework: {context_tech_stack}
    - Specific Request: {task_details}

    Return YOUR RESPONSE as JSON matching this format:
    {{
      "analysis_summary": "...",
      "code_blocks": [
        {{ "filename": "example.html", "content": "..." }},
        {{ "filename": "example.css", "content": "..." }}
      ],
      "technical_notes": "...",
      "confidence_score": 0.0
    }}

    JSON OUTPUT: """

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        required_keys = {"analysis_summary", "code_blocks", "technical_notes", "confidence_score"}
        return required_keys.issubset(output.keys())
