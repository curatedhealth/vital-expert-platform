#!/usr/bin/env python3
"""
Process Documents Using HuggingFace Embeddings (Free, No API Limits)

This script processes documents using HuggingFace embeddings instead of OpenAI,
avoiding API rate limits and costs. It:
1. Fetches unprocessed/failed documents from Supabase
2. Chunks documents using RecursiveCharacterTextSplitter
3. Generates embeddings using HuggingFace (free, no rate limits)
4. Stores chunks in Supabase
5. Syncs to Pinecone with domain-specific namespaces
6. Updates document status

Usage:
    python scripts/process_documents_huggingface.py --all
    python scripts/process_documents_huggingface.py --domains "Digital Health" "Regulatory Affairs"
    python scripts/process_documents_huggingface.py --status "pending" "failed"
    python scripts/process_documents_huggingface.py --batch-size 50 --workers 4
"""

import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
import structlog
from concurrent.futures import ThreadPoolExecutor
import argparse

# Add src directory to path (where services module is)
src_dir = Path(__file__).parent.parent
sys.path.insert(0, str(src_dir))

from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter  # ✅ LangChain 1.0
from services.supabase_client import SupabaseClient
from services.embedding_service_factory import EmbeddingServiceFactory
from services.cache_manager import CacheManager
from core.config import get_settings
from pinecone import Pinecone
from openai import OpenAI
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pinecone import Index

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
    logger.warning("⚠️ No .env file found, using system environment variables")

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

# Map HUGGINGFACE_API_KEY if available
if not os.getenv('HUGGINGFACE_API_KEY') and os.getenv('NEXT_PUBLIC_HUGGINGFACE_API_KEY'):
    os.environ['HUGGINGFACE_API_KEY'] = os.getenv('NEXT_PUBLIC_HUGGINGFACE_API_KEY').strip('"')
    logger.info("✅ Mapped NEXT_PUBLIC_HUGGINGFACE_API_KEY to HUGGINGFACE_API_KEY")


async def get_domain_mapping(supabase: SupabaseClient) -> Dict[str, str]:
    """Get mapping from domain names to domain_id UUIDs."""
    try:
        if not supabase.client:
            logger.error("❌ Supabase client not initialized for domain mapping")
            return {}
        
        # Try new architecture first
        result = supabase.client.table('knowledge_domains_new').select('domain_id, domain_name, code, slug').execute()
        if not result.data:
            # Fallback to old table
            result = supabase.client.table('knowledge_domains').select('domain_id, name as domain_name, code, slug').execute()
        
        mapping = {}
        for domain in result.data:
            # Map by domain_name (primary)
            domain_name = domain.get('domain_name') or domain.get('name')
            domain_id = domain.get('domain_id') or domain.get('slug')
            if domain_name:
                mapping[domain_name] = domain_id
            # Also map by code and slug
            if domain.get('code'):
                mapping[domain['code']] = domain_id
            if domain.get('slug'):
                mapping[domain['slug']] = domain_id
        
        logger.info("✅ Domain mapping loaded", domains=len(mapping))
        return mapping
    except Exception as e:
        logger.error("❌ Failed to load domain mapping", error=str(e))
        return {}


