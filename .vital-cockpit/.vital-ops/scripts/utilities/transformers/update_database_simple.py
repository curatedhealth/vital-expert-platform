#!/usr/bin/env python3
"""
Simple database update without upsert for composite keys
"""

import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def main():
    print("=" * 80)
    print("UPDATE DATABASE - SIMPLE APPROACH")
    print("=" * 80)

    # Load data
    print("\n[1/2] Loading data...")
    with open('enhanced_agents_gold_standard.json', 'r') as f:
        enhanced_agents = json.load(f)
    print(f"  ✅ Loaded {len(enhanced_agents)} enhanced agents")

    # Update database
    print("\n[2/2] Updating database...")

    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )

    success_count = 0
    prompts_created = 0

    for enhanced in enhanced_agents:
        try:
            agent_id = enhanced['id']
            agent_name = enhanced['name']
            tier = enhanced['tier']
            slug = agent_name.lower().replace(' ', '-').replace('/', '-').replace('&', 'and')

            # 1. Create/update system prompt
            system_prompt_data = {
                'name': f"{slug}-system-prompt",
                'slug': f"{slug}-system-prompt",
                'description': f"System prompt for {agent_name} ({tier} tier)",
                'content': enhanced['system_prompt'],
                'role_type': 'system',
                'category': 'generation',
                'is_active': True,
                'tags': [tier.lower(), 'gold-standard']
            }

            # Check if exists
            existing = supabase.table('prompts').select('id').eq('slug', system_prompt_data['slug']).execute()

            if existing.data and len(existing.data) > 0:
                # Update existing
                system_prompt_id = existing.data[0]['id']
                supabase.table('prompts').update(system_prompt_data).eq('id', system_prompt_id).execute()
            else:
                # Insert new
                result = supabase.table('prompts').insert(system_prompt_data).execute()
                system_prompt_id = result.data[0]['id']
                prompts_created += 1

            # Link to agent (check first)
            link_exists = supabase.table('agent_prompts').select('id').eq('agent_id', agent_id).eq('prompt_id', system_prompt_id).eq('usage_context', 'system_prompt').execute()

            if not link_exists.data or len(link_exists.data) == 0:
                supabase.table('agent_prompts').insert({
                    'agent_id': agent_id,
                    'prompt_id': system_prompt_id,
                    'usage_context': 'system_prompt',
                    'is_primary': True,
                    'sort_order': 0
                }).execute()

            # 2. Create conversation starters
            for idx, starter in enumerate(enhanced['prompt_starters']):
                starter_slug = f"{slug}-starter-{idx+1}"
                user_prompt_data = {
                    'name': starter_slug,
                    'slug': starter_slug,
                    'description': f"Starter {idx+1} for {agent_name}",
                    'content': starter,
                    'role_type': 'user',
                    'category': 'generation',
                    'is_active': True,
                    'tags': [tier.lower(), 'conversation-starter']
                }

                # Check if exists
                existing_starter = supabase.table('prompts').select('id').eq('slug', starter_slug).execute()

                if existing_starter.data and len(existing_starter.data) > 0:
                    user_prompt_id = existing_starter.data[0]['id']
                    supabase.table('prompts').update(user_prompt_data).eq('id', user_prompt_id).execute()
                else:
                    result = supabase.table('prompts').insert(user_prompt_data).execute()
                    user_prompt_id = result.data[0]['id']
                    prompts_created += 1

                # Link to agent
                link_exists = supabase.table('agent_prompts').select('id').eq('agent_id', agent_id).eq('prompt_id', user_prompt_id).eq('usage_context', 'conversation_starter').execute()

                if not link_exists.data or len(link_exists.data) == 0:
                    supabase.table('agent_prompts').insert({
                        'agent_id': agent_id,
                        'prompt_id': user_prompt_id,
                        'usage_context': 'conversation_starter',
                        'is_primary': False,
                        'sort_order': idx + 1
                    }).execute()

            # 3. Update agent tier
            supabase.table('agents').update({
                'agent_level': tier,
                'gold_standard_validated': True
            }).eq('id', agent_id).execute()

            success_count += 1

            if success_count % 25 == 0:
                print(f"  Progress: {success_count}/{len(enhanced_agents)}...")

        except Exception as e:
            print(f"  ❌ Error: {agent_name}: {str(e)[:100]}")

    print(f"\n  ✅ Successfully updated: {success_count}/{len(enhanced_agents)} agents")
    print(f"  ✅ Prompts created/updated: {prompts_created}")

    print("\n" + "=" * 80)
    print("✅ COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
