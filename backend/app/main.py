from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1 import auth, chatbot, documents, health, templates
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Powered Legal Document Generator for India",
    description="Project ID: SKIT/AI/2022-2026/19. A native Windows, AI-first legal tech application.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["System"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["AI Chatbot"])

logger.info("Application setup complete. Ready to accept connections.")
