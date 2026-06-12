"""
Centralized configuration for the email extractor.

Owns:
- .env loading
- IMAP / file-path / sender-list constants
- ML model loaders (GLiNER + SentenceTransformer)
- Shared keyword lists and compiled regexes used across modules

Importing this module triggers model loading and prints a status line.
"""

import os
import re

from dotenv import load_dotenv
from gliner import GLiNER
from sentence_transformers import SentenceTransformer


# ---------------------------------------------------------------
# Environment
# ---------------------------------------------------------------

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)


# ---------------------------------------------------------------
# Mail server & persistence
# ---------------------------------------------------------------

EMAIL_ADDRESS      = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD     = os.getenv("EMAIL_PASSWORD")
IMAP_SERVER        = "imap.gmail.com"
DB_PATH            = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "curious_bees.db"))

AUTHORIZED_SENDERS = {
    "dean@gmail.com",
    "hod@gmail.com",
    "lekhalokare.28@gmail.com",
    "kalyangedela59@gmail.com",
    "sinuarlowbaby.dev@gmail.com",
    }


# ---------------------------------------------------------------
# Model labels
# ---------------------------------------------------------------

GLINER_LABELS = ["event", "date", "time", "venue"]


# ---------------------------------------------------------------
# Keyword lists
# ---------------------------------------------------------------

DEADLINE_KEYWORDS = [
    "deadline", "last date", "register before", "register by",
    "registration closes", "apply before", "apply by", "submit before",
    "submission deadline", "due by", "due date", "closing date",
    "last day to", "must register", "enroll before", "enroll by",
]

VENUE_KEYWORDS = [
    "Hall", "Auditorium", "Seminar Hall", "Conference Hall", "Lab",
    "Laboratory", "Studio", "Room", "Block", "Centre", "Center",
    "Complex", "Ground", "Arena", "Classroom",
]

# Unicode dash variants used by normalize_dashes() and _split_time().
DASH_CHARS = r"[–—―−﹘﹣－]"


# ---------------------------------------------------------------
# Compiled regexes
# ---------------------------------------------------------------

# Greeting stripper — matches Dear/Hi/Hello/.../Respected openings.
GREETING_RE = re.compile(
    r"^(dear\b[^.!?:,\n]*[:.,!]*\s*"
    r"|hi\b[^.!?:,\n]*[:.,!]*\s*"
    r"|hello\b[^.!?:,\n]*[:.,!]*\s*"
    r"|greetings[^.!?:,\n]*[:.,!]*\s*"
    r"|to\s+all\b[^.!?:,\n]*[:.,!]*\s*"
    r"|to\s+whomsoever\b[^.!?:,\n]*[:.,!]*\s*"
    r"|respected\b[^.!?:,\n]*[:.,!]*\s*)+",
    re.IGNORECASE,
)

# Sign-off detector — used to find the cut-point for the main body.
SIGNOFF_RE = re.compile(
    r"\b(thanks\b|thank you\b|with regards\b|best regards\b"
    r"|warm regards\b|regards\b|yours sincerely\b|yours faithfully\b"
    r"|sincerely\b|cheers\b)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------
# Model loaders
# ---------------------------------------------------------------

print("Loading models...")
try:
    gliner_model     = GLiNER.from_pretrained("urchade/gliner_small-v2.1")
except Exception as e:
    print(f"Warning: Online GLiNER load failed ({e}). Loading from local cache...")
    gliner_model     = GLiNER.from_pretrained("urchade/gliner_small-v2.1", local_files_only=True)

try:
    similarity_model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    print(f"Warning: Online SentenceTransformer load failed ({e}). Loading from local cache...")
    similarity_model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
print("Models ready.\n")
