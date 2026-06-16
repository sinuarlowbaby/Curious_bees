import asyncio
import argparse
import os
import sys
import asyncpg
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Read the cleaned URL or strip it dynamically
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/srm_curiousbees_db")
if "?schema=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?schema=")[0]

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION_NAME", "RECOLAB")
EMBEDDING_MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
VECTOR_SIZE = 768

async def get_all_rows():
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch("SELECT * FROM posts ORDER BY id ASC")
    await conn.close()
    return rows

def chunked(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]

async def main():
    parser = argparse.ArgumentParser(description="Sync PostgreSQL posts -> Qdrant")
    parser.add_argument("--dry-run", action="store_true", help="Print rows only, no upload")
    parser.add_argument("--batch", type=int, default=100, metavar="N", help="Batch size (default 100 for fast sync)")
    parser.add_argument("--force-recreate", action="store_true", help="Delete the existing Qdrant collection and re-upload everything")
    args = parser.parse_args()

    print(f"[DB]  Reading from PostgreSQL...")
    rows = await get_all_rows()

    if not rows:
        sys.exit("[i]  No rows found in the posts table. Nothing to sync.")

    print(f"[i]  Found {len(rows)} post(s) in PostgreSQL\n")

    if args.dry_run:
        print("--- DRY RUN ---")
        for row in rows[:5]:
            print(f"  id={row['id']:>4}  title={row['title']!r}")
        print("... (truncated)")
        sys.exit(0)

    print("[*]  Loading embedding model ...")
    from langchain_huggingface import HuggingFaceEmbeddings

    _needs_trust = "nomic" in EMBEDDING_MODEL_NAME
    embedding_model = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"trust_remote_code": True} if _needs_trust else {"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    print(f"[OK] Model ready: {EMBEDDING_MODEL_NAME} ({VECTOR_SIZE}-dim)\n")

    print(f"[*]  Connecting to Qdrant at {QDRANT_URL} ...")
    from qdrant_client import QdrantClient
    from qdrant_client.models import VectorParams, Distance
    from langchain_qdrant import QdrantVectorStore
    from langchain_core.documents import Document

    client = QdrantClient(url=QDRANT_URL)
    existing = [c.name for c in client.get_collections().collections]

    if args.force_recreate and QDRANT_COLLECTION_NAME in existing:
        print(f"  [!] --force-recreate: deleting collection '{QDRANT_COLLECTION_NAME}' ...")
        client.delete_collection(QDRANT_COLLECTION_NAME)
        existing = []

    if QDRANT_COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        print(f"  [+] Created Qdrant collection '{QDRANT_COLLECTION_NAME}' ({VECTOR_SIZE}-dim)")
    else:
        print(f"  [=] Using existing Qdrant collection '{QDRANT_COLLECTION_NAME}'")

    vector_store = QdrantVectorStore(
        client=client,
        embedding=embedding_model,
        collection_name=QDRANT_COLLECTION_NAME,
    )
    print("[OK] Qdrant ready\n")

    print("[*]  Checking for already-indexed posts ...")
    already_indexed = set()
    offset = None
    while True:
        response, offset = client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            limit=256,
            offset=offset,
            with_payload=True,
            with_vectors=False,
        )
        for point in response:
            sid = (point.payload or {}).get("metadata", {}).get("sqlite_id")
            if sid is not None:
                already_indexed.add(int(sid))
        if offset is None:
            break

    new_rows = [r for r in rows if r["id"] not in already_indexed]
    print(f"  Already indexed : {len(already_indexed)} post(s)")
    print(f"  To upload       : {len(new_rows)} post(s)\n")

    if not new_rows:
        print("[OK] Everything is already in sync. Nothing to do.")
        sys.exit(0)

    total = len(new_rows)
    uploaded = 0

    print(f"[^]  Uploading {total} post(s) in batches of {args.batch} ...\n")

    for batch in chunked(new_rows, args.batch):
        docs = []
        for row in batch:
            title = row["title"] or ""
            tag = row["tag"] or ""
            abstract = row["abstract"] or ""

            enriched_content = (
                f"{title}. {title}.\n"
                f"Tags: {tag}.\n"
                f"Abstract: {abstract}"
            )

            docs.append(
                Document(
                    page_content=enriched_content,
                    metadata={
                        "sqlite_id": row["id"],  # Keep the same field name as before so search doesn't break
                        "title": title,
                        "author": row["author"],
                        "tag": tag,
                        "date": row["date"] or "",
                    },
                )
            )

        # Batch insert for speed
        vector_store.add_documents(docs)
        uploaded += len(batch)
        print(f"  [OK] {uploaded}/{total} uploaded")

    print(f"\n[DONE] {uploaded} post(s) synced to Qdrant collection '{QDRANT_COLLECTION_NAME}'.")

if __name__ == "__main__":
    asyncio.run(main())
