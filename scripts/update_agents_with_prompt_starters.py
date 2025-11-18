#!/usr/bin/env python3
"""
Update Agents Table with Prompt Starter Titles and IDs
Reads from agent_prompt_starters_mapping.json and updates agents table
"""

import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("=" * 80)
print("UPDATING AGENTS TABLE WITH PROMPT STARTERS")
print("=" * 80)

# Load the mapping file
print("\n📖 Loading agent_prompt_starters_mapping.json...")
with open('agent_prompt_starters_mapping.json', 'r') as f:
    mapping = json.load(f)

print(f"✅ Loaded mappings for {len(mapping)} agents")

# First, check if agents table has the necessary columns
print("\n🔍 Checking agents table schema...")
try:
    sample_agent = supabase.table('agents').select('*').limit(1).execute()
    if sample_agent.data:
        columns = list(sample_agent.data[0].keys())
        print(f"✅ Agents table has {len(columns)} columns")

        # Check for prompt starter columns
        required_cols = [
            'prompt_starters'  # We'll store as JSONB array
        ]

        existing_cols = [col for col in required_cols if col in columns]
        print(f"   Found existing columns: {existing_cols}")
except Exception as e:
    print(f"⚠️  Could not check schema: {e}")

# Stats
stats = {
    'processed': 0,
    'updated': 0,
    'not_found': 0,
    'errors': 0
}

print("\n🚀 Updating agents with prompt starters...\n")

for agent_name, starters in mapping.items():
    stats['processed'] += 1

    try:
        # Prepare prompt starters data as JSONB array
        prompt_starters_data = [
            {
                'number': starter['starter_number'],
                'title': starter['short_title'],
                'prompt_id': starter['prompt_id'],
                'prompt_code': starter['prompt_code']
            }
            for starter in starters[:4]  # Ensure only 4 starters
        ]

        # Try to find agent by exact name match
        agent_result = supabase.table('agents').select('id, name').eq('name', agent_name).execute()

        if not agent_result.data:
            # Try case-insensitive match
            agent_result = supabase.table('agents').select('id, name').ilike('name', agent_name).execute()

        if agent_result.data:
            agent_id = agent_result.data[0]['id']

            # Update agent with prompt starters
            update_result = supabase.table('agents').update({
                'prompt_starters': prompt_starters_data
            }).eq('id', agent_id).execute()

            print(f"[{stats['processed']}/{len(mapping)}] ✅ {agent_name}")
            print(f"    Updated with {len(prompt_starters_data)} starters")
            stats['updated'] += 1
        else:
            print(f"[{stats['processed']}/{len(mapping)}] ⚠️  {agent_name} - NOT FOUND in agents table")
            stats['not_found'] += 1

    except Exception as e:
        print(f"[{stats['processed']}/{len(mapping)}] ❌ {agent_name} - Error: {e}")
        stats['errors'] += 1

# Summary
print("\n" + "=" * 80)
print("✅ UPDATE COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • Agents Processed: {stats['processed']}")
print(f"  • Successfully Updated: {stats['updated']}")
print(f"  • Not Found in DB: {stats['not_found']}")
print(f"  • Errors: {stats['errors']}")

success_rate = (stats['updated'] / stats['processed'] * 100) if stats['processed'] > 0 else 0
print(f"  • Success Rate: {success_rate:.1f}%")

if stats['not_found'] > 0:
    print(f"\n⚠️  {stats['not_found']} agents from mapping not found in database")
    print(f"   This is normal if agent names don't match exactly")

print(f"\n📝 Next Steps:")
print(f"  1. Query an agent to verify: SELECT prompt_starters FROM agents WHERE name = 'HEOR Director'")
print(f"  2. Frontend can now display: agent.prompt_starters[0].title")
print(f"  3. On click, fetch full prompt: supabase.table('prompts').select('content').eq('id', starter.prompt_id)")

print("\n🎯 Example Query:")
print("""
# Get agent with prompt starters
agent = supabase.table('agents').select('name, prompt_starters').eq('name', 'HEOR Director').single()

# Display in UI
for starter in agent['prompt_starters']:
    print(f"{starter['number']}. {starter['title']}")

# On user click
full_prompt = supabase.table('prompts').select('content').eq('id', starter['prompt_id']).single()
""")
