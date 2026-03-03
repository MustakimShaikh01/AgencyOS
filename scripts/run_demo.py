import asyncio
import logging
from pprint import pprint

from app.db.session import init_db
from scripts.seed_db import seed_agents
from app.db.models import Campaign
from app.api.schemas import CampaignCreate
from app.core.orchestrator import orchestrator
from app.db.session import AsyncSessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Runs a full CLI demo end-to-end to verify business rules."""
    print("=" * 60)
    print(" 🚀 STARTING AGENCY-OS CLI RUN 🚀")
    print("=" * 60)
    
    # 1. Initialize
    await init_db()
    await seed_agents()
    
    print("\n--- Creating Dummy Campaign ---")
    mock_campaign = CampaignCreate(
        name="Winter Tech Sale 2026",
        brand_guidelines="Tone: Professional, urgent. Keywords: sale, discount, limited time. Avoid: cheap, free.",
        workflow_type="content_campaign",
        total_budget=500.0
    )
    
    async with AsyncSessionLocal() as session:
        campaign = Campaign(
            name=mock_campaign.name,
            brand_guidelines=mock_campaign.brand_guidelines,
            workflow_type=mock_campaign.workflow_type,
            total_budget=mock_campaign.total_budget,
            status="draft"
        )
        session.add(campaign)
        await session.commit()
        await session.refresh(campaign)
        campaign_id = campaign.id
    
    print(f"Created Campaign #{campaign_id}: {mock_campaign.name}")
    print("\n--- Handing over to Orchestrator Engine ---")
    
    try:
        # 2. Run
        await orchestrator.run_campaign(campaign_id)
        print("\n✅ Demo run successfully completed.")
    except Exception as e:
        print(f"\n❌ Pipeline stopped/failed: {e}")
        
    # Print status output
    async with AsyncSessionLocal() as session:
        completed = await session.get(Campaign, campaign_id)
        print("Final State: ", completed.status.upper())
        
if __name__ == "__main__":
    asyncio.run(main())
