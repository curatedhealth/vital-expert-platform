"""
Medical RAG Pipeline for VITAL Path
Enhanced document retrieval with medical knowledge base
"""

import asyncio
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from langchain_openai import OpenAIEmbeddings
# LangChain 1.0+: text_splitter moved to langchain_text_splitters
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import structlog
from datetime import datetime, timezone
import hashlib
import json

from services.supabase_client import SupabaseClient
from core.config import get_settings, MEDICAL_SPECIALTIES
from models.responses import RAGSearchResponse

logger = structlog.get_logger()

class MedicalRAGPipeline:
    """Enhanced RAG pipeline for medical document retrieval"""

    def __init__(self, supabase_client: SupabaseClient):
        self.settings = get_settings()
        self.supabase = supabase_client
        self.embeddings = None
        self.text_splitter = None

    async def initialize(self):
        """Initialize RAG pipeline components"""
        try:
            # Initialize OpenAI embeddings
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=self.settings.openai_api_key,
                model=self.settings.openai_embedding_model,
                chunk_size=1000  # Process embeddings in batches
            )

            # Initialize text splitter for document chunking
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
            )

            logger.info("✅ Medical RAG pipeline initialized")

        except Exception as e:
            logger.error("❌ Failed to initialize RAG pipeline", error=str(e))
            raise

    async def enhanced_search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        include_metadata: bool = True
    ) -> RAGSearchResponse:
        """Enhanced search with medical context awareness"""
        try:
            start_time = datetime.now()

            # Generate query embedding
            query_embedding = await self._generate_embedding(query)

            # Apply medical context filters
            enhanced_filters = await self._enhance_filters(query, filters)

            # Perform vector search
            search_results = await self.supabase.search_similar_documents(
                query_embedding=query_embedding,
                filter_conditions=enhanced_filters,
                limit=max_results * 2,  # Get more results for re-ranking
                similarity_threshold=similarity_threshold * 0.8  # Lower threshold for initial search
            )

            # Re-rank results with medical relevance scoring
            ranked_results = await self._medical_rerank(query, search_results, max_results)

            # Enhance results with medical context
            enhanced_results = await self._enhance_results_with_medical_context(ranked_results)

            # Generate context summary (returns dict, convert to string)
            context_summary_dict = await self._generate_context_summary(enhanced_results)
            # Convert dict to string for RAGSearchResponse
            context_summary_str = context_summary_dict.get("summary", "No summary available")
            if context_summary_dict.get("key_themes"):
                context_summary_str += f" | Key themes: {', '.join(context_summary_dict['key_themes'][:5])}"

            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            logger.info("🔍 Enhanced RAG search completed",
                       query_length=len(query),
                       results_count=len(enhanced_results),
                       processing_time_ms=processing_time)

            return RAGSearchResponse(
                query=query,
                results=enhanced_results,
                context_summary=context_summary_str,  # String, not dict
                total_results=len(search_results),
                processing_time_ms=processing_time,
                filters_applied=enhanced_filters,
                similarity_threshold=similarity_threshold
            )

        except Exception as e:
            logger.error("❌ Enhanced RAG search failed", error=str(e))
            raise

    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        try:
            # Use LangChain embeddings (which handle async internally)
            embedding = await asyncio.create_task(
                asyncio.to_thread(self.embeddings.embed_query, text)
            )
            return embedding

        except Exception as e:
            logger.error("❌ Failed to generate embedding", error=str(e))
            raise

    async def _enhance_filters(
        self,
        query: str,
        base_filters: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Enhance filters with medical context detection"""
        enhanced_filters = base_filters.copy() if base_filters else {}

        try:
            # Detect medical specialty from query
            detected_specialty = await self._detect_medical_specialty(query)
            if detected_specialty and "specialty" not in enhanced_filters:
                enhanced_filters["specialty"] = detected_specialty

            # Detect regulatory phase from query
            detected_phase = await self._detect_regulatory_phase(query)
            if detected_phase and "phase" not in enhanced_filters:
                enhanced_filters["phase"] = detected_phase

            # Detect document type preferences
            detected_doc_type = await self._detect_document_type(query)
            if detected_doc_type and "document_type" not in enhanced_filters:
                enhanced_filters["document_type"] = detected_doc_type

            logger.info("🎯 Filters enhanced with medical context",
                       detected_specialty=detected_specialty,
                       detected_phase=detected_phase,
                       detected_doc_type=detected_doc_type)

            return enhanced_filters

        except Exception as e:
            logger.error("❌ Failed to enhance filters", error=str(e))
            return enhanced_filters

    async def _detect_medical_specialty(self, query: str) -> Optional[str]:
        """Detect medical specialty from query text"""
        query_lower = query.lower()

        # Regulatory Affairs keywords
        if any(keyword in query_lower for keyword in [
            "fda", "ema", "regulatory", "submission", "510k", "de novo",
            "clinical trial application", "marketing authorization", "regulatory pathway"
        ]):
            return "regulatory_affairs"

        # Clinical Research keywords
        if any(keyword in query_lower for keyword in [
            "clinical trial", "protocol", "gcp", "randomized", "placebo",
            "endpoint", "biostatistics", "clinical data"
        ]):
            return "clinical_research"

        # Pharmacovigilance keywords
        if any(keyword in query_lower for keyword in [
            "adverse event", "safety", "pharmacovigilance", "side effect",
            "drug safety", "safety signal", "risk management"
        ]):
            return "pharmacovigilance"

        # Medical Writing keywords
        if any(keyword in query_lower for keyword in [
            "medical writing", "scientific writing", "publication",
            "manuscript", "abstract", "poster"
        ]):
            return "medical_writing"

        return None

    async def _detect_regulatory_phase(self, query: str) -> Optional[str]:
        """Detect regulatory phase from query text"""
        query_lower = query.lower()

        if any(keyword in query_lower for keyword in [
            "discovery", "research", "preclinical", "target identification"
        ]):
            return "vision"

        if any(keyword in query_lower for keyword in [
            "development", "clinical development", "trial design", "protocol"
        ]):
            return "integrate"

        if any(keyword in query_lower for keyword in [
            "clinical trial", "phase i", "phase ii", "phase iii", "testing"
        ]):
            return "test"

        if any(keyword in query_lower for keyword in [
            "approval", "launch", "commercialization", "market access"
        ]):
            return "activate"

        if any(keyword in query_lower for keyword in [
            "post-market", "real world", "outcomes", "pharmacovigilance"
        ]):
            return "learn"

        return None

    async def _detect_document_type(self, query: str) -> Optional[str]:
        """Detect preferred document type from query"""
        query_lower = query.lower()

        if any(keyword in query_lower for keyword in [
            "guideline", "guidance", "regulation", "standard"
        ]):
            return "guidance"

        if any(keyword in query_lower for keyword in [
            "study", "trial", "research", "publication", "paper"
        ]):
            return "study"

        if any(keyword in query_lower for keyword in [
            "protocol", "procedure", "sop", "template"
        ]):
            return "protocol"

        return None

    async def _medical_rerank(
        self,
        query: str,
        results: List[Dict[str, Any]],
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Re-rank results using medical relevance scoring"""
        try:
            query_lower = query.lower()
            scored_results = []

            for result in results:
                base_score = result.get("similarity", 0.0)
                content = result.get("content", "").lower()
                metadata = result.get("metadata", {})

                # Medical relevance boost
                medical_boost = 0.0

                # Boost for medical terminology
                medical_terms = [
                    "clinical", "medical", "therapeutic", "pharmaceutical",
                    "regulatory", "fda", "ema", "patient", "treatment",
                    "diagnosis", "efficacy", "safety", "adverse"
                ]
                medical_term_count = sum(1 for term in medical_terms if term in content)
                medical_boost += medical_term_count * 0.05

                # Boost for specialty match
                if metadata.get("specialty") == await self._detect_medical_specialty(query):
                    medical_boost += 0.1

                # Boost for phase match
                if metadata.get("phase") == await self._detect_regulatory_phase(query):
                    medical_boost += 0.08

                # Boost for recent documents
                if metadata.get("publication_year"):
                    try:
                        year = int(metadata["publication_year"])
                        if year >= 2020:
                            medical_boost += 0.05
                        elif year >= 2015:
                            medical_boost += 0.02
                    except:
                        pass

                # Boost for high-impact sources
                if metadata.get("impact_factor"):
                    try:
                        impact = float(metadata["impact_factor"])
                        if impact >= 5.0:
                            medical_boost += 0.1
                        elif impact >= 3.0:
                            medical_boost += 0.05
                    except:
                        pass

                final_score = min(base_score + medical_boost, 1.0)
                result["final_score"] = final_score
                scored_results.append(result)

            # Sort by final score and return top results
            scored_results.sort(key=lambda x: x.get("final_score", 0), reverse=True)

            logger.info("🎯 Medical re-ranking completed",
                       original_count=len(results),
                       final_count=min(len(scored_results), max_results))

            return scored_results[:max_results]

        except Exception as e:
            logger.error("❌ Medical re-ranking failed", error=str(e))
            # Return original results if re-ranking fails
            return results[:max_results]

    async def _enhance_results_with_medical_context(
        self,
        results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Enhance results with additional medical context"""
        enhanced_results = []

        for result in results:
            enhanced_result = result.copy()
            metadata = result.get("metadata", {})

            # Add medical context
            enhanced_result["medical_context"] = {
                "specialty": metadata.get("specialty", "general"),
                "evidence_level": self._determine_evidence_level(metadata),
                "regulatory_relevance": self._assess_regulatory_relevance(metadata),
                "clinical_significance": self._assess_clinical_significance(result.get("content", "")),
                "citation_format": self._generate_citation(metadata)
            }

            # Add confidence indicators
            enhanced_result["confidence_indicators"] = {
                "source_reliability": self._assess_source_reliability(metadata),
                "content_freshness": self._assess_content_freshness(metadata),
                "peer_review_status": metadata.get("peer_reviewed", False),
                "regulatory_approval": metadata.get("regulatory_approved", False)
            }

            enhanced_results.append(enhanced_result)

        return enhanced_results

    def _determine_evidence_level(self, metadata: Dict[str, Any]) -> str:
        """Determine evidence level based on study type"""
        study_type = metadata.get("study_type", "").lower()

        if "systematic review" in study_type or "meta-analysis" in study_type:
            return "Level 1"
        elif "randomized controlled trial" in study_type or "rct" in study_type:
            return "Level 2"
        elif "cohort study" in study_type:
            return "Level 3"
        elif "case-control" in study_type:
            return "Level 4"
        elif "case series" in study_type or "case report" in study_type:
            return "Level 5"
        else:
            return "Not specified"

    def _assess_regulatory_relevance(self, metadata: Dict[str, Any]) -> str:
        """Assess regulatory relevance"""
        source = metadata.get("source", "").lower()
        document_type = metadata.get("document_type", "").lower()

        if any(term in source for term in ["fda", "ema", "ich", "regulatory"]):
            return "High"
        elif any(term in document_type for term in ["guidance", "guideline", "regulation"]):
            return "High"
        elif metadata.get("regulatory_approved", False):
            return "Medium"
        else:
            return "Low"

    def _assess_clinical_significance(self, content: str) -> str:
        """Assess clinical significance based on content"""
        content_lower = content.lower()

        high_significance_terms = [
            "statistically significant", "clinically meaningful", "therapeutic benefit",
            "improved outcomes", "reduced mortality", "safety concern"
        ]

        if any(term in content_lower for term in high_significance_terms):
            return "High"
        elif any(term in content_lower for term in ["significant", "effective", "beneficial"]):
            return "Medium"
        else:
            return "Low"

    def _generate_citation(self, metadata: Dict[str, Any]) -> str:
        """Generate proper citation format"""
        title = metadata.get("title", "Unknown Title")
        authors = metadata.get("authors", "Unknown Authors")
        journal = metadata.get("journal", "Unknown Journal")
        year = metadata.get("publication_year", "Unknown Year")
        doi = metadata.get("doi", "")

        citation = f"{authors}. {title}. {journal}. {year}"
        if doi:
            citation += f". DOI: {doi}"

        return citation

    def _assess_source_reliability(self, metadata: Dict[str, Any]) -> str:
        """Assess source reliability"""
        impact_factor = metadata.get("impact_factor", 0)
        peer_reviewed = metadata.get("peer_reviewed", False)
        source = metadata.get("source", "").lower()

        if impact_factor >= 5.0 and peer_reviewed:
            return "Very High"
        elif impact_factor >= 3.0 and peer_reviewed:
            return "High"
        elif peer_reviewed:
            return "Medium"
        elif any(term in source for term in ["fda", "ema", "who", "nih"]):
            return "High"
        else:
            return "Low"

    def _assess_content_freshness(self, metadata: Dict[str, Any]) -> str:
        """Assess content freshness"""
        try:
            year = int(metadata.get("publication_year", 0))
            current_year = datetime.now().year

            if year >= current_year - 2:
                return "Very Fresh"
            elif year >= current_year - 5:
                return "Fresh"
            elif year >= current_year - 10:
                return "Moderate"
            else:
                return "Dated"
        except:
            return "Unknown"

    async def _generate_context_summary(
        self,
        results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate context summary from search results"""
        if not results:
            return {"summary": "No relevant documents found", "key_themes": []}

        try:
            # Aggregate key information
            specialties = set()
            evidence_levels = set()
            key_terms = []

            for result in results:
                metadata = result.get("metadata", {})
                medical_context = result.get("medical_context", {})

                if metadata.get("specialty"):
                    specialties.add(metadata["specialty"])

                if medical_context.get("evidence_level"):
                    evidence_levels.add(medical_context["evidence_level"])

                # Extract key terms from content
                content = result.get("content", "")[:500]  # First 500 chars
                key_terms.extend(self._extract_key_terms(content))

            # Count and sort key terms
            term_counts = {}
            for term in key_terms:
                term_counts[term] = term_counts.get(term, 0) + 1

            top_terms = sorted(term_counts.items(), key=lambda x: x[1], reverse=True)[:10]

            return {
                "summary": f"Found {len(results)} relevant documents across {len(specialties)} medical specialties",
                "specialties": list(specialties),
                "evidence_levels": list(evidence_levels),
                "key_themes": [term for term, count in top_terms],
                "total_documents": len(results),
                "high_confidence_results": len([r for r in results if r.get("final_score", 0) > 0.8])
            }

        except Exception as e:
            logger.error("❌ Failed to generate context summary", error=str(e))
            return {"summary": "Context summary generation failed", "error": str(e)}

    def _extract_key_terms(self, content: str) -> List[str]:
        """Extract key medical terms from content"""
        # Simple keyword extraction (could be enhanced with NLP)
        medical_keywords = [
            "clinical", "therapeutic", "pharmaceutical", "regulatory", "fda", "ema",
            "patient", "treatment", "diagnosis", "efficacy", "safety", "adverse",
            "trial", "study", "research", "analysis", "outcome", "intervention"
        ]

        content_lower = content.lower()
        found_terms = []

        for keyword in medical_keywords:
            if keyword in content_lower:
                found_terms.append(keyword)

        return found_terms

    async def store_document(
        self,
        content: str,
        metadata: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> str:
        """Store document in vector database with embeddings"""
        try:
            # Generate document ID if not provided
            if not document_id:
                document_id = hashlib.md5(
                    f"{content[:100]}{metadata.get('title', '')}{metadata.get('source', '')}".encode()
                ).hexdigest()

            # Generate embedding
            embedding = await self._generate_embedding(content)

            # Store in Supabase vector database
            success = await self.supabase.store_document_embedding(
                document_id=document_id,
                content=content,
                embedding=embedding,
                metadata=metadata
            )

            if success:
                logger.info("📚 Document stored successfully", document_id=document_id)
                return document_id
            else:
                raise Exception("Failed to store document in vector database")

        except Exception as e:
            logger.error("❌ Failed to store document", error=str(e))
            raise

    async def batch_store_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> List[str]:
        """Store multiple documents in batch"""
        document_ids = []

        for i, doc in enumerate(documents):
            try:
                doc_id = await self.store_document(
                    content=doc["content"],
                    metadata=doc["metadata"],
                    document_id=doc.get("id")
                )
                document_ids.append(doc_id)

                if (i + 1) % 10 == 0:
                    logger.info(f"📚 Batch progress: {i + 1}/{len(documents)} documents stored")

            except Exception as e:
                logger.error(f"❌ Failed to store document {i}", error=str(e))
                continue

        logger.info("✅ Batch storage completed",
                   total_documents=len(documents),
                   successful_stores=len(document_ids))

        return document_ids

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Medical RAG pipeline cleanup completed")


# Alias for backwards compatibility
MedicalRAG = MedicalRAGPipeline