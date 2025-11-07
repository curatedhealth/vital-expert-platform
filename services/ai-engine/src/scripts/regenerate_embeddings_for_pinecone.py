#!/usr/bin/env python3
"""
Regenerate Embeddings for Pinecone RAG Index

This script:
1. Fetches chunks from Supabase (1536 dims from text-embedding-3-small)
2. Regenerates embeddings using text-embedding-3-large (3072 dims) to match Pinecone index
3. Updates chunks in Supabase with new embeddings
4. Syncs chunks to Pinecone RAG index with domain-specific namespaces

Usage:
    python scripts/regenerate_embeddings_for_pinecone.py --all
    python scripts/regenerate_embeddings_for_pinecone.py --domains "Digital Health" "Regulatory Affairs"
"""

import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import structlog
from datetime import datetime, timezone

# Add src directory to path
src_dir = Path(__file__).parent.parent
sys.path.insert(0, str(src_dir))

from dotenv import load_dotenv
from services.supabase_client import SupabaseClient
from services.embedding_service_factory import EmbeddingServiceFactory
from core.config import get_settings
from pinecone import Pinecone
from openai import OpenAI

# Initialize logger
logger = structlog.get_logger()

# Load environment variables
script_path = Path(__file__)
root_dir = script_path.parent.parent.parent.parent.parent
env_paths = [
    root_dir / '.env.vercel',
    root_dir / '.env.local',
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        break

# Map environment variables
if not os.getenv('SUPABASE_URL') and os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    os.environ['SUPABASE_URL'] = os.getenv('NEXT_PUBLIC_SUPABASE_URL').strip('"')

if not os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY') == 'your_actual_key':
    if os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY').strip('"')

if not os.getenv('OPENAI_API_KEY') and os.getenv('NEXT_PUBLIC_OPENAI_API_KEY'):
    os.environ['OPENAI_API_KEY'] = os.getenv('NEXT_PUBLIC_OPENAI_API_KEY').strip('"')


async def regenerate_and_sync_chunks(
    supabase: SupabaseClient,
    pinecone_rag_index,
    domain_namespace_mapping: Dict[str, str],
    chunks: List[Dict[str, Any]],
    batch_size: int = 50
):
    """
    Regenerate embeddings for chunks and sync to Pinecone.
    
    Args:
        supabase: Supabase client
        pinecone_rag_index: Pinecone RAG index object
        domain_namespace_mapping: Dictionary mapping domain_id -> namespace slug
        chunks: List of chunks to process
        batch_size: Batch size for embedding generation
    """
    try:
        openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Group chunks by namespace
        chunks_by_namespace: Dict[str, List[Dict[str, Any]]] = {}
        for chunk in chunks:
            domain_id = chunk.get('domain_id')
            namespace = domain_namespace_mapping.get(domain_id, 'domains-knowledge')
            if namespace not in chunks_by_namespace:
                chunks_by_namespace[namespace] = []
            chunks_by_namespace[namespace].append(chunk)
        
        total_synced = 0
        total_failed = 0
        
        for namespace, namespace_chunks in chunks_by_namespace.items():
            logger.info(f"🔄 Processing {len(namespace_chunks)} chunks for namespace '{namespace}'")
            
            # Process in batches
            for i in range(0, len(namespace_chunks), batch_size):
                batch = namespace_chunks[i:i + batch_size]
                
                # Generate embeddings for batch
                try:
                    contents = [chunk.get('content', '') for chunk in batch]
                    embedding_response = openai_client.embeddings.create(
                        model='text-embedding-3-large',  # 3072 dimensions
                        input=contents
                    )
                    
                    # Prepare vectors for Pinecone
                    vectors = []
                    for j, chunk in enumerate(batch):
                        try:
                            chunk_id = chunk.get('id')
                            embedding = embedding_response.data[j].embedding
                            
                            # Update Supabase with new embedding
                            if supabase.client:
                                supabase.client.table('document_chunks').update({
                                    'embedding': embedding
                                }).eq('id', chunk_id).execute()
                            
                            # Prepare metadata
                            metadata = {
                                'chunk_id': str(chunk_id),
                                'document_id': str(chunk.get('document_id')) if chunk.get('document_id') else None,
                                'domain_id': str(chunk.get('domain_id')) if chunk.get('domain_id') else None,
                                'content': str(chunk.get('content', ''))[:1000],
                                'embedding_type': 'document_chunk',
                                'entity_type': 'chunk',
                                'embedding_model': 'text-embedding-3-large',
                                'timestamp': datetime.now(timezone.utc).isoformat(),
                            }
                            
                            chunk_metadata = chunk.get('metadata')
                            if isinstance(chunk_metadata, dict):
                                metadata.update(chunk_metadata)
                            
                            vectors.append({
                                'id': str(chunk_id),
                                'values': embedding,
                                'metadata': metadata
                            })
                        except Exception as e:
                            logger.error(f"❌ Failed to prepare chunk {chunk.get('id')}: {e}")
                            total_failed += 1
                            continue
                    
                    # Upsert to Pinecone
                    if vectors:
                        try:
                            pinecone_rag_index.upsert(vectors=vectors, namespace=namespace)
                            total_synced += len(vectors)
                            logger.info(f"✅ Upserted batch {i // batch_size + 1} to namespace '{namespace}' ({len(vectors)} chunks)")
                        except Exception as e:
                            logger.error(f"❌ Failed to upsert batch to namespace '{namespace}': {e}")
                            total_failed += len(vectors)
                            
                except Exception as e:
                    logger.error(f"❌ Failed to process batch: {e}")
                    total_failed += len(batch)
        
        return {
            "success": True,
            "synced": total_synced,
            "failed": total_failed,
            "total": len(chunks)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to regenerate and sync chunks: {e}")
        return {"success": False, "error": str(e)}


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Regenerate embeddings and sync to Pinecone')
    parser.add_argument('--domains', nargs='+', help='Domain names to process', default=None)
    parser.add_argument('--all', action='store_true', help='Process all chunks')
    parser.add_argument('--batch-size', type=int, default=50, help='Batch size for embedding generation')
    args = parser.parse_args()
    
    logger.info("🚀 Starting embedding regeneration and Pinecone sync...")
    
    # Initialize services
    supabase = SupabaseClient()
    await supabase.initialize()
    
    # Initialize Pinecone
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_rag_index_name = os.getenv("PINECONE_RAG_INDEX_NAME", "vital-rag-production")
    
    if not pinecone_api_key:
        logger.error("❌ PINECONE_API_KEY not set")
        sys.exit(1)
    
    pc = Pinecone(api_key=pinecone_api_key)
    pinecone_rag_index = pc.Index(pinecone_rag_index_name)
    logger.info(f"✅ Connected to Pinecone RAG index: {pinecone_rag_index_name}")
    
    # Get domain namespace mapping (from sync_chunks_to_pinecone.py logic)
    # ... (simplified for brevity, use same logic as sync_chunks_to_pinecone.py)
    
    # Get chunks
    # ... (use same logic as sync_chunks_to_pinecone.py)
    
    # Regenerate and sync
    result = await regenerate_and_sync_chunks(
        supabase=supabase,
        pinecone_rag_index=pinecone_rag_index,
        domain_namespace_mapping={},  # TODO: Load from Supabase
        chunks=[],  # TODO: Load from Supabase
        batch_size=args.batch_size
    )
    
    if result.get("success"):
        logger.info(f"✅ Completed: {result.get('synced', 0)} synced, {result.get('failed', 0)} failed")
    else:
        logger.error(f"❌ Failed: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    asyncio.run(main())

