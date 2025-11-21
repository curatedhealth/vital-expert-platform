"""
Hybrid Search Performance Benchmarks

Tests performance of hybrid agent search with real database queries.

Targets:
- Embedding generation: <200ms P90
- Hybrid search query: <100ms P90
- Total search latency: <300ms P90
- Accuracy: 85-95% vs baseline

Run with: pytest tests/test_hybrid_search_performance.py -v --benchmark-only
"""

import pytest
import asyncio
import time
import numpy as np
from typing import List, Dict, Any
from unittest.mock import AsyncMock, patch

from services.hybrid_agent_search import HybridAgentSearch, AgentSearchResult


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def search_service():
    """Create hybrid search service instance"""
    return HybridAgentSearch()


@pytest.fixture
def sample_queries() -> List[str]:
    """Sample queries for testing"""
    return [
        "What are the FDA requirements for 510(k) premarket notification?",
        "How do I design a Phase III clinical trial for cardiovascular devices?",
        "What are the statistical methods for non-inferiority trials?",
        "What are the regulatory requirements for medical device manufacturing?",
        "How do I assess cardiovascular risk in clinical practice?",
        "What are the endpoints for heart failure clinical trials?",
        "What are the quality system regulations for medical devices?",
        "How do I conduct a systematic literature review?",
        "What are the biostatistics requirements for clinical trials?",
        "What are the compliance requirements for HIPAA?"
    ]


# ============================================================================
# EMBEDDING GENERATION BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestEmbeddingGenerationPerformance:
    """Benchmark embedding generation performance"""

    async def test_embedding_generation_latency_target_200ms(
        self,
        search_service,
        sample_queries
    ):
        """Test: Embedding generation should be <200ms P90"""

        await search_service.connect()

        try:
            latencies = []

            # Generate embeddings for all sample queries
            for query in sample_queries:
                start = time.perf_counter()
                await search_service.embeddings.aembed_query(query)
                latency_ms = (time.perf_counter() - start) * 1000
                latencies.append(latency_ms)

            # Calculate percentiles
            p50 = np.percentile(latencies, 50)
            p90 = np.percentile(latencies, 90)
            p99 = np.percentile(latencies, 99)
            mean = np.mean(latencies)

            print(f"\n=== Embedding Generation Latency ===")
            print(f"Queries:   {len(latencies)}")
            print(f"Mean:      {mean:.2f}ms")
            print(f"P50:       {p50:.2f}ms")
            print(f"P90:       {p90:.2f}ms")
            print(f"P99:       {p99:.2f}ms")
            print(f"Target:    <200ms P90")
            print(f"Status:    {'✓ PASS' if p90 < 200 else '✗ FAIL'}")

            # Assertions
            assert p90 < 200.0, f"P90 {p90:.2f}ms exceeds 200ms target"

        finally:
            await search_service.close()


