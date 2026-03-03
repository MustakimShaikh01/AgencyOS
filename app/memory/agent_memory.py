import time
import hashlib
from typing import Dict, Any, Optional

class AgentMemory:
    """In-memory Prompt Cache relying on LRU strategies to save repeating prompts."""
    
    def __init__(self, max_size: int = 100, ttl_seconds: int = 300):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl = ttl_seconds

    def _hash_prompt(self, prompt: str) -> str:
        """Hash the prompt cleanly."""
        return hashlib.md5(prompt.encode()).hexdigest()

    def get(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Retrieve from cache if within TTL."""
        key = self._hash_prompt(prompt)
        entry = self._cache.get(key)
        
        if entry:
            if time.time() - entry["timestamp"] <= self.ttl:
                return entry["response"]
            else:
                del self._cache[key] # Expired
                
        return None

    def set(self, prompt: str, response: Dict[str, Any]) -> None:
        """Store into cache with TTL timestamp."""
        key = self._hash_prompt(prompt)
        
        if len(self._cache) >= self.max_size:
            # Evict oldest entry (LRU via insertion order dicts from Python 3.7+)
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
            
        self._cache[key] = {
            "response": response,
            "timestamp": time.time()
        }

# Global Application Prompt Cache
prompt_cache = AgentMemory()
