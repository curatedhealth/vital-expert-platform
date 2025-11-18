#!/usr/bin/env python3
"""
Load Remaining Enhanced Agent Prompts into PROMPTS™ Framework
Skips existing prompts and loads only missing ones
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
print("LOADING REMAINING PROMPTS INTO PROMPTS™ FRAMEWORK")
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

# Helper function to check if prompt exists
def prompt_exists(prompt_code):
    """Check if a prompt with given code already exists"""
    try:
        result = supabase.table('prompts').select('id').eq('prompt_code', prompt_code).execute()
        return len(result.data) > 0
    except:
        return False

# Stats
stats = {
    'system_prompts_loaded': 0,
    'system_prompts_skipped': 0,
    'user_prompts_loaded': 0,
    'user_prompts_skipped': 0,
    'errors': 0
}

print("\n🚀 Processing agents and loading missing prompts...")

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

            # Check if already exists
            if prompt_exists(system_prompt_code):
                print(f"  ⏭️  System prompt already exists: {system_prompt_code}")
                stats['system_prompts_skipped'] += 1
            else:
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

                try:
                    result = supabase.table('prompts').insert(system_data).execute()
                    stats['system_prompts_loaded'] += 1
                    print(f"  ✅ System prompt loaded: {system_prompt_code}")
                except Exception as e:
                    if '23505' in str(e):  # Duplicate key
                        stats['system_prompts_skipped'] += 1
                        print(f"  ⏭️  System prompt already exists: {system_prompt_code}")
                    else:
                        raise e

        # 2. Load Prompt Starters (User Prompts)
        prompt_starters = agent.get('prompt_starters', [])
        for j, starter in enumerate(prompt_starters, 1):
            user_prompt_code = f"USR-{agent_id[:8]}-{j}"

            # Check if already exists
            if prompt_exists(user_prompt_code):
                stats['user_prompts_skipped'] += 1
            else:
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

                try:
                    result = supabase.table('prompts').insert(user_data).execute()
                    stats['user_prompts_loaded'] += 1
                    print(f"  ✅ User starter #{j} loaded: {user_prompt_code}")
                except Exception as e:
                    if '23505' in str(e):  # Duplicate key
                        stats['user_prompts_skipped'] += 1
                    else:
                        raise e

        # Show starters summary for this agent
        loaded_count = sum(1 for j in range(1, len(prompt_starters) + 1) if not prompt_exists(f"USR-{agent_id[:8]}-{j}"))
        print(f"  📊 Starters: {len(prompt_starters)} total, {loaded_count} new")

    except Exception as e:
        print(f"  ❌ Error processing {agent_name}: {e}")
        stats['errors'] += 1
        continue

# Summary
print("\n" + "=" * 80)
print("✅ LOAD COMPLETE")
print("=" * 80)
print(f"\n📊 Statistics:")
print(f"  • System Prompts Loaded: {stats['system_prompts_loaded']}")
print(f"  • System Prompts Skipped (existing): {stats['system_prompts_skipped']}")
print(f"  • User Prompts Loaded: {stats['user_prompts_loaded']}")
print(f"  • User Prompts Skipped (existing): {stats['user_prompts_skipped']}")
print(f"  • Total New Prompts: {stats['system_prompts_loaded'] + stats['user_prompts_loaded']}")
print(f"  • Errors: {stats['errors']}")

# Verify final counts
print("\n🔍 Verifying database counts...")
try:
    total_result = supabase.table('prompts').select('id', count='exact').execute()
    system_result = supabase.table('prompts').select('id', count='exact').eq('role_type', 'system').execute()

    # Count user prompts with pagination
    user_count = 0
    page_size = 500
    offset = 0
    while True:
        user_result = supabase.table('prompts').select('id').eq('role_type', 'user').range(offset, offset + page_size - 1).execute()
        if not user_result.data:
            break
        user_count += len(user_result.data)
        if len(user_result.data) < page_size:
            break
        offset += page_size

    print(f"  • Total prompts in database: {total_result.count}")
    print(f"  • System prompts: {system_result.count}")
    print(f"  • User prompts: {user_count}")
    print(f"  • Expected: 1,595 total (319 system + 1,276 user)")

    if system_result.count == 319 and user_count == 1276:
        print("\n🎉 SUCCESS! All prompts are now loaded correctly!")
    else:
        print(f"\n⚠️  Counts don't match expected values")
        print(f"   Missing system prompts: {319 - system_result.count}")
        print(f"   Missing user prompts: {1276 - user_count}")
except Exception as e:
    print(f"  ❌ Error verifying counts: {e}")

print("\n📝 Next Steps:")
print("  1. Run: python3 scripts/generate_prompt_starter_titles_simple.py (if needed)")
print("  2. Run: python3 scripts/update_all_agents_with_starters.py")
print("  3. Verify all 319 agents have 4 prompt starters each")