# ============================================================================
# HYBRID SEARCH QUERY BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestHybridSearchQueryPerformance:
    """Benchmark hybrid search SQL query performance"""

    async def test_hybrid_search_end_to_end_latency_target_300ms(
        self,
        search_service,
        sample_queries
    ):
        """Test: Complete hybrid search should be <300ms P90"""

        await search_service.connect()

        try:
            latencies = []

            # Execute hybrid searches
            for query in sample_queries:
                start = time.perf_counter()
                results = await search_service.search(
                    query=query,
                    max_results=10
                )
                latency_ms = (time.perf_counter() - start) * 1000
                latencies.append(latency_ms)

                # Verify we got results
                assert len(results) > 0, f"No results for query: {query}"

            # Calculate percentiles
            p50 = np.percentile(latencies, 50)
            p90 = np.percentile(latencies, 90)
            p99 = np.percentile(latencies, 99)
            mean = np.mean(latencies)
            min_lat = np.min(latencies)
            max_lat = np.max(latencies)

            print(f"\n=== Hybrid Search End-to-End Latency ===")
            print(f"Queries:   {len(latencies)}")
            print(f"Min:       {min_lat:.2f}ms")
            print(f"Mean:      {mean:.2f}ms")
            print(f"P50:       {p50:.2f}ms")
            print(f"P90:       {p90:.2f}ms")
            print(f"P99:       {p99:.2f}ms")
            print(f"Max:       {max_lat:.2f}ms")
            print(f"Target:    <300ms P90")
            print(f"Status:    {'✓ PASS' if p90 < 300 else '✗ FAIL'}")

            # Assertions
            assert p90 < 300.0, f"P90 {p90:.2f}ms exceeds 300ms target"

        finally:
            await search_service.close()

    async def test_hybrid_search_with_filters_latency(
        self,
        search_service
    ):
        """Test: Hybrid search with domain/capability filters"""

        await search_service.connect()

        try:
            query = "What are FDA regulatory requirements?"

            latencies = []
            for _ in range(20):
                start = time.perf_counter()
                results = await search_service.search(
                    query=query,
                    domains=["regulatory", "regulatory.fda"],
                    capabilities=["regulatory_submission", "quality_assurance"],
                    min_tier=1,
                    max_tier=2,
                    max_results=5
                )
                latency_ms = (time.perf_counter() - start) * 1000
                latencies.append(latency_ms)

                assert len(results) > 0

            p90 = np.percentile(latencies, 90)

            print(f"\n=== Hybrid Search with Filters ===")
            print(f"P90:       {p90:.2f}ms")
            print(f"Target:    <350ms P90")
            print(f"Status:    {'✓ PASS' if p90 < 350 else '✗ FAIL'}")

            assert p90 < 350.0, f"Filtered search P90 {p90:.2f}ms exceeds 350ms"

        finally:
            await search_service.close()


# ============================================================================
# THROUGHPUT BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestSearchThroughput:
    """Benchmark search throughput (queries per second)"""

    async def test_sequential_search_throughput(
        self,
        search_service,
        sample_queries
    ):
        """Test: Sequential search throughput"""

        await search_service.connect()

        try:
            start = time.perf_counter()

            for query in sample_queries:
                await search_service.search(query=query, max_results=5)

            elapsed = time.perf_counter() - start
            throughput = len(sample_queries) / elapsed

            print(f"\n=== Sequential Search Throughput ===")
            print(f"Queries:      {len(sample_queries)}")
            print(f"Time:         {elapsed:.2f}s")
            print(f"Throughput:   {throughput:.2f} queries/sec")
            print(f"Target:       >2 queries/sec")
            print(f"Status:       {'✓ PASS' if throughput > 2 else '✗ FAIL'}")

            assert throughput > 2.0, f"Throughput {throughput:.2f} qps below 2 qps target"

        finally:
            await search_service.close()

    async def test_concurrent_search_throughput(
        self,
        search_service,
        sample_queries
    ):
        """Test: Concurrent search throughput"""

        await search_service.connect()

        try:
            async def search_task(query: str):
                return await search_service.search(query=query, max_results=5)

            start = time.perf_counter()

            # Execute all searches concurrently
            results = await asyncio.gather(*[
                search_task(query) for query in sample_queries
            ])

            elapsed = time.perf_counter() - start
            throughput = len(sample_queries) / elapsed

            print(f"\n=== Concurrent Search Throughput ===")
            print(f"Queries:      {len(sample_queries)}")
            print(f"Time:         {elapsed:.2f}s")
            print(f"Throughput:   {throughput:.2f} queries/sec")
            print(f"Target:       >5 queries/sec")
            print(f"Status:       {'✓ PASS' if throughput > 5 else '✗ FAIL'}")

            # Verify all searches returned results
            assert all(len(r) > 0 for r in results)
            assert throughput > 5.0, f"Concurrent throughput {throughput:.2f} qps below 5 qps"

        finally:
            await search_service.close()


