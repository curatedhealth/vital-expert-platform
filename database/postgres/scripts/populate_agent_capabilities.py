#!/usr/bin/env python3
"""
Populate agent_capabilities table with capability assignments for all agents.
Run this after creating the agent_capabilities table in Supabase.

Usage:
    export $(cat ".env.local" | grep -v '^#' | xargs)
    export SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
    python3 database/postgres/scripts/populate_agent_capabilities.py
"""

from supabase import create_client
import os
import uuid
from collections import defaultdict

def main():
    supabase = create_client(
        os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )

    print("=" * 120)
    print("🚀 POPULATING AGENT CAPABILITIES")
    print("=" * 120)

    # Get all capabilities
    capabilities = supabase.table('capabilities').select('id, name, capability_type, maturity_level').execute()
    cap_map = {c['name']: c for c in capabilities.data}
    cap_by_type = defaultdict(list)
    for c in capabilities.data:
        cap_by_type[c.get('capability_type', 'general')].append(c)

    print(f"\n✅ Loaded {len(capabilities.data)} capabilities")

    # Get all agents with their function info
    agents = supabase.table('agents').select(
        'id, name, function_name, agent_level_id'
    ).execute()

    print(f"✅ Loaded {len(agents.data)} agents")

    # Get agent levels
    levels = supabase.table('agent_levels').select('*').execute()
    level_map = {l['id']: l['level_number'] for l in levels.data}

    # Define capability mappings by function
    function_capabilities = {
        'Medical Affairs': [
            ('Scientific & Medical Expertise', True, 'expert'),
            ('Medical Affairs & Scientific Exchange', True, 'expert'),
            ('Communication & Influence', False, 'advanced'),
            ('Stakeholder & Relationship Management', False, 'advanced'),
            ('Regulatory & Compliance', False, 'intermediate'),
        ],
        'Commercial Organization': [
            ('Commercial & Market Excellence', True, 'expert'),
            ('Communication & Influence', True, 'advanced'),
            ('Stakeholder & Relationship Management', False, 'advanced'),
            ('Strategic Thinking & Planning', False, 'intermediate'),
            ('Data Analysis & Insights', False, 'intermediate'),
        ],
        'Market Access': [
            ('Health Economics & Outcomes', True, 'expert'),
            ('Commercial & Market Excellence', False, 'advanced'),
            ('Data Analysis & Insights', True, 'advanced'),
            ('Stakeholder & Relationship Management', False, 'advanced'),
            ('Strategic Thinking & Planning', False, 'intermediate'),
        ],
        'Regulatory Affairs': [
            ('Regulatory & Compliance', True, 'expert'),
            ('Scientific & Medical Expertise', False, 'advanced'),
            ('Document & Content Management', False, 'advanced'),
            ('Project & Program Management', False, 'intermediate'),
            ('Communication & Influence', False, 'intermediate'),
        ],
        'Research & Development (R&D)': [
            ('Scientific & Medical Expertise', True, 'expert'),
            ('Data Analysis & Insights', True, 'advanced'),
            ('Project & Program Management', False, 'advanced'),
            ('Regulatory & Compliance', False, 'intermediate'),
            ('Document & Content Management', False, 'intermediate'),
        ],
        'Manufacturing & Supply Chain': [
            ('Project & Program Management', True, 'expert'),
            ('Regulatory & Compliance', True, 'advanced'),
            ('Data Analysis & Insights', False, 'advanced'),
            ('Strategic Thinking & Planning', False, 'intermediate'),
            ('Leadership & People Management', False, 'intermediate'),
        ],
        'Information Technology (IT) / Digital': [
            ('Software Development & Engineering', True, 'expert'),
            ('Digital Tools & Platforms', True, 'expert'),
            ('AI & Machine Learning', False, 'advanced'),
            ('Data Analysis & Insights', False, 'advanced'),
            ('Project & Program Management', False, 'intermediate'),
        ],
        'Finance & Accounting': [
            ('Data Analysis & Insights', True, 'expert'),
            ('Strategic Thinking & Planning', True, 'advanced'),
            ('Regulatory & Compliance', False, 'advanced'),
            ('Project & Program Management', False, 'intermediate'),
            ('Communication & Influence', False, 'intermediate'),
        ],
        'Human Resources': [
            ('Leadership & People Management', True, 'expert'),
            ('Communication & Influence', True, 'advanced'),
            ('Stakeholder & Relationship Management', False, 'advanced'),
            ('Strategic Thinking & Planning', False, 'intermediate'),
            ('Project & Program Management', False, 'intermediate'),
        ],
        'Legal & Compliance': [
            ('Regulatory & Compliance', True, 'expert'),
            ('Communication & Influence', True, 'advanced'),
            ('Stakeholder & Relationship Management', False, 'advanced'),
            ('Document & Content Management', False, 'intermediate'),
            ('Strategic Thinking & Planning', False, 'intermediate'),
        ],
        # Digital Health functions
        'Product & Technology': [
            ('Software Development & Engineering', True, 'expert'),
            ('Digital Tools & Platforms', True, 'expert'),
            ('AI & Machine Learning', False, 'advanced'),
            ('Project & Program Management', False, 'advanced'),
            ('Data Analysis & Insights', False, 'intermediate'),
        ],
        'Data Science & AI': [
            ('AI & Machine Learning', True, 'expert'),
            ('Data Analysis & Insights', True, 'expert'),
            ('Software Development & Engineering', False, 'advanced'),
            ('Scientific & Medical Expertise', False, 'intermediate'),
            ('Communication & Influence', False, 'intermediate'),
        ],
        'Clinical & Medical': [
            ('Scientific & Medical Expertise', True, 'expert'),
            ('Medical Affairs & Scientific Exchange', True, 'advanced'),
            ('Regulatory & Compliance', False, 'advanced'),
            ('Communication & Influence', False, 'intermediate'),
            ('Stakeholder & Relationship Management', False, 'intermediate'),
        ],
        'Regulatory & Quality': [
            ('Regulatory & Compliance', True, 'expert'),
            ('Scientific & Medical Expertise', False, 'advanced'),
            ('Document & Content Management', False, 'advanced'),
            ('Project & Program Management', False, 'intermediate'),
            ('Communication & Influence', False, 'intermediate'),
        ],
    }

    # Default capabilities for functions not explicitly mapped
    default_capabilities = [
        ('Strategic Thinking & Planning', True, 'intermediate'),
        ('Communication & Influence', False, 'intermediate'),
        ('Project & Program Management', False, 'intermediate'),
        ('Data Analysis & Insights', False, 'beginner'),
        ('Digital Tools & Platforms', False, 'beginner'),
    ]

    # Proficiency score mapping
    proficiency_scores = {
        'beginner': 0.25,
        'intermediate': 0.50,
        'advanced': 0.75,
        'expert': 0.95,
    }

    # Level-based proficiency adjustment
    level_proficiency_boost = {
        1: 0.15,  # L1 Master
        2: 0.10,  # L2 Expert
        3: 0.05,  # L3 Specialist
        4: 0.00,  # L4 Worker
        5: -0.05, # L5 Tool
    }

    # Create agent capability assignments
    print("\n🔧 Creating agent capability assignments...")
    
    assignments = []
    for agent in agents.data:
        func_name = agent.get('function_name', '')
        level_num = level_map.get(agent.get('agent_level_id'), 3)
        
        # Get capabilities for this function
        caps_to_assign = function_capabilities.get(func_name, default_capabilities)
        
        for cap_name, is_primary, base_proficiency in caps_to_assign:
            if cap_name in cap_map:
                cap = cap_map[cap_name]
                
                # Calculate proficiency score with level adjustment
                base_score = proficiency_scores.get(base_proficiency, 0.50)
                level_boost = level_proficiency_boost.get(level_num, 0)
                final_score = min(1.0, max(0.0, base_score + level_boost))
                
                # Determine final proficiency level
                if final_score >= 0.85:
                    final_level = 'expert'
                elif final_score >= 0.65:
                    final_level = 'advanced'
                elif final_score >= 0.35:
                    final_level = 'intermediate'
                else:
                    final_level = 'beginner'
                
                assignments.append({
                    'agent_id': agent['id'],
                    'capability_id': cap['id'],
                    'proficiency_level': final_level,
                    'proficiency_score': round(final_score, 2),
                    'is_primary': is_primary,
                })

    print(f"   Prepared {len(assignments)} assignments")

    # Insert in batches
    batch_size = 100
    inserted = 0
    errors = 0
    
    for i in range(0, len(assignments), batch_size):
        batch = assignments[i:i+batch_size]
        try:
            result = supabase.table('agent_capabilities').insert(batch).execute()
            inserted += len(batch)
            print(f"   Inserted batch {i//batch_size + 1}: {len(batch)} records")
        except Exception as e:
            errors += len(batch)
            if 'duplicate' in str(e).lower():
                print(f"   Batch {i//batch_size + 1}: Duplicates skipped")
            else:
                print(f"   Batch {i//batch_size + 1} error: {str(e)[:60]}")

    print(f"\n✅ Inserted {inserted} agent capability assignments")
    if errors > 0:
        print(f"⚠️ {errors} errors/duplicates")

    # Verify
    print("\n" + "=" * 120)
    print("📊 VERIFICATION")
    print("=" * 120)

    total = supabase.table('agent_capabilities').select('id', count='exact').execute()
    print(f"\nTotal agent_capabilities records: {total.count if hasattr(total, 'count') else len(total.data)}")

    # Sample
    sample = supabase.table('agent_capabilities').select('*').limit(5).execute()
    print("\n📋 Sample records:")
    for rec in sample.data:
        print(f"   Agent: {rec['agent_id'][:8]}... -> Capability: {rec['capability_id'][:8]}... ({rec['proficiency_level']})")


if __name__ == '__main__':
    main()

