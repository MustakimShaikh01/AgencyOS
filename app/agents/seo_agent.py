from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class SEOAgent(BaseAgent):
    """SEO Agent responsible for keyword analysis and content optimization."""
    
    name: str = "seo_agent"
    role: str = "SEO Manager"
    authority_level: int = 2
    model_preference: str = "qwen"
    
    prompt_template: str = """You are the SEO Manager at AgencyOS.

Task: {task_description}
Content/Topic: {content}

Objectives:
- Identify primary and secondary keywords
- Write optimized meta tags
- Suggest internal link placements
- Ensure appropriate keyword density

Return JSON:
{
  "primary_keyword": "keyword",
  "secondary_keywords": ["kw1", "kw2"],
  "meta_title": "Optimized Title (under 60 chars)",
  "meta_description": "Optimized description (under 160 chars)",
  "content_suggestions": ["suggestion 1", "suggestion 2"],
  "seo_score": 0
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate SEO agent outputs."""
        required_keys = {"primary_keyword", "secondary_keywords", "meta_title", "meta_description", "seo_score"}
        return required_keys.issubset(output.keys())
