#!/usr/bin/env python3
"""
Load Medical Affairs agents to Neo4j knowledge graph
Creates agent nodes, skill nodes, tool nodes, and all relationships

Usage:
    python load_agents_to_neo4j.py [--clear-existing]

Environment Variables Required:
    NEO4J_URI
    NEO4J_USER
    NEO4J_PASSWORD
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
"""

import asyncio
import os
import sys
import json
import argparse
import ssl
from datetime import datetime
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    import structlog
    from neo4j import AsyncGraphDatabase
    from supabase import create_client, Client
except ImportError as e:
    print(f"Error importing required packages: {e}")
    print("Please install: pip install structlog neo4j supabase")
    sys.exit(1)

logger = structlog.get_logger()


class AgentGraphLoader:
    """Load agent graph data into Neo4j"""
    
    def __init__(
        self,
        neo4j_uri: str,
        neo4j_user: str,
        neo4j_password: str,
        supabase_url: str,
        supabase_key: str,
        clear_existing: bool = False
    ):
        self.clear_existing = clear_existing
        
        # Initialize clients
        logger.info("Initializing clients...")
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Neo4j Aura connection
        # If URI already includes encryption scheme (neo4j+s, bolt+s), don't add ssl_context
        if 'neo4j+s' in neo4j_uri or 'bolt+s' in neo4j_uri:
            self.neo4j_driver = AsyncGraphDatabase.driver(
                neo4j_uri,
                auth=(neo4j_user, neo4j_password)
            )
        else:
            # For plain bolt:// or neo4j://, create SSL context
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            self.neo4j_driver = AsyncGraphDatabase.driver(
                neo4j_uri,
                auth=(neo4j_user, neo4j_password),
                encrypted=True,
                ssl_context=ssl_context
            )
        
        logger.info("✅ All clients initialized")
    
    async def clear_graph(self):
        """Clear existing graph data"""
        if not self.clear_existing:
            return
        
        logger.info("Clearing existing graph data...")
        async with self.neo4j_driver.session() as session:
            await session.run("MATCH (n) DETACH DELETE n")
        logger.info("✅ Graph cleared")
    
    async def create_agent_nodes(self) -> int:
        """Create Agent nodes in Neo4j"""
        logger.info("Creating Agent nodes...")
        
        # Fetch agents from Supabase with direct columns
        response = self.supabase.table("agents").select(
            "id, name, description, agent_level_id, role_name, department_name, function_name, status, created_at"
        ).eq("status", "active").execute()
        agents = response.data
        
        async with self.neo4j_driver.session() as session:
            for agent in agents:
                await session.run("""
                    MERGE (a:Agent {id: $id})
                    SET a.name = $name,
                        a.description = $description,
                        a.agent_level = $agent_level,
                        a.role = $role,
                        a.department = $department,
                        a.function = $function,
                        a.status = $status,
                        a.created_at = datetime($created_at),
                        a.updated_at = datetime()
                """,
                    id=str(agent['id']),
                    name=agent.get('name', ''),
                    description=agent.get('description', ''),
                    agent_level=agent.get('agent_level_id', 'unknown'),
                    role=agent.get('role_name', ''),
                    department=agent.get('department_name', ''),
                    function=agent.get('function_name', ''),
                    status=agent.get('status', 'active'),
                    created_at=agent.get('created_at', '')
                )
        
        logger.info(f"✅ Created {len(agents)} Agent nodes")
        return len(agents)
    
    async def create_skill_nodes(self) -> int:
        """Create Skill nodes in Neo4j"""
        logger.info("Creating Skill nodes...")
        
        # Fetch skills from Supabase
        response = self.supabase.table("skills").select("*").eq("is_active", True).execute()
        skills = response.data
        
        async with self.neo4j_driver.session() as session:
            for skill in skills:
                await session.run("""
                    MERGE (s:Skill {id: $id})
                    SET s.name = $name,
                        s.description = $description,
                        s.category = $category,
                        s.complexity_level = $complexity_level,
                        s.is_active = $is_active,
                        s.updated_at = datetime()
                """,
                    id=str(skill['id']),
                    name=skill.get('name', ''),
                    description=skill.get('description', ''),
                    category=skill.get('category', ''),
                    complexity_level=skill.get('complexity_level', 'basic'),
                    is_active=skill.get('is_active', True)
                )
        
        logger.info(f"✅ Created {len(skills)} Skill nodes")
        return len(skills)
    
    async def create_tool_nodes(self) -> int:
        """Create Tool nodes in Neo4j"""
        logger.info("Creating Tool nodes...")
        
        # Fetch tools from Supabase
        response = self.supabase.table("tools").select("*").eq("is_active", True).execute()
        tools = response.data
        
        async with self.neo4j_driver.session() as session:
            for tool in tools:
                await session.run("""
                    MERGE (t:Tool {id: $id})
                    SET t.name = $name,
                        t.description = $description,
                        t.tool_type = $tool_type,
                        t.is_active = $is_active,
                        t.updated_at = datetime()
                """,
                    id=str(tool['id']),
                    name=tool.get('name', ''),
                    description=tool.get('description', ''),
                    tool_type=tool.get('tool_type', 'general'),
                    is_active=tool.get('is_active', True)
                )
        
        logger.info(f"✅ Created {len(tools)} Tool nodes")
        return len(tools)
    
    async def create_knowledge_nodes(self) -> int:
        """Create Knowledge Domain nodes in Neo4j"""
        logger.info("Creating Knowledge Domain nodes...")
        
        # Fetch knowledge domains from Supabase
        response = self.supabase.table("knowledge_domains").select("*").eq("is_active", True).execute()
        domains = response.data
        
        async with self.neo4j_driver.session() as session:
            for domain in domains:
                await session.run("""
                    MERGE (k:KnowledgeDomain {id: $id})
                    SET k.name = $name,
                        k.description = $description,
                        k.domain_type = $domain_type,
                        k.is_active = $is_active,
                        k.updated_at = datetime()
                """,
                    id=str(domain['id']),
                    name=domain.get('name', ''),
                    description=domain.get('description', ''),
                    domain_type=domain.get('domain_type', 'general'),
                    is_active=domain.get('is_active', True)
                )
        
        logger.info(f"✅ Created {len(domains)} Knowledge Domain nodes")
        return len(domains)
    
    async def create_agent_skill_relationships(self) -> int:
        """Create HAS_SKILL relationships"""
        logger.info("Creating HAS_SKILL relationships...")
        
        # Fetch agent-skill mappings
        response = self.supabase.table("agent_skills").select("*").execute()
        mappings = response.data
        
        async with self.neo4j_driver.session() as session:
            for mapping in mappings:
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (s:Skill {id: $skill_id})
                    MERGE (a)-[r:HAS_SKILL]->(s)
                    SET r.proficiency_level = $proficiency,
                        r.is_primary = $is_primary,
                        r.updated_at = datetime()
                """,
                    agent_id=str(mapping['agent_id']),
                    skill_id=str(mapping['skill_id']),
                    proficiency=mapping.get('proficiency_level', 'intermediate'),
                    is_primary=mapping.get('is_primary', False)
                )
        
        logger.info(f"✅ Created {len(mappings)} HAS_SKILL relationships")
        return len(mappings)
    
    async def create_agent_tool_relationships(self) -> int:
        """Create USES_TOOL relationships"""
        logger.info("Creating USES_TOOL relationships...")
        
        # Fetch agent-tool mappings from agent_tool_assignments table
        response = self.supabase.table("agent_tool_assignments").select("*").execute()
        mappings = response.data
        
        async with self.neo4j_driver.session() as session:
            for mapping in mappings:
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (t:Tool {id: $tool_id})
                    MERGE (a)-[r:USES_TOOL]->(t)
                    SET r.is_primary = $is_primary,
                        r.updated_at = datetime()
                """,
                    agent_id=str(mapping['agent_id']),
                    tool_id=str(mapping['tool_id']),
                    is_primary=mapping.get('is_primary', False)
                )
        
        logger.info(f"✅ Created {len(mappings)} USES_TOOL relationships")
        return len(mappings)
    
    async def create_agent_knowledge_relationships(self) -> int:
        """Create KNOWS_ABOUT relationships"""
        logger.info("Creating KNOWS_ABOUT relationships...")
        
        # Fetch agent-knowledge mappings from agent_knowledge_domains table
        try:
            response = self.supabase.table("agent_knowledge_domains").select("*").execute()
            mappings = response.data
        except Exception as e:
            logger.info(f"ℹ️  Knowledge domains table not available (non-critical): {e}")
            return 0
        
        if not mappings:
            logger.info("ℹ️  No knowledge domain mappings found")
            return 0
        
        async with self.neo4j_driver.session() as session:
            for mapping in mappings:
                # Match by domain_name instead of id since agent_knowledge_domains uses TEXT
                await session.run("""
                    MATCH (a:Agent {id: $agent_id})
                    MATCH (k:KnowledgeDomain {name: $domain_name})
                    MERGE (a)-[r:KNOWS_ABOUT]->(k)
                    SET r.expertise_level = $expertise,
                        r.updated_at = datetime()
                """,
                    agent_id=str(mapping['agent_id']),
                    domain_name=mapping['domain_name'],
                    expertise=mapping.get('expertise_level', 'intermediate')
                )
        
        logger.info(f"✅ Created {len(mappings)} KNOWS_ABOUT relationships")
        return len(mappings)
    
    async def create_agent_hierarchy_relationships(self) -> int:
        """Create DELEGATES_TO relationships"""
        logger.info("Creating DELEGATES_TO relationships...")
        
        # Fetch agent hierarchies
        response = self.supabase.table("agent_hierarchies").select("*").execute()
        hierarchies = response.data
        
        async with self.neo4j_driver.session() as session:
            for rel in hierarchies:
                await session.run("""
                    MATCH (parent:Agent {id: $parent_id})
                    MATCH (child:Agent {id: $child_id})
                    MERGE (parent)-[r:DELEGATES_TO]->(child)
                    SET r.relationship_type = $rel_type,
                        r.delegation_level = $level,
                        r.updated_at = datetime()
                """,
                    parent_id=str(rel['parent_agent_id']),
                    child_id=str(rel['child_agent_id']),
                    rel_type=rel.get('relationship_type', 'delegates'),
                    level=rel.get('delegation_level', 1)
                )
        
        logger.info(f"✅ Created {len(hierarchies)} DELEGATES_TO relationships")
        return len(hierarchies)
    
    async def verify_graph(self):
        """Verify the loaded graph"""
        logger.info("Verifying graph data...")
        
        async with self.neo4j_driver.session() as session:
            # Count nodes
            result = await session.run("MATCH (a:Agent) RETURN count(a) AS count")
            agent_count = (await result.single())['count']
            
            result = await session.run("MATCH (s:Skill) RETURN count(s) AS count")
            skill_count = (await result.single())['count']
            
            result = await session.run("MATCH (t:Tool) RETURN count(t) AS count")
            tool_count = (await result.single())['count']
            
            result = await session.run("MATCH (k:KnowledgeDomain) RETURN count(k) AS count")
            knowledge_count = (await result.single())['count']
            
            # Count relationships
            result = await session.run("MATCH ()-[r:HAS_SKILL]->() RETURN count(r) AS count")
            skill_rel_count = (await result.single())['count']
            
            result = await session.run("MATCH ()-[r:USES_TOOL]->() RETURN count(r) AS count")
            tool_rel_count = (await result.single())['count']
            
            result = await session.run("MATCH ()-[r:KNOWS_ABOUT]->() RETURN count(r) AS count")
            knowledge_rel_count = (await result.single())['count']
            
            result = await session.run("MATCH ()-[r:DELEGATES_TO]->() RETURN count(r) AS count")
            hierarchy_rel_count = (await result.single())['count']
            
            logger.info("="*60)
            logger.info("📊 Graph Verification Results:")
            logger.info(f"   Nodes:")
            logger.info(f"     - Agents: {agent_count}")
            logger.info(f"     - Skills: {skill_count}")
            logger.info(f"     - Tools: {tool_count}")
            logger.info(f"     - Knowledge Domains: {knowledge_count}")
            logger.info(f"   Relationships:")
            logger.info(f"     - HAS_SKILL: {skill_rel_count}")
            logger.info(f"     - USES_TOOL: {tool_rel_count}")
            logger.info(f"     - KNOWS_ABOUT: {knowledge_rel_count}")
            logger.info(f"     - DELEGATES_TO: {hierarchy_rel_count}")
            logger.info("="*60)
    
    async def run(self):
        """Main pipeline execution"""
        start_time = datetime.now()
        
        logger.info("="*60)
        logger.info("🚀 Agent Graph Loading Pipeline Starting")
        logger.info("="*60)
        
        try:
            # Step 1: Clear existing data if requested
            await self.clear_graph()
            
            # Step 2: Create nodes
            agent_count = await self.create_agent_nodes()
            skill_count = await self.create_skill_nodes()
            tool_count = await self.create_tool_nodes()
            knowledge_count = await self.create_knowledge_nodes()
            
            # Step 3: Create relationships
            skill_rel_count = await self.create_agent_skill_relationships()
            tool_rel_count = await self.create_agent_tool_relationships()
            knowledge_rel_count = await self.create_agent_knowledge_relationships()
            hierarchy_rel_count = await self.create_agent_hierarchy_relationships()
            
            # Step 4: Verify
            await self.verify_graph()
            
            # Done!
            elapsed = (datetime.now() - start_time).total_seconds()
            
            logger.info("="*60)
            logger.info(f"✅ Pipeline Complete!")
            logger.info(f"   Total Nodes: {agent_count + skill_count + tool_count + knowledge_count}")
            logger.info(f"   Total Relationships: {skill_rel_count + tool_rel_count + knowledge_rel_count + hierarchy_rel_count}")
            logger.info(f"   Time Elapsed: {elapsed:.2f}s")
            logger.info("="*60)
        
        finally:
            await self.neo4j_driver.close()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Load agents to Neo4j knowledge graph")
    parser.add_argument("--clear-existing", action="store_true", help="Clear existing graph data before loading")
    args = parser.parse_args()
    
    # Load environment variables
    required_env_vars = [
        'NEO4J_URI',
        'NEO4J_USER',
        'NEO4J_PASSWORD',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    # Initialize loader
    loader = AgentGraphLoader(
        neo4j_uri=os.getenv('NEO4J_URI'),
        neo4j_user=os.getenv('NEO4J_USER'),
        neo4j_password=os.getenv('NEO4J_PASSWORD'),
        supabase_url=os.getenv('SUPABASE_URL'),
        supabase_key=os.getenv('SUPABASE_SERVICE_KEY'),
        clear_existing=args.clear_existing
    )
    
    # Run pipeline
    asyncio.run(loader.run())


if __name__ == "__main__":
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.dev.ConsoleRenderer()
        ]
    )
    main()
