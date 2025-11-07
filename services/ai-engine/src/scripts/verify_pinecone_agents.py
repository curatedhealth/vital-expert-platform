#!/usr/bin/env python3
"""
Verify Pinecone Agents Connection

This script:
1. Connects to Pinecone index "vital-knowledge"
2. Checks "agent" namespace
3. Verifies agents are loaded
4. Shows stats

Usage:
    python scripts/verify_pinecone_agents.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone

# Load environment variables
root_dir = Path(__file__).parent.parent.parent.parent.parent
env_paths = [
    root_dir / '.env.vercel',
    root_dir / '.env.local',
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        break

# Get Pinecone config
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "vital-knowledge")

if not pinecone_api_key:
    print("❌ PINECONE_API_KEY not set")
    print("   Please set PINECONE_API_KEY in .env.vercel or .env.local")
    sys.exit(1)

print(f"🔍 Verifying Pinecone connection...")
print(f"   Index: {pinecone_index_name}")
print(f"   Namespace: agent")
print()

try:
    # Initialize Pinecone
    pc = Pinecone(api_key=pinecone_api_key)
    index = pc.Index(pinecone_index_name)
    
    print(f"✅ Connected to Pinecone index: {pinecone_index_name}")
    
    # Get stats (Pinecone v3 API - namespace is a parameter, not a method)
    try:
        # Try v3 API first (namespace as parameter)
        stats = index.describe_index_stats(namespace='agent')
    except TypeError:
        # Fallback to v2 API (namespace as method)
        try:
            agent_namespace = index.namespace('agent')
            stats = agent_namespace.describe_index_stats()
        except Exception as e:
            print(f"❌ Failed to get stats: {e}")
            sys.exit(1)
    
    print(f"\n📊 Agent Namespace Stats:")
    print(f"   Total Vectors: {stats.get('total_vector_count', 0)}")
    print(f"   Dimension: {stats.get('dimension', 'N/A')}")
    print(f"   Index Fullness: {stats.get('index_fullness', 0):.2%}")
    
    # Query sample
    print(f"\n🔍 Querying sample agents...")
    try:
        # Query with a dummy vector (all zeros)
        dimension = stats.get('dimension') or stats.get('total_vector_count', 0)
        if dimension == 0:
            dimension = 1536  # Default to 1536 for text-embedding-3-small
        dummy_vector = [0.0] * dimension
        
        # Try v3 API first (namespace as parameter)
        try:
            query_result = index.query(
                vector=dummy_vector,
                top_k=5,
                include_metadata=True,
                namespace='agent'
            )
        except TypeError:
            # Fallback to v2 API (namespace as method)
            agent_namespace = index.namespace('agent')
            query_result = agent_namespace.query(
                vector=dummy_vector,
                top_k=5,
                include_metadata=True
            )
        
        if query_result.matches:
            print(f"   ✅ Found {len(query_result.matches)} agents in namespace")
            print(f"\n   Sample agents:")
            for i, match in enumerate(query_result.matches[:3], 1):
                metadata = match.metadata or {}
                print(f"   {i}. {metadata.get('agent_name', 'Unknown')} (ID: {match.id})")
                print(f"      Similarity: {match.score:.4f}")
        else:
            print(f"   ⚠️  No agents found in namespace (may need to sync)")
    except Exception as e:
        print(f"   ⚠️  Query failed: {e}")
    
    print(f"\n✅ Pinecone connection verified!")
    
except Exception as e:
    print(f"❌ Failed to connect to Pinecone: {e}")
    sys.exit(1)

