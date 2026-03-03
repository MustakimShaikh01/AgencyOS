import asyncio
import logging
from app.db.session import AsyncSessionLocal, init_db
from app.db.models import Agent
from app.agents import AGENT_REGISTRY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_agents():
    """Seed the database with the initial roster of Agents."""
    logger.info("Starting database seeding...")
    
    # Initialize DB tables if they don't exist
    await init_db()
    
    async with AsyncSessionLocal() as session:
        for name, agent_obj in AGENT_REGISTRY.items():
            # Check if agent already exists
            from sqlalchemy import select
            result = await session.execute(select(Agent).where(Agent.name == name))
            existing = result.scalar_one_or_none()
            
            if not existing:
                logger.info(f"Seeding Agent: {name} (Role: {agent_obj.role}, Level: {agent_obj.authority_level})")
                new_agent = Agent(
                    name=name,
                    role=agent_obj.role,
                    authority_level=agent_obj.authority_level,
                    xp=0,
                    approval_rate=1.0,
                    efficiency_score=1.0,
                    status="active"
                )
                session.add(new_agent)
            else:
                logger.debug(f"Agent {name} already exists. Skipping.")
                
        await session.commit()
        logger.info("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_agents())
