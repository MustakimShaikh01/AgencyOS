from pathlib import Path
import logging
from typing import Dict, Optional, Any
from llama_cpp import Llama

from app.config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    """Manages lazy loading and unloading of quantized local logic models (llama.cpp)"""
    
    _loaded_models: Dict[str, Llama] = {}

    def __init__(self):
        self.models_dir = Path(settings.MODEL_DIR)

    def is_loaded(self, model_name: str) -> bool:
        return model_name in self._loaded_models

    def load(self, model_name: str) -> Llama:
        """Loads a model if it isn't currently loaded."""
        if self.is_loaded(model_name):
            return self._loaded_models[model_name]
            
        from app.llm.hf_client import MODEL_MAP
        if model_name not in MODEL_MAP:
            raise ValueError(f"Unknown model name: {model_name}")
            
        filename = MODEL_MAP[model_name]["filename"]
        model_path = self.models_dir / filename
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}. Run download_models.py first.")
            
        logger.info(f"Loading {model_name} into memory from {model_path}...")
        
        try:
            # CPU Optimized generation parameters
            llm = Llama(
                model_path=str(model_path),
                n_ctx=settings.MAX_CONTEXT,
                n_threads=4,               # Ideal for most CPUs
                n_gpu_layers=0,            # Force CPU
                use_mlock=False,           # Don't lock to RAM (saves memory) 
                use_mmap=True,             # Can page from disk
                verbose=False
            )
            self._loaded_models[model_name] = llm
            logger.info(f"Successfully loaded {model_name}.")
            return llm
        except Exception as e:
            logger.error(f"Failed to load {model_name}: {e}")
            raise

    def unload(self, model_name: str) -> None:
        """Unload a model to free memory."""
        if model_name in self._loaded_models:
            logger.info(f"Unloading {model_name} from memory...")
            del self._loaded_models[model_name]
            # Force garbage collection could be added here if needed

    def generate(self, model_name: str, prompt: str, max_tokens: Optional[int] = None) -> str:
        """Synchronously generate response via llama.cpp."""
        max_tokens = max_tokens or settings.MAX_TOKENS
        
        llm = self.load(model_name)
        
        # Determine stops based on model quirks (e.g. ChatML for Qwen, custom blocks for others)
        stop_tokens = ["<|im_end|>", "</s>", "[INST]", "[/INST]", "User:"]
        
        try:
            logger.debug(f"Generating from {model_name}...")
            response = llm(
                prompt,
                max_tokens=max_tokens,
                stop=stop_tokens,
                echo=False,
                temperature=0.7
            )
            
            return response["choices"][0]["text"].strip()
        except Exception as e:
            logger.error(f"Generation error with {model_name}: {e}")
            raise

# Singleton instance for the application
model_loader = ModelLoader()
