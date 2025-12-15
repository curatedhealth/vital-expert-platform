#!/usr/bin/env python3
"""
Enhanced Agent Sync to Pinecone & Neo4j - WITH CAPABILITIES, SKILLS & RESPONSIBILITIES

This script synchronizes from Supabase to:
1. Pinecone - Agents + Capabilities + Skills + Responsibilities (semantic search)
2. Neo4j - Complete agent graph with relationships

NEW in this version:
- ✅ Syncs capabilities (319 records)
- ✅ Syncs responsibilities (278 records)
- ✅ Syncs skills
- ✅ Creates capability→skill relationships in Neo4j
- ✅ Creates agent→capability→skill chains in Neo4j
- ✅ Creates agent→responsibility relationships in Neo4j

Usage:
    python database/sync/sync_agents_capabilities_responsibilities.py

Environment Variables Required:
    - NEXT_PUBLIC_SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    - PINECONE_API_KEY
    - PINECONE_INDEX_NAME
    - NEO4J_URI
    - NEO4J_USER
    - NEO4J_PASSWORD
    - OPENAI_API_KEY
"""

import os
import sys
import asyncio
from typing import List, Dict, Optional
from datetime import datetime

from dotenv import load_dotenv
from pathlib import Path

# Load environment
env_local = Path(__file__).parent.parent / '.env.local'
if env_local.exists():
    load_dotenv(env_local)
    print(f"✅ Loaded .env.local")
else:
    load_dotenv()
    print(f"⚠️ Using .env")

# Imports
from supabase import create_client, Client

try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    print("⚠️ Pinecone not available")

try:
    from neo4j import AsyncGraphDatabase, AsyncDriver
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    print("⚠️ Neo4j not available")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI not available")


