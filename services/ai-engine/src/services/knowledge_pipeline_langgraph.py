"""
Knowledge Pipeline Post-Processing with LangGraph
=================================================

Advanced document processing workflow using LangGraph for:
1. Metadata enrichment and completion
2. Document chunking with smart strategies
3. Embedding generation
4. Multi-stage quality validation
5. Supabase and Pinecone ingestion

Integrates with the existing Unified RAG Service architecture.
"""

import asyncio
import hashlib
import json
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from datetime import datetime
from pathlib import Path
import structlog

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# LangChain imports
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# VITAL Path services
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from services.unified_rag_service import UnifiedRAGService
from services.supabase_client import SupabaseClient
from services.cache_manager import CacheManager
from core.config import get_settings

# Import metadata enrichment modules
try:
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts"))
    from metadata_auto_calculator import enrich_metadata
    from comprehensive_metadata_mapper import map_source_to_metadata
except ImportError:
    enrich_metadata = None
    map_source_to_metadata = None

logger = structlog.get_logger()


# =============================================================================
# STATE DEFINITION FOR LANGGRAPH
# =============================================================================

class DocumentProcessingState(TypedDict):
    """State for the document processing workflow"""
    # Input
    raw_content: str
    source_url: str
    source_metadata: Dict[str, Any]
    
    # Processing stages
    enriched_metadata: Optional[Dict[str, Any]]
    chunks: Optional[List[str]]
    embeddings: Optional[List[List[float]]]
    document_id: Optional[str]
    domain_id: Optional[str]
    
    # Status tracking
    stage: str  # metadata, chunking, embedding, upload, complete
    errors: List[str]
    warnings: List[str]
    
    # Statistics
    word_count: int
    chunk_count: int
    quality_score: float
    
    # Results
    success: bool
    pinecone_vectors_uploaded: int
    supabase_stored: bool


# =============================================================================
# PROCESSING NODES
# =============================================================================

