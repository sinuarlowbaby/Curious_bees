import json
import asyncio
import asyncpg
from pathlib import Path

BASE_DIR = Path(__file__).parent
JSON_FILE = BASE_DIR / "research_dataset_1000_unique.json"
DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/srm_curiousbees_db"

async def main():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Connect to PostgreSQL
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("Connected to PostgreSQL. Creating table if it doesn't exist...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            tag TEXT NOT NULL,
            abstract TEXT NOT NULL,
            date TEXT NOT NULL,
            ts BIGINT NOT NULL
        )
    """)

    print("Clearing old data from posts table...")
    await conn.execute("DELETE FROM posts")

    print(f"Inserting {len(data)} rows into posts...")
    
    # Prepare the data as a list of tuples
    records = [
        (row["title"], row["author"], row["tag"], row["abstract"], row["date"], row["ts"])
        for row in data
    ]

    # Use executemany for fast bulk insertion
    await conn.executemany("""
        INSERT INTO posts (title, author, tag, abstract, date, ts)
        VALUES ($1, $2, $3, $4, $5, $6)
    """, records)

    await conn.close()
    print("Database populated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
