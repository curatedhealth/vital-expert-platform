"""
Document Chunking Service
Implements multiple chunking strategies for RAG optimization
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import structlog

from .strategies import ChunkStrategy, ChunkConfig

logger = structlog.get_logger()


@dataclass
class Chunk:
    """Represents a document chunk with metadata"""
    text: str
    index: int
    start_char: int
    end_char: int
    strategy: ChunkStrategy
    metadata: Dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class ChunkingService:
    """
    Service for chunking documents with multiple strategies

    Strategies:
    - STANDARD: Fixed-size chunks with overlap (1000/200)
    - GRANULAR: Smaller chunks for precise retrieval (500/100)
    - CONTEXTUAL: Larger chunks preserving context (2000/400)
    - SEMANTIC: Split on paragraph/section boundaries
    - HYBRID: Multiple chunk sizes per document
    """

    def __init__(self, config: Optional[ChunkConfig] = None):
        self.config = config or ChunkConfig.standard()

    def chunk_document(
        self,
        text: str,
        config: Optional[ChunkConfig] = None,
        doc_id: Optional[str] = None
    ) -> List[Chunk]:
        """
        Chunk a document according to the configured strategy

        Args:
            text: Document text to chunk
            config: Optional override config (uses instance config if not provided)
            doc_id: Optional document ID for logging

        Returns:
            List of Chunk objects
        """
        cfg = config or self.config

        if not text or len(text.strip()) < cfg.min_chunk_size:
            logger.debug("document_too_short_for_chunking", doc_id=doc_id)
            return []

        strategy = cfg.strategy

        if strategy == ChunkStrategy.STANDARD:
            return self._chunk_fixed_size(text, cfg)
        elif strategy == ChunkStrategy.GRANULAR:
            return self._chunk_fixed_size(text, cfg)
        elif strategy == ChunkStrategy.CONTEXTUAL:
            return self._chunk_fixed_size(text, cfg)
        elif strategy == ChunkStrategy.SEMANTIC:
            return self._chunk_semantic(text, cfg)
        elif strategy == ChunkStrategy.HYBRID:
            return self._chunk_hybrid(text, cfg)
        else:
            logger.warning("unknown_strategy_using_standard", strategy=strategy)
            return self._chunk_fixed_size(text, cfg)

    def _chunk_fixed_size(self, text: str, config: ChunkConfig) -> List[Chunk]:
        """
        Fixed-size chunking with overlap

        Args:
            text: Text to chunk
            config: Chunk configuration

        Returns:
            List of chunks
        """
        chunks = []
        text = self._normalize_whitespace(text)

        chunk_size = config.chunk_size
        overlap = config.chunk_overlap
        min_size = config.min_chunk_size

        start = 0
        index = 0

        while start < len(text):
            end = start + chunk_size

            # If respecting boundaries, try to end at a sentence
            if config.respect_boundaries and end < len(text):
                end = self._find_sentence_boundary(text, start, end)

            chunk_text = text[start:end].strip()

            if len(chunk_text) >= min_size:
                chunks.append(Chunk(
                    text=chunk_text,
                    index=index,
                    start_char=start,
                    end_char=end,
                    strategy=config.strategy,
                    metadata={
                        "chunk_size": len(chunk_text),
                        "overlap_with_previous": overlap if index > 0 else 0
                    }
                ))
                index += 1

            # Move start position
            start = end - overlap
            if start <= chunks[-1].start_char if chunks else 0:
                start = end  # Prevent infinite loop

        logger.debug(
            "fixed_size_chunking_complete",
            chunk_count=len(chunks),
            strategy=config.strategy.value
        )

        return chunks

    def _chunk_semantic(self, text: str, config: ChunkConfig) -> List[Chunk]:
        """
        Semantic chunking - split on paragraph and section boundaries

        Args:
            text: Text to chunk
            config: Chunk configuration

        Returns:
            List of chunks
        """
        chunks = []

        # Split on double newlines (paragraphs) and headers
        # Pattern matches: section headers, double newlines, horizontal rules
        split_pattern = r'(?:\n\s*\n|\n(?=#+\s)|(?:^|\n)(?:---+|===+)(?:\n|$))'
        segments = re.split(split_pattern, text)

        # Clean segments
        segments = [s.strip() for s in segments if s.strip()]

        # Merge small segments with next
        merged_segments = []
        current_segment = ""

        for segment in segments:
            if len(current_segment) + len(segment) < config.chunk_size:
                current_segment = (current_segment + "\n\n" + segment).strip()
            else:
                if current_segment:
                    merged_segments.append(current_segment)
                current_segment = segment

        if current_segment:
            merged_segments.append(current_segment)

        # Split large segments
        final_segments = []
        for segment in merged_segments:
            if len(segment) > config.chunk_size * 1.5:
                # Use fixed-size chunking for oversized segments
                sub_chunks = self._chunk_fixed_size(segment, config)
                final_segments.extend([c.text for c in sub_chunks])
            else:
                final_segments.append(segment)

        # Create chunk objects
        char_position = 0
        for i, segment_text in enumerate(final_segments):
            if len(segment_text) >= config.min_chunk_size:
                chunks.append(Chunk(
                    text=segment_text,
                    index=i,
                    start_char=char_position,
                    end_char=char_position + len(segment_text),
                    strategy=ChunkStrategy.SEMANTIC,
                    metadata={
                        "chunk_size": len(segment_text),
                        "semantic_split": True
                    }
                ))
            char_position += len(segment_text) + 2  # +2 for paragraph break

        logger.debug(
            "semantic_chunking_complete",
            chunk_count=len(chunks)
        )

        return chunks

    def _chunk_hybrid(self, text: str, config: ChunkConfig) -> List[Chunk]:
        """
        Hybrid chunking - create chunks at multiple granularities

        This creates:
        1. Large contextual chunks (2000 chars)
        2. Standard chunks (1000 chars)
        3. Granular chunks (500 chars)

        Useful for retrieving at different precision levels.

        Args:
            text: Text to chunk
            config: Chunk configuration

        Returns:
            List of chunks with size indicators
        """
        all_chunks = []

        # Large contextual chunks
        contextual_config = ChunkConfig.contextual()
        contextual_chunks = self._chunk_fixed_size(text, contextual_config)
        for chunk in contextual_chunks:
            chunk.metadata["granularity"] = "contextual"
            chunk.metadata["priority"] = 1  # For A/B testing
        all_chunks.extend(contextual_chunks)

        # Standard chunks
        standard_config = ChunkConfig.standard()
        standard_chunks = self._chunk_fixed_size(text, standard_config)
        for chunk in standard_chunks:
            chunk.metadata["granularity"] = "standard"
            chunk.metadata["priority"] = 2
        all_chunks.extend(standard_chunks)

        # Granular chunks
        granular_config = ChunkConfig.granular()
        granular_chunks = self._chunk_fixed_size(text, granular_config)
        for chunk in granular_chunks:
            chunk.metadata["granularity"] = "granular"
            chunk.metadata["priority"] = 3
        all_chunks.extend(granular_chunks)

        logger.debug(
            "hybrid_chunking_complete",
            total_chunks=len(all_chunks),
            contextual=len(contextual_chunks),
            standard=len(standard_chunks),
            granular=len(granular_chunks)
        )

        return all_chunks

    def _find_sentence_boundary(self, text: str, start: int, end: int) -> int:
        """
        Find the nearest sentence boundary before the end position

        Looks for periods, question marks, exclamation points followed by space/newline
        """
        # Look backwards from end for a sentence boundary
        search_start = max(start + 100, end - 200)  # Don't look too far back
        search_text = text[search_start:end]

        # Find last sentence boundary
        sentence_end_pattern = r'[.!?]\s+'
        matches = list(re.finditer(sentence_end_pattern, search_text))

        if matches:
            last_match = matches[-1]
            return search_start + last_match.end()

        return end

    def _normalize_whitespace(self, text: str) -> str:
        """Normalize whitespace while preserving paragraph breaks"""
        # Replace multiple spaces with single space
        text = re.sub(r'[ \t]+', ' ', text)
        # Normalize line breaks (keep paragraphs)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def estimate_chunk_count(
        self,
        text_length: int,
        config: Optional[ChunkConfig] = None
    ) -> int:
        """Estimate number of chunks for a given text length"""
        cfg = config or self.config
        if text_length < cfg.min_chunk_size:
            return 0
        effective_size = cfg.chunk_size - cfg.chunk_overlap
        return max(1, (text_length - cfg.chunk_overlap) // effective_size)

    def get_chunk_stats(self, chunks: List[Chunk]) -> Dict:
        """Get statistics about chunks"""
        if not chunks:
            return {"count": 0}

        sizes = [len(c.text) for c in chunks]
        return {
            "count": len(chunks),
            "total_chars": sum(sizes),
            "avg_size": sum(sizes) // len(sizes),
            "min_size": min(sizes),
            "max_size": max(sizes),
            "strategy": chunks[0].strategy.value
        }


# Factory function
def get_chunking_service(config: Optional[ChunkConfig] = None) -> ChunkingService:
    """Get a chunking service instance"""
    return ChunkingService(config)


# Convenience functions
def chunk_for_standard(text: str) -> List[Chunk]:
    """Chunk with standard configuration (1000/200)"""
    service = ChunkingService(ChunkConfig.standard())
    return service.chunk_document(text)


def chunk_for_precision(text: str) -> List[Chunk]:
    """Chunk with granular configuration (500/100) for precision"""
    service = ChunkingService(ChunkConfig.granular())
    return service.chunk_document(text)


def chunk_for_context(text: str) -> List[Chunk]:
    """Chunk with contextual configuration (2000/400) for more context"""
    service = ChunkingService(ChunkConfig.contextual())
    return service.chunk_document(text)
