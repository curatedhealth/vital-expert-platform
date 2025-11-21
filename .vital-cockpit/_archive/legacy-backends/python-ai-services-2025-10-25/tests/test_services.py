"""
Unit Tests for Hybrid Search Services

Tests for core service layer components:
- HybridAgentSearch
- SearchCache
- ABTestingFramework
- GraphRelationshipBuilder

Created: 2025-10-24
Phase: 3 Week 5 - Testing & Optimization
"""

import pytest
import asyncio
import time
from typing import Dict, Any, List
from unittest.mock import Mock, patch, AsyncMock

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../'))

from services.hybrid_agent_search import HybridAgentSearch
from services.search_cache import SearchCache
from services.ab_testing_framework import ABTestingFramework
from services.graph_relationship_builder import GraphRelationshipBuilder


# ============================================================================
# HYBRID AGENT SEARCH TESTS
# ============================================================================

class TestHybridAgentSearch:
    """Tests for HybridAgentSearch service"""

    @pytest.fixture
    async def search_service(self):
        """Create search service instance"""
        return HybridAgentSearch()

    @pytest.mark.asyncio
    async def test_scoring_weights_sum_to_one(self, search_service):
        """Test that scoring weights sum to 1.0"""
        weights = search_service.weights
        total = sum(weights.values())

        assert abs(total - 1.0) < 0.001, f"Weights sum to {total}, expected 1.0"

    @pytest.mark.asyncio
    async def test_scoring_weights_all_positive(self, search_service):
        """Test that all scoring weights are positive"""
        weights = search_service.weights

        for key, value in weights.items():
            assert value > 0, f"Weight '{key}' is not positive: {value}"
            assert value < 1.0, f"Weight '{key}' is >= 1.0: {value}"

    @pytest.mark.asyncio
    async def test_calculate_overall_score(self, search_service):
        """Test overall score calculation"""
        scores = {
            "vector": 0.90,
            "domain": 0.80,
            "capability": 0.70,
            "graph": 0.60
        }

        overall = search_service._calculate_overall_score(scores)

        # With weights 60/25/10/5:
        # 0.90*0.60 + 0.80*0.25 + 0.70*0.10 + 0.60*0.05 = 0.54 + 0.20 + 0.07 + 0.03 = 0.84
        expected = (
            scores["vector"] * search_service.weights["vector"] +
            scores["domain"] * search_service.weights["domain"] +
            scores["capability"] * search_service.weights["capability"] +
            scores["graph"] * search_service.weights["graph"]
        )

        assert abs(overall - expected) < 0.001

    @pytest.mark.asyncio
    async def test_calculate_overall_score_range(self, search_service):
        """Test overall score is always 0.0-1.0"""
        test_cases = [
            {"vector": 0.0, "domain": 0.0, "capability": 0.0, "graph": 0.0},
            {"vector": 1.0, "domain": 1.0, "capability": 1.0, "graph": 1.0},
            {"vector": 0.5, "domain": 0.5, "capability": 0.5, "graph": 0.5},
            {"vector": 0.2, "domain": 0.8, "capability": 0.3, "graph": 0.9}
        ]

        for scores in test_cases:
            overall = search_service._calculate_overall_score(scores)
            assert 0.0 <= overall <= 1.0, f"Score {overall} out of range for {scores}"

    @pytest.mark.asyncio
    async def test_search_query_validation(self, search_service):
        """Test search query validation"""
        # Empty query
        with pytest.raises((ValueError, AssertionError)):
            await search_service.search(query="", max_results=10)

        # Too short query (if minimum enforced)
        # Implementation may handle this gracefully
        try:
            result = await search_service.search(query="ab", max_results=10)
            # If no error, check it returns empty or minimal results
            assert isinstance(result, list)
        except ValueError:
            pass  # Expected if minimum length enforced

    @pytest.mark.asyncio
    async def test_search_max_results_limit(self, search_service):
        """Test max_results parameter is respected"""
        for max_results in [1, 5, 10, 20]:
            results = await search_service.search(
                query="test query",
                max_results=max_results
            )

            assert len(results) <= max_results, \
                f"Returned {len(results)} results, expected max {max_results}"

    @pytest.mark.asyncio
    async def test_search_tier_filter(self, search_service):
        """Test tier filtering works correctly"""
        for tier in [1, 2, 3]:
            results = await search_service.search(
                query="test query",
                tier=tier,
                max_results=10
            )

            # All results should match the tier filter
            for result in results:
                assert result.get("tier") == tier, \
                    f"Result has tier {result.get('tier')}, expected {tier}"

    @pytest.mark.asyncio
    async def test_search_domain_filter(self, search_service):
        """Test domain filtering works correctly"""
        domains = ["regulatory-affairs", "clinical-research"]

        results = await search_service.search(
            query="test query",
            domains=domains,
            max_results=10
        )

        # All results should have at least one matching domain
        for result in results:
            result_domains = result.get("domains", [])
            assert any(d in result_domains for d in domains), \
                f"Result domains {result_domains} don't match filter {domains}"


