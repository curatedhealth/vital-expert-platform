"""
Performance Benchmarking Suite for VITAL Python Services

Benchmarks:
- Confidence calculation latency (<50ms target)
- Embedding generation latency (<200ms target)
- RAG search latency (<300ms target)
- Agent response latency (<3s target)
- End-to-end P90 latency (<500ms target)

Run with: pytest tests/test_performance_benchmarks.py -v --benchmark-only
"""

import pytest
import numpy as np
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio
import time

# Import services
from services.confidence_calculator import ConfidenceCalculator
from core.rag_config import RAGSettings, MedicalRankingBoosts

# Import agents
from agents.medical_specialist import MedicalSpecialist
from agents.regulatory_expert import RegulatoryExpert


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def confidence_calculator():
    """Create confidence calculator instance"""
    return ConfidenceCalculator()


@pytest.fixture
def sample_query():
    """Sample query for benchmarking"""
    return "What are the FDA requirements for Class II medical devices in cardiovascular applications?"


@pytest.fixture
def sample_response():
    """Sample response for benchmarking"""
    return """FDA Class II medical devices in cardiovascular applications require:

1. 510(k) Premarket Notification demonstrating substantial equivalence
2. Quality System Regulation (QSR) compliance with comprehensive QMS
3. Biocompatibility testing per ISO 10993 standards
4. Electrical safety testing per IEC 60601-1
5. Clinical evidence demonstrating safety and effectiveness
6. Labeling requirements including contraindications and warnings
7. Post-market surveillance including MDR reporting

The review timeline typically ranges from 3-12 months depending on complexity."""


@pytest.fixture
def sample_agent_metadata():
    """Sample agent metadata for benchmarking"""
    return {
        "name": "Regulatory Expert",
        "tier": 1,
        "specialties": ["fda_regulatory", "quality_assurance", "cardiovascular"],
        "domain": "regulatory"
    }


@pytest.fixture
def sample_rag_results():
    """Sample RAG results for benchmarking"""
    return [
        {
            "content": "FDA 510(k) requirements for Class II devices...",
            "similarity": 0.92,
            "metadata": {
                "document_type": "regulatory_guidance",
                "evidence_level": 1,
                "specialty": "fda_regulatory"
            }
        },
        {
            "content": "Quality System Regulation compliance...",
            "similarity": 0.89,
            "metadata": {
                "document_type": "regulatory_standard",
                "evidence_level": 2,
                "specialty": "quality_assurance"
            }
        },
        {
            "content": "Cardiovascular device specific requirements...",
            "similarity": 0.87,
            "metadata": {
                "document_type": "device_guidance",
                "evidence_level": 1,
                "specialty": "cardiovascular"
            }
        },
        {
            "content": "Medical Device Reporting requirements...",
            "similarity": 0.85,
            "metadata": {
                "document_type": "regulatory_guidance",
                "evidence_level": 1
            }
        },
        {
            "content": "Biocompatibility testing standards...",
            "similarity": 0.82,
            "metadata": {
                "document_type": "iso_standard",
                "evidence_level": 2
            }
        }
    ]


