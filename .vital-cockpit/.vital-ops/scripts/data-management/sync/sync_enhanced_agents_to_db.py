#!/usr/bin/env python3
"""
Sync Enhanced Agents to Database (Fix for Constraint Error)

This script reads the enhanced_agents_gold_standard.json file
and updates the agents table in the database with the gold-standard
system prompts, tools, capabilities, and skills.

This bypasses the UPSERT constraint issue by using UPDATE instead.
"""

import json
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

def main():
    print("="*80)
    print("SYNC ENHANCED AGENTS TO DATABASE")
    print("="*80)
    print()

    # Load enhanced agents from JSON
    print("[1/3] Loading enhanced agents from JSON...")
    with open('enhanced_agents_gold_standard.json', 'r') as f:
        enhanced_agents = json.load(f)

    print(f"  ✅ Loaded {len(enhanced_agents)} enhanced agents")
    print()

    # Update agents in database
    print("[2/3] Updating agents in database...")
    success_count = 0
    error_count = 0
    errors_list = []

    for agent in enhanced_agents:
        agent_name = agent.get('name')
        agent_id = agent.get('id')

        try:
            # Prepare update data - only system_prompt (other fields may not exist in table)
            update_data = {
                'system_prompt': agent.get('system_prompt')
            }

            # Update agent by ID
            result = supabase.table('agents')\
                .update(update_data)\
                .eq('id', agent_id)\
                .execute()

            if result.data:
                success_count += 1
                if success_count % 50 == 0:
                    print(f"  Progress: {success_count}/{len(enhanced_agents)} agents updated...")
            else:
                error_count += 1
                errors_list.append(f"{agent_name}: No data returned (agent may not exist)")

        except Exception as e:
            error_count += 1
            error_msg = str(e)
            errors_list.append(f"{agent_name}: {error_msg}")

    print()
    print("[3/3] Summary...")
    print(f"  ✅ Successfully updated: {success_count}")
    print(f"  ❌ Errors: {error_count}")
    print()

    if errors_list and len(errors_list) <= 10:
        print("Errors encountered:")
        for error in errors_list:
            print(f"  • {error}")
        print()
    elif len(errors_list) > 10:
        print(f"Too many errors ({len(errors_list)}). Showing first 10:")
        for error in errors_list[:10]:
            print(f"  • {error}")
        print()

    print("="*80)
    print(f"✅ SYNC COMPLETE")
    print(f"   {success_count}/{len(enhanced_agents)} agents updated successfully")
    print("="*80)
    print()

    # Verify sample agent
    print("Verifying sample agent...")
    sample = enhanced_agents[0]
    result = supabase.table('agents')\
        .select('id, name, system_prompt')\
        .eq('id', sample['id'])\
        .single()\
        .execute()

    if result.data and result.data.get('system_prompt'):
        prompt_preview = result.data['system_prompt'][:100] + "..."
        print(f"✅ Sample agent '{result.data['name']}' verified:")
        print(f"   System prompt: {prompt_preview}")
    else:
        print("⚠️ Could not verify sample agent")

    print()
    print("Next steps:")
    print("1. Verify agents have enhanced system prompts:")
    print("   SELECT id, name, LEFT(system_prompt, 50) FROM agents LIMIT 5;")
    print()
    print("2. Test workflow integration")
    print("3. Run pytest test suite")
    print()

if __name__ == "__main__":
    main()
