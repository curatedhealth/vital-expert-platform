"""
Tests for SimpleConsensusCalculator
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest

from services.consensus_calculator import SimpleConsensusCalculator, ConsensusResult, create_consensus_calculator


@pytest.fixture
def calculator():
    """Consensus calculator instance"""
    return SimpleConsensusCalculator(min_agreement_threshold=0.5)


@pytest.fixture
def sample_responses_high_agreement():
    """Sample responses with high agreement"""
    return [
        {
            "agent_id": "expert_1",
            "agent_name": "Regulatory Expert",
            "content": "FDA requires 510(k) clearance for Class II medical devices. "
                      "Clinical trials are necessary. The approval process typically takes 12-18 months.",
            "confidence_score": 0.9
        },
        {
            "agent_id": "expert_2",
            "agent_name": "Clinical Expert",
            "content": "Medical devices need FDA 510(k) clearance. Clinical trials must demonstrate "
                      "safety and efficacy. The regulatory process requires 12-15 months on average.",
            "confidence_score": 0.85
        },
        {
            "agent_id": "expert_3",
            "agent_name": "Quality Expert",
            "content": "FDA 510(k) submission is mandatory for Class II devices. Clinical evidence "
                      "from trials is essential. Expect 12-18 month approval timeline.",
            "confidence_score": 0.8
        }
    ]


@pytest.fixture
def sample_responses_low_agreement():
    """Sample responses with low agreement"""
    return [
        {
            "agent_id": "expert_1",
            "agent_name": "Expert A",
            "content": "Consider the De Novo pathway for novel devices without predicate. "
                      "This route offers innovation advantages but requires comprehensive data.",
            "confidence_score": 0.7
        },
        {
            "agent_id": "expert_2",
            "agent_name": "Expert B",
            "content": "Pursue expedited review through Breakthrough Device program. "
                      "Focus on accelerated timelines and early interaction with FDA.",
            "confidence_score": 0.75
        },
        {
            "agent_id": "expert_3",
            "agent_name": "Expert C",
            "content": "International harmonization via IMDRF standards provides global market access. "
                      "Consider CE marking in parallel with FDA submission.",
            "confidence_score": 0.8
        }
    ]


class TestSimpleConsensusCalculator:
    """Test suite for SimpleConsensusCalculator"""
    
    def test_calculator_initialization(self):
        """Test calculator initialization"""
        calc = SimpleConsensusCalculator(min_agreement_threshold=0.6)
        assert calc.min_threshold == 0.6
        assert len(calc.STOP_WORDS) > 0
    
    def test_empty_responses(self, calculator):
        """Test consensus with no responses"""
        result = calculator.calculate_consensus([], "What is the answer?")
        
        assert result.consensus_level == 0.0
        assert len(result.agreement_points) == 0
        assert len(result.disagreement_points) == 0
        assert "No expert responses" in result.recommendation
    
    def test_high_agreement_consensus(self, calculator, sample_responses_high_agreement):
        """Test consensus with high agreement"""
        query = "What are FDA requirements for medical devices?"
        result = calculator.calculate_consensus(sample_responses_high_agreement, query)
        
        # Should have high consensus
        assert result.consensus_level >= 0.6
        
        # Should identify common themes
        assert len(result.key_themes) > 0
        assert any('fda' in theme.lower() or '510k' in theme.lower() or 'clearance' in theme.lower() 
                  for theme in result.key_themes)
        
        # Should have agreement points
        assert len(result.agreement_points) > 0
        
        # Should have recommendation
        assert len(result.recommendation) > 0
        assert "strong" in result.recommendation.lower() or "moderate" in result.recommendation.lower()
    
    def test_low_agreement_consensus(self, calculator, sample_responses_low_agreement):
        """Test consensus with low agreement"""
        query = "What is the best regulatory strategy?"
        result = calculator.calculate_consensus(sample_responses_low_agreement, query)
        
        # Should have lower consensus
        assert result.consensus_level < 0.7
        
        # Might have dissenting opinions
        # (depends on keyword overlap)
        
        # Should still have recommendation
        assert len(result.recommendation) > 0
    
    def test_extract_keywords(self, calculator):
        """Test keyword extraction"""
        text = "The FDA requires 510(k) clearance for medical devices in clinical trials."
        
        keywords = calculator._extract_keywords(text)
        
        # Should extract meaningful keywords
        assert 'requires' in keywords or 'clearance' in keywords or 'medical' in keywords
        
        # Should filter stop words
        assert 'the' not in keywords
        assert 'for' not in keywords
        assert 'in' not in keywords
    
    def test_extract_keywords_min_length(self, calculator):
        """Test keyword extraction with length filter"""
        text = "FDA is a key organization for medical device approval."
        
        keywords = calculator._extract_keywords(text, min_length=4)
        
        # Short words should be filtered
        assert 'fda' not in keywords  # Less than 4 chars
        assert 'key' not in keywords  # Less than 4 chars
        
        # Long words should be kept
        assert any(len(k) >= 4 for k in keywords)
    
    def test_find_agreements(self, calculator):
        """Test finding agreement points"""
        expert_points = {
            "expert_1": {"keywords": ["clinical", "trials", "safety", "efficacy"]},
            "expert_2": {"keywords": ["clinical", "trials", "patients", "data"]},
            "expert_3": {"keywords": ["clinical", "safety", "regulatory", "approval"]}
        }
        common_themes = ["clinical", "trials", "safety"]
        
        agreements = calculator._find_agreements(expert_points, common_themes)
        
        # Should find agreements on common themes
        assert len(agreements) > 0
        
        # "clinical" should be in agreements (all 3 experts)
        clinical_agreement = next((a for a in agreements.values() if a["theme"] == "clinical"), None)
        assert clinical_agreement is not None
        assert clinical_agreement["expert_count"] == 3
    
    def test_calculate_consensus_level(self, calculator):
        """Test consensus level calculation"""
        agreements = {
            "theme_1": {"agreement_ratio": 1.0},
            "theme_2": {"agreement_ratio": 0.8},
            "theme_3": {"agreement_ratio": 0.6}
        }
        disagreements = {}
        
        consensus = calculator._calculate_consensus_level(agreements, disagreements, 3)
        
        # Should be high with many agreements
        assert consensus > 0.5
        assert 0.0 <= consensus <= 1.0
    
    def test_calculate_consensus_level_with_disagreements(self, calculator):
        """Test consensus with disagreements"""
        agreements = {"theme_1": {"agreement_ratio": 0.6}}
        disagreements = {
            "div_1": {},
            "div_2": {}
        }
        
        consensus = calculator._calculate_consensus_level(agreements, disagreements, 3)
        
        # Disagreements should lower consensus
        assert consensus < 0.8
        assert 0.0 <= consensus <= 1.0
    
    def test_generate_recommendation_strong_consensus(self, calculator, sample_responses_high_agreement):
        """Test recommendation generation with strong consensus"""
        agreements = {
            "theme_clearance": {"theme": "clearance", "agreement_ratio": 0.9}
        }
        common_themes = ["clearance", "clinical", "trials"]
        consensus_level = 0.85
        
        recommendation = calculator._generate_recommendation(
            sample_responses_high_agreement,
            agreements,
            common_themes,
            consensus_level
        )
        
        assert len(recommendation) > 0
        assert "strong" in recommendation.lower()
        assert str(len(sample_responses_high_agreement)) in recommendation
    
    def test_generate_recommendation_weak_consensus(self, calculator, sample_responses_low_agreement):
        """Test recommendation with weak consensus"""
        agreements = {}
        common_themes = []
        consensus_level = 0.3
        
        recommendation = calculator._generate_recommendation(
            sample_responses_low_agreement,
            agreements,
            common_themes,
            consensus_level
        )
        
        assert len(recommendation) > 0
        assert "weak" in recommendation.lower()
        assert "additional expert input" in recommendation.lower() or "further analysis" in recommendation.lower()
    
    def test_identify_dissents(self, calculator):
        """Test dissenting opinion identification"""
        expert_points = {
            "expert_1": {"keywords": ["clinical", "trials", "safety"]},
            "expert_2": {"keywords": ["clinical", "trials", "efficacy"]},
            "expert_3": {"keywords": ["international", "harmonization", "standards"]}  # Very different
        }
        common_themes = ["clinical", "trials"]
        responses = [
            {"agent_id": "expert_1", "agent_name": "Expert 1", "content": "Clinical trials..."},
            {"agent_id": "expert_2", "agent_name": "Expert 2", "content": "Clinical data..."},
            {"agent_id": "expert_3", "agent_name": "Expert 3", "content": "International standards..."}
        ]
        
        dissents = calculator._identify_dissents(expert_points, common_themes, responses)
        
        # Expert 3 should be identified as dissenting
        assert "expert_3" in dissents
        assert dissents["expert_3"]["expert"] == "expert_3"
    
    def test_consensus_result_structure(self, calculator, sample_responses_high_agreement):
        """Test that result has all required fields"""
        result = calculator.calculate_consensus(
            sample_responses_high_agreement,
            "Test query"
        )
        
        assert isinstance(result, ConsensusResult)
        assert isinstance(result.consensus_level, float)
        assert isinstance(result.agreement_points, dict)
        assert isinstance(result.disagreement_points, dict)
        assert isinstance(result.recommendation, str)
        assert isinstance(result.dissenting_opinions, dict)
        assert isinstance(result.key_themes, list)
    
    def test_consensus_level_bounds(self, calculator, sample_responses_high_agreement):
        """Test consensus level is always between 0 and 1"""
        result = calculator.calculate_consensus(
            sample_responses_high_agreement,
            "Test query"
        )
        
        assert 0.0 <= result.consensus_level <= 1.0
    
    def test_single_response(self, calculator):
        """Test consensus with only one response"""
        responses = [{
            "agent_id": "expert_1",
            "agent_name": "Expert 1",
            "content": "This is the only expert opinion on the matter.",
            "confidence_score": 0.9
        }]
        
        result = calculator.calculate_consensus(responses, "What is your opinion?")
        
        # Should handle single response gracefully
        assert result.consensus_level >= 0.0
        assert len(result.recommendation) > 0


def test_create_consensus_calculator():
    """Test factory function"""
    calc = create_consensus_calculator(min_threshold=0.6)
    
    assert isinstance(calc, SimpleConsensusCalculator)
    assert calc.min_threshold == 0.6

