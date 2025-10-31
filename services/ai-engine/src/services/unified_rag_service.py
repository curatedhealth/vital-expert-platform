"""
Unified RAG Service for VITAL Path
Comprehensive RAG retrieval with Pinecone, Supabase, and multiple strategies
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import structlog
import os
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from services.embedding_service_factory import EmbeddingServiceFactory
from langchain.schema import Document
import numpy as np

from services.supabase_client import SupabaseClient
from core.config import get_settings

logger = structlog.get_logger()

class UnifiedRAGService:
    """Unified RAG service with Pinecone vector search and Supabase metadata"""

    def __init__(self, supabase_client: SupabaseClient):
        self.settings = get_settings()
        self.supabase = supabase_client
        self.embeddings: Optional[OpenAIEmbeddings] = None  # Can be OpenAI or HuggingFace adapter
        self.embedding_service = None  # Unified embedding service interface
        self.pinecone: Optional[Pinecone] = None
        self.pinecone_index = None
        self.knowledge_namespace = "domains-knowledge"  # Default namespace

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

            # Initialize Pinecone
            pinecone_api_key = os.getenv("PINECONE_API_KEY")
            pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "vital-knowledge")
            
            if pinecone_api_key:
                self.pinecone = Pinecone(api_key=pinecone_api_key)
                try:
                    self.pinecone_index = self.pinecone.Index(pinecone_index_name)
                    logger.info("✅ Pinecone index connected", index_name=pinecone_index_name)
                except Exception as e:
                    logger.warning("⚠️ Pinecone index not found, will use Supabase only", error=str(e))
                    self.pinecone_index = None
            else:
                logger.warning("⚠️ PINECONE_API_KEY not set, using Supabase only")

            logger.info("✅ Unified RAG service initialized")

        except Exception as e:
            logger.error("❌ Failed to initialize Unified RAG service", error=str(e))
            raise

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
    ) -> Dict[str, Any]:
        """Main query method supporting multiple strategies"""
        start_time = datetime.now()

        try:
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
            else:
                result = await self._hybrid_search(
                    query_text, domain_ids, filters, max_results, similarity_threshold
                )

            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            return {
                **result,
                "metadata": {
                    **result.get("metadata", {}),
                    "strategy": strategy,
                    "responseTime": processing_time,
                    "cached": False,
                },
            }

        except Exception as e:
            logger.error("❌ RAG query failed", error=str(e), strategy=strategy)
            raise

    async def _semantic_search(
        self,
        query_text: str,
        domain_ids: Optional[List[str]],
        filters: Optional[Dict[str, Any]],
        max_results: int,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """Semantic search using Pinecone vector similarity"""
        try:
            # Generate query embedding
            query_embedding = await self._generate_embedding(query_text)

            # Build Pinecone filter
            pinecone_filter = self._build_pinecone_filter(domain_ids, filters)

            if self.pinecone_index:
                # Use Pinecone for vector search
                search_response = self.pinecone_index.namespace(
                    self.knowledge_namespace
                ).query(
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
                search_response = self.pinecone_index.namespace(
                    self.knowledge_namespace
                ).query(
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
        """Agent-optimized search with relevance boosting"""
        try:
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

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Unified RAG service cleanup completed")

