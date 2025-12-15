#!/usr/bin/env python3
"""
Sync Knowledge Domains to Pinecone

Syncs knowledge_domains metadata from Supabase to Pinecone for semantic domain matching.
This is separate from KD-* RAG namespaces which contain document chunks.

Usage:
    cd services/ai-engine
    python ../../database/sync/sync_knowledge_domains_to_pinecone.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load env
load_dotenv(Path(__file__).parent.parent.parent / 'services' / 'ai-engine' / '.env')

from supabase import create_client
from pinecone import Pinecone
from openai import OpenAI

print("=" * 70)
print(" SYNC KNOWLEDGE DOMAINS TO PINECONE")
print(f" {datetime.now().isoformat()}")
print("=" * 70)

# Initialize clients
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)
print("✅ Supabase connected")

pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index(os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge'))
print("✅ Pinecone connected")

openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
print("✅ OpenAI connected")

# Get all knowledge domains
print("\n📥 Loading knowledge_domains from Supabase...")
result = supabase.table('knowledge_domains').select(
    'id, name, slug, description, domain_type, depth_level, domain_path, is_active'
).eq('is_active', True).execute()

domains = result.data
print(f"📊 Total knowledge domains: {len(domains)}")

# Check current state
stats = index.describe_index_stats()
kd_meta_ns = stats.namespaces.get('knowledge-domains', {})
current_count = kd_meta_ns.vector_count if hasattr(kd_meta_ns, 'vector_count') else 0
print(f"📊 Current 'knowledge-domains' namespace: {current_count} vectors")

# Generate embeddings and sync
print("\n📤 Syncing to Pinecone namespace 'knowledge-domains'...")
batch_size = 50
total_synced = 0
errors = []

for i in range(0, len(domains), batch_size):
    batch = domains[i:i+batch_size]
    vectors = []
    texts = []
    valid_domains = []

    for domain in batch:
        # Build embedding text - ensure no None values
        name = domain.get('name') or 'Unknown'
        domain_type = domain.get('domain_type') or ''
        domain_path = domain.get('domain_path') or ''
        description = (domain.get('description') or '')[:500]

        text = f"Knowledge Domain: {name}. Type: {domain_type}. Path: {domain_path}. Description: {description}".strip()

        # Skip empty texts
        if len(text) < 20:
            continue

        texts.append(text)
        valid_domains.append(domain)

    if not texts:
        continue

    try:
        # Generate embeddings
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=texts
        )

        for j, domain in enumerate(valid_domains):
            vectors.append({
                'id': str(domain['id']),
                'values': response.data[j].embedding,
                'metadata': {
                    'name': domain.get('name') or '',
                    'slug': domain.get('slug') or '',
                    'domain_type': domain.get('domain_type') or '',
                    'depth_level': domain.get('depth_level') or 0,
                    'domain_path': domain.get('domain_path') or '',
                    'description': (domain.get('description') or '')[:500],
                    'type': 'knowledge_domain'
                }
            })

        # Upsert to Pinecone
        index.upsert(vectors=vectors, namespace='knowledge-domains')
        total_synced += len(vectors)
        print(f"   ✅ Synced {total_synced}/{len(domains)} domains ({(total_synced/len(domains)*100):.1f}%)")

    except Exception as e:
        errors.append(f"Batch {i}: {str(e)}")
        print(f"   ❌ Error: {str(e)[:50]}")

print("\n" + "=" * 70)
print(" SYNC COMPLETE")
print("=" * 70)
print(f"✅ Total synced: {total_synced}/{len(domains)}")

if errors:
    print(f"⚠️ Errors: {len(errors)}")

# Verify
stats = index.describe_index_stats()
kd_meta_ns = stats.namespaces.get('knowledge-domains', {})
new_count = kd_meta_ns.vector_count if hasattr(kd_meta_ns, 'vector_count') else 0
print(f"\n📊 'knowledge-domains' namespace now has: {new_count} vectors")
