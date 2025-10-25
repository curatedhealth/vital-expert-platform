"""
Confidence Validation Tests using Expert-Labeled Dataset

Tests confidence calculation accuracy against ground truth labels
from expert-labeled validation dataset.

Target: >=85% accuracy (within ±0.10 of ground truth)

Run with: pytest tests/test_confidence_validation.py -v
"""

import pytest
import json
from pathlib import Path
from typing import Dict, Any, List
from unittest.mock import AsyncMock, patch
import numpy as np

from services.confidence_calculator import ConfidenceCalculator


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def validation_dataset():
    """Load validation dataset from JSON file"""
    dataset_path = Path(__file__).parent / "data" / "confidence_validation_dataset.json"

    with open(dataset_path, 'r') as f:
        return json.load(f)


@pytest.fixture
def confidence_calculator():
    """Create confidence calculator instance"""
    return ConfidenceCalculator()


# ============================================================================
# DATASET VALIDATION TESTS
# ============================================================================

@pytest.mark.unit
@pytest.mark.confidence
class TestDatasetValidation:
    """Validate the dataset itself is well-formed"""

    def test_dataset_structure(self, validation_dataset):
        """Test that dataset has correct structure"""
        assert "dataset_metadata" in validation_dataset
        assert "samples" in validation_dataset
        assert "validation_instructions" in validation_dataset

        metadata = validation_dataset["dataset_metadata"]
        assert metadata["version"] == "1.0.0"
        assert "total_samples" in metadata
        assert "target_accuracy" in metadata

    def test_all_samples_have_required_fields(self, validation_dataset):
        """Test that all samples have required fields"""
        required_fields = [
            "id", "domain", "query", "response",
            "agent_metadata", "rag_results",
            "ground_truth_confidence", "ground_truth_quality"
        ]

        samples = validation_dataset["samples"]
        assert len(samples) >= 10, "Should have at least 10 fully labeled samples"

        for sample in samples:
            for field in required_fields:
                assert field in sample, f"Sample {sample.get('id')} missing field: {field}"

    def test_ground_truth_confidence_in_valid_range(self, validation_dataset):
        """Test that all ground truth confidence values are in [0.0, 1.0]"""
        samples = validation_dataset["samples"]

        for sample in samples:
            confidence = sample["ground_truth_confidence"]
            assert 0.0 <= confidence <= 1.0, \
                f"Sample {sample['id']} has invalid confidence: {confidence}"

    def test_quality_labels_valid(self, validation_dataset):
        """Test that quality labels are valid"""
        valid_qualities = ["high", "medium", "low"]
        samples = validation_dataset["samples"]

        for sample in samples:
            quality = sample["ground_truth_quality"]
            assert quality in valid_qualities, \
                f"Sample {sample['id']} has invalid quality: {quality}"

    def test_confidence_quality_alignment(self, validation_dataset):
        """Test that confidence ranges align with quality labels"""
        samples = validation_dataset["samples"]

        for sample in samples:
            confidence = sample["ground_truth_confidence"]
            quality = sample["ground_truth_quality"]

            if quality == "high":
                assert 0.85 <= confidence <= 0.95, \
                    f"Sample {sample['id']}: high quality should be 0.85-0.95, got {confidence}"
            elif quality == "medium":
                assert 0.65 <= confidence <= 0.84, \
                    f"Sample {sample['id']}: medium quality should be 0.65-0.84, got {confidence}"
            elif quality == "low":
                assert 0.30 <= confidence <= 0.64, \
                    f"Sample {sample['id']}: low quality should be 0.30-0.64, got {confidence}"


