#!/usr/bin/env python3
"""
Create All Domain Namespaces in Pinecone

This script:
1. Fetches all knowledge domains from Supabase
2. Creates/verifies namespaces in Pinecone RAG index for each domain
3. Syncs chunks from Supabase to Pinecone for each domain namespace
4. Reports namespace statistics

Usage:
    python scripts/create_all_namespaces.py
    python scripts/create_all_namespaces.py --sync-chunks
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


async def get_all_domains(supabase: SupabaseClient) -> List[Dict[str, Any]]:
    """Get all knowledge domains from Supabase"""
    try:
        if not supabase.client:
            logger.error("❌ Supabase client not initialized")
            return []
        
        result = supabase.client.table('knowledge_domains').select('*').execute()
        domains = result.data if result.data else []
        logger.info(f"✅ Retrieved {len(domains)} domains from Supabase")
        return domains
    except Exception as e:
        logger.error(f"❌ Failed to get domains: {e}")
        return []


def get_namespace_from_domain(domain: Dict[str, Any]) -> str:
    """Get namespace name from domain slug or name"""
    slug = domain.get('slug') or domain.get('domain_name', '').lower().replace(' ', '-')
    # Sanitize namespace name for Pinecone (max 64 chars, lowercase, hyphens only)
    namespace = slug.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
    return namespace


async def verify_namespace_exists(pinecone_rag_index, namespace: str) -> bool:
    """Verify if namespace exists in Pinecone"""
    try:
        # Try to get stats for the namespace
        stats = pinecone_rag_index.describe_index_stats(namespace=namespace)
        return True
    except Exception as e:
        # Namespace doesn't exist or error occurred
        return False


async def sync_chunks_to_namespace(
    supabase: SupabaseClient,
    pinecone_rag_index,
    openai_client: OpenAI,
    domain_id: str,
    namespace: str,
    batch_size: int = 50
) -> Dict[str, Any]:
    """Sync chunks for a specific domain to its namespace"""
    try:
        # Get chunks for this domain
        result = supabase.client.table('document_chunks').select('*').eq('domain_id', domain_id).not_.is_('embedding', 'null').execute()
        chunks = result.data if result.data else []
        
        if not chunks:
            logger.info(f"ℹ️  No chunks found for domain {domain_id} (namespace: {namespace})")
            return {"synced": 0, "failed": 0, "total": 0}
        
        logger.info(f"🔄 Syncing {len(chunks)} chunks to namespace '{namespace}'")
        
        # Process in batches
        total_synced = 0
        total_failed = 0
        
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            
            # Generate embeddings for batch using text-embedding-3-large (3072 dims)
            try:
                contents = [chunk.get('content', '') for chunk in batch_chunks]
                embedding_response = openai_client.embeddings.create(
                    model='text-embedding-3-large',  # 3072 dimensions
                    input=contents
                )
                
                # Prepare vectors for Pinecone
                vectors = []
                for j, chunk in enumerate(batch_chunks):
                    try:
                        chunk_id = chunk.get('id')
                        if not chunk_id:
                            total_failed += 1
                            continue
                        
                        vectors.append({
                            'id': str(chunk_id),
                            'values': embedding_response.data[j].embedding,  # 3072 dimensions
                            'metadata': {
                                'chunk_id': str(chunk_id),
                                'document_id': str(chunk.get('document_id')) if chunk.get('document_id') else None,
                                'domain_id': str(domain_id),
                                'content': str(chunk.get('content', ''))[:1000],
                                'embedding_type': 'document_chunk',
                                'entity_type': 'chunk',
                                'embedding_model': 'text-embedding-3-large',
                                'timestamp': datetime.now(timezone.utc).isoformat(),
                                **(chunk.get('metadata', {}) if isinstance(chunk.get('metadata'), dict) else {}),
                            }
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
                logger.error(f"❌ Failed to generate embeddings for batch: {e}")
                total_failed += len(batch_chunks)
        
        return {
            "synced": total_synced,
            "failed": total_failed,
            "total": len(chunks)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync chunks to namespace '{namespace}': {e}")
        return {"synced": 0, "failed": 0, "total": 0, "error": str(e)}


async def main():
    """Main function to create all namespaces and sync chunks"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Create all domain namespaces in Pinecone')
    parser.add_argument(
        '--sync-chunks',
        action='store_true',
        help='Sync chunks from Supabase to Pinecone for each domain'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=50,
        help='Batch size for chunk sync (default: 50)'
    )
    args = parser.parse_args()
    
    logger.info("🚀 Starting namespace creation and verification...")
    
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
    
    # Get all domains
    domains = await get_all_domains(supabase)
    
    if not domains:
        logger.warning("⚠️ No domains found")
        return
    
    logger.info(f"📊 Found {len(domains)} domains to process")
    
    # Initialize OpenAI client if syncing chunks
    openai_client = None
    if args.sync_chunks:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            openai_client = OpenAI(api_key=openai_api_key)
            logger.info("✅ OpenAI client initialized")
        else:
            logger.warning("⚠️ OPENAI_API_KEY not set, cannot sync chunks")
            args.sync_chunks = False
    
    # Process each domain
    namespace_stats = {}
    
    for domain in domains:
        domain_id = domain.get('domain_id')
        domain_name = domain.get('domain_name')
        namespace = get_namespace_from_domain(domain)
        
        logger.info(f"📋 Processing domain: {domain_name} (namespace: {namespace})")
        
        # Verify namespace exists (namespaces are created automatically on first upsert)
        namespace_exists = await verify_namespace_exists(pinecone_rag_index, namespace)
        
        if namespace_exists:
            # Get stats for existing namespace
            try:
                stats = pinecone_rag_index.describe_index_stats(namespace=namespace)
                record_count = stats.get('total_vector_count', 0)
                logger.info(f"✅ Namespace '{namespace}' exists with {record_count} records")
            except:
                logger.info(f"✅ Namespace '{namespace}' exists")
        else:
            logger.info(f"ℹ️  Namespace '{namespace}' will be created on first upsert")
        
        namespace_stats[namespace] = {
            'domain_id': domain_id,
            'domain_name': domain_name,
            'exists': namespace_exists,
            'record_count': 0
        }
        
        # Sync chunks if requested
        if args.sync_chunks and openai_client:
            result = await sync_chunks_to_namespace(
                supabase=supabase,
                pinecone_rag_index=pinecone_rag_index,
                openai_client=openai_client,
                domain_id=domain_id,
                namespace=namespace,
                batch_size=args.batch_size
            )
            namespace_stats[namespace]['synced'] = result.get('synced', 0)
            namespace_stats[namespace]['failed'] = result.get('failed', 0)
            namespace_stats[namespace]['total_chunks'] = result.get('total', 0)
    
    # Final summary
    logger.info("\n📊 Namespace Summary:")
    logger.info(f"   Total domains: {len(domains)}")
    logger.info(f"   Total namespaces: {len(namespace_stats)}")
    
    if args.sync_chunks:
        total_synced = sum(s.get('synced', 0) for s in namespace_stats.values())
        total_failed = sum(s.get('failed', 0) for s in namespace_stats.values())
        logger.info(f"   Total chunks synced: {total_synced}")
        logger.info(f"   Total chunks failed: {total_failed}")
    
    logger.info("\n📋 Namespace Details:")
    for namespace, stats in sorted(namespace_stats.items()):
        logger.info(f"   {namespace}: {stats.get('domain_name', 'Unknown')}")
        if args.sync_chunks:
            logger.info(f"      Synced: {stats.get('synced', 0)}, Failed: {stats.get('failed', 0)}, Total: {stats.get('total_chunks', 0)}")


if __name__ == "__main__":
    asyncio.run(main())

