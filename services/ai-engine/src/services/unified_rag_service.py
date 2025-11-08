"""
Unified RAG Service for VITAL Path
Comprehensive RAG retrieval with Pinecone, Supabase, and multiple strategies

Production-ready implementation with:
- Robust error handling and logging
- Database-driven domain mappings (no hardcoding)
- Multi-namespace Pinecone search
- Fallback strategies for resilience
- Redis caching for performance
"""

import asyncio
import hashlib
import json
from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime
import structlog
import os
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from services.embedding_service_factory import EmbeddingServiceFactory
from services.cache_manager import CacheManager
from langchain_core.documents import Document
import numpy as np

from services.supabase_client import SupabaseClient
from core.config import get_settings

logger = structlog.get_logger()

class UnifiedRAGService:
    """
    Unified RAG service with Pinecone vector search, Supabase metadata, and Redis caching.
    
    Key Features:
    - Multiple search strategies (semantic, hybrid, agent-optimized, keyword)
    - Domain-aware namespace routing for Pinecone
    - Automatic fallback to Supabase if Pinecone unavailable
    - Request caching for improved performance
    - Comprehensive error handling and logging
    """

    def __init__(self, supabase_client: SupabaseClient, cache_manager: Optional[CacheManager] = None, embedding_model: Optional[str] = None):
        """
        Initialize the Unified RAG Service.
        
        Args:
            supabase_client: Supabase client for database operations
            cache_manager: Optional cache manager for Redis caching
            embedding_model: Optional embedding model name (e.g., "sentence-transformers/all-MiniLM-L6-v2" or "text-embedding-3-large")
        """
        self.settings = get_settings()
        self.supabase = supabase_client
        self.cache_manager = cache_manager
        self.requested_embedding_model = embedding_model  # Store the requested model
        self.embeddings: Optional[OpenAIEmbeddings] = None
        self.embedding_service = None
        self.pinecone: Optional[Pinecone] = None
        self.pinecone_index = None  # For agent search (vital-knowledge)
        self.pinecone_rag_index = None  # For document search (vital-rag-production)
        self.knowledge_namespace = "domains-knowledge"  # Default fallback namespace
        self._domain_namespace_cache: Dict[str, str] = {}  # domain_id/name -> namespace
        
        # Cache statistics
        self._cache_hits = 0
        self._cache_misses = 0
        
        # Initialization state
        self._initialized = False
        self._initialization_error: Optional[str] = None

    async def initialize(self) -> bool:
        """
        Initialize RAG service components.
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        if self._initialized:
            logger.info("✅ UnifiedRAGService already initialized")
            return True
            
        try:
            logger.info("=" * 80)
            logger.info("🔧 [INIT] Starting UnifiedRAGService initialization...")
            logger.info("=" * 80)
            
            # Step 1: Initialize embedding service
            await self._initialize_embeddings()
            
            # Step 2: Initialize Pinecone
            await self._initialize_pinecone()
            
            # Step 3: Load domain namespace mappings from database
            await self._load_domain_namespace_mappings()
            
            self._initialized = True
            logger.info("=" * 80)
            logger.info("🎉 UnifiedRAGService initialization complete!")
            logger.info(f"   - Embeddings: {'✅ OpenAI' if self.embeddings else '✅ HuggingFace'}")
            logger.info(f"   - Pinecone RAG Index: {'✅ Connected' if self.pinecone_rag_index else '⚠️  Not available'}")
            logger.info(f"   - Domain Mappings: {len(self._domain_namespace_cache)} loaded")
            logger.info(f"   - Caching: {'✅ Enabled' if self.cache_manager and self.cache_manager.enabled else '⚠️  Disabled'}")
            logger.info("=" * 80)
            return True

        except Exception as e:
            self._initialization_error = str(e)
            logger.error("=" * 80)
            logger.error("❌ [INIT] UnifiedRAGService initialization failed!", 
                        error=str(e), exc_info=True)
            logger.error("=" * 80)
            return False

    async def _initialize_embeddings(self):
        """Initialize embedding service (OpenAI or HuggingFace)."""
        logger.info("🔧 [INIT] Step 1: Initializing embeddings...")
        
        # Determine which embedding model to use
        # Priority: requested_embedding_model > settings config
        embedding_model = self.requested_embedding_model
        
        if embedding_model:
            # Use requested model - detect provider from model name
            if embedding_model.startswith('text-embedding') or embedding_model.startswith('ada'):
                # OpenAI model
                logger.info(f"🔵 Using requested OpenAI embedding model: {embedding_model}")
                self.embedding_service = EmbeddingServiceFactory.create(
                    provider='openai',
                    model_name=embedding_model
                )
                self.embeddings = OpenAIEmbeddings(
                    openai_api_key=self.settings.openai_api_key,
                    model=embedding_model,
                    chunk_size=1000
                )
                logger.info(f"✅ [INIT] OpenAI embeddings configured model={embedding_model}")
            else:
                # HuggingFace model
                logger.info(f"🤗 Using requested HuggingFace embedding model: {embedding_model}")
                self.embedding_service = EmbeddingServiceFactory.create(
                    provider='huggingface',
                    model_name=embedding_model
                )
                self.embeddings = None
                logger.info(f"✅ [INIT] HuggingFace embeddings configured model={embedding_model}")
        else:
            # Fallback to config-based detection
            self.embedding_service = EmbeddingServiceFactory.create_from_config()
            logger.info("✅ [INIT] Embedding service factory created from config")
            
            # For backward compatibility with OpenAI
            if self.settings.embedding_provider.lower() == 'openai' and self.settings.openai_api_key:
                self.embeddings = OpenAIEmbeddings(
                    openai_api_key=self.settings.openai_api_key,
                    model=self.settings.openai_embedding_model,
                    chunk_size=1000
                )
                logger.info("✅ [INIT] OpenAI embeddings configured", 
                           model=self.settings.openai_embedding_model)
            else:
                self.embeddings = None
                logger.info("✅ [INIT] Using HuggingFace embeddings")

    async def _initialize_pinecone(self):
        """Initialize Pinecone connection and indexes."""
        logger.info("🔧 [INIT] Step 2: Initializing Pinecone...")
        
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        if not pinecone_api_key:
            logger.warning("⚠️  [INIT] PINECONE_API_KEY not set - will use Supabase fallback only")
            return
        
        try:
            # Initialize Pinecone client
            self.pinecone = Pinecone(api_key=pinecone_api_key)
            logger.info("✅ [INIT] Pinecone client created")
            
            # Connect to RAG documents index (primary for knowledge retrieval)
            rag_index_name = os.getenv("PINECONE_RAG_INDEX_NAME", "vital-rag-production")
            try:
                self.pinecone_rag_index = self.pinecone.Index(rag_index_name)
                
                # Verify index is accessible
                stats = self.pinecone_rag_index.describe_index_stats()
                total_vectors = stats.total_vector_count
                namespace_count = len(stats.namespaces) if hasattr(stats, 'namespaces') else 0
                
                logger.info("✅ [INIT] Pinecone RAG index connected", 
                           index=rag_index_name,
                           total_vectors=total_vectors,
                           namespaces=namespace_count)
                
                # Log namespace details
                if hasattr(stats, 'namespaces'):
                    for ns_name, ns_stats in list(stats.namespaces.items())[:5]:  # Show first 5
                        logger.info(f"   📂 Namespace '{ns_name}': {ns_stats.vector_count} vectors")
                        
            except Exception as e:
                logger.warning("⚠️  [INIT] Pinecone RAG index connection failed", 
                             index=rag_index_name, error=str(e))
                self.pinecone_rag_index = None
            
            # Connect to agents index (for GraphRAG)
            agents_index_name = os.getenv("PINECONE_AGENTS_INDEX_NAME", "vital-knowledge")
            try:
                self.pinecone_index = self.pinecone.Index(agents_index_name)
                logger.info("✅ [INIT] Pinecone agents index connected", index=agents_index_name)
            except Exception as e:
                logger.warning("⚠️  [INIT] Pinecone agents index connection failed", 
                             index=agents_index_name, error=str(e))
                self.pinecone_index = None
                
        except Exception as e:
            logger.error("❌ [INIT] Pinecone initialization failed", error=str(e))
            self.pinecone = None
            self.pinecone_rag_index = None
            self.pinecone_index = None

    async def _load_domain_namespace_mappings(self):
        """
        Load domain_id -> namespace slug mappings from Supabase.
        
        This creates a cache that maps:
        - Domain UUIDs -> namespace slugs
        - Domain names (case-insensitive) -> namespace slugs
        
        Enables dynamic routing to correct Pinecone namespaces without hardcoding.
        """
        logger.info("🔧 [INIT] Step 3: Loading domain namespace mappings...")
        
        if not self.supabase or not self.supabase.client:
            logger.warning("⚠️  [INIT] Supabase client not available - cannot load domain mappings")
            return
        
        try:
            # Try knowledge_domains_new first (new architecture)
            logger.info("   📊 Querying knowledge_domains_new table...")
            result = self.supabase.client.table('knowledge_domains_new').select(
                'domain_id, slug, domain_name'
            ).execute()
            
            # Fallback to knowledge_domains (main production table)
            if not result.data or len(result.data) == 0:
                logger.info("   📊 Querying knowledge_domains table...")
                result = self.supabase.client.table('knowledge_domains').select(
                    'domain_id, slug, domain_name, is_active'
                ).eq('is_active', True).execute()
            
            if not result.data or len(result.data) == 0:
                logger.warning("⚠️  [INIT] No domains found in database!")
                return
            
            # Build the mapping cache
            logger.info(f"   ✅ Found {len(result.data)} domains in database")
            
            for domain in result.data:
                domain_id = domain.get('domain_id')
                domain_name = domain.get('domain_name')
                slug = domain.get('slug')
                
                if not domain_id or not domain_name:
                    logger.debug(f"   ⚠️  Skipping domain with missing data: {domain}")
                    continue
                
                # Generate namespace from slug (sanitized)
                if slug:
                    namespace = slug.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
                else:
                    # Fallback: generate from domain name
                    namespace = domain_name.lower().replace(' ', '-').replace('_', '-').replace('/', '-')[:64]
                
                # ✅ FIX: Store multiple lookup keys for ALL naming conventions
                # 1. UUID -> namespace
                self._domain_namespace_cache[domain_id] = namespace
                
                # 2. Domain name (exact case) -> namespace
                self._domain_namespace_cache[domain_name] = namespace
                
                # 3. Domain name (lowercase) -> namespace
                self._domain_namespace_cache[domain_name.lower()] = namespace
                
                # 4. Slug (if provided) -> namespace
                if slug:
                    self._domain_namespace_cache[slug] = namespace
                    self._domain_namespace_cache[slug.lower()] = namespace
                
                # 5. Slug with underscores (agent format) -> namespace
                # "Digital Health" → "digital_health" → namespace "digital-health"
                underscore_slug = domain_name.lower().replace(' ', '_').replace('-', '_')
                self._domain_namespace_cache[underscore_slug] = namespace
                
                # 6. Slug with no separators -> namespace
                # "Digital Health" → "digitalhealth" → namespace "digital-health"
                no_separator_slug = domain_name.lower().replace(' ', '').replace('_', '').replace('-', '')
                self._domain_namespace_cache[no_separator_slug] = namespace
                
                logger.debug(f"   ✅ Mapped: '{domain_name}' ({domain_id[:8]}...) -> '{namespace}' " +
                           f"(+variants: '{underscore_slug}', '{no_separator_slug}')")
            
            # Log summary
            unique_namespaces = len(set(self._domain_namespace_cache.values()))
            logger.info(f"✅ [INIT] Loaded {len(self._domain_namespace_cache)} mappings " +
                       f"({unique_namespaces} unique namespaces)")
            
            # Log sample mappings for verification
            sample_domains = ['Digital Health', 'Regulatory Affairs', 'Clinical Development']
            logger.info("   📋 Sample mappings:")
            for sample in sample_domains:
                if sample.lower() in self._domain_namespace_cache:
                    namespace = self._domain_namespace_cache[sample.lower()]
                    logger.info(f"      - '{sample}' -> '{namespace}'")
                    
        except Exception as e:
            logger.error("❌ [INIT] Failed to load domain namespace mappings", 
                        error=str(e), exc_info=True)

    def _get_namespace_for_domain(self, domain_id: Optional[str]) -> str:
        """
        Get Pinecone namespace for a domain ID or name.
        
        Args:
            domain_id: Domain UUID or domain name (case-insensitive)
            
        Returns:
            Namespace slug or default namespace
        """
        if not domain_id:
            return self.knowledge_namespace
        
        # Try exact match (UUID or exact name)
        if domain_id in self._domain_namespace_cache:
            namespace = self._domain_namespace_cache[domain_id]
            logger.debug(f"✅ Namespace lookup: '{domain_id}' -> '{namespace}'")
            return namespace
        
        # Try case-insensitive match
        domain_id_lower = domain_id.lower()
        if domain_id_lower in self._domain_namespace_cache:
            namespace = self._domain_namespace_cache[domain_id_lower]
            logger.debug(f"✅ Namespace lookup (case-insensitive): '{domain_id}' -> '{namespace}'")
            return namespace
        
        # Not found - log warning and use default
        logger.warning(f"⚠️  Domain '{domain_id}' not found in cache " +
                      f"({len(self._domain_namespace_cache)} mappings available). " +
                      f"Using default namespace: '{self.knowledge_namespace}'")
        return self.knowledge_namespace

    def _get_namespaces_for_domains(self, domain_ids: Optional[List[str]]) -> List[str]:
        """
        Get Pinecone namespaces for multiple domains.
        
        Args:
            domain_ids: List of domain UUIDs or names
            
        Returns:
            List of unique namespace slugs
        """
        if not domain_ids:
            return [self.knowledge_namespace]
        
        namespaces: Set[str] = set()
        for domain_id in domain_ids:
            namespace = self._get_namespace_for_domain(domain_id)
            namespaces.add(namespace)
        
        result = list(namespaces) if namespaces else [self.knowledge_namespace]
        logger.debug(f"📂 Domain mapping: {domain_ids} -> {result}")
        return result

    async def query(
        self,
        query_text: str,
        strategy: str = "hybrid",
        domain_ids: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        agent_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Main RAG query method with multiple strategies and caching.
        
        Args:
            query_text: User's search query
            strategy: Search strategy (semantic, hybrid, agent-optimized, keyword, supabase_only)
            domain_ids: Optional list of domain filters
            filters: Additional metadata filters
            max_results: Maximum number of results to return
            similarity_threshold: Minimum similarity score (0.0-1.0)
            agent_id: Optional agent ID for agent-optimized search
            user_id: Optional user ID for personalization
            session_id: Optional session ID for tracking
            tenant_id: Optional tenant ID for multi-tenancy
            
        Returns:
            Dictionary with sources, context, and metadata
        """
        start_time = datetime.now()

        # Validate initialization
        if not self._initialized:
            logger.error("❌ UnifiedRAGService not initialized!")
            return self._empty_result(strategy, start_time, error="Service not initialized")

        # Return empty result for empty queries
        if not query_text or not query_text.strip():
            logger.warning("⚠️  Empty query received")
            return self._empty_result(strategy, start_time)

        try:
            logger.info("🔍 [RAG QUERY] Starting search",
                       query_preview=query_text[:100],
                       strategy=strategy,
                       domains=domain_ids,
                       max_results=max_results)

            # Generate cache key
            cache_key = self._generate_cache_key(
                query_text, strategy, domain_ids, filters, 
                max_results, similarity_threshold, tenant_id or user_id
            )

            # Check cache first
            if self.cache_manager and self.cache_manager.enabled:
                cached_result = await self.cache_manager.get(cache_key)
                if cached_result:
                    self._cache_hits += 1
                    cached_result["metadata"]["cached"] = True
                    cached_result["metadata"]["cacheHit"] = True
                    cached_result["metadata"]["responseTime"] = (datetime.now() - start_time).total_seconds() * 1000
                    logger.info("✅ RAG cache hit", cache_key=cache_key[:32])
                    return cached_result

            # Cache miss - perform actual search
            self._cache_misses += 1

            # Validate strategy
            valid_strategies = ["semantic", "hybrid", "agent-optimized", "keyword", "supabase_only"]
            if strategy not in valid_strategies:
                logger.warning(f"⚠️  Invalid strategy '{strategy}', using 'hybrid'")
                strategy = "hybrid"

            # Route to appropriate search strategy
            if strategy == "semantic":
                result = await self._semantic_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold
                )
            elif strategy == "hybrid":
                result = await self._hybrid_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold
                )
            elif strategy == "agent-optimized":
                result = await self._agent_optimized_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold, agent_id
                )
            elif strategy == "keyword":
                result = await self._keyword_search(
                    query_text, domain_ids, filters, max_results
                )
            elif strategy == "supabase_only":
                result = await self._supabase_only_search(
                    query_text, domain_ids, filters, max_results
                )
            else:
                # Fallback to hybrid
                result = await self._hybrid_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold
                )

            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Enrich metadata
            final_result = {
                **result,
                "metadata": {
                    **result.get("metadata", {}),
                    "strategy": strategy,
                    "responseTime": processing_time,
                    "cached": False,
                    "cacheHit": False,
                    "domains": domain_ids or [],
                }
            }

            logger.info("✅ [RAG QUERY] Search complete",
                       sources=len(final_result.get("sources", [])),
                       time_ms=processing_time,
                       strategy=strategy)

            # Cache the result
            if self.cache_manager and self.cache_manager.enabled:
                cache_ttl = {
                    "semantic": 1800,
                    "hybrid": 1800,
                    "agent-optimized": 900,
                    "keyword": 3600,
                    "supabase_only": 1800,
                }.get(strategy, 1800)
                
                await self.cache_manager.set(cache_key, final_result, ttl=cache_ttl)

            return final_result

        except Exception as e:
            logger.error("❌ RAG query failed", 
                        error=str(e), 
                        query=query_text[:100],
                        strategy=strategy,
                        exc_info=True)
            return self._empty_result(strategy, start_time, error=str(e))

    async def _semantic_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """
        Semantic search using Pinecone vector similarity.
        
        Searches across domain-specific namespaces in Pinecone.
        Falls back to Supabase if Pinecone unavailable.
        """
        try:
            logger.info("🔍 [SEMANTIC_SEARCH] Starting vector search")
            
            # Generate query embedding
            query_embedding = await self._generate_embedding(query_text)
            logger.info("✅ [SEMANTIC_SEARCH] Query embedding generated", 
                       dimensions=len(query_embedding))

            # Get namespaces for domains
            namespaces = self._get_namespaces_for_domains(domain_ids)
            logger.info(f"📂 [SEMANTIC_SEARCH] Target namespaces: {namespaces}")
            
            sources = []
            
            # Try Pinecone search across namespaces
            if self.pinecone_rag_index:
                for namespace in namespaces:
                    try:
                        logger.info(f"🔍 [SEMANTIC_SEARCH] Searching namespace '{namespace}'...")
                        
                        # Try v3 API (namespace as parameter)
                        try:
                            search_response = self.pinecone_rag_index.query(
                                vector=query_embedding,
                                top_k=max_results,
                                include_metadata=True,
                                filter=self._build_pinecone_filter(domain_ids, filters),
                                namespace=namespace,
                            )
                        except TypeError:
                            # Fallback to v2 API (namespace as method)
                            namespace_obj = self.pinecone_rag_index.namespace(namespace)
                            search_response = namespace_obj.query(
                                vector=query_embedding,
                                top_k=max_results,
                                include_metadata=True,
                                filter=self._build_pinecone_filter(domain_ids, filters),
                            )

                        matches = search_response.matches if hasattr(search_response, 'matches') else []
                        logger.info(f"✅ [SEMANTIC_SEARCH] Namespace '{namespace}': {len(matches)} matches")
                        
                        # Process matches
                        for match in matches:
                            if match.score >= similarity_threshold:
                                metadata = match.metadata if isinstance(match.metadata, dict) else {}
                                sources.append(Document(
                                    page_content=metadata.get("content", ""),
                                    metadata={
                                        "id": metadata.get("chunk_id"),
                                        "document_id": metadata.get("document_id"),
                                        "title": metadata.get("source_title", metadata.get("title")),
                                        "domain": metadata.get("domain"),
                                        "domain_id": metadata.get("domain_id"),
                                        "similarity": match.score,
                                        "namespace": namespace,
                                        **metadata,
                                    },
                                ))
                                
                    except Exception as e:
                        logger.warning(f"⚠️  [SEMANTIC_SEARCH] Namespace '{namespace}' search failed: {e}")
                        continue
                
                logger.info(f"✅ [SEMANTIC_SEARCH] Pinecone search complete: {len(sources)} total sources")
            else:
                logger.warning("⚠️  [SEMANTIC_SEARCH] Pinecone not available")
            
            # Fallback to Supabase if no results from Pinecone
            if not sources:
                logger.info("🔄 [SEMANTIC_SEARCH] Using Supabase fallback...")
                sources = await self._supabase_vector_search(
                    query_embedding, domain_ids, filters, max_results, similarity_threshold
                )

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "semantic",
                    "totalSources": len(sources),
                    "namespaces": namespaces,
                },
            }

        except Exception as e:
            logger.error("❌ [SEMANTIC_SEARCH] Search failed", error=str(e), exc_info=True)
            return {"sources": [], "context": "", "metadata": {"strategy": "semantic", "totalSources": 0, "error": str(e)}}

    async def _hybrid_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """
        Hybrid search combining Pinecone vectors and Supabase metadata.
        
        Provides the best balance of semantic and keyword search.
        """
        try:
            logger.info("🔍 [HYBRID_SEARCH] Starting hybrid search")
            
            # Generate query embedding
            query_embedding = await self._generate_embedding(query_text)
            
            # Get namespaces
            namespaces = self._get_namespaces_for_domains(domain_ids)
            logger.info(f"📂 [HYBRID_SEARCH] Target namespaces: {namespaces}")
            
            vector_results = []

            # Search across all relevant namespaces
            if self.pinecone_rag_index:
                for namespace in namespaces:
                    try:
                        # Calculate top_k per namespace to get max_results total
                        # Use smaller top_k to reduce tokens and improve quality
                        top_k_per_namespace = max(5, max_results // len(namespaces))
                        logger.info(f"🔍 [HYBRID_SEARCH] Searching namespace '{namespace}' with top_k={top_k_per_namespace}")
                        
                        # Try v3 API
                        try:
                            # Don't apply domain_id filter - namespace already partitions by domain
                            # Only apply additional user filters if provided
                            pinecone_filter = self._build_pinecone_filter(None, filters) if filters else None
                            
                            search_response = self.pinecone_rag_index.query(
                                vector=query_embedding,
                                top_k=top_k_per_namespace,
                                include_metadata=True,
                                filter=pinecone_filter,
                                namespace=namespace,
                            )
                        except TypeError:
                            # Fallback to v2 API
                            pinecone_filter = self._build_pinecone_filter(None, filters) if filters else None
                            
                            namespace_obj = self.pinecone_rag_index.namespace(namespace)
                            search_response = namespace_obj.query(
                                vector=query_embedding,
                                top_k=top_k_per_namespace,
                                include_metadata=True,
                                filter=pinecone_filter,
                            )
                        
                        matches = search_response.matches if hasattr(search_response, 'matches') else []
                        logger.info(f"✅ [HYBRID_SEARCH] Namespace '{namespace}': {len(matches)} matches")

                        # ✅ FIX: Define effective_threshold BEFORE loop to prevent UnboundLocalError
                        # Lower threshold to 0.3 for text-embedding-3-large (scores are generally lower)
                        # text-embedding-3-large: typical scores 0.3-0.7 for good matches
                        # text-embedding-3-small: typical scores 0.5-0.9 for good matches
                        effective_threshold = 0.3

                        filtered_count = 0
                        added_count = 0
                        for match in matches:
                            chunk_id = match.metadata.get("chunk_id")
                            doc_id = match.metadata.get("document_id")
                            
                            logger.debug(f"   Match score={match.score:.4f}, threshold={similarity_threshold * 0.8:.4f}, chunk_id='{chunk_id}', doc_id='{doc_id}'")
                            
                            if match.score >= effective_threshold:
                                vector_results.append({
                                    "chunk_id": chunk_id,
                                    "document_id": doc_id,
                                    "similarity": match.score,
                                    "metadata": match.metadata if isinstance(match.metadata, dict) else {},
                                    "namespace": namespace,
                                })
                                added_count += 1
                            else:
                                filtered_count += 1
                        
                        logger.info(f"   Added {added_count} matches, filtered {filtered_count} (score < {effective_threshold:.4f})")
                                
                    except Exception as e:
                        logger.warning(f"⚠️  [HYBRID_SEARCH] Namespace '{namespace}' failed: {e}")
                        continue
            
            logger.info(f"✅ [HYBRID_SEARCH] Vector search complete: {len(vector_results)} results")

            # Enrich with Supabase metadata
            enriched_results = await self._enrich_with_supabase_metadata(
                vector_results, domain_ids, filters
            )

            # Re-rank results
            ranked_results = await self._rerank_results(
                query_text, enriched_results, max_results
            )

            # Convert to Document format
            sources = []
            for r in ranked_results:
                sources.append(Document(
                    page_content=r.get("content", ""),
                    metadata=r.get("metadata", {}),
                ))

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "hybrid",
                    "totalSources": len(sources),
                    "namespaces": namespaces,
                },
            }

        except Exception as e:
            logger.error("❌ [HYBRID_SEARCH] Search failed", error=str(e), exc_info=True)
            return {"sources": [], "context": "", "metadata": {"strategy": "hybrid", "totalSources": 0, "error": str(e)}}

    async def _agent_optimized_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
        agent_id: Optional[str],
    ) -> Dict[str, Any]:
        """Agent-optimized search with relevance boosting."""
        try:
            # Get agent domain preferences
            agent_domains = await self._get_agent_domains(agent_id) if agent_id else None
            if agent_domains:
                domain_ids = domain_ids or []
                domain_ids.extend(agent_domains)

            # Perform hybrid search
            result = await self._hybrid_search(
                query_text, domain_ids, filters, max_results * 2, similarity_threshold
            )

            # Apply agent-specific boosting
            boosted_sources = await self._boost_for_agent(
                result["sources"], agent_id, query_text
            )

            # Sort by boosted score
            boosted_sources.sort(
                key=lambda x: x.get("metadata", {}).get("boosted_score", 0),
                reverse=True
            )

            context = self._generate_context([
                Document(page_content=s["page_content"], metadata=s["metadata"])
                for s in boosted_sources[:max_results]
            ])

            return {
                "sources": boosted_sources[:max_results],
                "context": context,
                "metadata": {
                    "strategy": "agent-optimized",
                    "totalSources": len(boosted_sources[:max_results]),
                    "agent_id": agent_id,
                },
            }

        except Exception as e:
            logger.error("❌ Agent-optimized search failed", error=str(e))
            raise

    async def _keyword_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
    ) -> Dict[str, Any]:
        """Keyword-based search using Supabase full-text search."""
        try:
            results = await self.supabase.keyword_search(
                query_text, domain_ids, filters, max_results
            )

            sources = [
                Document(
                    page_content=r["content"],
                    metadata=r["metadata"],
                )
                for r in results
            ]

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "keyword",
                    "totalSources": len(sources),
                },
            }

        except Exception as e:
            logger.error("❌ Keyword search failed", error=str(e))
            raise

    async def _supabase_only_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
    ) -> Dict[str, Any]:
        """Supabase-only search (fallback mode)."""
        try:
            # Generate embedding
            query_embedding = await self._generate_embedding(query_text)
            
            # Search in Supabase
            results = await self.supabase.search_similar_documents(
                query_embedding=query_embedding,
                filter_conditions={**(filters or {}), "domain_id": domain_ids[0] if domain_ids else None},
                limit=max_results,
                similarity_threshold=0.7,
            )

            sources = [
                Document(
                    page_content=r["content"],
                    metadata=r["metadata"],
                )
                for r in results
            ]

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "supabase_only",
                    "totalSources": len(sources),
                },
            }

        except Exception as e:
            logger.error("❌ Supabase-only search failed", error=str(e))
            raise

    # ==================== HELPER METHODS ====================

    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text."""
        try:
            if self.embedding_service:
                return await self.embedding_service.generate_embedding(text)
            elif self.embeddings:
                return await asyncio.to_thread(self.embeddings.embed_query, text)
            else:
                raise Exception("Embedding service not initialized")
        except Exception as e:
            logger.error("❌ Failed to generate embedding", error=str(e))
            raise

    def _build_pinecone_filter(
        self,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """Build Pinecone metadata filter."""
        if not domain_ids and not filters:
            return None

        filter_dict: Dict[str, Any] = {}

        if domain_ids:
            if len(domain_ids) == 1:
                filter_dict["domain_id"] = {"$eq": domain_ids[0]}
            else:
                filter_dict["domain_id"] = {"$in": domain_ids}

        if filters:
            for key, value in filters.items():
                if isinstance(value, (str, int, float, bool)):
                    filter_dict[key] = {"$eq": value}
                elif isinstance(value, list):
                    filter_dict[key] = {"$in": value}

        return filter_dict if filter_dict else None

    async def _supabase_vector_search(
        self,
        query_embedding: List[float],
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> List[Document]:
        """Fallback Supabase vector search."""
        try:
            results = await self.supabase.search_similar_documents(
                query_embedding=query_embedding,
                filter_conditions={**(filters or {}), "domain_id": domain_ids[0] if domain_ids else None},
                limit=max_results,
                similarity_threshold=similarity_threshold,
            )

            return [
                Document(
                    page_content=r["content"],
                    metadata=r["metadata"],
                )
                for r in results
            ]

        except Exception as e:
            logger.error("❌ Supabase vector search failed", error=str(e))
            return []

    async def _enrich_with_supabase_metadata(
        self,
        vector_results: List[Dict[str, Any]],
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Enrich Pinecone results with Supabase metadata."""
        try:
            if not vector_results:
                return []

            document_ids = list(set(r.get("document_id") for r in vector_results if r.get("document_id")))
            logger.info(f"🔍 [ENRICH] Fetching metadata for {len(document_ids)} unique documents from Supabase")
            
            enriched = await self.supabase.get_documents_metadata(
                document_ids=document_ids,
                domain_ids=domain_ids,
                additional_filters=filters,
            )
            
            logger.info(f"✅ [ENRICH] Got metadata for {len(enriched)} documents from Supabase")

            enriched_results = []
            skipped_count = 0
            for vr in vector_results:
                doc_id = vr.get("document_id")
                if doc_id in enriched:
                    enriched_results.append({
                        **vr,
                        "content": enriched[doc_id].get("content", ""),
                        "metadata": {
                            **vr.get("metadata", {}),
                            **enriched[doc_id].get("metadata", {}),
                        },
                    })
                else:
                    # Use content from Pinecone metadata if Supabase doesn't have it
                    content = vr.get("metadata", {}).get("content", "")
                    if content:
                        enriched_results.append({
                            **vr,
                            "content": content,
                        })
                        logger.debug(f"   Using Pinecone content for doc {doc_id[:8]}... (not in Supabase)")
                    else:
                        skipped_count += 1
                        logger.warning(f"   Skipping doc {doc_id[:8]}... (no content in Pinecone or Supabase)")
            
            logger.info(f"✅ [ENRICH] Enriched {len(enriched_results)} results, skipped {skipped_count}")

            return enriched_results

        except Exception as e:
            logger.error("❌ Failed to enrich with Supabase metadata", error=str(e))
            return vector_results

    async def _rerank_results(
        self,
        query_text: str,
        results: List[Dict[str, Any]],
        max_results: int,
    ) -> List[Dict[str, Any]]:
        """Re-rank results using relevance scoring."""
        try:
            query_lower = query_text.lower()
            scored_results = []

            for result in results:
                base_score = result.get("similarity", 0.0)
                content = result.get("content", "").lower()
                metadata = result.get("metadata", {})

                # Boost for priority weight
                priority_boost = metadata.get("rag_priority_weight", 0.9) * 0.1

                # Boost for query term matches
                query_terms = query_lower.split()
                term_matches = sum(1 for term in query_terms if term in content)
                term_boost = min(term_matches * 0.05, 0.2)

                # Boost for recent documents
                year_boost = 0.0
                if metadata.get("year"):
                    try:
                        year = int(metadata["year"])
                        if year >= 2020:
                            year_boost = 0.05
                    except:
                        pass

                final_score = min(base_score + priority_boost + term_boost + year_boost, 1.0)
                result["boosted_score"] = final_score
                scored_results.append(result)

            scored_results.sort(key=lambda x: x.get("boosted_score", 0), reverse=True)
            return scored_results[:max_results]

        except Exception as e:
            logger.error("❌ Re-ranking failed", error=str(e))
            return results[:max_results]

    async def _get_agent_domains(self, agent_id: str) -> Optional[List[str]]:
        """Get preferred domains for an agent."""
        try:
            agent = await self.supabase.get_agent_by_id(agent_id)
            if agent:
                domains = agent.get("domains") or agent.get("preferred_domains")
                return domains if isinstance(domains, list) else [domains] if domains else None
            return None
        except Exception as e:
            logger.warning("⚠️  Failed to get agent domains", error=str(e))
            return None

    async def _boost_for_agent(
        self,
        sources: List[Dict[str, Any]],
        agent_id: Optional[str],
        query_text: str,
    ) -> List[Dict[str, Any]]:
        """Apply agent-specific boosting to sources."""
        if not agent_id:
            return sources

        try:
            agent_domains = await self._get_agent_domains(agent_id)
            if not agent_domains:
                return sources

            boosted = []
            for source in sources:
                metadata = source.get("metadata", {})
                domain_id = metadata.get("domain_id") or metadata.get("domain")

                agent_boost = 0.1 if domain_id in agent_domains else 0.0
                current_score = metadata.get("similarity", 0.0)
                metadata["boosted_score"] = min(current_score + agent_boost, 1.0)
                boosted.append(source)

            return boosted

        except Exception as e:
            logger.warning("⚠️  Agent boosting failed", error=str(e))
            return sources

    def _generate_context(self, sources: List[Document]) -> str:
        """Generate context summary from sources."""
        if not sources:
            return "No relevant documents found."

        contexts = []
        for i, source in enumerate(sources[:5], 1):  # Top 5 sources
            content = source.page_content[:500] if source.page_content else ""
            title = source.metadata.get("title", source.metadata.get("source_title", "Document"))
            contexts.append(f"[{i}] {title}: {content}...")

        return "\n\n".join(contexts)

    def _document_to_dict(self, doc: Document) -> Dict[str, Any]:
        """Convert Document to dictionary."""
        return {
            "page_content": doc.page_content,
            "metadata": doc.metadata,
        }

    def _generate_cache_key(
        self,
        query_text: str,
        strategy: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
        tenant_id: Optional[str],
    ) -> str:
        """Generate deterministic cache key."""
        key_components = [
            query_text.strip().lower(),
            strategy,
            str(max_results),
            f"{similarity_threshold:.2f}",
        ]
        
        if domain_ids:
            key_components.append(",".join(sorted(domain_ids)))
        
        if filters:
            filter_str = json.dumps(filters, sort_keys=True)
            key_components.append(filter_str)
        
        key_data = "|".join(key_components)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        tenant_prefix = tenant_id[:8] if tenant_id else "default"
        return f"vital:rag:{tenant_prefix}:{key_hash}"

    def _empty_result(self, strategy: str, start_time: datetime, error: Optional[str] = None) -> Dict[str, Any]:
        """Generate empty result dictionary."""
        return {
            "sources": [],
            "context": "",
            "metadata": {
                "strategy": strategy,
                "totalSources": 0,
                "responseTime": (datetime.now() - start_time).total_seconds() * 1000,
                "cached": False,
                "error": error,
            }
        }

    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get RAG cache statistics."""
        total_requests = self._cache_hits + self._cache_misses
        hit_rate = self._cache_hits / total_requests if total_requests > 0 else 0.0
        
        stats = {
            "caching_enabled": self.cache_manager is not None and self.cache_manager.enabled,
            "hits": self._cache_hits,
            "misses": self._cache_misses,
            "total_requests": total_requests,
            "hit_rate": round(hit_rate * 100, 2),
        }
        
        if self.cache_manager:
            global_stats = await self.cache_manager.get_cache_stats()
            stats["global_cache_stats"] = global_stats
        
        return stats

    async def invalidate_cache(self, tenant_id: Optional[str] = None, pattern: Optional[str] = None):
        """Invalidate RAG cache entries."""
        if not self.cache_manager or not self.cache_manager.enabled:
            logger.warning("Cache manager not available for invalidation")
            return
        
        if tenant_id:
            await self.cache_manager.invalidate_tenant_cache(tenant_id, pattern or "rag")
            logger.info("RAG cache invalidated for tenant", tenant_id=tenant_id[:8])

    async def cleanup(self):
        """Cleanup resources."""
        logger.info("🧹 Unified RAG service cleanup completed")