# ============================================================================
# SEARCH CACHE TESTS
# ============================================================================

class TestSearchCache:
    """Tests for SearchCache service"""

    @pytest.fixture
    async def cache_service(self):
        """Create cache service instance"""
        cache = SearchCache()
        await cache.clear_all()
        return cache

    @pytest.mark.asyncio
    async def test_cache_set_and_get(self, cache_service):
        """Test basic cache set and get"""
        query = "test cache query"
        results = {"results": [{"agent_id": "123", "name": "Test Agent"}]}

        # Set cache
        await cache_service.set_search_results(query, results)

        # Get cache
        cached = await cache_service.get_search_results(query)

        assert cached is not None
        assert cached == results

    @pytest.mark.asyncio
    async def test_cache_miss(self, cache_service):
        """Test cache miss returns None"""
        cached = await cache_service.get_search_results("nonexistent query")

        assert cached is None

    @pytest.mark.asyncio
    async def test_cache_with_filters(self, cache_service):
        """Test cache with filters creates different keys"""
        query = "test query"
        results1 = {"results": [{"agent_id": "1"}]}
        results2 = {"results": [{"agent_id": "2"}]}

        filters1 = {"tier": 1}
        filters2 = {"tier": 2}

        # Set cache with different filters
        await cache_service.set_search_results(query, results1, filters=filters1)
        await cache_service.set_search_results(query, results2, filters=filters2)

        # Get cache with different filters
        cached1 = await cache_service.get_search_results(query, filters=filters1)
        cached2 = await cache_service.get_search_results(query, filters=filters2)

        assert cached1 != cached2
        assert cached1 == results1
        assert cached2 == results2

    @pytest.mark.asyncio
    async def test_cache_ttl(self, cache_service):
        """Test cache TTL expiration"""
        query = "ttl test query"
        results = {"results": []}

        # Set cache with 1 second TTL
        await cache_service.set_search_results(query, results, ttl=1)

        # Immediately get - should hit
        cached = await cache_service.get_search_results(query)
        assert cached is not None

        # Wait for expiration
        await asyncio.sleep(1.5)

        # Get again - should miss
        cached = await cache_service.get_search_results(query)
        assert cached is None

    @pytest.mark.asyncio
    async def test_cache_clear(self, cache_service):
        """Test cache clear removes all entries"""
        # Set multiple cache entries
        for i in range(5):
            await cache_service.set_search_results(
                f"query {i}",
                {"results": []}
            )

        # Clear cache
        await cache_service.clear_all()

        # All should be gone
        for i in range(5):
            cached = await cache_service.get_search_results(f"query {i}")
            assert cached is None

    @pytest.mark.asyncio
    async def test_embedding_cache(self, cache_service):
        """Test embedding caching"""
        text = "test text for embedding"
        embedding = [0.1, 0.2, 0.3] * 512  # 1536 dimensions

        # Set embedding cache
        await cache_service.set_embedding(text, embedding)

        # Get embedding cache
        cached = await cache_service.get_embedding(text)

        assert cached is not None
        assert cached == embedding

    @pytest.mark.asyncio
    async def test_cache_stats(self, cache_service):
        """Test cache statistics tracking"""
        # Perform some cache operations
        await cache_service.set_search_results("query1", {"results": []})
        await cache_service.get_search_results("query1")  # Hit
        await cache_service.get_search_results("query2")  # Miss

        # Get stats
        stats = await cache_service.get_cache_stats()

        assert isinstance(stats, dict)
        assert "total_requests" in stats or "hit_rate" in stats


