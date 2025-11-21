#!/usr/bin/env python3
"""
Load enhanced agents from JSON and update database
(Skips GPT-4 generation since it's already complete)
"""

import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def get_or_create_suite(supabase, department: str, tenant_id: str = None) -> str:
    """Get or create a prompt suite for a department"""

    suite_slug = department.lower().replace(' ', '-').replace('&', 'and')
    suite_name = f"{department} Prompts"

    # Try to get existing suite
    result = supabase.table('prompt_suites').select('id').eq('slug', suite_slug).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['id']

    # Create new suite
    suite_data = {
        'name': suite_name,
        'slug': suite_slug,
        'description': f"Prompt collection for {department} agents",
        'category': 'analysis',
        'is_active': True,
        'is_public': True,
        'tags': [department.lower().replace(' ', '-')]
    }

    if tenant_id:
        suite_data['tenant_id'] = tenant_id

    new_suite = supabase.table('prompt_suites').insert(suite_data).execute()

    if new_suite.data and len(new_suite.data) > 0:
        return new_suite.data[0]['id']

    return None

def get_or_create_sub_suite(supabase, suite_id: str, role: str) -> str:
    """Get or create a prompt sub-suite for a role within a suite"""

    sub_suite_slug = role.lower().replace(' ', '-').replace('/', '-')
    sub_suite_name = f"{role} Prompts"

    # Try to get existing sub-suite
    result = supabase.table('prompt_sub_suites').select('id').eq('suite_id', suite_id).eq('slug', sub_suite_slug).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['id']

    # Create new sub-suite
    sub_suite_data = {
        'suite_id': suite_id,
        'name': sub_suite_name,
        'slug': sub_suite_slug,
        'description': f"Prompts specific to {role}",
        'is_active': True
    }

    new_sub_suite = supabase.table('prompt_sub_suites').insert(sub_suite_data).execute()

    if new_sub_suite.data and len(new_sub_suite.data) > 0:
        return new_sub_suite.data[0]['id']

    return None

def main():
    print("=" * 80)
    print("UPDATE DATABASE FROM ENHANCED JSON")
    print("=" * 80)

    # Load enhanced agents
    print("\n[1/3] Loading enhanced agents from JSON...")
    with open('enhanced_agents_gold_standard.json', 'r') as f:
        enhanced_agents = json.load(f)
    print(f"  ✅ Loaded {len(enhanced_agents)} enhanced agents")

    # Load organizational data
    print("\n[2/3] Loading organizational data...")
    with open('agent_organizational_mappings.json', 'r') as f:
        org_list = json.load(f)
        org_data = {item['agent_name']: item for item in org_list}
    print(f"  ✅ Loaded organizational mappings")

    # Update database
    print("\n[3/3] Updating database...")

    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )

    success_count = 0
    error_count = 0
    prompts_created = 0

    for enhanced in enhanced_agents:
        try:
            agent_id = enhanced['id']
            agent_name = enhanced['name']
            tier = enhanced['tier']

            # Get organizational data
            agent_org_data = org_data.get(agent_name, {})
            department = agent_org_data.get('department', 'General')
            role = agent_org_data.get('role', agent_name)

            # Create or get suite and sub-suite
            suite_id = get_or_create_suite(supabase, department)
            sub_suite_id = None

            if suite_id:
                sub_suite_id = get_or_create_sub_suite(supabase, suite_id, role)

            # Create slug
            slug = agent_name.lower().replace(' ', '-').replace('/', '-')

            # 1. Create system prompt
            system_prompt_data = {
                'name': f"{slug}-system-prompt",
                'slug': f"{slug}-system-prompt",
                'description': f"System prompt for {agent_name} ({tier} tier agent)",
                'content': enhanced['system_prompt'],
                'role_type': 'system',
                'category': 'generation',
                'complexity': 'medium' if tier in ['EXPERT', 'SPECIALIST'] else 'low' if tier in ['WORKER', 'TOOL'] else 'high',
                'is_active': True,
                'validation_status': 'validated',
                'tags': [tier.lower(), 'gold-standard', 'auto-generated']
            }

            system_prompt_result = supabase.table('prompts').upsert(
                system_prompt_data,
                on_conflict='slug'
            ).execute()

            if system_prompt_result.data:
                system_prompt_id = system_prompt_result.data[0]['id']
                prompts_created += 1

                # Link to agent
                supabase.table('agent_prompts').upsert({
                    'agent_id': agent_id,
                    'prompt_id': system_prompt_id,
                    'usage_context': 'system_prompt',
                    'is_primary': True,
                    'sort_order': 0
                }, on_conflict='agent_id,prompt_id,usage_context').execute()

                # Link to suite
                if suite_id:
                    try:
                        supabase.table('suite_prompts').insert({
                            'prompt_id': system_prompt_id,
                            'suite_id': suite_id,
                            'sub_suite_id': sub_suite_id,
                            'sort_order': 0
                        }).execute()
                    except:
                        pass  # Already exists

            # 2. Create user prompts (conversation starters)
            for idx, starter in enumerate(enhanced['prompt_starters']):
                user_prompt_data = {
                    'name': f"{slug}-starter-{idx+1}",
                    'slug': f"{slug}-starter-{idx+1}",
                    'description': f"Conversation starter {idx+1} for {agent_name}",
                    'content': starter,
                    'role_type': 'user',
                    'category': 'generation',
                    'complexity': 'medium',
                    'is_active': True,
                    'validation_status': 'validated',
                    'tags': [tier.lower(), 'conversation-starter', 'auto-generated']
                }

                user_prompt_result = supabase.table('prompts').upsert(
                    user_prompt_data,
                    on_conflict='slug'
                ).execute()

                if user_prompt_result.data:
                    user_prompt_id = user_prompt_result.data[0]['id']
                    prompts_created += 1

                    # Link to agent
                    supabase.table('agent_prompts').upsert({
                        'agent_id': agent_id,
                        'prompt_id': user_prompt_id,
                        'usage_context': 'conversation_starter',
                        'is_primary': False,
                        'sort_order': idx + 1
                    }, on_conflict='agent_id,prompt_id,usage_context').execute()

                    # Link to suite
                    if suite_id:
                        try:
                            supabase.table('suite_prompts').insert({
                                'prompt_id': user_prompt_id,
                                'suite_id': suite_id,
                                'sub_suite_id': sub_suite_id,
                                'sort_order': idx + 1
                            }).execute()
                        except:
                            pass  # Already exists

            # 3. Update agent metadata
            supabase.table('agents').update({
                'agent_level': tier,
                'gold_standard_validated': True,
                'updated_at': 'now()'
            }).eq('id', agent_id).execute()

            success_count += 1

            if (success_count % 10 == 0):
                print(f"  Progress: {success_count}/{len(enhanced_agents)} agents...")

        except Exception as e:
            print(f"  ❌ Error updating {enhanced['name']}: {e}")
            error_count += 1

    print(f"\n  ✅ Successfully updated: {success_count} agents")
    print(f"  ✅ Prompts created: {prompts_created}")
    print(f"  ✅ Prompts organized into suites and sub-suites")
    if error_count > 0:
        print(f"  ❌ Errors: {error_count} agents")

    print("\n" + "=" * 80)
    print("✅ DATABASE UPDATE COMPLETE")
    print("=" * 80)
    print(f"\nTotal agents updated: {success_count}")
    print(f"Total prompts created: {prompts_created}")
    print(f"Prompts organized by department and role")

if __name__ == '__main__':
    main()
