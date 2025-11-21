#!/usr/bin/env python3
"""
Batch load all missing agents into Supabase
"""
import json
import sys

def escape_sql(text):
    """Escape single quotes for SQL"""
    if text is None:
        return ''
    return str(text).replace("'", "''")

def generate_insert_statement(agents, category_override=None):
    """Generate SQL INSERT statement for a batch of agents"""
    values = []
    
    for agent in agents:
        name = escape_sql(agent.get('name', ''))
        title = escape_sql(agent.get('display_name', agent.get('title', '')))
        description = escape_sql(agent.get('description', ''))
        category = escape_sql(category_override or agent.get('category', agent.get('department', '')))
        model = escape_sql(agent.get('model', 'gpt-4-turbo-preview'))
        
        # Get system prompt - handle both string and dict formats
        system_prompt_raw = agent.get('system_prompt', '')
        if isinstance(system_prompt_raw, dict):
            system_prompt = escape_sql(system_prompt_raw.get('role', ''))
        else:
            system_prompt = escape_sql(system_prompt_raw)
        
        # Build metadata JSON
        metadata = {
            'tier': agent.get('tier', 1),
            'priority': agent.get('priority', 50),
            'department': agent.get('department', ''),
            'capabilities': agent.get('capabilities', []),
        }
        
        # Add any additional metadata fields
        if 'metadata' in agent and isinstance(agent['metadata'], dict):
            metadata.update(agent['metadata'])
        
        metadata_json = escape_sql(json.dumps(metadata))
        
        values.append(f"('{name}', '{title}', '{description}', '{category}', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, true, NOW(), NOW())")
    
    if not values:
        return None
        
    sql = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
    sql += ",\n".join(values) + ";"
    
    return sql


def main():
    # Load all agent files
    print("=" * 80)
    print("BATCH AGENT LOADER")
    print("=" * 80)
    
    # Medical Affairs (remaining 20 agents)
    with open('docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json', 'r') as f:
        medical_data = json.load(f)
        medical_agents = medical_data['agents'][10:]  # Skip first 10 (already loaded)
        
    print(f"\n📁 Medical Affairs (Batch 2): {len(medical_agents)} agents")
    if medical_agents:
        sql = generate_insert_statement(medical_agents, 'medical_affairs')
        with open('scripts/sql_batch_medical_2.sql', 'w') as f:
            f.write(sql)
        print(f"   ✅ Generated: scripts/sql_batch_medical_2.sql")
    
    # Market Access (all 30 agents)
    with open('docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json', 'r') as f:
        market_data = json.load(f)
        market_agents = market_data['agents']
        
    # Split into 3 batches of 10
    print(f"\n📁 Market Access: {len(market_agents)} agents (3 batches)")
    for i in range(0, len(market_agents), 10):
        batch = market_agents[i:i+10]
        batch_num = (i // 10) + 1
        sql = generate_insert_statement(batch, 'market_access')
        with open(f'scripts/sql_batch_market_{batch_num}.sql', 'w') as f:
            f.write(sql)
        print(f"   ✅ Batch {batch_num}: {len(batch)} agents -> scripts/sql_batch_market_{batch_num}.sql")
    
    # Marketing (all 4 agents)
    with open('docs/MARKETING_AGENTS_30_ENHANCED.json', 'r') as f:
        marketing_data = json.load(f)
        marketing_agents = marketing_data['agents']
        
    print(f"\n📁 Marketing: {len(marketing_agents)} agents")
    if marketing_agents:
        sql = generate_insert_statement(marketing_agents, 'marketing')
        with open('scripts/sql_batch_marketing.sql', 'w') as f:
            f.write(sql)
        print(f"   ✅ Generated: scripts/sql_batch_marketing.sql")
    
    # Remote Backup (3 doctor agents)
    with open('database/backups/remote_agents_backup_2025-10-26T07-54-33.json', 'r') as f:
        remote_data = json.load(f)
        remote_agents = remote_data['agents']
        
    print(f"\n📁 Remote Backup: {len(remote_agents)} agents")
    if remote_agents:
        # These need special handling - different structure
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
        
        sql = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
        sql += ",\n".join(values) + ";"
        
        with open('scripts/sql_batch_remote.sql', 'w') as f:
            f.write(sql)
        print(f"   ✅ Generated: scripts/sql_batch_remote.sql")
    
    print("\n" + "=" * 80)
    print("✅ SQL FILES GENERATED - Ready for execution")
    print("=" * 80)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

