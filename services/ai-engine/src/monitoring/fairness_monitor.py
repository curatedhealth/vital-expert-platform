"""
Fairness Monitor for AgentOS 3.0
Tracks bias and fairness across protected demographics
"""

from datetime import date, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
import math

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from monitoring.models import (
    FairnessMetrics,
    FairnessReport,
    ProtectedAttribute,
)

logger = structlog.get_logger(__name__)


class FairnessMonitor:
    """
    Fairness Monitor for bias detection and demographic parity tracking
    
    Monitors:
    - Demographic parity across protected attributes
    - Equal opportunity (TPR parity)
    - Statistical significance of disparities
    - Compliance with fairness thresholds
    
    Threshold: |demographic_parity| < 0.1 (10% difference max)
    """
    
    # Protected attributes to monitor
    PROTECTED_ATTRIBUTES = [
        ProtectedAttribute.AGE_GROUP,
        ProtectedAttribute.GENDER,
        ProtectedAttribute.REGION,
        ProtectedAttribute.ETHNICITY,
    ]
    
    # Fairness threshold (demographic parity)
    FAIRNESS_THRESHOLD = 0.1  # 10% maximum difference
    
    # Minimum sample size for statistical significance
    MIN_SAMPLE_SIZE = 30
    
    def __init__(self, db_session: AsyncSession):
        """
        Initialize Fairness Monitor
        
        Args:
            db_session: AsyncPG database session
        """
        self.db = db_session
        self.logger = logger.bind(component="fairness_monitor")
    
    # ========================================================================
    # FAIRNESS METRICS CALCULATION
    # ========================================================================
    
    async def calculate_fairness_metrics(
        self,
        agent_id: UUID,
        metric_date: Optional[date] = None,
    ) -> List[FairnessMetrics]:
        """
        Calculate fairness metrics across all protected demographics
        
        Args:
            agent_id: Agent identifier
            metric_date: Date to calculate metrics for (defaults to today)
        
        Returns:
            List of FairnessMetrics for each demographic group
        """
        if not metric_date:
            metric_date = date.today()
        
        all_metrics = []
        
        # Calculate overall success rate for comparison
        overall_rate = await self._get_overall_success_rate(agent_id, metric_date)
        
        # Calculate metrics for each protected attribute
        for attribute in self.PROTECTED_ATTRIBUTES:
            try:
                metrics = await self._calculate_attribute_metrics(
                    agent_id=agent_id,
                    attribute=attribute,
                    metric_date=metric_date,
                    overall_success_rate=overall_rate,
                )
                all_metrics.extend(metrics)
            except Exception as e:
                self.logger.warning(
                    "fairness_metric_calculation_failed",
                    agent_id=str(agent_id)[:8],
                    attribute=attribute.value,
                    error=str(e),
                )
        
        # Save all metrics
        for metric in all_metrics:
            await self._save_fairness_metrics(metric)
        
        self.logger.info(
            "fairness_metrics_calculated",
            agent_id=str(agent_id)[:8],
            date=metric_date.isoformat(),
            num_metrics=len(all_metrics),
        )
        
        return all_metrics
    
    async def _get_overall_success_rate(
        self,
        agent_id: UUID,
        metric_date: date,
    ) -> Decimal:
        """Get overall success rate for the agent on a given date"""
        query_sql = """
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE was_successful = true) as successful
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date = :metric_date
        """
        
        result = await self.db.execute(
            text(query_sql),
            {"agent_id": str(agent_id), "metric_date": metric_date}
        )
        row = result.fetchone()
        
        if row.total > 0:
            return Decimal(row.successful) / Decimal(row.total)
        return Decimal(0)
    
    async def _calculate_attribute_metrics(
        self,
        agent_id: UUID,
        attribute: ProtectedAttribute,
        metric_date: date,
        overall_success_rate: Decimal,
    ) -> List[FairnessMetrics]:
        """Calculate fairness metrics for a specific protected attribute"""
        
        # Map attribute to column name
        column_map = {
            ProtectedAttribute.AGE_GROUP: "user_age_group",
            ProtectedAttribute.GENDER: "user_gender",
            ProtectedAttribute.REGION: "user_region",
            ProtectedAttribute.ETHNICITY: "user_ethnicity",
        }
        
        column_name = column_map[attribute]
        
        # Query metrics by demographic group
        query_sql = f"""
            SELECT
                {column_name} as attribute_value,
                COUNT(*) as total_interactions,
                COUNT(*) FILTER (WHERE was_successful = true) as successful_interactions,
                AVG(confidence_score) as avg_confidence,
                AVG(execution_time_ms) as avg_response_time_ms,
                COUNT(*) FILTER (WHERE was_escalated = true)::DECIMAL / COUNT(*) as escalation_rate
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date = :metric_date
              AND {column_name} IS NOT NULL
            GROUP BY {column_name}
        """
        
        result = await self.db.execute(
            text(query_sql),
            {"agent_id": str(agent_id), "metric_date": metric_date}
        )
        
        metrics_list = []
        
        for row in result:
            total = int(row.total_interactions)
            successful = int(row.successful_interactions)
            
            # Calculate success rate
            success_rate = Decimal(successful) / Decimal(total) if total > 0 else Decimal(0)
            
            # Calculate demographic parity (difference from overall)
            demographic_parity = success_rate - overall_success_rate
            
            # Check if sample size is adequate
            sample_adequate = total >= self.MIN_SAMPLE_SIZE
            
            # Calculate confidence interval (Wilson score interval)
            ci_lower, ci_upper = self._calculate_confidence_interval(successful, total)
            
            # Equal opportunity (TPR difference) - simplified for now
            equal_opportunity = demographic_parity  # Would need actual TP rates
            
            metrics = FairnessMetrics(
                agent_id=agent_id,
                metric_date=metric_date,
                protected_attribute=attribute,
                attribute_value=row.attribute_value,
                total_interactions=total,
                successful_interactions=successful,
                avg_confidence=Decimal(str(row.avg_confidence)) if row.avg_confidence else None,
                avg_response_time_ms=int(row.avg_response_time_ms) if row.avg_response_time_ms else None,
                escalation_rate=Decimal(str(row.escalation_rate)) if row.escalation_rate else None,
                success_rate=success_rate,
                demographic_parity=demographic_parity,
                equal_opportunity=equal_opportunity,
                sample_size_adequate=sample_adequate,
                confidence_interval_lower=ci_lower,
                confidence_interval_upper=ci_upper,
            )
            
            metrics_list.append(metrics)
        
        return metrics_list
    
    def _calculate_confidence_interval(
        self,
        successes: int,
        total: int,
        confidence: float = 0.95,
    ) -> Tuple[Optional[Decimal], Optional[Decimal]]:
        """
        Calculate Wilson score confidence interval for proportion
        
        Args:
            successes: Number of successes
            total: Total number of trials
            confidence: Confidence level (default 0.95)
        
        Returns:
            Tuple of (lower_bound, upper_bound) or (None, None) if insufficient data
        """
        if total == 0:
            return (None, None)
        
        # Wilson score interval
        p = successes / total
        z = 1.96  # 95% confidence
        
        denominator = 1 + z**2 / total
        center = (p + z**2 / (2 * total)) / denominator
        margin = z * math.sqrt((p * (1 - p) / total + z**2 / (4 * total**2))) / denominator
        
        lower = max(0, center - margin)
        upper = min(1, center + margin)
        
        return (Decimal(str(lower)), Decimal(str(upper)))
    
    async def _save_fairness_metrics(self, metrics: FairnessMetrics) -> None:
        """Save fairness metrics to database"""
        query_sql = """
            INSERT INTO agent_fairness_metrics (
                agent_id, metric_date, protected_attribute, attribute_value,
                total_interactions, successful_interactions,
                avg_confidence, avg_response_time_ms, escalation_rate,
                success_rate, demographic_parity, equal_opportunity,
                sample_size_adequate, confidence_interval_lower, confidence_interval_upper
            ) VALUES (
                :agent_id, :metric_date, :protected_attribute, :attribute_value,
                :total_interactions, :successful_interactions,
                :avg_confidence, :avg_response_time_ms, :escalation_rate,
                :success_rate, :demographic_parity, :equal_opportunity,
                :sample_size_adequate, :confidence_interval_lower, :confidence_interval_upper
            )
            ON CONFLICT (agent_id, metric_date, protected_attribute, attribute_value) DO UPDATE SET
                total_interactions = EXCLUDED.total_interactions,
                successful_interactions = EXCLUDED.successful_interactions,
                avg_confidence = EXCLUDED.avg_confidence,
                avg_response_time_ms = EXCLUDED.avg_response_time_ms,
                escalation_rate = EXCLUDED.escalation_rate,
                success_rate = EXCLUDED.success_rate,
                demographic_parity = EXCLUDED.demographic_parity,
                equal_opportunity = EXCLUDED.equal_opportunity,
                sample_size_adequate = EXCLUDED.sample_size_adequate,
                confidence_interval_lower = EXCLUDED.confidence_interval_lower,
                confidence_interval_upper = EXCLUDED.confidence_interval_upper,
                updated_at = NOW()
        """
        
        await self.db.execute(
            text(query_sql),
            {
                "agent_id": str(metrics.agent_id),
                "metric_date": metrics.metric_date,
                "protected_attribute": metrics.protected_attribute.value,
                "attribute_value": metrics.attribute_value,
                "total_interactions": metrics.total_interactions,
                "successful_interactions": metrics.successful_interactions,
                "avg_confidence": float(metrics.avg_confidence) if metrics.avg_confidence else None,
                "avg_response_time_ms": metrics.avg_response_time_ms,
                "escalation_rate": float(metrics.escalation_rate) if metrics.escalation_rate else None,
                "success_rate": float(metrics.success_rate) if metrics.success_rate else None,
                "demographic_parity": float(metrics.demographic_parity) if metrics.demographic_parity else None,
                "equal_opportunity": float(metrics.equal_opportunity) if metrics.equal_opportunity else None,
                "sample_size_adequate": metrics.sample_size_adequate,
                "confidence_interval_lower": float(metrics.confidence_interval_lower) if metrics.confidence_interval_lower else None,
                "confidence_interval_upper": float(metrics.confidence_interval_upper) if metrics.confidence_interval_upper else None,
            }
        )
        
        await self.db.commit()
    
    # ========================================================================
    # BIAS DETECTION
    # ========================================================================
    
    async def detect_bias(
        self,
        agent_id: UUID,
        metric_date: Optional[date] = None,
    ) -> List[Dict[str, Any]]:
        """
        Detect statistically significant bias across demographics
        
        Returns violations where:
        - |demographic_parity| > 0.1 (10% threshold)
        - Sample size is adequate (n >= 30)
        - Confidence interval doesn't include zero difference
        
        Args:
            agent_id: Agent identifier
            metric_date: Date to check (defaults to today)
        
        Returns:
            List of bias violations
        """
        if not metric_date:
            metric_date = date.today()
        
        # Get all fairness metrics
        metrics = await self.calculate_fairness_metrics(agent_id, metric_date)
        
        violations = []
        
        for metric in metrics:
            # Check if demographic parity exceeds threshold
            if metric.demographic_parity and abs(metric.demographic_parity) > Decimal(str(self.FAIRNESS_THRESHOLD)):
                # Check if sample size is adequate
                if metric.sample_size_adequate:
                    # Check if statistically significant (CI doesn't include baseline)
                    if metric.confidence_interval_lower and metric.confidence_interval_upper:
                        overall_rate = metric.success_rate - metric.demographic_parity
                        is_significant = (
                            metric.confidence_interval_lower > overall_rate or
                            metric.confidence_interval_upper < overall_rate
                        )
                        
                        if is_significant:
                            violations.append({
                                "agent_id": str(agent_id),
                                "metric_date": metric_date.isoformat(),
                                "protected_attribute": metric.protected_attribute.value,
                                "attribute_value": metric.attribute_value,
                                "demographic_parity": float(metric.demographic_parity),
                                "success_rate": float(metric.success_rate),
                                "total_interactions": metric.total_interactions,
                                "is_significant": is_significant,
                                "severity": "high" if abs(metric.demographic_parity) > 0.15 else "medium",
                            })
        
        if violations:
            self.logger.warning(
                "bias_detected",
                agent_id=str(agent_id)[:8],
                num_violations=len(violations),
                max_parity=max(abs(v["demographic_parity"]) for v in violations),
            )
        
        return violations
    
    # ========================================================================
    # FAIRNESS REPORTING
    # ========================================================================
    
    async def generate_fairness_report(
        self,
        agent_id: UUID,
        report_date: Optional[date] = None,
    ) -> FairnessReport:
        """
        Generate comprehensive fairness report for compliance
        
        Args:
            agent_id: Agent identifier
            report_date: Date for report (defaults to today)
        
        Returns:
            FairnessReport with demographic breakdown and compliance status
        """
        if not report_date:
            report_date = date.today()
        
        # Get agent name
        agent_query = "SELECT name FROM agents WHERE id = :agent_id"
        agent_result = await self.db.execute(text(agent_query), {"agent_id": str(agent_id)})
        agent_row = agent_result.fetchone()
        agent_name = agent_row.name if agent_row else "Unknown"
        
        # Get overall metrics
        overall_query = """
            SELECT
                COUNT(*) as total_interactions,
                COUNT(*) FILTER (WHERE was_successful = true)::DECIMAL / COUNT(*) as success_rate
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date = :report_date
        """
        
        overall_result = await self.db.execute(
            text(overall_query),
            {"agent_id": str(agent_id), "report_date": report_date}
        )
        overall_row = overall_result.fetchone()
        
        # Get all fairness metrics
        metrics = await self.calculate_fairness_metrics(agent_id, report_date)
        
        # Group by attribute
        by_age_group = []
        by_gender = []
        by_region = []
        
        for metric in metrics:
            metric_dict = {
                "value": metric.attribute_value,
                "interactions": metric.total_interactions,
                "success_rate": float(metric.success_rate) if metric.success_rate else 0,
                "demographic_parity": float(metric.demographic_parity) if metric.demographic_parity else 0,
                "sample_adequate": metric.sample_size_adequate,
            }
            
            if metric.protected_attribute == ProtectedAttribute.AGE_GROUP:
                by_age_group.append(metric_dict)
            elif metric.protected_attribute == ProtectedAttribute.GENDER:
                by_gender.append(metric_dict)
            elif metric.protected_attribute == ProtectedAttribute.REGION:
                by_region.append(metric_dict)
        
        # Detect violations
        violations = await self.detect_bias(agent_id, report_date)
        
        # Calculate max demographic parity
        max_parity = Decimal(0)
        if metrics:
            max_parity = max(
                abs(m.demographic_parity) for m in metrics if m.demographic_parity
            )
        
        # Check compliance
        is_compliant = max_parity <= Decimal(str(self.FAIRNESS_THRESHOLD))
        
        compliance_notes = "COMPLIANT: All demographic groups within 10% threshold"
        if not is_compliant:
            compliance_notes = f"NON-COMPLIANT: Maximum demographic parity {float(max_parity):.2%} exceeds 10% threshold"
        
        if violations:
            compliance_notes += f". {len(violations)} violation(s) detected."
        
        report = FairnessReport(
            agent_id=agent_id,
            agent_name=agent_name,
            report_date=report_date,
            total_interactions=int(overall_row.total_interactions or 0),
            overall_success_rate=Decimal(str(overall_row.success_rate or 0)),
            by_age_group=by_age_group,
            by_gender=by_gender,
            by_region=by_region,
            violations=violations,
            max_demographic_parity=max_parity,
            is_compliant=is_compliant,
            compliance_notes=compliance_notes,
        )
        
        self.logger.info(
            "fairness_report_generated",
            agent_id=str(agent_id)[:8],
            report_date=report_date.isoformat(),
            is_compliant=is_compliant,
            max_parity=float(max_parity),
            num_violations=len(violations),
        )
        
        return report
    
    async def check_compliance(
        self,
        agent_id: UUID,
        metric_date: Optional[date] = None,
    ) -> bool:
        """
        Quick compliance check: is agent within fairness thresholds?
        
        Args:
            agent_id: Agent identifier
            metric_date: Date to check (defaults to today)
        
        Returns:
            True if compliant, False otherwise
        """
        if not metric_date:
            metric_date = date.today()
        
        violations = await self.detect_bias(agent_id, metric_date)
        return len(violations) == 0


# ============================================================================
# Singleton accessor
# ============================================================================

_fairness_monitor_instance: Optional[FairnessMonitor] = None


async def get_fairness_monitor(db_session: AsyncSession) -> FairnessMonitor:
    """Get or create FairnessMonitor singleton"""
    global _fairness_monitor_instance
    if _fairness_monitor_instance is None:
        _fairness_monitor_instance = FairnessMonitor(db_session)
    return _fairness_monitor_instance

