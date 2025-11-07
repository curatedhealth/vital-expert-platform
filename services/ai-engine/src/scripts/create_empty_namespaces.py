#!/usr/bin/env python3
"""
Create Empty Namespaces for All Domains in Pinecone

This script proactively creates namespaces in Pinecone for all knowledge domains,
even if they don't have chunks yet. This ensures all domains are ready for document uploads.

Namespaces are created by upserting a single dummy vector (which is then deleted if needed).

Usage:
    python scripts/create_empty_namespaces.py
    python scripts/create_empty_namespaces.py --delete-dummy
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


async def get_all_domains(supabase: SupabaseClient) -> List[Dict[str, Any]]:
    """Get all knowledge domains from Supabase"""
    try:
        if not supabase.client:
            logger.error("❌ Supabase client not initialized")
            return []
        
        result = supabase.client.table('knowledge_domains').select('*').eq('is_active', True).execute()
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


async def create_namespace_if_not_exists(
    pinecone_rag_index,
    domain_id: str,
    domain_name: str,
    namespace: str,
    dimension: int = 3072
) -> bool:
    """
    Create a namespace in Pinecone by upserting a dummy vector.
    
    Namespaces in Pinecone are created automatically on first upsert.
    We create a single dummy vector to initialize the namespace.
    """
    try:
        # Check if namespace already exists by trying to get stats
        try:
            stats = pinecone_rag_index.describe_index_stats(namespace=namespace)
            record_count = stats.get('total_vector_count', 0)
            if record_count > 0:
                logger.info(f"✅ Namespace '{namespace}' already exists with {record_count} records")
                return True
            else:
                # Namespace exists but is empty - we'll create it anyway (already exists)
                logger.info(f"✅ Namespace '{namespace}' exists but is empty")
                return True
        except Exception:
            # Namespace doesn't exist - we'll create it
            pass
        
        # Create namespace by upserting a dummy vector
        # Use a zero vector of the correct dimension
        dummy_vector = [0.0] * dimension
        dummy_id = f"__namespace_init__{domain_id}"
        
        try:
            # Try v3 API first (namespace as parameter)
            try:
                pinecone_rag_index.upsert(
                    vectors=[{
                        'id': dummy_id,
                        'values': dummy_vector,
                        'metadata': {
                            'domain_id': domain_id,
                            'domain_name': domain_name,
                            'namespace_init': True,
                            'created_at': datetime.now(timezone.utc).isoformat(),
                        }
                    }],
                    namespace=namespace
                )
                logger.info(f"✅ Created namespace '{namespace}' for domain '{domain_name}'")
                
                # Optionally delete the dummy vector immediately
                # (namespaces persist even after all vectors are deleted)
                try:
                    pinecone_rag_index.delete(ids=[dummy_id], namespace=namespace)
                    logger.debug(f"🗑️  Deleted dummy vector from namespace '{namespace}'")
                except Exception as e:
                    logger.warning(f"⚠️  Could not delete dummy vector (namespace still created): {e}")
                
                return True
            except TypeError:
                # Fallback to v2 API (namespace as method)
                namespace_obj = pinecone_rag_index.namespace(namespace)
                namespace_obj.upsert(vectors=[{
                    'id': dummy_id,
                    'values': dummy_vector,
                    'metadata': {
                        'domain_id': domain_id,
                        'domain_name': domain_name,
                        'namespace_init': True,
                        'created_at': datetime.now(timezone.utc).isoformat(),
                    }
                }])
                logger.info(f"✅ Created namespace '{namespace}' for domain '{domain_name}' (v2 API)")
                
                # Delete dummy vector
                try:
                    namespace_obj.delete(ids=[dummy_id])
                    logger.debug(f"🗑️  Deleted dummy vector from namespace '{namespace}'")
                except Exception as e:
                    logger.warning(f"⚠️  Could not delete dummy vector: {e}")
                
                return True
        except Exception as e:
            logger.error(f"❌ Failed to create namespace '{namespace}': {e}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error checking/creating namespace '{namespace}': {e}")
        return False


async def main():
    """Main function to create namespaces for all domains"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Create namespaces for all knowledge domains in Pinecone')
    parser.add_argument(
        '--delete-dummy',
        action='store_true',
        help='Delete dummy vectors after creating namespaces (default: auto-delete)'
    )
    args = parser.parse_args()
    
    logger.info("🚀 Starting namespace creation for all domains...")
    
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
    
    # Get index dimension
    try:
        stats = pinecone_rag_index.describe_index_stats()
        index_dimension = stats.get('dimension', 3072)
        logger.info(f"📊 Index dimension: {index_dimension}")
    except Exception as e:
        logger.warning(f"⚠️  Could not get index stats, using default dimension 3072: {e}")
        index_dimension = 3072
    
    # Get all domains
    domains = await get_all_domains(supabase)
    
    if not domains:
        logger.warning("⚠️ No domains found")
        return
    
    logger.info(f"📊 Found {len(domains)} domains to process")
    
    # Process each domain
    created_count = 0
    existing_count = 0
    failed_count = 0
    
    for domain in domains:
        domain_id = domain.get('domain_id')
        domain_name = domain.get('domain_name') or domain.get('name', 'Unknown')
        namespace = get_namespace_from_domain(domain)
        
        logger.info(f"📋 Processing domain: {domain_name} (namespace: {namespace})")
        
        # Check if namespace exists
        try:
            stats = pinecone_rag_index.describe_index_stats(namespace=namespace)
            existing_count += 1
            record_count = stats.get('total_vector_count', 0)
            logger.info(f"✅ Namespace '{namespace}' already exists with {record_count} records")
        except Exception:
            # Namespace doesn't exist - create it
            success = await create_namespace_if_not_exists(
                pinecone_rag_index=pinecone_rag_index,
                domain_id=domain_id,
                domain_name=domain_name,
                namespace=namespace,
                dimension=index_dimension
            )
            
            if success:
                created_count += 1
            else:
                failed_count += 1
    
    # Final summary
    logger.info("\n📊 Namespace Creation Summary:")
    logger.info(f"   Total domains: {len(domains)}")
    logger.info(f"   Namespaces created: {created_count}")
    logger.info(f"   Namespaces already existed: {existing_count}")
    logger.info(f"   Failed: {failed_count}")
    
    if created_count > 0:
        logger.info(f"\n✅ Successfully created {created_count} new namespaces!")
    if existing_count > 0:
        logger.info(f"ℹ️  {existing_count} namespaces already existed")
    if failed_count > 0:
        logger.warning(f"⚠️  {failed_count} namespaces failed to create")


if __name__ == "__main__":
    asyncio.run(main())

