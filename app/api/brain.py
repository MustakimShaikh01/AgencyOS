from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.core.knowledge_store import knowledge_store

router = APIRouter(prefix="/brain", tags=["brain"])

@router.get("/entries")
async def get_brain_entries(type: str = None):
    """Retrieve entries from the corporate brain."""
    if type:
        return knowledge_store.get_all_by_type(type)
    return knowledge_store.data.get("entries", [])

@router.get("/search")
async def search_brain(query: str):
    """Search the 'vectorized' corporate brain."""
    return knowledge_store.query(query)

@router.get("/stats")
async def get_brain_stats():
    """Summary of intelligence stored."""
    entries = knowledge_store.data.get("entries", [])
    return {
        "total_knowledge_points": len(entries),
        "research_count": len([e for e in entries if e["type"] == "research"]),
        "drafts_count": len([e for e in entries if e["type"] == "approved_content"]),
        "last_updated": knowledge_store.data.get("last_updated")
    }
