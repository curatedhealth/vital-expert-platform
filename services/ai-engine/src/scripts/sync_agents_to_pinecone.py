#!/usr/bin/env python3
"""
Sync Agents from Supabase to Pinecone

This script:
1. Connects to Supabase and fetches all active agents
2. Generates embeddings for each agent
3. Syncs agents to Pinecone index "vital-knowledge" in "agents" namespace
4. Verifies the sync was successful

Usage:
    python scripts/sync_agents_to_pinecone.py
"""

import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog

# Add src directory to path (where services module is)
src_dir = Path(__file__).parent.parent
sys.path.insert(0, str(src_dir))

from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI
from services.supabase_client import SupabaseClient
from core.config import get_settings

# Load environment variables from multiple possible locations
root_dir = Path(__file__).parent.parent.parent.parent.parent  # services/ai-engine/src/scripts -> root (VITAL path)
env_paths = [
    root_dir / '.env.vercel',  # Root .env.vercel (preferred for service role key)
    root_dir / '.env.local',  # Root .env.local
]

logger = structlog.get_logger()

env_loaded = False
loaded_from = None
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        env_loaded = True
        loaded_from = env_path.name
        logger.info(f"✅ Loaded environment from {env_path.name}")
        break

if env_loaded:
    logger.info(f"✅ Environment variables loaded from {loaded_from}")
else:
    logger.warning("⚠️ No .env file found, using system environment variables")

# Map NEXT_PUBLIC_* variables to non-public versions if needed
if not os.getenv('SUPABASE_URL') and os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    os.environ['SUPABASE_URL'] = os.getenv('NEXT_PUBLIC_SUPABASE_URL').strip('"')
    logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL")

# Use NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY if available
if not os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY') == 'your_actual_key':
    if os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY').strip('"')
        logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to SUPABASE_SERVICE_ROLE_KEY")
    elif os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY').strip('"')
        logger.warning("⚠️ Using SUPABASE_ANON_KEY as SUPABASE_SERVICE_ROLE_KEY (read-only mode)")

async def build_agent_profile_text(agent: Dict[str, Any]) -> str:
    """Build comprehensive agent profile text for embedding (matches actual agents table structure)"""
    parts = []
    
    # Agent name and title
    if agent.get('name'):
        parts.append(f"Agent Name: {agent['name']}")
    if agent.get('title'):
        parts.append(f"Title: {agent['title']}")
    
    # Description
    if agent.get('description'):
        parts.append(f"Description: {agent['description']}")
    
    # System prompt (expertise)
    if agent.get('system_prompt'):
        parts.append(f"Expertise: {agent['system_prompt'][:1000]}")  # First 1000 chars
    
    # Background
    if agent.get('background'):
        parts.append(f"Background: {agent['background']}")
    
    # Capabilities (array)
    capabilities = agent.get('capabilities', [])
    if isinstance(capabilities, list) and capabilities:
        parts.append(f"Capabilities: {', '.join(str(c) for c in capabilities)}")
    elif isinstance(capabilities, str):
        parts.append(f"Capabilities: {capabilities}")
    
    # Expertise (array)
    expertise = agent.get('expertise', [])
    if isinstance(expertise, list) and expertise:
        parts.append(f"Expertise Areas: {', '.join(str(e) for e in expertise)}")
    elif isinstance(expertise, str):
        parts.append(f"Expertise Areas: {expertise}")
    
    # Specialties (array)
    specialties = agent.get('specialties', [])
    if isinstance(specialties, list) and specialties:
        parts.append(f"Specialties: {', '.join(str(s) for s in specialties)}")
    elif isinstance(specialties, str):
        parts.append(f"Specialties: {specialties}")
    
    # Personality traits
    personality = agent.get('personality_traits', [])
    if isinstance(personality, list) and personality:
        parts.append(f"Personality: {', '.join(str(p) for p in personality)}")
    
    # Communication style
    if agent.get('communication_style'):
        parts.append(f"Communication Style: {agent['communication_style']}")
    
    return "\n".join(parts)

