import os
import re

class SimpleRAGEngine:
    """Simulates a RAG database dynamically retrieving market trends based on Campaign name keywords."""
    
    def __init__(self):
        self.data_path = "data/market_trends.txt"
        self.chunks = []
        self._load_data()
        
    def _load_data(self) -> None:
        """Parses the text file into semantic chunks."""
        if not os.path.exists(self.data_path):
            return
            
        with open(self.data_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Split by markdown headers
            sections = re.split(r'\n## ', content)
            for section in sections:
                if section.strip() and not section.startswith("# Market Trends"):
                    self.chunks.append(section.strip())
                    
    def retrieve_trends(self, query: str, top_k: int = 2) -> str:
        """Simple TF-IDF / Keyword heuristic simulation."""
        if not self.chunks:
            return "No market data available."
            
        # Very simple keyword overlap scoring
        query_words = set(re.findall(r'\w+', query.lower()))
        scored_chunks = []
        
        for chunk in self.chunks:
            chunk_words = set(re.findall(r'\w+', chunk.lower()))
            # Boost score based on intersection length
            score = len(query_words.intersection(chunk_words))
            scored_chunks.append((score, chunk))
            
        # Sort by score, return top matching paragraphs
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in scored_chunks[:top_k]]
        
        # Format for pure string injection 
        return "\n\n".join(top_chunks)

# Singleton instance
rag_engine = SimpleRAGEngine()
