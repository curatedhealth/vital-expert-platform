"""
Intelligence Broker - Unified GraphRAG + VectorRAG Query Interface

The Intelligence Broker is the central orchestration layer for VITAL's hybrid retrieval system.
It intelligently routes queries across:
- L0-L7 Ontology Layers (via Neo4j knowledge graph)
- Domain Knowledge (via Pinecone vector search)
- Service Modes (Ask Me, Ask Expert, Ask Panel, Workflows)

Architecture:
┌─────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE BROKER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Query Analysis → Strategy Selection → Multi-Modal Retrieval        │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Neo4j Graph  │  │ Pinecone     │  │ PostgreSQL   │              │
│  │ (Ontology)   │  │ (Vectors)    │  │ (Structured) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         ↓                 ↓                 ↓                       │
│  ┌─────────────────────────────────────────────────────┐           │
│  │        Reciprocal Rank Fusion (RRF)                  │           │
│  └─────────────────────────────────────────────────────┘           │
│                           ↓                                         │
│  ┌─────────────────────────────────────────────────────┐           │
│  │        Unified Context + Evidence Response           │           │
│  └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘

Usage:
    from graphrag.intelligence_broker import IntelligenceBroker, BrokerQuery

    broker = IntelligenceBroker()
    await broker.initialize()

    result = await broker.query(BrokerQuery(
        query="What are the FDA requirements for SaMD?",
        service_mode="ask_expert",
        persona_id="uuid-here",
        role_id="uuid-here"
    ))
"""

from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass, field
from enum import Enum
import structlog
import asyncio

from .service import GraphRAGService, get_graphrag_service
from .models import (
    GraphRAGRequest, GraphRAGResponse, ContextChunk,
    FusionWeights, RAGProfile
)
from .strategies import StrategyRegistry, get_strategy_registry, RAGStrategyType
from .namespace_config import (
    get_namespaces_for_query,
    ONTOLOGY_NAMESPACES,
    KNOWLEDGE_NAMESPACES,
    ALL_NAMESPACES
)
from .clients.neo4j_client import get_neo4j_client
from .clients.vector_db_client import get_vector_client
from .clients.postgres_client import get_postgres_client, PostgresClient

logger = structlog.get_logger()


class ServiceMode(str, Enum):
    """VITAL Platform service modes"""
    ASK_ME = "ask_me"          # Simple queries, Tier-1 response
    ASK_EXPERT = "ask_expert"  # Expert consultation, Tier-2/3 response
    ASK_PANEL = "ask_panel"    # Multi-expert panel, consensus response
    WORKFLOWS = "workflows"     # Workflow automation


class QueryComplexity(str, Enum):
    """Query complexity levels for strategy selection"""
    SIMPLE = "simple"           # Single-hop, keyword match
    MODERATE = "moderate"       # Multi-namespace, some reasoning
    COMPLEX = "complex"         # Multi-hop graph, expert reasoning
    REGULATORY = "regulatory"   # High-precision regulatory queries


@dataclass
class OntologyContext:
    """Context from L0-L7 ontology traversal"""
    layer: str                  # L0-L7
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    traversal_depth: int


@dataclass
class BrokerQuery:
    """Input query for Intelligence Broker"""
    query: str
    service_mode: ServiceMode = ServiceMode.ASK_EXPERT

    # User context (optional but recommended)
    persona_id: Optional[str] = None
    role_id: Optional[str] = None
    tenant_id: Optional[str] = None
    agent_id: Optional[str] = None

    # Search configuration
    top_k: int = 10
    min_score: float = 0.3
    max_hops: int = 2

    # Layer filtering
    ontology_layers: Optional[List[str]] = None  # ['L1', 'L3', 'L4'] etc.
    knowledge_domains: Optional[List[str]] = None

    # Override strategy (usually auto-detected)
    strategy_override: Optional[str] = None

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BrokerResponse:
    """Output from Intelligence Broker"""
    # Core results
    context_chunks: List[ContextChunk]
    total_results: int

    # Strategy info
    strategy_used: str
    complexity_detected: QueryComplexity

    # Ontology traversal
    ontology_context: List[OntologyContext]
    layers_traversed: List[str]

    # Namespaces searched
    namespaces_searched: List[str]

    # Evidence & confidence
    confidence_score: float
    evidence_summary: str

    # Timing
    latency_ms: float

    # Raw GraphRAG response for advanced use
    raw_response: Optional[GraphRAGResponse] = None


