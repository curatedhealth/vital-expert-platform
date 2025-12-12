"""
VITAL Path AI Services - Ask Expert Graph Retriever

Graph-based retrieval for expertise relationships using Neo4j.
Finds agents through concept relationships.

Naming Convention:
- Class: AskExpertGraphRetriever
- Methods: retrieve, extract_concepts, find_agent_paths
- Logs: ask_expert_graph_retriever_{action}
"""

from typing import List, Dict, Any, Tuple, Optional
import structlog

from modules.ask_expert.fusion.ask_expert_fusion_rrf import AskExpertRankedItem

logger = structlog.get_logger()


class AskExpertGraphRetriever:
    """
    Graph-based retrieval for expertise relationships.
    
    Finds agents through concept relationships in Neo4j.
    Shorter paths = more directly relevant expertise.
    """
    
    def __init__(
        self,
        neo4j_driver=None,
        neo4j_uri: Optional[str] = None,
        neo4j_auth: Optional[Tuple[str, str]] = None,
    ):
        """
        Initialize graph retriever.
        
        Args:
            neo4j_driver: Pre-configured Neo4j driver
            neo4j_uri: Neo4j connection URI (if driver not provided)
            neo4j_auth: (username, password) tuple
        """
        self.driver = neo4j_driver
        
        if not self.driver and neo4j_uri:
            try:
                from neo4j import AsyncGraphDatabase
                self.driver = AsyncGraphDatabase.driver(neo4j_uri, auth=neo4j_auth)
            except ImportError:
                logger.warning("ask_expert_graph_retriever_neo4j_not_available")
        
        logger.info("ask_expert_graph_retriever_initialized")
    
    async def retrieve(
        self,
        query: str,
        tenant_id: str,
        top_k: int = 20,
        max_hops: int = 2,
    ) -> List[AskExpertRankedItem]:
        """
        Retrieve agents through concept graph traversal.
        
        Args:
            query: User's query
            tenant_id: Tenant UUID for isolation
            top_k: Number of results
            max_hops: Maximum path length to traverse
            
        Returns:
            Ranked list with path relevance scores
        """
        logger.info(
            "ask_expert_graph_retriever_retrieve_started",
            tenant_id=tenant_id,
            top_k=top_k,
            max_hops=max_hops,
        )
        
        try:
            # Step 1: Extract key concepts from query
            concepts = await self._extract_concepts(query)
            
            if not concepts:
                logger.info("ask_expert_graph_retriever_no_concepts")
                return []
            
            # Step 2: Find agent paths through concepts
            paths = await self._find_agent_paths(
                concepts, tenant_id, max_hops, top_k * 2
            )
            
            if not paths:
                return []
            
            # Step 3: Score and rank paths
            items = self._score_paths(paths, top_k)
            
            logger.info(
                "ask_expert_graph_retriever_retrieve_completed",
                tenant_id=tenant_id,
                concepts_found=len(concepts),
                paths_found=len(paths),
                result_count=len(items),
            )
            
            return items
            
        except Exception as e:
            logger.error(
                "ask_expert_graph_retriever_retrieve_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return []
    
    async def _extract_concepts(self, query: str) -> List[str]:
        """
        Extract key concepts from query for graph matching.
        
        Uses simple keyword extraction (can be enhanced with NER/LLM).
        """
        # Medical/pharma domain keywords
        domain_keywords = {
            'fda', 'ema', 'pmda', 'regulatory', 'approval', 'nda', 'bla', 'ind',
            'clinical', 'trial', 'phase', 'endpoint', 'efficacy', 'safety',
            'drug', 'pharmaceutical', 'pharmacology', 'pharmacokinetics',
            'toxicology', 'adverse', 'event', 'interaction', 'ddi',
            'biomarker', 'genomic', 'personalized', 'precision',
            'oncology', 'immunology', 'cardiology', 'neurology',
            'biosimilar', 'generic', 'orphan', 'breakthrough',
        }
        
        # Simple extraction: find domain keywords in query
        query_lower = query.lower()
        words = set(query_lower.split())
        
        concepts = []
        for keyword in domain_keywords:
            if keyword in query_lower:
                concepts.append(keyword)
        
        # Also extract multi-word concepts
        multi_word_concepts = [
            'drug interaction', 'clinical trial', 'regulatory approval',
            'adverse event', 'new drug application', 'breakthrough therapy',
        ]
        for concept in multi_word_concepts:
            if concept in query_lower:
                concepts.append(concept.replace(' ', '_'))
        
        return list(set(concepts))[:10]  # Limit to 10 concepts
    
    async def _find_agent_paths(
        self,
        concepts: List[str],
        tenant_id: str,
        max_hops: int,
        limit: int,
    ) -> List[Dict[str, Any]]:
        """
        Find paths from concepts to agents in Neo4j.
        """
        if not self.driver:
            # Fallback: Return empty (no Neo4j connection)
            return []
        
        try:
            async with self.driver.session() as session:
                # Cypher query to find agents through concepts
                cypher = """
                MATCH path = (c:Concept)-[*1..%d]-(a:Agent)
                WHERE c.name IN $concepts 
                AND (a.tenant_id = $tenant_id OR a.tenant_id IS NULL)
                WITH a, path, length(path) as distance
                RETURN DISTINCT 
                    a.id as agent_id,
                    a.name as agent_name,
                    a.description as description,
                    a.domains as domains,
                    distance,
                    [node in nodes(path) | node.name] as path_nodes,
                    [rel in relationships(path) | type(rel)] as path_relationships
                ORDER BY distance ASC
                LIMIT $limit
                """ % max_hops
                
                result = await session.run(
                    cypher,
                    concepts=concepts,
                    tenant_id=tenant_id,
                    limit=limit,
                )
                
                paths = []
                async for record in result:
                    paths.append({
                        'agent_id': record['agent_id'],
                        'agent_name': record['agent_name'],
                        'description': record['description'],
                        'domains': record['domains'] or [],
                        'distance': record['distance'],
                        'path_nodes': record['path_nodes'],
                        'path_relationships': record['path_relationships'],
                    })
                
                return paths
                
        except Exception as e:
            logger.error(
                "ask_expert_graph_retriever_cypher_failed",
                error=str(e),
            )
            return []
    
    def _score_paths(
        self,
        paths: List[Dict[str, Any]],
        top_k: int,
    ) -> List[AskExpertRankedItem]:
        """
        Score paths based on distance and convert to ranked items.
        
        Scoring: shorter paths = higher score
        """
        # Group by agent (keep shortest path per agent)
        agent_best_paths: Dict[str, Dict[str, Any]] = {}
        
        for path in paths:
            agent_id = path['agent_id']
            if agent_id not in agent_best_paths:
                agent_best_paths[agent_id] = path
            elif path['distance'] < agent_best_paths[agent_id]['distance']:
                agent_best_paths[agent_id] = path
        
        # Score based on distance (inverse relationship)
        scored = []
        for agent_id, path in agent_best_paths.items():
            # Score: 1.0 for distance=1, decreasing for longer paths
            distance = path['distance']
            score = 1.0 / (1.0 + distance * 0.3)  # Smooth decay
            scored.append((agent_id, score, path))
        
        # Sort by score descending
        scored.sort(key=lambda x: x[1], reverse=True)
        
        # Convert to ranked items
        items = []
        for rank, (agent_id, score, path) in enumerate(scored[:top_k], start=1):
            items.append(AskExpertRankedItem(
                id=agent_id,
                rank=rank,
                score=score,
                source='graph',
                metadata={
                    'name': path['agent_name'],
                    'description': path['description'],
                    'domains': path['domains'],
                    'path_distance': path['distance'],
                    'path_nodes': path['path_nodes'],
                    'path_relationships': path['path_relationships'],
                },
            ))
        
        return items
