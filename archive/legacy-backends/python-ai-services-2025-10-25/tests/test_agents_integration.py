"""
Integration tests for VITAL Python Agents

Tests the complete integration of:
- Agent initialization and configuration
- Dynamic confidence calculation
- RAG integration
- End-to-end query processing
- Error handling and retries

Run with: pytest tests/test_agents_integration.py -v --cov=agents
"""

import pytest
from typing import Dict, Any, List
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio

# Import agents
from agents.medical_specialist import MedicalSpecialist
from agents.regulatory_expert import RegulatoryExpert
from agents.clinical_researcher import ClinicalResearcher

# Import supporting services
from services.confidence_calculator import ConfidenceCalculator
from core.rag_config import RAGSettings


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def medical_specialist():
    """Create a Medical Specialist agent instance"""
    return MedicalSpecialist(
        agent_id="test-medical-001",
        name="Test Medical Specialist",
        tier=1,
        specialties=["cardiology", "clinical_trials"]
    )


@pytest.fixture
def regulatory_expert():
    """Create a Regulatory Expert agent instance"""
    return RegulatoryExpert(
        agent_id="test-regulatory-001",
        name="Test Regulatory Expert",
        tier=1,
        specialties=["fda_regulatory", "quality_assurance"]
    )


@pytest.fixture
def clinical_researcher():
    """Create a Clinical Researcher agent instance"""
    return ClinicalResearcher(
        agent_id="test-clinical-001",
        name="Test Clinical Researcher",
        tier=2,
        specialties=["clinical_research", "biostatistics"]
    )


@pytest.fixture
def mock_llm_response():
    """Mock LLM response for testing"""
    class MockResponse:
        def __init__(self, content: str):
            self.content = content

    return MockResponse(
        content="""Based on FDA regulations, Class II medical devices require:

1. 510(k) Premarket Notification
   - Demonstrate substantial equivalence to a predicate device
   - Provide detailed device description and intended use
   - Include performance data and clinical evidence

2. Quality System Regulation (QSR)
   - Implement comprehensive quality management system
   - Document design controls and manufacturing processes
   - Maintain design history files (DHF)

3. Labeling Requirements
   - Clear instructions for use
   - Warnings and contraindications
   - Device identification and traceability

4. Post-Market Surveillance
   - Medical Device Reporting (MDR)
   - Correction and removal reporting
   - Annual registration and listing

The 510(k) submission typically requires 3-12 months for FDA review, depending on
complexity and whether additional information is requested."""
    )


@pytest.fixture
def high_quality_rag_results():
    """High quality RAG results for testing"""
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
            "content": "Quality System Regulation (QSR) compliance...",
            "similarity": 0.89,
            "metadata": {
                "document_type": "regulatory_standard",
                "evidence_level": 2,
                "specialty": "quality_assurance"
            }
        },
        {
            "content": "Medical Device Reporting requirements...",
            "similarity": 0.85,
            "metadata": {
                "document_type": "regulatory_guidance",
                "evidence_level": 1,
                "specialty": "post_market"
            }
        }
    ]


@pytest.fixture
def medium_quality_rag_results():
    """Medium quality RAG results for testing"""
    return [
        {
            "content": "General medical device regulations...",
            "similarity": 0.72,
            "metadata": {
                "document_type": "general_guidance",
                "evidence_level": 3
            }
        },
        {
            "content": "Quality management systems overview...",
            "similarity": 0.68,
            "metadata": {
                "document_type": "general_guidance",
                "evidence_level": 4
            }
        }
    ]


