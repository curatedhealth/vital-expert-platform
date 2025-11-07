#!/usr/bin/env python3
"""
Reprocess Documents Script

This script reprocesses existing documents in the knowledge_documents table:
1. Chunks document content into overlapping chunks
2. Generates embeddings for each chunk
3. Stores chunks with embeddings in document_chunks table
4. Maps domain names to domain_id UUIDs
5. Updates document status to 'active'

Usage:
    python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"
    python scripts/reprocess_documents.py --all
"""

import asyncio
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import structlog

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

# Load environment variables from multiple possible locations
# Priority: .env.vercel first (has service role key), then .env.local
# Script is at: services/ai-engine/src/scripts/reprocess_documents.py
# Root is at: services/ai-engine/src/scripts -> ../../../../ (5 levels up)
script_path = Path(__file__)
root_dir = script_path.parent.parent.parent.parent.parent  # services/ai-engine/src/scripts -> root (VITAL path)
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

if not env_loaded:
    # Try loading from current working directory
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
    logger.warning("⚠️ No .env file found, using system environment variables")

# Map NEXT_PUBLIC_* variables to non-public versions if needed
import os
if not os.getenv('SUPABASE_URL') and os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    os.environ['SUPABASE_URL'] = os.getenv('NEXT_PUBLIC_SUPABASE_URL').strip('"')
    logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL")

# Use NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY if available, otherwise fallback to anon key
if not os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY') == 'your_actual_key':
    if os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY').strip('"')
        logger.info("✅ Mapped NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to SUPABASE_SERVICE_ROLE_KEY")
    elif os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY'):
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY').strip('"')
        logger.warning("⚠️ Using SUPABASE_ANON_KEY as SUPABASE_SERVICE_ROLE_KEY (read-only mode)")
        logger.warning("   For write operations, set SUPABASE_SERVICE_ROLE_KEY in .env.local")


async def get_domain_mapping(supabase: SupabaseClient) -> Dict[str, str]:
    """
    Get mapping from domain names to domain_id UUIDs.
    
    Returns:
        Dictionary mapping domain_name -> domain_id
    """
    try:
        # Query knowledge_domains table
        result = supabase.client.table('knowledge_domains').select('domain_id, domain_name, code, slug').execute()
        
        mapping = {}
        for domain in result.data:
            # Map by domain_name (primary)
            mapping[domain['domain_name']] = domain['domain_id']
            # Also map by code and slug for flexibility
            if domain.get('code'):
                mapping[domain['code']] = domain['domain_id']
            if domain.get('slug'):
                mapping[domain['slug']] = domain['domain_id']
        
        logger.info("✅ Domain mapping loaded", domains=len(mapping))
        return mapping
    except Exception as e:
        logger.error("❌ Failed to load domain mapping", error=str(e))
        return {}


