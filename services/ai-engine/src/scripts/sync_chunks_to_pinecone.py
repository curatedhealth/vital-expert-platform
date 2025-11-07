#!/usr/bin/env python3
"""
Sync Document Chunks to Pinecone RAG Index

This script:
1. Fetches all document chunks from Supabase document_chunks table
2. Groups chunks by domain_id
3. Maps domain_id to namespace slug (using knowledge_domains table)
4. Syncs chunks to Pinecone RAG index (vital-rag-production) with domain-specific namespaces

Usage:
    python scripts/sync_chunks_to_pinecone.py
    python scripts/sync_chunks_to_pinecone.py --domains "Digital Health" "Regulatory Affairs"
    python scripts/sync_chunks_to_pinecone.py --all
"""

import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import structlog
from datetime import datetime, timezone

# Add src directory to path (where services module is)
src_dir = Path(__file__).parent.parent
sys.path.insert(0, str(src_dir))

from dotenv import load_dotenv
from services.supabase_client import SupabaseClient
from services.embedding_service_factory import EmbeddingServiceFactory
from core.config import get_settings
from pinecone import Pinecone
from openai import OpenAI

# Initialize logger early
logger = structlog.get_logger()

# Load environment variables from multiple possible locations
script_path = Path(__file__)
root_dir = script_path.parent.parent.parent.parent.parent
env_paths = [
    root_dir / '.env.vercel',
    root_dir / '.env.local',
]

env_loaded = False
loaded_from = None
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        env_loaded = True
        loaded_from = env_path.name
        logger.info(f"✅ Loaded environment from {env_path.name}")
        break

if not env_loaded:
    if (Path.cwd() / '.env.vercel').exists():
        load_dotenv(Path.cwd() / '.env.vercel', override=True)
        env_loaded = True
        loaded_from = '.env.vercel'
    elif (Path.cwd() / '.env.local').exists():
        load_dotenv(Path.cwd() / '.env.local', override=True)
        env_loaded = True
        loaded_from = '.env.local'

if env_loaded:
    logger.info(f"✅ Environment variables loaded from {loaded_from}")
else:
    logger.error("❌ No .env file found, cannot proceed with chunk sync.")
    sys.exit(1)

# Map NEXT_PUBLIC_* variables to non-public versions if needed
if not os.getenv('SUPABASE_URL') and os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    os.environ['SUPABASE_URL'] = os.getenv('NEXT_PUBLIC_SUPABASE_URL').strip('"')
    logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL")

if not os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY') == 'your_actual_key':
    if os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY').strip('"')
        logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to SUPABASE_SERVICE_ROLE_KEY")
    elif os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY').strip('"')
        logger.warning("⚠️ Using SUPABASE_ANON_KEY as SUPABASE_SERVICE_ROLE_KEY (read-only mode)")

if not os.getenv('OPENAI_API_KEY') and os.getenv('NEXT_PUBLIC_OPENAI_API_KEY'):
    os.environ['OPENAI_API_KEY'] = os.getenv('NEXT_PUBLIC_OPENAI_API_KEY').strip('"')
    logger.info("✅ Mapped NEXT_PUBLIC_OPENAI_API_KEY to OPENAI_API_KEY")


async def get_domain_namespace_mapping(supabase: SupabaseClient) -> Dict[str, str]:
    """
    Get mapping from domain_id to namespace slug.
    
    Returns:
        Dictionary mapping domain_id -> namespace slug
    """
    try:
        if not supabase.client:
            logger.error("❌ Supabase client not initialized for domain mapping")
            return {}
        
        result = supabase.client.table('knowledge_domains').select('domain_id, slug, domain_name').execute()
        
        mapping = {}
        for domain in result.data:
            domain_id = domain.get('domain_id')
            slug = domain.get('slug') or domain.get('domain_name', '').lower().replace(' ', '-')
            # Sanitize namespace name for Pinecone (max 64 chars, lowercase, hyphens only)
            namespace = slug.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
            mapping[domain_id] = namespace
            logger.debug(f"✅ Mapped domain {domain_id} -> namespace '{namespace}'")
        
        logger.info(f"✅ Loaded {len(mapping)} domain namespace mappings")
        return mapping
    except Exception as e:
        logger.error(f"❌ Failed to load domain namespace mapping: {e}")
        return {}