class IntelligenceBroker:
    """
    Unified query interface combining VectorRAG + GraphRAG

    Capabilities:
    1. Query complexity analysis
    2. Automatic strategy selection
    3. L0-L7 ontology traversal
    4. Multi-namespace vector search
    5. Hybrid fusion with RRF
    6. Service mode optimization

    L0-L7 Layer Mapping:
    - L0: Domain Knowledge (therapeutic areas, diseases, products)
    - L1: Functions (Medical Affairs, Commercial, etc.)
    - L2: Departments
    - L3: Roles
    - L4: Personas
    - L5: JTBDs
    - L6: JTBD-Role Mappings
    - L7: Agents
    """

    def __init__(self):
        self._graphrag_service: Optional[GraphRAGService] = None
        self._neo4j_client = None
        self._vector_client = None
        self._postgres_client: Optional[PostgresClient] = None
        self._initialized = False

        # Layer to Neo4j label mapping
        self.layer_mapping = {
            'L0': ['TherapeuticArea', 'Disease', 'Product', 'Domain'],
            'L1': ['Function'],
            'L2': ['Department'],
            'L3': ['Role'],
            'L4': ['Persona'],
            'L5': ['JTBD'],
            'L6': ['JTBDRoleMapping'],
            'L7': ['Agent']
        }

        # Service mode to strategy mapping
        self.service_strategies = {
            ServiceMode.ASK_ME: 'semantic_standard',
            ServiceMode.ASK_EXPERT: 'hybrid_enhanced',
            ServiceMode.ASK_PANEL: 'graphrag_entity',
            ServiceMode.WORKFLOWS: 'agent_optimized'
        }

        logger.info("intelligence_broker_created")

    async def initialize(self):
        """Initialize all backend connections"""
        if self._initialized:
            return

        try:
            # Initialize GraphRAG service
            self._graphrag_service = await get_graphrag_service()

            # Initialize direct clients for ontology queries
            self._neo4j_client = await get_neo4j_client()
            self._vector_client = await get_vector_client()

            # Initialize PostgreSQL client for structured data
            self._postgres_client = await get_postgres_client()

            self._initialized = True
            logger.info(
                "intelligence_broker_initialized",
                backends=["graphrag", "neo4j", "pinecone", "postgres"]
            )

        except Exception as e:
            logger.error("intelligence_broker_init_failed", error=str(e))
            raise

    async def query(self, broker_query: BrokerQuery) -> BrokerResponse:
        """
        Execute unified query across all retrieval systems

        Args:
            broker_query: Query with context and configuration

        Returns:
            BrokerResponse with merged results
        """
        import time
        start_time = time.time()

        if not self._initialized:
            await self.initialize()

        try:
            # Step 1: Analyze query complexity
            complexity = self._analyze_complexity(broker_query)

            # Step 2: Select strategy (auto or override)
            strategy_name = self._select_strategy(broker_query, complexity)

            # Step 3: Determine namespaces to search
            namespaces = self._determine_namespaces(broker_query)

            # Step 4: Traverse ontology if needed
            ontology_context = []
            layers_traversed = []

            if complexity in [QueryComplexity.COMPLEX, QueryComplexity.REGULATORY]:
                ontology_context, layers_traversed = await self._traverse_ontology(
                    broker_query
                )

            # Step 5: Execute hybrid search via GraphRAG service
            graphrag_request = GraphRAGRequest(
                query=broker_query.query,
                top_k=broker_query.top_k,
                min_score=broker_query.min_score,
                strategy=strategy_name,
                agent_id=broker_query.agent_id,
                namespaces=namespaces,
                max_graph_hops=broker_query.max_hops,
                metadata={
                    **broker_query.metadata,
                    'persona_id': broker_query.persona_id,
                    'role_id': broker_query.role_id,
                    'tenant_id': broker_query.tenant_id,
                    'service_mode': broker_query.service_mode.value,
                    'complexity': complexity.value
                }
            )

            graphrag_response = await self._graphrag_service.query(graphrag_request)

            # Step 6: Enrich with ontology context
            enriched_chunks = self._enrich_with_ontology(
                graphrag_response.chunks,
                ontology_context
            )

            # Step 7: Calculate confidence
            confidence = self._calculate_confidence(
                enriched_chunks,
                ontology_context,
                complexity
            )

            # Step 8: Build evidence summary
            evidence_summary = self._build_evidence_summary(
                enriched_chunks,
                ontology_context,
                layers_traversed
            )

            latency_ms = (time.time() - start_time) * 1000

            response = BrokerResponse(
                context_chunks=enriched_chunks,
                total_results=len(enriched_chunks),
                strategy_used=strategy_name,
                complexity_detected=complexity,
                ontology_context=ontology_context,
                layers_traversed=layers_traversed,
                namespaces_searched=namespaces,
                confidence_score=confidence,
                evidence_summary=evidence_summary,
                latency_ms=latency_ms,
                raw_response=graphrag_response
            )

            logger.info(
                "intelligence_broker_query_complete",
                query=broker_query.query[:50],
                complexity=complexity.value,
                strategy=strategy_name,
                results=len(enriched_chunks),
                latency_ms=latency_ms
            )

            return response

        except Exception as e:
            logger.error(
                "intelligence_broker_query_failed",
                query=broker_query.query[:50],
                error=str(e)
            )
            raise

    def _analyze_complexity(self, broker_query: BrokerQuery) -> QueryComplexity:
        """
        Analyze query to determine complexity level

        Heuristics:
        - Regulatory keywords → REGULATORY
        - Graph traversal needed → COMPLEX
        - Multi-namespace → MODERATE
        - Simple keyword → SIMPLE
        """
        query_lower = broker_query.query.lower()

        # Check for regulatory patterns
        regulatory_keywords = [
            'fda', 'ema', 'ich', '510k', '510(k)', 'pma', 'de novo',
            'guidance', 'regulation', 'compliance', 'approval',
            'submission', 'ivdr', 'mdr', 'gcp', 'gmp'
        ]
        if any(kw in query_lower for kw in regulatory_keywords):
            return QueryComplexity.REGULATORY

        # Check for complex graph queries
        graph_keywords = [
            'relationship', 'connected', 'related to', 'pathway',
            'how does', 'compare', 'between', 'hierarchy'
        ]
        if any(kw in query_lower for kw in graph_keywords):
            return QueryComplexity.COMPLEX

        # Check for multi-domain queries
        multi_domain_patterns = [
            'across', 'all departments', 'multiple', 'global',
            'organization-wide', 'enterprise'
        ]
        if any(p in query_lower for p in multi_domain_patterns):
            return QueryComplexity.MODERATE

        # Check query length as proxy for complexity
        word_count = len(broker_query.query.split())
        if word_count > 20:
            return QueryComplexity.MODERATE

        return QueryComplexity.SIMPLE

    def _select_strategy(
        self,
        broker_query: BrokerQuery,
        complexity: QueryComplexity
    ) -> str:
        """Select appropriate retrieval strategy"""

        # User override takes precedence
        if broker_query.strategy_override:
            return broker_query.strategy_override

        # Map complexity to strategy
        complexity_strategies = {
            QueryComplexity.SIMPLE: 'semantic_standard',
            QueryComplexity.MODERATE: 'hybrid_enhanced',
            QueryComplexity.COMPLEX: 'graphrag_entity',
            QueryComplexity.REGULATORY: 'regulatory_precision'
        }

        # Get base strategy from complexity
        base_strategy = complexity_strategies.get(
            complexity,
            'hybrid_enhanced'
        )

        # Override based on service mode for certain cases
        if broker_query.service_mode == ServiceMode.ASK_PANEL:
            base_strategy = 'graphrag_entity'
        elif broker_query.service_mode == ServiceMode.WORKFLOWS:
            base_strategy = 'agent_optimized'

        return base_strategy

    def _determine_namespaces(self, broker_query: BrokerQuery) -> List[str]:
        """Determine which Pinecone namespaces to search"""

        namespaces = []

        # Add ontology namespaces if searching for agents/personas
        if broker_query.agent_id or broker_query.persona_id:
            namespaces.extend(['ont-agents', 'ont-personas', 'ont-roles'])

        # Use namespace config to route based on query
        query_namespaces = get_namespaces_for_query(
            query=broker_query.query,
            domains=broker_query.knowledge_domains
        )
        namespaces.extend(query_namespaces)

        # Deduplicate
        return list(set(namespaces))

    async def _traverse_ontology(
        self,
        broker_query: BrokerQuery
    ) -> tuple[List[OntologyContext], List[str]]:
        """
        Traverse L0-L7 ontology layers in Neo4j

        Returns:
            Tuple of (ontology_contexts, layers_traversed)
        """
        contexts = []
        layers_traversed = []

        try:
            # Determine which layers to traverse
            layers = broker_query.ontology_layers or ['L3', 'L4', 'L7']  # Roles, Personas, Agents

            for layer in layers:
                node_labels = self.layer_mapping.get(layer, [])
                if not node_labels:
                    continue

                # Query Neo4j for this layer
                label_filter = ':'.join(node_labels)

                # Build contextual query based on user context
                cypher_query = f"""
                MATCH (n:{label_filter})
                WHERE 1=1
                """

                params = {}

                # Filter by role if provided
                if broker_query.role_id and layer == 'L3':
                    cypher_query += " AND n.id = $role_id"
                    params['role_id'] = broker_query.role_id

                # Filter by persona if provided
                if broker_query.persona_id and layer == 'L4':
                    cypher_query += " AND n.id = $persona_id"
                    params['persona_id'] = broker_query.persona_id

                # Filter by agent if provided
                if broker_query.agent_id and layer == 'L7':
                    cypher_query += " AND n.id = $agent_id"
                    params['agent_id'] = broker_query.agent_id

                cypher_query += """
                OPTIONAL MATCH (n)-[r]-(connected)
                RETURN n, collect(DISTINCT r) as relationships,
                       collect(DISTINCT connected) as connected_nodes
                LIMIT 50
                """

                results = await self._neo4j_client.run_query(
                    cypher_query,
                    parameters=params
                )

                if results:
                    entities = []
                    relationships = []

                    for record in results:
                        if record.get('n'):
                            entities.append(record['n'])
                        if record.get('relationships'):
                            relationships.extend(record['relationships'])

                    contexts.append(OntologyContext(
                        layer=layer,
                        entities=entities,
                        relationships=relationships,
                        traversal_depth=1
                    ))
                    layers_traversed.append(layer)

            logger.info(
                "ontology_traversal_complete",
                layers_traversed=layers_traversed,
                total_entities=sum(len(c.entities) for c in contexts)
            )

        except Exception as e:
            logger.warning(
                "ontology_traversal_partial_failure",
                error=str(e)
            )

        return contexts, layers_traversed

    def _enrich_with_ontology(
        self,
        chunks: List[ContextChunk],
        ontology_context: List[OntologyContext]
    ) -> List[ContextChunk]:
        """
        Enrich context chunks with ontology information

        Adds layer context and relationship info to chunk metadata
        """
        if not ontology_context:
            return chunks

        # Build entity lookup
        entity_names = set()
        for ctx in ontology_context:
            for entity in ctx.entities:
                name = entity.get('name', '') if isinstance(entity, dict) else str(entity)
                if name:
                    entity_names.add(name.lower())

        # Enrich chunks that mention ontology entities
        enriched = []
        for chunk in chunks:
            chunk_text_lower = chunk.text.lower()

            # Check for entity mentions
            mentioned_entities = [
                name for name in entity_names
                if name in chunk_text_lower
            ]

            if mentioned_entities:
                chunk.metadata = chunk.metadata or {}
                chunk.metadata['ontology_entities'] = mentioned_entities
                chunk.metadata['ontology_enriched'] = True

                # Boost score slightly for ontology-connected chunks
                chunk.score = min(1.0, chunk.score * 1.1)

            enriched.append(chunk)

        return enriched

    def _calculate_confidence(
        self,
        chunks: List[ContextChunk],
        ontology_context: List[OntologyContext],
        complexity: QueryComplexity
    ) -> float:
        """
        Calculate overall confidence score

        Based on:
        - Average chunk scores
        - Ontology coverage
        - Result count relative to complexity
        """
        if not chunks:
            return 0.0

        # Average chunk score
        avg_score = sum(c.score for c in chunks) / len(chunks)

        # Ontology bonus (more layers = higher confidence)
        ontology_bonus = len(ontology_context) * 0.05

        # Complexity penalty (complex queries need more evidence)
        complexity_factors = {
            QueryComplexity.SIMPLE: 1.0,
            QueryComplexity.MODERATE: 0.95,
            QueryComplexity.COMPLEX: 0.9,
            QueryComplexity.REGULATORY: 0.85  # Highest bar
        }
        complexity_factor = complexity_factors.get(complexity, 0.9)

        # Result count bonus (more results = higher confidence, up to a point)
        count_bonus = min(0.1, len(chunks) * 0.01)

        confidence = (avg_score + ontology_bonus + count_bonus) * complexity_factor

        return min(1.0, max(0.0, confidence))

    def _build_evidence_summary(
        self,
        chunks: List[ContextChunk],
        ontology_context: List[OntologyContext],
        layers_traversed: List[str]
    ) -> str:
        """Build human-readable evidence summary"""

        parts = []

        # Result count
        parts.append(f"Found {len(chunks)} relevant sources")

        # Modalities used
        modalities = set(c.search_modality for c in chunks if c.search_modality)
        if modalities:
            parts.append(f"via {', '.join(modalities)} search")

        # Ontology layers
        if layers_traversed:
            parts.append(f"Traversed ontology layers: {', '.join(layers_traversed)}")

        # Entity count
        total_entities = sum(len(c.entities) for c in ontology_context)
        if total_entities:
            parts.append(f"Connected to {total_entities} ontology entities")

        return ". ".join(parts) + "."

    async def find_agents_for_query(
        self,
        query: str,
        role_id: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find best-matched agents for a query using ontology relationships

        Uses L7 (Agents) layer with optional role filtering
        """
        if not self._initialized:
            await self.initialize()

        # Vector search in agent namespace
        agent_results = await self._vector_client.search(
            embedding=await self._get_embedding(query),
            top_k=top_k,
            namespace='ont-agents'
        )

        # If role provided, filter by agent-role mappings in Neo4j
        if role_id:
            cypher = """
            MATCH (a:Agent)-[:SERVES]->(r:Role {id: $role_id})
            RETURN a.id as agent_id, a.name as name, a.tier as tier
            LIMIT $top_k
            """
            graph_agents = await self._neo4j_client.run_query(
                cypher,
                parameters={'role_id': role_id, 'top_k': top_k}
            )

            # Merge results
            graph_ids = {a['agent_id'] for a in graph_agents}
            agent_results = [
                r for r in agent_results
                if r.id in graph_ids
            ]

        return [
            {
                'id': r.id,
                'name': r.metadata.get('name', 'Unknown'),
                'score': r.score,
                'tier': r.metadata.get('tier', 1)
            }
            for r in agent_results
        ]

    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding vector for text"""
        # Use the GraphRAG service's embedding function
        if hasattr(self._graphrag_service, '_get_embedding'):
            return await self._graphrag_service._get_embedding(text)

        # Fallback: return zero vector (will be replaced by actual embeddings)
        logger.warning("embedding_fallback_zero_vector")
        return [0.0] * 1536  # OpenAI embedding dimension

    # =========================================================================
    # PostgreSQL Structured Data Methods
    # =========================================================================

    async def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch agent details from PostgreSQL (source of truth)

        Args:
            agent_id: Agent UUID

        Returns:
            Agent record with full metadata
        """
        if not self._initialized:
            await self.initialize()

        query = """
        SELECT
            id, name, display_name, description, tier, model,
            system_prompt, knowledge_domains, capabilities,
            status, temperature, max_tokens, metadata
        FROM agents
        WHERE id = $1 AND status = 'active'
        """

        try:
            result = await self._postgres_client.fetchrow(query, agent_id)
            return result
        except Exception as e:
            logger.error("get_agent_by_id_failed", agent_id=agent_id, error=str(e))
            return None

    async def get_agents_for_role(
        self,
        role_id: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch agents mapped to a specific role from PostgreSQL

        Uses agent_roles junction table
        """
        if not self._initialized:
            await self.initialize()

        query = """
        SELECT
            a.id, a.name, a.display_name, a.tier, a.model,
            ar.relevance_score, ar.is_primary
        FROM agents a
        INNER JOIN agent_roles ar ON a.id = ar.agent_id
        WHERE ar.role_id = $1
          AND a.status = 'active'
          AND ar.is_active = TRUE
        ORDER BY ar.is_primary DESC, ar.relevance_score DESC
        LIMIT $2
        """

        try:
            results = await self._postgres_client.fetch(query, role_id, top_k)
            return results
        except Exception as e:
            logger.error("get_agents_for_role_failed", role_id=role_id, error=str(e))
            return []

    async def get_persona_context(
        self,
        persona_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch persona details including role inheritance from PostgreSQL

        Returns persona with effective role data
        """
        if not self._initialized:
            await self.initialize()

        query = """
        SELECT
            p.id, p.unique_id, p.role_title, p.department,
            p.function_area, p.derived_archetype, p.seniority_level,
            p.ai_maturity_score, p.work_complexity_score,
            p.gen_ai_readiness_level, p.key_responsibilities,
            p.tools_used, p.pain_points, p.gen_ai_potential,
            r.id as role_id, r.name as role_name
        FROM personas p
        LEFT JOIN org_roles r ON p.role_title = r.name
        WHERE p.id = $1
        """

        try:
            result = await self._postgres_client.fetchrow(query, persona_id)
            return result
        except Exception as e:
            logger.error("get_persona_context_failed", persona_id=persona_id, error=str(e))
            return None

    async def get_jtbds_for_role(
        self,
        role_id: str,
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Fetch JTBDs mapped to a role from PostgreSQL

        Uses jtbd_roles junction table
        """
        if not self._initialized:
            await self.initialize()

        query = """
        SELECT
            j.id, j.code, j.name, j.job_statement,
            j.job_type, j.complexity, j.frequency,
            jr.relevance_score, jr.importance
        FROM jtbd j
        INNER JOIN jtbd_roles jr ON j.id = jr.jtbd_id
        WHERE jr.role_id = $1
        ORDER BY jr.relevance_score DESC
        LIMIT $2
        """

        try:
            results = await self._postgres_client.fetch(query, role_id, top_k)
            return results
        except Exception as e:
            logger.error("get_jtbds_for_role_failed", role_id=role_id, error=str(e))
            return []

    async def search_agents_fulltext(
        self,
        search_term: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Full-text search for agents in PostgreSQL

        Searches name, display_name, description, knowledge_domains
        """
        if not self._initialized:
            await self.initialize()

        query = """
        SELECT
            id, name, display_name, tier, model,
            ts_rank(
                to_tsvector('english', coalesce(name,'') || ' ' ||
                            coalesce(display_name,'') || ' ' ||
                            coalesce(description,'') || ' ' ||
                            coalesce(array_to_string(knowledge_domains, ' '),'')),
                plainto_tsquery('english', $1)
            ) as rank
        FROM agents
        WHERE status = 'active'
          AND to_tsvector('english', coalesce(name,'') || ' ' ||
                          coalesce(display_name,'') || ' ' ||
                          coalesce(description,'') || ' ' ||
                          coalesce(array_to_string(knowledge_domains, ' '),''))
              @@ plainto_tsquery('english', $1)
        ORDER BY rank DESC
        LIMIT $2
        """

        try:
            results = await self._postgres_client.fetch(query, search_term, top_k)
            return results
        except Exception as e:
            logger.error("search_agents_fulltext_failed", search_term=search_term, error=str(e))
            return []

    async def health_check(self) -> Dict[str, bool]:
        """Check health of all backend systems"""
        results = {
            'graphrag': False,
            'neo4j': False,
            'vector_db': False,
            'postgres': False
        }

        try:
            if self._graphrag_service:
                results['graphrag'] = True  # If initialized, assume healthy

            if self._neo4j_client:
                results['neo4j'] = await self._neo4j_client.health_check()

            if self._vector_client:
                results['vector_db'] = await self._vector_client.health_check()

            if self._postgres_client:
                results['postgres'] = await self._postgres_client.health_check()

        except Exception as e:
            logger.error("health_check_failed", error=str(e))

        return results


# ============================================================================
# Singleton Factory
# ============================================================================

_broker_instance: Optional[IntelligenceBroker] = None


async def get_intelligence_broker() -> IntelligenceBroker:
    """Get or create Intelligence Broker singleton"""
    global _broker_instance

    if _broker_instance is None:
        _broker_instance = IntelligenceBroker()
        await _broker_instance.initialize()

    return _broker_instance


# ============================================================================
# Convenience Functions
# ============================================================================

async def broker_query(
    query: str,
    service_mode: str = "ask_expert",
    **kwargs
) -> BrokerResponse:
    """
    Convenience function for quick queries

    Usage:
        result = await broker_query(
            "What are FDA requirements for SaMD?",
            service_mode="ask_expert",
            top_k=10
        )
    """
    broker = await get_intelligence_broker()

    broker_q = BrokerQuery(
        query=query,
        service_mode=ServiceMode(service_mode),
        **kwargs
    )

    return await broker.query(broker_q)


# Export public interface
__all__ = [
    'IntelligenceBroker',
    'BrokerQuery',
    'BrokerResponse',
    'ServiceMode',
    'QueryComplexity',
    'OntologyContext',
    'get_intelligence_broker',
    'broker_query'
]
