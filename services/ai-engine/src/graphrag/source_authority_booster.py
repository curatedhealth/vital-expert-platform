"""
Source Authority Booster
Applies RAG priority weights from sources and document types to boost search results
"""

from typing import List, Dict, Optional
from collections import defaultdict
import structlog

from .models import ContextChunk

logger = structlog.get_logger()


class SourceAuthorityBooster:
    """
    Boosts search results based on source and document type authority weights.

    Formula:
        boosted_score = base_score * combined_weight
        combined_weight = (source_weight * type_weight)

    Where weights are from:
    - sources.rag_priority_weight (0.00-1.00)
    - document_types.rag_priority_weight (0.00-1.00)

    A document from FDA (weight=1.00) with type peer_review (weight=1.00)
    gets full score. A blog post (weight=0.55) from unknown source (default=0.75)
    gets score * 0.41.
    """

    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self._source_weights: Dict[str, float] = {}
        self._type_weights: Dict[str, float] = {}
        self._doc_cache: Dict[str, Dict] = {}
        self._initialized = False

    async def initialize(self, supabase_client):
        """Initialize with Supabase client and load weight caches"""
        self.supabase = supabase_client
        await self._load_weights()
        self._initialized = True

    async def _load_weights(self):
        """Load source and document type weights into memory cache"""
        try:
            # Load source weights
            sources_result = self.supabase.table('sources')\
                .select('id, code, rag_priority_weight')\
                .execute()

            for src in sources_result.data:
                self._source_weights[src['id']] = src.get('rag_priority_weight', 0.75)

            # Load document type weights
            types_result = self.supabase.table('document_types')\
                .select('id, name, rag_priority_weight')\
                .execute()

            for dt in types_result.data:
                self._type_weights[dt['id']] = dt.get('rag_priority_weight', 0.70)

            logger.info(
                "authority_weights_loaded",
                source_count=len(self._source_weights),
                type_count=len(self._type_weights)
            )

        except Exception as e:
            logger.warning(
                "authority_weights_load_failed",
                error=str(e)
            )

    async def _get_doc_metadata(self, doc_ids: List[str]) -> Dict[str, Dict]:
        """Batch fetch document metadata for source/type lookup"""
        if not doc_ids:
            return {}

        # Check cache first
        uncached_ids = [did for did in doc_ids if did not in self._doc_cache]

        if uncached_ids:
            try:
                result = self.supabase.table('knowledge_documents')\
                    .select('id, source_id, document_type_id')\
                    .in_('id', uncached_ids)\
                    .execute()

                for doc in result.data:
                    self._doc_cache[doc['id']] = {
                        'source_id': doc.get('source_id'),
                        'document_type_id': doc.get('document_type_id')
                    }

            except Exception as e:
                logger.warning(
                    "doc_metadata_fetch_failed",
                    error=str(e),
                    doc_count=len(uncached_ids)
                )

        return {did: self._doc_cache.get(did, {}) for did in doc_ids}

    def _calculate_boost(
        self,
        source_id: Optional[str],
        type_id: Optional[str],
        default_source_weight: float = 0.75,
        default_type_weight: float = 0.70
    ) -> float:
        """
        Calculate combined authority boost multiplier.

        Args:
            source_id: Source UUID or None
            type_id: Document type UUID or None
            default_source_weight: Default if no source
            default_type_weight: Default if no type

        Returns:
            Boost multiplier (0.0 - 1.0)
        """
        source_weight = self._source_weights.get(source_id, default_source_weight) if source_id else default_source_weight
        type_weight = self._type_weights.get(type_id, default_type_weight) if type_id else default_type_weight

        # Combined weight is product of both weights
        # This means both source AND type authority contribute
        return source_weight * type_weight

    async def boost_results(
        self,
        chunks: List[ContextChunk],
        boost_factor: float = 1.0
    ) -> List[ContextChunk]:
        """
        Apply source authority boosting to search results.

        Args:
            chunks: List of context chunks from fusion
            boost_factor: Optional scaling factor (1.0 = full boost effect)

        Returns:
            Chunks with boosted scores, re-sorted by boosted score
        """
        if not chunks:
            return chunks

        if not self._initialized and self.supabase:
            await self._load_weights()
            self._initialized = True

        # Extract doc IDs from chunks
        doc_ids = []
        for chunk in chunks:
            doc_id = chunk.metadata.get('doc_id') or chunk.source.document_id if chunk.source else None
            if doc_id:
                doc_ids.append(doc_id)

        # Batch fetch document metadata
        doc_metadata = await self._get_doc_metadata(list(set(doc_ids)))

        # Apply boosts
        boosted_chunks = []
        for chunk in chunks:
            doc_id = chunk.metadata.get('doc_id') or (chunk.source.document_id if chunk.source else None)
            meta = doc_metadata.get(doc_id, {})

            source_id = meta.get('source_id')
            type_id = meta.get('document_type_id')

            # Calculate boost
            boost = self._calculate_boost(source_id, type_id)

            # Apply boost with factor
            # Formula: boosted = original + (original * (boost - 0.5) * factor)
            # This means boost=1.0 increases score, boost=0.5 keeps same, boost<0.5 decreases
            boost_delta = (boost - 0.5) * 2 * boost_factor  # Normalize to -1 to +1 range
            original_score = chunk.score
            boosted_score = original_score * (1 + boost_delta * 0.5)  # Max 50% boost effect

            # Store both scores
            chunk.metadata['original_fusion_score'] = original_score
            chunk.metadata['authority_boost'] = boost
            chunk.metadata['source_id'] = source_id
            chunk.metadata['document_type_id'] = type_id
            chunk.score = boosted_score

            boosted_chunks.append(chunk)

        # Re-sort by boosted score
        boosted_chunks.sort(key=lambda x: x.score, reverse=True)

        logger.info(
            "authority_boost_applied",
            chunk_count=len(boosted_chunks),
            avg_boost=sum(c.metadata.get('authority_boost', 0.5) for c in boosted_chunks) / len(boosted_chunks) if boosted_chunks else 0
        )

        return boosted_chunks


# Singleton instance
_booster: Optional[SourceAuthorityBooster] = None


async def get_source_authority_booster(supabase_client=None) -> SourceAuthorityBooster:
    """Get or create source authority booster singleton"""
    global _booster

    if _booster is None:
        _booster = SourceAuthorityBooster()

    if supabase_client and not _booster._initialized:
        await _booster.initialize(supabase_client)

    return _booster