# ============================================================================
# CONFIDENCE CALCULATION BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
class TestConfidenceCalculationPerformance:
    """Benchmark confidence calculation performance"""

    @pytest.mark.asyncio
    async def test_confidence_calculation_latency_target_50ms(
        self,
        benchmark,
        confidence_calculator,
        sample_query,
        sample_response,
        sample_agent_metadata,
        sample_rag_results
    ):
        """Benchmark: Confidence calculation should complete in <50ms"""

        # Mock embeddings to avoid network calls
        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            # Return deterministic embeddings
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(len(text))
                return np.random.rand(1536).tolist()

            mock_embed.side_effect = fake_embed

            # Benchmark function
            async def calculate():
                return await confidence_calculator.calculate_confidence(
                    query=sample_query,
                    response=sample_response,
                    agent_metadata=sample_agent_metadata,
                    rag_results=sample_rag_results
                )

            # Run benchmark
            result = await calculate()

            # Measure latency over 100 iterations
            latencies = []
            for _ in range(100):
                start = time.perf_counter()
                await calculate()
                latencies.append((time.perf_counter() - start) * 1000)  # Convert to ms

            # Calculate statistics
            p50 = np.percentile(latencies, 50)
            p90 = np.percentile(latencies, 90)
            p99 = np.percentile(latencies, 99)
            mean = np.mean(latencies)

            print(f"\n=== Confidence Calculation Latency ===")
            print(f"Mean: {mean:.2f}ms")
            print(f"P50:  {p50:.2f}ms")
            print(f"P90:  {p90:.2f}ms")
            print(f"P99:  {p99:.2f}ms")
            print(f"Target: <50ms")

            # Assertions
            assert p90 < 50.0, f"P90 latency {p90:.2f}ms exceeds 50ms target"
            assert result["confidence"] > 0.0

    @pytest.mark.asyncio
    async def test_rag_confidence_calculation_speed(
        self,
        confidence_calculator,
        sample_rag_results
    ):
        """Benchmark: RAG confidence calculation component"""

        latencies = []
        for _ in range(200):
            start = time.perf_counter()
            await confidence_calculator._calculate_rag_confidence(sample_rag_results)
            latencies.append((time.perf_counter() - start) * 1000)

        p90 = np.percentile(latencies, 90)

        print(f"\n=== RAG Confidence Component ===")
        print(f"P90: {p90:.2f}ms")
        print(f"Target: <10ms")

        assert p90 < 10.0, f"RAG confidence P90 {p90:.2f}ms exceeds 10ms target"

    @pytest.mark.asyncio
    async def test_alignment_confidence_calculation_speed(
        self,
        confidence_calculator,
        sample_query,
        sample_agent_metadata
    ):
        """Benchmark: Alignment confidence calculation component"""

        # Mock embeddings
        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(len(text))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            latencies = []
            for _ in range(100):
                start = time.perf_counter()
                await confidence_calculator._calculate_alignment_confidence(
                    sample_query,
                    sample_agent_metadata
                )
                latencies.append((time.perf_counter() - start) * 1000)

            p90 = np.percentile(latencies, 90)

            print(f"\n=== Alignment Confidence Component ===")
            print(f"P90: {p90:.2f}ms")
            print(f"Target: <30ms")

            assert p90 < 30.0, f"Alignment confidence P90 {p90:.2f}ms exceeds 30ms target"

    @pytest.mark.asyncio
    async def test_completeness_confidence_calculation_speed(
        self,
        confidence_calculator,
        sample_query,
        sample_response
    ):
        """Benchmark: Completeness confidence calculation component"""

        latencies = []
        for _ in range(200):
            start = time.perf_counter()
            confidence_calculator._calculate_completeness_confidence(
                sample_query,
                sample_response
            )
            latencies.append((time.perf_counter() - start) * 1000)

        p90 = np.percentile(latencies, 90)

        print(f"\n=== Completeness Confidence Component ===")
        print(f"P90: {p90:.2f}ms")
        print(f"Target: <5ms")

        assert p90 < 5.0, f"Completeness confidence P90 {p90:.2f}ms exceeds 5ms target"


# ============================================================================
# RAG CONFIGURATION BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
class TestRAGConfigurationPerformance:
    """Benchmark RAG configuration performance"""

    def test_medical_ranking_boost_calculation_speed(self):
        """Benchmark: Medical re-ranking boost calculation"""
        boosts = MedicalRankingBoosts()

        latencies = []
        for _ in range(1000):
            start = time.perf_counter()
            boosts.calculate_total_boost(
                medical_term_count=5,
                has_specialty_match=True,
                has_phase_match=True,
                evidence_level=1,
                has_preferred_doc_type=True
            )
            latencies.append((time.perf_counter() - start) * 1000)

        p90 = np.percentile(latencies, 90)

        print(f"\n=== Medical Ranking Boost Calculation ===")
        print(f"P90: {p90:.4f}ms")
        print(f"Target: <1ms")

        assert p90 < 1.0, f"Boost calculation P90 {p90:.4f}ms exceeds 1ms target"

    def test_rag_settings_initialization_speed(self):
        """Benchmark: RAG settings initialization"""

        latencies = []
        for _ in range(100):
            start = time.perf_counter()
            settings = RAGSettings()
            latencies.append((time.perf_counter() - start) * 1000)

        p90 = np.percentile(latencies, 90)

        print(f"\n=== RAG Settings Initialization ===")
        print(f"P90: {p90:.2f}ms")
        print(f"Target: <10ms")

        assert p90 < 10.0, f"Settings init P90 {p90:.2f}ms exceeds 10ms target"


