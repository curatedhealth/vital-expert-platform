"""
Graph Search Implementation
Knowledge graph traversal using Neo4j
"""

from typing import List, Optional, Dict, Any
import structlog

from ..models import ContextChunk, SearchSource, GraphEvidence, EvidenceNode, EntityExtractionResult, ExtractedEntity
from ..clients.neo4j_client import get_neo4j_client, GraphPath
from ..config import get_graphrag_config
from ..ner_service import get_ner_service

logger = structlog.get_logger()


class GraphSearch:
    """
    Knowledge graph search using Neo4j
    
    Features:
    - Entity extraction from query
    - Seed node finding
    - Graph traversal with constraints
    - Path scoring and ranking
    - Evidence chain construction
    """
    
    def __init__(self):
        self.config = get_graphrag_config()
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        allowed_nodes: Optional[List[str]] = None,
        allowed_edges: Optional[List[str]] = None,
        max_hops: int = 2,
        min_score: float = 0.0
    ) -> tuple[List[ContextChunk], List[GraphEvidence]]:
        """
        Perform graph search
        
        Args:
            query: Search query
            top_k: Number of results
            allowed_nodes: Node labels to include
            allowed_edges: Relationship types to traverse
            max_hops: Maximum traversal depth
            min_score: Minimum path score
            
        Returns:
            Tuple of (context_chunks, graph_evidence)
        """
        try:
            # Step 1: Extract entities from query
            entities = await self._extract_entities(query)
            
            if not entities.entities:
                logger.info(
                    "graph_search_no_entities",
                    query=query[:50]
                )
                return [], []
            
            # Step 2: Find seed nodes in graph
            seed_ids = await self._find_seed_nodes(entities)
            
            if not seed_ids:
                logger.info(
                    "graph_search_no_seed_nodes",
                    entities=[e.text for e in entities.entities]
                )
                return [], []
            
            # Step 3: Traverse graph from seed nodes
            neo4j_client = await get_neo4j_client()
            
            paths = await neo4j_client.traverse_graph(
                seed_ids=seed_ids,
                allowed_nodes=allowed_nodes,
                allowed_edges=allowed_edges,
                max_hops=max_hops,
                limit=top_k
            )
            
            # Step 4: Filter by min score
            paths = [p for p in paths if p.path_score >= min_score]
            
            # Step 5: Convert to context chunks and evidence
            chunks, evidence = self._convert_paths_to_results(paths, query)
            
            logger.info(
                "graph_search_complete",
                query=query[:50],
                entities_count=len(entities.entities),
                seed_nodes_count=len(seed_ids),
                paths_count=len(paths),
                chunks_count=len(chunks)
            )
            
            return chunks, evidence
            
        except Exception as e:
            logger.error(
                "graph_search_failed",
                query=query[:50],
                error=str(e)
            )
            return [], []
    
    async def _extract_entities(self, query: str) -> EntityExtractionResult:
        """
        Extract medical entities from query using NER service
        
        Args:
            query: Search query
            
        Returns:
            Extracted entities
        """
        try:
            # Get NER service (tries spaCy first, falls back to keyword matching)
            ner_service = await get_ner_service(provider="spacy")
            
            # Extract entities
            result = await ner_service.extract_entities(
                text=query,
                entity_types=None  # Extract all entity types
            )
            
            logger.info(
                "ner_extraction_complete",
                query=query[:50],
                entities_count=len(result.entities),
                provider=ner_service.provider
            )
            
            return result
            
        except Exception as e:
            logger.error("ner_extraction_failed", error=str(e))
            # Fallback to keyword matching
            return self._extract_with_fallback(query)
    
    def _extract_with_fallback(self, query: str) -> EntityExtractionResult:
        """Fallback entity extraction using keyword matching"""
        
        medical_keywords = {
            'diabetes': 'Disease',
            'metformin': 'Drug',
            'insulin': 'Drug',
            'hypertension': 'Disease',
            'cancer': 'Disease',
            'chemotherapy': 'Treatment',
            'cardiovascular': 'Disease',
            'aspirin': 'Drug'
        }
        
        entities = []
        query_lower = query.lower()
        
        for keyword, entity_type in medical_keywords.items():
            if keyword in query_lower:
                start_pos = query_lower.find(keyword)
                entities.append(ExtractedEntity(
                    text=keyword,
                    entity_type=entity_type,
                    confidence=0.9,
                    start_pos=start_pos,
                    end_pos=start_pos + len(keyword)
                ))
        
        logger.debug(
            "entities_extracted",
            query=query[:50],
            entities_count=len(entities)
        )
        
        return EntityExtractionResult(
            query=query,
            entities=entities,
            processed_query=query
        )
    
    async def _find_seed_nodes(
        self,
        entities: EntityExtractionResult
    ) -> List[str]:
        """
        Find seed nodes in graph matching extracted entities
        
        Args:
            entities: Extracted entities
            
        Returns:
            List of Neo4j node IDs
        """
        try:
            neo4j_client = await get_neo4j_client()
            
            entity_names = [e.text for e in entities.entities]
            entity_types = list(set([e.entity_type for e in entities.entities]))
            
            # Find nodes matching entity names
            results = await neo4j_client.find_entities(
                entity_names=entity_names,
                entity_types=entity_types if entity_types else None
            )
            
            # Extract node IDs
            seed_ids = []
            for result in results:
                node = result.get('n')
                if node and hasattr(node, 'id'):
                    seed_ids.append(str(node.id))
            
            logger.debug(
                "seed_nodes_found",
                entities_count=len(entity_names),
                seed_nodes_count=len(seed_ids)
            )
            
            return seed_ids
            
        except Exception as e:
            logger.error("seed_node_finding_failed", error=str(e))
            return []
    
    def _convert_paths_to_results(
        self,
        paths: List[GraphPath],
        query: str
    ) -> tuple[List[ContextChunk], List[GraphEvidence]]:
        """
        Convert graph paths to context chunks and evidence
        
        Args:
            paths: Graph paths from Neo4j
            query: Original query
            
        Returns:
            Tuple of (chunks, evidence)
        """
        chunks = []
        evidence_list = []
        
        for path in paths:
            # Build text summary from path
            text = self._build_path_summary(path)
            
            # Create context chunk
            source = SearchSource(
                document_id=path.path_id,
                title=f"Knowledge Graph Path",
                citation=f"Graph traversal: {len(path.nodes)} nodes, {len(path.edges)} edges"
            )
            
            chunk = ContextChunk(
                chunk_id=path.path_id,
                text=text,
                score=path.path_score,
                source=source,
                search_modality="graph",
                metadata={
                    'node_count': len(path.nodes),
                    'edge_count': len(path.edges),
                    'path_id': path.path_id
                }
            )
            
            chunks.append(chunk)
            
            # Build graph evidence
            evidence_nodes = []
            for node in path.nodes:
                evidence_node = EvidenceNode(
                    node_id=str(node.get('id', '')),
                    node_type=node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown',
                    node_name=node.get('name', node.get('id', 'Unnamed')),
                    properties=node,
                    relevance_score=path.path_score
                )
                evidence_nodes.append(evidence_node)
            
            evidence = GraphEvidence(
                path_id=path.path_id,
                nodes=evidence_nodes,
                edges=path.edges,
                path_score=path.path_score
            )
            
            evidence_list.append(evidence)
        
        return chunks, evidence_list
    
    def _build_path_summary(self, path: GraphPath) -> str:
        """
        Build human-readable summary of graph path
        
        Args:
            path: Graph path
            
        Returns:
            Text summary
        """
        if not path.nodes:
            return "Empty graph path"
        
        # Build: Node1 -> Relationship -> Node2 -> ...
        parts = []
        
        for i, node in enumerate(path.nodes):
            node_name = node.get('name', node.get('id', f'Node{i}'))
            node_type = node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown'
            parts.append(f"{node_name} ({node_type})")
            
            # Add relationship if not last node
            if i < len(path.edges):
                edge = path.edges[i]
                edge_type = edge.get('type', 'RELATED_TO')
                parts.append(f"--[{edge_type}]-->")
        
        summary = " ".join(parts)
        
        # Truncate if too long
        if len(summary) > 500:
            summary = summary[:497] + "..."
        
        return summary


# Singleton instance
_graph_search: Optional[GraphSearch] = None


def get_graph_search() -> GraphSearch:
    """Get or create graph search singleton"""
    global _graph_search
    
    if _graph_search is None:
        _graph_search = GraphSearch()
    
    return _graph_search

