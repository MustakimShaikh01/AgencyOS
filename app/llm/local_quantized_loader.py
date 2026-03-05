from pathlib import Path
import logging
from typing import Dict, Optional, Any
from llama_cpp import Llama

from app.config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    """Manages lazy loading and unloading of quantized local logic models (llama.cpp)"""
    
    _loaded_models: Dict[str, Llama] = {}
    _model_usage_order: list[str] = [] # Track usage for LRU unloading
    MAX_LOADED_MODELS = 1 # Keep only 1 model in RAM by default for low-memory environments

    def __init__(self):
        self.models_dir = Path(settings.MODEL_DIR)

    def is_loaded(self, model_name: str) -> bool:
        return model_name in self._loaded_models

    def load(self, model_name: str) -> Llama:
        """Loads a model if it isn't currently loaded, enforcing memory limits."""
        if self.is_loaded(model_name):
            # Move to end of usage list (most recently used)
            if model_name in self._model_usage_order:
                self._model_usage_order.remove(model_name)
            self._model_usage_order.append(model_name)
            return self._loaded_models[model_name]
            
        # Enforce max loaded models (LRU)
        while len(self._loaded_models) >= self.MAX_LOADED_MODELS:
            lru_model = self._model_usage_order.pop(0)
            self.unload(lru_model)

        from app.llm.hf_client import MODEL_MAP
        if model_name not in MODEL_MAP:
            raise ValueError(f"Unknown model name: {model_name}")
            
        filename = MODEL_MAP[model_name]["filename"]
        model_path = self.models_dir / filename
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}. Run download_models.py first.")
            
        logger.info(f"Loading {model_name} into memory (Apple Silicon GPU Enabled)...")
        
        try:
            # On M2 Mac, we want to use Metal (n_gpu_layers=-1)
            # Use mmap=True and mlock=False to let OS manage memory efficiently
            llm = Llama(
                model_path=str(model_path),
                n_ctx=settings.MAX_CONTEXT,
                n_threads=4,               
                n_gpu_layers=-1,           # USE GPU (Metal) on M2 Mac
                use_mlock=False,           
                use_mmap=True,             
                verbose=False
            )
            self._loaded_models[model_name] = llm
            self._model_usage_order.append(model_name)
            logger.info(f"Successfully loaded {model_name} onto GPU.")
            return llm
        except Exception as e:
            logger.error(f"GPU Load failed for {model_name}, falling back to CPU: {e}")
            # Fallback to CPU if Metal fails
            llm = Llama(
                model_path=str(model_path),
                n_ctx=settings.MAX_CONTEXT,
                n_threads=4,
                n_gpu_layers=0,
                verbose=False
            )
            self._loaded_models[model_name] = llm
            self._model_usage_order.append(model_name)
            return llm

    def unload(self, model_name: str) -> None:
        """Unload a model to free memory."""
        if model_name in self._loaded_models:
            logger.info(f"Unloading {model_name} to cool down system...")
            # llama-cpp-python handles some cleanup in __del__
            del self._loaded_models[model_name]
            if model_name in self._model_usage_order:
                self._model_usage_order.remove(model_name)
            
            import gc
            gc.collect()

    def generate(self, model_name: str, prompt: str, max_tokens: Optional[int] = None) -> str:
        """Synchronously generate response via llama.cpp."""
        max_tokens = max_tokens or settings.MAX_TOKENS
        
        # Load (or get from cache)
        llm = self.load(model_name)
        
        stop_tokens = ["<|im_end|>", "</s>", "[INST]", "[/INST]", "User:", "Assistant:"]
        
        try:
            logger.debug(f"Generating from {model_name}...")
            response = llm(
                prompt,
                max_tokens=max_tokens,
                stop=stop_tokens,
                echo=False,
                temperature=0.2 # Lower temperature for better JSON compliance
            )
            
            return response["choices"][0]["text"].strip()
        except Exception as e:
            logger.error(f"Generation error with {model_name}: {e}")
            raise

# Singleton instance for the application
model_loader = ModelLoader()
