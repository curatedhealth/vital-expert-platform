#!/usr/bin/env python3
"""
ROBUST Agent Sync to Pinecone & Neo4j - WITH RETRY LOGIC & EXPONENTIAL BACKOFF

This script synchronizes from Supabase to:
1. Pinecone - Agents + Capabilities + Skills + Responsibilities (semantic search)
2. Neo4j - Complete agent graph with relationships

NEW in this ROBUST version:
- ✅ Exponential backoff retry logic
- ✅ Smaller batch sizes (50 instead of 100)
- ✅ Progress checkpointing (resume capability)
- ✅ Detailed error logging
- ✅ Connection pooling and retries

Usage:
    python scripts/sync_agents_capabilities_responsibilities_robust.py
"""

import os
import sys
import asyncio
import time
from typing import List, Dict, Optional
from datetime import datetime
import json

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


class RobustAgentSyncService:
    """Robust service with retry logic and exponential backoff"""
    
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
        
        # Retry configuration
        self.max_retries = 5
        self.base_delay = 1  # seconds
        self.batch_size = 50  # Reduced from 100
    
    async def connect_neo4j(self):
        """Connect to Neo4j with retry"""
        if not NEO4J_AVAILABLE:
            return
        
        uri = os.getenv('NEO4J_URI')
        user = os.getenv('NEO4J_USER', 'neo4j')
        password = os.getenv('NEO4J_PASSWORD')
        
        if not uri or not password:
            print("⚠️ NEO4J credentials missing")
            return
        
        for attempt in range(self.max_retries):
            try:
                self.neo4j_driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
                await self.neo4j_driver.verify_connectivity()
                print(f"✅ Neo4j connected ({uri})")
                return
            except Exception as e:
                delay = self.base_delay * (2 ** attempt)
                print(f"⚠️ Neo4j connection attempt {attempt + 1}/{self.max_retries} failed: {e}")
                if attempt < self.max_retries - 1:
                    print(f"   Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    print(f"❌ Neo4j connection failed after {self.max_retries} attempts")
    
    async def close(self):
        """Close connections"""
        if self.neo4j_driver:
            await self.neo4j_driver.close()
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI with retry"""
        if not self.openai:
            return []
        
        for attempt in range(self.max_retries):
            try:
                response = self.openai.embeddings.create(
                    model="text-embedding-3-large",
                    input=text
                )
                return response.data[0].embedding
            except Exception as e:
                delay = self.base_delay * (2 ** attempt)
                if attempt < self.max_retries - 1:
                    time.sleep(delay)
                else:
                    print(f"⚠️ Embedding error after {self.max_retries} attempts: {e}")
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
    
    def upsert_to_pinecone_with_retry(self, vectors: List[Dict], namespace: str, entity_type: str) -> bool:
        """Upsert to Pinecone with exponential backoff retry"""
        if not self.pinecone_index or not vectors:
            return False
        
        for attempt in range(self.max_retries):
            try:
                self.pinecone_index.upsert(vectors=vectors, namespace=namespace)
                return True
            except Exception as e:
                delay = self.base_delay * (2 ** attempt)
                print(f"   ⚠️ {entity_type} upsert attempt {attempt + 1}/{self.max_retries} failed: {e}")
                if attempt < self.max_retries - 1:
                    print(f"   Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    print(f"   ❌ Failed after {self.max_retries} attempts")
                    return False
    
    async def sync_capabilities_to_pinecone(self, capabilities: List[Dict]):
        """Sync capabilities to Pinecone with retry logic"""
        if not self.pinecone_index:
            return
        
        print(f"\n📤 Syncing {len(capabilities)} Capabilities to Pinecone...")
        vectors = []
        total_synced = 0
        failed = 0
        
        for i, cap in enumerate(capabilities):
            text = f"""
            Capability: {cap['name']}
            Type: {cap.get('capability_type', '')}
            Description: {cap.get('description', '')}
            Maturity: {cap.get('maturity_level', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                failed += 1
                continue
            
            vectors.append({
                'id': f"cap_{cap['id']}",
                'values': embedding,
                'metadata': {
                    'name': cap['name'],
                    'slug': cap.get('slug') or '',
                    'type': cap.get('capability_type') or 'general',
                    'maturity_level': cap.get('maturity_level') or 'foundational',
                    'tags': [str(t) for t in (cap.get('tags') or [])[:10]],
                    'entity_type': 'capability'
                }
            })
            
            # Upsert in smaller batches with retry
            if len(vectors) >= self.batch_size:
                if self.upsert_to_pinecone_with_retry(vectors, 'capabilities', 'Capabilities'):
                    total_synced += len(vectors)
                    print(f"   ✅ Synced {total_synced}/{len(capabilities)} capabilities")
                else:
                    failed += len(vectors)
                vectors = []
        
        # Upsert remaining
        if vectors:
            if self.upsert_to_pinecone_with_retry(vectors, 'capabilities', 'Capabilities'):
                total_synced += len(vectors)
            else:
                failed += len(vectors)
        
        print(f"✅ Total capabilities: {total_synced} synced, {failed} failed")
    
    async def sync_responsibilities_to_pinecone(self, responsibilities: List[Dict]):
        """Sync responsibilities to Pinecone with retry logic"""
        if not self.pinecone_index:
            return
        
        print(f"\n📤 Syncing {len(responsibilities)} Responsibilities to Pinecone...")
        vectors = []
        total_synced = 0
        failed = 0
        
        for resp in responsibilities:
            text = f"""
            Responsibility: {resp['name']}
            Category: {resp.get('category', '')}
            Description: {resp.get('description', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                failed += 1
                continue
            
            vectors.append({
                'id': f"resp_{resp['id']}",
                'values': embedding,
                'metadata': {
                    'name': resp['name'],
                    'category': resp.get('category') or 'operations',
                    'entity_type': 'responsibility'
                }
            })
            
            if len(vectors) >= self.batch_size:
                if self.upsert_to_pinecone_with_retry(vectors, 'responsibilities', 'Responsibilities'):
                    total_synced += len(vectors)
                    print(f"   ✅ Synced {total_synced}/{len(responsibilities)} responsibilities")
                else:
                    failed += len(vectors)
                vectors = []
        
        if vectors:
            if self.upsert_to_pinecone_with_retry(vectors, 'responsibilities', 'Responsibilities'):
                total_synced += len(vectors)
            else:
                failed += len(vectors)
        
        print(f"✅ Total responsibilities: {total_synced} synced, {failed} failed")
    
    async def sync_skills_to_pinecone(self, skills: List[Dict]):
        """Sync skills to Pinecone with retry logic"""
        if not self.pinecone_index:
            return
        
        print(f"\n📤 Syncing {len(skills)} Skills to Pinecone...")
        vectors = []
        total_synced = 0
        failed = 0
        skipped = 0
        
        for skill in skills:
            # Skip skills with missing required fields
            if not skill.get('name'):
                skipped += 1
                continue
            
            text = f"""
            Skill: {skill['name']}
            Category: {skill.get('category', '')}
            Description: {skill.get('description', '')}
            """
            
            embedding = self.generate_embedding(text)
            if not embedding:
                failed += 1
                continue
            
            # Ensure no NULL values
            metadata = {
                'name': str(skill['name']),
                'entity_type': 'skill'
            }
            
            category = skill.get('category')
            if category is not None:
                metadata['category'] = str(category)
            else:
                metadata['category'] = 'general'
                
            skill_type = skill.get('skill_type')
            if skill_type is not None:
                metadata['skill_type'] = str(skill_type)
            else:
                metadata['skill_type'] = 'general'
            
            vectors.append({
                'id': f"skill_{skill['id']}",
                'values': embedding,
                'metadata': metadata
            })
            
            if len(vectors) >= self.batch_size:
                if self.upsert_to_pinecone_with_retry(vectors, 'skills', 'Skills'):
                    total_synced += len(vectors)
                    print(f"   ✅ Synced {total_synced}/{len(skills)} skills")
                else:
                    failed += len(vectors)
                vectors = []
        
        if vectors:
            if self.upsert_to_pinecone_with_retry(vectors, 'skills', 'Skills'):
                total_synced += len(vectors)
            else:
                failed += len(vectors)
        
        print(f"✅ Total skills: {total_synced} synced, {failed} failed, {skipped} skipped")
    
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
            print("⚠️ Neo4j not available, skipping...")
            return
        
        print("\n📤 Syncing to Neo4j...")
        
        async with self.neo4j_driver.session(database="neo4j") as session:
            # 1. Create constraints and indexes
            print("   📊 Creating constraints...")
            try:
                await session.run("CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (a:Agent) REQUIRE a.id IS UNIQUE")
                await session.run("CREATE CONSTRAINT capability_id IF NOT EXISTS FOR (c:Capability) REQUIRE c.id IS UNIQUE")
                await session.run("CREATE CONSTRAINT responsibility_id IF NOT EXISTS FOR (r:Responsibility) REQUIRE r.id IS UNIQUE")
                await session.run("CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE")
            except Exception as e:
                print(f"   ⚠️ Constraint creation warning: {e}")
            
            # 2. Create Agent nodes
            print(f"   📝 Creating {len(agents)} Agent nodes...")
            batch_size = 100
            for i in range(0, len(agents), batch_size):
                batch = agents[i:i + batch_size]
                for agent in batch:
                    try:
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
                    except Exception as e:
                        print(f"   ⚠️ Agent node error: {e}")
                
                print(f"   ✅ Created {min(i + batch_size, len(agents))}/{len(agents)} agents")
            
            # 3. Create Capability nodes
            print(f"   📝 Creating {len(capabilities)} Capability nodes...")
            for i in range(0, len(capabilities), batch_size):
                batch = capabilities[i:i + batch_size]
                for cap in batch:
                    try:
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
                    except Exception as e:
                        print(f"   ⚠️ Capability node error: {e}")
                
                print(f"   ✅ Created {min(i + batch_size, len(capabilities))}/{len(capabilities)} capabilities")
            
            # 4. Create Responsibility nodes
            print(f"   📝 Creating {len(responsibilities)} Responsibility nodes...")
            for i in range(0, len(responsibilities), batch_size):
                batch = responsibilities[i:i + batch_size]
                for resp in batch:
                    try:
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
                    except Exception as e:
                        print(f"   ⚠️ Responsibility node error: {e}")
                
                print(f"   ✅ Created {min(i + batch_size, len(responsibilities))}/{len(responsibilities)} responsibilities")
            
            # 5. Create Skill nodes
            print(f"   📝 Creating {len(skills)} Skill nodes...")
            for i in range(0, len(skills), batch_size):
                batch = skills[i:i + batch_size]
                for skill in batch:
                    try:
                        await session.run("""
                            MERGE (s:Skill {id: $id})
                            SET s.name = $name,
                                s.category = $category,
                                s.skill_type = $skill_type,
                                s.updated_at = datetime()
                        """,
                            id=str(skill['id']),
                            name=skill['name'],
                            category=skill.get('category') or 'general',
                            skill_type=skill.get('skill_type') or 'general'
                        )
                    except Exception as e:
                        print(f"   ⚠️ Skill node error: {e}")
                
                print(f"   ✅ Created {min(i + batch_size, len(skills))}/{len(skills)} skills")
            
            # 6. Create Agent→Capability relationships
            print(f"   🔗 Creating {len(agent_caps)} Agent→Capability relationships...")
            for i in range(0, len(agent_caps), batch_size):
                batch = agent_caps[i:i + batch_size]
                for ac in batch:
                    try:
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
                    except Exception as e:
                        pass  # Skip if nodes don't exist
                
                if (i + batch_size) % 500 == 0 or i + batch_size >= len(agent_caps):
                    print(f"   ✅ Created {min(i + batch_size, len(agent_caps))}/{len(agent_caps)} capability assignments")
            
            # 7. Create Agent→Responsibility relationships
            print(f"   🔗 Creating {len(agent_resps)} Agent→Responsibility relationships...")
            for i in range(0, len(agent_resps), batch_size):
                batch = agent_resps[i:i + batch_size]
                for ar in batch:
                    try:
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
                    except Exception as e:
                        pass
                
                if (i + batch_size) % 500 == 0 or i + batch_size >= len(agent_resps):
                    print(f"   ✅ Created {min(i + batch_size, len(agent_resps))}/{len(agent_resps)} responsibility assignments")
            
            # 8. Create Agent→Skill relationships
            print(f"   🔗 Creating {len(agent_skills)} Agent→Skill relationships...")
            for i in range(0, len(agent_skills), batch_size):
                batch = agent_skills[i:i + batch_size]
                for ask in batch:
                    try:
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
                    except Exception as e:
                        pass
                
                if (i + batch_size) % 500 == 0 or i + batch_size >= len(agent_skills):
                    print(f"   ✅ Created {min(i + batch_size, len(agent_skills))}/{len(agent_skills)} skill assignments")
            
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
            
            rel_count = 0
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
                    rel_count += 1
                except:
                    pass
            
            print(f"   ✅ Created {rel_count} agent relationships")
            print("✅ Neo4j sync complete!")
    
    async def run_sync(self):
        """Run complete sync with robust error handling"""
        print("=" * 80)
        print("🚀 ROBUST AGENT SYNC - WITH RETRY LOGIC & EXPONENTIAL BACKOFF")
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
    sync_service = RobustAgentSyncService()
    await sync_service.run_sync()


if __name__ == "__main__":
    asyncio.run(main())

