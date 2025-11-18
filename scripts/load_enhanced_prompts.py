#!/usr/bin/env python3
"""
Load Enhanced Agent Prompts into PROMPTS™ Framework
Loads 1,595 prompts (319 system + 1,276 user) from enhanced_agents_gold_standard.json
"""

import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

supabase: Client = create_client(url, key)

print("=" * 80)
print("LOADING ENHANCED AGENT PROMPTS INTO PROMPTS™ FRAMEWORK")
print("=" * 80)

# Load enhanced agents
print("\n📖 Loading enhanced_agents_gold_standard.json...")
with open('enhanced_agents_gold_standard.json', 'r') as f:
    agents = json.load(f)

print(f"✅ Loaded {len(agents)} agents")

# Helper function to create slug
def create_slug(text):
    """Create URL-friendly slug from text"""
    slug = text.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

# Helper function to extract tags from prompt
def extract_tags(agent):
    """Extract relevant tags from agent metadata"""
    tags = []

    # Add tier as tag
    if agent.get('tier'):
        tags.append(agent['tier'].lower())

    # Add capabilities as tags
    if agent.get('capabilities'):
        tags.extend([cap.replace('_', '-') for cap in agent['capabilities'][:3]])

    # Add function/category if available
    if agent.get('function'):
        tags.append(agent['function'].lower().replace(' ', '-'))

    return tags[:5]  # Limit to 5 tags

# Stats
stats = {
    'system_prompts': 0,
    'user_prompts': 0,
    'errors': 0,
    'skipped': 0
}

print("\n🚀 Processing agents and loading prompts...")

for i, agent in enumerate(agents, 1):
    agent_id = agent.get('id')
    agent_name = agent.get('name', 'Unknown Agent')

    print(f"\n[{i}/{len(agents)}] Processing: {agent_name}")

    try:
        # Extract metadata
        tier = agent.get('tier', 'INTERMEDIATE')
        complexity_map = {
            'BASIC': 'basic',
            'INTERMEDIATE': 'intermediate',
            'EXPERT': 'advanced',
            'MASTER': 'expert'
        }
        complexity = complexity_map.get(tier, 'intermediate')

        tags = extract_tags(agent)

        # Determine category from agent capabilities or name
        category = 'general'
        if 'clinical' in agent_name.lower() or any('clinical' in c for c in agent.get('capabilities', [])):
            category = 'clinical'
        elif 'regulatory' in agent_name.lower() or any('regulatory' in c for c in agent.get('capabilities', [])):
            category = 'regulatory'
        elif 'heor' in agent_name.lower() or 'health economics' in agent_name.lower():
            category = 'market-access'
        elif 'medical affairs' in agent_name.lower() or 'msl' in agent_name.lower():
            category = 'medical-affairs'

        # 1. Load System Prompt
        system_prompt = agent.get('system_prompt')
        if system_prompt:
            system_prompt_code = f"SYS-{agent_id[:8]}"
            system_slug = f"{create_slug(agent_name)}-system"

            system_data = {
                'prompt_code': system_prompt_code,
                'name': f"{agent_name} - System Prompt",
                'slug': system_slug,
                'title': f"System prompt for {agent_name}",
                'description': f"Enhanced system prompt for {agent_name} agent (Tier: {tier})",
                'content': system_prompt,
                'role_type': 'system',
                'category': category,
                'complexity': complexity,
                'tags': tags,
                'version': '1.0.0',
                'is_active': True
            }

            result = supabase.table('prompts').insert(system_data).execute()
            stats['system_prompts'] += 1
            print(f"  ✅ System prompt loaded: {system_prompt_code}")

        # 2. Load Prompt Starters (User Prompts)
        prompt_starters = agent.get('prompt_starters', [])
        for j, starter in enumerate(prompt_starters, 1):
            user_prompt_code = f"USR-{agent_id[:8]}-{j}"
            user_slug = f"{create_slug(agent_name)}-starter-{j}"

            user_data = {
                'prompt_code': user_prompt_code,
                'name': f"{agent_name} - Starter #{j}",
                'slug': user_slug,
                'title': starter[:100] + '...' if len(starter) > 100 else starter,
                'description': f"Role-specific conversation starter #{j} for {agent_name}",
                'content': starter,
                'role_type': 'user',
                'category': category,
                'complexity': complexity,
                'tags': tags,
                'version': '1.0.0',
                'is_active': True
            }

            result = supabase.table('prompts').insert(user_data).execute()
            stats['user_prompts'] += 1
            print(f"  ✅ User starter #{j} loaded: {user_prompt_code}")

    except Exception as e:
        print(f"  ❌ Error processing {agent_name}: {e}")
        stats['errors'] += 1
        continue

# Summary
print("\n" + "=" * 80)
print("✅ LOAD COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • System Prompts Loaded: {stats['system_prompts']}")
print(f"  • User Prompts Loaded: {stats['user_prompts']}")
print(f"  • Total Prompts: {stats['system_prompts'] + stats['user_prompts']}")
print(f"  • Errors: {stats['errors']}")
print(f"  • Expected Total: 1,595 (319 system + 1,276 user)")

if stats['errors'] > 0:
    print(f"\n⚠️  {stats['errors']} errors occurred during loading")
else:
    print(f"\n🎉 All prompts loaded successfully!")

print("\n📝 Next Steps:")
print("  1. Link prompts to PROMPTS™ suites via suite_prompts table")
print("  2. Add few-shot examples to prompt_examples table")
print("  3. Define variables in prompt_variables table")
