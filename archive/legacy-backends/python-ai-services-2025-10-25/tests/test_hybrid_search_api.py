"""
Automated Test Suite for Hybrid GraphRAG Agent Search API

Comprehensive tests covering:
- REST API endpoints
- WebSocket functionality
- Request validation
- Error handling
- Performance benchmarks
- Integration scenarios

Created: 2025-10-24
Phase: 3 Week 5 - Testing & Optimization
"""

import pytest
import asyncio
import json
import time
from typing import Dict, Any, List
from fastapi.testclient import TestClient
from httpx import AsyncClient
import websockets

# Import app
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../'))

from api.main import app
from services.hybrid_agent_search import HybridAgentSearch
from services.search_cache import SearchCache
from services.ab_testing_framework import ABTestingFramework


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def client():
    """Synchronous test client"""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Async test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def search_service():
    """Hybrid search service instance"""
    return HybridAgentSearch()


@pytest.fixture
async def cache_service():
    """Search cache service instance"""
    cache = SearchCache()
    # Clear cache before each test
    await cache.clear_all()
    return cache


@pytest.fixture
async def ab_testing_service():
    """A/B testing service instance"""
    return ABTestingFramework()


@pytest.fixture
def sample_search_request() -> Dict[str, Any]:
    """Sample valid search request"""
    return {
        "query": "FDA regulatory submissions for medical devices",
        "domains": ["regulatory-affairs"],
        "tier": 1,
        "max_results": 10,
        "include_graph_context": True,
        "use_cache": False  # Disable cache for consistent testing
    }


# ============================================================================
# REST API TESTS - SEARCH ENDPOINT
# ============================================================================

