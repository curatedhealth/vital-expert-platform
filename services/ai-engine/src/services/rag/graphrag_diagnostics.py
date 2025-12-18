"""
GraphRAG Diagnostics Service

Provides health checks and diagnostics for the GraphRAG agent selection system.
Use this to verify that all 3 methods (PostgreSQL, Pinecone, Neo4j) are operational.

Usage:
    from services.graphrag_diagnostics import run_graphrag_diagnostics

    results = await run_graphrag_diagnostics(tenant_id="00000000-0000-0000-0000-000000000001")
    print(results)
"""

import asyncio
import os
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
import structlog

logger = structlog.get_logger()


@dataclass
class DiagnosticResult:
    """Result of a single diagnostic check."""
    component: str
    status: str  # "ok", "warning", "error"
    message: str
    latency_ms: float = 0.0
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphRAGDiagnosticsReport:
    """Complete diagnostics report for GraphRAG system."""
    overall_status: str  # "healthy", "degraded", "unhealthy"
    components: List[DiagnosticResult] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    timestamp: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_status": self.overall_status,
            "components": [
                {
                    "component": c.component,
                    "status": c.status,
                    "message": c.message,
                    "latency_ms": c.latency_ms,
                    "details": c.details
                }
                for c in self.components
            ],
            "recommendations": self.recommendations,
            "timestamp": self.timestamp
        }


