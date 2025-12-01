"""
Unified RAG Service for VITAL Path
Comprehensive RAG retrieval with Pinecone, Supabase, and multiple strategies
"""

import asyncio
import hashlib
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import structlog
import os
# Conditional pinecone import - only import when needed
try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    Pinecone = None
    PINECONE_AVAILABLE = False
from langchain_openai import OpenAIEmbeddings
from services.embedding_service_factory import EmbeddingServiceFactory
from services.cache_manager import CacheManager
from langchain_core.documents import Document
import numpy as np

from services.supabase_client import SupabaseClient
try:
    from services.neo4j_client import Neo4jClient
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    Neo4jClient = None
try:
    from services.evidence_scoring_service import get_evidence_scoring_service, EvidenceScoringService
    EVIDENCE_SCORING_AVAILABLE = True
except ImportError:
    EVIDENCE_SCORING_AVAILABLE = False
    get_evidence_scoring_service = None
    EvidenceScoringService = None

# SciBERT-based Evidence Detection (Phase 4)
try:
    from services.evidence_detector import get_evidence_detector, EvidenceDetector, EvidenceType, EvidenceQuality
    EVIDENCE_DETECTOR_AVAILABLE = True
except ImportError:
    EVIDENCE_DETECTOR_AVAILABLE = False
    get_evidence_detector = None
    EvidenceDetector = None
from core.config import get_settings

logger = structlog.get_logger()