# ============================================================================
# SCALING BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.slow
@pytest.mark.asyncio
class TestScalingPerformance:
    """Test performance under increasing load"""

    async def test_load_scaling_100_queries(
        self,
        search_service,
        sample_queries
    ):
        """Test: Performance with 100 concurrent queries"""

        await search_service.connect()

        try:
            # Replicate queries to get 100 total
            all_queries = sample_queries * 10

            async def search_task(query: str):
                return await search_service.search(query=query, max_results=5)

            start = time.perf_counter()
            results = await asyncio.gather(*[
                search_task(query) for query in all_queries
            ])
            elapsed = time.perf_counter() - start

            throughput = len(all_queries) / elapsed
            avg_latency = (elapsed / len(all_queries)) * 1000

            print(f"\n=== Load Scaling (100 queries) ===")
            print(f"Total queries:    {len(all_queries)}")
            print(f"Total time:       {elapsed:.2f}s")
            print(f"Throughput:       {throughput:.2f} qps")
            print(f"Avg latency:      {avg_latency:.2f}ms")
            print(f"Target:           <10s total, >10 qps")
            print(f"Status:           {'✓ PASS' if elapsed < 10 and throughput > 10 else '✗ FAIL'}")

            assert elapsed < 10.0, f"100 queries took {elapsed:.2f}s, exceeds 10s"
            assert throughput > 10.0

        finally:
            await search_service.close()


# ============================================================================
# RESULT QUALITY BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestSearchResultQuality:
    """Benchmark search result quality and consistency"""

    async def test_result_consistency_across_runs(
        self,
        search_service
    ):
        """Test: Same query should return consistent results"""

        await search_service.connect()

        try:
            query = "What are FDA 510(k) requirements?"

            # Run search 5 times
            all_results = []
            for _ in range(5):
                results = await search_service.search(query=query, max_results=5)
                all_results.append(results)

            # Check consistency
            # Top result should be same agent across runs
            top_agents = [r[0].agent_id for r in all_results if r]

            unique_top_agents = len(set(top_agents))

            print(f"\n=== Result Consistency ===")
            print(f"Runs:                 5")
            print(f"Unique top agents:    {unique_top_agents}")
            print(f"Target:               <=2 (high consistency)")
            print(f"Status:               {'✓ PASS' if unique_top_agents <= 2 else '✗ FAIL'}")

            # Should have high consistency
            assert unique_top_agents <= 2, f"Top results vary too much: {unique_top_agents} different agents"

        finally:
            await search_service.close()

    async def test_score_distribution(
        self,
        search_service,
        sample_queries
    ):
        """Test: Hybrid scores should have good distribution"""

        await search_service.connect()

        try:
            all_scores = []

            for query in sample_queries:
                results = await search_service.search(query=query, max_results=10)
                all_scores.extend([r.hybrid_score for r in results])

            # Calculate score statistics
            min_score = np.min(all_scores)
            max_score = np.max(all_scores)
            mean_score = np.mean(all_scores)
            std_score = np.std(all_scores)

            print(f"\n=== Hybrid Score Distribution ===")
            print(f"Total results:    {len(all_scores)}")
            print(f"Min score:        {min_score:.4f}")
            print(f"Mean score:       {mean_score:.4f}")
            print(f"Std dev:          {std_score:.4f}")
            print(f"Max score:        {max_score:.4f}")
            print(f"Target:           Min >0.50, Mean >0.70")

            # Scores should be reasonable
            assert min_score > 0.50, f"Min score {min_score:.4f} too low"
            assert mean_score > 0.70, f"Mean score {mean_score:.4f} below 0.70"

        finally:
            await search_service.close()


