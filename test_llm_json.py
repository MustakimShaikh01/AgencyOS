import asyncio
from app.db.session import init_db, AsyncSessionLocal
from app.core.orchestrator import orchestrator
from app.db.models import Campaign
from sqlalchemy import select
import logging
import sys

# Setup stdout logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

async def main():
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Campaign).order_by(Campaign.id.desc()).limit(1))
            campaign = result.scalar_one_or_none()
                
            if campaign:
                print(f"Testing execution on campaign {campaign.id}")
                await orchestrator.run_campaign(campaign.id)
            else:
                print("No campaign found.")
    except Exception as e:
        print(f"CAUGHT ERROR: {e}")

asyncio.run(main())
