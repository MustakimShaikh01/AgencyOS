from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class ContentWriterAgent(BaseAgent):
    """Content Writer agent responsible for drafting marketing copy."""
    
    name: str = "content_writer"
    role: str = "Senior Content Writer"
    authority_level: int = 1
    model_preference: str = "qwen"
    
    prompt_template: str = """You are a Senior Content Writer at AgencyOS.

Task: {task_description}
Brand Guidelines: {brand_guidelines}
Target Audience: {target_audience}

Content Objectives:
- High engagement
- SEO-optimized
- Professional tone
- Clear call-to-action

Return JSON:
{
  "analysis_summary": "...",
  "draft_content": "full content here",
  "self_review_notes": "what you think could be improved",
  "seo_keywords_used": ["keyword1", "keyword2"],
  "confidence_score": 0.0
}"""

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate content writer outputs."""
        required_keys = {"analysis_summary", "draft_content", "self_review_notes", "confidence_score"}
        return required_keys.issubset(output.keys())
