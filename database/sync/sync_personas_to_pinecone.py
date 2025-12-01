#!/usr/bin/env python3
"""
VITAL Platform - Persona RAG Integration
=========================================
Syncs persona embeddings to Pinecone for semantic search.

Usage:
    python3 sync_personas_to_pinecone.py
"""

import requests
from pinecone import Pinecone
from datetime import datetime
from typing import List, Dict
import hashlib
import json
import time

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"
PINECONE_INDEX = "vital-knowledge"  # dimension: 3072

# OpenAI for embeddings (optional - can use Anthropic or other)
OPENAI_API_KEY = None  # Set if using OpenAI embeddings

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

# =============================================================================
# EMBEDDING HELPERS
# =============================================================================

def safe_list_to_str(items) -> str:
    """Safely convert list items to string, handling dicts."""
    if not items:
        return ""
    result = []
    for item in items:
        if isinstance(item, str):
            result.append(item)
        elif isinstance(item, dict):
            # Extract name or value from dict
            result.append(str(item.get('name', item.get('value', str(item)))))
        else:
            result.append(str(item))
    return ', '.join(result)

def get_embedding_text(persona: dict) -> str:
    """Create rich text representation for embedding."""
    parts = [
        f"Persona: {persona.get('persona_name', '')}",
        f"Title: {persona.get('title', '')}",
        f"Type: {persona.get('persona_type', '')}",
        f"Department: {persona.get('department', '')}",
        f"Experience: {persona.get('experience_level', '')}",
        f"Geographic Scope: {persona.get('geographic_scope', '')}",
        f"Description: {persona.get('description', '')}",
    ]

    # Add list fields with safe conversion
    if persona.get('goals'):
        goals_str = safe_list_to_str(persona['goals'])
        if goals_str:
            parts.append(f"Goals: {goals_str}")

    if persona.get('challenges'):
        challenges_str = safe_list_to_str(persona['challenges'])
        if challenges_str:
            parts.append(f"Challenges: {challenges_str}")

    if persona.get('motivations'):
        motivations_str = safe_list_to_str(persona['motivations'])
        if motivations_str:
            parts.append(f"Motivations: {motivations_str}")

    if persona.get('frustrations'):
        frustrations_str = safe_list_to_str(persona['frustrations'])
        if frustrations_str:
            parts.append(f"Frustrations: {frustrations_str}")

    if persona.get('daily_activities'):
        activities_str = safe_list_to_str(persona['daily_activities'])
        if activities_str:
            parts.append(f"Daily Activities: {activities_str}")

    if persona.get('tools_used'):
        tools_str = safe_list_to_str(persona['tools_used'])
        if tools_str:
            parts.append(f"Tools: {tools_str}")

    return "\n".join(parts)

def simple_hash_embedding(text: str, dimension: int = 3072) -> List[float]:
    """
    Create a deterministic pseudo-embedding from text hash.
    This is a placeholder - replace with actual embedding model.
    """
    # Hash the text
    hash_bytes = hashlib.sha256(text.encode()).digest()

    # Expand hash to fill dimension
    embedding = []
    for i in range(dimension):
        # Use different parts of text for variation
        seed = hashlib.md5(f"{text}{i}".encode()).digest()
        # Convert bytes to float between -1 and 1
        value = (seed[i % 16] / 128.0) - 1.0
        embedding.append(value)

    # Normalize
    norm = sum(x*x for x in embedding) ** 0.5
    if norm > 0:
        embedding = [x / norm for x in embedding]

    return embedding

def get_openai_embedding(text: str) -> List[float]:
    """Get embedding from OpenAI API (if configured)."""
    if not OPENAI_API_KEY:
        return None

    import openai
    openai.api_key = OPENAI_API_KEY

    response = openai.embeddings.create(
        model="text-embedding-3-large",  # 3072 dimensions
        input=text
    )
    return response.data[0].embedding

# =============================================================================
# SUPABASE HELPERS
# =============================================================================

