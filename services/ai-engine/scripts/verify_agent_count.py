#!/usr/bin/env python3
"""
Verify Agent Count Across All Systems
Queries Pinecone, Neo4j, and PostgreSQL/Supabase for agent counts
"""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

print("=" * 70)
print("AGENT COUNT VERIFICATION ACROSS ALL SYSTEMS")
print("=" * 70)

# 1. Check Pinecone
print("\n1. PINECONE (Vector Database)")
print("-" * 70)
try:
    from pinecone import Pinecone
    
    api_key = os.getenv('PINECONE_API_KEY')
    if not api_key:
        raise ValueError("PINECONE_API_KEY not set")
    
    pc = Pinecone(api_key=api_key)
    
    # List all indexes
    indexes = [idx.name for idx in pc.list_indexes()]
    print(f"Available indexes: {indexes}")
    
    # Check vital-agents index
    if 'vital-agents' in indexes:
        index = pc.Index('vital-agents')
        stats = index.describe_index_stats()
        print(f"\n✅ vital-agents index found:")
        print(f"   Total vectors: {stats.total_vector_count}")
        print(f"   Dimension: {stats.dimension}")
        
        if hasattr(stats, 'namespaces') and stats.namespaces:
            print(f"   Namespaces ({len(stats.namespaces)}):")
            for ns_name, ns_stats in sorted(stats.namespaces.items(), key=lambda x: x[1].vector_count, reverse=True):
                print(f"     - {ns_name}: {ns_stats.vector_count} vectors")
        else:
            print("   No namespaces found (using default namespace)")
    else:
        print("❌ vital-agents index NOT FOUND")
        print(f"   Available indexes: {indexes}")
        
except Exception as e:
    print(f"❌ Pinecone Error: {e}")

# 2. Check Neo4j
print("\n2. NEO4J (Knowledge Graph)")
print("-" * 70)
try:
    from neo4j import GraphDatabase
    
    uri = os.getenv('NEO4J_URI')
    user = os.getenv('NEO4J_USER')
    password = os.getenv('NEO4J_PASSWORD')
    
    if not all([uri, user, password]):
        raise ValueError("Neo4j credentials not fully configured")
    
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    with driver.session() as session:
        # Count Agent nodes
        result = session.run("MATCH (a:Agent) RETURN count(a) as count")
        agent_count = result.single()['count']
        print(f"✅ Agent nodes: {agent_count}")
        
        if agent_count > 0:
            # Count by level
            result = session.run("""
                MATCH (a:Agent)
                RETURN a.level as level, count(a) as count
                ORDER BY count DESC
            """)
            levels = list(result)
            if levels:
                print(f"   By level:")
                for record in levels[:10]:
                    level = record['level'] or 'unknown'
                    print(f"     - {level}: {record['count']}")
            
            # Count relationships
            result = session.run("""
                MATCH ()-[r]->() 
                RETURN type(r) as rel_type, count(r) as count 
                ORDER BY count DESC 
                LIMIT 5
            """)
            rels = list(result)
            if rels:
                print(f"   Top relationships:")
                for record in rels:
                    print(f"     - {record['rel_type']}: {record['count']}")
        else:
            print("   ⚠️  No agents found in Neo4j")
    
    driver.close()
    
except Exception as e:
    print(f"❌ Neo4j Error: {e}")

# 3. Check Supabase/PostgreSQL
print("\n3. SUPABASE/POSTGRESQL (Primary Database)")
print("-" * 70)
try:
    from supabase import create_client
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
    
    if not all([url, key]):
        raise ValueError("Supabase credentials not configured")
    
    supabase = create_client(url, key)
    
    # Query agents with count
    result = supabase.table('agents').select('*', count='exact').limit(1).execute()
    total_count = result.count
    print(f"✅ Total agents: {total_count}")
    
    if total_count > 0:
        # By status
        result2 = supabase.table('agents').select('status').execute()
        status_counts = {}
        for agent in result2.data:
            status = agent.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        if status_counts:
            print(f"   By status:")
            for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"     - {status}: {count}")
        
        # By tenant
        result3 = supabase.table('agents').select('tenant_id').execute()
        tenant_counts = {}
        for agent in result3.data:
            tenant = str(agent.get('tenant_id', 'unknown'))
            tenant_counts[tenant] = tenant_counts.get(tenant, 0) + 1
        
        if tenant_counts:
            print(f"   By tenant ({len(tenant_counts)} tenants):")
            for tenant, count in sorted(tenant_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                tenant_short = tenant[:36] if len(tenant) > 36 else tenant
                print(f"     - {tenant_short}: {count}")
        
        # By agent level
        result4 = supabase.table('agents').select('agent_level_id, agent_levels(level_name, level_number)').execute()
        level_counts = {}
        for agent in result4.data:
            level_info = agent.get('agent_levels')
            if level_info:
                level_name = level_info.get('level_name', 'unknown')
                level_counts[level_name] = level_counts.get(level_name, 0) + 1
        
        if level_counts:
            print(f"   By level:")
            for level, count in sorted(level_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"     - {level}: {count}")
    else:
        print("   ⚠️  No agents found in PostgreSQL")
    
except Exception as e:
    print(f"❌ Supabase Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)














