"""
Assign all available RAG domains to all agents via metadata
"""
import os
import sys
import json
from supabase import create_client, Client

# Load environment from .env.vercel
env_file = '.env.vercel'
with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ[key] = value.strip('"').strip("'")

# Initialize Supabase
url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(url, key)

print("=" * 80)
print("🔍 Fetching all active RAG domains...")
print("=" * 80)

# Get all active domains
domains_response = supabase.table('knowledge_domains').select('*').eq('is_active', True).execute()
domains = domains_response.data

print(f"\n✅ Found {len(domains)} active RAG domains:")
for i, domain in enumerate(domains[:10], 1):
    domain_id = domain.get('domain_id') or domain.get('id')
    print(f"   {i}. {domain['domain_name']}")
if len(domains) > 10:
    print(f"   ... and {len(domains) - 10} more")

domain_names = [d['domain_name'] for d in domains]

print("\n" + "=" * 80)
print("🔍 Fetching all agents...")
print("=" * 80)

# Get all agents
agents_response = supabase.table('agents').select('id, name, metadata').execute()
agents = agents_response.data

print(f"\n✅ Found {len(agents)} agents")

print("\n" + "=" * 80)
print("🔧 Updating agents with all RAG domains...")
print("=" * 80)

updated_count = 0
for agent in agents:
    agent_id = agent['id']
    agent_name = agent.get('name', 'Unknown')
    current_metadata = agent.get('metadata', {}) or {}
    
    # Update metadata with all domain names
    updated_metadata = {
        **current_metadata,
        'rag_domains': domain_names,
        'rag_enabled': True
    }
    
    # Update agent
    update_response = supabase.table('agents').update({
        'metadata': updated_metadata
    }).eq('id', agent_id).execute()
    
    print(f"✅ {agent_name}: {len(domain_names)} RAG domains")
    updated_count += 1

print("\n" + "=" * 80)
print(f"🎉 Successfully updated {updated_count} agents!")
print("=" * 80)
print(f"\n📋 All agents now have access to {len(domain_names)} RAG domains:")
for i, domain in enumerate(domain_names[:10], 1):
    print(f"   {i}. {domain}")
if len(domain_names) > 10:
    print(f"   ... and {len(domain_names) - 10} more")

print("\n✅ Done! All agents can now use all RAG domains for retrieval.")
print("\n💡 The domains are stored in agents.metadata->>'rag_domains'")
