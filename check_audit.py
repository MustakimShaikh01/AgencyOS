import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models import AuditLog

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AuditLog).order_by(AuditLog.id.desc()).limit(10))
        for log in result.scalars():
            print(f"[{log.actor}] {log.event_type}: {log.details}")

if __name__ == "__main__":
    asyncio.run(main())
