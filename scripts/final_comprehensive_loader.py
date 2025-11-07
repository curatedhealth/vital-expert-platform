#!/usr/bin/env python3
"""
Final comprehensive agent loader - loads ALL remaining agents
Outputs ready-to-execute SQL that can be copy-pasted
"""
import json

def escape_sql(text):
    if text is None:
        return ''
    return str(text).replace("'", "''")

def generate_sql_for_agent(agent, category_override=None):
    """Generate SQL INSERT for a single agent"""
    name = escape_sql(agent.get('name', ''))
    title = escape_sql(agent.get('display_name', agent.get('title', '')))
    description = escape_sql(agent.get('description', ''))
    category = escape_sql(category_override or agent.get('category', ''))
    model = escape_sql(agent.get('model', 'gpt-4-turbo-preview'))
    
    # Handle system_prompt
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
    
    return f"('{name}', '{title}', '{description}', '{category}', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, true, NOW(), NOW())"

print("="*80)
print("🚀 FINAL COMPREHENSIVE AGENT LOADER")
print("="*80)

# 1. Load remaining 3 Medical Affairs agents
print("\n📁 STEP 1: Medical Affairs (3 remaining agents)")
print("-"*80)

with open('scripts/missing_medical_affairs_3.json', 'r') as f:
    missing_ma = json.load(f)

print(f"Loading {len(missing_ma)} agents...")
for agent in missing_ma:
    print(f"  ✓ {agent['name']}")

sql_ma = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
sql_ma += ",\n".join([generate_sql_for_agent(agent, 'medical_affairs') for agent in missing_ma]) + ";\n"

with open('scripts/FINAL_medical_affairs_3.sql', 'w') as f:
    f.write(sql_ma)
print(f"✅ SQL written to: scripts/FINAL_medical_affairs_3.sql")

# 2. Market Access (all 30 agents)
print("\n📁 STEP 2: Market Access (30 agents)")
print("-"*80)

with open('docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json', 'r') as f:
    market_data = json.load(f)
    market_agents = market_data['agents']

print(f"Loading {len(market_agents)} agents...")
sql_market = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
sql_market += ",\n".join([generate_sql_for_agent(agent, 'market_access') for agent in market_agents]) + ";\n"

with open('scripts/FINAL_market_access_30.sql', 'w') as f:
    f.write(sql_market)
print(f"✅ SQL written to: scripts/FINAL_market_access_30.sql")

# 3. Marketing (4 agents)
print("\n📁 STEP 3: Marketing (4 agents)")
print("-"*80)

with open('docs/MARKETING_AGENTS_30_ENHANCED.json', 'r') as f:
    marketing_data = json.load(f)
    marketing_agents = marketing_data['agents']

print(f"Loading {len(marketing_agents)} agents...")
for agent in marketing_agents:
    print(f"  ✓ {agent['name']}")

sql_marketing = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
sql_marketing += ",\n".join([generate_sql_for_agent(agent, 'marketing') for agent in marketing_agents]) + ";\n"

with open('scripts/FINAL_marketing_4.sql', 'w') as f:
    f.write(sql_marketing)
print(f"✅ SQL written to: scripts/FINAL_marketing_4.sql")

# 4. Remote doctors (3 agents)
print("\n📁 STEP 4: Remote Backup Doctors (3 agents)")
print("-"*80)

with open('database/backups/remote_agents_backup_2025-10-26T07-54-33.json', 'r') as f:
    remote_data = json.load(f)
    remote_agents = remote_data['agents']

print(f"Loading {len(remote_agents)} doctor agents...")
for agent in remote_agents:
    print(f"  ✓ {agent['name']}")

# Remote agents have different structure
values_remote = []
for agent in remote_agents:
    name = escape_sql(agent.get('name', ''))
    title = escape_sql(agent.get('title', ''))
    description = escape_sql(agent.get('description', ''))
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
    
    values_remote.append(f"('{name}', '{title}', '{description}', 'medical_practitioner', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, true, NOW(), NOW())")

sql_remote = "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\nVALUES\n"
sql_remote += ",\n".join(values_remote) + ";\n"

with open('scripts/FINAL_remote_doctors_3.sql', 'w') as f:
    f.write(sql_remote)
print(f"✅ SQL written to: scripts/FINAL_remote_doctors_3.sql")

print("\n" + "="*80)
print("📊 SUMMARY")
print("="*80)
print(f"   Medical Affairs (remaining): 3 agents")
print(f"   Market Access: 30 agents")
print(f"   Marketing: 4 agents")
print(f"   Remote Doctors: 3 agents")
print(f"   TOTAL: 40 agents ready for loading")
print("\n✅ All SQL files generated in scripts/ directory")
print("="*80)