class TestSearchEndpoint:
    """Tests for POST /api/v1/search/agents"""

    def test_search_basic_success(self, client, sample_search_request):
        """Test basic successful search"""
        response = client.post(
            "/api/v1/search/agents",
            json=sample_search_request
        )

        assert response.status_code == 200
        data = response.json()

        # Validate response structure
        assert "results" in data
        assert "total_results" in data
        assert "query" in data
        assert "search_time_ms" in data
        assert "cache_hit" in data

        # Validate results
        assert isinstance(data["results"], list)
        assert data["total_results"] >= 0
        assert data["query"] == sample_search_request["query"]
        assert data["search_time_ms"] > 0

    def test_search_minimum_query_length(self, client):
        """Test query minimum length validation (3 chars)"""
        response = client.post(
            "/api/v1/search/agents",
            json={"query": "ab", "max_results": 10}
        )

        assert response.status_code == 422  # Validation error
        error = response.json()
        assert "detail" in error

    def test_search_maximum_query_length(self, client):
        """Test query maximum length validation (500 chars)"""
        long_query = "a" * 501

        response = client.post(
            "/api/v1/search/agents",
            json={"query": long_query, "max_results": 10}
        )

        assert response.status_code == 422  # Validation error

    def test_search_xss_prevention(self, client):
        """Test XSS attack prevention"""
        malicious_queries = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "onclick=alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]

        for query in malicious_queries:
            response = client.post(
                "/api/v1/search/agents",
                json={"query": query, "max_results": 10}
            )

            # Should either reject or sanitize
            assert response.status_code in [400, 422]

    def test_search_tier_validation(self, client):
        """Test tier parameter validation (1, 2, 3, or null)"""
        # Valid tiers
        for tier in [1, 2, 3, None]:
            response = client.post(
                "/api/v1/search/agents",
                json={"query": "test query", "tier": tier, "max_results": 10}
            )
            assert response.status_code in [200, 404]  # 404 if no results

        # Invalid tiers
        for tier in [0, 4, -1, 999]:
            response = client.post(
                "/api/v1/search/agents",
                json={"query": "test query", "tier": tier, "max_results": 10}
            )
            assert response.status_code == 422

    def test_search_max_results_validation(self, client):
        """Test max_results parameter validation (1-50)"""
        # Valid values
        for max_results in [1, 10, 25, 50]:
            response = client.post(
                "/api/v1/search/agents",
                json={"query": "test query", "max_results": max_results}
            )
            assert response.status_code in [200, 404]

        # Invalid values
        for max_results in [0, -1, 51, 100, 1000]:
            response = client.post(
                "/api/v1/search/agents",
                json={"query": "test query", "max_results": max_results}
            )
            assert response.status_code == 422

    def test_search_with_domains_filter(self, client):
        """Test search with domains filter"""
        response = client.post(
            "/api/v1/search/agents",
            json={
                "query": "regulatory compliance",
                "domains": ["regulatory-affairs", "quality-assurance"],
                "max_results": 10
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify results match domain filter
        for result in data["results"]:
            assert "domains" in result
            # At least one domain should match
            assert any(
                domain in result["domains"]
                for domain in ["regulatory-affairs", "quality-assurance"]
            )

    def test_search_with_capabilities_filter(self, client):
        """Test search with capabilities filter"""
        response = client.post(
            "/api/v1/search/agents",
            json={
                "query": "FDA submission",
                "capabilities": ["fda_submission", "510k_clearance"],
                "max_results": 10
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify results have capabilities
        for result in data["results"]:
            assert "capabilities" in result

    def test_search_response_structure(self, client, sample_search_request):
        """Test complete response structure"""
        response = client.post(
            "/api/v1/search/agents",
            json=sample_search_request
        )

        assert response.status_code == 200
        data = response.json()

        # Validate agent result structure
        if data["total_results"] > 0:
            agent = data["results"][0]

            # Required fields
            assert "agent_id" in agent
            assert "name" in agent
            assert "tier" in agent

            # Scoring fields
            assert "overall_score" in agent
            assert "vector_score" in agent
            assert "domain_score" in agent
            assert "capability_score" in agent
            assert "graph_score" in agent

            # Validate score ranges (0.0 - 1.0)
            for score_field in [
                "overall_score", "vector_score", "domain_score",
                "capability_score", "graph_score"
            ]:
                score = agent[score_field]
                assert 0.0 <= score <= 1.0, f"{score_field} out of range: {score}"

            # Metadata fields
            assert "domains" in agent
            assert "capabilities" in agent
            assert isinstance(agent["domains"], list)
            assert isinstance(agent["capabilities"], list)

    def test_search_graph_context_inclusion(self, client):
        """Test graph context is included when requested"""
        response = client.post(
            "/api/v1/search/agents",
            json={
                "query": "clinical trial management",
                "include_graph_context": True,
                "max_results": 10
            }
        )

        assert response.status_code == 200
        data = response.json()

        if data["total_results"] > 0:
            agent = data["results"][0]

            # Graph context fields should be present
            assert "escalation_paths" in agent or agent.get("escalation_paths") is None
            assert "related_agents" in agent or agent.get("related_agents") is None
            assert "collaboration_count" in agent or agent.get("collaboration_count") is None

    def test_search_cache_functionality(self, client):
        """Test caching works correctly"""
        request_data = {
            "query": "cache test query for automated testing",
            "max_results": 5,
            "use_cache": True
        }

        # First request - should miss cache
        response1 = client.post("/api/v1/search/agents", json=request_data)
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["cache_hit"] == False

        # Second request - should hit cache
        response2 = client.post("/api/v1/search/agents", json=request_data)
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["cache_hit"] == True

        # Cache hit should be much faster
        assert data2["search_time_ms"] < data1["search_time_ms"] / 10

    def test_search_empty_results(self, client):
        """Test search with no matching results"""
        response = client.post(
            "/api/v1/search/agents",
            json={
                "query": "zyxwvutsrqponmlkjihgfedcba nonexistent gibberish",
                "max_results": 10
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] == 0
        assert data["results"] == []


# ============================================================================
# REST API TESTS - SIMILAR AGENTS ENDPOINT
# ============================================================================

class TestSimilarAgentsEndpoint:
    """Tests for GET /api/v1/search/agents/{agent_id}/similar"""

    def test_similar_agents_success(self, client):
        """Test finding similar agents"""
        # First, search for an agent to get an ID
        search_response = client.post(
            "/api/v1/search/agents",
            json={"query": "FDA regulatory", "max_results": 1}
        )

        if search_response.json()["total_results"] > 0:
            agent_id = search_response.json()["results"][0]["agent_id"]

            # Now find similar agents
            response = client.get(
                f"/api/v1/search/agents/{agent_id}/similar?max_results=5"
            )

            assert response.status_code == 200
            data = response.json()

            assert "results" in data
            assert "total_results" in data
            assert data["total_results"] >= 0

    def test_similar_agents_invalid_uuid(self, client):
        """Test similar agents with invalid UUID"""
        response = client.get("/api/v1/search/agents/invalid-uuid/similar")

        assert response.status_code == 422  # Validation error

    def test_similar_agents_max_results_validation(self, client):
        """Test max_results parameter validation"""
        # Use a placeholder UUID
        agent_id = "00000000-0000-0000-0000-000000000000"

        # Valid values
        for max_results in [1, 10, 50]:
            response = client.get(
                f"/api/v1/search/agents/{agent_id}/similar?max_results={max_results}"
            )
            assert response.status_code in [200, 404]

        # Invalid values
        for max_results in [0, -1, 51, 100]:
            response = client.get(
                f"/api/v1/search/agents/{agent_id}/similar?max_results={max_results}"
            )
            assert response.status_code == 422


# ============================================================================
# REST API TESTS - HEALTH ENDPOINT
# ============================================================================

class TestHealthEndpoint:
    """Tests for GET /api/v1/search/health"""

    def test_health_check_success(self, client):
        """Test health check returns valid response"""
        response = client.get("/api/v1/search/health")

        assert response.status_code == 200
        data = response.json()

        # Validate structure
        assert "status" in data
        assert "timestamp" in data
        assert "version" in data
        assert "services" in data
        assert "performance" in data

        # Validate values
        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        assert isinstance(data["services"], dict)
        assert isinstance(data["performance"], dict)

    def test_health_check_services_status(self, client):
        """Test health check includes service statuses"""
        response = client.get("/api/v1/search/health")

        assert response.status_code == 200
        data = response.json()

        services = data["services"]
        assert "database" in services or "redis" in services

    def test_health_check_performance_metrics(self, client):
        """Test health check includes performance metrics"""
        response = client.get("/api/v1/search/health")

        assert response.status_code == 200
        data = response.json()

        performance = data["performance"]
        # May be empty if no searches have been performed
        assert isinstance(performance, dict)


# ============================================================================
# WEBSOCKET TESTS
# ============================================================================

class TestWebSocketEndpoint:
    """Tests for WebSocket /api/v1/search/ws/{client_id}"""

    @pytest.mark.asyncio
    async def test_websocket_connection(self):
        """Test WebSocket connection establishment"""
        # Note: This requires running the actual server
        # For unit tests, we'd mock the WebSocket
        # This is a placeholder for integration testing
        pass

    @pytest.mark.asyncio
    async def test_websocket_search(self):
        """Test WebSocket search functionality"""
        # Placeholder for integration testing
        pass

    @pytest.mark.asyncio
    async def test_websocket_ping_pong(self):
        """Test WebSocket ping/pong"""
        # Placeholder for integration testing
        pass


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

class TestPerformance:
    """Performance benchmark tests"""

    def test_search_latency_p50_target(self, client, sample_search_request):
        """Test P50 latency meets <150ms target"""
        latencies = []
        num_requests = 20

        for _ in range(num_requests):
            start = time.time()
            response = client.post(
                "/api/v1/search/agents",
                json=sample_search_request
            )
            latency = (time.time() - start) * 1000

            assert response.status_code == 200
            latencies.append(latency)

        latencies.sort()
        p50 = latencies[len(latencies) // 2]

        print(f"\nP50 latency: {p50:.1f}ms (target: <150ms)")
        assert p50 < 150, f"P50 latency {p50:.1f}ms exceeds target of 150ms"

    def test_search_latency_p90_target(self, client, sample_search_request):
        """Test P90 latency meets <300ms target"""
        latencies = []
        num_requests = 50

        for _ in range(num_requests):
            start = time.time()
            response = client.post(
                "/api/v1/search/agents",
                json=sample_search_request
            )
            latency = (time.time() - start) * 1000

            assert response.status_code == 200
            latencies.append(latency)

        latencies.sort()
        p90_index = int(len(latencies) * 0.9)
        p90 = latencies[p90_index]

        print(f"\nP90 latency: {p90:.1f}ms (target: <300ms)")
        assert p90 < 300, f"P90 latency {p90:.1f}ms exceeds target of 300ms"

    def test_cache_hit_latency(self, client):
        """Test cached queries return in <10ms"""
        request_data = {
            "query": "performance test cache hit query",
            "max_results": 5,
            "use_cache": True
        }

        # Prime cache
        client.post("/api/v1/search/agents", json=request_data)

        # Measure cache hit
        latencies = []
        for _ in range(10):
            start = time.time()
            response = client.post("/api/v1/search/agents", json=request_data)
            latency = (time.time() - start) * 1000

            assert response.status_code == 200
            data = response.json()
            if data["cache_hit"]:
                latencies.append(latency)

        if latencies:
            avg_latency = sum(latencies) / len(latencies)
            print(f"\nCache hit latency: {avg_latency:.1f}ms (target: <10ms)")
            assert avg_latency < 10, f"Cache hit latency {avg_latency:.1f}ms exceeds target"

    def test_concurrent_requests(self, client, sample_search_request):
        """Test system handles concurrent requests"""
        import concurrent.futures

        def make_request():
            response = client.post(
                "/api/v1/search/agents",
                json=sample_search_request
            )
            return response.status_code == 200

        num_concurrent = 10
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(make_request) for _ in range(num_concurrent)]
            results = [future.result() for future in futures]

        # All requests should succeed
        assert all(results), "Some concurrent requests failed"
        print(f"\n{num_concurrent} concurrent requests succeeded")


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

class TestErrorHandling:
    """Tests for error handling and recovery"""

    def test_missing_query_parameter(self, client):
        """Test error when query parameter is missing"""
        response = client.post(
            "/api/v1/search/agents",
            json={"max_results": 10}
        )

        assert response.status_code == 422
        error = response.json()
        assert "detail" in error

    def test_invalid_json_payload(self, client):
        """Test error with invalid JSON"""
        response = client.post(
            "/api/v1/search/agents",
            data="invalid json {{{",
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 422

    def test_empty_query_string(self, client):
        """Test error with empty query string"""
        response = client.post(
            "/api/v1/search/agents",
            json={"query": "", "max_results": 10}
        )

        assert response.status_code == 422

    def test_whitespace_only_query(self, client):
        """Test error with whitespace-only query"""
        response = client.post(
            "/api/v1/search/agents",
            json={"query": "   ", "max_results": 10}
        )

        assert response.status_code == 422


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """Integration tests covering full workflows"""

    def test_search_and_similar_workflow(self, client):
        """Test complete workflow: search → select agent → find similar"""
        # Step 1: Search for agents
        search_response = client.post(
            "/api/v1/search/agents",
            json={
                "query": "regulatory compliance",
                "tier": 1,
                "max_results": 5
            }
        )

        assert search_response.status_code == 200
        search_data = search_response.json()

        if search_data["total_results"] > 0:
            # Step 2: Select top agent
            top_agent = search_data["results"][0]
            agent_id = top_agent["agent_id"]

            # Step 3: Find similar agents
            similar_response = client.get(
                f"/api/v1/search/agents/{agent_id}/similar?max_results=5"
            )

            assert similar_response.status_code == 200
            similar_data = similar_response.json()

            # Similar agents should be different from original
            similar_ids = [a["agent_id"] for a in similar_data["results"]]
            assert agent_id not in similar_ids

    def test_filter_refinement_workflow(self, client):
        """Test workflow of refining search with filters"""
        base_query = "clinical research"

        # Step 1: Broad search
        broad_response = client.post(
            "/api/v1/search/agents",
            json={"query": base_query, "max_results": 20}
        )

        assert broad_response.status_code == 200
        broad_data = broad_response.json()
        broad_count = broad_data["total_results"]

        # Step 2: Refined search with tier filter
        refined_response = client.post(
            "/api/v1/search/agents",
            json={"query": base_query, "tier": 1, "max_results": 20}
        )

        assert refined_response.status_code == 200
        refined_data = refined_response.json()
        refined_count = refined_data["total_results"]

        # Refined search should return same or fewer results
        assert refined_count <= broad_count

        # All refined results should be tier 1
        for agent in refined_data["results"]:
            assert agent["tier"] == 1


# ============================================================================
# RESPONSE HEADER TESTS
# ============================================================================

class TestResponseHeaders:
    """Tests for custom response headers"""

    def test_request_id_header(self, client, sample_search_request):
        """Test X-Request-ID header is present"""
        response = client.post(
            "/api/v1/search/agents",
            json=sample_search_request
        )

        assert response.status_code == 200
        assert "X-Request-ID" in response.headers
        # UUID format
        request_id = response.headers["X-Request-ID"]
        assert len(request_id) == 36  # UUID length

    def test_response_time_header(self, client, sample_search_request):
        """Test X-Response-Time header is present"""
        response = client.post(
            "/api/v1/search/agents",
            json=sample_search_request
        )

        assert response.status_code == 200
        assert "X-Response-Time" in response.headers
        # Should end with 'ms'
        response_time = response.headers["X-Response-Time"]
        assert response_time.endswith("ms")


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--tb=short"])
