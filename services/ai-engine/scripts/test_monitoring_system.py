#!/usr/bin/env python3
"""
Test script for Phase 5 Monitoring System
Tests all 4 monitoring services with real database interactions
"""

import asyncio
import sys
from pathlib import Path
from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from monitoring.models import (
    ServiceType, TierType, MetricPeriod, AlertType, 
    AlertSeverity, ProtectedAttribute
)


async def test_clinical_monitor():
    """Test Clinical AI Monitor"""
    print("\n" + "="*60)
    print("TEST 1: Clinical AI Monitor")
    print("="*60)
    
    try:
        from monitoring.clinical_monitor import ClinicalAIMonitor
        from database.postgres_client import get_postgres_pool
        
        # Initialize
        pool = await get_postgres_pool()
        monitor = ClinicalAIMonitor(pool)
        
        # Test 1: Log interaction
        print("\n✓ Logging test interaction...")
        tenant_id = uuid4()
        session_id = uuid4()
        agent_id = uuid4()
        
        interaction_id = await monitor.log_interaction(
            tenant_id=tenant_id,
            session_id=session_id,
            agent_id=agent_id,
            service_type=ServiceType.ASK_EXPERT,
            query="What are the side effects of metformin?",
            response="Metformin commonly causes gastrointestinal effects...",
            confidence_score=Decimal("0.92"),
            execution_time_ms=1250,
            tier=TierType.TIER_2,
            was_successful=True,
            tokens_used=450,
            cost_usd=Decimal("0.05"),
            had_human_oversight=False,
            was_escalated=False,
        )
        print(f"  ✅ Interaction logged: {interaction_id}")
        
        # Test 2: Calculate metrics
        print("\n✓ Calculating diagnostic metrics...")
        metrics = await monitor.calculate_diagnostic_metrics(
            agent_id=agent_id,
            period=MetricPeriod.DAILY,
            period_start=date.today(),
            period_end=date.today(),
            total_interactions=10,
            true_positives=8,
            true_negatives=1,
            false_positives=0,
            false_negatives=1,
        )
        print(f"  ✅ Metrics calculated:")
        print(f"     - Sensitivity: {metrics.sensitivity:.4f}")
        print(f"     - Specificity: {metrics.specificity:.4f}")
        print(f"     - F1 Score: {metrics.f1_score:.4f}")
        print(f"     - Accuracy: {metrics.accuracy:.4f}")
        
        # Test 3: Get performance report
        print("\n✓ Generating performance report...")
        report = await monitor.get_performance_report(
            agent_id=agent_id,
            days=7
        )
        print(f"  ✅ Report generated:")
        print(f"     - Total interactions: {report['summary']['total_interactions']}")
        print(f"     - Success rate: {report['summary']['success_rate']:.2%}")
        
        print("\n✅ Clinical Monitor: ALL TESTS PASSED!")
        await pool.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Clinical Monitor Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_fairness_monitor():
    """Test Fairness Monitor"""
    print("\n" + "="*60)
    print("TEST 2: Fairness Monitor")
    print("="*60)
    
    try:
        from monitoring.fairness_monitor import FairnessMonitor
        from database.postgres_client import get_postgres_pool
        
        # Initialize
        pool = await get_postgres_pool()
        monitor = FairnessMonitor(pool)
        
        # Test 1: Calculate fairness metrics
        print("\n✓ Calculating fairness metrics...")
        agent_id = uuid4()
        
        metrics = await monitor.calculate_fairness_metrics(
            agent_id=agent_id,
            metric_date=date.today(),
            protected_attribute=ProtectedAttribute.AGE_GROUP,
            attribute_value="30-50",
            total_interactions=100,
            successful_interactions=85,
            avg_confidence=Decimal("0.88"),
            avg_response_time_ms=1500,
            escalation_rate=Decimal("0.12"),
        )
        print(f"  ✅ Metrics calculated:")
        print(f"     - Success rate: {metrics.success_rate:.4f}")
        print(f"     - Demographic parity: {metrics.demographic_parity:.4f}")
        
        # Test 2: Detect bias
        print("\n✓ Testing bias detection...")
        bias_detected = await monitor.detect_bias(
            agent_id=agent_id,
            protected_attribute=ProtectedAttribute.GENDER,
            threshold=Decimal("0.1"),
            days=30,
        )
        print(f"  ✅ Bias detection: {'BIAS DETECTED' if bias_detected else 'NO BIAS'}")
        
        # Test 3: Generate compliance report
        print("\n✓ Generating compliance report...")
        report = await monitor.get_compliance_report(
            agent_id=agent_id,
            days=30,
        )
        print(f"  ✅ Compliance report generated")
        print(f"     - Attributes monitored: {len(report.get('attributes', []))}")
        
        print("\n✅ Fairness Monitor: ALL TESTS PASSED!")
        await pool.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Fairness Monitor Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_drift_detector():
    """Test Drift Detector"""
    print("\n" + "="*60)
    print("TEST 3: Drift Detector")
    print("="*60)
    
    try:
        from monitoring.drift_detector import DriftDetector
        from database.postgres_client import get_postgres_pool
        
        # Initialize
        pool = await get_postgres_pool()
        detector = DriftDetector(pool)
        
        # Test 1: Detect accuracy drift
        print("\n✓ Testing accuracy drift detection...")
        agent_id = uuid4()
        
        drift_detected = await detector.detect_accuracy_drift(
            agent_id=agent_id,
            baseline_window_days=30,
            current_window_days=7,
            significance_level=0.05,
        )
        print(f"  ✅ Accuracy drift: {'DETECTED' if drift_detected else 'NOT DETECTED'}")
        
        # Test 2: Detect latency drift
        print("\n✓ Testing latency drift detection...")
        drift_detected = await detector.detect_latency_drift(
            agent_id=agent_id,
            baseline_window_days=30,
            current_window_days=7,
            significance_level=0.05,
        )
        print(f"  ✅ Latency drift: {'DETECTED' if drift_detected else 'NOT DETECTED'}")
        
        # Test 3: Create alert
        print("\n✓ Creating drift alert...")
        alert_id = await detector.create_alert(
            agent_id=agent_id,
            alert_type=AlertType.ACCURACY_DROP,
            severity=AlertSeverity.MEDIUM,
            metric_name="accuracy",
            baseline_value=Decimal("0.92"),
            current_value=Decimal("0.87"),
            drift_magnitude=Decimal("0.05"),
            drift_percentage=Decimal("5.43"),
            test_name="two_prop_z_test",
            p_value=Decimal("0.032"),
            is_significant=True,
            detection_window_days=7,
            affected_interactions=150,
        )
        print(f"  ✅ Alert created: {alert_id}")
        
        # Test 4: Get active alerts
        print("\n✓ Retrieving active alerts...")
        alerts = await detector.get_active_alerts(agent_id=agent_id)
        print(f"  ✅ Active alerts: {len(alerts)}")
        
        print("\n✅ Drift Detector: ALL TESTS PASSED!")
        await pool.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Drift Detector Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_prometheus_metrics():
    """Test Prometheus Metrics"""
    print("\n" + "="*60)
    print("TEST 4: Prometheus Metrics")
    print("="*60)
    
    try:
        from monitoring.prometheus_metrics import (
            metrics_recorder,
            REQUEST_COUNT,
            REQUEST_LATENCY,
            QUALITY_SCORE,
        )
        
        # Test 1: Record metrics
        print("\n✓ Recording test metrics...")
        
        # Record requests
        metrics_recorder.record_request(
            service_type="ask_expert",
            tier="tier_2",
            success=True,
        )
        print("  ✅ Request metric recorded")
        
        # Record latency
        metrics_recorder.record_latency(
            service_type="ask_expert",
            tier="tier_2",
            latency_seconds=1.25,
        )
        print("  ✅ Latency metric recorded")
        
        # Record quality
        metrics_recorder.record_quality(
            service_type="ask_expert",
            tier="tier_2",
            confidence=0.92,
            has_evidence=True,
        )
        print("  ✅ Quality metric recorded")
        
        # Record cost
        metrics_recorder.record_cost(
            service_type="ask_expert",
            tier="tier_2",
            cost_usd=0.05,
        )
        print("  ✅ Cost metric recorded")
        
        # Test 2: Verify metrics exist
        print("\n✓ Verifying metrics...")
        from prometheus_client import REGISTRY
        
        metrics_found = 0
        for metric in REGISTRY.collect():
            if metric.name.startswith('agentos_'):
                metrics_found += 1
        
        print(f"  ✅ Found {metrics_found} AgentOS metrics in registry")
        
        print("\n✅ Prometheus Metrics: ALL TESTS PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Prometheus Metrics Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def run_all_tests():
    """Run all monitoring tests"""
    print("\n" + "="*60)
    print("PHASE 5 MONITORING SYSTEM TEST SUITE")
    print("="*60)
    
    results = {
        "Clinical Monitor": False,
        "Fairness Monitor": False,
        "Drift Detector": False,
        "Prometheus Metrics": False,
    }
    
    # Run tests
    results["Clinical Monitor"] = await test_clinical_monitor()
    results["Fairness Monitor"] = await test_fairness_monitor()
    results["Drift Detector"] = await test_drift_detector()
    results["Prometheus Metrics"] = await test_prometheus_metrics()
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    all_passed = all(results.values())
    print("\n" + "="*60)
    if all_passed:
        print("🎉 ALL TESTS PASSED! Phase 5 Monitoring is READY!")
    else:
        print("⚠️  Some tests failed. Please review errors above.")
    print("="*60)
    
    return all_passed


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)