class UnifiedRAGService:
    """Unified RAG service with Pinecone vector search, Supabase metadata, Neo4j graph search, and Redis caching"""

    def __init__(self, supabase_client: SupabaseClient, cache_manager: Optional[CacheManager] = None):
        self.settings = get_settings()
        self.supabase = supabase_client
        self.cache_manager = cache_manager
        self.embeddings: Optional[OpenAIEmbeddings] = None  # Can be OpenAI or HuggingFace adapter
        self.embedding_service = None  # Unified embedding service interface
        self.pinecone: Optional[Pinecone] = None
        self.pinecone_index = None
        self.knowledge_namespace = "KD-general"  # Default namespace (updated to KD-* convention)
        self.default_kd_namespaces = ["KD-general", "KD-best-practices"]  # Fallback namespaces
        self.neo4j_client: Optional[Neo4jClient] = None  # Neo4j client for graph search
        self.evidence_detector: Optional[EvidenceDetector] = None  # SciBERT evidence detector

        # Cache statistics
        self._cache_hits = 0
        self._cache_misses = 0

    async def initialize(self):
        """Initialize RAG service components"""
        try:
            # Use embedding service factory to auto-detect provider
            self.embedding_service = EmbeddingServiceFactory.create_from_config()
            
            # For backward compatibility, also create OpenAI embeddings if OpenAI is used
            # (some code may still reference self.embeddings directly)
            if self.settings.embedding_provider.lower() == 'openai' and self.settings.openai_api_key:
                self.embeddings = OpenAIEmbeddings(
                    openai_api_key=self.settings.openai_api_key,
                    model=self.settings.openai_embedding_model,
                    chunk_size=1000
                )
            else:
                # For HuggingFace, create a wrapper that implements the same interface
                # LangChain-compatible embeddings will use embedding_service directly
                self.embeddings = None

            # Initialize Pinecone (if available)
            pinecone_api_key = os.getenv("PINECONE_API_KEY")
            pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "vital-knowledge")
            
            if not PINECONE_AVAILABLE:
                logger.warning("⚠️ Pinecone module not installed, using Supabase only")
                self.pinecone = None
                self.pinecone_index = None
            elif pinecone_api_key:
                try:
                    self.pinecone = Pinecone(api_key=pinecone_api_key)
                    self.pinecone_index = self.pinecone.Index(pinecone_index_name)
                    logger.info("✅ Pinecone index connected", index_name=pinecone_index_name)
                except Exception as e:
                    logger.warning("⚠️ Pinecone index not found, will use Supabase only", error=str(e))
                    self.pinecone_index = None
            else:
                logger.warning("⚠️ PINECONE_API_KEY not set, using Supabase only")
                self.pinecone = None
                self.pinecone_index = None

            # Initialize SciBERT Evidence Detector (Phase 4)
            if EVIDENCE_DETECTOR_AVAILABLE:
                try:
                    self.evidence_detector = get_evidence_detector()
                    logger.info("✅ SciBERT Evidence Detector initialized")
                except Exception as e:
                    logger.warning("⚠️ Evidence detector initialization failed (optional)", error=str(e))
                    self.evidence_detector = None
            else:
                logger.info("ℹ️ Evidence detector not available (missing dependencies)")

            logger.info("✅ Unified RAG service initialized", caching_enabled=self.cache_manager is not None and self.cache_manager.enabled)

        except Exception as e:
            logger.error("❌ Failed to initialize Unified RAG service", error=str(e))
            raise

    def _generate_cache_key(
        self,
        query_text: str,
        strategy: str,
        domain_ids: Optional[List[str]] = None,
        filters: Optional[Dict[str, Any]] = None,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        tenant_id: Optional[str] = None,
    ) -> str:
        """
        Generate deterministic cache key for RAG query.
        
        Args:
            query_text: Search query
            strategy: RAG strategy
            domain_ids: Domain filters
            filters: Additional filters
            max_results: Max results
            similarity_threshold: Similarity threshold
            tenant_id: Tenant ID for isolation
            
        Returns:
            MD5 hash of query parameters
        """
        # Build cache key components
        key_components = [
            query_text.strip().lower(),
            strategy,
            str(max_results),
            f"{similarity_threshold:.2f}",
        ]
        
        # Add domain IDs if present (sorted for consistency)
        if domain_ids:
            key_components.append(",".join(sorted(domain_ids)))
        
        # Add filters if present (sorted keys for consistency)
        if filters:
            filter_str = json.dumps(filters, sort_keys=True)
            key_components.append(filter_str)
        
        # Create hash
        key_data = "|".join(key_components)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        
        # Include tenant for isolation
        tenant_prefix = tenant_id[:8] if tenant_id else "default"
        return f"vital:rag:{tenant_prefix}:{key_hash}"

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
        Main query method supporting multiple strategies with Redis caching.
        
        Golden Rule #3: All expensive operations MUST have caching.
        """
        start_time = datetime.now()

        # Return empty result for empty queries
        if not query_text or not query_text.strip():
            return {
                "sources": [],
                "context": "",
                "metadata": {
                    "strategy": strategy,
                    "totalSources": 0,
                    "responseTime": 0,
                    "cached": False,
                }
            }

        try:
            # Generate cache key
            cache_key = self._generate_cache_key(
                query_text=query_text,
                strategy=strategy,
                domain_ids=domain_ids,
                filters=filters,
                max_results=max_results,
                similarity_threshold=similarity_threshold,
                tenant_id=tenant_id or user_id,
            )

            # Check cache first (Golden Rule #3)
            if self.cache_manager and self.cache_manager.enabled:
                cached_result = await self.cache_manager.get(cache_key)
                if cached_result:
                    self._cache_hits += 1
                    logger.info(
                        "✅ RAG cache hit",
                        query=query_text[:50],
                        strategy=strategy,
                        cache_key=cache_key[:32],
                    )
                    
                    # Add cache metadata
                    cached_result["metadata"]["cached"] = True
                    cached_result["metadata"]["cacheHit"] = True
                    cached_result["metadata"]["responseTime"] = (datetime.now() - start_time).total_seconds() * 1000
                    
                    return cached_result

            # Cache miss - perform actual search
            self._cache_misses += 1
            logger.debug(
                "⚠️ RAG cache miss",
                query=query_text[:50],
                strategy=strategy,
                cache_key=cache_key[:32],
            )

            # Validate strategy
            valid_strategies = ["semantic", "hybrid", "agent-optimized", "keyword", "supabase_only", "graph", "true_hybrid"]
            if strategy not in valid_strategies:
                raise ValueError(f"Invalid RAG strategy: {strategy}. Must be one of {valid_strategies}")

            # Route to appropriate strategy
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
            elif strategy == "graph":
                result = await self._graph_search(
                    query_text, domain_ids, filters, max_results, agent_id
                )
            elif strategy == "true_hybrid":
                result = await self._true_hybrid_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold, agent_id
                )
            else:
                # Default to true_hybrid (Neo4j + Pinecone + Supabase)
                result = await self._true_hybrid_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold, agent_id
                )

            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Apply evidence scoring if available (Phase 5)
            evidence_analytics = None
            if EVIDENCE_SCORING_AVAILABLE and result.get("sources"):
                try:
                    evidence_service = get_evidence_scoring_service()
                    # Convert sources to chunk format for scoring
                    chunks = [
                        {
                            "id": s.get("id", str(i)),
                            "text": s.get("content", s.get("text", "")),
                            "metadata": s.get("metadata", {})
                        }
                        for i, s in enumerate(result.get("sources", []))
                    ]
                    scored, evidence_analytics = evidence_service.score_evidence_batch(
                        chunks=chunks,
                        query=query_text,
                        min_confidence=0.0  # Include all for now, filter in response
                    )
                    # Enrich sources with evidence scores
                    for i, source in enumerate(result.get("sources", [])):
                        if i < len(scored):
                            source["evidence_score"] = scored[i].to_dict()
                    logger.debug(
                        "evidence_scoring_applied",
                        sources_scored=len(scored),
                        avg_confidence=evidence_analytics.get("avg_confidence", 0)
                    )
                except Exception as e:
                    logger.warning("evidence_scoring_failed", error=str(e))

            # Apply SciBERT Evidence Detection (Phase 4) - extract entities and citations
            evidence_detection = None
            if self.evidence_detector and result.get("context"):
                try:
                    # Detect evidence in the context
                    detected_evidence = await self.evidence_detector.detect_evidence(
                        text=result.get("context", ""),
                        min_confidence=0.6,
                        include_context=True
                    )

                    # Extract unique entities and citations
                    all_entities = []
                    all_citations = []
                    for evidence in detected_evidence:
                        all_entities.extend([{
                            "text": e.text,
                            "type": e.entity_type.value,
                            "confidence": e.confidence
                        } for e in evidence.entities])
                        all_citations.extend([{
                            "text": c.text,
                            "pmid": c.pmid,
                            "doi": c.doi,
                            "url": c.url,
                            "confidence": c.confidence
                        } for c in evidence.citations])

                    # Deduplicate entities by text
                    seen_entities = set()
                    unique_entities = []
                    for e in all_entities:
                        if e["text"].lower() not in seen_entities:
                            seen_entities.add(e["text"].lower())
                            unique_entities.append(e)

                    evidence_detection = {
                        "evidence_count": len(detected_evidence),
                        "entities": unique_entities[:20],  # Top 20 entities
                        "citations": all_citations[:10],   # Top 10 citations
                        "evidence_types": list(set(e.evidence_type.value for e in detected_evidence)),
                        "quality_levels": list(set(e.quality.value for e in detected_evidence)),
                    }

                    logger.debug(
                        "evidence_detection_applied",
                        evidence_count=len(detected_evidence),
                        entity_count=len(unique_entities),
                        citation_count=len(all_citations)
                    )
                except Exception as e:
                    logger.warning("evidence_detection_failed", error=str(e))

            # Add metadata
            final_result = {
                **result,
                "metadata": {
                    **result.get("metadata", {}),
                    "strategy": strategy,
                    "responseTime": processing_time,
                    "cached": False,
                    "cacheHit": False,
                    "evidence_analytics": evidence_analytics,
                    "evidence_detection": evidence_detection,
                }
            }

            # Cache the result (Golden Rule #3)
            if self.cache_manager and self.cache_manager.enabled:
                # TTL based on strategy (more stable results = longer cache)
                cache_ttl = {
                    "semantic": 1800,  # 30 minutes
                    "hybrid": 1800,    # 30 minutes
                    "agent-optimized": 900,  # 15 minutes (agent-specific)
                    "keyword": 3600,   # 1 hour (most stable)
                    "supabase_only": 1800,  # 30 minutes
                }.get(strategy, 1800)

                await self.cache_manager.set(cache_key, final_result, ttl=cache_ttl)
                logger.debug(
                    "💾 RAG result cached",
                    cache_key=cache_key[:32],
                    ttl=cache_ttl,
                    sources=len(final_result.get("sources", [])),
                )

            return final_result

        except Exception as e:
            logger.error("❌ RAG query failed", error=str(e), query=query_text[:100])
            # Return empty result on error
            return {
                "sources": [],
                "context": "",
                "metadata": {
                    "strategy": strategy,
                    "totalSources": 0,
                    "responseTime": (datetime.now() - start_time).total_seconds() * 1000,
                    "cached": False,
                    "error": str(e),
                }
            }

    async def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get RAG cache statistics.
        
        Returns:
            Dictionary with cache hit/miss stats
        """
        total_requests = self._cache_hits + self._cache_misses
        hit_rate = self._cache_hits / total_requests if total_requests > 0 else 0.0
        
        stats = {
            "caching_enabled": self.cache_manager is not None and self.cache_manager.enabled,
            "hits": self._cache_hits,
            "misses": self._cache_misses,
            "total_requests": total_requests,
            "hit_rate": round(hit_rate * 100, 2),  # Percentage
        }
        
        # Add global cache stats if available
        if self.cache_manager:
            global_stats = await self.cache_manager.get_cache_stats()
            stats["global_cache_stats"] = global_stats
        
        return stats

    async def invalidate_cache(self, tenant_id: Optional[str] = None, pattern: Optional[str] = None):
        """
        Invalidate RAG cache entries.
        
        Args:
            tenant_id: Optional tenant ID to invalidate (None = all)
            pattern: Optional pattern to match (e.g., 'rag')
        """
        if not self.cache_manager or not self.cache_manager.enabled:
            logger.warning("Cache manager not available for invalidation")
            return
        
        if tenant_id:
            await self.cache_manager.invalidate_tenant_cache(tenant_id, pattern or "rag")
            logger.info("RAG cache invalidated for tenant", tenant_id=tenant_id[:8])
        else:
            # Invalidate all RAG cache (use with caution!)
            logger.warning("Invalidating ALL RAG cache entries")
            # This would require a scan-delete operation for all rag:* keys
            # For now, just log the request
            pass

    async def _semantic_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """Semantic search using Pinecone vector similarity"""
        # Fixed: Corrected indentation for try-except block - 2025-11-02
        try:
            # Generate query embedding
            query_embedding = await self._generate_embedding(query_text)

            # Build Pinecone filter
            pinecone_filter = self._build_pinecone_filter(domain_ids, filters)

            if self.pinecone_index:
                # Use Pinecone for vector search
                search_response = self.pinecone_index.query(
                    namespace=self.knowledge_namespace,  # Pass namespace as parameter
                    vector=query_embedding,
                    top_k=max_results,
                    include_metadata=True,
                    filter=pinecone_filter if pinecone_filter else None,
                )

                # Format results
                sources = []
                for match in search_response.matches or []:
                    if match.score >= similarity_threshold:
                        sources.append(Document(
                            page_content=match.metadata.get("content", "") if isinstance(match.metadata, dict) else getattr(match.metadata, "content", ""),
                            metadata={
                                "id": match.metadata.get("chunk_id") if isinstance(match.metadata, dict) else getattr(match.metadata, "chunk_id", None),
                                "document_id": match.metadata.get("document_id") if isinstance(match.metadata, dict) else getattr(match.metadata, "document_id", None),
                                "title": match.metadata.get("source_title") if isinstance(match.metadata, dict) else getattr(match.metadata, "source_title", None),
                                "domain": match.metadata.get("domain") if isinstance(match.metadata, dict) else getattr(match.metadata, "domain", None),
                                "domain_id": match.metadata.get("domain_id") if isinstance(match.metadata, dict) else getattr(match.metadata, "domain_id", None),
                                "similarity": match.score,
                                **(match.metadata if isinstance(match.metadata, dict) else {}),
                            },
                        ))
            else:
                # Fallback to Supabase vector search
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
                },
            }

        except Exception as e:
            logger.error("❌ Semantic search failed", error=str(e))
            raise

    async def _hybrid_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """Hybrid search combining Pinecone vectors and Supabase metadata"""
        try:
            # Generate query embedding
            query_embedding = await self._generate_embedding(query_text)

            # Vector search in Pinecone
            pinecone_filter = self._build_pinecone_filter(domain_ids, filters)
            vector_results = []

            if self.pinecone_index:
                search_response = self.pinecone_index.query(
                    namespace=self.knowledge_namespace,  # Pass namespace as parameter
                    vector=query_embedding,
                    top_k=max_results * 2,  # Get more for re-ranking
                    include_metadata=True,
                    filter=pinecone_filter if pinecone_filter else None,
                )

                for match in search_response.matches or []:
                    if match.score >= similarity_threshold * 0.8:  # Lower threshold for initial search
                        vector_results.append({
                            "chunk_id": match.metadata.get("chunk_id"),
                            "document_id": match.metadata.get("document_id"),
                            "similarity": match.score,
                            "metadata": match.metadata,
                        })

            # Enrich with Supabase metadata and apply additional filters
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
                },
            }

        except Exception as e:
            logger.error("❌ Hybrid search failed", error=str(e))
            raise

    async def _agent_optimized_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
        agent_id: Optional[str],
    ) -> Dict[str, Any]:
        """
        Agent-optimized search using configured Knowledge Domain namespaces.

        If agent has knowledge_namespaces configured in metadata, search only those.
        Otherwise, fall back to hybrid search with domain preferences.
        """
        try:
            # Get agent's configured KD namespaces
            agent_namespaces = await self._get_agent_knowledge_namespaces(agent_id) if agent_id else None

            # If agent has KD namespaces configured, use multi-namespace search
            if agent_namespaces and len(agent_namespaces) > 0:
                logger.info(
                    "agent_optimized_using_kd_namespaces",
                    agent_id=agent_id,
                    namespaces=agent_namespaces
                )

                # Generate query embedding
                query_embedding = await self._generate_embedding(query_text)

                # Build Pinecone filter
                pinecone_filter = self._build_pinecone_filter(domain_ids, filters)

                # Search across agent's configured namespaces
                sources = await self._multi_namespace_vector_search(
                    query_embedding=query_embedding,
                    namespaces=agent_namespaces,
                    top_k=max_results * 2,  # Get more for re-ranking
                    filter_dict=pinecone_filter,
                    min_score=similarity_threshold * 0.8  # Lower threshold for initial search
                )

                # Apply agent-specific boosting
                source_dicts = [self._document_to_dict(doc) for doc in sources]
                boosted_sources = await self._boost_for_agent(
                    source_dicts, agent_id, query_text
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
                        "kd_namespaces_used": agent_namespaces,
                        "namespaces_count": len(agent_namespaces),
                    },
                }

            # Fallback: No KD namespaces configured, use domain-based search
            logger.info(
                "agent_optimized_fallback_to_hybrid",
                agent_id=agent_id,
                reason="no_kd_namespaces_configured"
            )

            # Get agent domain preferences from Supabase
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
                    "kd_namespaces_used": None,
                    "fallback": "hybrid_search",
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
        """Keyword-based search using Supabase full-text search"""
        try:
            # Use Supabase for full-text search
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

    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        try:
            # Use embedding service factory if available (supports both OpenAI and HuggingFace)
            if self.embedding_service:
                embedding = await self.embedding_service.generate_embedding(text)
                return embedding
            elif self.embeddings:
                # Fallback to OpenAI embeddings
                embedding = await asyncio.to_thread(self.embeddings.embed_query, text)
                return embedding
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
        """Build Pinecone metadata filter"""
        if not domain_ids and not filters:
            return None

        filter_dict: Dict[str, Any] = {}

        # Domain filter
        if domain_ids:
            if len(domain_ids) == 1:
                filter_dict["domain_id"] = {"$eq": domain_ids[0]}
            else:
                filter_dict["domain_id"] = {"$in": domain_ids}

        # Additional filters
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
        """Fallback Supabase vector search"""
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
        """Enrich Pinecone results with Supabase metadata"""
        try:
            if not vector_results:
                return []

            # Get document IDs from vector results
            document_ids = list(set(r.get("document_id") for r in vector_results if r.get("document_id")))

            # Fetch metadata from Supabase
            enriched = await self.supabase.get_documents_metadata(
                document_ids=document_ids,
                domain_ids=domain_ids,
                additional_filters=filters,
            )

            # Merge vector results with metadata
            enriched_results = []
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
                    # Use vector result metadata if Supabase lookup fails
                    enriched_results.append({
                        **vr,
                        "content": vr.get("metadata", {}).get("content", ""),
                    })

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
        """Re-rank results using relevance scoring"""
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

            # Sort by boosted score
            scored_results.sort(key=lambda x: x.get("boosted_score", 0), reverse=True)

            return scored_results[:max_results]

        except Exception as e:
            logger.error("❌ Re-ranking failed", error=str(e))
            return results[:max_results]

    async def _get_agent_domains(self, agent_id: str) -> Optional[List[str]]:
        """Get preferred domains for an agent"""
        try:
            agent = await self.supabase.get_agent_by_id(agent_id)
            if agent:
                # Extract domain preferences from agent metadata
                domains = agent.get("domains") or agent.get("preferred_domains")
                return domains if isinstance(domains, list) else [domains] if domains else None
            return None
        except Exception as e:
            logger.warning("⚠️ Failed to get agent domains", error=str(e))
            return None

    async def _get_agent_knowledge_namespaces(self, agent_id: str) -> Optional[List[str]]:
        """
        Get configured Knowledge Domain namespaces for an agent.

        These namespaces are stored in agent.metadata.knowledge_namespaces
        and correspond to Pinecone KD-* namespaces.

        Args:
            agent_id: Agent UUID

        Returns:
            List of KD-* namespace strings or None if not configured
        """
        try:
            agent = await self.supabase.get_agent_by_id(agent_id)
            if agent:
                metadata = agent.get("metadata") or {}
                namespaces = metadata.get("knowledge_namespaces", [])
                if namespaces and isinstance(namespaces, list) and len(namespaces) > 0:
                    logger.info(
                        "agent_knowledge_namespaces_found",
                        agent_id=agent_id,
                        namespaces=namespaces
                    )
                    return namespaces
            return None
        except Exception as e:
            logger.warning("⚠️ Failed to get agent knowledge namespaces", error=str(e))
            return None

    async def _multi_namespace_vector_search(
        self,
        query_embedding: List[float],
        namespaces: List[str],
        top_k: int = 10,
        filter_dict: Optional[Dict] = None,
        min_score: float = 0.0
    ) -> List[Document]:
        """
        Search across multiple Pinecone namespaces and merge results.

        Pinecone doesn't support querying multiple namespaces in a single call,
        so we query each namespace and merge results by score.

        Args:
            query_embedding: Query vector
            namespaces: List of KD-* namespaces to search
            top_k: Results per namespace (will be merged and re-ranked)
            filter_dict: Optional metadata filters
            min_score: Minimum similarity score threshold

        Returns:
            Merged and sorted list of Documents from all namespaces
        """
        if not self.pinecone_index or not namespaces:
            return []

        all_results = []

        # Query each namespace
        for namespace in namespaces:
            try:
                search_response = self.pinecone_index.query(
                    namespace=namespace,
                    vector=query_embedding,
                    top_k=top_k,
                    include_metadata=True,
                    filter=filter_dict if filter_dict else None,
                )

                for match in search_response.matches or []:
                    if match.score >= min_score:
                        all_results.append({
                            "score": match.score,
                            "namespace": namespace,
                            "doc": Document(
                                page_content=match.metadata.get("content", match.metadata.get("text", "")) if isinstance(match.metadata, dict) else "",
                                metadata={
                                    "id": match.metadata.get("chunk_id") if isinstance(match.metadata, dict) else None,
                                    "document_id": match.metadata.get("document_id", match.metadata.get("doc_id")) if isinstance(match.metadata, dict) else None,
                                    "title": match.metadata.get("source_title", match.metadata.get("title")) if isinstance(match.metadata, dict) else None,
                                    "domain": match.metadata.get("domain") if isinstance(match.metadata, dict) else None,
                                    "similarity": match.score,
                                    "namespace": namespace,
                                    **(match.metadata if isinstance(match.metadata, dict) else {}),
                                },
                            )
                        })

            except Exception as e:
                logger.warning(
                    "namespace_search_failed",
                    namespace=namespace,
                    error=str(e)
                )
                continue

        # Sort by score and deduplicate by document_id
        all_results.sort(key=lambda x: x["score"], reverse=True)

        seen_ids = set()
        unique_results = []
        for result in all_results:
            doc_id = result["doc"].metadata.get("document_id")
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                unique_results.append(result["doc"])

        logger.info(
            "multi_namespace_search_complete",
            namespaces_searched=len(namespaces),
            total_results=len(all_results),
            unique_results=len(unique_results)
        )

        return unique_results[:top_k]

    async def _boost_for_agent(
        self,
        sources: List[Dict[str, Any]],
        agent_id: Optional[str],
        query_text: str,
    ) -> List[Dict[str, Any]]:
        """Apply agent-specific boosting to sources"""
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

                # Boost if source is from agent's preferred domains
                agent_boost = 0.1 if domain_id in agent_domains else 0.0

                current_score = metadata.get("similarity", 0.0)
                metadata["boosted_score"] = min(current_score + agent_boost, 1.0)
                boosted.append(source)

            return boosted

        except Exception as e:
            logger.warning("⚠️ Agent boosting failed", error=str(e))
            return sources

    def _generate_context(self, sources: List[Document]) -> str:
        """Generate context summary from sources"""
        if not sources:
            return "No relevant documents found."

        contexts = []
        for i, source in enumerate(sources[:5], 1):  # Top 5 sources
            content = source.page_content[:500] if source.page_content else ""  # First 500 chars
            title = source.metadata.get("title", source.metadata.get("source_title", "Document"))
            contexts.append(f"[{i}] {title}: {content}...")

        return "\n\n".join(contexts)

    def _document_to_dict(self, doc: Document) -> Dict[str, Any]:
        """Convert Document to dictionary"""
        return {
            "page_content": doc.page_content,
            "metadata": doc.metadata,
        }

    async def _graph_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        agent_id: Optional[str],
    ) -> Dict[str, Any]:
        """Graph search using Neo4j knowledge graph"""
        try:
            if not self.neo4j_client:
                logger.warning("⚠️ Neo4j client not available, falling back to hybrid search")
                return await self._hybrid_search(
                    query_text, domain_ids, filters, max_results, 0.7
                )

            # Extract entities and relationships from query using Neo4j
            # Query Neo4j for related entities, documents, and knowledge paths
            async with self.neo4j_client.driver.session(database=self.settings.neo4j_database) as session:
                # Build Cypher query to find relevant knowledge graph paths
                cypher_query = """
                MATCH path = (start:Entity)-[*1..3]-(end:Entity)
                WHERE toLower(start.name) CONTAINS toLower($query) 
                   OR toLower(end.name) CONTAINS toLower($query)
                   OR ANY(rel IN relationships(path) WHERE toLower(type(rel)) CONTAINS toLower($query))
                WITH path, start, end, 
                     reduce(score = 0, rel IN relationships(path) | score + rel.weight) as path_score
                ORDER BY path_score DESC
                LIMIT $max_results
                RETURN 
                    start.name as start_entity,
                    end.name as end_entity,
                    [rel IN relationships(path) | type(rel)] as relationship_types,
                    path_score,
                    [node IN nodes(path) WHERE node:Document | node.id] as document_ids
                """
                
                result = await session.run(
                    cypher_query,
                    query=query_text,
                    max_results=max_results
                )
                
                graph_results = []
                document_ids = set()
                
                async for record in result:
                    start_entity = record.get("start_entity", "")
                    end_entity = record.get("end_entity", "")
                    rel_types = record.get("relationship_types", [])
                    path_score = record.get("path_score", 0.0)
                    doc_ids = record.get("document_ids", [])
                    
                    document_ids.update(doc_ids)
                    
                    graph_results.append({
                        "start_entity": start_entity,
                        "end_entity": end_entity,
                        "relationship_types": rel_types,
                        "path_score": path_score,
                        "document_ids": doc_ids,
                    })

            # Fetch documents from Supabase using document IDs from graph
            sources = []
            if document_ids:
                doc_metadata = await self.supabase.get_documents_metadata(
                    document_ids=list(document_ids),
                    domain_ids=domain_ids,
                    additional_filters=filters,
                )
                
                for doc_id, doc_data in doc_metadata.items():
                    # Find graph path score for this document
                    path_score = 0.0
                    for gr in graph_results:
                        if doc_id in gr.get("document_ids", []):
                            path_score = max(path_score, gr.get("path_score", 0.0))
                    
                    sources.append(Document(
                        page_content=doc_data.get("content", ""),
                        metadata={
                            **doc_data.get("metadata", {}),
                            "graph_score": path_score,
                            "source": "neo4j_graph",
                        },
                    ))

            # Sort by graph score
            sources.sort(
                key=lambda x: x.metadata.get("graph_score", 0.0),
                reverse=True
            )
            sources = sources[:max_results]

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "graph",
                    "totalSources": len(sources),
                    "graph_paths": len(graph_results),
                },
            }

        except Exception as e:
            logger.error("❌ Graph search failed", error=str(e))
            # Fallback to hybrid search
            return await self._hybrid_search(
                query_text, domain_ids, filters, max_results, 0.7
            )

    async def _true_hybrid_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
        agent_id: Optional[str],
    ) -> Dict[str, Any]:
        """
        True hybrid search combining Neo4j (KG), Pinecone (vector), and Supabase (relational).
        
        This is the most comprehensive search strategy:
        1. Neo4j: Find knowledge graph paths and entity relationships
        2. Pinecone: Vector similarity search for semantic matches
        3. Supabase: Relational metadata filtering and enrichment
        4. Merge and re-rank all results
        """
        try:
            all_results = []
            result_sources = {}  # Track sources by document_id to merge
            
            # 1. Neo4j Graph Search (if available)
            if self.neo4j_client:
                try:
                    graph_result = await self._graph_search(
                        query_text, domain_ids, filters, max_results * 2, agent_id
                    )
                    for source in graph_result.get("sources", []):
                        doc_id = source.get("metadata", {}).get("document_id") or source.get("metadata", {}).get("id")
                        if doc_id:
                            result_sources[doc_id] = {
                                **source,
                                "graph_score": source.get("metadata", {}).get("graph_score", 0.0),
                                "source_types": ["graph"],
                            }
                except Exception as e:
                    logger.warning("⚠️ Graph search failed in true hybrid", error=str(e))

            # 2. Pinecone Vector Search (if available)
            if self.pinecone_index:
                try:
                    vector_result = await self._semantic_search(
                        query_text, domain_ids, filters, max_results * 2, similarity_threshold
                    )
                    for source in vector_result.get("sources", []):
                        doc_id = source.get("metadata", {}).get("document_id") or source.get("metadata", {}).get("id")
                        similarity = source.get("metadata", {}).get("similarity", 0.0)
                        if doc_id:
                            if doc_id in result_sources:
                                # Merge: add vector score and source type
                                result_sources[doc_id]["vector_score"] = similarity
                                result_sources[doc_id]["source_types"].append("vector")
                            else:
                                result_sources[doc_id] = {
                                    **source,
                                    "vector_score": similarity,
                                    "source_types": ["vector"],
                                }
                except Exception as e:
                    logger.warning("⚠️ Vector search failed in true hybrid", error=str(e))

            # 3. Supabase Relational Search (keyword/full-text)
            try:
                keyword_result = await self._keyword_search(
                    query_text, domain_ids, filters, max_results
                )
                for source in keyword_result.get("sources", []):
                    doc_id = source.get("metadata", {}).get("document_id") or source.get("metadata", {}).get("id")
                    if doc_id:
                        if doc_id in result_sources:
                            # Merge: add keyword source type
                            result_sources[doc_id]["source_types"].append("keyword")
                            result_sources[doc_id]["keyword_score"] = 0.8  # Default keyword relevance
                        else:
                            result_sources[doc_id] = {
                                **source,
                                "keyword_score": 0.8,
                                "source_types": ["keyword"],
                            }
            except Exception as e:
                logger.warning("⚠️ Keyword search failed in true hybrid", error=str(e))

            # 4. Calculate combined scores and re-rank
            scored_results = []
            for doc_id, source in result_sources.items():
                # Combine scores from all sources
                graph_score = source.get("graph_score", 0.0) * 0.3  # 30% weight
                vector_score = source.get("vector_score", 0.0) * 0.5  # 50% weight
                keyword_score = source.get("keyword_score", 0.0) * 0.2  # 20% weight
                
                # Boost for multiple source types (diversity bonus)
                source_count = len(set(source.get("source_types", [])))
                diversity_boost = min(source_count * 0.05, 0.15)  # Up to 15% boost
                
                combined_score = min(
                    graph_score + vector_score + keyword_score + diversity_boost,
                    1.0
                )
                
                # Update metadata with combined score
                source["metadata"] = {
                    **source.get("metadata", {}),
                    "combined_score": combined_score,
                    "graph_score": source.get("graph_score", 0.0),
                    "vector_score": source.get("vector_score", 0.0),
                    "keyword_score": source.get("keyword_score", 0.0),
                    "source_types": source.get("source_types", []),
                    "source_count": source_count,
                }
                
                scored_results.append(source)

            # Sort by combined score
            scored_results.sort(
                key=lambda x: x.get("metadata", {}).get("combined_score", 0.0),
                reverse=True
            )

            # Take top results
            final_sources = scored_results[:max_results]
            
            # Convert to Document format
            sources = [
                Document(
                    page_content=s.get("page_content", ""),
                    metadata=s.get("metadata", {}),
                )
                for s in final_sources
            ]

            context = self._generate_context(sources)

            return {
                "sources": [self._document_to_dict(doc) for doc in sources],
                "context": context,
                "metadata": {
                    "strategy": "true_hybrid",
                    "totalSources": len(sources),
                    "graph_enabled": self.neo4j_client is not None,
                    "vector_enabled": self.pinecone_index is not None,
                    "relational_enabled": True,
                },
            }

        except Exception as e:
            logger.error("❌ True hybrid search failed", error=str(e))
            # Fallback to regular hybrid search
            return await self._hybrid_search(
                query_text, domain_ids, filters, max_results, similarity_threshold
            )

    async def cleanup(self):
        """Cleanup resources"""
        if self.neo4j_client:
            try:
                await self.neo4j_client.close()
            except Exception as e:
                logger.warning("⚠️ Error closing Neo4j client", error=str(e))
        logger.info("🧹 Unified RAG service cleanup completed")
    
    async def search(self, query: str, tenant_id: str, agent_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """
        Backward compatibility alias for query() method.
        Workflows call search() but the service uses query().
        
        Args:
            query: User query text
            tenant_id: Tenant ID
            agent_id: Optional agent ID
            **kwargs: Additional arguments passed to query()
            
        Returns:
            Query results
        """
        return await self.query(
            query_text=query,
            tenant_id=tenant_id,
            agent_id=agent_id,
            **kwargs
        )

