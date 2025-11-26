"""
Drift Detector for AgentOS 3.0
Detects performance drift and quality degradation over time
"""

from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
import statistics

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from scipy import stats

from monitoring.models import (
    DriftAlert,
    AlertType,
    AlertSeverity,
    AlertStatus,
)

logger = structlog.get_logger(__name__)


class DriftDetector:
    """
    Drift Detector for monitoring performance degradation
    
    Implements statistical tests:
    - Kolmogorov-Smirnov test for distribution drift
    - T-test for mean changes
    - Chi-square for categorical distributions
    
    Alert thresholds:
    - Accuracy drop > 5%
    - Latency increase > 20%
    - Cost spike > 30%
    - Confidence drop > 10%
    """
    
    # Drift detection thresholds
    ACCURACY_DROP_THRESHOLD = 0.05  # 5% drop
    LATENCY_INCREASE_THRESHOLD = 0.20  # 20% increase
    COST_SPIKE_THRESHOLD = 0.30  # 30% increase
    CONFIDENCE_DROP_THRESHOLD = 0.10  # 10% drop
    
    # Statistical significance threshold
    SIGNIFICANCE_LEVEL = 0.05  # p < 0.05
    
    # Minimum sample sizes for valid comparison
    MIN_BASELINE_SAMPLES = 30
    MIN_CURRENT_SAMPLES = 10
    
    def __init__(self, db_session: AsyncSession):
        """
        Initialize Drift Detector
        
        Args:
            db_session: AsyncPG database session
        """
        self.db = db_session
        self.logger = logger.bind(component="drift_detector")
    
    # ========================================================================
    # ACCURACY DRIFT DETECTION
    # ========================================================================
    
    async def detect_accuracy_drift(
        self,
        agent_id: UUID,
        baseline_days: int = 30,
        current_days: int = 7,
    ) -> Optional[DriftAlert]:
        """
        Detect accuracy drift using success rate comparison
        
        Uses two-proportion z-test to determine if success rates differ significantly
        
        Args:
            agent_id: Agent identifier
            baseline_days: Days to use as baseline (default 30)
            current_days: Recent days to compare (default 7)
        
        Returns:
            DriftAlert if significant drift detected, None otherwise
        """
        try:
            # Get baseline period
            baseline_end = date.today() - timedelta(days=current_days)
            baseline_start = baseline_end - timedelta(days=baseline_days)
            
            # Get current period
            current_end = date.today()
            current_start = current_end - timedelta(days=current_days)
            
            # Fetch baseline accuracy
            baseline_query = """
                SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE was_successful = true) as successful
                FROM agent_interaction_logs
                WHERE agent_id = :agent_id
                  AND created_at::date >= :start_date
                  AND created_at::date <= :end_date
            """
            
            baseline_result = await self.db.execute(
                text(baseline_query),
                {"agent_id": str(agent_id), "start_date": baseline_start, "end_date": baseline_end}
            )
            baseline_row = baseline_result.fetchone()
            
            # Fetch current accuracy
            current_result = await self.db.execute(
                text(baseline_query),
                {"agent_id": str(agent_id), "start_date": current_start, "end_date": current_end}
            )
            current_row = current_result.fetchone()
            
            # Check minimum sample sizes
            if baseline_row.total < self.MIN_BASELINE_SAMPLES or current_row.total < self.MIN_CURRENT_SAMPLES:
                self.logger.debug(
                    "accuracy_drift_insufficient_samples",
                    agent_id=str(agent_id)[:8],
                    baseline_samples=baseline_row.total,
                    current_samples=current_row.total,
                )
                return None
            
            # Calculate success rates
            baseline_rate = baseline_row.successful / baseline_row.total
            current_rate = current_row.successful / current_row.total
            
            # Calculate drift
            drift_magnitude = baseline_rate - current_rate
            drift_percentage = (drift_magnitude / baseline_rate) * 100 if baseline_rate > 0 else 0
            
            # Two-proportion z-test
            p_value = self._two_proportion_z_test(
                baseline_row.successful, baseline_row.total,
                current_row.successful, current_row.total
            )
            
            is_significant = p_value < self.SIGNIFICANCE_LEVEL
            
            # Check if drift exceeds threshold
            if drift_magnitude >= self.ACCURACY_DROP_THRESHOLD and is_significant:
                severity = self._determine_severity(drift_magnitude, self.ACCURACY_DROP_THRESHOLD)
                
                alert = DriftAlert(
                    agent_id=agent_id,
                    alert_type=AlertType.ACCURACY_DROP,
                    severity=severity,
                    metric_name="accuracy",
                    baseline_value=Decimal(str(baseline_rate)),
                    current_value=Decimal(str(current_rate)),
                    drift_magnitude=Decimal(str(drift_magnitude)),
                    drift_percentage=Decimal(str(drift_percentage)),
                    test_name="two_proportion_z_test",
                    p_value=Decimal(str(p_value)),
                    is_significant=is_significant,
                    detection_window_days=current_days,
                    affected_interactions=current_row.total,
                )
                
                await self._save_alert(alert)
                
                self.logger.warning(
                    "accuracy_drift_detected",
                    agent_id=str(agent_id)[:8],
                    baseline=f"{baseline_rate:.2%}",
                    current=f"{current_rate:.2%}",
                    drift=f"{drift_magnitude:.2%}",
                    p_value=p_value,
                    severity=severity.value,
                )
                
                return alert
            
            return None
            
        except Exception as e:
            self.logger.error("accuracy_drift_detection_failed", error=str(e), agent_id=str(agent_id)[:8])
            return None
    
    def _two_proportion_z_test(
        self,
        successes1: int,
        total1: int,
        successes2: int,
        total2: int,
    ) -> float:
        """
        Two-proportion z-test for comparing success rates
        
        Returns p-value (two-tailed)
        """
        p1 = successes1 / total1
        p2 = successes2 / total2
        
        # Pooled proportion
        p_pool = (successes1 + successes2) / (total1 + total2)
        
        # Standard error
        se = ((p_pool * (1 - p_pool)) * (1/total1 + 1/total2)) ** 0.5
        
        # Z-score
        z = (p1 - p2) / se if se > 0 else 0
        
        # Two-tailed p-value
        p_value = 2 * (1 - stats.norm.cdf(abs(z)))
        
        return p_value
    
    # ========================================================================
    # LATENCY DRIFT DETECTION
    # ========================================================================
    
    async def detect_latency_drift(
        self,
        agent_id: UUID,
        baseline_days: int = 30,
        current_days: int = 7,
    ) -> Optional[DriftAlert]:
        """
        Detect latency drift using t-test on response times
        
        Args:
            agent_id: Agent identifier
            baseline_days: Days to use as baseline
            current_days: Recent days to compare
        
        Returns:
            DriftAlert if significant drift detected, None otherwise
        """
        try:
            # Get baseline and current response times
            baseline_times = await self._fetch_response_times(
                agent_id,
                date.today() - timedelta(days=baseline_days + current_days),
                date.today() - timedelta(days=current_days)
            )
            
            current_times = await self._fetch_response_times(
                agent_id,
                date.today() - timedelta(days=current_days),
                date.today()
            )
            
            # Check minimum samples
            if len(baseline_times) < self.MIN_BASELINE_SAMPLES or len(current_times) < self.MIN_CURRENT_SAMPLES:
                return None
            
            # Calculate means
            baseline_mean = statistics.mean(baseline_times)
            current_mean = statistics.mean(current_times)
            
            # Calculate drift
            drift_magnitude = current_mean - baseline_mean
            drift_percentage = (drift_magnitude / baseline_mean) * 100 if baseline_mean > 0 else 0
            
            # Independent t-test
            t_stat, p_value = stats.ttest_ind(current_times, baseline_times)
            is_significant = p_value < self.SIGNIFICANCE_LEVEL
            
            # Check if latency increased significantly
            if (drift_magnitude / baseline_mean) >= self.LATENCY_INCREASE_THRESHOLD and is_significant:
                severity = self._determine_severity(
                    drift_magnitude / baseline_mean,
                    self.LATENCY_INCREASE_THRESHOLD
                )
                
                alert = DriftAlert(
                    agent_id=agent_id,
                    alert_type=AlertType.LATENCY_INCREASE,
                    severity=severity,
                    metric_name="response_time_ms",
                    baseline_value=Decimal(str(baseline_mean)),
                    current_value=Decimal(str(current_mean)),
                    drift_magnitude=Decimal(str(drift_magnitude)),
                    drift_percentage=Decimal(str(drift_percentage)),
                    test_name="t_test",
                    p_value=Decimal(str(p_value)),
                    is_significant=is_significant,
                    detection_window_days=current_days,
                    affected_interactions=len(current_times),
                )
                
                await self._save_alert(alert)
                
                self.logger.warning(
                    "latency_drift_detected",
                    agent_id=str(agent_id)[:8],
                    baseline_ms=baseline_mean,
                    current_ms=current_mean,
                    increase_pct=drift_percentage,
                    severity=severity.value,
                )
                
                return alert
            
            return None
            
        except Exception as e:
            self.logger.error("latency_drift_detection_failed", error=str(e), agent_id=str(agent_id)[:8])
            return None
    
    async def _fetch_response_times(
        self,
        agent_id: UUID,
        start_date: date,
        end_date: date,
    ) -> List[float]:
        """Fetch response times for a period"""
        query = """
            SELECT execution_time_ms
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date >= :start_date
              AND created_at::date <= :end_date
              AND execution_time_ms IS NOT NULL
            ORDER BY created_at
        """
        
        result = await self.db.execute(
            text(query),
            {"agent_id": str(agent_id), "start_date": start_date, "end_date": end_date}
        )
        
        return [float(row.execution_time_ms) for row in result]
    
    # ========================================================================
    # COST DRIFT DETECTION
    # ========================================================================
    
    async def detect_cost_drift(
        self,
        agent_id: UUID,
        baseline_days: int = 30,
        current_days: int = 7,
    ) -> Optional[DriftAlert]:
        """
        Detect cost drift (per-query cost increase)
        
        Args:
            agent_id: Agent identifier
            baseline_days: Days to use as baseline
            current_days: Recent days to compare
        
        Returns:
            DriftAlert if significant cost spike detected
        """
        try:
            # Calculate average cost per query for both periods
            cost_query = """
                SELECT
                    AVG(cost_usd) as avg_cost,
                    COUNT(*) as total_queries
                FROM agent_interaction_logs
                WHERE agent_id = :agent_id
                  AND created_at::date >= :start_date
                  AND created_at::date <= :end_date
                  AND cost_usd IS NOT NULL
            """
            
            # Baseline period
            baseline_end = date.today() - timedelta(days=current_days)
            baseline_start = baseline_end - timedelta(days=baseline_days)
            
            baseline_result = await self.db.execute(
                text(cost_query),
                {"agent_id": str(agent_id), "start_date": baseline_start, "end_date": baseline_end}
            )
            baseline_row = baseline_result.fetchone()
            
            # Current period
            current_start = date.today() - timedelta(days=current_days)
            current_end = date.today()
            
            current_result = await self.db.execute(
                text(cost_query),
                {"agent_id": str(agent_id), "start_date": current_start, "end_date": current_end}
            )
            current_row = current_result.fetchone()
            
            # Check data availability
            if not baseline_row.avg_cost or not current_row.avg_cost:
                return None
            
            if baseline_row.total_queries < self.MIN_BASELINE_SAMPLES or current_row.total_queries < self.MIN_CURRENT_SAMPLES:
                return None
            
            baseline_cost = float(baseline_row.avg_cost)
            current_cost = float(current_row.avg_cost)
            
            # Calculate drift
            drift_magnitude = current_cost - baseline_cost
            drift_percentage = (drift_magnitude / baseline_cost) * 100 if baseline_cost > 0 else 0
            
            # Check if cost spike exceeds threshold
            if (drift_magnitude / baseline_cost) >= self.COST_SPIKE_THRESHOLD:
                severity = self._determine_severity(
                    drift_magnitude / baseline_cost,
                    self.COST_SPIKE_THRESHOLD
                )
                
                alert = DriftAlert(
                    agent_id=agent_id,
                    alert_type=AlertType.COST_SPIKE,
                    severity=severity,
                    metric_name="cost_per_query_usd",
                    baseline_value=Decimal(str(baseline_cost)),
                    current_value=Decimal(str(current_cost)),
                    drift_magnitude=Decimal(str(drift_magnitude)),
                    drift_percentage=Decimal(str(drift_percentage)),
                    test_name="mean_comparison",
                    p_value=None,
                    is_significant=True,
                    detection_window_days=current_days,
                    affected_interactions=current_row.total_queries,
                )
                
                await self._save_alert(alert)
                
                self.logger.warning(
                    "cost_drift_detected",
                    agent_id=str(agent_id)[:8],
                    baseline_cost=baseline_cost,
                    current_cost=current_cost,
                    increase_pct=drift_percentage,
                    severity=severity.value,
                )
                
                return alert
            
            return None
            
        except Exception as e:
            self.logger.error("cost_drift_detection_failed", error=str(e), agent_id=str(agent_id)[:8])
            return None
    
    # ========================================================================
    # CONFIDENCE DRIFT DETECTION
    # ========================================================================
    
    async def detect_confidence_drift(
        self,
        agent_id: UUID,
        baseline_days: int = 30,
        current_days: int = 7,
    ) -> Optional[DriftAlert]:
        """
        Detect confidence score drift (indicates model uncertainty increase)
        
        Args:
            agent_id: Agent identifier
            baseline_days: Days to use as baseline
            current_days: Recent days to compare
        
        Returns:
            DriftAlert if significant confidence drop detected
        """
        try:
            # Fetch confidence scores
            baseline_scores = await self._fetch_confidence_scores(
                agent_id,
                date.today() - timedelta(days=baseline_days + current_days),
                date.today() - timedelta(days=current_days)
            )
            
            current_scores = await self._fetch_confidence_scores(
                agent_id,
                date.today() - timedelta(days=current_days),
                date.today()
            )
            
            if len(baseline_scores) < self.MIN_BASELINE_SAMPLES or len(current_scores) < self.MIN_CURRENT_SAMPLES:
                return None
            
            baseline_mean = statistics.mean(baseline_scores)
            current_mean = statistics.mean(current_scores)
            
            drift_magnitude = baseline_mean - current_mean  # Drop in confidence
            drift_percentage = (drift_magnitude / baseline_mean) * 100 if baseline_mean > 0 else 0
            
            # Kolmogorov-Smirnov test for distribution change
            ks_stat, p_value = stats.ks_2samp(baseline_scores, current_scores)
            is_significant = p_value < self.SIGNIFICANCE_LEVEL
            
            if drift_magnitude >= self.CONFIDENCE_DROP_THRESHOLD and is_significant:
                severity = self._determine_severity(drift_magnitude, self.CONFIDENCE_DROP_THRESHOLD)
                
                alert = DriftAlert(
                    agent_id=agent_id,
                    alert_type=AlertType.CONFIDENCE_DROP,
                    severity=severity,
                    metric_name="confidence_score",
                    baseline_value=Decimal(str(baseline_mean)),
                    current_value=Decimal(str(current_mean)),
                    drift_magnitude=Decimal(str(drift_magnitude)),
                    drift_percentage=Decimal(str(drift_percentage)),
                    test_name="kolmogorov_smirnov",
                    p_value=Decimal(str(p_value)),
                    is_significant=is_significant,
                    detection_window_days=current_days,
                    affected_interactions=len(current_scores),
                )
                
                await self._save_alert(alert)
                
                self.logger.warning(
                    "confidence_drift_detected",
                    agent_id=str(agent_id)[:8],
                    baseline=f"{baseline_mean:.2%}",
                    current=f"{current_mean:.2%}",
                    drop=f"{drift_magnitude:.2%}",
                    severity=severity.value,
                )
                
                return alert
            
            return None
            
        except Exception as e:
            self.logger.error("confidence_drift_detection_failed", error=str(e), agent_id=str(agent_id)[:8])
            return None
    
    async def _fetch_confidence_scores(
        self,
        agent_id: UUID,
        start_date: date,
        end_date: date,
    ) -> List[float]:
        """Fetch confidence scores for a period"""
        query = """
            SELECT confidence_score
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date >= :start_date
              AND created_at::date <= :end_date
              AND confidence_score IS NOT NULL
            ORDER BY created_at
        """
        
        result = await self.db.execute(
            text(query),
            {"agent_id": str(agent_id), "start_date": start_date, "end_date": end_date}
        )
        
        return [float(row.confidence_score) for row in result]
    
    # ========================================================================
    # COMPREHENSIVE DRIFT CHECK
    # ========================================================================
    
    async def check_all_drift(
        self,
        agent_id: UUID,
        baseline_days: int = 30,
        current_days: int = 7,
    ) -> List[DriftAlert]:
        """
        Run all drift detection checks for an agent
        
        Args:
            agent_id: Agent identifier
            baseline_days: Days for baseline
            current_days: Recent days to check
        
        Returns:
            List of detected drift alerts
        """
        alerts = []
        
        # Check accuracy drift
        accuracy_alert = await self.detect_accuracy_drift(agent_id, baseline_days, current_days)
        if accuracy_alert:
            alerts.append(accuracy_alert)
        
        # Check latency drift
        latency_alert = await self.detect_latency_drift(agent_id, baseline_days, current_days)
        if latency_alert:
            alerts.append(latency_alert)
        
        # Check cost drift
        cost_alert = await self.detect_cost_drift(agent_id, baseline_days, current_days)
        if cost_alert:
            alerts.append(cost_alert)
        
        # Check confidence drift
        confidence_alert = await self.detect_confidence_drift(agent_id, baseline_days, current_days)
        if confidence_alert:
            alerts.append(confidence_alert)
        
        if alerts:
            self.logger.info(
                "drift_check_complete",
                agent_id=str(agent_id)[:8],
                alerts_detected=len(alerts),
                alert_types=[a.alert_type.value for a in alerts],
            )
        
        return alerts
    
    # ========================================================================
    # ALERT MANAGEMENT
    # ========================================================================
    
    async def _save_alert(self, alert: DriftAlert) -> None:
        """Save drift alert to database"""
        query = """
            INSERT INTO agent_drift_alerts (
                agent_id, alert_type, severity, metric_name,
                baseline_value, current_value, drift_magnitude, drift_percentage,
                test_name, p_value, is_significant,
                detection_window_days, affected_interactions, status
            ) VALUES (
                :agent_id, :alert_type, :severity, :metric_name,
                :baseline_value, :current_value, :drift_magnitude, :drift_percentage,
                :test_name, :p_value, :is_significant,
                :detection_window_days, :affected_interactions, :status
            )
            RETURNING id
        """
        
        result = await self.db.execute(
            text(query),
            {
                "agent_id": str(alert.agent_id),
                "alert_type": alert.alert_type.value,
                "severity": alert.severity.value,
                "metric_name": alert.metric_name,
                "baseline_value": float(alert.baseline_value) if alert.baseline_value else None,
                "current_value": float(alert.current_value) if alert.current_value else None,
                "drift_magnitude": float(alert.drift_magnitude) if alert.drift_magnitude else None,
                "drift_percentage": float(alert.drift_percentage) if alert.drift_percentage else None,
                "test_name": alert.test_name,
                "p_value": float(alert.p_value) if alert.p_value else None,
                "is_significant": alert.is_significant,
                "detection_window_days": alert.detection_window_days,
                "affected_interactions": alert.affected_interactions,
                "status": alert.status.value,
            }
        )
        
        await self.db.commit()
        alert.id = UUID(result.scalar_one())
    
    async def resolve_alert(
        self,
        alert_id: UUID,
        resolution_notes: str,
        resolved_by: Optional[str] = None,
    ) -> None:
        """Mark an alert as resolved"""
        query = """
            UPDATE agent_drift_alerts
            SET status = 'resolved',
                resolved_at = NOW(),
                resolution_notes = :notes,
                assigned_to = :resolved_by,
                updated_at = NOW()
            WHERE id = :alert_id
        """
        
        await self.db.execute(
            text(query),
            {"alert_id": str(alert_id), "notes": resolution_notes, "resolved_by": resolved_by}
        )
        await self.db.commit()
        
        self.logger.info("drift_alert_resolved", alert_id=str(alert_id)[:8])
    
    def _determine_severity(self, magnitude: float, threshold: float) -> AlertSeverity:
        """Determine alert severity based on magnitude"""
        ratio = magnitude / threshold
        
        if ratio >= 3.0:
            return AlertSeverity.CRITICAL
        elif ratio >= 2.0:
            return AlertSeverity.HIGH
        elif ratio >= 1.5:
            return AlertSeverity.MEDIUM
        else:
            return AlertSeverity.LOW


# ============================================================================
# Singleton accessor
# ============================================================================

_drift_detector_instance: Optional[DriftDetector] = None


async def get_drift_detector(db_session: AsyncSession) -> DriftDetector:
    """Get or create DriftDetector singleton"""
    global _drift_detector_instance
    if _drift_detector_instance is None:
        _drift_detector_instance = DriftDetector(db_session)
    return _drift_detector_instance

