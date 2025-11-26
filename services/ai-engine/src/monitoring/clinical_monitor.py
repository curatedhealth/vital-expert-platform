"""
Clinical AI Monitor for AgentOS 3.0
Provides clinical-grade monitoring with diagnostic metrics (sensitivity, specificity, etc.)
"""

from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID
import asyncio

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from monitoring.models import (
    InteractionLog,
    DiagnosticMetrics,
    MetricPeriod,
    PerformanceReport,
    ServiceType,
    TierType,
)

logger = structlog.get_logger(__name__)


class ClinicalAIMonitor:
    """
    Clinical AI Monitor for comprehensive agent quality tracking
    
    Implements medical-grade diagnostic metrics:
    - Sensitivity (True Positive Rate)
    - Specificity (True Negative Rate)
    - Precision (Positive Predictive Value)
    - F1 Score (Harmonic mean)
    - Accuracy
    - Confidence calibration
    """
    
    def __init__(self, db_session: AsyncSession):
        """
        Initialize Clinical AI Monitor
        
        Args:
            db_session: AsyncPG database session
        """
        self.db = db_session
        self.logger = logger.bind(component="clinical_monitor")
    
    # ========================================================================
    # INTERACTION LOGGING
    # ========================================================================
    
    async def log_interaction(
        self,
        tenant_id: UUID,
        session_id: UUID,
        agent_id: UUID,
        service_type: ServiceType,
        query: str,
        response: Optional[str] = None,
        confidence_score: Optional[Decimal] = None,
        execution_time_ms: Optional[int] = None,
        tier: Optional[TierType] = None,
        was_successful: bool = True,
        had_human_oversight: bool = False,
        was_escalated: bool = False,
        escalation_reason: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        reasoning: Optional[str] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[Decimal] = None,
        rag_profile_id: Optional[UUID] = None,
        context_chunks_used: int = 0,
        graph_paths_used: int = 0,
        user_id: Optional[UUID] = None,
        user_age_group: Optional[str] = None,
        user_gender: Optional[str] = None,
        user_region: Optional[str] = None,
        user_ethnicity: Optional[str] = None,
    ) -> UUID:
        """
        Log a complete agent interaction for monitoring and analysis
        
        Args:
            tenant_id: Tenant identifier
            session_id: Session identifier
            agent_id: Agent identifier
            service_type: Type of service (ask_expert, ask_panel, etc.)
            query: User query
            response: Agent response
            confidence_score: Agent confidence (0-1)
            execution_time_ms: Execution time in milliseconds
            tier: Agent tier used (tier_1, tier_2, tier_3)
            was_successful: Whether interaction was successful
            had_human_oversight: Whether human oversight was applied
            was_escalated: Whether query was escalated
            escalation_reason: Reason for escalation
            context: Additional context
            reasoning: Agent reasoning
            citations: Citations provided
            tokens_used: Number of tokens used
            cost_usd: Cost in USD
            rag_profile_id: RAG profile used
            context_chunks_used: Number of context chunks
            graph_paths_used: Number of graph paths
            user_id: User identifier
            user_age_group: User age group (for fairness)
            user_gender: User gender (for fairness)
            user_region: User region (for fairness)
            user_ethnicity: User ethnicity (for fairness)
        
        Returns:
            UUID of logged interaction
        """
        try:
            query_sql = """
                INSERT INTO agent_interaction_logs (
                    tenant_id, user_id, session_id, agent_id, service_type,
                    query, context, tier, response, confidence_score, reasoning, citations,
                    was_successful, had_human_oversight, was_escalated, escalation_reason,
                    execution_time_ms, tokens_used, cost_usd,
                    rag_profile_id, context_chunks_used, graph_paths_used,
                    user_age_group, user_gender, user_region, user_ethnicity
                ) VALUES (
                    :tenant_id, :user_id, :session_id, :agent_id, :service_type,
                    :query, :context, :tier, :response, :confidence_score, :reasoning, :citations,
                    :was_successful, :had_human_oversight, :was_escalated, :escalation_reason,
                    :execution_time_ms, :tokens_used, :cost_usd,
                    :rag_profile_id, :context_chunks_used, :graph_paths_used,
                    :user_age_group, :user_gender, :user_region, :user_ethnicity
                )
                RETURNING id
            """
            
            import json
            result = await self.db.execute(
                text(query_sql),
                {
                    "tenant_id": str(tenant_id),
                    "user_id": str(user_id) if user_id else None,
                    "session_id": str(session_id),
                    "agent_id": str(agent_id),
                    "service_type": service_type.value,
                    "query": query,
                    "context": json.dumps(context or {}),
                    "tier": tier.value if tier else None,
                    "response": response,
                    "confidence_score": float(confidence_score) if confidence_score else None,
                    "reasoning": reasoning,
                    "citations": json.dumps(citations or []),
                    "was_successful": was_successful,
                    "had_human_oversight": had_human_oversight,
                    "was_escalated": was_escalated,
                    "escalation_reason": escalation_reason,
                    "execution_time_ms": execution_time_ms,
                    "tokens_used": tokens_used,
                    "cost_usd": float(cost_usd) if cost_usd else None,
                    "rag_profile_id": str(rag_profile_id) if rag_profile_id else None,
                    "context_chunks_used": context_chunks_used,
                    "graph_paths_used": graph_paths_used,
                    "user_age_group": user_age_group,
                    "user_gender": user_gender,
                    "user_region": user_region,
                    "user_ethnicity": user_ethnicity,
                }
            )
            
            await self.db.commit()
            interaction_id = result.scalar_one()
            
            self.logger.info(
                "interaction_logged",
                interaction_id=str(interaction_id),
                agent_id=str(agent_id)[:8],
                tier=tier.value if tier else None,
                execution_ms=execution_time_ms,
                successful=was_successful,
            )
            
            return UUID(interaction_id)
            
        except Exception as e:
            self.logger.error("interaction_log_failed", error=str(e), agent_id=str(agent_id)[:8])
            await self.db.rollback()
            raise
    
    # ========================================================================
    # DIAGNOSTIC METRICS CALCULATION
    # ========================================================================
    
    async def calculate_diagnostic_metrics(
        self,
        agent_id: UUID,
        period: MetricPeriod = MetricPeriod.DAILY,
        period_start: Optional[date] = None,
        period_end: Optional[date] = None,
    ) -> DiagnosticMetrics:
        """
        Calculate clinical diagnostic metrics for an agent
        
        Metrics calculated:
        - Sensitivity (True Positive Rate): TP / (TP + FN)
        - Specificity (True Negative Rate): TN / (TN + FP)
        - Precision (PPV): TP / (TP + FP)
        - F1 Score: 2 * (precision * recall) / (precision + recall)
        - Accuracy: (TP + TN) / (TP + TN + FP + FN)
        
        Args:
            agent_id: Agent identifier
            period: Metric period (daily, weekly, monthly)
            period_start: Start date (defaults to appropriate period)
            period_end: End date (defaults to today)
        
        Returns:
            DiagnosticMetrics with calculated metrics
        """
        # Set default dates based on period
        if not period_end:
            period_end = date.today()
        
        if not period_start:
            if period == MetricPeriod.DAILY:
                period_start = period_end
            elif period == MetricPeriod.WEEKLY:
                period_start = period_end - timedelta(days=7)
            else:  # monthly
                period_start = period_end - timedelta(days=30)
        
        try:
            # Fetch interaction data for period
            query_sql = """
                SELECT
                    COUNT(*) as total_interactions,
                    COUNT(*) FILTER (WHERE was_successful = true) as successful,
                    COUNT(*) FILTER (WHERE was_successful = false) as failed,
                    AVG(confidence_score) as avg_confidence,
                    STDDEV(confidence_score) as confidence_std_dev,
                    AVG(execution_time_ms) as avg_response_time,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_response_time,
                    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY execution_time_ms) as p99_response_time,
                    SUM(cost_usd) as total_cost,
                    SUM(tokens_used) as total_tokens
                FROM agent_interaction_logs
                WHERE agent_id = :agent_id
                  AND created_at::date >= :period_start
                  AND created_at::date <= :period_end
            """
            
            result = await self.db.execute(
                text(query_sql),
                {
                    "agent_id": str(agent_id),
                    "period_start": period_start,
                    "period_end": period_end,
                }
            )
            
            row = result.fetchone()
            
            total = int(row.total_interactions or 0)
            successful = int(row.successful or 0)
            failed = int(row.failed or 0)
            
            # For now, use simple success/failure as TP/FP
            # In production, you'd have actual ground truth labels
            true_positives = successful
            false_positives = 0  # Would come from ground truth
            true_negatives = 0   # Would come from ground truth
            false_negatives = failed
            
            # Calculate diagnostic metrics
            sensitivity = None
            specificity = None
            precision = None
            f1_score = None
            accuracy = None
            
            if true_positives + false_negatives > 0:
                sensitivity = Decimal(true_positives) / Decimal(true_positives + false_negatives)
            
            if true_negatives + false_positives > 0:
                specificity = Decimal(true_negatives) / Decimal(true_negatives + false_positives)
            
            if true_positives + false_positives > 0:
                precision = Decimal(true_positives) / Decimal(true_positives + false_positives)
            
            if precision and sensitivity:
                recall = sensitivity
                if precision + recall > 0:
                    f1_score = 2 * (precision * recall) / (precision + recall)
            
            if total > 0:
                accuracy = Decimal(true_positives + true_negatives) / Decimal(total)
            
            # Calculate calibration error (simplified)
            calibration_error = None
            if row.avg_confidence and accuracy:
                calibration_error = abs(Decimal(str(row.avg_confidence)) - accuracy)
            
            # Create metrics object
            metrics = DiagnosticMetrics(
                agent_id=agent_id,
                metric_period=period,
                period_start=period_start,
                period_end=period_end,
                total_interactions=total,
                true_positives=true_positives,
                true_negatives=true_negatives,
                false_positives=false_positives,
                false_negatives=false_negatives,
                sensitivity=sensitivity,
                specificity=specificity,
                precision_score=precision,
                f1_score=f1_score,
                accuracy=accuracy,
                avg_confidence=Decimal(str(row.avg_confidence)) if row.avg_confidence else None,
                confidence_std_dev=Decimal(str(row.confidence_std_dev)) if row.confidence_std_dev else None,
                calibration_error=calibration_error,
                avg_response_time_ms=int(row.avg_response_time) if row.avg_response_time else None,
                p95_response_time_ms=int(row.p95_response_time) if row.p95_response_time else None,
                p99_response_time_ms=int(row.p99_response_time) if row.p99_response_time else None,
                total_cost_usd=Decimal(str(row.total_cost)) if row.total_cost else None,
                avg_cost_per_query=Decimal(str(row.total_cost)) / Decimal(total) if row.total_cost and total > 0 else None,
            )
            
            # Persist metrics to database
            await self._save_diagnostic_metrics(metrics)
            
            self.logger.info(
                "diagnostic_metrics_calculated",
                agent_id=str(agent_id)[:8],
                period=period.value,
                total_interactions=total,
                accuracy=float(accuracy) if accuracy else None,
                sensitivity=float(sensitivity) if sensitivity else None,
            )
            
            return metrics
            
        except Exception as e:
            self.logger.error("diagnostic_metrics_failed", error=str(e), agent_id=str(agent_id)[:8])
            raise
    
    async def _save_diagnostic_metrics(self, metrics: DiagnosticMetrics) -> None:
        """Save diagnostic metrics to database"""
        query_sql = """
            INSERT INTO agent_diagnostic_metrics (
                agent_id, metric_period, period_start, period_end,
                total_interactions, true_positives, true_negatives, false_positives, false_negatives,
                sensitivity, specificity, precision_score, f1_score, accuracy,
                avg_confidence, confidence_std_dev, calibration_error,
                avg_response_time_ms, p95_response_time_ms, p99_response_time_ms,
                total_cost_usd, avg_cost_per_query
            ) VALUES (
                :agent_id, :metric_period, :period_start, :period_end,
                :total_interactions, :true_positives, :true_negatives, :false_positives, :false_negatives,
                :sensitivity, :specificity, :precision_score, :f1_score, :accuracy,
                :avg_confidence, :confidence_std_dev, :calibration_error,
                :avg_response_time_ms, :p95_response_time_ms, :p99_response_time_ms,
                :total_cost_usd, :avg_cost_per_query
            )
            ON CONFLICT (agent_id, metric_period, period_start) DO UPDATE SET
                total_interactions = EXCLUDED.total_interactions,
                true_positives = EXCLUDED.true_positives,
                true_negatives = EXCLUDED.true_negatives,
                false_positives = EXCLUDED.false_positives,
                false_negatives = EXCLUDED.false_negatives,
                sensitivity = EXCLUDED.sensitivity,
                specificity = EXCLUDED.specificity,
                precision_score = EXCLUDED.precision_score,
                f1_score = EXCLUDED.f1_score,
                accuracy = EXCLUDED.accuracy,
                avg_confidence = EXCLUDED.avg_confidence,
                confidence_std_dev = EXCLUDED.confidence_std_dev,
                calibration_error = EXCLUDED.calibration_error,
                avg_response_time_ms = EXCLUDED.avg_response_time_ms,
                p95_response_time_ms = EXCLUDED.p95_response_time_ms,
                p99_response_time_ms = EXCLUDED.p99_response_time_ms,
                total_cost_usd = EXCLUDED.total_cost_usd,
                avg_cost_per_query = EXCLUDED.avg_cost_per_query,
                updated_at = NOW()
        """
        
        await self.db.execute(
            text(query_sql),
            {
                "agent_id": str(metrics.agent_id),
                "metric_period": metrics.metric_period.value,
                "period_start": metrics.period_start,
                "period_end": metrics.period_end,
                "total_interactions": metrics.total_interactions,
                "true_positives": metrics.true_positives,
                "true_negatives": metrics.true_negatives,
                "false_positives": metrics.false_positives,
                "false_negatives": metrics.false_negatives,
                "sensitivity": float(metrics.sensitivity) if metrics.sensitivity else None,
                "specificity": float(metrics.specificity) if metrics.specificity else None,
                "precision_score": float(metrics.precision_score) if metrics.precision_score else None,
                "f1_score": float(metrics.f1_score) if metrics.f1_score else None,
                "accuracy": float(metrics.accuracy) if metrics.accuracy else None,
                "avg_confidence": float(metrics.avg_confidence) if metrics.avg_confidence else None,
                "confidence_std_dev": float(metrics.confidence_std_dev) if metrics.confidence_std_dev else None,
                "calibration_error": float(metrics.calibration_error) if metrics.calibration_error else None,
                "avg_response_time_ms": metrics.avg_response_time_ms,
                "p95_response_time_ms": metrics.p95_response_time_ms,
                "p99_response_time_ms": metrics.p99_response_time_ms,
                "total_cost_usd": float(metrics.total_cost_usd) if metrics.total_cost_usd else None,
                "avg_cost_per_query": float(metrics.avg_cost_per_query) if metrics.avg_cost_per_query else None,
            }
        )
        
        await self.db.commit()
    
    # ========================================================================
    # PERFORMANCE REPORTING
    # ========================================================================
    
    async def get_performance_report(
        self,
        agent_id: UUID,
        days: int = 7,
    ) -> PerformanceReport:
        """
        Generate comprehensive performance report for an agent
        
        Args:
            agent_id: Agent identifier
            days: Number of days to include in report
        
        Returns:
            PerformanceReport with all metrics
        """
        period_end = date.today()
        period_start = period_end - timedelta(days=days)
        
        # Get latest diagnostic metrics
        metrics = await self.calculate_diagnostic_metrics(
            agent_id=agent_id,
            period=MetricPeriod.DAILY if days == 1 else MetricPeriod.WEEKLY if days <= 7 else MetricPeriod.MONTHLY,
            period_start=period_start,
            period_end=period_end,
        )
        
        # Get agent name
        agent_query = "SELECT name FROM agents WHERE id = :agent_id"
        agent_result = await self.db.execute(text(agent_query), {"agent_id": str(agent_id)})
        agent_row = agent_result.fetchone()
        agent_name = agent_row.name if agent_row else "Unknown"
        
        # Get tier distribution
        tier_query = """
            SELECT
                COUNT(*) FILTER (WHERE tier = 'tier_1') as tier_1_count,
                COUNT(*) FILTER (WHERE tier = 'tier_2') as tier_2_count,
                COUNT(*) FILTER (WHERE tier = 'tier_3') as tier_3_count,
                COUNT(*) FILTER (WHERE was_escalated = true) as escalation_count,
                COUNT(*) FILTER (WHERE had_human_oversight = true) as oversight_count
            FROM agent_interaction_logs
            WHERE agent_id = :agent_id
              AND created_at::date >= :period_start
              AND created_at::date <= :period_end
        """
        
        tier_result = await self.db.execute(
            text(tier_query),
            {"agent_id": str(agent_id), "period_start": period_start, "period_end": period_end}
        )
        tier_row = tier_result.fetchone()
        
        # Count active alerts
        alert_query = """
            SELECT
                COUNT(*) as total_alerts,
                COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts
            FROM agent_drift_alerts
            WHERE agent_id = :agent_id
              AND status = 'open'
        """
        
        alert_result = await self.db.execute(text(alert_query), {"agent_id": str(agent_id)})
        alert_row = alert_result.fetchone()
        
        # Build report
        report = PerformanceReport(
            agent_id=agent_id,
            agent_name=agent_name,
            period_start=period_start,
            period_end=period_end,
            total_interactions=metrics.total_interactions,
            success_rate=metrics.accuracy or Decimal(0),
            avg_confidence=metrics.avg_confidence or Decimal(0),
            avg_response_time_ms=metrics.avg_response_time_ms or 0,
            total_cost_usd=metrics.total_cost_usd or Decimal(0),
            sensitivity=metrics.sensitivity,
            specificity=metrics.specificity,
            precision=metrics.precision_score,
            f1_score=metrics.f1_score,
            tier_1_count=int(tier_row.tier_1_count or 0),
            tier_2_count=int(tier_row.tier_2_count or 0),
            tier_3_count=int(tier_row.tier_3_count or 0),
            escalation_count=int(tier_row.escalation_count or 0),
            human_oversight_count=int(tier_row.oversight_count or 0),
            active_alerts=int(alert_row.total_alerts or 0),
            critical_alerts=int(alert_row.critical_alerts or 0),
        )
        
        self.logger.info(
            "performance_report_generated",
            agent_id=str(agent_id)[:8],
            days=days,
            total_interactions=report.total_interactions,
            success_rate=float(report.success_rate),
        )
        
        return report
    
    # ========================================================================
    # QUALITY THRESHOLD CHECKS
    # ========================================================================
    
    async def check_quality_thresholds(
        self,
        agent_id: UUID,
        min_accuracy: Decimal = Decimal("0.85"),
        min_confidence: Decimal = Decimal("0.70"),
        max_response_time_ms: int = 5000,
    ) -> Dict[str, Any]:
        """
        Check if agent meets quality thresholds
        
        Args:
            agent_id: Agent identifier
            min_accuracy: Minimum acceptable accuracy
            min_confidence: Minimum acceptable confidence
            max_response_time_ms: Maximum acceptable response time
        
        Returns:
            Dict with threshold check results
        """
        metrics = await self.calculate_diagnostic_metrics(agent_id, MetricPeriod.DAILY)
        
        checks = {
            "agent_id": str(agent_id),
            "timestamp": datetime.now().isoformat(),
            "passes_all": True,
            "checks": []
        }
        
        # Check accuracy
        if metrics.accuracy:
            passes = metrics.accuracy >= min_accuracy
            checks["checks"].append({
                "metric": "accuracy",
                "value": float(metrics.accuracy),
                "threshold": float(min_accuracy),
                "passes": passes,
            })
            if not passes:
                checks["passes_all"] = False
        
        # Check confidence
        if metrics.avg_confidence:
            passes = metrics.avg_confidence >= min_confidence
            checks["checks"].append({
                "metric": "confidence",
                "value": float(metrics.avg_confidence),
                "threshold": float(min_confidence),
                "passes": passes,
            })
            if not passes:
                checks["passes_all"] = False
        
        # Check response time
        if metrics.avg_response_time_ms:
            passes = metrics.avg_response_time_ms <= max_response_time_ms
            checks["checks"].append({
                "metric": "response_time_ms",
                "value": metrics.avg_response_time_ms,
                "threshold": max_response_time_ms,
                "passes": passes,
            })
            if not passes:
                checks["passes_all"] = False
        
        self.logger.info(
            "quality_threshold_check",
            agent_id=str(agent_id)[:8],
            passes_all=checks["passes_all"],
            num_checks=len(checks["checks"]),
        )
        
        return checks


# ============================================================================
# Singleton accessor
# ============================================================================

_clinical_monitor_instance: Optional[ClinicalAIMonitor] = None


async def get_clinical_monitor(db_session: AsyncSession) -> ClinicalAIMonitor:
    """Get or create ClinicalAIMonitor singleton"""
    global _clinical_monitor_instance
    if _clinical_monitor_instance is None:
        _clinical_monitor_instance = ClinicalAIMonitor(db_session)
    return _clinical_monitor_instance