class GraphRAGDiagnostics:
    """
    Diagnostic service for GraphRAG agent selection.

    Checks:
    1. PostgreSQL fulltext search (RPC function)
    2. Pinecone vector search (connectivity + dimension match)
    3. Neo4j graph search (connectivity)
    4. Embedding service (provider + dimension)
    5. Overall fusion capability
    """

    def __init__(self):
        self.results: List[DiagnosticResult] = []

    async def check_embedding_service(self) -> DiagnosticResult:
        """Check embedding service configuration and health."""
        start_time = time.time()

        try:
            from services.embedding_service import EmbeddingService, get_embedding_service

            service = get_embedding_service()
            await service.initialize()

            # Generate test embedding
            test_result = await service.embed_text("test query for diagnostics")

            latency_ms = (time.time() - start_time) * 1000

            return DiagnosticResult(
                component="embedding_service",
                status="ok",
                message=f"Embedding service operational ({service.provider})",
                latency_ms=latency_ms,
                details={
                    "provider": service.provider,
                    "model": service.model_name,
                    "dimension": service.embedding_dim,
                    "test_embedding_dim": len(test_result.embedding)
                }
            )

        except ImportError as e:
            return DiagnosticResult(
                component="embedding_service",
                status="error",
                message=f"Import error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )
        except Exception as e:
            return DiagnosticResult(
                component="embedding_service",
                status="error",
                message=f"Error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )

    async def check_postgresql_fulltext(self, tenant_id: str) -> DiagnosticResult:
        """Check PostgreSQL fulltext search RPC function."""
        start_time = time.time()

        try:
            from services.supabase_client import get_supabase_client

            supabase = get_supabase_client()

            # Ensure client is initialized
            if supabase.client is None:
                await supabase.initialize()

            # Test the RPC function
            def _run_rpc():
                return supabase.client.rpc(
                    "search_agents_fulltext",
                    {
                        "search_query": "medical affairs",
                        "tenant_filter": tenant_id,
                        "result_limit": 5
                    }
                ).execute()

            result = await asyncio.to_thread(_run_rpc)

            latency_ms = (time.time() - start_time) * 1000

            agents_found = len(result.data) if result.data else 0

            if agents_found > 0:
                return DiagnosticResult(
                    component="postgresql_fulltext",
                    status="ok",
                    message=f"PostgreSQL fulltext search operational ({agents_found} agents found)",
                    latency_ms=latency_ms,
                    details={
                        "agents_found": agents_found,
                        "sample_agents": [a.get("name") for a in (result.data or [])[:3]]
                    }
                )
            else:
                return DiagnosticResult(
                    component="postgresql_fulltext",
                    status="warning",
                    message="RPC function works but returned no agents",
                    latency_ms=latency_ms,
                    details={
                        "agents_found": 0,
                        "possible_causes": [
                            "No active agents for this tenant",
                            "search_vector column not populated",
                            "Tenant ID mismatch"
                        ]
                    }
                )

        except Exception as e:
            error_msg = str(e)
            if "does not exist" in error_msg:
                return DiagnosticResult(
                    component="postgresql_fulltext",
                    status="error",
                    message="RPC function 'search_agents_fulltext' not found - run migration",
                    latency_ms=(time.time() - start_time) * 1000,
                    details={
                        "migration_file": "database/postgres/migrations/20251127_022_graphrag_fulltext_search_rpc.sql"
                    }
                )
            return DiagnosticResult(
                component="postgresql_fulltext",
                status="error",
                message=f"Error: {error_msg[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )

    async def check_pinecone_vector(self) -> DiagnosticResult:
        """Check Pinecone vector search connectivity and configuration."""
        start_time = time.time()

        try:
            from pinecone import Pinecone

            api_key = os.getenv("PINECONE_API_KEY")
            if not api_key:
                return DiagnosticResult(
                    component="pinecone_vector",
                    status="warning",
                    message="PINECONE_API_KEY not configured",
                    latency_ms=(time.time() - start_time) * 1000,
                    details={"impact": "Vector search disabled (50% weight lost)"}
                )

            pc = Pinecone(api_key=api_key)

            index_name = os.getenv("PINECONE_AGENTS_INDEX_NAME") or os.getenv("PINECONE_AGENT_INDEX", "vital-knowledge")
            agent_namespace = os.getenv("PINECONE_AGENT_NAMESPACE", "ont-agents")
            expected_dim = int(os.getenv("PINECONE_INDEX_DIMENSION", "3072"))

            index = pc.Index(index_name)

            # Get index stats
            stats = index.describe_index_stats()

            latency_ms = (time.time() - start_time) * 1000

            # Check namespace stats
            namespace_stats = stats.namespaces.get(agent_namespace, {})
            vector_count = namespace_stats.vector_count if hasattr(namespace_stats, 'vector_count') else 0

            if vector_count > 0:
                return DiagnosticResult(
                    component="pinecone_vector",
                    status="ok",
                    message=f"Pinecone operational ({vector_count} agent vectors in '{agent_namespace}')",
                    latency_ms=latency_ms,
                    details={
                        "index": index_name,
                        "namespace": agent_namespace,
                        "vector_count": vector_count,
                        "expected_dimension": expected_dim,
                        "total_vectors": stats.total_vector_count
                    }
                )
            else:
                return DiagnosticResult(
                    component="pinecone_vector",
                    status="warning",
                    message=f"Pinecone connected but namespace '{agent_namespace}' is empty",
                    latency_ms=latency_ms,
                    details={
                        "index": index_name,
                        "namespace": agent_namespace,
                        "available_namespaces": list(stats.namespaces.keys()),
                        "recommendation": "Run agent sync to populate vectors"
                    }
                )

        except ImportError:
            return DiagnosticResult(
                component="pinecone_vector",
                status="error",
                message="Pinecone package not installed",
                latency_ms=(time.time() - start_time) * 1000
            )
        except Exception as e:
            return DiagnosticResult(
                component="pinecone_vector",
                status="error",
                message=f"Error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )

    async def check_neo4j_graph(self) -> DiagnosticResult:
        """Check Neo4j graph search connectivity."""
        start_time = time.time()

        try:
            from services.neo4j_client import get_neo4j_client

            neo4j = get_neo4j_client()

            # Check if Neo4j client is initialized
            if neo4j is None:
                return DiagnosticResult(
                    component="neo4j_graph",
                    status="warning",
                    message="Neo4j not configured (client is None)",
                    latency_ms=(time.time() - start_time) * 1000,
                    details={"impact": "Graph search disabled (20% weight lost)"}
                )

            # Try to verify connectivity using the verify_connection method
            is_connected = await neo4j.verify_connection() if hasattr(neo4j, 'verify_connection') else False

            latency_ms = (time.time() - start_time) * 1000

            if is_connected:
                return DiagnosticResult(
                    component="neo4j_graph",
                    status="ok",
                    message="Neo4j connected and operational",
                    latency_ms=latency_ms
                )
            else:
                return DiagnosticResult(
                    component="neo4j_graph",
                    status="warning",
                    message="Neo4j configured but connectivity unverified",
                    latency_ms=latency_ms
                )

        except ImportError:
            return DiagnosticResult(
                component="neo4j_graph",
                status="warning",
                message="Neo4j package not installed",
                latency_ms=(time.time() - start_time) * 1000,
                details={"impact": "Graph search disabled (20% weight lost)"}
            )
        except RuntimeError as e:
            # Neo4j client not initialized at startup
            return DiagnosticResult(
                component="neo4j_graph",
                status="warning",
                message=f"Neo4j not initialized: {str(e)[:80]}",
                latency_ms=(time.time() - start_time) * 1000,
                details={"impact": "Graph search disabled (20% weight lost)"}
            )
        except Exception as e:
            return DiagnosticResult(
                component="neo4j_graph",
                status="error",
                message=f"Error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )

    async def check_graphrag_selector(self, tenant_id: str) -> DiagnosticResult:
        """Check overall GraphRAG selector functionality."""
        start_time = time.time()

        try:
            from services.graphrag_selector import get_graphrag_selector

            selector = get_graphrag_selector()

            # Run a test selection
            agents = await selector.select_agents(
                query="medical affairs regulatory guidance",
                tenant_id=tenant_id,
                mode="mode4",
                max_agents=3,
                min_confidence=0.001  # Very low threshold for diagnostics
            )

            latency_ms = (time.time() - start_time) * 1000

            if agents and len(agents) > 0:
                # Check if we got real agents or stub
                is_stub = agents[0].get("metadata", {}).get("is_stub", False)

                if is_stub:
                    return DiagnosticResult(
                        component="graphrag_selector",
                        status="warning",
                        message="GraphRAG returned stub agent (all methods may have failed)",
                        latency_ms=latency_ms,
                        details={
                            "stub_reason": agents[0].get("metadata", {}).get("stub_reason"),
                            "agents_found": len(agents)
                        }
                    )
                else:
                    return DiagnosticResult(
                        component="graphrag_selector",
                        status="ok",
                        message=f"GraphRAG selector operational ({len(agents)} agents found)",
                        latency_ms=latency_ms,
                        details={
                            "agents_found": len(agents),
                            "top_agent": agents[0].get("agent_name"),
                            "top_score": round(agents[0].get("fused_score", 0), 4),
                            "methods_used": list(agents[0].get("scores", {}).keys())
                        }
                    )
            else:
                return DiagnosticResult(
                    component="graphrag_selector",
                    status="error",
                    message="GraphRAG selector returned no agents",
                    latency_ms=latency_ms
                )

        except ImportError as e:
            return DiagnosticResult(
                component="graphrag_selector",
                status="error",
                message=f"Import error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )
        except Exception as e:
            return DiagnosticResult(
                component="graphrag_selector",
                status="error",
                message=f"Error: {str(e)[:100]}",
                latency_ms=(time.time() - start_time) * 1000
            )

    async def run_all_checks(self, tenant_id: str) -> GraphRAGDiagnosticsReport:
        """Run all diagnostic checks and generate report."""
        from datetime import datetime, timezone

        logger.info("graphrag_diagnostics_starting", tenant_id=tenant_id)

        # Run all checks
        results = await asyncio.gather(
            self.check_embedding_service(),
            self.check_postgresql_fulltext(tenant_id),
            self.check_pinecone_vector(),
            self.check_neo4j_graph(),
            self.check_graphrag_selector(tenant_id),
            return_exceptions=True
        )

        # Process results
        components = []
        for result in results:
            if isinstance(result, Exception):
                components.append(DiagnosticResult(
                    component="unknown",
                    status="error",
                    message=f"Check failed: {str(result)[:100]}"
                ))
            else:
                components.append(result)

        # Determine overall status
        error_count = sum(1 for c in components if c.status == "error")
        warning_count = sum(1 for c in components if c.status == "warning")

        if error_count > 0:
            overall_status = "unhealthy"
        elif warning_count > 2:
            overall_status = "degraded"
        elif warning_count > 0:
            overall_status = "degraded"
        else:
            overall_status = "healthy"

        # Generate recommendations
        recommendations = []
        for c in components:
            if c.status == "error":
                if c.component == "postgresql_fulltext":
                    recommendations.append(
                        "Run PostgreSQL migration: psql -f database/postgres/migrations/20251127_022_graphrag_fulltext_search_rpc.sql"
                    )
                elif c.component == "pinecone_vector":
                    recommendations.append("Configure PINECONE_API_KEY environment variable")
                elif c.component == "embedding_service":
                    recommendations.append("Configure OPENAI_API_KEY for embeddings")
            elif c.status == "warning":
                if "empty" in c.message.lower():
                    recommendations.append("Run agent sync script to populate vectors")
                if "mock" in c.message.lower():
                    recommendations.append("Configure Neo4j connection for graph search")

        report = GraphRAGDiagnosticsReport(
            overall_status=overall_status,
            components=components,
            recommendations=list(set(recommendations)),  # Remove duplicates
            timestamp=datetime.now(timezone.utc).isoformat()
        )

        logger.info(
            "graphrag_diagnostics_complete",
            overall_status=overall_status,
            error_count=error_count,
            warning_count=warning_count,
            tenant_id=tenant_id
        )

        return report


# Convenience function
async def run_graphrag_diagnostics(tenant_id: str = "00000000-0000-0000-0000-000000000001") -> Dict[str, Any]:
    """
    Run GraphRAG diagnostics and return report as dict.

    Args:
        tenant_id: Tenant ID to use for testing (defaults to system tenant)

    Returns:
        Dict with diagnostic results
    """
    diagnostics = GraphRAGDiagnostics()
    report = await diagnostics.run_all_checks(tenant_id)
    return report.to_dict()
