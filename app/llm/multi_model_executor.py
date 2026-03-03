import time
import logging
import asyncio
from typing import Dict, Any, Optional

from app.llm.local_quantized_loader import model_loader
from app.agents import AGENT_REGISTRY
from app.db.session import AsyncSessionLocal
from app.db.models import ModelUsage

logger = logging.getLogger(__name__)

# Fallback Routing Rules
FALLBACK_MAP = {
    "qwen": "tinyllama",
    "mistral": "qwen",
    "tinyllama": None
}

class MultiModelExecutor:
    """Manages routing tasks to appropriate LLM models securely, retrying, and tracking."""

    async def execute(self, agent_name: str, prompt: str, task_id: Optional[int] = None) -> Dict[str, Any]:
        """Route to appropriate model based on agent config falling back if needed."""
        
        agent = AGENT_REGISTRY.get(agent_name)
        if not agent:
            raise ValueError(f"Agent {agent_name} not found in registry.")

        preferred_model = agent.model_preference
        
        # Try generation using fallbacks if memory or loads fail
        current_model = preferred_model
        while current_model:
            try:
                # Using run_in_executor because model_loader.generate is synchronous (it blocks)
                start_time = time.time()
                
                logger.info(f"Executing prompt for {agent_name} using {current_model}...")
                raw_response = await asyncio.to_thread(
                    model_loader.generate, 
                    current_model, 
                    prompt
                )
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                # Estimate token count (lazy: chars / 4)
                tokens_used = len(prompt) // 4 + len(raw_response) // 4
                
                # Log usage into Database
                if task_id:
                    await self._log_usage(agent_name, current_model, tokens_used, duration_ms, task_id)
                
                # Safely parse agent JSON output from the raw string
                return await agent.parse_response(raw_response)
                
            except Exception as e:
                logger.error(f"Execution failed with model {current_model} for agent {agent_name}: {e}")
                
                # Determine fallback
                next_model = FALLBACK_MAP.get(current_model)
                if next_model:
                    logger.warning(f"Falling back from {current_model} to {next_model}...")
                    current_model = next_model
                else:
                    logger.error(f"No more fallback models available for {agent_name}.")
                    raise

    async def _log_usage(self, agent: str, model: str, tokens: int, duration_ms: int, task_id: int) -> None:
        """Log token costs safely and asyncly."""
        try:
            async with AsyncSessionLocal() as session:
                usage = ModelUsage(
                    agent=agent,
                    model_name=model,
                    tokens_used=tokens,
                    duration_ms=duration_ms,
                    task_id=task_id
                )
                session.add(usage)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to log model usage: {e}")

# Singleton Instance 
multi_model_executor = MultiModelExecutor()
