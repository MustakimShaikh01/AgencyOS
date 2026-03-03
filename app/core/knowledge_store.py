import json
import os
from datetime import datetime
from typing import List, Dict, Any

class KnowledgeStore:
    """
    Manages persistent storage of agent work, research, and campaign outcomes.
    Simulates a 'Corporate Brain' that grows over time.
    """
    def __init__(self, storage_path: str = "data/corporate_brain.json"):
        self.storage_path = storage_path
        self._ensure_storage()
        self.data = self._load()

    def _ensure_storage(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, "w") as f:
                json.dump({"entries": [], "last_updated": datetime.utcnow().isoformat()}, f)

    def _load(self) -> Dict[str, Any]:
        try:
            with open(self.storage_path, "r") as f:
                return json.load(f)
        except Exception:
            return {"entries": [], "last_updated": datetime.utcnow().isoformat()}

    def _save(self):
        self.data["last_updated"] = datetime.utcnow().isoformat()
        with open(self.storage_path, "w") as f:
            json.dump(self.data, f, indent=4)

    def add_entry(self, entry_type: str, actor: str, content: Any, metadata: Dict[str, Any] = None):
        """Adds a new piece of intelligence to the corporate brain."""
        new_entry = {
            "id": len(self.data["entries"]) + 1,
            "timestamp": datetime.utcnow().isoformat(),
            "type": entry_type, # e.g., 'research', 'approved_content', 'campaign_summary'
            "actor": actor,
            "content": content,
            "metadata": metadata or {}
        }
        self.data["entries"].append(new_entry)
        self._save()

    def query(self, search_term: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieves relevant past work based on simple keyword matching (Simulation of Vector Search)."""
        if not search_term:
            return []
            
        search_words = set(search_term.lower().split())
        scored_entries = []
        
        for entry in self.data["entries"]:
            content_str = str(entry["content"]).lower()
            metadata_str = str(entry["metadata"]).lower()
            
            # Simple keyword overlap scoring
            score = sum(1 for word in search_words if word in content_str or word in metadata_str)
            if score > 0:
                scored_entries.append((score, entry))
                
        scored_entries.sort(key=lambda x: x[0], reverse=True)
        return [e[1] for e in scored_entries[:top_k]]

    def get_all_by_type(self, entry_type: str) -> List[Dict[str, Any]]:
        return [e for e in self.data["entries"] if e["type"] == entry_type]

knowledge_store = KnowledgeStore()