class KnowledgePipelineProcessor:
    """LangGraph-based document processing pipeline"""
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        rag_service: UnifiedRAGService,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        self.supabase_client = supabase_client
        self.rag_service = rag_service
        self.embedding_model = embedding_model
        self.settings = get_settings()
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
        )
        
        # Build the LangGraph workflow
        self.workflow = self._build_workflow()
        
        logger.info("✅ Knowledge Pipeline Processor initialized with LangGraph")
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow for document processing"""
        
        # Create the graph
        workflow = StateGraph(DocumentProcessingState)
        
        # Add nodes (processing stages)
        workflow.add_node("enrich_metadata", self._enrich_metadata_node)
        workflow.add_node("validate_quality", self._validate_quality_node)
        workflow.add_node("chunk_document", self._chunk_document_node)
        workflow.add_node("generate_embeddings", self._generate_embeddings_node)
        workflow.add_node("store_supabase", self._store_supabase_node)
        workflow.add_node("upload_pinecone", self._upload_pinecone_node)
        workflow.add_node("finalize", self._finalize_node)
        
        # Define edges (workflow flow)
        workflow.set_entry_point("enrich_metadata")
        
        # Conditional routing based on quality
        workflow.add_conditional_edges(
            "enrich_metadata",
            self._should_continue_after_metadata,
            {
                "validate": "validate_quality",
                "skip": "finalize"
            }
        )
        
        workflow.add_conditional_edges(
            "validate_quality",
            self._should_continue_after_validation,
            {
                "chunk": "chunk_document",
                "skip": "finalize"
            }
        )
        
        workflow.add_edge("chunk_document", "generate_embeddings")
        workflow.add_edge("generate_embeddings", "store_supabase")
        workflow.add_edge("store_supabase", "upload_pinecone")
        workflow.add_edge("upload_pinecone", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile(checkpointer=MemorySaver())
    
    # =========================================================================
    # WORKFLOW NODES
    # =========================================================================
    
    async def _enrich_metadata_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 1: Enrich and complete metadata"""
        try:
            logger.info(f"📝 Stage 1: Enriching metadata for {state['source_url']}")
            
            # Map source to comprehensive metadata schema
            if map_source_to_metadata:
                source_config = {
                    'url': state['source_url'],
                    **state['source_metadata']
                }
                mapped_metadata = map_source_to_metadata(source_config, {
                    'content': state['raw_content'],
                    'title': state['source_metadata'].get('title', ''),
                    'url': state['source_url']
                })
            else:
                mapped_metadata = state['source_metadata'].copy()
            
            # Auto-calculate quality scores
            if enrich_metadata:
                enriched = enrich_metadata(
                    mapped_metadata,
                    content=state['raw_content']
                )
            else:
                enriched = mapped_metadata
            
            # Calculate word count
            word_count = len(state['raw_content'].split())
            
            state['enriched_metadata'] = enriched
            state['word_count'] = word_count
            state['quality_score'] = enriched.get('quality_score', 0.0)
            state['stage'] = 'metadata_complete'
            
            logger.info(f"✅ Metadata enriched - Quality: {state['quality_score']:.2f}, Words: {word_count}")
            
        except Exception as e:
            logger.error(f"❌ Error enriching metadata: {str(e)}")
            state['errors'].append(f"Metadata enrichment failed: {str(e)}")
        
        return state
    
    async def _validate_quality_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 2: Validate document quality"""
        try:
            logger.info(f"🔍 Stage 2: Validating document quality")
            
            quality_score = state['quality_score']
            word_count = state['word_count']
            
            # Quality checks
            if word_count < 100:
                state['warnings'].append(f"Low word count: {word_count} words")
            
            if quality_score < 3.0:
                state['warnings'].append(f"Low quality score: {quality_score:.2f}")
            
            # Mark stage complete
            state['stage'] = 'validation_complete'
            
            logger.info(f"✅ Quality validation complete - Score: {quality_score:.2f}")
            
        except Exception as e:
            logger.error(f"❌ Error validating quality: {str(e)}")
            state['errors'].append(f"Quality validation failed: {str(e)}")
        
        return state
    
    async def _chunk_document_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 3: Chunk document into manageable pieces"""
        try:
            logger.info(f"✂️ Stage 3: Chunking document")
            
            # Split text into chunks
            chunks = self.text_splitter.split_text(state['raw_content'])
            
            state['chunks'] = chunks
            state['chunk_count'] = len(chunks)
            state['stage'] = 'chunking_complete'
            
            logger.info(f"✅ Created {len(chunks)} chunks")
            
        except Exception as e:
            logger.error(f"❌ Error chunking document: {str(e)}")
            state['errors'].append(f"Chunking failed: {str(e)}")
            state['chunks'] = []
        
        return state
    
    async def _generate_embeddings_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 4: Generate embeddings for chunks"""
        try:
            logger.info(f"🧠 Stage 4: Generating embeddings for {len(state['chunks'])} chunks")
            
            if not state['chunks']:
                state['warnings'].append("No chunks to generate embeddings for")
                return state
            
            # Generate embeddings using RAG service
            embeddings = await self._generate_embeddings(state['chunks'])
            
            state['embeddings'] = embeddings
            state['stage'] = 'embeddings_complete'
            
            logger.info(f"✅ Generated {len(embeddings)} embeddings")
            
        except Exception as e:
            logger.error(f"❌ Error generating embeddings: {str(e)}")
            state['errors'].append(f"Embedding generation failed: {str(e)}")
            state['embeddings'] = []
        
        return state
    
    async def _store_supabase_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 5: Store document metadata and content in Supabase"""
        try:
            logger.info(f"💾 Stage 5: Storing in Supabase")
            
            # Get or create domain
            domain_id = await self._get_or_create_domain(
                state['enriched_metadata'].get('domain', 'uncategorized'),
                state['enriched_metadata'].get('category', 'general')
            )
            
            # Store document
            document_id = await self._store_document(
                content=state['raw_content'],
                metadata=state['enriched_metadata'],
                domain_id=domain_id
            )
            
            state['document_id'] = document_id
            state['domain_id'] = domain_id
            state['supabase_stored'] = bool(document_id)
            state['stage'] = 'supabase_complete'
            
            logger.info(f"✅ Stored in Supabase - Document ID: {document_id}")
            
        except Exception as e:
            logger.error(f"❌ Error storing in Supabase: {str(e)}")
            state['errors'].append(f"Supabase storage failed: {str(e)}")
            state['supabase_stored'] = False
        
        return state
    
    async def _upload_pinecone_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 6: Upload vectors to Pinecone"""
        try:
            logger.info(f"📤 Stage 6: Uploading to Pinecone")
            
            if not state['embeddings'] or not state['document_id']:
                state['warnings'].append("Skipping Pinecone upload - missing embeddings or document_id")
                return state
            
            # Upload to Pinecone
            vectors_uploaded = await self._upload_to_pinecone(
                document_id=state['document_id'],
                chunks=state['chunks'],
                embeddings=state['embeddings'],
                metadata=state['enriched_metadata'],
                domain_id=state['domain_id']
            )
            
            state['pinecone_vectors_uploaded'] = vectors_uploaded
            state['stage'] = 'pinecone_complete'
            
            logger.info(f"✅ Uploaded {vectors_uploaded} vectors to Pinecone")
            
        except Exception as e:
            logger.error(f"❌ Error uploading to Pinecone: {str(e)}")
            state['errors'].append(f"Pinecone upload failed: {str(e)}")
            state['pinecone_vectors_uploaded'] = 0
        
        return state
    
    async def _finalize_node(self, state: DocumentProcessingState) -> DocumentProcessingState:
        """Node 7: Finalize processing and mark complete"""
        try:
            logger.info(f"🏁 Stage 7: Finalizing")
            
            # Determine overall success
            state['success'] = (
                state['supabase_stored'] and
                state['pinecone_vectors_uploaded'] > 0 and
                len(state['errors']) == 0
            )
            
            state['stage'] = 'complete'
            
            if state['success']:
                logger.info(f"🎉 Processing complete - Success!")
            else:
                logger.warning(f"⚠️ Processing complete with issues - Errors: {len(state['errors'])}")
            
        except Exception as e:
            logger.error(f"❌ Error finalizing: {str(e)}")
            state['errors'].append(f"Finalization failed: {str(e)}")
            state['success'] = False
        
        return state
    
    # =========================================================================
    # CONDITIONAL ROUTING
    # =========================================================================
    
    def _should_continue_after_metadata(self, state: DocumentProcessingState) -> str:
        """Decide whether to continue after metadata enrichment"""
        if state['errors']:
            return "skip"
        if not state['raw_content'] or state['word_count'] < 50:
            return "skip"
        return "validate"
    
    def _should_continue_after_validation(self, state: DocumentProcessingState) -> str:
        """Decide whether to continue after validation"""
        if state['errors']:
            return "skip"
        if state['quality_score'] < 2.0:
            logger.warning(f"⚠️ Skipping low quality document (score: {state['quality_score']:.2f})")
            return "skip"
        return "chunk"
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using RAG service"""
        try:
            if not self.rag_service or not self.rag_service.embedding_service:
                logger.error("❌ Embedding service not available")
                return []
            
            embeddings = await asyncio.get_event_loop().run_in_executor(
                None,
                self.rag_service.embedding_service.embed_documents,
                texts
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"❌ Error generating embeddings: {e}")
            return []
    
    async def _get_or_create_domain(self, domain: str, category: str) -> Optional[str]:
        """Get or create domain in Supabase"""
        try:
            result = self.supabase_client.client.table('knowledge_domains_new')\
                .select('domain_id')\
                .eq('slug', domain)\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]['domain_id']
            
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
                return result.data[0]['domain_id']
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error managing domain: {e}")
            return None
    
    async def _store_document(
        self,
        content: str,
        metadata: Dict[str, Any],
        domain_id: Optional[str]
    ) -> Optional[str]:
        """Store document in Supabase knowledge_documents table"""
        try:
            # Check if document exists
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
                'metadata': metadata,  # Store all metadata as JSON
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if existing.data and len(existing.data) > 0:
                # Update
                result = self.supabase_client.client.table('knowledge_documents')\
                    .update(document_data)\
                    .eq('id', existing.data[0]['id'])\
                    .execute()
                
                return existing.data[0]['id']
            else:
                # Insert
                document_data['created_at'] = datetime.utcnow().isoformat()
                result = self.supabase_client.client.table('knowledge_documents')\
                    .insert(document_data)\
                    .execute()
                
                if result.data and len(result.data) > 0:
                    return result.data[0]['id']
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error storing document: {e}")
            return None
    
    async def _upload_to_pinecone(
        self,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata: Dict[str, Any],
        domain_id: Optional[str]
    ) -> int:
        """Upload vectors to Pinecone"""
        try:
            if not self.rag_service or not self.rag_service.pinecone_rag_index:
                logger.warning("⚠️ Pinecone not available")
                return 0
            
            namespace = self.rag_service._get_namespace_for_domain(domain_id)
            
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
                    'chunk_text': chunk[:500],
                    'tags': metadata.get('tags', []),
                    'quality_score': metadata.get('quality_score'),
                    'embedding_model': self.embedding_model
                }
                
                vectors.append({
                    'id': vector_id,
                    'values': embedding,
                    'metadata': chunk_metadata
                })
            
            # Batch upload
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.rag_service.pinecone_rag_index.upsert(
                    vectors=batch,
                    namespace=namespace
                )
            
            return len(vectors)
            
        except Exception as e:
            logger.error(f"❌ Error uploading to Pinecone: {e}")
            return 0
    
    # =========================================================================
    # PUBLIC API
    # =========================================================================
    
    async def process_document(
        self,
        raw_content: str,
        source_url: str,
        source_metadata: Dict[str, Any]
    ) -> DocumentProcessingState:
        """
        Process a single document through the LangGraph workflow.
        
        Args:
            raw_content: The scraped text content
            source_url: Source URL
            source_metadata: Initial metadata from scraping
        
        Returns:
            Final state with processing results
        """
        # Initialize state
        initial_state: DocumentProcessingState = {
            'raw_content': raw_content,
            'source_url': source_url,
            'source_metadata': source_metadata,
            'enriched_metadata': None,
            'chunks': None,
            'embeddings': None,
            'document_id': None,
            'domain_id': None,
            'stage': 'initialized',
            'errors': [],
            'warnings': [],
            'word_count': 0,
            'chunk_count': 0,
            'quality_score': 0.0,
            'success': False,
            'pinecone_vectors_uploaded': 0,
            'supabase_stored': False
        }
        
        logger.info(f"🚀 Starting LangGraph workflow for: {source_url}")
        
        # Execute the workflow
        config = {"configurable": {"thread_id": hashlib.md5(source_url.encode()).hexdigest()}}
        
        final_state = None
        async for state in self.workflow.astream(initial_state, config):
            final_state = state
            # Log intermediate states if needed
            if isinstance(state, dict):
                for node_name, node_state in state.items():
                    if 'stage' in node_state:
                        logger.info(f"  📍 {node_name}: {node_state['stage']}")
        
        return final_state
    
    async def process_batch(
        self,
        documents: List[Dict[str, Any]],
        max_concurrent: int = 3
    ) -> List[DocumentProcessingState]:
        """
        Process multiple documents concurrently.
        
        Args:
            documents: List of dicts with 'content', 'url', 'metadata'
            max_concurrent: Max concurrent processing tasks
        
        Returns:
            List of final states
        """
        logger.info(f"📦 Processing batch of {len(documents)} documents")
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_with_semaphore(doc):
            async with semaphore:
                return await self.process_document(
                    raw_content=doc['content'],
                    source_url=doc['url'],
                    source_metadata=doc.get('metadata', {})
                )
        
        results = await asyncio.gather(
            *[process_with_semaphore(doc) for doc in documents],
            return_exceptions=True
        )
        
        # Filter out exceptions and log them
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Document {i} failed: {str(result)}")
            else:
                final_results.append(result)
        
        success_count = sum(1 for r in final_results if r and r.get('success'))
        logger.info(f"✅ Batch complete - {success_count}/{len(documents)} successful")
        
        return final_results


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