# ============================================================================
# CONFIDENCE ACCURACY VALIDATION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.confidence
class TestConfidenceAccuracyValidation:
    """Validate confidence calculation accuracy against ground truth"""

    @pytest.mark.asyncio
    async def test_overall_accuracy_target_85_percent(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: Overall accuracy should be >=85% (within ±0.10)"""

        samples = validation_dataset["samples"]
        results = []

        # Mock embeddings to avoid network calls
        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            # Process all samples
            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                ground_truth = sample["ground_truth_confidence"]
                error = abs(calculated["confidence"] - ground_truth)
                within_threshold = error <= 0.10

                results.append({
                    "sample_id": sample["id"],
                    "calculated": calculated["confidence"],
                    "ground_truth": ground_truth,
                    "error": error,
                    "within_threshold": within_threshold,
                    "domain": sample["domain"],
                    "quality": sample["ground_truth_quality"]
                })

        # Calculate accuracy
        total_samples = len(results)
        accurate_samples = sum(1 for r in results if r["within_threshold"])
        accuracy = (accurate_samples / total_samples) * 100

        # Print detailed report
        print(f"\n{'='*70}")
        print(f"CONFIDENCE VALIDATION REPORT")
        print(f"{'='*70}")
        print(f"Total Samples:     {total_samples}")
        print(f"Accurate Samples:  {accurate_samples}")
        print(f"Accuracy:          {accuracy:.1f}%")
        print(f"Target:            >=85.0%")
        print(f"{'='*70}\n")

        # Print per-sample results
        print(f"{'ID':<12} {'Domain':<12} {'Quality':<8} {'Calc':<6} {'Truth':<6} {'Error':<6} {'OK':<4}")
        print(f"{'-'*70}")
        for r in results:
            ok_marker = "✓" if r["within_threshold"] else "✗"
            print(
                f"{r['sample_id']:<12} "
                f"{r['domain']:<12} "
                f"{r['quality']:<8} "
                f"{r['calculated']:<6.3f} "
                f"{r['ground_truth']:<6.3f} "
                f"{r['error']:<6.3f} "
                f"{ok_marker:<4}"
            )
        print(f"{'-'*70}\n")

        # Assertions
        assert accuracy >= 85.0, \
            f"Accuracy {accuracy:.1f}% below target 85.0%"

    @pytest.mark.asyncio
    async def test_high_quality_accuracy_target_90_percent(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: High quality samples should have >=90% accuracy (within ±0.08)"""

        samples = [s for s in validation_dataset["samples"] if s["ground_truth_quality"] == "high"]
        results = []

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                ground_truth = sample["ground_truth_confidence"]
                error = abs(calculated["confidence"] - ground_truth)
                within_threshold = error <= 0.08  # Stricter threshold for high quality

                results.append({
                    "sample_id": sample["id"],
                    "error": error,
                    "within_threshold": within_threshold
                })

        if len(results) > 0:
            accuracy = (sum(1 for r in results if r["within_threshold"]) / len(results)) * 100

            print(f"\nHigh Quality Accuracy: {accuracy:.1f}% (target >=90%)")

            assert accuracy >= 90.0, \
                f"High quality accuracy {accuracy:.1f}% below target 90.0%"

    @pytest.mark.asyncio
    async def test_no_false_high_confidence(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: No samples with calculated >0.85 when ground truth <0.60"""

        samples = [s for s in validation_dataset["samples"] if s["ground_truth_confidence"] < 0.60]
        false_highs = []

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                if calculated["confidence"] > 0.85:
                    false_highs.append({
                        "sample_id": sample["id"],
                        "calculated": calculated["confidence"],
                        "ground_truth": sample["ground_truth_confidence"]
                    })

        if false_highs:
            print(f"\nFALSE HIGH CONFIDENCE DETECTED:")
            for fh in false_highs:
                print(f"  {fh['sample_id']}: calculated={fh['calculated']:.3f}, truth={fh['ground_truth']:.3f}")

        assert len(false_highs) == 0, \
            f"Found {len(false_highs)} false high confidence predictions"

    @pytest.mark.asyncio
    async def test_no_false_low_confidence(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: No samples with calculated <0.60 when ground truth >0.85"""

        samples = [s for s in validation_dataset["samples"] if s["ground_truth_confidence"] > 0.85]
        false_lows = []

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                if calculated["confidence"] < 0.60:
                    false_lows.append({
                        "sample_id": sample["id"],
                        "calculated": calculated["confidence"],
                        "ground_truth": sample["ground_truth_confidence"]
                    })

        if false_lows:
            print(f"\nFALSE LOW CONFIDENCE DETECTED:")
            for fl in false_lows:
                print(f"  {fl['sample_id']}: calculated={fl['calculated']:.3f}, truth={fl['ground_truth']:.3f}")

        assert len(false_lows) == 0, \
            f"Found {len(false_lows)} false low confidence predictions"


# ============================================================================
# BIAS DETECTION TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.confidence
class TestBiasDetection:
    """Detect systematic biases in confidence calculation"""

    @pytest.mark.asyncio
    async def test_no_systematic_overconfidence_bias(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: Mean error should not exceed +0.05 (overconfidence bias)"""

        samples = validation_dataset["samples"]
        errors = []

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                # Signed error (positive = overconfident, negative = underconfident)
                error = calculated["confidence"] - sample["ground_truth_confidence"]
                errors.append(error)

        mean_error = np.mean(errors)

        print(f"\nBias Analysis:")
        print(f"  Mean Error: {mean_error:+.3f}")
        print(f"  Std Error:  {np.std(errors):.3f}")
        print(f"  Bias Threshold: ±0.05")

        if mean_error > 0:
            print(f"  → Overconfidence bias detected")
        elif mean_error < 0:
            print(f"  → Underconfidence bias detected")
        else:
            print(f"  → No significant bias")

        assert abs(mean_error) <= 0.05, \
            f"Systematic bias detected: mean error {mean_error:+.3f} exceeds ±0.05 threshold"

    @pytest.mark.asyncio
    async def test_per_domain_accuracy(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: Analyze accuracy per domain (regulatory, clinical, medical)"""

        samples = validation_dataset["samples"]
        domain_results = {}

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                domain = sample["domain"]
                if domain not in domain_results:
                    domain_results[domain] = []

                error = abs(calculated["confidence"] - sample["ground_truth_confidence"])
                within_threshold = error <= 0.10

                domain_results[domain].append({
                    "error": error,
                    "within_threshold": within_threshold
                })

        print(f"\nPer-Domain Accuracy:")
        print(f"{'Domain':<15} {'Samples':<10} {'Accuracy':<10} {'Mean Error':<12}")
        print(f"{'-'*50}")

        for domain, results in domain_results.items():
            accuracy = (sum(1 for r in results if r["within_threshold"]) / len(results)) * 100
            mean_error = np.mean([r["error"] for r in results])

            print(f"{domain:<15} {len(results):<10} {accuracy:<10.1f}% {mean_error:<12.3f}")

        # All domains should achieve at least 75% accuracy
        for domain, results in domain_results.items():
            accuracy = (sum(1 for r in results if r["within_threshold"]) / len(results)) * 100
            assert accuracy >= 75.0, \
                f"Domain '{domain}' accuracy {accuracy:.1f}% below 75% minimum"

    @pytest.mark.asyncio
    async def test_per_tier_accuracy(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Test: Analyze accuracy per agent tier"""

        samples = validation_dataset["samples"]
        tier_results = {}

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                tier = sample["agent_metadata"]["tier"]
                if tier not in tier_results:
                    tier_results[tier] = []

                error = abs(calculated["confidence"] - sample["ground_truth_confidence"])
                within_threshold = error <= 0.10

                tier_results[tier].append({
                    "error": error,
                    "within_threshold": within_threshold
                })

        print(f"\nPer-Tier Accuracy:")
        print(f"{'Tier':<10} {'Samples':<10} {'Accuracy':<10} {'Mean Error':<12}")
        print(f"{'-'*45}")

        for tier in sorted(tier_results.keys()):
            results = tier_results[tier]
            accuracy = (sum(1 for r in results if r["within_threshold"]) / len(results)) * 100
            mean_error = np.mean([r["error"] for r in results])

            print(f"Tier {tier:<5} {len(results):<10} {accuracy:<10.1f}% {mean_error:<12.3f}")


# ============================================================================
# ERROR ANALYSIS TESTS
# ============================================================================

@pytest.mark.integration
@pytest.mark.confidence
class TestErrorAnalysis:
    """Analyze error patterns and identify problematic cases"""

    @pytest.mark.asyncio
    async def test_identify_high_error_samples(
        self,
        confidence_calculator,
        validation_dataset
    ):
        """Identify samples with error >0.15 (concerning) or >0.25 (critical)"""

        samples = validation_dataset["samples"]
        concerning_errors = []
        critical_errors = []

        with patch.object(confidence_calculator.embeddings, 'aembed_query') as mock_embed:
            async def fake_embed(text: str) -> List[float]:
                np.random.seed(hash(text) % (2**32))
                return np.random.rand(1536).tolist()
            mock_embed.side_effect = fake_embed

            for sample in samples:
                calculated = await confidence_calculator.calculate_confidence(
                    query=sample["query"],
                    response=sample["response"],
                    agent_metadata=sample["agent_metadata"],
                    rag_results=sample["rag_results"]
                )

                error = abs(calculated["confidence"] - sample["ground_truth_confidence"])

                if error > 0.25:
                    critical_errors.append({
                        "sample_id": sample["id"],
                        "error": error,
                        "calculated": calculated["confidence"],
                        "ground_truth": sample["ground_truth_confidence"]
                    })
                elif error > 0.15:
                    concerning_errors.append({
                        "sample_id": sample["id"],
                        "error": error,
                        "calculated": calculated["confidence"],
                        "ground_truth": sample["ground_truth_confidence"]
                    })

        if critical_errors:
            print(f"\nCRITICAL ERRORS (>0.25):")
            for err in critical_errors:
                print(f"  {err['sample_id']}: error={err['error']:.3f}, "
                      f"calc={err['calculated']:.3f}, truth={err['ground_truth']:.3f}")

        if concerning_errors:
            print(f"\nCONCERNING ERRORS (0.15-0.25):")
            for err in concerning_errors:
                print(f"  {err['sample_id']}: error={err['error']:.3f}, "
                      f"calc={err['calculated']:.3f}, truth={err['ground_truth']:.3f}")

        # Should have zero critical errors
        assert len(critical_errors) == 0, \
            f"Found {len(critical_errors)} critical errors (>0.25)"

        # Should have minimal concerning errors
        concerning_rate = (len(concerning_errors) / len(samples)) * 100
        assert concerning_rate < 15.0, \
            f"Concerning error rate {concerning_rate:.1f}% exceeds 15% threshold"
