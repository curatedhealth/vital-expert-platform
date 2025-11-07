#!/usr/bin/env python3
"""
Load Registry 250 agents into Supabase with 'development' status
"""
import json
import sys

def escape_sql(text):
    """Escape single quotes for SQL"""
    if text is None:
        return ''
    return str(text).replace("'", "''")

def generate_agent_insert(agent, batch_num, agent_num):
    """Generate SQL INSERT for a single agent with development status"""
    name = escape_sql(agent.get('name', ''))
    
    # Use display_name or name as title
    title = escape_sql(agent.get('display_name', agent.get('name', '')))
    
    description = escape_sql(agent.get('description', ''))
    
    # Get category from business_function
    category = escape_sql(agent.get('business_function', 'general'))
    
    # Get model, default to gpt-4o-mini from the registry
    model = escape_sql(agent.get('model', 'gpt-4o-mini'))
    
    # Get system_prompt
    system_prompt = escape_sql(agent.get('system_prompt', ''))
    
    # Build comprehensive metadata
    metadata = {
        'tier': agent.get('tier', 1),
        'priority': agent.get('priority', 50),
        'role': agent.get('role', 'specialist'),
        'domain_expertise': agent.get('domain_expertise', ''),
        'capabilities': agent.get('capabilities', []),
        'knowledge_domains': agent.get('knowledge_domains', []),
        'competency_levels': agent.get('competency_levels', {}),
        'business_function': agent.get('business_function', ''),
        'rag_enabled': agent.get('rag_enabled', False),
        'context_window': agent.get('context_window', 8000),
        'source': 'vital_agents_registry_250',
        'batch': batch_num,
        'agent_number': agent_num
    }
    
    # Add temperature and max_tokens if present
    if 'temperature' in agent:
        metadata['temperature'] = agent['temperature']
    if 'max_tokens' in agent:
        metadata['max_tokens'] = agent['max_tokens']
    
    metadata_json = escape_sql(json.dumps(metadata))
    
    # IMPORTANT: Set status to 'development' and is_active to false
    return f"('{name}', '{title}', '{description}', '{category}', '{model}', '{system_prompt}', '{metadata_json}'::jsonb, false, NOW(), NOW())"

def main():
    print("="*80)
    print("🚀 LOADING REGISTRY 250 AGENTS (DEVELOPMENT STATUS)")
    print("="*80)
    
    # Load the registry
    with open('archive/data/vital_agents_registry_250_complete.json', 'r') as f:
        registry_data = json.load(f)
    
    agents = registry_data['agents']
    total_agents = len(agents)
    
    print(f"\n📊 Registry Info:")
    print(f"   Total Agents: {total_agents}")
    print(f"   Generated: {registry_data['metadata']['generated_date']}")
    print(f"   Compliance: {', '.join(registry_data['metadata']['compliance_frameworks'][:3])}")
    
    # Split into batches of 25 agents each
    batch_size = 25
    num_batches = (total_agents + batch_size - 1) // batch_size
    
    print(f"\n📦 Creating {num_batches} batches of up to {batch_size} agents each")
    print(f"   All agents will be tagged as 'development' status")
    
    # Generate SQL for each batch
    for batch_idx in range(num_batches):
        start_idx = batch_idx * batch_size
        end_idx = min(start_idx + batch_size, total_agents)
        batch_agents = agents[start_idx:end_idx]
        
        batch_num = batch_idx + 1
        
        # Generate SQL
        sql_header = "-- Registry 250 Batch {}/{}\n".format(batch_num, num_batches)
        sql_header += "-- Agents {}-{} of {}\n".format(start_idx + 1, end_idx, total_agents)
        sql_header += "-- Status: DEVELOPMENT (is_active=false)\n\n"
        sql_header += "INSERT INTO agents (name, title, description, category, model, system_prompt, metadata, is_active, created_at, updated_at)\n"
        sql_header += "VALUES\n"
        
        values = []
        for i, agent in enumerate(batch_agents):
            agent_num = start_idx + i + 1
            values.append(generate_agent_insert(agent, batch_num, agent_num))
        
        sql = sql_header + ",\n".join(values) + ";"
        
        # Save to file
        output_file = f'scripts/registry_250_batch_{batch_num:02d}_of_{num_batches}.sql'
        with open(output_file, 'w') as f:
            f.write(sql)
        
        print(f"   ✅ Batch {batch_num:2d}: Agents {start_idx+1:3d}-{end_idx:3d} → {output_file}")
    
    # Create a master loading script
    master_script = "#!/bin/bash\n"
    master_script += "# Master script to load all Registry 250 agents\n"
    master_script += "# All agents tagged as 'development' status\n\n"
    master_script += "echo '🚀 Loading Registry 250 agents into Supabase...'\n"
    master_script += "echo '   Status: DEVELOPMENT (is_active=false)'\n"
    master_script += "echo ''\n\n"
    
    for batch_idx in range(num_batches):
        batch_num = batch_idx + 1
        master_script += f"echo 'Loading Batch {batch_num}/{num_batches}...'\n"
        master_script += f"# Execute: registry_250_batch_{batch_num:02d}_of_{num_batches}.sql\n\n"
    
    master_script += "echo ''\n"
    master_script += "echo '✅ All batches generated!'\n"
    master_script += f"echo 'Total: {total_agents} agents in {num_batches} batches'\n"
    
    with open('scripts/load_registry_250_master.sh', 'w') as f:
        f.write(master_script)
    
    print(f"\n✅ Master script: scripts/load_registry_250_master.sh")
    
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"   Total Agents: {total_agents}")
    print(f"   Batches Created: {num_batches}")
    print(f"   Batch Size: {batch_size} agents/batch")
    print(f"   Status: DEVELOPMENT (is_active=false)")
    print(f"   Tagged: All agents tagged with 'source: vital_agents_registry_250'")
    print("="*80)
    
    # Generate summary of agent types
    print("\n📋 Agent Breakdown by Business Function:")
    business_functions = {}
    for agent in agents:
        bf = agent.get('business_function', 'unknown')
        business_functions[bf] = business_functions.get(bf, 0) + 1
    
    for bf, count in sorted(business_functions.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"   {bf}: {count} agents")
    
    print("\n✅ Ready to load! Execute batches using Supabase MCP tool")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