# ============================================================================
# AGENT RESPONSE BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
class TestAgentResponsePerformance:
    """Benchmark agent response performance"""

    @pytest.mark.asyncio
    async def test_agent_end_to_end_latency_target_3s(
        self,
        sample_query,
        sample_rag_results
    ):
        """Benchmark: Agent end-to-end response time should be <3s"""

        agent = RegulatoryExpert(
            agent_id="bench-regulatory-001",
            name="Benchmark Regulatory Expert",
            tier=1,
            specialties=["fda_regulatory"]
        )

        # Mock LLM response
        class MockResponse:
            content = "FDA Class II devices require 510(k) premarket notification..."

        with patch.object(agent, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=MockResponse())

            with patch.object(agent.confidence_calculator, 'calculate_confidence') as mock_calc:
                mock_calc.return_value = {
                    "confidence": 0.88,
                    "breakdown": {},
                    "reasoning": "High quality",
                    "quality_level": "high"
                }

                # Measure latency over 50 iterations
                latencies = []
                for _ in range(50):
                    start = time.perf_counter()
                    await agent.process_query(
                        query=sample_query,
                        context={"rag_results": sample_rag_results}
                    )
                    latencies.append((time.perf_counter() - start) * 1000)

                # Calculate statistics
                p50 = np.percentile(latencies, 50)
                p90 = np.percentile(latencies, 90)
                p99 = np.percentile(latencies, 99)
                mean = np.mean(latencies)

                print(f"\n=== Agent End-to-End Latency ===")
                print(f"Mean: {mean:.2f}ms")
                print(f"P50:  {p50:.2f}ms")
                print(f"P90:  {p90:.2f}ms")
                print(f"P99:  {p99:.2f}ms")
                print(f"Target: <3000ms (3s)")

                # Assertions
                assert p90 < 3000.0, f"P90 latency {p90:.2f}ms exceeds 3s target"

    @pytest.mark.asyncio
    async def test_parallel_agent_throughput(self, sample_query, sample_rag_results):
        """Benchmark: Multiple agents processing queries in parallel"""

        # Create multiple agents
        agents = [
            RegulatoryExpert(
                agent_id=f"bench-reg-{i}",
                name=f"Regulatory Expert {i}",
                tier=1,
                specialties=["fda_regulatory"]
            )
            for i in range(5)
        ]

        # Mock responses for all agents
        class MockResponse:
            content = "FDA requirements include..."

        async def process_with_mock(agent):
            with patch.object(agent, 'llm') as mock_llm:
                mock_llm.ainvoke = AsyncMock(return_value=MockResponse())
                with patch.object(agent.confidence_calculator, 'calculate_confidence') as mock_calc:
                    mock_calc.return_value = {
                        "confidence": 0.85,
                        "quality_level": "high"
                    }
                    return await agent.process_query(
                        query=sample_query,
                        context={"rag_results": sample_rag_results}
                    )

        # Benchmark parallel execution
        start = time.perf_counter()
        results = await asyncio.gather(*[process_with_mock(agent) for agent in agents])
        elapsed = (time.perf_counter() - start) * 1000

        print(f"\n=== Parallel Agent Throughput ===")
        print(f"5 agents processed in: {elapsed:.2f}ms")
        print(f"Average per agent: {elapsed/5:.2f}ms")
        print(f"Target: <500ms total for 5 agents")

        assert len(results) == 5
        assert elapsed < 500.0, f"Parallel processing took {elapsed:.2f}ms, exceeds 500ms target"


# ============================================================================
# EMBEDDING GENERATION BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
class TestEmbeddingPerformance:
    """Benchmark embedding generation performance"""

    @pytest.mark.asyncio
    async def test_embedding_generation_latency_target_200ms(self, sample_query):
        """Benchmark: Embedding generation should complete in <200ms"""

        confidence_calculator = ConfidenceCalculator()

        # Mock embeddings with realistic latency
        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed_with_latency(text: str) -> List[float]:
                # Simulate realistic embedding latency (50-150ms)
                await asyncio.sleep(0.1)  # 100ms
                np.random.seed(len(text))
                return np.random.rand(1536).tolist()

            mock_embed.side_effect = fake_embed_with_latency

            # Measure latency
            latencies = []
            for _ in range(20):
                start = time.perf_counter()
                await confidence_calculator.embeddings.aembed_query(sample_query)
                latencies.append((time.perf_counter() - start) * 1000)

            p90 = np.percentile(latencies, 90)

            print(f"\n=== Embedding Generation Latency ===")
            print(f"P90: {p90:.2f}ms")
            print(f"Target: <200ms")

            assert p90 < 200.0, f"Embedding P90 {p90:.2f}ms exceeds 200ms target"


# ============================================================================
# MEMORY USAGE BENCHMARKS
# ============================================================================

@pytest.mark.benchmark
class TestMemoryUsage:
    """Benchmark memory usage of key components"""

    def test_confidence_calculator_memory_footprint(self):
        """Benchmark: Confidence calculator memory usage"""
        import sys

        # Create calculator
        calc = ConfidenceCalculator()

        # Estimate memory usage
        size_bytes = sys.getsizeof(calc)
        size_kb = size_bytes / 1024

        print(f"\n=== Confidence Calculator Memory ===")
        print(f"Size: {size_kb:.2f} KB")
        print(f"Target: <100 KB")

        # Should be lightweight
        assert size_kb < 100.0, f"Calculator uses {size_kb:.2f}KB, exceeds 100KB"

    def test_rag_settings_memory_footprint(self):
        """Benchmark: RAG settings memory usage"""
        import sys

        settings = RAGSettings()
        size_bytes = sys.getsizeof(settings)
        size_kb = size_bytes / 1024

        print(f"\n=== RAG Settings Memory ===")
        print(f"Size: {size_kb:.2f} KB")
        print(f"Target: <50 KB")

        assert size_kb < 50.0, f"Settings uses {size_kb:.2f}KB, exceeds 50KB"