async def get_documents_to_process(
    supabase: SupabaseClient,
    domain_names: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Get documents that need processing.
    
    Args:
        supabase: Supabase client
        domain_names: List of domain names to filter by (e.g., ["Digital Health", "Regulatory Affairs"])
                     If None, processes all documents
    
    Returns:
        List of documents to process
    """
    try:
        all_documents = []
        
        # Filter by domain names if provided
        if domain_names:
            # Handle multiple domain name formats for each domain
            for domain_name in domain_names:
                # Try exact match and variations
                domain_variations = [
                    domain_name,
                    domain_name.lower(),
                    domain_name.replace(' ', '-'),
                    domain_name.replace(' ', '_'),
                    domain_name.title(),
                    domain_name.upper()
                ]
                
                # Query for each variation (Supabase doesn't support OR easily)
                for domain_var in domain_variations:
                    try:
                        result = supabase.client.table('knowledge_documents').select('*').eq('domain', domain_var).not_.is_('content', 'null').execute()
                        if result.data:
                            # Add documents that aren't already in the list
                            for doc in result.data:
                                if doc['id'] not in [d['id'] for d in all_documents]:
                                    all_documents.append(doc)
                    except Exception as e:
                        # Continue if one variation fails
                        continue
        else:
            # Get all documents with content
            result = supabase.client.table('knowledge_documents').select('*').not_.is_('content', 'null').execute()
            all_documents = result.data if result.data else []
        
        logger.info(
            "✅ Documents retrieved",
            count=len(all_documents),
            domains=domain_names or "all"
        )
        
        return all_documents
    except Exception as e:
        logger.error("❌ Failed to get documents", error=str(e))
        return []


async def chunk_document(
    content: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[str]:
    """
    Chunk document content into overlapping chunks.
    
    Args:
        content: Document content
        chunk_size: Size of each chunk
        chunk_overlap: Overlap between chunks
    
    Returns:
        List of chunk texts
    """
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


async def process_document(
    document: Dict[str, Any],
    supabase: SupabaseClient,
    embedding_service: Any,
    text_splitter: RecursiveCharacterTextSplitter,
    domain_mapping: Dict[str, str],
    batch_size: int = 10,
    sync_to_pinecone: bool = True,
    pinecone_rag_index = None,
    domain_namespace_mapping: Dict[str, str] = None,
    openai_client: OpenAI = None
) -> tuple[bool, List[Dict[str, Any]]]:
    """
    Process a single document: chunk, embed, and store.
    
    Args:
        supabase: Supabase client
        embedding_service: Embedding service instance
        document: Document dictionary from database
        domain_mapping: Mapping from domain names to domain_id UUIDs
        chunk_size: Size of each chunk
        chunk_overlap: Overlap between chunks
        batch_size: Batch size for embedding generation
    
    Returns:
        True if successful, False otherwise
    """
    document_id = document['id']
    content = document.get('content', '')
    domain = document.get('domain', '')
    
    if not content or len(content.strip()) == 0:
        logger.warning(f"⚠️ Document {document_id} has no content, skipping")
        return False
    
    try:
        # Update status to processing
        supabase.client.table('knowledge_documents').update({
            'status': 'processing',
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', document_id).execute()
        
        # Map domain name to domain_id
        domain_id = None
        if domain:
            # Try exact match first
            domain_id = domain_mapping.get(domain)
            if not domain_id:
                # Try variations
                domain_id = domain_mapping.get(domain.lower())
            if not domain_id:
                domain_id = domain_mapping.get(domain.replace(' ', '-'))
            if not domain_id:
                domain_id = domain_mapping.get(domain.replace(' ', '_'))
        
        # Chunk the content
        chunks = text_splitter.split_text(content)
        logger.info(
            f"📦 Document {document_id} chunked",
            chunks=len(chunks),
            domain=domain,
            domain_id=domain_id
        )
        
        if not chunks:
            logger.warning(f"⚠️ Document {document_id} produced no chunks")
            return False
        
        # Delete existing chunks for this document (if any)
        supabase.client.table('document_chunks').delete().eq('document_id', document_id).execute()
        logger.info(f"🗑️  Deleted existing chunks for document {document_id}")
        
        # Process chunks in batches
        all_chunks_data = []
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            batch_indices = list(range(i, i + len(batch)))
            
            logger.info(
                f"🔄 Processing batch {i // batch_size + 1}/{(len(chunks) + batch_size - 1) // batch_size}",
                document_id=document_id,
                batch_size=len(batch)
            )
            
            # Generate embeddings for batch
            try:
                if hasattr(embedding_service, 'generate_embeddings_batch'):
                    embeddings = await embedding_service.generate_embeddings_batch(batch)
                elif hasattr(embedding_service, 'embed_texts'):
                    # For sentence-transformers style
                    embeddings = await embedding_service.embed_texts(batch)
                else:
                    # Fallback: generate one by one
                    embeddings = []
                    for text in batch:
                        if hasattr(embedding_service, 'generate_embedding'):
                            emb = await embedding_service.generate_embedding(text)
                            embeddings.append(emb.embedding if hasattr(emb, 'embedding') else emb)
                        else:
                            emb = await embedding_service.embed_text(text)
                            embeddings.append(emb.embedding if hasattr(emb, 'embedding') else emb)
            except Exception as e:
                logger.error(f"❌ Failed to generate embeddings for batch", error=str(e))
                # Try individual embeddings as fallback
                embeddings = []
                for text in batch:
                    try:
                        if hasattr(embedding_service, 'generate_embedding'):
                            emb = await embedding_service.generate_embedding(text)
                            embeddings.append(emb.embedding if hasattr(emb, 'embedding') else emb)
                        else:
                            emb = await embedding_service.embed_text(text)
                            embeddings.append(emb.embedding if hasattr(emb, 'embedding') else emb)
                    except Exception as e2:
                        logger.error(f"❌ Failed to generate embedding for chunk", error=str(e2))
                        # Use zero vector as fallback (shouldn't happen, but prevents crash)
                        embeddings.append([0.0] * embedding_service.get_dimensions())
            
            # Prepare chunk data for insertion
            for j, (chunk_text, embedding) in enumerate(zip(batch, embeddings)):
                chunk_index = batch_indices[j]
                
                chunk_data = {
                    'document_id': document_id,
                    'chunk_index': chunk_index,
                    'content': chunk_text,
                    'embedding': embedding,  # Vector type in Supabase
                    'metadata': {
                        'chunk_size': len(chunk_text),
                        'total_chunks': len(chunks),
                        'domain': domain,
                        'domain_id': domain_id,
                        'created_at': datetime.now(timezone.utc).isoformat()
                    },
                    'domain_id': domain_id,  # Store domain_id in chunk table if column exists
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                all_chunks_data.append(chunk_data)
        
        # Insert all chunks in a single batch
        inserted_chunk_ids = {}
        if all_chunks_data:
            # Insert in batches of 100 to avoid too large requests
            insert_batch_size = 100
            for i in range(0, len(all_chunks_data), insert_batch_size):
                batch = all_chunks_data[i:i + insert_batch_size]
                result = supabase.client.table('document_chunks').insert(batch).select('id, chunk_index').execute()
                
                # Map chunk_index to chunk_id for later Pinecone sync
                if result.data:
                    for chunk_row in result.data:
                        chunk_idx = chunk_row.get('chunk_index')
                        if chunk_idx is not None:
                            inserted_chunk_ids[chunk_idx] = chunk_row['id']
            
            logger.info(
                f"✅ Chunks inserted for document {document_id}",
                total_chunks=len(all_chunks_data)
            )
            
            # Update all_chunks_data with inserted IDs
            for chunk_data in all_chunks_data:
                chunk_idx = chunk_data.get('chunk_index')
                if chunk_idx in inserted_chunk_ids:
                    chunk_data['id'] = inserted_chunk_ids[chunk_idx]
        
        # Update document status to active and set chunk_count
        update_data = {
            'status': 'active',
            'chunk_count': len(chunks),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Update domain_id if we found a mapping
        if domain_id:
            update_data['domain_id'] = domain_id
        
        supabase.client.table('knowledge_documents').update(update_data).eq('id', document_id).execute()
        
        logger.info(
            f"✅ Document {document_id} processed successfully",
            chunks=len(chunks),
            domain=domain,
            domain_id=domain_id
        )
        
        # Sync to Pinecone if enabled
        if sync_to_pinecone and pinecone_rag_index and domain_namespace_mapping and openai_client:
            try:
                # Get namespace for this domain
                namespace = domain_namespace_mapping.get(domain_id, 'domains-knowledge') if domain_id else 'domains-knowledge'
                
                # Regenerate embeddings with text-embedding-3-large (3072 dims) for Pinecone
                contents = [chunk['content'] for chunk in all_chunks_data]
                embedding_response = openai_client.embeddings.create(
                    model='text-embedding-3-large',  # 3072 dimensions to match Pinecone index
                    input=contents
                )
                
                # Prepare vectors for Pinecone
                vectors = []
                for j, chunk_data in enumerate(all_chunks_data):
                    vectors.append({
                        'id': str(chunk_data['document_id']) + '_' + str(chunk_data['chunk_index']),  # Use document_id + chunk_index as ID
                        'values': embedding_response.data[j].embedding,  # 3072 dimensions
                        'metadata': {
                            'chunk_id': str(chunk_data.get('id', '')),  # Supabase chunk ID if available
                            'document_id': str(chunk_data['document_id']),
                            'domain_id': str(domain_id) if domain_id else None,
                            'content': chunk_data['content'][:1000],  # First 1000 chars
                            'embedding_type': 'document_chunk',
                            'entity_type': 'chunk',
                            'embedding_model': 'text-embedding-3-large',
                            'timestamp': datetime.now(timezone.utc).isoformat(),
                            **(chunk_data.get('metadata', {})),
                        }
                    })
                
                # Upsert to Pinecone
                try:
                    pinecone_rag_index.upsert(vectors=vectors, namespace=namespace)
                    logger.info(f"✅ Synced {len(vectors)} chunks to Pinecone namespace '{namespace}'")
                except (TypeError, AttributeError):
                    # Fallback to v2 API
                    namespace_obj = pinecone_rag_index.namespace(namespace)
                    if hasattr(namespace_obj, 'upsert'):
                        namespace_obj.upsert(vectors=vectors)
                        logger.info(f"✅ Synced {len(vectors)} chunks to Pinecone namespace '{namespace}'")
                    else:
                        logger.warning(f"⚠️ Could not sync to Pinecone: namespace object does not support upsert")
            except Exception as e:
                logger.warning(f"⚠️ Failed to sync chunks to Pinecone: {e}")
        
        return True, all_chunks_data  # Return chunks data for Pinecone sync
        
    except Exception as e:
        logger.error(
            f"❌ Failed to process document {document_id}",
            error=str(e),
            domain=domain
        )
        # Update status to failed
        try:
            supabase.client.table('knowledge_documents').update({
                'status': 'failed',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', document_id).execute()
        except:
            pass
        return False


async def main():
    """Main function to reprocess documents."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Reprocess documents for RAG')
    parser.add_argument(
        '--domains',
        nargs='+',
        help='Domain names to process (e.g., "Digital Health" "Regulatory Affairs")',
        default=['Digital Health', 'Regulatory Affairs']
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Process all documents (ignore domain filter)'
    )
    parser.add_argument(
        '--chunk-size',
        type=int,
        default=1000,
        help='Chunk size in characters (default: 1000)'
    )
    parser.add_argument(
        '--chunk-overlap',
        type=int,
        default=200,
        help='Chunk overlap in characters (default: 200)'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=10,
        help='Batch size for embedding generation (default: 10)'
    )
    
    args = parser.parse_args()
    
    logger.info("🚀 Starting document reprocessing")
    logger.info(f"📋 Configuration: chunk_size={args.chunk_size}, chunk_overlap={args.chunk_overlap}, batch_size={args.batch_size}")
    
    # Initialize services
    settings = get_settings()
    supabase = SupabaseClient()
    await supabase.initialize()
    
    cache_manager = CacheManager()
    
    # Use text-embedding-3-small (1536 dimensions) to match Supabase vector column
    # If Supabase expects 1536 dimensions, we need to use a model that produces 1536
    embedding_service = EmbeddingServiceFactory.create(
        provider='openai',
        model_name='text-embedding-3-small'  # 1536 dimensions (matches Supabase)
    )
    
    logger.info(f"✅ Using embedding model: text-embedding-3-small (1536 dimensions)")
    
    # Initialize embedding service
    if hasattr(embedding_service, 'initialize'):
        await embedding_service.initialize()
    
    # Initialize Pinecone and OpenAI client if syncing to Pinecone
    pinecone_rag_index = None
    domain_namespace_mapping = {}
    openai_client = None
    
    if sync_to_pinecone:
        try:
            # Get Pinecone config
            pinecone_api_key = os.getenv("PINECONE_API_KEY")
            pinecone_rag_index_name = os.getenv("PINECONE_RAG_INDEX_NAME", "vital-rag-production")
            
            if pinecone_api_key:
                # Initialize Pinecone
                pc = Pinecone(api_key=pinecone_api_key)
                pinecone_rag_index = pc.Index(pinecone_rag_index_name)
                logger.info(f"✅ Connected to Pinecone RAG index: {pinecone_rag_index_name}")
                
                # Get domain namespace mapping
                result = supabase.client.table('knowledge_domains').select('domain_id, slug, domain_name').execute()
                if result.data:
                    for domain in result.data:
                        domain_id = domain.get('domain_id')
                        slug = domain.get('slug') or domain.get('domain_name', '').lower().replace(' ', '-')
                        namespace = slug.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
                        domain_namespace_mapping[domain_id] = namespace
                    logger.info(f"✅ Loaded {len(domain_namespace_mapping)} domain namespace mappings")
                
                # Initialize OpenAI client for Pinecone embeddings (3072 dims)
                openai_api_key = os.getenv("OPENAI_API_KEY")
                if openai_api_key:
                    openai_client = OpenAI(api_key=openai_api_key)
                    logger.info("✅ OpenAI client initialized for Pinecone sync")
                else:
                    logger.warning("⚠️ OPENAI_API_KEY not set, cannot sync to Pinecone")
                    sync_to_pinecone = False
            else:
                logger.warning("⚠️ PINECONE_API_KEY not set, skipping Pinecone sync")
                sync_to_pinecone = False
        except Exception as e:
            logger.warning(f"⚠️ Failed to initialize Pinecone sync: {e}")
            sync_to_pinecone = False
    
    # Get domain mapping
    domain_mapping = await get_domain_mapping(supabase)
    logger.info(f"✅ Domain mapping: {domain_mapping}")
    
    # Get documents to process
    domain_names = None if args.all else args.domains
    documents = await get_documents_to_process(supabase, domain_names)
    
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
    
    # Process each document
    successful = 0
    failed = 0
    
    for i, document in enumerate(documents, 1):
        logger.info(
            f"📄 Processing document {i}/{len(documents)}",
            document_id=document['id'],
            title=document.get('title', 'Unknown')[:50],
            domain=document.get('domain', 'Unknown')
        )
        
        success, chunks_data = await process_document(
            document=document,
            supabase=supabase,
            embedding_service=embedding_service,
            text_splitter=text_splitter,
            domain_mapping=domain_mapping,
            batch_size=args.batch_size,
            sync_to_pinecone=sync_to_pinecone,
            pinecone_rag_index=pinecone_rag_index,
            domain_namespace_mapping=domain_namespace_mapping,
            openai_client=openai_client
        )
        
        if success:
            successful += 1
        else:
            failed += 1
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.5)
    
    logger.info(
        "✅ Document reprocessing completed",
        total=len(documents),
        successful=successful,
        failed=failed
    )


if __name__ == '__main__':
    asyncio.run(main())

