#!/usr/bin/env python3
"""
Update ALL Agents with Prompt Starters (Direct Query Method)
Queries each agent's prompts directly by prompt_code instead of bulk fetching
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
print("UPDATING ALL AGENTS WITH PROMPT STARTERS (DIRECT QUERY METHOD)")
print("=" * 80)

# Load all agents from JSON
print("\n📖 Loading enhanced_agents_gold_standard.json...")
with open('enhanced_agents_gold_standard.json', 'r') as f:
    agents = json.load(f)

print(f"✅ Loaded {len(agents)} agents from JSON")

# Get all agents from database
print("\n📊 Fetching all agents from database...")
all_agents = []
offset = 0
page_size = 500

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

# Create a map of agent names to IDs from JSON
json_agent_map = {}
for agent in agents:
    json_agent_map[agent['name']] = agent['id']

# Update agents
stats = {
    'processed': 0,
    'updated': 0,
    'not_in_json': 0,
    'no_prompts_found': 0,
    'errors': 0
}

print("\n🚀 Updating agents with prompt starters...\\n")

for agent in all_agents:
    stats['processed'] += 1
    agent_id_db = agent['id']
    agent_name = agent['name']

    try:
        # Check if agent exists in JSON
        if agent_name not in json_agent_map:
            print(f"[{stats['processed']}/{len(all_agents)}] ⚠️  {agent_name} - Not in JSON file")
            stats['not_in_json'] += 1
            continue

        # Get agent ID from JSON (this has the prompts)
        agent_id_json = json_agent_map[agent_name]

        # Query each starter directly by prompt_code
        starters = []
        for j in range(1, 5):
            user_prompt_code = f"USR-{agent_id_json[:8]}-{j}"

            result = supabase.table('prompts') \
                .select('id, title, prompt_code') \
                .eq('prompt_code', user_prompt_code) \
                .execute()

            if result.data and len(result.data) > 0:
                prompt = result.data[0]
                starters.append({
                    'number': j,
                    'title': prompt['title'] or f"Starter {j}",
                    'prompt_id': prompt['id'],
                    'prompt_code': prompt['prompt_code']
                })

        # Update agent only if we found all 4 starters
        if len(starters) == 4:
            supabase.table('agents').update({
                'prompt_starters': starters
            }).eq('id', agent_id_db).execute()

            print(f"[{stats['processed']}/{len(all_agents)}] ✅ {agent_name} ({len(starters)} starters)")
            stats['updated'] += 1
        else:
            print(f"[{stats['processed']}/{len(all_agents)}] ⚠️  {agent_name} - Only found {len(starters)}/4 starters")
            stats['no_prompts_found'] += 1

    except Exception as e:
        print(f"[{stats['processed']}/{len(all_agents)}] ❌ {agent_name} - Error: {e}")
        stats['errors'] += 1

# Summary
print("\n" + "=" * 80)
print("✅ UPDATE COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • Agents in Database: {len(all_agents)}")
print(f"  • Agents Processed: {stats['processed']}")
print(f"  • Successfully Updated: {stats['updated']}")
print(f"  • Not in JSON file: {stats['not_in_json']}")
print(f"  • No prompts found: {stats['no_prompts_found']}")
print(f"  • Errors: {stats['errors']}")

success_rate = (stats['updated'] / stats['processed'] * 100) if stats['processed'] > 0 else 0
print(f"  • Success Rate: {success_rate:.1f}%")

if stats['updated'] == len(all_agents):
    print("\n🎉 SUCCESS! All 319 agents now have 4 prompt starters!")
else:
    print(f"\n⚠️  {len(all_agents) - stats['updated']} agents still need prompt starters")

print("\n✅ All agents that have prompt starters have been updated!")