async def create_knowledge_processor(
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
) -> KnowledgePipelineProcessor:
    """
    Factory function to create and initialize a KnowledgePipelineProcessor.
    
    Usage:
        processor = await create_knowledge_processor()
        result = await processor.process_document(content, url, metadata)
    """
    # Initialize dependencies
    supabase_client = SupabaseClient()
    await supabase_client.initialize()
    
    cache_manager = None
    try:
        cache_manager = CacheManager()
        await cache_manager.initialize()
    except Exception as e:
        logger.warning(f"⚠️ Cache manager not available: {e}")
    
    rag_service = UnifiedRAGService(
        supabase_client=supabase_client,
        cache_manager=cache_manager
    )
    await rag_service.initialize()
    
    processor = KnowledgePipelineProcessor(
        supabase_client=supabase_client,
        rag_service=rag_service,
        embedding_model=embedding_model
    )
    
    logger.info("✅ Knowledge Pipeline Processor created and ready")
    
    return processor


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

if __name__ == '__main__':
    async def test():
        # Create processor
        processor = await create_knowledge_processor()
        
        # Process a single document
        result = await processor.process_document(
            raw_content="This is a test document about digital health...",
            source_url="https://example.com/test",
            source_metadata={
                'title': 'Test Document',
                'domain': 'healthcare',
                'category': 'research',
                'tags': ['digital-health', 'test']
            }
        )
        
        print(f"\n{'='*60}")
        print(f"Processing Result:")
        print(f"  Success: {result['success']}")
        print(f"  Stage: {result['stage']}")
        print(f"  Word Count: {result['word_count']}")
        print(f"  Chunks: {result['chunk_count']}")
        print(f"  Quality Score: {result['quality_score']:.2f}")
        print(f"  Pinecone Vectors: {result['pinecone_vectors_uploaded']}")
        print(f"  Errors: {result['errors']}")
        print(f"  Warnings: {result['warnings']}")
        print(f"{'='*60}\n")
    
    asyncio.run(test())

