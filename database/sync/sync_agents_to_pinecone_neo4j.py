#!/usr/bin/env python3
"""
Sync Agents to Pinecone (Vector DB) and Neo4j (Graph DB)

This script synchronizes all agents from Supabase to:
1. Pinecone - For semantic search via embeddings
2. Neo4j - For graph-based agent discovery and relationships

Based on LangChain DeepAgents architecture:
https://docs.langchain.com/oss/python/deepagents/overview

Usage:
    python database/sync/sync_agents_to_pinecone_neo4j.py

Environment Variables Required:
    - NEXT_PUBLIC_SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    - PINECONE_API_KEY
    - PINECONE_INDEX_NAME (default: vital-knowledge)
    - NEO4J_URI
    - NEO4J_USER
    - NEO4J_PASSWORD
    - OPENAI_API_KEY (for embeddings)
"""

import os
import sys
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime
import json

# Load environment variables (prefer .env.local over .env)
from dotenv import load_dotenv
from pathlib import Path

# Load from services/ai-engine/.env
env_path = Path(__file__).parent.parent.parent / 'services' / 'ai-engine' / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")
else:
    load_dotenv()
    print(f"⚠️ Using default .env (no services/ai-engine/.env found)")

# Supabase
from supabase import create_client, Client

# Pinecone
try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    print("⚠️ Pinecone not installed. Run: pip install pinecone-client")

# Neo4j
try:
    from neo4j import AsyncGraphDatabase, AsyncDriver
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    print("⚠️ Neo4j not installed. Run: pip install neo4j")

# OpenAI for embeddings
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI not installed. Run: pip install openai")


