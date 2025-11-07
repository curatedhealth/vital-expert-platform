#!/usr/bin/env python3
"""
Load all remaining agents from JSON files directly into Supabase using apply_migration
"""
import json
import sys
import os

def escape_sql(text):
    """Escape single quotes for SQL"""
    if text is None:
        return ''
    return str(text).replace("'", "''")

def load_and_insert_agents_from_file(file_path, category_override, migration_name):
    """Load agents from JSON and create migration SQL"""
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    agents = data.get('agents', [])
    
    if not agents:
        return None, 0
    
    values = []
    for agent in agents:
        name = escape_sql(agent.get('name', ''))
        title = escape_sql(agent.get('display_name', agent.get('title', '')))
        description = escape_sql(agent.get('description', ''))
        category = escape_sql(category_override or agent.get('category', ''))
        model = escape_sql(agent.get('model', 'gpt-4-turbo-preview'))
        
        # Handle system_prompt (can be string or dict)
        system_prompt_raw = agent.get('system_prompt', '')
        if isinstance(system_prompt_raw, dict):
            system_prompt = escape_sql(system_prompt_raw.get('role', ''))
        else:
            system_prompt = escape_sql(system_prompt_raw)
        
        # Build metadata
        metadata = {
            'tier': agent.get('tier', 1),
            'priority': agent.get('priority', 50),
            'department': agent.get('department', ''),
            'capabilities': agent.get('capabilities', []),
        }
        
        if 'metadata' in agent and isinstance(agent['metadata'], dict):
            metadata.update(agent['metadata'])
        
        metadata_json = escape_sql(json.dumps(metadata))
        
        values.append(f"('{name}', '{title}', '{description}', '{category}', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, true, NOW(), NOW())")
    
    if not values:
        return None, 0
    
    sql = f"-- Migration: {migration_name}\n"
    sql += f"-- Loading {len(values)} agents from {os.path.basename(file_path)}\n\n"
    sql += "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
    sql += ",\n".join(values) + ";"
    
    return sql, len(values)

def main():
    print("\n" + "="*80)
    print("🚀 GENERATING MIGRATION SQL FOR ALL AGENTS")
    print("="*80)
    
    migrations_to_generate = [
        ('docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json', 'medical_affairs', 'load_medical_affairs_agents'),
        ('docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json', 'market_access', 'load_market_access_agents'),
        ('docs/MARKETING_AGENTS_30_ENHANCED.json', 'marketing', 'load_marketing_agents'),
    ]
    
    total_agents_count = 0
    
    for file_path, category, migration_name in migrations_to_generate:
        sql, count = load_and_insert_agents_from_file(file_path, category, migration_name)
        
        if sql:
            output_file = f'scripts/migration_{migration_name}.sql'
            with open(output_file, 'w') as f:
                f.write(sql)
            
            print(f"\n✅ {migration_name}")
            print(f"   Agents: {count}")
            print(f"   File: {output_file}")
            total_agents_count += count
    
    # Handle remote backup separately (different structure)
    with open('database/backups/remote_agents_backup_2025-10-26T07-54-33.json', 'r') as f:
        remote_data = json.load(f)
        remote_agents = remote_data['agents']
    
    values = []
    for agent in remote_agents:
        name = escape_sql(agent.get('name', ''))
        title = escape_sql(agent.get('title', ''))
        description = escape_sql(agent.get('description', ''))
        category = 'medical_practitioner'
        model = escape_sql(agent.get('model', 'gpt-4'))
        system_prompt = escape_sql(agent.get('system_prompt', ''))
        
        metadata = {
            'expertise': agent.get('expertise', []),
            'specialties': agent.get('specialties', []),
            'background': agent.get('background', ''),
            'personality_traits': agent.get('personality_traits', []),
            'communication_style': agent.get('communication_style', ''),
            'board_certified': agent.get('metadata', {}).get('board_certified', False),
            'years_experience': agent.get('metadata', {}).get('years_experience', 0),
        }
        metadata_json = escape_sql(json.dumps(metadata))
        
        values.append(f"('{name}', '{title}', '{description}', '{category}', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, true, NOW(), NOW())")
    
    sql = f"-- Migration: load_remote_doctor_agents\n"
    sql += f"-- Loading {len(values)} doctor agents\n\n"
    sql += "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
    sql += ",\n".join(values) + ";"
    
    with open('scripts/migration_load_remote_doctor_agents.sql', 'w') as f:
        f.write(sql)
    
    print(f"\n✅ load_remote_doctor_agents")
    print(f"   Agents: {len(values)}")
    print(f"   File: scripts/migration_load_remote_doctor_agents.sql")
    total_agents_count += len(values)
    
    print("\n" + "="*80)
    print(f"📊 TOTAL: {total_agents_count} agents ready for migration")
    print("="*80)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

