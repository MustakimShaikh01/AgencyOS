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

@app.get("/")
async def root():
    return {"message": "Welcome to AgencyOS API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}
