"""
Announcements persistence.

Announcements are independent of the calendar — they capture notices,
cancellations, and reschedule notices that should appear in a feed
without driving calendar mutations.
"""

import datetime
import re
import sqlite3

from config import DB_PATH


def init_db() -> None:
    """Create the announcements table if it does not exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            received_on TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


init_db()


def save_announcement(sender_email: str, subject: str, description: str) -> None:
    """Append an announcement entry to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO announcements (sender, subject, description, received_on)
        VALUES (?, ?, ?, ?)
    """, (
        sender_email,
        re.sub(r"[\r\n\t]+", " ", subject).strip(),
        description,
        datetime.date.today().strftime("%Y-%m-%d")
    ))
    conn.commit()
    conn.close()
    print(f"  [SAVED]   Announcement stored in database.")
