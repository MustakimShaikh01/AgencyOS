from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class DesignerAgent(BaseAgent):
    """Designer agent responsible for visual branding and UX/UI guidelines."""
    
    name: str = "designer"
    role: str = "Senior UI/UX Designer"
    authority_level: int = 2
    model_preference: str = "qwen"
    
    prompt_template: str = """You are a Senior UI/UX Designer at AgencyOS.
    
    Task: {task_description}
    Design Style: {brand_guidelines}
    Focus Areas:
    - User journey and experience
    - Visual hierarchy (color, typography, spacing)
    - Responsive aesthetics
    - Dynamic interactions (animations, hovers)

    Return YOUR RESPONSE as JSON matching this format:
    {{
      "analysis_summary": "...",
      "ui_specs": {{
          "colors": ["...", "..."],
          "typography": "...",
          "spacing_system": "..."
      }},
      "visual_assets_needed": ["image1", "image2"],
      "layout_description": "...",
      "confidence_score": 0.0
    }}

    JSON OUTPUT: """

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        required_keys = {"analysis_summary", "ui_specs", "layout_description", "confidence_score"}
        return required_keys.issubset(output.keys())
