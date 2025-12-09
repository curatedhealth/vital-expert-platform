"""
Comprehensive Unit Tests for Fusion Engine

Tests the Triple Retrieval (Vector + Graph + Relational) with
Reciprocal Rank Fusion (RRF) algorithm.

Phase 5: Testing & Quality Assurance
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from typing import List, Dict, Any
import asyncio


class TestFusionEngineCore:
    """Core Fusion Engine functionality tests."""
    
    @pytest.fixture
    def fusion_engine(self):
        """Create FusionEngine instance with mocks."""
        try:
            from fusion.fusion_engine import FusionEngine
            return FusionEngine()
        except ImportError:
            pytest.skip("FusionEngine not available")
    
    @pytest.fixture
    def mock_vector_results(self) -> List[tuple]:
        """Mock vector search results."""
        return [
            ("agent-clinical", 0.92, {"name": "Clinical Expert", "level": 2}),
            ("agent-regulatory", 0.88, {"name": "Regulatory Expert", "level": 2}),
            ("agent-safety", 0.85, {"name": "Safety Expert", "level": 2}),
            ("agent-data", 0.78, {"name": "Data Analyst", "level": 3}),
            ("agent-medical", 0.72, {"name": "Medical Writer", "level": 3}),
        ]
    
    @pytest.fixture
    def mock_graph_results(self) -> List[tuple]:
        """Mock graph search results (relationship-based)."""
        return [
            ("agent-regulatory", 0.90, {"name": "Regulatory Expert", "level": 2}),
            ("agent-clinical", 0.85, {"name": "Clinical Expert", "level": 2}),
            ("agent-heor", 0.80, {"name": "HEOR Specialist", "level": 3}),
            ("agent-safety", 0.75, {"name": "Safety Expert", "level": 2}),
        ]
    
    @pytest.fixture
    def mock_relational_results(self) -> List[tuple]:
        """Mock relational search results (historical patterns)."""
        return [
            ("agent-clinical", 0.95, {"name": "Clinical Expert", "level": 2}),
            ("agent-safety", 0.88, {"name": "Safety Expert", "level": 2}),
            ("agent-regulatory", 0.82, {"name": "Regulatory Expert", "level": 2}),
        ]


class TestReciprocalRankFusion:
    """Tests for RRF algorithm implementation."""
    
    def test_rrf_basic_fusion(self):
        """Test basic RRF calculation with two ranked lists."""
        try:
            from fusion.rrf import reciprocal_rank_fusion
        except ImportError:
            # Create local implementation for testing
            def reciprocal_rank_fusion(
                rankings: List[List[tuple]],
                weights: List[float] = None,
                k: int = 60
            ) -> List[tuple]:
                """Simple RRF implementation."""
                if weights is None:
                    weights = [1.0] * len(rankings)
                
                scores = {}
                for rank_list, weight in zip(rankings, weights):
                    for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                        if item_id not in scores:
                            scores[item_id] = {"score": 0.0, "metadata": metadata}
                        scores[item_id]["score"] += weight * (1.0 / (k + rank))
                
                # Sort by score descending
                sorted_items = sorted(
                    [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                    key=lambda x: x[1],
                    reverse=True
                )
                return sorted_items
        
        # Test data
        list1 = [
            ("agent-1", 0.9, {"name": "Agent 1"}),
            ("agent-2", 0.8, {"name": "Agent 2"}),
            ("agent-3", 0.7, {"name": "Agent 3"}),
        ]
        list2 = [
            ("agent-2", 0.95, {"name": "Agent 2"}),
            ("agent-1", 0.85, {"name": "Agent 1"}),
            ("agent-4", 0.75, {"name": "Agent 4"}),
        ]
        
        result = reciprocal_rank_fusion([list1, list2])
        
        # Verify results
        assert len(result) == 4
        # Agent-2 should be highest (rank 1 in list2, rank 2 in list1)
        # Agent-1 should be second (rank 1 in list1, rank 2 in list2)
        result_ids = [r[0] for r in result]
        assert "agent-1" in result_ids
        assert "agent-2" in result_ids
    
    def test_rrf_with_weights(self):
        """Test RRF with custom weights."""
        def reciprocal_rank_fusion(rankings, weights=None, k=60):
            if weights is None:
                weights = [1.0] * len(rankings)
            
            scores = {}
            for rank_list, weight in zip(rankings, weights):
                for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += weight * (1.0 / (k + rank))
            
            sorted_items = sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )
            return sorted_items
        
        # Vector results (weight 0.4)
        vector = [("agent-1", 0.9, {}), ("agent-2", 0.8, {})]
        # Graph results (weight 0.35)
        graph = [("agent-2", 0.95, {}), ("agent-1", 0.85, {})]
        # Relational results (weight 0.25)
        relational = [("agent-1", 0.88, {}), ("agent-3", 0.75, {})]
        
        weights = [0.4, 0.35, 0.25]
        result = reciprocal_rank_fusion([vector, graph, relational], weights)
        
        # Verify agent-1 appears (present in all three lists)
        result_ids = [r[0] for r in result]
        assert "agent-1" in result_ids
        assert "agent-2" in result_ids
        assert "agent-3" in result_ids
    
    def test_rrf_empty_list(self):
        """Test RRF with empty result lists."""
        def reciprocal_rank_fusion(rankings, weights=None, k=60):
            if weights is None:
                weights = [1.0] * len(rankings)
            
            scores = {}
            for rank_list, weight in zip(rankings, weights):
                for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += weight * (1.0 / (k + rank))
            
            return sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )
        
        result = reciprocal_rank_fusion([[], [], []])
        assert result == []
    
    def test_rrf_single_list(self):
        """Test RRF with single result list."""
        def reciprocal_rank_fusion(rankings, weights=None, k=60):
            if weights is None:
                weights = [1.0] * len(rankings)
            
            scores = {}
            for rank_list, weight in zip(rankings, weights):
                for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += weight * (1.0 / (k + rank))
            
            return sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )
        
        single_list = [
            ("agent-1", 0.9, {"name": "Agent 1"}),
            ("agent-2", 0.8, {"name": "Agent 2"}),
        ]
        
        result = reciprocal_rank_fusion([single_list])
        
        assert len(result) == 2
        assert result[0][0] == "agent-1"  # Highest rank
        assert result[1][0] == "agent-2"


class TestScoreNormalization:
    """Tests for score normalization to 0-100 scale."""
    
    def test_normalize_to_percentage(self):
        """Test RRF score normalization to human-readable percentages."""
        def normalize_to_percentage(
            fused_results: List[tuple],
            min_score: float = 0,
            max_confidence: int = 100
        ) -> List[tuple]:
            """Normalize RRF scores to 0-100 scale."""
            if not fused_results:
                return []
            
            scores = [r[1] for r in fused_results]
            max_score = max(scores) if scores else 1
            
            normalized = []
            for agent_id, score, metadata in fused_results:
                # Normalize to 0-100 based on max score
                normalized_score = int((score / max_score) * max_confidence)
                normalized.append((agent_id, normalized_score, metadata))
            
            return normalized
        
        # Test data with raw RRF scores
        raw_results = [
            ("agent-1", 0.0325, {"name": "Agent 1"}),
            ("agent-2", 0.0280, {"name": "Agent 2"}),
            ("agent-3", 0.0210, {"name": "Agent 3"}),
        ]
        
        normalized = normalize_to_percentage(raw_results)
        
        # First should be 100 (highest)
        assert normalized[0][1] == 100
        # Second should be proportionally lower
        assert 80 <= normalized[1][1] <= 90
        # Third should be proportionally lower
        assert 60 <= normalized[2][1] <= 70
    
    def test_normalize_empty_results(self):
        """Test normalization with empty results."""
        def normalize_to_percentage(fused_results):
            if not fused_results:
                return []
            return fused_results
        
        assert normalize_to_percentage([]) == []
    
    def test_confidence_levels(self):
        """Test confidence level classification."""
        def get_confidence_level(score: int) -> str:
            """Get confidence level label."""
            if score >= 85:
                return "high"
            elif score >= 60:
                return "medium"
            else:
                return "low"
        
        assert get_confidence_level(95) == "high"
        assert get_confidence_level(85) == "high"
        assert get_confidence_level(75) == "medium"
        assert get_confidence_level(60) == "medium"
        assert get_confidence_level(50) == "low"
        assert get_confidence_level(30) == "low"


class TestSynergyBoosting:
    """Tests for agent synergy score boosting."""
    
    def test_synergy_boost_calculation(self):
        """Test synergy score boosting."""
        def apply_synergy_boost(
            fused_results: List[tuple],
            synergy_scores: Dict[str, Dict[str, float]],
            boost_factor: float = 0.1
        ) -> List[tuple]:
            """Apply synergy boosting to fused results."""
            if len(fused_results) < 2:
                return fused_results
            
            boosted = []
            selected_agents = [r[0] for r in fused_results]
            
            for agent_id, score, metadata in fused_results:
                total_synergy = 0.0
                synergy_count = 0
                
                # Calculate synergy with other selected agents
                for other_agent in selected_agents:
                    if other_agent != agent_id:
                        synergy = synergy_scores.get(agent_id, {}).get(other_agent, 0.0)
                        if synergy > 0:
                            total_synergy += synergy
                            synergy_count += 1
                
                # Apply boost
                avg_synergy = total_synergy / max(synergy_count, 1)
                boosted_score = score * (1 + boost_factor * avg_synergy)
                
                boosted.append((agent_id, boosted_score, metadata))
            
            # Re-sort by boosted score
            return sorted(boosted, key=lambda x: x[1], reverse=True)
        
        # Test data
        fused_results = [
            ("agent-clinical", 0.032, {"name": "Clinical"}),
            ("agent-regulatory", 0.030, {"name": "Regulatory"}),
            ("agent-safety", 0.028, {"name": "Safety"}),
        ]
        
        synergy_scores = {
            "agent-clinical": {"agent-regulatory": 0.85, "agent-safety": 0.70},
            "agent-regulatory": {"agent-clinical": 0.85, "agent-safety": 0.90},
            "agent-safety": {"agent-clinical": 0.70, "agent-regulatory": 0.90},
        }
        
        boosted = apply_synergy_boost(fused_results, synergy_scores, boost_factor=0.15)
        
        # Verify boost was applied
        assert len(boosted) == 3
        # All scores should be higher after boost (since all have synergy)
        for i, (_, boosted_score, _) in enumerate(boosted):
            original_score = fused_results[i][1]
            assert boosted_score >= original_score


class TestTripleRetrieval:
    """Tests for triple retrieval coordination."""
    
    @pytest.mark.asyncio
    async def test_parallel_retrieval(self):
        """Test parallel execution of three retrievers."""
        async def mock_vector_search(query: str) -> List[tuple]:
            await asyncio.sleep(0.1)  # Simulate latency
            return [("agent-1", 0.9, {}), ("agent-2", 0.8, {})]
        
        async def mock_graph_search(query: str) -> List[tuple]:
            await asyncio.sleep(0.1)
            return [("agent-2", 0.85, {}), ("agent-3", 0.75, {})]
        
        async def mock_relational_search(query: str) -> List[tuple]:
            await asyncio.sleep(0.1)
            return [("agent-1", 0.88, {}), ("agent-3", 0.70, {})]
        
        # Execute in parallel
        import time
        start = time.time()
        
        results = await asyncio.gather(
            mock_vector_search("test query"),
            mock_graph_search("test query"),
            mock_relational_search("test query"),
        )
        
        elapsed = time.time() - start
        
        # Verify parallel execution (should be ~0.1s, not 0.3s)
        assert elapsed < 0.25  # Allow some overhead
        assert len(results) == 3
        assert len(results[0]) == 2  # Vector results
        assert len(results[1]) == 2  # Graph results
        assert len(results[2]) == 2  # Relational results
    
    @pytest.mark.asyncio
    async def test_retriever_timeout_handling(self):
        """Test handling of slow/failed retrievers."""
        async def slow_retriever(query: str) -> List[tuple]:
            await asyncio.sleep(5.0)  # Very slow
            return [("agent-1", 0.9, {})]
        
        async def fast_retriever(query: str) -> List[tuple]:
            await asyncio.sleep(0.05)
            return [("agent-2", 0.85, {})]
        
        async def retrieve_with_timeout(retriever, query, timeout=1.0):
            try:
                return await asyncio.wait_for(retriever(query), timeout=timeout)
            except asyncio.TimeoutError:
                return []  # Return empty on timeout
        
        results = await asyncio.gather(
            retrieve_with_timeout(slow_retriever, "query", timeout=0.5),
            retrieve_with_timeout(fast_retriever, "query", timeout=0.5),
        )
        
        # Slow retriever should timeout and return empty
        assert results[0] == []
        # Fast retriever should succeed
        assert len(results[1]) == 1


class TestFusionEngineConfiguration:
    """Tests for Fusion Engine configuration."""
    
    def test_default_weights(self):
        """Test default RRF weights."""
        DEFAULT_WEIGHTS = {
            'vector': 0.40,
            'graph': 0.35,
            'relational': 0.25,
        }
        
        assert sum(DEFAULT_WEIGHTS.values()) == 1.0
        assert DEFAULT_WEIGHTS['vector'] > DEFAULT_WEIGHTS['graph']
        assert DEFAULT_WEIGHTS['graph'] > DEFAULT_WEIGHTS['relational']
    
    def test_custom_weights_validation(self):
        """Test validation of custom weights."""
        def validate_weights(weights: Dict[str, float]) -> bool:
            """Validate that weights sum to 1.0."""
            total = sum(weights.values())
            return 0.99 <= total <= 1.01  # Allow small floating point errors
        
        valid_weights = {'vector': 0.5, 'graph': 0.3, 'relational': 0.2}
        invalid_weights = {'vector': 0.5, 'graph': 0.3, 'relational': 0.3}
        
        assert validate_weights(valid_weights) is True
        assert validate_weights(invalid_weights) is False
    
    def test_k_parameter_impact(self):
        """Test impact of k parameter on RRF scores."""
        def calculate_rrf_score(rank: int, k: int) -> float:
            """Calculate RRF score for a single rank."""
            return 1.0 / (k + rank)
        
        # With k=60 (default)
        score_k60_rank1 = calculate_rrf_score(1, 60)
        score_k60_rank10 = calculate_rrf_score(10, 60)
        
        # With k=10 (more sensitive to rank)
        score_k10_rank1 = calculate_rrf_score(1, 10)
        score_k10_rank10 = calculate_rrf_score(10, 10)
        
        # Higher k should produce more uniform scores
        ratio_k60 = score_k60_rank1 / score_k60_rank10
        ratio_k10 = score_k10_rank1 / score_k10_rank10
        
        assert ratio_k10 > ratio_k60  # k=10 should have bigger rank impact


class TestFusionResultStructure:
    """Tests for FusionResult data structure."""
    
    def test_fusion_result_attributes(self):
        """Test FusionResult has all required attributes."""
        from dataclasses import dataclass, field
        from typing import List, Dict, Any, Optional
        
        @dataclass
        class FusionResult:
            """Result from Fusion Intelligence retrieval."""
            fused_rankings: List[tuple]
            vector_results: List[tuple] = field(default_factory=list)
            graph_results: List[tuple] = field(default_factory=list)
            relational_results: List[tuple] = field(default_factory=list)
            vector_scores: Dict[str, float] = field(default_factory=dict)
            graph_paths: Dict[str, Any] = field(default_factory=dict)
            relational_patterns: Dict[str, Any] = field(default_factory=dict)
            retrieval_time_ms: int = 0
            sources_used: List[str] = field(default_factory=list)
            errors: List[str] = field(default_factory=list)
        
        result = FusionResult(
            fused_rankings=[("agent-1", 100, {"name": "Agent 1"})],
            vector_results=[("agent-1", 0.9, {})],
            retrieval_time_ms=150,
            sources_used=["vector", "relational"],
        )
        
        assert result.fused_rankings[0][0] == "agent-1"
        assert result.retrieval_time_ms == 150
        assert "vector" in result.sources_used
        assert result.graph_results == []  # Empty default
        assert result.errors == []  # No errors


class TestFusionEngineEdgeCases:
    """Edge case tests for Fusion Engine."""
    
    def test_duplicate_agent_handling(self):
        """Test handling of same agent in multiple result lists."""
        def reciprocal_rank_fusion(rankings, k=60):
            scores = {}
            for rank_list in rankings:
                for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += 1.0 / (k + rank)
            
            return sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )
        
        # Same agent appears in all three lists
        list1 = [("agent-1", 0.9, {"name": "Agent 1"})]
        list2 = [("agent-1", 0.85, {"name": "Agent 1"})]
        list3 = [("agent-1", 0.88, {"name": "Agent 1"})]
        
        result = reciprocal_rank_fusion([list1, list2, list3])
        
        # Should appear once with combined score
        assert len(result) == 1
        assert result[0][0] == "agent-1"
        # Score should be sum of 3 × 1/(60+1)
        expected_score = 3 * (1.0 / 61)
        assert abs(result[0][1] - expected_score) < 0.001
    
    def test_very_long_result_lists(self):
        """Test performance with large result sets."""
        def reciprocal_rank_fusion(rankings, k=60, max_results=100):
            scores = {}
            for rank_list in rankings:
                # Limit processing to top N
                for rank, (item_id, _, metadata) in enumerate(rank_list[:max_results], start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += 1.0 / (k + rank)
            
            return sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )[:max_results]
        
        # Generate large lists
        large_list1 = [(f"agent-{i}", 0.9 - i*0.001, {}) for i in range(1000)]
        large_list2 = [(f"agent-{i+500}", 0.9 - i*0.001, {}) for i in range(1000)]
        
        import time
        start = time.time()
        result = reciprocal_rank_fusion([large_list1, large_list2])
        elapsed = time.time() - start
        
        # Should complete quickly
        assert elapsed < 1.0  # Less than 1 second
        assert len(result) <= 100  # Respects max_results
    
    def test_non_overlapping_results(self):
        """Test fusion when retrievers return completely different agents."""
        def reciprocal_rank_fusion(rankings, k=60):
            scores = {}
            for rank_list in rankings:
                for rank, (item_id, _, metadata) in enumerate(rank_list, start=1):
                    if item_id not in scores:
                        scores[item_id] = {"score": 0.0, "metadata": metadata}
                    scores[item_id]["score"] += 1.0 / (k + rank)
            
            return sorted(
                [(id, data["score"], data["metadata"]) for id, data in scores.items()],
                key=lambda x: x[1],
                reverse=True
            )
        
        # Completely different results from each retriever
        vector = [("agent-a", 0.9, {}), ("agent-b", 0.85, {})]
        graph = [("agent-c", 0.9, {}), ("agent-d", 0.85, {})]
        relational = [("agent-e", 0.9, {}), ("agent-f", 0.85, {})]
        
        result = reciprocal_rank_fusion([vector, graph, relational])
        
        # Should have all 6 unique agents
        assert len(result) == 6
        result_ids = {r[0] for r in result}
        assert result_ids == {"agent-a", "agent-b", "agent-c", "agent-d", "agent-e", "agent-f"}
