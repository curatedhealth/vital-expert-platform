#!/usr/bin/env python3
"""
Import Pharmaceutical-Specific Agents
======================================
Imports Market Access, Medical Affairs, and Marketing agents from JSON files.

Usage:
    python3 import_pharma_specific_agents.py
"""

import json
import sys
import os

# Tenant ID for Pharmaceuticals
PHARMA_TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"

# Database connection
DB_PASSWORD = 'flusd9fqEb4kkTJ1'
DB_HOST = 'db.bomltkhixeatxuoxmolq.supabase.co'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'

def escape_sql_string(value):
    """Escape single quotes in SQL strings"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    import re
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

def load_agents_from_json(filepath: str):
    """Load agents from JSON file"""
    print(f"📖 Loading: {os.path.basename(filepath)}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract agents array from the structure
        agents = data.get('agents', [])
        function_name = data.get('function', 'Unknown')

        print(f"   Function: {function_name}")
        print(f"   Agents: {len(agents)}")
        return agents, function_name
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return [], None
    except Exception as e:
        print(f"❌ Error loading {filepath}: {e}")
        return [], None

def generate_agent_insert_sql(agent, function_name, tenant_id):
    """Generate SQL INSERT for a single agent"""

    # Extract agent fields
    agent_id = agent.get('id', 'unknown')
    name = agent.get('display_name', agent.get('name', 'Unknown Agent'))
    slug = slugify(name)
    description = agent.get('description', '')
    system_prompt = agent.get('system_prompt', '')

    # Handle nested system_prompt structure (for Marketing agents)
    if isinstance(system_prompt, dict):
        system_prompt = system_prompt.get('role', '') + '\n' + system_prompt.get('core_objective', '')

    status = agent.get('status', 'active')
    department = agent.get('department', function_name)

    # Extract capabilities
    capabilities = agent.get('capabilities', [])
    if isinstance(system_prompt, dict) and 'capabilities' in system_prompt:
        capabilities = system_prompt['capabilities']

    # Convert capabilities to PostgreSQL array format
    if capabilities:
        capabilities_str = "ARRAY[" + ", ".join([f"'{escape_sql_string(cap)}'" for cap in capabilities]) + "]"
    else:
        capabilities_str = "ARRAY[]::text[]"

    # Extract tools
    tools = agent.get('tools', [])
    if tools:
        tools_json = json.dumps(tools)
    else:
        tools_json = '[]'

    # Extract metadata
    metadata = agent.get('metadata', {})
    if isinstance(system_prompt, dict):
        # For Marketing agents with nested structure
        metadata.update({
            'tier': agent.get('tier'),
            'priority': agent.get('priority'),
            'model': agent.get('model'),
            'temperature': agent.get('temperature'),
            'max_tokens': agent.get('max_tokens'),
            'architecture_pattern': agent.get('architecture_pattern'),
            'persona': system_prompt.get('persona', {})
        })
    else:
        metadata.update({
            'tier': agent.get('tier'),
            'priority': agent.get('priority'),
            'model': agent.get('model')
        })

    metadata_json = json.dumps(metadata)

    # Generate SQL
    sql = f"""
INSERT INTO agents (
  tenant_id,
  name,
  slug,
  description,
  system_prompt,
  status,
  specializations,
  metadata
) VALUES (
  '{tenant_id}',
  '{escape_sql_string(name)}',
  '{escape_sql_string(slug)}',
  '{escape_sql_string(description)}',
  '{escape_sql_string(system_prompt)}',
  '{status}',
  {capabilities_str},
  '{escape_sql_string(metadata_json)}'::jsonb
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  status = EXCLUDED.status,
  specializations = EXCLUDED.specializations,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
"""
    return sql

def main():
    print("=" * 70)
    print("📦 PHARMACEUTICAL AGENTS IMPORT")
    print("=" * 70)
    print()

    # File paths
    base_path = '/Users/hichamnaim/Downloads/Cursor/VITAL path'
    files = [
        f'{base_path}/docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json',
        f'{base_path}/docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json',
        f'{base_path}/docs/MARKETING_AGENTS_30_ENHANCED.json'
    ]

    all_agents = []

    # Load all agents
    print("STEP 1: Loading Agent Files")
    print("-" * 70)
    for filepath in files:
        agents, function_name = load_agents_from_json(filepath)
        for agent in agents:
            agent['_function'] = function_name
        all_agents.extend(agents)

    print()
    print(f"✅ Total agents loaded: {len(all_agents)}")
    print()

    # Generate SQL
    print("=" * 70)
    print("STEP 2: Generating SQL")
    print("-" * 70)

    sql_statements = ["BEGIN;", ""]

    for i, agent in enumerate(all_agents, 1):
        function_name = agent.get('_function', 'Unknown')
        sql = generate_agent_insert_sql(agent, function_name, PHARMA_TENANT_ID)
        sql_statements.append(f"-- Agent {i}/{len(all_agents)}: {agent.get('display_name', agent.get('name'))}")
        sql_statements.append(sql)

    sql_statements.append("")
    sql_statements.append("COMMIT;")
    sql_statements.append("")
    sql_statements.append(f"-- ✅ Imported {len(all_agents)} pharmaceutical agents")

    # Save SQL file
    output_file = f'{base_path}/scripts/pharma_agents_insert.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))

    print(f"✅ Generated SQL with {len(all_agents)} INSERT statements")
    print(f"📁 Saved to: {output_file}")
    print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("-" * 70)
    print(f"Market Access Agents: ~30")
    print(f"Medical Affairs Agents: ~30")
    print(f"Marketing Agents: ~30")
    print(f"Total: {len(all_agents)} agents")
    print()

    print("=" * 70)
    print("NEXT STEPS")
    print("-" * 70)
    print("1. Review: scripts/pharma_agents_insert.sql")
    print("2. Import via psql:")
    print(f"   PGPASSWORD='{DB_PASSWORD}' psql postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} -f scripts/pharma_agents_insert.sql")
    print()
    print("✅ Script complete!")

if __name__ == '__main__':
    main()