def fetch_personas() -> List[dict]:
    """Fetch all personas from Supabase."""
    all_records = []
    offset = 0
    batch_size = 1000

    while True:
        url = f"{SUPABASE_URL}/rest/v1/personas?select=*&offset={offset}&limit={batch_size}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            data = resp.json()
            if not data:
                break
            all_records.extend(data)
            offset += batch_size
        else:
            print(f"Error: {resp.text}")
            break

    return all_records

# =============================================================================
# PINECONE SYNC
# =============================================================================

def sync_to_pinecone(personas: List[dict], use_openai: bool = False):
    """Sync personas to Pinecone with embeddings."""
    print(f"\n[2/2] Syncing {len(personas)} personas to Pinecone...")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)

    # Check current stats
    stats = index.describe_index_stats()
    print(f"      Current index stats: {stats.total_vector_count} vectors")

    # Prepare vectors
    vectors_to_upsert = []
    batch_size = 100

    for i, persona in enumerate(personas):
        # Create embedding text
        text = get_embedding_text(persona)

        # Get embedding
        if use_openai and OPENAI_API_KEY:
            embedding = get_openai_embedding(text)
        else:
            embedding = simple_hash_embedding(text)

        # Prepare metadata (Pinecone has metadata size limits)
        metadata = {
            "persona_id": persona.get("id", ""),
            "unique_id": persona.get("unique_id", "")[:50],
            "name": persona.get("persona_name", "")[:100],
            "type": persona.get("persona_type", ""),
            "title": persona.get("title", "")[:100],
            "department": persona.get("department", "")[:50],
            "experience_level": persona.get("experience_level", ""),
            "geographic_scope": persona.get("geographic_scope", ""),
            "source_role_id": persona.get("source_role_id", ""),
            "is_active": persona.get("is_active", True),
        }

        vectors_to_upsert.append({
            "id": f"persona-{persona['id']}",
            "values": embedding,
            "metadata": metadata
        })

        # Upsert in batches
        if len(vectors_to_upsert) >= batch_size:
            index.upsert(vectors=vectors_to_upsert, namespace="personas")
            vectors_to_upsert = []

            if (i + 1) % 500 == 0:
                print(f"      Progress: {i + 1}/{len(personas)}")

    # Final batch
    if vectors_to_upsert:
        index.upsert(vectors=vectors_to_upsert, namespace="personas")

    # Verify
    time.sleep(2)  # Wait for index to update
    stats = index.describe_index_stats()
    personas_count = stats.namespaces.get("personas", {}).get("vector_count", 0)
    print(f"      Personas namespace: {personas_count} vectors")

    return personas_count

def test_search(query: str):
    """Test semantic search on personas."""
    print(f"\n[TEST] Searching for: '{query}'")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)

    # Create query embedding
    query_embedding = simple_hash_embedding(query)

    results = index.query(
        vector=query_embedding,
        top_k=5,
        namespace="personas",
        include_metadata=True
    )

    print("\nTop 5 results:")
    for match in results.matches:
        meta = match.metadata
        print(f"   [{match.score:.3f}] {meta.get('name')} ({meta.get('type')})")
        print(f"            Title: {meta.get('title')}")
        print(f"            Dept: {meta.get('department')}")

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("VITAL Platform - Persona RAG Integration")
    print("=" * 60)
    print(f"\nTarget Index: {PINECONE_INDEX}")
    print(f"Started: {datetime.now().isoformat()}")

    # Fetch personas
    print("\n[1/2] Fetching personas from Supabase...")
    personas = fetch_personas()
    print(f"      Found {len(personas)} personas")

    # Sync to Pinecone
    count = sync_to_pinecone(personas)

    # Summary
    print("\n" + "=" * 60)
    print("SYNC COMPLETE")
    print("=" * 60)
    print(f"\nPersonas synced: {count}")

    # Test search
    test_search("MSL who likes automation")
    test_search("skeptical medical director")
    test_search("medical writer learning AI")

    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
