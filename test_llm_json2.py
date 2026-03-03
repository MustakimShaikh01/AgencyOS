import asyncio
import logging
import sys

# Need to properly initialize and run the test. 
from app.db.session import init_db, AsyncSessionLocal
from app.core.orchestrator import orchestrator
from app.db.models import Campaign
from sqlalchemy import select

logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger(__name__)

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