# ============================================================================
# A/B TESTING FRAMEWORK TESTS
# ============================================================================

class TestABTestingFramework:
    """Tests for ABTestingFramework service"""

    @pytest.fixture
    async def ab_testing_service(self):
        """Create A/B testing service instance"""
        return ABTestingFramework()

    @pytest.mark.asyncio
    async def test_create_experiment(self, ab_testing_service):
        """Test experiment creation"""
        experiment = await ab_testing_service.create_experiment(
            experiment_id="test_exp_001",
            name="Test Experiment",
            variants=[
                {"name": "control", "allocation": 0.5},
                {"name": "treatment", "allocation": 0.5}
            ]
        )

        assert experiment is not None
        assert experiment.experiment_id == "test_exp_001"
        assert experiment.name == "Test Experiment"
        assert len(experiment.variants) == 2

    @pytest.mark.asyncio
    async def test_variant_allocation_sums_to_one(self, ab_testing_service):
        """Test variant allocations sum to 1.0"""
        # Valid allocation
        experiment = await ab_testing_service.create_experiment(
            experiment_id="test_allocation_001",
            name="Allocation Test",
            variants=[
                {"name": "a", "allocation": 0.33},
                {"name": "b", "allocation": 0.33},
                {"name": "c", "allocation": 0.34}
            ]
        )

        total_allocation = sum(v.allocation for v in experiment.variants)
        assert abs(total_allocation - 1.0) < 0.001

    @pytest.mark.asyncio
    async def test_variant_allocation_validation(self, ab_testing_service):
        """Test invalid variant allocations are rejected"""
        # Allocation > 1.0
        with pytest.raises((ValueError, AssertionError)):
            await ab_testing_service.create_experiment(
                experiment_id="test_invalid_001",
                name="Invalid Allocation",
                variants=[
                    {"name": "a", "allocation": 0.7},
                    {"name": "b", "allocation": 0.7}  # Total = 1.4
                ]
            )

    @pytest.mark.asyncio
    async def test_user_assignment_consistency(self, ab_testing_service):
        """Test same user gets same variant consistently"""
        experiment = await ab_testing_service.create_experiment(
            experiment_id="test_consistency_001",
            name="Consistency Test",
            variants=[
                {"name": "control", "allocation": 0.5},
                {"name": "treatment", "allocation": 0.5}
            ]
        )

        user_id = "test_user_123"

        # Assign user multiple times
        assignments = []
        for _ in range(10):
            variant = await ab_testing_service.assign_user_to_experiment(
                experiment_id="test_consistency_001",
                user_id=user_id
            )
            assignments.append(variant.name)

        # All assignments should be the same
        assert len(set(assignments)) == 1, \
            f"Inconsistent assignments: {set(assignments)}"

    @pytest.mark.asyncio
    async def test_variant_distribution(self, ab_testing_service):
        """Test variant distribution matches allocation"""
        experiment = await ab_testing_service.create_experiment(
            experiment_id="test_distribution_001",
            name="Distribution Test",
            variants=[
                {"name": "control", "allocation": 0.5},
                {"name": "treatment", "allocation": 0.5}
            ]
        )

        # Assign many users
        num_users = 1000
        assignments = {"control": 0, "treatment": 0}

        for i in range(num_users):
            variant = await ab_testing_service.assign_user_to_experiment(
                experiment_id="test_distribution_001",
                user_id=f"user_{i}"
            )
            assignments[variant.name] += 1

        # Check distribution is roughly 50/50 (within 10%)
        control_pct = assignments["control"] / num_users
        treatment_pct = assignments["treatment"] / num_users

        assert 0.40 <= control_pct <= 0.60, \
            f"Control allocation {control_pct:.2%} outside expected range"
        assert 0.40 <= treatment_pct <= 0.60, \
            f"Treatment allocation {treatment_pct:.2%} outside expected range"

    @pytest.mark.asyncio
    async def test_track_event(self, ab_testing_service):
        """Test event tracking"""
        experiment = await ab_testing_service.create_experiment(
            experiment_id="test_events_001",
            name="Event Tracking Test",
            variants=[
                {"name": "control", "allocation": 0.5},
                {"name": "treatment", "allocation": 0.5}
            ]
        )

        user_id = "test_user_456"

        # Assign user
        await ab_testing_service.assign_user_to_experiment(
            experiment_id="test_events_001",
            user_id=user_id
        )

        # Track event
        event = await ab_testing_service.track_event(
            experiment_id="test_events_001",
            user_id=user_id,
            event_type="conversion",
            event_properties={"value": 100}
        )

        assert event is not None
        assert event.event_type == "conversion"


