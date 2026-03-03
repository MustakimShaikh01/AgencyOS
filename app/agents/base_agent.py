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
        """Safely parse LLM output into JSON, with higher resilience to extra text or multiple blocks."""
        # Pre-clean: Remove common LLM artifacts and handle control characters
        # Some LLMs output raw control characters like newlines inside strings
        cleaned = raw.strip()
        
        # Robust parsing strategy
        try:
            # 1. Direct try
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # 2. Try finding JSON blocks via Markdown delimiters
        json_matches = re.finditer(r'```(?:json)?\s*(.*?)\s*```', cleaned, re.DOTALL)
        for match in json_matches:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                continue

        # 3. Last resort: Progressive search for a valid JSON object
        # We look for the first '{' and try to find the matching '}'
        start_indices = [m.start() for m in re.finditer(r'\{', cleaned)]
        for start in start_indices:
            # Try from the end of the string backwards
            for end in range(len(cleaned), start, -1):
                if cleaned[end-1] == '}':
                    try:
                        candidate = cleaned[start:end]
                        
                        # Surgical cleaning: escape only newlines that are INSIDE quotes
                        result = []
                        in_string = False
                        escaped = False
                        for char in candidate:
                            if char == '"' and not escaped:
                                in_string = not in_string
                            
                            if char == '\n' and in_string:
                                result.append('\\n')
                            elif char == '\r' and in_string:
                                result.append('\\n')
                            else:
                                result.append(char)
                            
                            if char == '\\' and not escaped:
                                escaped = True
                            else:
                                escaped = False
                        
                        candidate_clean = "".join(result)
                        # Clean remaining non-printable control characters
                        candidate_clean = re.sub(r'[\x00-\x1f\x7f-\x9f]', lambda m: json.dumps(m.group())[1:-1] if m.group() not in ['\n', '\r', '\t'] else m.group(), candidate_clean)
                        
                        return json.loads(candidate_clean)
                    except json.JSONDecodeError:
                        continue
        
        logger.error(f"Failed to parse LLM response for {self.name}")
        logger.error(f"RAW OUTPUT THAT FAILED TO PARSE:\n{raw}\n---END RAW OUTPUT---")
        raise ValueError(f"Agent {self.name} returned invalid format. Please ensure the prompt is strict.")

    @abstractmethod
    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Agent-specific validation of the required output fields."""
        pass

    async def log_decision(self, task_id: int, decision: str, score: float, reasoning: str = "", full_output: str = "") -> None:
        """Helper to log the decision for a task into the database. Called during orchestration."""
        logger.info(f"[{self.name}] Decision logged on task {task_id}: {decision} (Score: {score})")
