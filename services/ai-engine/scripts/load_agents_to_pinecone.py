#!/usr/bin/env python3
"""
Load Medical Affairs agents to Pinecone vector database
Generates embeddings for all active agents for semantic search

Usage:
    python load_agents_to_pinecone.py [--batch-size 100] [--dry-run]

Environment Variables Required:
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
    PINECONE_API_KEY
    OPENAI_API_KEY
"""

import asyncio
import os
import sys
import json
from typing import List, Dict, Any
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    import structlog
    from openai import OpenAI
    from pinecone import Pinecone, ServerlessSpec
    from supabase import create_client, Client
except ImportError as e:
    print(f"Error importing required packages: {e}")
    print("Please install: pip install structlog openai pinecone-client supabase")
    sys.exit(1)

logger = structlog.get_logger()


class AgentEmbeddingPipeline:
    """Pipeline for generating and loading agent embeddings to Pinecone"""
    
    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
        pinecone_api_key: str,
        openai_api_key: str,
        batch_size: int = 100,
        dry_run: bool = False
    ):
        self.batch_size = batch_size
        self.dry_run = dry_run
        
        # Initialize clients
        logger.info("Initializing clients...")
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.pinecone = Pinecone(api_key=pinecone_api_key)
        self.openai_client = OpenAI(api_key=openai_api_key)
        
        # Initialize or get Pinecone index
        self.index_name = "vital-medical-agents"
        self.dimension = 1536  # OpenAI text-embedding-3-small dimension
        
        if not dry_run:
            self._init_pinecone_index()
        
        logger.info("✅ All clients initialized")
    
    def _init_pinecone_index(self):
        """Initialize Pinecone index if it doesn't exist"""
        existing_indexes = [idx.name for idx in self.pinecone.list_indexes()]
        
        if self.index_name not in existing_indexes:
            logger.info(f"Creating new Pinecone index: {self.index_name}")
            self.pinecone.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            logger.info(f"✅ Created index: {self.index_name}")
        else:
            logger.info(f"Using existing index: {self.index_name}")
        
        self.index = self.pinecone.Index(self.index_name)
    
    async def fetch_agents(self) -> List[Dict[str, Any]]:
        """Fetch all active agents from Supabase"""
        logger.info("Fetching agents from Supabase...")
        
        response = self.supabase.table("agents").select(
            """
            id,
            name,
            description,
            system_prompt,
            agent_level_id,
            status,
            role_name,
            department_name,
            function_name,
            metadata
            """
        ).eq("status", "active").execute()
        
        agents = response.data
        logger.info(f"✅ Fetched {len(agents)} active agents")
        
        return agents
    
    async def fetch_agent_enrichments(self, agent_ids: List[str]) -> Dict[str, Dict]:
        """Fetch enrichment data for agents (skills, tools, knowledge)"""
        logger.info("Fetching agent enrichment data...")
        
        enrichments = {}
        
        # Fetch skills
        try:
            skills_response = self.supabase.table("agent_skills").select(
                "agent_id, skill_id, skills(name)"
            ).in_("agent_id", agent_ids).execute()
            
            for row in skills_response.data:
                agent_id = row['agent_id']
                if agent_id not in enrichments:
                    enrichments[agent_id] = {'skills': [], 'tools': [], 'knowledge': []}
                if row.get('skills'):
                    enrichments[agent_id]['skills'].append(row['skills']['name'])
        except Exception as e:
            logger.warning(f"Error fetching skills: {e}")
        
        # Fetch tools
        try:
            tools_response = self.supabase.table("agent_tools").select(
                "agent_id, tool_id, tools(name)"
            ).in_("agent_id", agent_ids).execute()
            
            for row in tools_response.data:
                agent_id = row['agent_id']
                if agent_id not in enrichments:
                    enrichments[agent_id] = {'skills': [], 'tools': [], 'knowledge': []}
                if row.get('tools'):
                    enrichments[agent_id]['tools'].append(row['tools']['name'])
        except Exception as e:
            logger.warning(f"Error fetching tools: {e}")
        
        # Fetch knowledge domains (optional - table may not exist)
        try:
            # Use agent_knowledge_domains table (not agent_knowledge)
            knowledge_response = self.supabase.table("agent_knowledge_domains").select(
                "agent_id, domain_name"
            ).in_("agent_id", agent_ids).execute()
            
            for row in knowledge_response.data:
                agent_id = row['agent_id']
                if agent_id not in enrichments:
                    enrichments[agent_id] = {'skills': [], 'tools': [], 'knowledge': []}
                if row.get('domain_name'):
                    enrichments[agent_id]['knowledge'].append(row['domain_name'])
        except Exception as e:
            # Knowledge domains table is optional - log but don't fail
            logger.info(f"ℹ️  Knowledge domains table not available (non-critical): {e}")
        
        logger.info(f"✅ Fetched enrichment data for {len(enrichments)} agents")
        return enrichments
    
    def create_agent_text_representation(self, agent: Dict, enrichments: Dict) -> str:
        """Create rich text representation for embedding"""
        agent_id = agent['id']
        enrichment = enrichments.get(agent_id, {'skills': [], 'tools': [], 'knowledge': []})
        
        # Build comprehensive text
        parts = [
            f"Agent Name: {agent['name']}",
            f"Description: {agent.get('description', 'N/A')}",
        ]
        
        # Add direct fields from agents table (not metadata)
        if agent.get('role_name'):
            parts.append(f"Role: {agent['role_name']}")
        if agent.get('department_name'):
            parts.append(f"Department: {agent['department_name']}")
        if agent.get('function_name'):
            parts.append(f"Function: {agent['function_name']}")
        
        # Add skills
        if enrichment['skills']:
            parts.append(f"Skills: {', '.join(enrichment['skills'][:10])}")  # Top 10
        
        # Add tools
        if enrichment['tools']:
            parts.append(f"Tools: {', '.join(enrichment['tools'][:5])}")  # Top 5
        
        # Add knowledge domains
        if enrichment['knowledge']:
            parts.append(f"Knowledge Domains: {', '.join(enrichment['knowledge'][:5])}")
        
        # Add excerpt from system prompt (if available)
        if agent.get('system_prompt'):
            prompt_excerpt = agent['system_prompt'][:200]
            parts.append(f"Expertise: {prompt_excerpt}")
        
        return "\n".join(parts)
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI"""
        logger.info(f"Generating embeddings for {len(texts)} texts...")
        
        if self.dry_run:
            logger.info("DRY RUN: Skipping actual embedding generation")
            return [[0.0] * self.dimension for _ in texts]
        
        response = self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=texts
        )
        
        embeddings = [item.embedding for item in response.data]
        logger.info(f"✅ Generated {len(embeddings)} embeddings")
        
        return embeddings
    
    def upsert_to_pinecone(self, vectors: List[Dict[str, Any]]):
        """Upsert vectors to Pinecone in batches"""
        if self.dry_run:
            logger.info(f"DRY RUN: Would upsert {len(vectors)} vectors to Pinecone")
            return
        
        logger.info(f"Upserting {len(vectors)} vectors to Pinecone...")
        
        # Upsert in batches
        for i in range(0, len(vectors), self.batch_size):
            batch = vectors[i:i + self.batch_size]
            self.index.upsert(vectors=batch)
            logger.info(f"  Upserted batch {i // self.batch_size + 1} ({len(batch)} vectors)")
        
        logger.info(f"✅ Upserted all {len(vectors)} vectors")
    
    async def run(self):
        """Main pipeline execution"""
        start_time = datetime.now()
        
        logger.info("="*60)
        logger.info("🚀 Agent Embedding Pipeline Starting")
        logger.info("="*60)
        
        # Step 1: Fetch agents
        agents = await self.fetch_agents()
        
        if not agents:
            logger.error("❌ No agents found!")
            return
        
        # Step 2: Fetch enrichments
        agent_ids = [agent['id'] for agent in agents]
        enrichments = await self.fetch_agent_enrichments(agent_ids)
        
        # Step 3: Create text representations
        logger.info("Creating text representations...")
        texts = []
        agent_metadata = []
        
        for agent in agents:
            text = self.create_agent_text_representation(agent, enrichments)
            texts.append(text)
            
            # Prepare metadata for Pinecone
            metadata = agent.get('metadata', {})
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except:
                    metadata = {}
            
            agent_meta = {
                'agent_id': agent['id'],
                'name': agent['name'],
                'description': (agent.get('description', '') or '')[:500],  # Pinecone metadata limit
                'type': 'agent',
                'status': agent.get('status', 'active')
            }
            
            # Add agent_level only if not null
            if agent.get('agent_level_id'):
                agent_meta['agent_level'] = agent['agent_level_id']
            
            # Add optional fields from agents table (not metadata)
            if agent.get('role_name'):
                agent_meta['role'] = agent['role_name']
            if agent.get('department_name'):
                agent_meta['department'] = agent['department_name']
            if agent.get('function_name'):
                agent_meta['function'] = agent['function_name']
            
            agent_metadata.append(agent_meta)
        
        logger.info(f"✅ Created {len(texts)} text representations")
        
        # Step 4: Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Step 5: Prepare vectors for Pinecone
        vectors = []
        for i, agent in enumerate(agents):
            vectors.append({
                'id': agent['id'],
                'values': embeddings[i],
                'metadata': agent_metadata[i]
            })
        
        # Step 6: Upsert to Pinecone
        self.upsert_to_pinecone(vectors)
        
        # Done!
        elapsed = (datetime.now() - start_time).total_seconds()
        
        logger.info("="*60)
        logger.info(f"✅ Pipeline Complete!")
        logger.info(f"   Total Agents: {len(agents)}")
        logger.info(f"   Total Vectors: {len(vectors)}")
        logger.info(f"   Time Elapsed: {elapsed:.2f}s")
        logger.info("="*60)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Load agents to Pinecone vector database")
    parser.add_argument("--batch-size", type=int, default=100, help="Batch size for upserting (default: 100)")
    parser.add_argument("--dry-run", action="store_true", help="Run without actually upserting to Pinecone")
    args = parser.parse_args()
    
    # Load environment variables
    required_env_vars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'PINECONE_API_KEY',
        'OPENAI_API_KEY'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    # Initialize pipeline
    pipeline = AgentEmbeddingPipeline(
        supabase_url=os.getenv('SUPABASE_URL'),
        supabase_key=os.getenv('SUPABASE_SERVICE_KEY'),
        pinecone_api_key=os.getenv('PINECONE_API_KEY'),
        openai_api_key=os.getenv('OPENAI_API_KEY'),
        batch_size=args.batch_size,
        dry_run=args.dry_run
    )
    
    # Run pipeline
    asyncio.run(pipeline.run())


if __name__ == "__main__":
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.add_log_level,
            structlog.dev.ConsoleRenderer()
        ]
    )
    main()