async def get_documents_to_process(
    supabase: SupabaseClient,
    domain_names: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Get documents that need processing.
    
    Args:
        supabase: Supabase client
        domain_names: List of domain names to filter by (optional)
        statuses: List of statuses to filter by (e.g., ["pending", "failed"])
        limit: Maximum number of documents to process (optional)
    """
    try:
        query = supabase.client.table('knowledge_documents').select('*')
        
        # Filter by status if provided
        if statuses:
            query = query.in_('status', statuses)
        else:
            # Default: get pending, failed, or null status documents
            query = query.or_('status.eq.pending,status.eq.failed,status.is.null')
        
        # Filter by domain if provided
        if domain_names:
            # Build OR filter for multiple domains
            if len(domain_names) == 1:
                query = query.eq('domain', domain_names[0])
            else:
                # For multiple domains, use .in_() method
                query = query.in_('domain', domain_names)
        
        # Filter out documents without content
        query = query.not_.is_('content', 'null')
        
        # Limit results if specified
        if limit:
            query = query.limit(limit)
        
        result = query.execute()
        documents = result.data if result.data else []
        
        logger.info(
            "✅ Documents retrieved",
            count=len(documents),
            domains=domain_names or "all",
            statuses=statuses or ["pending", "failed", "null"]
        )
        
        return documents
    except Exception as e:
        logger.error("❌ Failed to get documents", error=str(e))
        return []


async def chunk_document(
    content: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[str]:
    """Chunk document content into overlapping chunks."""
    if not content or len(content.strip()) == 0:
        return []
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
    )
    
    chunks = text_splitter.split_text(content)
    return chunks


async def generate_embeddings_batch(
    embedding_service,
    texts: List[str],
    batch_size: int = 50
) -> List[List[float]]:
    """Generate embeddings for a batch of texts using HuggingFace."""
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        logger.debug(f"🔄 Generating embeddings for batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size}")
        
        try:
            # Use the standard method from HuggingFaceEmbeddingService
            if hasattr(embedding_service, 'generate_embeddings_batch'):
                embeddings = await embedding_service.generate_embeddings_batch(batch)
                all_embeddings.extend(embeddings)
            elif hasattr(embedding_service, 'embed_texts'):
                embeddings = await embedding_service.embed_texts(batch)
                all_embeddings.extend(embeddings)
            else:
                # Fallback: generate one by one using generate_embedding
                for text in batch:
                    emb = await embedding_service.generate_embedding(text)
                    # Handle both list and object responses
                    if isinstance(emb, list):
                        embedding = emb
                    elif hasattr(emb, 'embedding'):
                        embedding = emb.embedding
                    else:
                        embedding = emb
                    all_embeddings.append(embedding)
        except Exception as e:
            logger.error(f"❌ Failed to generate embeddings for batch", error=str(e))
            # Use zero vector as fallback
            dimensions = embedding_service.get_dimensions()
            all_embeddings.extend([[0.0] * dimensions] * len(batch))
    
    return all_embeddings


async def process_document(
    document: Dict[str, Any],
    supabase: SupabaseClient,
    embedding_service,
    text_splitter: RecursiveCharacterTextSplitter,
    domain_mapping: Dict[str, str],
    batch_size: int = 50,
    sync_to_pinecone: bool = True,
    pinecone_rag_index: Optional[Any] = None,
    domain_namespace_mapping: Optional[Dict[str, str]] = None,
    openai_client: Optional[OpenAI] = None
) -> Tuple[bool, int]:
    """
    Process a single document: chunk, embed, and store.
    
    Returns:
        Tuple of (True if successful, number of chunks created)
    """
    document_id = document['id']
    content = document.get('content', '')
    domain = document.get('domain', '')
    
    if not content or len(content.strip()) == 0:
        logger.warning(f"⚠️ Document {document_id} has no content, skipping")
        return False, 0
    
    try:
        # Update status to processing
        supabase.client.table('knowledge_documents').update({
            'status': 'processing',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', document_id).execute()
        
        # Map domain name to domain_id
        domain_id = None
        if domain:
            domain_id = domain_mapping.get(domain) or domain_mapping.get(domain.lower()) or domain_mapping.get(domain.replace(' ', '-'))
        
        # Chunk the content
        chunks = text_splitter.split_text(content)
        logger.info(f"📦 Document {document_id} chunked", chunks=len(chunks), domain=domain)
        
        if not chunks:
            logger.warning(f"⚠️ Document {document_id} produced no chunks")
            return False, 0
        
        # Delete existing chunks for this document
        supabase.client.table('document_chunks').delete().eq('document_id', document_id).execute()
        
        # Generate embeddings for Supabase (1536 dimensions required)
        # Use OpenAI text-embedding-3-small for Supabase storage (cheaper than 3-large, matches schema)
        # Or use HuggingFace if dimensions match, otherwise convert
        logger.info(f"🔄 Generating embeddings for {len(chunks)} chunks...")
        
        embedding_dim = embedding_service.get_dimensions()
        supabase_embeddings = []
        
        if embedding_dim == 1536:
            # Use HuggingFace embeddings directly if dimensions match
            logger.info(f"✅ Using HuggingFace embeddings directly (1536 dimensions match)")
            supabase_embeddings = await generate_embeddings_batch(embedding_service, chunks, batch_size=batch_size)
        else:
            # Use OpenAI for Supabase storage (1536 dimensions required)
            if not openai_client:
                logger.error("❌ OpenAI client not available, cannot generate 1536-dim embeddings for Supabase")
                return False, 0
            
            logger.info(f"🔄 Using OpenAI text-embedding-3-small for Supabase (1536 dims required)")
            try:
                # Generate embeddings in batches
                for i in range(0, len(chunks), batch_size):
                    batch = chunks[i:i + batch_size]
                    response = openai_client.embeddings.create(
                        model='text-embedding-3-small',
                        input=batch
                    )
                    batch_embeddings = [item.embedding for item in response.data]
                    supabase_embeddings.extend(batch_embeddings)
                    logger.debug(f"✅ Generated OpenAI embeddings for batch {i // batch_size + 1}")
            except Exception as e:
                logger.error(f"❌ Failed to generate OpenAI embeddings: {e}")
                return False, 0
        
        # Prepare chunk data for insertion
        all_chunks_data = []
        for i, (chunk_text, embedding) in enumerate(zip(chunks, supabase_embeddings)):
            chunk_data = {
                'document_id': document_id,
                'chunk_index': i,
                'content': chunk_text,
                'embedding': embedding,
                'metadata': {
                    'chunk_size': len(chunk_text),
                    'total_chunks': len(chunks),
                    'domain': domain,
                    'domain_id': domain_id,
                    'created_at': datetime.now(timezone.utc).isoformat()
                },
                'domain_id': domain_id,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            all_chunks_data.append(chunk_data)
        
        # Insert chunks in batches
        inserted_count = 0
        insert_batch_size = 100
        for i in range(0, len(all_chunks_data), insert_batch_size):
            batch = all_chunks_data[i:i + insert_batch_size]
            result = supabase.client.table('document_chunks').insert(batch).execute()
            if result.data:
                inserted_count += len(result.data)
        
        logger.info(f"✅ Inserted {inserted_count} chunks for document {document_id}")
        
        # Update document status
        update_data = {
            'status': 'active',
            'chunk_count': len(chunks),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        if domain_id:
            update_data['domain_id'] = domain_id
        
        supabase.client.table('knowledge_documents').update(update_data).eq('id', document_id).execute()
        
        # Sync to Pinecone if enabled (use HuggingFace embeddings for Pinecone)
        if sync_to_pinecone and pinecone_rag_index and domain_namespace_mapping:
            try:
                namespace = domain_namespace_mapping.get(domain_id, 'domains-knowledge') if domain_id else 'domains-knowledge'
                
                # For Pinecone, use HuggingFace embeddings (1024 dims) or OpenAI if needed
                embedding_dim = embedding_service.get_dimensions()
                
                if embedding_dim == 3072:
                    # Use OpenAI embeddings directly if dimensions match (from Supabase)
                    vectors = []
                    for j, chunk_data in enumerate(all_chunks_data):
                        # Regenerate with OpenAI for Pinecone (3072 dims)
                        if openai_client:
                            response = openai_client.embeddings.create(
                                model='text-embedding-3-large',
                                input=[chunk_data['content']]
                            )
                            embedding = response.data[0].embedding
                        else:
                            # Fallback to existing embedding (shouldn't happen)
                            embedding = supabase_embeddings[j]
                        
                        vectors.append({
                            'id': str(chunk_data['document_id']) + '_' + str(chunk_data['chunk_index']),
                            'values': embedding,
                            'metadata': {
                                'chunk_id': str(chunk_data.get('id', '')),
                                'document_id': str(chunk_data['document_id']),
                                'domain_id': str(domain_id) if domain_id else None,
                                'content': chunk_data['content'][:1000],
                                'embedding_type': 'document_chunk',
                                'embedding_model': 'text-embedding-3-large',
                                'timestamp': datetime.now(timezone.utc).isoformat(),
                            }
                        })
                else:
                    # Pinecone requires 3072 dimensions, use OpenAI text-embedding-3-large
                    if not openai_client:
                        logger.warning("⚠️ OpenAI client not available, cannot sync to Pinecone (requires 3072 dims)")
                        return True, len(chunks)  # Document processed in Supabase, just skip Pinecone
                    
                    logger.info(f"🔄 Generating OpenAI embeddings for Pinecone (3072 dims required)...")
                    # Generate embeddings in batches
                    contents = [chunk['content'] for chunk in all_chunks_data]
                    pinecone_embeddings = []
                    
                    for i in range(0, len(contents), batch_size):
                        batch = contents[i:i + batch_size]
                        response = openai_client.embeddings.create(
                            model='text-embedding-3-large',
                            input=batch
                        )
                        batch_embeddings = [item.embedding for item in response.data]
                        pinecone_embeddings.extend(batch_embeddings)
                        logger.debug(f"✅ Generated OpenAI embeddings for Pinecone batch {i // batch_size + 1}")
                    
                    vectors = []
                    for j, chunk_data in enumerate(all_chunks_data):
                        vectors.append({
                            'id': str(chunk_data['document_id']) + '_' + str(chunk_data['chunk_index']),
                            'values': pinecone_embeddings[j],
                            'metadata': {
                                'chunk_id': str(chunk_data.get('id', '')),
                                'document_id': str(chunk_data['document_id']),
                                'domain_id': str(domain_id) if domain_id else None,
                                'content': chunk_data['content'][:1000],
                                'embedding_type': 'document_chunk',
                                'embedding_model': 'text-embedding-3-large',
                                'timestamp': datetime.now(timezone.utc).isoformat(),
                            }
                        })
                
                # Upsert to Pinecone in batches (Pinecone limit: 100 vectors per request, 2-4MB request size)
                # For large documents, we need to split into smaller batches
                pinecone_batch_size = 50  # Conservative batch size to avoid 2-4MB request limit
                total_synced = 0
                
                for i in range(0, len(vectors), pinecone_batch_size):
                    batch = vectors[i:i + pinecone_batch_size]
                    try:
                        # Try v3 API first (namespace as parameter)
                        try:
                            pinecone_rag_index.upsert(vectors=batch, namespace=namespace)
                        except TypeError:
                            # Fallback to v2 API (namespace as method)
                            namespace_obj = pinecone_rag_index.namespace(namespace)
                            if hasattr(namespace_obj, 'upsert'):
                                namespace_obj.upsert(vectors=batch)
                            else:
                                raise Exception("Namespace object does not support upsert")
                        
                        total_synced += len(batch)
                        logger.debug(f"✅ Synced Pinecone batch {i // pinecone_batch_size + 1}/{(len(vectors) + pinecone_batch_size - 1) // pinecone_batch_size} ({len(batch)} chunks)")
                    except Exception as batch_error:
                        logger.warning(f"⚠️ Failed to sync Pinecone batch {i // pinecone_batch_size + 1}: {batch_error}")
                        # Continue with next batch
                
                if total_synced > 0:
                    logger.info(f"✅ Synced {total_synced}/{len(vectors)} chunks to Pinecone namespace '{namespace}'")
                else:
                    logger.warning(f"⚠️ No chunks synced to Pinecone namespace '{namespace}'")
            except Exception as e:
                logger.warning(f"⚠️ Failed to sync chunks to Pinecone: {e}")
        
        logger.info(f"✅ Document {document_id} processed successfully", chunks=len(chunks))
        return True, len(chunks)
        
    except Exception as e:
        logger.error(f"❌ Failed to process document {document_id}", error=str(e))
        # Update status to failed
        try:
            supabase.client.table('knowledge_documents').update({
                'status': 'failed',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', document_id).execute()
        except:
            pass
        return False, 0


async def main():
    """Main function to process documents using HuggingFace embeddings."""
    parser = argparse.ArgumentParser(description='Process documents using HuggingFace embeddings')
    parser.add_argument('--domains', nargs='+', help='Domain names to process', default=None)
    parser.add_argument('--all', action='store_true', help='Process all unprocessed documents')
    parser.add_argument('--status', nargs='+', help='Statuses to process (default: pending, failed)', 
                       default=['pending', 'failed'])
    parser.add_argument('--limit', type=int, help='Maximum number of documents to process', default=None)
    parser.add_argument('--chunk-size', type=int, default=1000, help='Chunk size (default: 1000)')
    parser.add_argument('--chunk-overlap', type=int, default=200, help='Chunk overlap (default: 200)')
    parser.add_argument('--batch-size', type=int, default=50, help='Batch size for embeddings (default: 50)')
    parser.add_argument('--workers', type=int, default=2, help='Number of parallel workers (default: 2)')
    parser.add_argument('--model', type=str, default='mxbai-embed-large-v1', 
                       help='HuggingFace model (default: mxbai-embed-large-v1)')
    parser.add_argument('--sync-pinecone', action='store_true', default=True, 
                       help='Sync to Pinecone (default: True)')
    parser.add_argument('--no-sync-pinecone', action='store_false', dest='sync_pinecone',
                       help='Do NOT sync to Pinecone')
    args = parser.parse_args()
    
    logger.info("🚀 Starting document processing with HuggingFace embeddings")
    logger.info(f"📋 Configuration: model={args.model}, chunk_size={args.chunk_size}, batch_size={args.batch_size}, workers={args.workers}")
    
    # Initialize services
    settings = get_settings()
    supabase = SupabaseClient()
    await supabase.initialize()
    
    cache_manager = CacheManager()
    
    # Use HuggingFace embedding service (free, no rate limits!)
    embedding_service = EmbeddingServiceFactory.create(
        provider='huggingface',
        model_name=args.model
    )
    
    # Initialize embedding service
    if hasattr(embedding_service, 'initialize'):
        await embedding_service.initialize()
    
    logger.info(f"✅ Using HuggingFace embedding model: {args.model} (dimensions: {embedding_service.get_dimensions()})")
    
    # Initialize Pinecone if syncing
    pinecone_rag_index = None
    domain_namespace_mapping = {}
    openai_client = None
    
    if args.sync_pinecone:
        try:
            pinecone_api_key = os.getenv("PINECONE_API_KEY")
            pinecone_rag_index_name = os.getenv("PINECONE_RAG_INDEX_NAME", "vital-rag-production")
            
            if pinecone_api_key:
                pc = Pinecone(api_key=pinecone_api_key)
                pinecone_rag_index = pc.Index(pinecone_rag_index_name)
                logger.info(f"✅ Connected to Pinecone RAG index: {pinecone_rag_index_name}")
                
                # Get domain namespace mapping
                result = supabase.client.table('knowledge_domains_new').select('domain_id, slug, domain_name').execute()
                if not result.data:
                    result = supabase.client.table('knowledge_domains').select('domain_id, slug, name as domain_name').execute()
                
                if result.data:
                    for domain in result.data:
                        domain_id = domain.get('domain_id') or domain.get('slug')
                        slug = domain.get('slug') or (domain.get('domain_name', '').lower().replace(' ', '-'))
                        namespace = slug.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
                        domain_namespace_mapping[domain_id] = namespace
                    logger.info(f"✅ Loaded {len(domain_namespace_mapping)} domain namespace mappings")
                
                # Initialize OpenAI client for Supabase embeddings (1536 dims required)
                openai_api_key = os.getenv("OPENAI_API_KEY")
                if openai_api_key:
                    openai_client = OpenAI(api_key=openai_api_key)
                    logger.info("✅ OpenAI client initialized for Supabase storage (1536 dims) and Pinecone sync (3072 dims)")
                else:
                    logger.warning("⚠️ OPENAI_API_KEY not set, cannot store embeddings in Supabase (requires 1536 dims)")
                    logger.warning("   Supabase schema requires 1536 dimensions, but HuggingFace model outputs different dimensions")
                    logger.warning("   Set OPENAI_API_KEY to use text-embedding-3-small for Supabase storage")
            else:
                logger.warning("⚠️ PINECONE_API_KEY not set, skipping Pinecone sync")
                args.sync_pinecone = False
        except Exception as e:
            logger.warning(f"⚠️ Failed to initialize Pinecone: {e}")
            args.sync_pinecone = False
    
    # Get domain mapping
    domain_mapping = await get_domain_mapping(supabase)
    
    # Get documents to process
    domain_names = None if args.all else args.domains
    documents = await get_documents_to_process(supabase, domain_names, args.status, args.limit)
    
    if not documents:
        logger.warning("⚠️ No documents found to process")
        return
    
    logger.info(f"📚 Found {len(documents)} documents to process")
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
    )
    
    # Process documents
    successful = 0
    failed = 0
    total_chunks = 0
    
    # Process documents with parallel workers
    async def process_doc_wrapper(doc):
        return await process_document(
            doc, supabase, embedding_service, text_splitter, domain_mapping,
            args.batch_size, args.sync_pinecone, pinecone_rag_index,
            domain_namespace_mapping, openai_client
        )
    
    # Process in batches with limited concurrency
    for i in range(0, len(documents), args.workers):
        batch = documents[i:i + args.workers]
        results = await asyncio.gather(*[process_doc_wrapper(doc) for doc in batch], return_exceptions=True)
        
        for result in results:
            if isinstance(result, Exception):
                failed += 1
                logger.error(f"❌ Document processing failed with exception: {result}")
            else:
                success, chunk_count = result
                if success:
                    successful += 1
                    total_chunks += chunk_count
                else:
                    failed += 1
        
        # Small delay between batches
        await asyncio.sleep(0.5)
    
    logger.info("✅ Document processing completed")
    logger.info(f"   Total documents: {len(documents)}")
    logger.info(f"   Successful: {successful}")
    logger.info(f"   Failed: {failed}")
    logger.info(f"   Total chunks created: {total_chunks}")
    logger.info(f"   Average chunks per document: {total_chunks / successful if successful > 0 else 0:.1f}")


if __name__ == '__main__':
    asyncio.run(main())

