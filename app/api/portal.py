from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter(prefix="/portal", tags=["portal"])

# Real-world published content store
published_works = []

class PublishRequest(BaseModel):
    title: str
    content: str
    actor: str
    campaign_id: Optional[int] = 0

@router.post("/publish")
async def publish_to_portal(req: PublishRequest):
    """Publishes a post to the company's real-world portal."""
    post = {
        "id": len(published_works) + 1,
        "title": req.title,
        "content": req.content,
        "actor": req.actor,
        "campaign_id": req.campaign_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "LIVE"
    }
    published_works.append(post)
    return {"status": "success", "post": post}

@router.get("/feed")
async def get_portal_feed():
    """Returns the live public feed for the company."""
    return published_works[::-1]