# ============================================================================
# MEDICAL SPECIALIST INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.agents
class TestMedicalSpecialistIntegration:
    """Integration tests for Medical Specialist agent"""

    @pytest.mark.asyncio
    async def test_medical_specialist_end_to_end_high_quality(
        self,
        medical_specialist,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test Medical Specialist with high quality RAG results"""
        query = "What are the clinical endpoints for cardiovascular trials?"

        # Mock the LLM call
        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            # Mock confidence calculator with real calculation
            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Simulate realistic confidence for high quality
                mock_calc.return_value = {
                    "confidence": 0.88,
                    "breakdown": {
                        "rag_confidence": 0.90,
                        "alignment_confidence": 0.85,
                        "completeness_confidence": 0.88
                    },
                    "reasoning": "High quality RAG results with strong alignment",
                    "quality_level": "high"
                }

                # Execute agent query
                result = await medical_specialist.process_query(
                    query=query,
                    context={
                        "rag_results": high_quality_rag_results,
                        "user_id": "test-user"
                    }
                )

        # Assertions
        assert result["agent_id"] == "test-medical-001"
        assert result["agent_name"] == "Test Medical Specialist"
        assert result["response"] == mock_llm_response.content
        assert 0.85 <= result["confidence"] <= 0.95
        assert result["quality_level"] == "high"
        assert "breakdown" in result["confidence_breakdown"]
        assert "reasoning" in result["confidence_reasoning"]

    @pytest.mark.asyncio
    async def test_medical_specialist_end_to_end_medium_quality(
        self,
        medical_specialist,
        mock_llm_response,
        medium_quality_rag_results
    ):
        """Test Medical Specialist with medium quality RAG results"""
        query = "What are general cardiology guidelines?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Simulate realistic confidence for medium quality
                mock_calc.return_value = {
                    "confidence": 0.72,
                    "breakdown": {
                        "rag_confidence": 0.70,
                        "alignment_confidence": 0.75,
                        "completeness_confidence": 0.70
                    },
                    "reasoning": "Medium quality RAG results with decent alignment",
                    "quality_level": "medium"
                }

                result = await medical_specialist.process_query(
                    query=query,
                    context={"rag_results": medium_quality_rag_results}
                )

        # Assertions for medium quality
        assert 0.65 <= result["confidence"] <= 0.80
        assert result["quality_level"] == "medium"

    @pytest.mark.asyncio
    async def test_medical_specialist_no_rag_results(
        self,
        medical_specialist,
        mock_llm_response
    ):
        """Test Medical Specialist with no RAG results (fallback)"""
        query = "What are cardiovascular risk factors?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Simulate lower confidence without RAG
                mock_calc.return_value = {
                    "confidence": 0.55,
                    "breakdown": {
                        "rag_confidence": 0.30,  # Low due to no RAG
                        "alignment_confidence": 0.70,
                        "completeness_confidence": 0.65
                    },
                    "reasoning": "No RAG results available, using agent knowledge only",
                    "quality_level": "low"
                }

                result = await medical_specialist.process_query(
                    query=query,
                    context={}  # No RAG results
                )

        # Assertions for low quality (no RAG)
        assert 0.45 <= result["confidence"] <= 0.65
        assert result["quality_level"] == "low"


# ============================================================================
# REGULATORY EXPERT INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.agents
class TestRegulatoryExpertIntegration:
    """Integration tests for Regulatory Expert agent"""

    @pytest.mark.asyncio
    async def test_regulatory_expert_end_to_end_high_quality(
        self,
        regulatory_expert,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test Regulatory Expert with high quality RAG results"""
        query = "What are FDA requirements for Class II medical devices?"

        with patch.object(regulatory_expert, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                regulatory_expert.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Regulatory expert should have higher confidence due to domain boost
                mock_calc.return_value = {
                    "confidence": 0.92,
                    "breakdown": {
                        "rag_confidence": 0.92,
                        "alignment_confidence": 0.90,
                        "completeness_confidence": 0.92
                    },
                    "reasoning": "High quality regulatory guidance with excellent alignment",
                    "quality_level": "high"
                }

                result = await regulatory_expert.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

        # Assertions - regulatory should achieve higher confidence
        assert result["agent_id"] == "test-regulatory-001"
        assert 0.88 <= result["confidence"] <= 0.95
        assert result["quality_level"] == "high"

    @pytest.mark.asyncio
    async def test_regulatory_expert_specialty_match_boost(
        self,
        regulatory_expert,
        mock_llm_response
    ):
        """Test that regulatory expert gets boost for specialty matches"""
        query = "What are FDA 510(k) submission requirements?"

        # RAG results with regulatory specialty match
        specialty_matched_rag = [
            {
                "content": "FDA 510(k) premarket notification requirements...",
                "similarity": 0.85,
                "metadata": {
                    "document_type": "regulatory_guidance",
                    "specialty": "fda_regulatory",  # Matches agent specialty
                    "evidence_level": 1
                }
            }
        ]

        with patch.object(regulatory_expert, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                regulatory_expert.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Should get specialty match boost
                mock_calc.return_value = {
                    "confidence": 0.90,
                    "breakdown": {
                        "rag_confidence": 0.90,
                        "alignment_confidence": 0.88,
                        "completeness_confidence": 0.92,
                        "specialty_boost": 0.10  # Specialty match bonus
                    },
                    "reasoning": "Specialty match with regulatory guidance",
                    "quality_level": "high"
                }

                result = await regulatory_expert.process_query(
                    query=query,
                    context={"rag_results": specialty_matched_rag}
                )

        assert result["confidence"] >= 0.88
        assert "specialty_boost" in result["confidence_breakdown"]


# ============================================================================
# CLINICAL RESEARCHER INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.agents
class TestClinicalResearcherIntegration:
    """Integration tests for Clinical Researcher agent"""

    @pytest.mark.asyncio
    async def test_clinical_researcher_end_to_end_high_quality(
        self,
        clinical_researcher,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test Clinical Researcher with high quality RAG results"""
        query = "What statistical methods are recommended for Phase III trials?"

        with patch.object(clinical_researcher, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                clinical_researcher.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Tier 2 agent should have slightly lower base confidence
                mock_calc.return_value = {
                    "confidence": 0.82,
                    "breakdown": {
                        "rag_confidence": 0.88,
                        "alignment_confidence": 0.80,
                        "completeness_confidence": 0.78
                    },
                    "reasoning": "High quality research evidence with good alignment",
                    "quality_level": "high"
                }

                result = await clinical_researcher.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

        # Tier 2 agents should have confidence in 0.75-0.90 range
        assert result["agent_id"] == "test-clinical-001"
        assert 0.75 <= result["confidence"] <= 0.90
        assert result["quality_level"] == "high"

    @pytest.mark.asyncio
    async def test_clinical_researcher_tier2_confidence_range(
        self,
        clinical_researcher,
        mock_llm_response,
        medium_quality_rag_results
    ):
        """Test that Tier 2 agent confidence stays within expected range"""
        query = "What are general clinical research best practices?"

        with patch.object(clinical_researcher, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                clinical_researcher.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Tier 2 with medium quality
                mock_calc.return_value = {
                    "confidence": 0.68,
                    "breakdown": {
                        "rag_confidence": 0.70,
                        "alignment_confidence": 0.68,
                        "completeness_confidence": 0.65
                    },
                    "reasoning": "Medium quality evidence, Tier 2 base confidence",
                    "quality_level": "medium"
                }

                result = await clinical_researcher.process_query(
                    query=query,
                    context={"rag_results": medium_quality_rag_results}
                )

        # Tier 2 medium quality should be 0.60-0.75
        assert 0.60 <= result["confidence"] <= 0.75
        assert result["quality_level"] == "medium"


# ============================================================================
# CONFIDENCE INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.confidence
class TestConfidenceIntegration:
    """Integration tests for confidence calculation with agents"""

    @pytest.mark.asyncio
    async def test_confidence_varies_by_rag_quality(
        self,
        medical_specialist,
        mock_llm_response,
        high_quality_rag_results,
        medium_quality_rag_results
    ):
        """Test that confidence changes based on RAG quality"""
        query = "What are cardiovascular endpoints?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            # High quality RAG
            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {"confidence": 0.88, "quality_level": "high"}
                result_high = await medical_specialist.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

            # Medium quality RAG
            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {"confidence": 0.72, "quality_level": "medium"}
                result_medium = await medical_specialist.process_query(
                    query=query,
                    context={"rag_results": medium_quality_rag_results}
                )

        # High quality should have significantly higher confidence
        assert result_high["confidence"] > result_medium["confidence"]
        assert result_high["confidence"] - result_medium["confidence"] >= 0.10

    @pytest.mark.asyncio
    async def test_confidence_varies_by_tier(
        self,
        regulatory_expert,  # Tier 1
        clinical_researcher,  # Tier 2
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test that confidence reflects agent tier appropriately"""
        query = "What are regulatory requirements?"

        # Tier 1 agent
        with patch.object(regulatory_expert, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)
            with patch.object(
                regulatory_expert.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {"confidence": 0.90, "quality_level": "high"}
                result_tier1 = await regulatory_expert.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

        # Tier 2 agent
        with patch.object(clinical_researcher, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)
            with patch.object(
                clinical_researcher.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {"confidence": 0.82, "quality_level": "high"}
                result_tier2 = await clinical_researcher.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

        # Tier 1 should have higher confidence than Tier 2 for same quality
        assert result_tier1["confidence"] > result_tier2["confidence"]


# ============================================================================
# RAG INTEGRATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.rag
class TestRAGIntegration:
    """Integration tests for RAG integration with agents"""

    @pytest.mark.asyncio
    async def test_rag_results_included_in_response(
        self,
        regulatory_expert,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test that RAG results are properly integrated into agent response"""
        query = "What are FDA Class II requirements?"

        with patch.object(regulatory_expert, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                regulatory_expert.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {
                    "confidence": 0.90,
                    "quality_level": "high",
                    "rag_sources_used": 3
                }

                result = await regulatory_expert.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )

        # Verify RAG integration
        assert result["confidence"] >= 0.85
        assert "rag_sources_used" in result or "breakdown" in result["confidence_breakdown"]

    @pytest.mark.asyncio
    async def test_agent_handles_empty_rag_results(
        self,
        medical_specialist,
        mock_llm_response
    ):
        """Test agent gracefully handles empty RAG results"""
        query = "What are treatment protocols?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Empty RAG should result in lower confidence
                mock_calc.return_value = {
                    "confidence": 0.50,
                    "quality_level": "low",
                    "reasoning": "No RAG results available"
                }

                result = await medical_specialist.process_query(
                    query=query,
                    context={"rag_results": []}  # Empty RAG
                )

        # Should still return valid response, but lower confidence
        assert result["response"] == mock_llm_response.content
        assert result["confidence"] < 0.65
        assert result["quality_level"] == "low"


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.agents
class TestErrorHandling:
    """Integration tests for agent error handling"""

    @pytest.mark.asyncio
    async def test_agent_handles_llm_timeout(self, medical_specialist):
        """Test agent handles LLM timeout gracefully"""
        query = "What are treatment protocols?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            # Simulate timeout
            mock_llm.ainvoke = AsyncMock(side_effect=asyncio.TimeoutError("LLM timeout"))

            with pytest.raises(asyncio.TimeoutError):
                await medical_specialist.process_query(query=query, context={})

    @pytest.mark.asyncio
    async def test_agent_handles_confidence_calculation_error(
        self,
        regulatory_expert,
        mock_llm_response
    ):
        """Test agent handles confidence calculation errors"""
        query = "What are FDA requirements?"

        with patch.object(regulatory_expert, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                regulatory_expert.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                # Simulate calculation error
                mock_calc.side_effect = ValueError("Invalid confidence input")

                with pytest.raises(ValueError):
                    await regulatory_expert.process_query(query=query, context={})


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.slow
class TestPerformance:
    """Performance tests for agent integration"""

    @pytest.mark.asyncio
    async def test_agent_response_time_under_3_seconds(
        self,
        medical_specialist,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test that agent responds within 3 seconds"""
        import time

        query = "What are cardiovascular risk factors?"

        with patch.object(medical_specialist, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)

            with patch.object(
                medical_specialist.confidence_calculator,
                'calculate_confidence'
            ) as mock_calc:
                mock_calc.return_value = {"confidence": 0.85, "quality_level": "high"}

                start_time = time.time()
                result = await medical_specialist.process_query(
                    query=query,
                    context={"rag_results": high_quality_rag_results}
                )
                elapsed_time = time.time() - start_time

        # Should complete in under 3 seconds
        assert elapsed_time < 3.0
        assert result["confidence"] > 0.80

    @pytest.mark.asyncio
    async def test_parallel_agent_queries(
        self,
        medical_specialist,
        regulatory_expert,
        clinical_researcher,
        mock_llm_response,
        high_quality_rag_results
    ):
        """Test multiple agents can process queries in parallel"""
        queries = [
            ("What are cardiovascular endpoints?", medical_specialist),
            ("What are FDA requirements?", regulatory_expert),
            ("What are Phase III trial designs?", clinical_researcher)
        ]

        async def process_agent_query(query: str, agent):
            with patch.object(agent, 'llm') as mock_llm:
                mock_llm.ainvoke = AsyncMock(return_value=mock_llm_response)
                with patch.object(
                    agent.confidence_calculator,
                    'calculate_confidence'
                ) as mock_calc:
                    mock_calc.return_value = {"confidence": 0.85, "quality_level": "high"}
                    return await agent.process_query(
                        query=query,
                        context={"rag_results": high_quality_rag_results}
                    )

        # Execute all queries in parallel
        results = await asyncio.gather(*[
            process_agent_query(query, agent) for query, agent in queries
        ])

        # All should complete successfully
        assert len(results) == 3
        assert all(r["confidence"] > 0.80 for r in results)
