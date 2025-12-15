#!/usr/bin/env python3
"""
Quick Pinecone Sync - Focused sync of agents to Pinecone with progress reporting.
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
print(" QUICK PINECONE SYNC - Agents")
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
print(f"✅ Pinecone connected")

openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
print("✅ OpenAI connected")

# Get all agents
print("\n📥 Loading agents from Supabase...")
all_agents = []
offset = 0
batch_size = 1000

while True:
    result = supabase.table('agents').select(
        'id, name, slug, tagline, description, agent_level_id, function_id, status'
    ).range(offset, offset + batch_size - 1).execute()

    all_agents.extend(result.data)
    print(f"   Loaded {len(all_agents)} agents...")

    if len(result.data) < batch_size:
        break
    offset += batch_size

print(f"\n📊 Total agents to sync: {len(all_agents)}")

# Get agent levels
levels_result = supabase.table('agent_levels').select('id, level_number, name').execute()
levels = {l['id']: l for l in levels_result.data}
print(f"📊 Agent levels: {len(levels)}")

# Get functions
funcs_result = supabase.table('org_functions').select('id, name').execute()
functions = {f['id']: f['name'] for f in funcs_result.data}
print(f"📊 Functions: {len(functions)}")

# Generate embeddings and upsert in batches
print("\n📤 Syncing to Pinecone (this may take several minutes)...")
batch_size = 50  # Smaller batches for progress visibility
total_synced = 0
errors = []

for i in range(0, len(all_agents), batch_size):
    batch = all_agents[i:i+batch_size]
    vectors = []

    # Generate embeddings for batch
    texts = []
    for agent in batch:
        level_info = levels.get(agent.get('agent_level_id'), {})
        func_name = functions.get(agent.get('function_id'), 'Unknown')

        text = f"""
        Agent: {agent.get('name', '')}
        Level: L{level_info.get('level_number', 0)} {level_info.get('name', '')}
        Function: {func_name}
        Tagline: {agent.get('tagline', '') or ''}
        Description: {(agent.get('description', '') or '')[:500]}
        """
        texts.append(text)

    try:
        # Generate embeddings in one API call
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=texts
        )

        for j, agent in enumerate(batch):
            level_info = levels.get(agent.get('agent_level_id'), {})
            func_name = functions.get(agent.get('function_id'), 'Unknown')

            vectors.append({
                'id': str(agent['id']),
                'values': response.data[j].embedding,
                'metadata': {
                    'name': agent.get('name', ''),
                    'slug': agent.get('slug', ''),
                    'level': level_info.get('level_number', 0),
                    'level_name': level_info.get('name', ''),
                    'function': func_name,
                    'tagline': (agent.get('tagline', '') or '')[:500],
                    'type': 'agent'
                }
            })

        # Upsert to Pinecone
        index.upsert(vectors=vectors, namespace='agents')
        total_synced += len(vectors)
        print(f"   ✅ Synced {total_synced}/{len(all_agents)} agents ({(total_synced/len(all_agents)*100):.1f}%)")

    except Exception as e:
        errors.append(f"Batch {i}: {str(e)}")
        print(f"   ❌ Error on batch {i}: {str(e)[:50]}")

print("\n" + "=" * 70)
print(" SYNC COMPLETE")
print("=" * 70)
print(f"✅ Total synced: {total_synced}/{len(all_agents)}")
if errors:
    print(f"⚠️ Errors: {len(errors)}")
    for e in errors[:5]:
        print(f"   - {e}")

# Verify
stats = index.describe_index_stats()
agents_ns = stats.namespaces.get('agents', {})
agent_count = agents_ns.vector_count if hasattr(agents_ns, 'vector_count') else 0
print(f"\n📊 Pinecone 'agents' namespace now has: {agent_count} vectors")