async def sync_agents_to_pinecone(
    supabase: SupabaseClient,
    pinecone_index,
    openai_client: OpenAI,
    batch_size: int = 10
) -> Dict[str, Any]:
    """
    Sync all agents from Supabase to Pinecone.
    
    Args:
        supabase: Supabase client
        pinecone_index: Pinecone index object
        openai_client: OpenAI client for embeddings
        batch_size: Batch size for processing
    
    Returns:
        Dictionary with sync statistics
    """
    try:
        # Fetch all agents from Supabase
        logger.info("📊 Fetching agents from Supabase...")
        if not supabase.client:
            logger.error("❌ Supabase client not initialized")
            return {"success": False, "error": "Supabase client not initialized"}
        
        result = supabase.client.table('agents').select('*').execute()
        agents = result.data if result.data else []
        
        if not agents:
            logger.warning("⚠️ No agents found in Supabase")
            return {"success": True, "synced": 0, "failed": 0, "total": 0}
        
        logger.info(f"✅ Found {len(agents)} agents to sync")
        
        # Use "agent" namespace (singular as per user specification)
        # Pinecone v3 API: namespace is a parameter, not a method
        namespace_name = 'agent'
        
        # Process agents in batches
        processed = 0
        failed = 0
        vectors = []
        
        for i, agent in enumerate(agents):
            try:
                # Build agent profile text
                profile_text = await build_agent_profile_text(agent)
                
                # Generate embedding
                logger.info(f"🔄 Processing agent {i+1}/{len(agents)}: {agent.get('name', agent.get('id', 'Unknown'))}")
                
                embedding_response = openai_client.embeddings.create(
                    model='text-embedding-3-large',
                    input=profile_text[:8000]  # Limit to 8000 chars
                )
                embedding = embedding_response.data[0].embedding
                
                # Prepare metadata (match actual agents table structure)
                capabilities = agent.get('capabilities', [])
                if isinstance(capabilities, str):
                    capabilities = [c.strip() for c in capabilities.split(',')]
                elif not isinstance(capabilities, list):
                    capabilities = []
                
                expertise = agent.get('expertise', [])
                if isinstance(expertise, str):
                    expertise = [e.strip() for e in expertise.split(',')]
                elif not isinstance(expertise, list):
                    expertise = []
                
                specialties = agent.get('specialties', [])
                if isinstance(specialties, str):
                    specialties = [s.strip() for s in specialties.split(',')]
                elif not isinstance(specialties, list):
                    specialties = []
                
                # Get display name (use title or name)
                display_name = agent.get('title') or agent.get('name', '')
                
                metadata = {
                    'agent_id': agent['id'],
                    'agent_name': agent.get('name', ''),
                    'agent_title': agent.get('title', ''),
                    'agent_display_name': display_name,
                    'description': agent.get('description', ''),
                    'capabilities': capabilities,
                    'expertise': expertise,
                    'specialties': specialties,
                    'is_active': agent.get('is_active', True),
                    'model': agent.get('model'),
                    'temperature': float(agent.get('temperature', 0.7)) if agent.get('temperature') else None,
                    'max_tokens': int(agent.get('max_tokens', 2000)) if agent.get('max_tokens') else None,
                    'embedding_type': 'agent_profile',
                    'entity_type': 'agent',
                    'timestamp': datetime.now().isoformat(),
                }
                
                # Add optional fields
                if agent.get('background'):
                    metadata['background'] = agent['background']
                if agent.get('personality_traits'):
                    metadata['personality_traits'] = agent['personality_traits'] if isinstance(agent['personality_traits'], list) else [agent['personality_traits']]
                if agent.get('communication_style'):
                    metadata['communication_style'] = agent['communication_style']
                if agent.get('slug'):
                    metadata['slug'] = agent['slug']
                
                vectors.append({
                    'id': agent['id'],
                    'values': embedding,
                    'metadata': metadata
                })
                
                # Upsert in batches
                if len(vectors) >= batch_size:
                    try:
                        agents_namespace.upsert(vectors=vectors)
                        processed += len(vectors)
                        logger.info(f"✅ Synced batch of {len(vectors)} agents to Pinecone")
                        vectors = []
                    except Exception as e:
                        logger.error(f"❌ Failed to upsert batch: {e}")
                        failed += len(vectors)
                        vectors = []
                
            except Exception as e:
                logger.error(f"❌ Failed to process agent {agent.get('id', 'Unknown')}: {e}")
                failed += 1
        
        # Upsert remaining vectors
        if vectors:
            try:
                # Use v3 API (namespace as parameter)
                try:
                    pinecone_index.upsert(vectors=vectors, namespace=namespace_name)
                except TypeError:
                    # Fallback to v2 API (namespace as method)
                    agents_namespace = pinecone_index.namespace(namespace_name)
                    agents_namespace.upsert(vectors=vectors)
                processed += len(vectors)
                logger.info(f"✅ Synced final batch of {len(vectors)} agents to Pinecone")
            except Exception as e:
                logger.error(f"❌ Failed to upsert final batch: {e}")
                failed += len(vectors)
        
        logger.info(f"🎉 Agent sync complete: {processed} synced, {failed} failed")
        
        return {
            "success": True,
            "synced": processed,
            "failed": failed,
            "total": len(agents)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync agents to Pinecone: {e}")
        return {"success": False, "error": str(e)}

async def verify_pinecone_connection(
    pinecone_index,
    namespace: str = 'agent'
) -> Dict[str, Any]:
    """
    Verify Pinecone connection and check namespace stats.
    
    Args:
        pinecone_index: Pinecone index object
        namespace: Namespace to check
    
    Returns:
        Dictionary with connection status and stats
    """
    try:
        # Get namespace
        # Try v3 API first (namespace as parameter)
        try:
            stats = pinecone_index.describe_index_stats(namespace=namespace)
        except TypeError:
            # Fallback to v2 API (namespace as method)
            agents_namespace = pinecone_index.namespace(namespace)
            stats = agents_namespace.describe_index_stats()
        
        logger.info(f"✅ Pinecone connection verified")
        logger.info(f"   Namespace: {namespace}")
        logger.info(f"   Stats: {stats}")
        
        return {
            "connected": True,
            "namespace": namespace,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to verify Pinecone connection: {e}")
        return {"connected": False, "error": str(e)}

async def main():
    """Main function to sync agents to Pinecone"""
    logger.info("🚀 Starting agent sync to Pinecone...")
    
    # Initialize services
    settings = get_settings()
    supabase = SupabaseClient()
    await supabase.initialize()
    
    if not supabase.client:
        logger.error("❌ Supabase client not initialized")
        return
    
    # Initialize Pinecone
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "vital-knowledge")
    
    if not pinecone_api_key:
        logger.error("❌ PINECONE_API_KEY not set")
        return
    
    try:
        pinecone = Pinecone(api_key=pinecone_api_key)
        pinecone_index = pinecone.Index(pinecone_index_name)
        logger.info(f"✅ Connected to Pinecone index: {pinecone_index_name}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Pinecone: {e}")
        return
    
    # Initialize OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("❌ OPENAI_API_KEY not set")
        return
    
    openai_client = OpenAI(api_key=openai_api_key)
    logger.info("✅ OpenAI client initialized")
    
    # Verify Pinecone connection (skip if verification fails, but continue)
    logger.info("🔍 Verifying Pinecone connection...")
    try:
        verification = await verify_pinecone_connection(pinecone_index, namespace='agent')
        if verification.get("connected"):
            logger.info("✅ Pinecone connection verified")
        else:
            logger.warning("⚠️ Pinecone connection verification failed, but continuing...")
    except Exception as e:
        logger.warning(f"⚠️ Pinecone verification skipped: {e}, continuing...")
    
    # Sync agents to Pinecone
    logger.info("🔄 Syncing agents to Pinecone...")
    result = await sync_agents_to_pinecone(
        supabase=supabase,
        pinecone_index=pinecone_index,
        openai_client=openai_client,
        batch_size=10
    )
    
    if result.get("success"):
        logger.info(f"✅ Sync complete: {result.get('synced', 0)} agents synced")
        if result.get("failed", 0) > 0:
            logger.warning(f"⚠️ {result.get('failed', 0)} agents failed to sync")
    else:
        logger.error(f"❌ Sync failed: {result.get('error', 'Unknown error')}")
    
    # Final verification (optional)
    logger.info("🔍 Verifying final state...")
    try:
        final_verification = await verify_pinecone_connection(pinecone_index, namespace='agent')
        if final_verification.get("connected"):
            logger.info("✅ Final verification complete")
            logger.info(f"   Stats: {final_verification.get('stats', {})}")
    except Exception as e:
        logger.warning(f"⚠️ Final verification skipped: {e}")

if __name__ == "__main__":
    asyncio.run(main())

