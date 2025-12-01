#!/usr/bin/env python3
"""
VITAL Platform - Agent Registry to Pinecone Migration
======================================================
Migrates all agents from Supabase to ont-agents namespace in vital-knowledge.

Usage:
    python3 sync_agents_to_pinecone.py
"""

import requests
from pinecone import Pinecone
from datetime import datetime
from typing import List, Dict
import hashlib
import time

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

PINECONE_API_KEY = "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi"
PINECONE_INDEX = "vital-knowledge"
NAMESPACE = "ont-agents"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

# =============================================================================
# EMBEDDING HELPERS
# =============================================================================

def get_agent_embedding_text(agent: dict) -> str:
    """Create rich text representation for agent embedding."""
    parts = [
        f"Agent: {agent.get('name', '')}",
        f"Title: {agent.get('title', '')}",
        f"Tagline: {agent.get('tagline', '')}",
        f"Description: {agent.get('description', '')}",
        f"Function: {agent.get('function_name', '')}",
        f"Department: {agent.get('department_name', '')}",
        f"Role: {agent.get('role_name', '')}",
        f"Expertise: {agent.get('expertise_level', '')}",
        f"Experience: {agent.get('years_of_experience', '')} years",
        f"Geographic Scope: {agent.get('geographic_scope', '')}",
        f"Industry: {agent.get('industry_specialization', '')}",
        f"Communication Style: {agent.get('communication_style', '')}",
    ]

    # Add system prompt summary (first 500 chars)
    system_prompt = agent.get('system_prompt', '')
    if system_prompt:
        parts.append(f"Capabilities: {system_prompt[:500]}")

    return "\n".join(parts)

def simple_hash_embedding(text: str, dimension: int = 3072) -> List[float]:
    """
    Create a deterministic pseudo-embedding from text hash.
    NOTE: Replace with actual embedding model (text-embedding-3-large) for production.
    """
    embedding = []
    for i in range(dimension):
        seed = hashlib.md5(f"{text}{i}".encode()).digest()
        value = (seed[i % 16] / 128.0) - 1.0
        embedding.append(value)

    # Normalize
    norm = sum(x*x for x in embedding) ** 0.5
    if norm > 0:
        embedding = [x / norm for x in embedding]

    return embedding

# =============================================================================
# DATA FETCHING
# =============================================================================

def fetch_agents() -> List[dict]:
    """Fetch all agents from Supabase."""
    all_records = []
    offset = 0
    batch_size = 1000

    while True:
        url = f"{SUPABASE_URL}/rest/v1/agents?select=*&offset={offset}&limit={batch_size}"
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

def sync_agents_to_pinecone(agents: List[dict]) -> int:
    """Sync agents to Pinecone ont-agents namespace."""
    print(f"\n[2/3] Syncing {len(agents)} agents to Pinecone...")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)

    # Check current stats
    stats = index.describe_index_stats()
    current_count = stats.namespaces.get(NAMESPACE, {}).get("vector_count", 0)
    print(f"      Current {NAMESPACE} count: {current_count}")

    # Prepare vectors
    vectors_to_upsert = []
    batch_size = 100

    for i, agent in enumerate(agents):
        # Skip agents without ID
        if not agent.get('id'):
            continue

        # Create embedding text
        text = get_agent_embedding_text(agent)

        # Get embedding (hash-based placeholder)
        embedding = simple_hash_embedding(text)

        # Prepare metadata (Pinecone has 40KB metadata limit)
        metadata = {
            "agent_id": agent.get("id", ""),
            "name": (agent.get("name") or "")[:100],
            "slug": (agent.get("slug") or "")[:100],
            "title": (agent.get("title") or "")[:100],
            "tagline": (agent.get("tagline") or "")[:200],
            "role_id": agent.get("role_id") or "",
            "role_name": (agent.get("role_name") or "")[:100],
            "function_id": agent.get("function_id") or "",
            "function_name": (agent.get("function_name") or "")[:100],
            "department_id": agent.get("department_id") or "",
            "department_name": (agent.get("department_name") or "")[:100],
            "expertise_level": agent.get("expertise_level") or "",
            "years_of_experience": agent.get("years_of_experience") or 0,
            "geographic_scope": agent.get("geographic_scope") or "",
            "communication_style": agent.get("communication_style") or "",
            "base_model": agent.get("base_model") or "",
            "status": agent.get("status") or "",
            "is_active": agent.get("status") == "active",
        }

        vectors_to_upsert.append({
            "id": f"agent-{agent['id']}",
            "values": embedding,
            "metadata": metadata
        })

        # Upsert in batches
        if len(vectors_to_upsert) >= batch_size:
            index.upsert(vectors=vectors_to_upsert, namespace=NAMESPACE)
            vectors_to_upsert = []

            if (i + 1) % 500 == 0:
                print(f"      Progress: {i + 1}/{len(agents)}")

    # Final batch
    if vectors_to_upsert:
        index.upsert(vectors=vectors_to_upsert, namespace=NAMESPACE)

    # Verify
    time.sleep(2)
    stats = index.describe_index_stats()
    final_count = stats.namespaces.get(NAMESPACE, {}).get("vector_count", 0)
    print(f"      Final {NAMESPACE} count: {final_count}")

    return final_count

def test_agent_search(query: str):
    """Test semantic search on agents."""
    print(f"\n[TEST] Searching for: '{query}'")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX)

    query_embedding = simple_hash_embedding(query)

    results = index.query(
        vector=query_embedding,
        top_k=5,
        namespace=NAMESPACE,
        include_metadata=True
    )

    print("\nTop 5 agents:")
    for match in results.matches:
        meta = match.metadata
        print(f"   [{match.score:.3f}] {meta.get('name')}")
        print(f"            Role: {meta.get('role_name')}")
        print(f"            Dept: {meta.get('department_name')}")

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("VITAL Platform - Agent Registry Migration")
    print("=" * 60)
    print(f"\nTarget: {PINECONE_INDEX}/{NAMESPACE}")
    print(f"Started: {datetime.now().isoformat()}")

    # Fetch agents
    print("\n[1/3] Fetching agents from Supabase...")
    agents = fetch_agents()
    print(f"      Found {len(agents)} agents")

    # Filter active agents only (optional)
    active_agents = [a for a in agents if a.get('status') == 'active']
    print(f"      Active agents: {len(active_agents)}")

    # Sync all agents (including inactive for completeness)
    final_count = sync_agents_to_pinecone(agents)

    # Summary
    print("\n" + "=" * 60)
    print("MIGRATION COMPLETE")
    print("=" * 60)
    print(f"\nAgents migrated: {final_count}")
    print(f"Namespace: {NAMESPACE}")

    # Test searches
    print("\n[3/3] Testing search...")
    test_agent_search("MSL field medical science liaison")
    test_agent_search("regulatory affairs submissions")
    test_agent_search("commercial sales manager")

    print(f"\nCompleted: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
