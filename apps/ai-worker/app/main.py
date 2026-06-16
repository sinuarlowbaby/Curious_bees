import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
import logging
import asyncpg
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore

QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION_NAME")

ALLOWED_ORIGINS = ["http://localhost:8000", "http://localhost:3000"]

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

import sys
from apscheduler.schedulers.background import BackgroundScheduler

# Ensure event_scheduling directory is in path so absolute imports within it resolve correctly
_base_dir = os.path.dirname(os.path.abspath(__file__))
_event_scheduling_path = os.path.join(_base_dir, "event_scheduling")
if _event_scheduling_path not in sys.path:
    sys.path.append(_event_scheduling_path)

from event_scheduling.check_email import check_unread_emails

@asynccontextmanager
async def lifespan(app:FastAPI):
    try:
        app.state.client = QdrantClient(url=QDRANT_URL)
        
        existing_collections = [c.name for c in app.state.client.get_collections().collections]
        if QDRANT_COLLECTION_NAME not in existing_collections:
            app.state.client.create_collection(
                collection_name=QDRANT_COLLECTION_NAME,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
            )
            logger.info(f"Created Qdrant collection '{QDRANT_COLLECTION_NAME}'")
    #     app.state.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

        app.state.embedding_model = HuggingFaceEmbeddings(
            model_name="nomic-ai/nomic-embed-text-v1.5",  # 768-dim, 547MB
            model_kwargs={"trust_remote_code": True},
            encode_kwargs={"normalize_embeddings": True}   # required for cosine similarity
        )

        # Initialize once at startup — not per-request
        app.state.vector_store = QdrantVectorStore(
            client=app.state.client,
            embedding=app.state.embedding_model,
            collection_name=QDRANT_COLLECTION_NAME,
        )

        db_url = os.environ.get("DATABASE_URL")
        if db_url and "?schema=" in db_url:
            db_url = db_url.split("?schema=")[0]
        app.state.db_pool = await asyncpg.create_pool(db_url)
        app.state.sessions = {}

        # ── PostgreSQL Setup ──────────────────────────────────────────
        async with app.state.db_pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id        SERIAL PRIMARY KEY,
                    title     TEXT    NOT NULL,
                    author    TEXT    NOT NULL DEFAULT 'Anonymous',
                    tag       TEXT    NOT NULL DEFAULT 'Research',
                    abstract  TEXT,
                    date      TEXT,
                    ts        BIGINT  NOT NULL
                )
            """)
        logger.info(f"PostgreSQL posts table ready")

        logger.info("Server is ready!")
    except Exception as e:
        logger.error(f"Error initializing Server: {e}")
        raise e

    logger.info("FastAPI server is ready!")
    logger.info("Swagger UI  ->  http://localhost:8000/docs")
    logger.info("Home Page   ->  http://localhost:8000")

    # Start the scheduler
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(check_unread_emails, "interval", minutes=1, id="email_check_job")
    scheduler.start()
    app.state.scheduler = scheduler
    logger.info("APScheduler: started email polling background job (runs every 1 minutes)")

    yield  # App handles requests here

    logger.info("Shutting down server...")
    if hasattr(app.state, "scheduler") and app.state.scheduler:
        app.state.scheduler.shutdown(wait=False)
        logger.info("APScheduler: shut down background scheduler")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
jinja2_env = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

from routes.semantic_search import router as semantic_search_router
from routes.event_scheduling import router as event_scheduling_router

app.include_router(semantic_search_router)
app.include_router(event_scheduling_router)


@app.get("/")
async def root(request: Request):
    return jinja2_env.TemplateResponse(request=request, name="research_platform.html", )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_config=None, log_level="info")