async def get_chunks_from_supabase(
    supabase: SupabaseClient,
    domain_names: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Get all document chunks from Supabase.
    
    Args:
        supabase: Supabase client
        domain_names: Optional list of domain names to filter by
        
    Returns:
        List of chunks with embeddings
    """
    try:
        if not supabase.client:
            logger.error("❌ Supabase client not initialized")
            return []
        
        # Build query
        query = supabase.client.table('document_chunks').select('*')
        
        # Filter by domain if provided
        if domain_names:
            # First, get domain_ids for these domain names
            domain_result = supabase.client.table('knowledge_domains').select('domain_id').in_('domain_name', domain_names).execute()
            domain_ids = [d['domain_id'] for d in domain_result.data] if domain_result.data else []
            
            if domain_ids:
                query = query.in_('domain_id', domain_ids)
            else:
                logger.warning(f"⚠️ No domain IDs found for domain names: {domain_names}")
                return []
        
        # Only get chunks with embeddings
        result = query.not_.is_('embedding', 'null').execute()
        
        chunks = result.data if result.data else []
        logger.info(f"✅ Retrieved {len(chunks)} chunks from Supabase")
        
        return chunks
    except Exception as e:
        logger.error(f"❌ Failed to get chunks from Supabase: {e}")
        return []


async def sync_chunks_to_pinecone(
    supabase: SupabaseClient,
    pinecone_rag_index,
    domain_namespace_mapping: Dict[str, str],
    chunks: List[Dict[str, Any]],
    openai_client: OpenAI,
    batch_size: int = 50  # Smaller batch size for embedding generation
) -> Dict[str, Any]:
    """
    Sync chunks to Pinecone RAG index with domain-specific namespaces.
    
    Args:
        supabase: Supabase client
        pinecone_rag_index: Pinecone RAG index object
        domain_namespace_mapping: Dictionary mapping domain_id -> namespace slug
        chunks: List of chunks to sync
        batch_size: Batch size for upsert operations
        
    Returns:
        Dictionary with sync statistics
    """
    try:
        if not chunks:
            logger.warning("⚠️ No chunks to sync")
            return {"success": True, "synced": 0, "failed": 0, "total": 0}
        
        # Group chunks by domain_id (namespace)
        chunks_by_namespace: Dict[str, List[Dict[str, Any]]] = {}
        
        for chunk in chunks:
            domain_id = chunk.get('domain_id')
            
            # Get namespace for this domain
            if domain_id and domain_id in domain_namespace_mapping:
                namespace = domain_namespace_mapping[domain_id]
            else:
                # Use default namespace if domain not found
                namespace = "domains-knowledge"
                logger.warning(f"⚠️ Domain ID {domain_id} not found in mapping, using default namespace")
            
            if namespace not in chunks_by_namespace:
                chunks_by_namespace[namespace] = []
            
            chunks_by_namespace[namespace].append(chunk)
        
        logger.info(f"✅ Grouped {len(chunks)} chunks into {len(chunks_by_namespace)} namespaces")
        
        # Sync each namespace
        total_synced = 0
        total_failed = 0
        
        for namespace, namespace_chunks in chunks_by_namespace.items():
            logger.info(f"🔄 Syncing {len(namespace_chunks)} chunks to namespace '{namespace}'")
            
            # Process chunks in batches for embedding generation
            for i in range(0, len(namespace_chunks), batch_size):
                batch_chunks = namespace_chunks[i:i + batch_size]
                
                # Generate embeddings for batch using text-embedding-3-large (3072 dims)
                try:
                    contents = [chunk.get('content', '') for chunk in batch_chunks]
                    logger.info(f"🔄 Generating embeddings for batch {i // batch_size + 1} ({len(contents)} chunks)")
                    
                    embedding_response = openai_client.embeddings.create(
                        model='text-embedding-3-large',  # 3072 dimensions to match Pinecone index
                        input=contents
                    )
                    
                    # Prepare vectors for upsert
                    vectors = []
                    for j, chunk in enumerate(batch_chunks):
                        try:
                            chunk_id = chunk.get('id')
                            
                            if not chunk_id:
                                logger.warning(f"⚠️ Skipping chunk with missing ID")
                                total_failed += 1
                                continue
                            
                            # Use newly generated embedding (3072 dims)
                            embedding = embedding_response.data[j].embedding
                            
                            # Prepare metadata
                            metadata = {
                                'chunk_id': str(chunk_id),
                                'document_id': str(chunk.get('document_id')) if chunk.get('document_id') else None,
                                'domain_id': str(chunk.get('domain_id')) if chunk.get('domain_id') else None,
                                'content': str(chunk.get('content', ''))[:1000],  # First 1000 chars for metadata
                                'embedding_type': 'document_chunk',
                                'entity_type': 'chunk',
                                'embedding_model': 'text-embedding-3-large',  # 3072 dimensions
                                'timestamp': datetime.now(timezone.utc).isoformat(),
                            }
                            
                            # Add chunk metadata if available
                            chunk_metadata = chunk.get('metadata')
                            if isinstance(chunk_metadata, dict):
                                metadata.update(chunk_metadata)
                            
                            vectors.append({
                                'id': str(chunk_id),
                                'values': embedding,  # 3072 dimensions from text-embedding-3-large
                                'metadata': metadata
                            })
                        except Exception as e:
                            logger.error(f"❌ Failed to prepare chunk {chunk.get('id')}: {e}")
                            total_failed += 1
                            continue
                    
                    # Upsert batch to Pinecone
                    if vectors:
                        try:
                            # Try v3 API first (namespace as parameter)
                            try:
                                pinecone_rag_index.upsert(vectors=vectors, namespace=namespace)
                            except (TypeError, AttributeError):
                                # Fallback to v2 API (namespace as method)
                                namespace_obj = pinecone_rag_index.namespace(namespace)
                                if hasattr(namespace_obj, 'upsert'):
                                    namespace_obj.upsert(vectors=vectors)
                                else:
                                    raise Exception("Namespace object does not support upsert")
                            
                            total_synced += len(vectors)
                            logger.info(f"✅ Upserted batch {i // batch_size + 1} to namespace '{namespace}' ({len(vectors)} chunks)")
                        except Exception as e:
                            logger.error(f"❌ Failed to upsert batch to namespace '{namespace}': {e}")
                            total_failed += len(vectors)
                            
                except Exception as e:
                    logger.error(f"❌ Failed to generate embeddings for batch: {e}")
                    total_failed += len(batch_chunks)
            
        
        logger.info(f"🎉 Chunk sync complete: {total_synced} synced, {total_failed} failed")
        
        return {
            "success": True,
            "synced": total_synced,
            "failed": total_failed,
            "total": len(chunks),
            "namespaces": list(chunks_by_namespace.keys())
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync chunks to Pinecone: {e}")
        return {"success": False, "error": str(e)}


async def main():
    """Main function to sync chunks to Pinecone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Sync document chunks to Pinecone RAG index')
    parser.add_argument(
        '--domains',
        nargs='+',
        help='Domain names to sync (e.g., "Digital Health" "Regulatory Affairs")',
        default=None
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Sync all chunks (ignore domain filter)'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=100,
        help='Batch size for upsert operations (default: 100)'
    )
    args = parser.parse_args()
    
    logger.info("🚀 Starting chunk sync to Pinecone RAG index...")
    
    # Initialize services
    settings = get_settings()
    supabase = SupabaseClient()
    await supabase.initialize()
    
    # Get Pinecone config
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_rag_index_name = os.getenv("PINECONE_RAG_INDEX_NAME", "vital-rag-production")
    
    if not pinecone_api_key:
        logger.error("❌ PINECONE_API_KEY not set, cannot sync chunks to Pinecone")
        sys.exit(1)
    
    # Initialize Pinecone
    pc = Pinecone(api_key=pinecone_api_key)
    try:
        pinecone_rag_index = pc.Index(pinecone_rag_index_name)
        logger.info(f"✅ Connected to Pinecone RAG index: {pinecone_rag_index_name}")
        
        # Check index dimension
        stats = pinecone_rag_index.describe_index_stats()
        index_dimension = stats.get('dimension')
        logger.info(f"📊 Index dimension: {index_dimension}")
        if index_dimension != 3072:
            logger.warning(f"⚠️ Index dimension is {index_dimension}, but we're using text-embedding-3-large (3072 dims)")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Pinecone RAG index {pinecone_rag_index_name}: {e}")
        sys.exit(1)
    
    # Initialize OpenAI client for embedding generation
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("❌ OPENAI_API_KEY not set, cannot generate embeddings")
        sys.exit(1)
    
    openai_client = OpenAI(api_key=openai_api_key)
    logger.info("✅ OpenAI client initialized for embedding generation")
    
    # Get domain namespace mapping
    domain_namespace_mapping = await get_domain_namespace_mapping(supabase)
    if not domain_namespace_mapping:
        logger.warning("⚠️ No domain namespace mappings found")
    
    # Get chunks from Supabase
    domain_names = None if args.all else args.domains
    chunks = await get_chunks_from_supabase(supabase, domain_names)
    
    if not chunks:
        logger.warning("⚠️ No chunks found to sync")
        return
    
    logger.info(f"📚 Found {len(chunks)} chunks to sync")
    
    # Sync chunks to Pinecone (with embedding regeneration)
    result = await sync_chunks_to_pinecone(
        supabase=supabase,
        pinecone_rag_index=pinecone_rag_index,
        domain_namespace_mapping=domain_namespace_mapping,
        chunks=chunks,
        openai_client=openai_client,
        batch_size=args.batch_size
    )
    
    if result.get("success"):
        logger.info("✅ Chunk sync completed successfully")
        logger.info(f"   Synced: {result.get('synced', 0)}")
        logger.info(f"   Failed: {result.get('failed', 0)}")
        logger.info(f"   Total: {result.get('total', 0)}")
        logger.info(f"   Namespaces: {', '.join(result.get('namespaces', []))}")
    else:
        logger.error(f"❌ Chunk sync failed: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    asyncio.run(main())