class AgentSyncService:
    """Service to sync agents from Supabase to Pinecone and Neo4j"""
    
    def __init__(self):
        # Initialize Supabase
        self.supabase: Client = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        # Initialize Pinecone
        self.pinecone = None
        self.pinecone_index = None
        if PINECONE_AVAILABLE and os.getenv('PINECONE_API_KEY'):
            self.pinecone = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
            index_name = os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge')
            try:
                self.pinecone_index = self.pinecone.Index(index_name)
                print(f"✅ Pinecone connected (index: {index_name})")
            except Exception as e:
                print(f"⚠️ Pinecone index error: {e}")
        
        # Neo4j driver (initialized async)
        self.neo4j_driver: Optional[AsyncDriver] = None
        
        # OpenAI for embeddings
        self.openai = None
        if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
            self.openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            print("✅ OpenAI client initialized")
    
    async def connect_neo4j(self):
        """Connect to Neo4j"""
        if not NEO4J_AVAILABLE:
            return
        
        uri = os.getenv('NEO4J_URI')
        user = os.getenv('NEO4J_USER', 'neo4j')
        password = os.getenv('NEO4J_PASSWORD')
        
        if not uri or not password:
            print("⚠️ NEO4J_URI or NEO4J_PASSWORD not set")
            return
        
        try:
            self.neo4j_driver = AsyncGraphDatabase.driver(
                uri,
                auth=(user, password),
                max_connection_pool_size=50
            )
            await self.neo4j_driver.verify_connectivity()
            print(f"✅ Neo4j connected ({uri})")
        except Exception as e:
            print(f"⚠️ Neo4j connection error: {e}")
    
    async def close(self):
        """Close all connections"""
        if self.neo4j_driver:
            await self.neo4j_driver.close()
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI (3072 dimensions for text-embedding-3-large)"""
        if not self.openai:
            return []
        
        try:
            response = self.openai.embeddings.create(
                model="text-embedding-3-large",  # 3072 dimensions to match Pinecone index
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"⚠️ Embedding error: {e}")
            return []
    
    def get_all_agents(self) -> List[Dict]:
        """Get all agents from Supabase with pagination"""
        all_agents = []
        offset = 0
        batch_size = 1000
        
        while True:
            response = self.supabase.table('agents').select(
                'id, name, slug, tagline, description, agent_level_id, '
                'function_id, department_id, role_id, tenant_id, status'
            ).range(offset, offset + batch_size - 1).execute()
            
            all_agents.extend(response.data)
            
            if len(response.data) < batch_size:
                break
            offset += batch_size
        
        return all_agents
    
    def get_agent_levels(self) -> Dict[str, Dict]:
        """Get agent levels mapping"""
        response = self.supabase.table('agent_levels').select('id, level_number, name').execute()
        return {l['id']: l for l in response.data}
    
    def get_functions(self) -> Dict[str, str]:
        """Get functions mapping"""
        response = self.supabase.table('org_functions').select('id, name').execute()
        return {f['id']: f['name'] for f in response.data}
    
    def get_agent_relationships(self) -> List[Dict]:
        """Get all agent relationships from Supabase"""
        all_rels = []
        offset = 0
        batch_size = 1000
        
        while True:
            response = self.supabase.table('agent_relationships').select(
                'parent_agent_id, child_agent_id, relationship_type, '
                'context_isolation, share_memory, description'
            ).range(offset, offset + batch_size - 1).execute()
            
            all_rels.extend(response.data)
            
            if len(response.data) < batch_size:
                break
            offset += batch_size
        
        return all_rels
    
    def get_agent_capabilities(self, agent_id: str) -> List[str]:
        """Get capabilities for an agent"""
        response = self.supabase.table('agent_capabilities').select(
            'capability_id'
        ).eq('agent_id', agent_id).execute()
        
        if not response.data:
            return []
        
        cap_ids = [c['capability_id'] for c in response.data]
        caps = self.supabase.table('capabilities').select('name').in_('id', cap_ids).execute()
        return [c['name'] for c in caps.data]
    
    def get_agent_skills(self, agent_id: str) -> List[str]:
        """Get skills for an agent"""
        response = self.supabase.table('agent_skills').select(
            'skill_id'
        ).eq('agent_id', agent_id).execute()
        
        if not response.data:
            return []
        
        skill_ids = [s['skill_id'] for s in response.data]
        skills = self.supabase.table('skills').select('name').in_('id', skill_ids).execute()
        return [s['name'] for s in skills.data]
    
    async def sync_to_pinecone(self, agents: List[Dict], levels: Dict, functions: Dict):
        """Sync agents to Pinecone vector database"""
        if not self.pinecone_index:
            print("⚠️ Pinecone not available, skipping...")
            return
        
        print("\n" + "=" * 80)
        print("📤 SYNCING AGENTS TO PINECONE")
        print("=" * 80)
        
        vectors = []
        batch_size = 100
        total_synced = 0
        
        for i, agent in enumerate(agents):
            # Create text for embedding
            level_info = levels.get(agent['agent_level_id'], {})
            func_name = functions.get(agent['function_id'], 'Unknown')
            
            text = f"""
            Agent: {agent['name']}
            Level: L{level_info.get('level_number', 0)} {level_info.get('name', '')}
            Function: {func_name}
            Tagline: {agent.get('tagline', '')}
            Description: {agent.get('description', '')}
            """
            
            # Generate embedding
            embedding = self.generate_embedding(text)
            if not embedding:
                continue
            
            # Create vector record
            vectors.append({
                'id': str(agent['id']),
                'values': embedding,
                'metadata': {
                    'name': agent['name'],
                    'slug': agent.get('slug', ''),
                    'level': level_info.get('level_number', 0),
                    'level_name': level_info.get('name', ''),
                    'function': func_name,
                    'tenant_id': str(agent.get('tenant_id', '')),
                    'tagline': agent.get('tagline', '')[:500] if agent.get('tagline') else '',
                    'type': 'agent'
                }
            })
            
            # Upsert in batches
            if len(vectors) >= batch_size:
                self.pinecone_index.upsert(vectors=vectors, namespace='agents')
                total_synced += len(vectors)
                print(f"   ✅ Synced {total_synced}/{len(agents)} agents to Pinecone")
                vectors = []
        
        # Upsert remaining
        if vectors:
            self.pinecone_index.upsert(vectors=vectors, namespace='agents')
            total_synced += len(vectors)
        
        print(f"\n✅ Total agents synced to Pinecone: {total_synced}")
    
    async def sync_to_neo4j(self, agents: List[Dict], levels: Dict, functions: Dict, relationships: List[Dict]):
        """Sync agents and relationships to Neo4j graph database"""
        if not self.neo4j_driver:
            print("⚠️ Neo4j not available, skipping...")
            return
        
        print("\n" + "=" * 80)
        print("📤 SYNCING AGENTS TO NEO4J")
        print("=" * 80)
        
        async with self.neo4j_driver.session(database="neo4j") as session:
            # Clear existing data (optional - comment out to preserve)
            print("   🗑️ Clearing existing agent nodes...")
            await session.run("MATCH (a:Agent) DETACH DELETE a")
            
            # Create agent nodes
            print("   📝 Creating agent nodes...")
            batch_size = 100
            total_nodes = 0
            
            for i in range(0, len(agents), batch_size):
                batch = agents[i:i + batch_size]
                
                for agent in batch:
                    level_info = levels.get(agent['agent_level_id'], {})
                    func_name = functions.get(agent['function_id'], 'Unknown')
                    
                    # Get capabilities and skills
                    capabilities = self.get_agent_capabilities(agent['id'])
                    
                    await session.run("""
                        CREATE (a:Agent {
                            id: $id,
                            name: $name,
                            slug: $slug,
                            tier: $tier,
                            level_name: $level_name,
                            function: $function,
                            tenant_id: $tenant_id,
                            tagline: $tagline,
                            capabilities: $capabilities,
                            is_active: true,
                            created_at: datetime()
                        })
                    """,
                        id=str(agent['id']),
                        name=agent['name'],
                        slug=agent.get('slug', ''),
                        tier=level_info.get('level_number', 0),
                        level_name=level_info.get('name', ''),
                        function=func_name,
                        tenant_id=str(agent.get('tenant_id', '')),
                        tagline=agent.get('tagline', '')[:500] if agent.get('tagline') else '',
                        capabilities=capabilities[:10]  # Limit for Neo4j
                    )
                
                total_nodes += len(batch)
                print(f"   ✅ Created {total_nodes}/{len(agents)} agent nodes")
            
            # Create relationships
            print("\n   🔗 Creating relationships...")
            total_rels = 0
            
            # Map relationship types to Neo4j
            rel_type_map = {
                'orchestrates': 'ORCHESTRATES',
                'delegates_to': 'DELEGATES_TO',
                'uses_tool': 'USES_TOOL',
                'uses_worker': 'USES_WORKER',
                'escalates_to': 'ESCALATES_TO',
                'collaborates_with': 'COLLABORATES_WITH',
                'supervises': 'SUPERVISES',
                'spawns_subagent': 'SPAWNS'
            }
            
            for i in range(0, len(relationships), batch_size):
                batch = relationships[i:i + batch_size]
                
                for rel in batch:
                    neo4j_type = rel_type_map.get(rel['relationship_type'], 'RELATES_TO')
                    
                    # Create relationship with Cypher
                    query = f"""
                        MATCH (a1:Agent {{id: $from_id}})
                        MATCH (a2:Agent {{id: $to_id}})
                        CREATE (a1)-[r:{neo4j_type} {{
                            context_isolation: $context_isolation,
                            share_memory: $share_memory,
                            description: $description,
                            created_at: datetime()
                        }}]->(a2)
                    """
                    
                    try:
                        await session.run(
                            query,
                            from_id=str(rel['parent_agent_id']),
                            to_id=str(rel['child_agent_id']),
                            context_isolation=rel.get('context_isolation', True),
                            share_memory=rel.get('share_memory', False),
                            description=rel.get('description', '')[:200] if rel.get('description') else ''
                        )
                        total_rels += 1
                    except Exception as e:
                        pass  # Skip if nodes don't exist
                
                if (i + batch_size) % 500 == 0 or i + batch_size >= len(relationships):
                    print(f"   ✅ Created {total_rels} relationships")
            
            # Create indexes for performance
            print("\n   📊 Creating indexes...")
            await session.run("CREATE INDEX agent_id_index IF NOT EXISTS FOR (a:Agent) ON (a.id)")
            await session.run("CREATE INDEX agent_tier_index IF NOT EXISTS FOR (a:Agent) ON (a.tier)")
            await session.run("CREATE INDEX agent_tenant_index IF NOT EXISTS FOR (a:Agent) ON (a.tenant_id)")
            await session.run("CREATE INDEX agent_function_index IF NOT EXISTS FOR (a:Agent) ON (a.function)")
            
            print(f"\n✅ Total nodes created: {total_nodes}")
            print(f"✅ Total relationships created: {total_rels}")
    
    async def run_sync(self):
        """Run full sync to both databases"""
        print("=" * 80)
        print("🚀 AGENT SYNC TO PINECONE & NEO4J")
        print("=" * 80)
        print(f"Started: {datetime.now().isoformat()}")
        
        # Connect to Neo4j
        await self.connect_neo4j()
        
        # Get data from Supabase
        print("\n📥 Loading data from Supabase...")
        agents = self.get_all_agents()
        levels = self.get_agent_levels()
        functions = self.get_functions()
        relationships = self.get_agent_relationships()
        
        print(f"   • Agents: {len(agents)}")
        print(f"   • Levels: {len(levels)}")
        print(f"   • Functions: {len(functions)}")
        print(f"   • Relationships: {len(relationships)}")
        
        # Sync to Pinecone
        await self.sync_to_pinecone(agents, levels, functions)
        
        # Sync to Neo4j
        await self.sync_to_neo4j(agents, levels, functions, relationships)
        
        # Close connections
        await self.close()
        
        print("\n" + "=" * 80)
        print("✅ SYNC COMPLETE")
        print("=" * 80)
        print(f"Finished: {datetime.now().isoformat()}")


async def main():
    """Main entry point"""
    sync_service = AgentSyncService()
    await sync_service.run_sync()


if __name__ == "__main__":
    asyncio.run(main())

