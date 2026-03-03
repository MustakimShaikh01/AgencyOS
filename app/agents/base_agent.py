import json
import re
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Abstract Base Class for all specialized agents in AgencyOS."""
    
    name: str = "base_agent"
    role: str = "Standard AI Agent"
    authority_level: int = 1
    model_preference: str = "tinyllama"
    prompt_template: str = ""
    
    BASE_SYSTEM_PROMPT = """You are {ROLE} in a professional AI marketing startup called AgencyOS.

Company Brand Guidelines:
{brand_guidelines}

Your Authority Level: {authority_level} / 5

Instructions:
1. Think step by step internally before responding.
2. Return ONLY valid JSON, no markdown, no explanation.
3. Your response must include all required JSON fields.
4. Be professional, objective, and data-driven."""

    def __init__(self):
        self.validation_schema = {}

    async def execute(self, task: Dict[str, Any], context: Dict[str, Any], executor: Any = None) -> Dict[str, Any]:
        """
        Execute the agent's logic. 
        Usually overridden or uses the executor directly later.
        """
        prompt = await self.build_prompt(task, context)
        
        # Here executor represents MultiModelExecutor which we build in Phase 4
        # Returning a dummy structure for now, real implementation will use `executor`
        if executor:
            return await executor.execute(self.name, prompt, task.get("id"))
        
        return {"status": "mocked", "prompt": prompt}

    async def build_prompt(self, task: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Build the full prompt specific to this agent."""
        # Format the system prompt
        system_prompt = self.BASE_SYSTEM_PROMPT.format(
            ROLE=self.role,
            brand_guidelines=context.get("brand_guidelines", "Standard professional marketing."),
            authority_level=self.authority_level,
        )
        
        # Format the specific agent prompt
        # We handle any missing keys with a safe dictionary
        safe_kwargs = {**context, **task}
        try:
            agent_prompt = self.prompt_template.format(**safe_kwargs)
        except KeyError as e:
            logger.warning(f"Missing key in prompt completion for {self.name}: {e}")
            agent_prompt = self.prompt_template
            
        return f"{system_prompt}\n\n{agent_prompt}"

    async def parse_response(self, raw: str) -> Dict[str, Any]:
        """Safely parse LLM output into JSON."""
        try:
            # First try direct json load
            return json.loads(raw)
        except json.JSONDecodeError:
            try:
                # Try finding JSON block using regex if LLM added markdown formatting
                json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', raw, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                
                # Last resort: try finding first { and last }
                start = raw.find('{')
                end = raw.rfind('}') + 1
                if start != -1 and end != 0:
                    return json.loads(raw[start:end])
                
                raise ValueError("Could not find valid JSON in LLM response.")
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse LLM response for {self.name}: {e}")
                logger.error(f"RAW OUTPUT THAT FAILED TO PARSE:\n{raw}\n---END RAW OUTPUT---")
                raise ValueError(f"Agent {self.name} returned invalid format.")

    @abstractmethod
    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Agent-specific validation of the required output fields."""
        pass

    async def log_decision(self, task_id: int, decision: str, score: float, reasoning: str = "", full_output: str = "") -> None:
        """Helper to log the decision for a task into the database. Called during orchestration."""
        logger.info(f"[{self.name}] Decision logged on task {task_id}: {decision} (Score: {score})")
