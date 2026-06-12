from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from langchain_core.documents import Document
from qdrant_client.models import Filter, FieldCondition, MatchValue, MatchText, OptimizersConfigDiff
import re
import time
import logging
import os
import sqlite3
from langsmith import traceable
from event_scheduling import main

# Define logger for api.py
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/events", tags=["Events"])
async def create_event(request: Request):
    try:
        pass
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))