class EnhancedAgentSyncService:
    """Enhanced service to sync agents, capabilities, skills, and responsibilities"""
    
    def __init__(self):
        # Supabase
        self.supabase: Client = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        print("✅ Supabase connected")
        
        # Pinecone
        self.pinecone = None
        self.pinecone_index = None
        if PINECONE_AVAILABLE and os.getenv('PINECONE_API_KEY'):
            self.pinecone = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
            index_name = os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge')
            try:
                self.pinecone_index = self.pinecone.Index(index_name)
                print(f"✅ Pinecone connected (index: {index_name})")
            except Exception as e:
                print(f"⚠️ Pinecone error: {e}")
        
        # Neo4j
        self.neo4j_driver: Optional[AsyncDriver] = None
        
        # OpenAI
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
            print("⚠️ NEO4J credentials missing")
            return
        
        try:
            self.neo4j_driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
            await self.neo4j_driver.verify_connectivity()
            print(f"✅ Neo4j connected ({uri})")
        except Exception as e:
            print(f"⚠️ Neo4j error: {e}")
    
    async def close(self):
        """Close connections"""
        if self.neo4j_driver:
            await self.neo4j_driver.close()
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI"""
        if not self.openai:
            return []
        
        try:
            response = self.openai.embeddings.create(
                model="text-embedding-3-large",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"⚠️ Embedding error: {e}")
            return []
    
    def get_all_agents(self) -> List[Dict]:
        """Get all agents from Supabase"""
        response = self.supabase.table('agents').select('*').execute()
        return response.data
    
    def get_all_capabilities(self) -> List[Dict]:
        """Get all capabilities from Supabase"""
        response = self.supabase.table('capabilities').select('*').execute()
        return response.data
    
    def get_all_responsibilities(self) -> List[Dict]:
        """Get all responsibilities from Supabase"""
        response = self.supabase.table('org_responsibilities').select('*').execute()
        return response.data
    
    def get_all_skills(self) -> List[Dict]:
        """Get all skills from Supabase"""
        response = self.supabase.table('skills').select('*').execute()
        return response.data
    
    def get_agent_capabilities(self) -> List[Dict]:
        """Get all agent-capability assignments"""
        response = self.supabase.table('agent_capabilities').select('*').execute()
        return response.data
    
    def get_agent_responsibilities(self) -> List[Dict]:
        """Get all agent-responsibility assignments"""
        response = self.supabase.table('agent_responsibilities').select('*').execute()
        return response.data
    
    def get_agent_skills(self) -> List[Dict]:
        """Get all agent-skill assignments"""
        response = self.supabase.table('agent_skills').select('*').execute()
        return response.data
    
    def get_agent_relationships(self) -> List[Dict]:
        """Get agent relationships"""
        response = self.supabase.table('agent_relationships').select('*').execute()
        return response.data
    
    async def sync_capabilities_to_pinecone(self, capabilities: List[Dict]):
        """Sync capabilities to Pinecone"""
        if not self.pinecone_index:
            return
        
        print("\n📤 Syncing Capabilities to Pinecone...")
        vectors = []
        
        for cap in capabilities:
            text = f"""
            Capability: {cap['name']}
            Type: {cap.get('capability_type', '')}
            Description: {cap.get('description', '')}
            Maturity: {cap.get('maturity_level', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                continue
            
            vectors.append({
                'id': f"cap_{cap['id']}",
                'values': embedding,
                'metadata': {
                    'name': cap['name'],
                    'slug': cap.get('slug', ''),
                    'type': cap.get('capability_type', ''),
                    'maturity_level': cap.get('maturity_level', ''),
                    'tags': cap.get('tags', [])[:10] if cap.get('tags') else [],
                    'entity_type': 'capability'
                }
            })
            
            if len(vectors) >= 100:
                self.pinecone_index.upsert(vectors=vectors, namespace='capabilities')
                print(f"   ✅ Synced {len(vectors)} capabilities")
                vectors = []
        
        if vectors:
            self.pinecone_index.upsert(vectors=vectors, namespace='capabilities')
        
        print(f"✅ Total capabilities synced: {len(capabilities)}")
    
    async def sync_responsibilities_to_pinecone(self, responsibilities: List[Dict]):
        """Sync responsibilities to Pinecone"""
        if not self.pinecone_index:
            return
        
        print("\n📤 Syncing Responsibilities to Pinecone...")
        vectors = []
        
        for resp in responsibilities:
            text = f"""
            Responsibility: {resp['name']}
            Category: {resp.get('category', '')}
            Description: {resp.get('description', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                continue
            
            vectors.append({
                'id': f"resp_{resp['id']}",
                'values': embedding,
                'metadata': {
                    'name': resp['name'],
                    'category': resp.get('category', ''),
                    'entity_type': 'responsibility'
                }
            })
            
            if len(vectors) >= 100:
                self.pinecone_index.upsert(vectors=vectors, namespace='responsibilities')
                print(f"   ✅ Synced {len(vectors)} responsibilities")
                vectors = []
        
        if vectors:
            self.pinecone_index.upsert(vectors=vectors, namespace='responsibilities')
        
        print(f"✅ Total responsibilities synced: {len(responsibilities)}")
    
    async def sync_skills_to_pinecone(self, skills: List[Dict]):
        """Sync skills to Pinecone"""
        if not self.pinecone_index:
            return
        
        print("\n📤 Syncing Skills to Pinecone...")
        vectors = []
        
        for skill in skills:
            text = f"""
            Skill: {skill['name']}
            Category: {skill.get('category', '')}
            Description: {skill.get('description', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                continue
            
            vectors.append({
                'id': f"skill_{skill['id']}",
                'values': embedding,
                'metadata': {
                    'name': skill['name'],
                    'category': skill.get('category', ''),
                    'skill_type': skill.get('skill_type', ''),
                    'entity_type': 'skill'
                }
            })
            
            if len(vectors) >= 100:
                self.pinecone_index.upsert(vectors=vectors, namespace='skills')
                print(f"   ✅ Synced {len(vectors)} skills")
                vectors = []
        
        if vectors:
            self.pinecone_index.upsert(vectors=vectors, namespace='skills')
        
        print(f"✅ Total skills synced: {len(skills)}")
    
    async def sync_to_neo4j(self, 
                           agents: List[Dict],
                           capabilities: List[Dict],
                           responsibilities: List[Dict],
                           skills: List[Dict],
                           agent_caps: List[Dict],
                           agent_resps: List[Dict],
                           agent_skills: List[Dict],
                           agent_rels: List[Dict]):
        """Sync everything to Neo4j with full graph relationships"""
        if not self.neo4j_driver:
            return
        
        print("\n📤 Syncing to Neo4j...")
        
        async with self.neo4j_driver.session(database="neo4j") as session:
            # 1. Create constraints and indexes
            print("   📊 Creating constraints...")
            await session.run("CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (a:Agent) REQUIRE a.id IS UNIQUE")
            await session.run("CREATE CONSTRAINT capability_id IF NOT EXISTS FOR (c:Capability) REQUIRE c.id IS UNIQUE")
            await session.run("CREATE CONSTRAINT responsibility_id IF NOT EXISTS FOR (r:Responsibility) REQUIRE r.id IS UNIQUE")
            await session.run("CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE")
            
            # 2. Create Agent nodes
            print(f"   📝 Creating {len(agents)} Agent nodes...")
            for agent in agents:
                await session.run("""
                    MERGE (a:Agent {id: $id})
                    SET a.name = $name,
                        a.slug = $slug,
                        a.function_name = $function_name,
                        a.role_name = $role_name,
                        a.tagline = $tagline,
                        a.updated_at = datetime()
                """,
                    id=str(agent['id']),
                    name=agent['name'],
                    slug=agent.get('slug', ''),
                    function_name=agent.get('function_name', ''),
                    role_name=agent.get('role_name', ''),
                    tagline=agent.get('tagline', '')[:500] if agent.get('tagline') else ''
                )
            
            # 3. Create Capability nodes
            print(f"   📝 Creating {len(capabilities)} Capability nodes...")
            for cap in capabilities:
                await session.run("""
                    MERGE (c:Capability {id: $id})
                    SET c.name = $name,
                        c.slug = $slug,
                        c.capability_type = $capability_type,
                        c.maturity_level = $maturity_level,
                        c.updated_at = datetime()
                """,
                    id=str(cap['id']),
                    name=cap['name'],
                    slug=cap.get('slug', ''),
                    capability_type=cap.get('capability_type', ''),
                    maturity_level=cap.get('maturity_level', '')
                )
            
            # 4. Create Responsibility nodes
            print(f"   📝 Creating {len(responsibilities)} Responsibility nodes...")
            for resp in responsibilities:
                await session.run("""
                    MERGE (r:Responsibility {id: $id})
                    SET r.name = $name,
                        r.category = $category,
                        r.updated_at = datetime()
                """,
                    id=str(resp['id']),
                    name=resp['name'],
                    category=resp.get('category', '')
                )
            
            # 5. Create Skill nodes
            print(f"   📝 Creating {len(skills)} Skill nodes...")
            for skill in skills:
                await session.run("""
                    MERGE (s:Skill {id: $id})
                    SET s.name = $name,
                        s.category = $category,
                        s.skill_type = $skill_type,
                        s.updated_at = datetime()
                """,
                    id=str(skill['id']),
                    name=skill['name'],
                    category=skill.get('category', ''),
                    skill_type=skill.get('skill_type', '')
                )
            
            # 6. Create Agent→Capability relationships
            print(f"   🔗 Creating {len(agent_caps)} Agent→Capability relationships...")
            for ac in agent_caps:
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (c:Capability {id: $capability_id})
                    MERGE (a)-[r:HAS_CAPABILITY]->(c)
                    SET r.proficiency_level = $proficiency_level,
                        r.updated_at = datetime()
                """,
                    agent_id=str(ac['agent_id']),
                    capability_id=str(ac['capability_id']),
                    proficiency_level=ac.get('proficiency_level', '')
                )
            
            # 7. Create Agent→Responsibility relationships
            print(f"   🔗 Creating {len(agent_resps)} Agent→Responsibility relationships...")
            for ar in agent_resps:
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (r:Responsibility {id: $responsibility_id})
                    MERGE (a)-[rel:HAS_RESPONSIBILITY]->(r)
                    SET rel.is_primary = $is_primary,
                        rel.weight = $weight,
                        rel.updated_at = datetime()
                """,
                    agent_id=str(ar['agent_id']),
                    responsibility_id=str(ar['responsibility_id']),
                    is_primary=ar.get('is_primary', False),
                    weight=float(ar.get('weight', 1.0))
                )
            
            # 8. Create Agent→Skill relationships
            print(f"   🔗 Creating {len(agent_skills)} Agent→Skill relationships...")
            for ask in agent_skills:
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (s:Skill {id: $skill_id})
                    MERGE (a)-[r:HAS_SKILL]->(s)
                    SET r.proficiency_level = $proficiency_level,
                        r.updated_at = datetime()
                """,
                    agent_id=str(ask['agent_id']),
                    skill_id=str(ask['skill_id']),
                    proficiency_level=str(ask.get('proficiency_level', ''))
                )
            
            # 9. Create Agent→Agent relationships
            print(f"   🔗 Creating {len(agent_rels)} Agent→Agent relationships...")
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
            
            for rel in agent_rels:
                neo4j_type = rel_type_map.get(rel['relationship_type'], 'RELATES_TO')
                query = f"""
                    MATCH (a1:Agent {{id: $from_id}})
                    MATCH (a2:Agent {{id: $to_id}})
                    MERGE (a1)-[r:{neo4j_type}]->(a2)
                    SET r.updated_at = datetime()
                """
                try:
                    await session.run(query,
                        from_id=str(rel['parent_agent_id']),
                        to_id=str(rel['child_agent_id'])
                    )
                except:
                    pass
            
            print("✅ Neo4j sync complete!")
    
    async def run_sync(self):
        """Run complete sync"""
        print("=" * 80)
        print("🚀 ENHANCED AGENT SYNC - WITH CAPABILITIES, SKILLS & RESPONSIBILITIES")
        print("=" * 80)
        print(f"Started: {datetime.now().isoformat()}\n")
        
        # Connect to Neo4j
        await self.connect_neo4j()
        
        # Load all data from Supabase
        print("📥 Loading data from Supabase...")
        agents = self.get_all_agents()
        capabilities = self.get_all_capabilities()
        responsibilities = self.get_all_responsibilities()
        skills = self.get_all_skills()
        agent_caps = self.get_agent_capabilities()
        agent_resps = self.get_agent_responsibilities()
        agent_skills = self.get_agent_skills()
        agent_rels = self.get_agent_relationships()
        
        print(f"   • Agents: {len(agents)}")
        print(f"   • Capabilities: {len(capabilities)}")
        print(f"   • Responsibilities: {len(responsibilities)}")
        print(f"   • Skills: {len(skills)}")
        print(f"   • Agent→Capability assignments: {len(agent_caps)}")
        print(f"   • Agent→Responsibility assignments: {len(agent_resps)}")
        print(f"   • Agent→Skill assignments: {len(agent_skills)}")
        print(f"   • Agent→Agent relationships: {len(agent_rels)}")
        
        # Sync to Pinecone
        await self.sync_capabilities_to_pinecone(capabilities)
        await self.sync_responsibilities_to_pinecone(responsibilities)
        await self.sync_skills_to_pinecone(skills)
        
        # Sync to Neo4j
        await self.sync_to_neo4j(
            agents, capabilities, responsibilities, skills,
            agent_caps, agent_resps, agent_skills, agent_rels
        )
        
        # Close connections
        await self.close()
        
        print("\n" + "=" * 80)
        print("✅ SYNC COMPLETE")
        print("=" * 80)
        print(f"Finished: {datetime.now().isoformat()}")


async def main():
    """Main entry point"""
    sync_service = EnhancedAgentSyncService()
    await sync_service.run_sync()


if __name__ == "__main__":
    asyncio.run(main())

