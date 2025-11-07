"""
Knowledge Pipeline Integration with Unified RAG Service
=======================================================

This module integrates the knowledge pipeline with the existing
Unified RAG Service for ingesting scraped content into Pinecone and Supabase.

Instead of directly uploading, this uses the production RAG service
to ensure consistent document processing, chunking, and vector storage.
"""

import asyncio
import hashlib
from typing import Dict, Any, List, Optional
from pathlib import Path
import structlog
from datetime import datetime

# Import the unified RAG service
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.unified_rag_service import UnifiedRAGService
from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager
from core.config import get_settings
from langchain_text_splitters import RecursiveCharacterTextSplitter  # ✅ LangChain 1.0
from langchain_core.documents import Document

logger = structlog.get_logger()


class RAGIntegrationUploader:
    """
    Uploader that uses the unified RAG service for document ingestion.
    
    This ensures:
    - Consistent document processing
    - Proper chunking strategy
    - Metadata standardization
    - Domain/namespace routing
    - Pinecone + Supabase sync
    """
    
    def __init__(self, embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.settings = get_settings()
        self.embedding_model = embedding_model
        self.supabase_client: Optional[SupabaseClient] = None
        self.rag_service: Optional[UnifiedRAGService] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
        )
        
        # Statistics
        self.uploaded_count = 0
        self.failed_count = 0
        self.chunks_created = 0
    
    async def initialize(self):
        """Initialize RAG service and dependencies"""
        try:
            logger.info("🚀 Initializing RAG Integration Uploader...")
            
            # Initialize Supabase client
            self.supabase_client = SupabaseClient()
            await self.supabase_client.initialize()
            
            # Initialize cache manager (optional)
            cache_manager = None
            try:
                cache_manager = CacheManager()
                await cache_manager.initialize()
                logger.info("✅ Cache manager initialized")
            except Exception as e:
                logger.warning(f"⚠️ Cache manager initialization failed: {e}")
            
            # Initialize unified RAG service
            self.rag_service = UnifiedRAGService(
                supabase_client=self.supabase_client,
                cache_manager=cache_manager
            )
            await self.rag_service.initialize()
            
            logger.info("✅ RAG Integration Uploader initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG Integration Uploader: {e}")
            raise
    
    async def upload_content(self, content: Dict[str, Any]) -> bool:
        """
        Upload content using the unified RAG service.
        
        Args:
            content: Dictionary containing:
                - url: Source URL
                - title: Document title
                - content: Full text content
                - domain: Domain category
                - category: Specific category
                - tags: List of tags
                - description: Brief description
                - scraped_at: Timestamp
                - content_hash: SHA256 hash
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not content.get('content'):
                logger.warning(f"⚠️ Skipping document without content: {content.get('url')}")
                return False
            
            logger.info(f"📄 Processing document: {content.get('title', content.get('url'))}")
            
            # Step 1: Create metadata for Supabase
            metadata = {
                'title': content.get('title', ''),
                'url': content.get('url', ''),
                'domain': content.get('domain', 'uncategorized'),
                'category': content.get('category', 'general'),
                'tags': content.get('tags', []),
                'description': content.get('description', ''),
                'source_type': 'web_scrape',
                'scraped_at': content.get('scraped_at'),
                'content_hash': content.get('content_hash'),
                'word_count': content.get('word_count', 0),
                'embedding_model': self.embedding_model,
                'processed_at': datetime.utcnow().isoformat()
            }
            
            # Step 2: Get or create domain_id for namespace routing
            domain_id = await self._get_or_create_domain(
                content.get('domain', 'uncategorized'),
                content.get('category', 'general')
            )
            
            # Step 3: Store document metadata in Supabase
            document_id = await self._store_document_metadata(
                content=content.get('content'),
                metadata=metadata,
                domain_id=domain_id
            )
            
            if not document_id:
                logger.error(f"❌ Failed to store document metadata for {content.get('url')}")
                self.failed_count += 1
                return False
            
            # Step 4: Chunk the content
            chunks = self.text_splitter.split_text(content.get('content'))
            self.chunks_created += len(chunks)
            
            logger.info(f"🔢 Created {len(chunks)} chunks for document")
            
            # Step 5: Generate embeddings and upload to Pinecone via RAG service
            success = await self._upload_chunks_to_pinecone(
                document_id=document_id,
                chunks=chunks,
                metadata=metadata,
                domain_id=domain_id
            )
            
            if success:
                logger.info(f"✅ Successfully uploaded document: {content.get('title')}")
                self.uploaded_count += 1
                return True
            else:
                logger.error(f"❌ Failed to upload chunks for {content.get('url')}")
                self.failed_count += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Error uploading content: {str(e)}")
            self.failed_count += 1
            return False
    
    async def _get_or_create_domain(self, domain: str, category: str) -> Optional[str]:
        """Get or create a knowledge domain in Supabase"""
        try:
            # Check if domain exists
            result = self.supabase_client.client.table('knowledge_domains_new')\
                .select('domain_id')\
                .eq('slug', domain)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]['domain_id']
            
            # Create new domain
            result = self.supabase_client.client.table('knowledge_domains_new')\
                .insert({
                    'slug': domain,
                    'domain_name': domain.replace('-', ' ').replace('_', ' ').title(),
                    'description': f'Domain for {category} content',
                    'is_active': True,
                    'created_at': datetime.utcnow().isoformat()
                })\
                .execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"✅ Created new domain: {domain}")
                return result.data[0]['domain_id']
            
            return None
            
        except Exception as e:
            logger.warning(f"⚠️ Error managing domain: {e}")
            return None
    
    async def _store_document_metadata(
        self,
        content: str,
        metadata: Dict[str, Any],
        domain_id: Optional[str]
    ) -> Optional[str]:
        """Store document metadata in Supabase knowledge_documents table"""
        try:
            # Check if document already exists (by URL or hash)
            existing = self.supabase_client.client.table('knowledge_documents')\
                .select('id')\
                .eq('url', metadata.get('url'))\
                .execute()
            
            document_data = {
                'title': metadata.get('title'),
                'content': content,
                'url': metadata.get('url'),
                'domain_id': domain_id,
                'category': metadata.get('category'),
                'tags': metadata.get('tags', []),
                'metadata': {
                    'description': metadata.get('description'),
                    'word_count': metadata.get('word_count'),
                    'scraped_at': metadata.get('scraped_at'),
                    'content_hash': metadata.get('content_hash'),
                    'source_type': metadata.get('source_type'),
                    'embedding_model': metadata.get('embedding_model')
                },
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if existing.data and len(existing.data) > 0:
                # Update existing document
                result = self.supabase_client.client.table('knowledge_documents')\
                    .update(document_data)\
                    .eq('id', existing.data[0]['id'])\
                    .execute()
                
                logger.info(f"🔄 Updated existing document in Supabase")
                return existing.data[0]['id']
            else:
                # Insert new document
                document_data['created_at'] = datetime.utcnow().isoformat()
                result = self.supabase_client.client.table('knowledge_documents')\
                    .insert(document_data)\
                    .execute()
                
                if result.data and len(result.data) > 0:
                    logger.info(f"💾 Stored new document in Supabase")
                    return result.data[0]['id']
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error storing document metadata: {e}")
            return None
    
    async def _upload_chunks_to_pinecone(
        self,
        document_id: str,
        chunks: List[str],
        metadata: Dict[str, Any],
        domain_id: Optional[str]
    ) -> bool:
        """Upload document chunks to Pinecone via RAG service"""
        try:
            if not self.rag_service or not self.rag_service.pinecone_rag_index:
                logger.warning("⚠️ Pinecone not available, skipping vector upload")
                return True  # Still consider success if Supabase succeeded
            
            # Generate embeddings for chunks
            embeddings = await self._generate_embeddings(chunks)
            
            if not embeddings or len(embeddings) != len(chunks):
                logger.error("❌ Failed to generate embeddings")
                return False
            
            # Determine namespace from domain_id
            namespace = self.rag_service._get_namespace_for_domain(domain_id)
            
            logger.info(f"📤 Uploading {len(chunks)} vectors to namespace: {namespace}")
            
            # Prepare vectors for Pinecone
            vectors = []
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"{document_id}_chunk_{idx}"
                chunk_metadata = {
                    'document_id': document_id,
                    'title': metadata.get('title'),
                    'url': metadata.get('url'),
                    'domain': metadata.get('domain'),
                    'category': metadata.get('category'),
                    'chunk_index': idx,
                    'chunk_text': chunk[:500],  # Preview
                    'tags': metadata.get('tags', []),
                    'scraped_at': metadata.get('scraped_at'),
                    'embedding_model': self.embedding_model
                }
                
                vectors.append({
                    'id': vector_id,
                    'values': embedding,
                    'metadata': chunk_metadata
                })
            
            # Batch upload to Pinecone
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.rag_service.pinecone_rag_index.upsert(
                    vectors=batch,
                    namespace=namespace
                )
                logger.info(f"📤 Uploaded batch {i//batch_size + 1}/{(len(vectors)-1)//batch_size + 1}")
            
            logger.info(f"✅ Successfully uploaded {len(vectors)} vectors to Pinecone")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error uploading to Pinecone: {e}")
            return False
    
    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using the RAG service's embedding service"""
        try:
            if not self.rag_service or not self.rag_service.embedding_service:
                logger.error("❌ Embedding service not available")
                return []
            
            # Use the embedding service from RAG
            embeddings = await asyncio.get_event_loop().run_in_executor(
                None,
                self.rag_service.embedding_service.embed_documents,
                texts
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"❌ Error generating embeddings: {e}")
            return []
    
    async def close(self):
        """Cleanup resources"""
        # Supabase client doesn't need explicit closing
        pass
    
    def get_stats(self) -> Dict[str, Any]:
        """Get upload statistics"""
        return {
            'uploaded': self.uploaded_count,
            'failed': self.failed_count,
            'chunks_created': self.chunks_created,
            'enabled': True
        }

