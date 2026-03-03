from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.db.models import SocialAccount
from app.api.schemas import SocialAccountResponse

router = APIRouter(prefix="/social", tags=["social"])

@router.get("/accounts", response_model=List[SocialAccountResponse])
async def list_social_accounts(db: AsyncSession = Depends(get_db)):
    """List all connected social accounts and their 2FA status."""
    result = await db.execute(select(SocialAccount))
    accounts = result.scalars().all()
    
    # If empty, seed some defaults for demo
    if not accounts:
        defaults = [
            SocialAccount(platform="linkedin", account_name="AgencyOS Corporate", status="connected", two_fa_enabled=1),
            SocialAccount(platform="meta", account_name="Meta Business Suite", status="pending_2fa", two_fa_enabled=1),
            SocialAccount(platform="whatsapp", account_name="WhatsApp Business API", status="disconnected", two_fa_enabled=0)
        ]
        db.add_all(defaults)
        await db.commit()
        result = await db.execute(select(SocialAccount))
        accounts = result.scalars().all()
        
    return accounts

@router.post("/verify/{platform}")
async def verify_2fa(platform: str, db: AsyncSession = Depends(get_db)):
    """Mock verify 2FA for a platform."""
    result = await db.execute(select(SocialAccount).where(SocialAccount.platform == platform))
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.status = "connected"
    account.two_fa_enabled = 1
    await db.commit()
    return {"status": "success", "message": f"{platform.capitalize()} 2FA verified."}
