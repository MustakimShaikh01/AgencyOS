from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.db.session import init_db

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up AgencyOS...")
    await init_db()
    yield
    logger.info("Shutting down AgencyOS...")

from fastapi.staticfiles import StaticFiles

from app.api import campaigns, agents, tasks, analytics, websocket, brain, portal, social

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AgencyOS - Autonomous AI Marketing Startup Simulator",
    lifespan=lifespan
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Routers
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(brain.router, prefix="/api/v1")
app.include_router(portal.router, prefix="/api/v1")
app.include_router(social.router, prefix="/api/v1")
app.include_router(websocket.router)

# Serve Frontend static files targeting the root
# IMPORTANT: Routes MUST be declared before mount if they share path overlap,
# but /api and /health are distinct. Still good practice to keep mount last.

@app.get("/api/account/profile/")
async def dummy_profile():
    return {"status": "ok", "user": "Agency Admin"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}

@app.get("/dashboard")
async def dashboard_page():
    from fastapi.responses import FileResponse
    return FileResponse("frontend/dashboard/index.html")

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