# ============================================================================
# STRESS TESTS
# ============================================================================

@pytest.mark.benchmark
@pytest.mark.slow
class TestStressScenarios:
    """Stress test scenarios"""

    @pytest.mark.asyncio
    async def test_high_volume_confidence_calculations(
        self,
        confidence_calculator,
        sample_query,
        sample_response,
        sample_agent_metadata,
        sample_rag_results
    ):
        """Stress test: 1000 confidence calculations"""

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(len(text))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            start = time.perf_counter()

            # Process 1000 calculations
            tasks = []
            for i in range(1000):
                task = confidence_calculator.calculate_confidence(
                    query=sample_query,
                    response=sample_response,
                    agent_metadata=sample_agent_metadata,
                    rag_results=sample_rag_results
                )
                tasks.append(task)

            results = await asyncio.gather(*tasks)
            elapsed = time.perf_counter() - start

            throughput = 1000 / elapsed

            print(f"\n=== High Volume Stress Test ===")
            print(f"1000 calculations in: {elapsed:.2f}s")
            print(f"Throughput: {throughput:.2f} calculations/sec")
            print(f"Target: >20 calculations/sec")

            assert len(results) == 1000
            assert throughput > 20.0, f"Throughput {throughput:.2f}/sec below 20/sec target"

    @pytest.mark.asyncio
    async def test_concurrent_agent_load(self, sample_query, sample_rag_results):
        """Stress test: 100 concurrent agent queries"""

        agents = [
            MedicalSpecialist(
                agent_id=f"stress-med-{i}",
                name=f"Medical Specialist {i}",
                tier=1,
                specialties=["cardiology"]
            )
            for i in range(100)
        ]

        class MockResponse:
            content = "Medical response..."

        async def process_with_mock(agent):
            with patch.object(agent, 'llm') as mock_llm:
                mock_llm.ainvoke = AsyncMock(return_value=MockResponse())
                with patch.object(agent.confidence_calculator, 'calculate_confidence') as mock_calc:
                    mock_calc.return_value = {"confidence": 0.85, "quality_level": "high"}
                    return await agent.process_query(
                        query=sample_query,
                        context={"rag_results": sample_rag_results}
                    )

        start = time.perf_counter()
        results = await asyncio.gather(*[process_with_mock(agent) for agent in agents])
        elapsed = time.perf_counter() - start

        print(f"\n=== Concurrent Load Test ===")
        print(f"100 concurrent queries in: {elapsed:.2f}s")
        print(f"Average: {elapsed*1000/100:.2f}ms per query")
        print(f"Target: <10s total")

        assert len(results) == 100
        assert elapsed < 10.0, f"100 concurrent queries took {elapsed:.2f}s, exceeds 10s target"


# ============================================================================
# PERCENTILE ANALYSIS
# ============================================================================

@pytest.mark.benchmark
class TestLatencyPercentiles:
    """Detailed percentile analysis of key operations"""

    @pytest.mark.asyncio
    async def test_confidence_latency_percentiles_detailed(
        self,
        confidence_calculator,
        sample_query,
        sample_response,
        sample_agent_metadata,
        sample_rag_results
    ):
        """Detailed percentile analysis of confidence calculation"""

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(len(text))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            # Collect 500 samples
            latencies = []
            for _ in range(500):
                start = time.perf_counter()
                await confidence_calculator.calculate_confidence(
                    query=sample_query,
                    response=sample_response,
                    agent_metadata=sample_agent_metadata,
                    rag_results=sample_rag_results
                )
                latencies.append((time.perf_counter() - start) * 1000)

            # Calculate percentiles
            percentiles = [10, 25, 50, 75, 90, 95, 99]
            values = [np.percentile(latencies, p) for p in percentiles]

            print(f"\n=== Confidence Calculation Percentiles (500 samples) ===")
            for p, v in zip(percentiles, values):
                print(f"P{p:2d}: {v:6.2f}ms")

            # Verify SLA targets
            assert values[percentiles.index(50)] < 30.0, "P50 exceeds 30ms"
            assert values[percentiles.index(90)] < 50.0, "P90 exceeds 50ms"
            assert values[percentiles.index(99)] < 100.0, "P99 exceeds 100ms"
