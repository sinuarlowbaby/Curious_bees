"""
Calendar persistence: add, update, delete, and semantic search.

All operations go through the SQLite database at ``config.DB_PATH``.
"""

import sqlite3
from config import DB_PATH, similarity_model
from sentence_transformers import util


def init_db() -> None:
    """Create the events table if it does not exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            from_time TEXT,
            to_time TEXT,
            venue TEXT,
            link TEXT,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()


# ---------------------------------------------------------------
# Add
# ---------------------------------------------------------------

def add_event(entry: dict) -> None:
    """Append a new event entry to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO events (title, date, from_time, to_time, venue, link, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        entry["title"],
        entry["date"],
        entry.get("from_time"),
        entry.get("to_time"),
        entry.get("venue"),
        entry.get("link"),
        entry.get("status", "schedule")
    ))
    conn.commit()
    conn.close()
    print(f"  [ADDED]   '{entry['title']}' on {entry['date']}")


# ---------------------------------------------------------------
# Update / delete
# ---------------------------------------------------------------

def update_event(old_entries: list[dict], new_dates: list,
                 from_time, to_time, venue, link=None) -> None:
    """Replace ALL old calendar entries for this event with entries on new dates."""
    # Use the first entry as the template for title/time/venue defaults
    template = old_entries[0]
    title    = template["title"]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop every existing entry for this event title in one pass
    cursor.execute("DELETE FROM events WHERE title = ?", (title,))

    for date in new_dates:
        cursor.execute("""
            INSERT INTO events (title, date, from_time, to_time, venue, link, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            title,
            date,
            from_time or template.get("from_time"),
            to_time   or template.get("to_time"),
            venue     or template.get("venue"),
            link      or template.get("link"),
            "reschedule",
        ))
        old_dates_str = ", ".join(e["date"] for e in old_entries)
        print(f"  [UPDATED] '{title}' — [{old_dates_str}] → {date}")

    conn.commit()
    conn.close()


def delete_event(old_entries: list[dict]) -> None:
    """Remove ALL calendar entries matching this event title."""
    title = old_entries[0]["title"]
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE title = ?", (title,))
    conn.commit()
    conn.close()
    dates_str = ", ".join(e["date"] for e in old_entries)
    print(f"  [DELETED] '{title}' on [{dates_str}]")


# ---------------------------------------------------------------
# Semantic search
# ---------------------------------------------------------------

def find_matching_event(event_name: str, old_dates: list = None,
                        threshold: float = 0.75) -> list[dict]:
    """
    Semantic search over the calendar.

    Returns a list of ALL calendar entries whose title matches event_name above
    the threshold (so multi-day events return one entry per day).  Returns an
    empty list when nothing matches confidently.

    All calendar titles are batch-encoded in a single forward pass.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT title, date, from_time, to_time, venue, link, status FROM events")
    cal = [dict(row) for row in cursor.fetchall()]
    conn.close()

    if not cal:
        return []

    query_emb  = similarity_model.encode(event_name, convert_to_tensor=True)
    title_embs = similarity_model.encode([e["title"] for e in cal], convert_to_tensor=True)
    scores     = util.cos_sim(query_emb, title_embs)[0].tolist()

    best_score, best_title = 0.0, None
    for score, entry in zip(scores, cal):
        boosted = score + (0.15 if old_dates and entry["date"] in old_dates else 0.0)
        if boosted > best_score:
            best_score, best_title = boosted, entry["title"]

    if best_score >= threshold:
        matched = [e for e in cal if e["title"] == best_title]
        print(f"  Similarity score: {best_score:.2f} — matched '{best_title}' "
              f"({len(matched)} entr{'y' if len(matched) == 1 else 'ies'})")
        return matched

    print(f"  Similarity score: {best_score:.2f} — no confident match found")
    return []