# ============================================================================
# GRAPH RELATIONSHIP BUILDER TESTS
# ============================================================================

class TestGraphRelationshipBuilder:
    """Tests for GraphRelationshipBuilder service"""

    @pytest.fixture
    async def graph_builder(self):
        """Create graph builder instance"""
        return GraphRelationshipBuilder()

    @pytest.mark.asyncio
    async def test_keyword_extraction(self, graph_builder):
        """Test keyword extraction from agent metadata"""
        metadata = {
            "description": "Expert in FDA regulatory submissions and 510k clearance",
            "capabilities": ["fda_submission", "510k_clearance", "regulatory_strategy"]
        }

        keywords = graph_builder._extract_keywords(metadata)

        assert isinstance(keywords, set)
        assert len(keywords) > 0
        # Should contain important terms
        assert any(kw in keywords for kw in ["fda", "regulatory", "510k"])

    @pytest.mark.asyncio
    async def test_domain_similarity_calculation(self, graph_builder):
        """Test domain similarity calculation"""
        domains1 = ["regulatory-affairs", "quality-assurance"]
        domains2 = ["regulatory-affairs", "clinical-research"]
        domains3 = ["marketing", "sales"]

        # High similarity (1 overlap out of 2)
        sim1_2 = graph_builder._calculate_domain_similarity(domains1, domains2)
        assert sim1_2 > 0.3

        # Low similarity (no overlap)
        sim1_3 = graph_builder._calculate_domain_similarity(domains1, domains3)
        assert sim1_3 == 0.0

    @pytest.mark.asyncio
    async def test_escalation_priority_calculation(self, graph_builder):
        """Test escalation priority calculation"""
        # Tier 3 → Tier 1 with high domain overlap
        priority = graph_builder._calculate_escalation_priority(
            from_tier=3,
            to_tier=1,
            domain_overlap=0.8
        )

        # Should be high priority (tier difference + domain overlap)
        assert priority > 5

        # Same tier, low domain overlap
        priority_low = graph_builder._calculate_escalation_priority(
            from_tier=2,
            to_tier=2,
            domain_overlap=0.1
        )

        # Should be lower priority
        assert priority_low < priority


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestServiceIntegration:
    """Integration tests across multiple services"""

    @pytest.mark.asyncio
    async def test_search_with_caching_integration(self):
        """Test search service integrated with caching"""
        search_service = HybridAgentSearch()
        cache_service = SearchCache()

        query = "integration test query"
        max_results = 5

        # First search - should populate cache
        results1 = await search_service.search(
            query=query,
            max_results=max_results
        )

        # Cache the results
        await cache_service.set_search_results(
            query=query,
            results={"results": results1}
        )

        # Get from cache
        cached = await cache_service.get_search_results(query)

        assert cached is not None
        assert len(cached["results"]) == len(results1)

    @pytest.mark.asyncio
    async def test_search_with_ab_testing_integration(self):
        """Test search service integrated with A/B testing"""
        search_service = HybridAgentSearch()
        ab_testing = ABTestingFramework()

        # Create experiment
        experiment = await ab_testing.create_experiment(
            experiment_id="search_weights_test",
            name="Search Weights Experiment",
            variants=[
                {"name": "control", "allocation": 0.5, "config": {"weights": "60/25/10/5"}},
                {"name": "treatment", "allocation": 0.5, "config": {"weights": "70/20/5/5"}}
            ]
        )

        # Assign user
        user_id = "test_user_789"
        variant = await ab_testing.assign_user_to_experiment(
            experiment_id="search_weights_test",
            user_id=user_id
        )

        assert variant.name in ["control", "treatment"]

        # Perform search (would use variant's weights in production)
        results = await search_service.search(
            query="test query",
            max_results=10
        )

        # Track conversion
        if len(results) > 0:
            await ab_testing.track_event(
                experiment_id="search_weights_test",
                user_id=user_id,
                event_type="search_success",
                event_properties={"results_count": len(results)}
            )


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s", "--tb=short"])
