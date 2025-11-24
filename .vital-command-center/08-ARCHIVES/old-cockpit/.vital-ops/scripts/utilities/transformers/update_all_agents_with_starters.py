#!/usr/bin/env python3
"""
Update ALL Agents with Prompt Starters (Complete Version)
Fetches all 1,276 user prompts directly from database and updates all 319 agents
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

print("=" * 80)
print("UPDATING ALL AGENTS WITH PROMPT STARTERS (COMPLETE)")
print("=" * 80)

# Fetch ALL user prompts with proper pagination
print("\n📖 Fetching ALL user prompts from database...")
all_prompts = []
page_size = 500
offset = 0

while True:
    result = supabase.table('prompts') \
        .select('id, name, title, prompt_code, content') \
        .eq('role_type', 'user') \
        .order('name') \
        .range(offset, offset + page_size - 1) \
        .execute()

    if not result.data:
        break

    all_prompts.extend(result.data)
    print(f"  Fetched batch: {len(result.data)} prompts (total so far: {len(all_prompts)})")

    if len(result.data) < page_size:
        break  # Last page

    offset += page_size

print(f"\n✅ Total user prompts fetched: {len(all_prompts)}")

# Group prompts by agent name
print("\n🔄 Grouping prompts by agent...")
agent_starters_map = {}

for prompt in all_prompts:
    # Extract agent name from prompt name (e.g., "HEOR Director - Starter #1")
    if ' - Starter #' in prompt['name']:
        parts = prompt['name'].split(' - Starter #')
        agent_name = parts[0]
        starter_num = int(parts[1])

        if agent_name not in agent_starters_map:
            agent_starters_map[agent_name] = []

        agent_starters_map[agent_name].append({
            'number': starter_num,
            'title': prompt['title'],
            'prompt_id': prompt['id'],
            'prompt_code': prompt['prompt_code']
        })

# Sort starters for each agent
for agent_name in agent_starters_map:
    agent_starters_map[agent_name].sort(key=lambda x: x['number'])

print(f"✅ Grouped into {len(agent_starters_map)} agents")

# Get all agents from database
print("\n📊 Fetching all agents from database...")
all_agents = []
offset = 0

while True:
    result = supabase.table('agents') \
        .select('id, name') \
        .order('name') \
        .range(offset, offset + page_size - 1) \
        .execute()

    if not result.data:
        break

    all_agents.extend(result.data)
    if len(result.data) < page_size:
        break

    offset += page_size

print(f"✅ Found {len(all_agents)} agents in database")

# Update agents
stats = {
    'processed': 0,
    'updated': 0,
    'not_found_in_mapping': 0,
    'errors': 0
}

print("\n🚀 Updating agents with prompt starters...\n")

for agent in all_agents:
    stats['processed'] += 1
    agent_id = agent['id']
    agent_name = agent['name']

    try:
        # Check if we have starters for this agent
        if agent_name in agent_starters_map:
            starters = agent_starters_map[agent_name]

            # Update agent
            supabase.table('agents').update({
                'prompt_starters': starters
            }).eq('id', agent_id).execute()

            print(f"[{stats['processed']}/{len(all_agents)}] ✅ {agent_name} ({len(starters)} starters)")
            stats['updated'] += 1
        else:
            print(f"[{stats['processed']}/{len(all_agents)}] ⚠️  {agent_name} - No starters found in prompts table")
            stats['not_found_in_mapping'] += 1

    except Exception as e:
        print(f"[{stats['processed']}/{len(all_agents)}] ❌ {agent_name} - Error: {e}")
        stats['errors'] += 1

# Summary
print("\n" + "=" * 80)
print("✅ UPDATE COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • Agents in Database: {len(all_agents)}")
print(f"  • Agents with Starters in Prompts Table: {len(agent_starters_map)}")
print(f"  • Agents Processed: {stats['processed']}")
print(f"  • Successfully Updated: {stats['updated']}")
print(f"  • Not Found in Prompts: {stats['not_found_in_mapping']}")
print(f"  • Errors: {stats['errors']}")

success_rate = (stats['updated'] / stats['processed'] * 100) if stats['processed'] > 0 else 0
print(f"  • Success Rate: {success_rate:.1f}%")

if stats['not_found_in_mapping'] > 0:
    print(f"\n⚠️  {stats['not_found_in_mapping']} agents don't have prompt starters in the prompts table")
    print(f"   This could mean those agents weren't in enhanced_agents_gold_standard.json")

print("\n✅ All agents that have prompt starters have been updated!")