# ============================================================================
# COMPONENT BREAKDOWN BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestComponentLatencyBreakdown:
    """Benchmark individual components of hybrid search"""

    async def test_vector_search_only_latency(
        self,
        search_service
    ):
        """Test: Pure vector search component"""

        await search_service.connect()

        try:
            query = "What are FDA requirements?"
            query_embedding = await search_service.embeddings.aembed_query(query)

            latencies = []
            for _ in range(20):
                start = time.perf_counter()

                # Execute pure vector search
                results = await search_service.db_pool.fetch("""
                    SELECT
                        ae.agent_id,
                        a.name AS agent_name,
                        (1 - (ae.embedding <=> $1::vector))::DECIMAL(5,4) AS similarity
                    FROM agent_embeddings ae
                    JOIN agents a ON ae.agent_id = a.id
                    WHERE
                        ae.embedding_type = 'agent_profile'
                        AND (1 - (ae.embedding <=> $1::vector)) >= 0.70
                        AND a.is_active = true
                    ORDER BY ae.embedding <=> $1::vector
                    LIMIT 10
                """, query_embedding)

                latency_ms = (time.perf_counter() - start) * 1000
                latencies.append(latency_ms)

            p90 = np.percentile(latencies, 90)

            print(f"\n=== Vector Search Component ===")
            print(f"P90:       {p90:.2f}ms")
            print(f"Target:    <50ms P90")
            print(f"Status:    {'✓ PASS' if p90 < 50 else '✗ FAIL'}")

            assert p90 < 50.0, f"Vector search P90 {p90:.2f}ms exceeds 50ms"

        finally:
            await search_service.close()

    async def test_graph_enrichment_latency(
        self,
        search_service
    ):
        """Test: Graph relationship enrichment latency"""

        await search_service.connect()

        try:
            # Get a sample agent ID
            agent_id = await search_service.db_pool.fetchval(
                "SELECT id FROM agents WHERE is_active = true LIMIT 1"
            )

            latencies = []
            for _ in range(20):
                start = time.perf_counter()

                # Get graph data
                stats = await search_service.get_agent_graph_stats(agent_id)

                latency_ms = (time.perf_counter() - start) * 1000
                latencies.append(latency_ms)

            p90 = np.percentile(latencies, 90)

            print(f"\n=== Graph Enrichment Component ===")
            print(f"P90:       {p90:.2f}ms")
            print(f"Target:    <30ms P90")
            print(f"Status:    {'✓ PASS' if p90 < 30 else '✗ FAIL'}")

            assert p90 < 30.0, f"Graph enrichment P90 {p90:.2f}ms exceeds 30ms"

        finally:
            await search_service.close()


# ============================================================================
# COMPARISON BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.asyncio
class TestHybridVsVectorComparison:
    """Compare hybrid search vs pure vector search"""

    async def test_hybrid_vs_vector_accuracy(
        self,
        search_service
    ):
        """Test: Hybrid should provide better relevance than vector alone"""

        await search_service.connect()

        try:
            # Domain-specific query that benefits from graph relationships
            query = "What are regulatory compliance requirements for medical devices?"

            # Hybrid search
            hybrid_results = await search_service.search(
                query=query,
                domains=["regulatory"],
                max_results=5
            )

            # Pure vector search (simulate by setting domain weight to 0)
            original_weights = search_service.weights.copy()
            search_service.weights = {
                "vector": 1.0,
                "domain": 0.0,
                "capability": 0.0,
                "graph": 0.0
            }

            vector_results = await search_service.search(
                query=query,
                max_results=5
            )

            # Restore weights
            search_service.weights = original_weights

            # Compare top results
            hybrid_top = hybrid_results[0] if hybrid_results else None
            vector_top = vector_results[0] if vector_results else None

            print(f"\n=== Hybrid vs Vector Comparison ===")
            print(f"Hybrid top agent:     {hybrid_top.agent_name if hybrid_top else 'None'}")
            print(f"Hybrid score:         {hybrid_top.hybrid_score if hybrid_top else 0:.4f}")
            print(f"Vector top agent:     {vector_top.agent_name if vector_top else 'None'}")
            print(f"Vector score:         {vector_top.hybrid_score if vector_top else 0:.4f}")

            # Hybrid should have better domain alignment
            if hybrid_top:
                assert len(hybrid_top.matched_domains) > 0, "Hybrid should match domains"

        finally:
            await search_service.close()
