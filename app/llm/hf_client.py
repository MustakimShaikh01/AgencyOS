import os
import aiohttp
import asyncio
from pathlib import Path
import logging
import zipfile
from tqdm import tqdm

from app.config import settings

logger = logging.getLogger(__name__)

# HuggingFace Repo and Filenames for Quantized GGUF Models
MODEL_MAP = {
    "tinyllama": {
        "repo": "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
        "filename": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    },
    "qwen": {
        "repo": "Qwen/Qwen1.5-1.8B-Chat-GGUF",
        "filename": "qwen1_5-1_8b-chat-q4_k_m.gguf"
    },
    "mistral": {
        "repo": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
        "filename": "mistral-7b-instruct-v0.2.Q4_K_M.gguf"
    }
}

async def download_model(model_name: str) -> Path:
    """Download a quantized model from HuggingFace to local STORAGE."""
    if model_name not in MODEL_MAP:
        raise ValueError(f"Model {model_name} not supported.")
        
    model_info = MODEL_MAP[model_name]
    repo, filename = model_info["repo"], model_info["filename"]
    
    # HuggingFace file download URL pattern for GGUFs
    url = f"https://huggingface.co/{repo}/resolve/main/{filename}?download=true"
    
    models_dir = Path(settings.MODEL_DIR)
    models_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = models_dir / filename
    
    # Skip if exists with non-zero size
    if file_path.exists() and file_path.stat().st_size > 1024 * 1024:
        logger.info(f"Model {model_name} already exists at {file_path}")
        return file_path
        
    logger.info(f"Downloading {model_name} from HuggingFace...")
    temp_path = file_path.with_suffix('.gguf.download')
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            response.raise_for_status()
            total_size = int(response.headers.get('content-length', 0))
            
            # Simple progress bar
            with tqdm(total=total_size, unit='iB', unit_scale=True, desc=filename) as pbar:
                with open(temp_path, 'wb') as f:
                    async for chunk in response.content.iter_chunked(1024 * 1024):
                        f.write(chunk)
                        pbar.update(len(chunk))
                        
    # Atomic rename once completed
    os.rename(temp_path, file_path)
    logger.info(f"Successfully downloaded {model_name} to {file_path}")
    return file_path
