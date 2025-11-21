"""
VITAL Path - Phase 3 Enhanced: Agent Monitoring & Metrics System
===============================================================

Core Intelligence Layer - Real-time Agent Performance Monitoring
Advanced metrics collection, analysis, and alerting system for medical AI agents

Key Features:
- Real-time agent performance monitoring and health checks
- Medical-specific metrics and KPIs tracking
- Multi-dimensional performance analysis and alerting
- Clinical safety monitoring and compliance tracking
- Agent behavior analysis and anomaly detection
- Comprehensive reporting and dashboard analytics
- Integration with OpenTelemetry and Prometheus
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import statistics
from pathlib import Path
import threading
from collections import defaultdict, deque
import uuid

# Monitoring and metrics libraries
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge, Summary, CollectorRegistry
import psutil
import numpy as np
import pandas as pd

# OpenTelemetry integration
from opentelemetry import trace, metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.instrumentation.asyncio import AsyncioInstrumentor

# Database and caching
import redis
from pymongo import MongoClient
import sqlite3
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Medical agent types
from .medical_agents import MedicalSpecialty, ClinicalEvidenceAgent, RegulatoryGuidanceAgent
from .medical_orchestrator import MedicalQueryClassification, OrchestrationStrategy


class AgentStatus(Enum):
    """Agent operational status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class MetricType(Enum):
    """Types of metrics collected"""
    PERFORMANCE = "performance"  # Response time, throughput
    ACCURACY = "accuracy"  # Clinical accuracy, validation scores
    SAFETY = "safety"  # Safety signal detection, compliance
    AVAILABILITY = "availability"  # Uptime, health status
    UTILIZATION = "utilization"  # Resource usage, load
    CLINICAL = "clinical"  # Medical-specific metrics


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class AgentMetric:
    """Individual agent metric with metadata"""
    metric_id: str
    agent_id: str
    metric_type: MetricType
    metric_name: str
    value: Union[float, int, str]
    unit: str
    timestamp: datetime
    labels: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    clinical_context: Optional[str] = None
    patient_impact: Optional[str] = None
    regulatory_relevance: Optional[str] = None


@dataclass
class AgentHealthCheck:
    """Agent health check result"""
    agent_id: str
    agent_type: str
    status: AgentStatus
    health_score: float  # 0-1, higher is better
    last_response_time: Optional[float] = None
    error_rate: float = 0.0
    uptime_percentage: float = 100.0
    resource_utilization: Dict[str, float] = field(default_factory=dict)
    clinical_metrics: Dict[str, float] = field(default_factory=dict)
    active_queries: int = 0
    completed_queries_24h: int = 0
    last_health_check: datetime = field(default_factory=datetime.now)
    issues: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)


@dataclass
class PerformanceAlert:
    """Performance alert with clinical context"""
    alert_id: str
    agent_id: str
    severity: AlertSeverity
    alert_type: str
    message: str
    metric_name: str
    current_value: Union[float, int]
    threshold_value: Union[float, int]
    clinical_impact: str
    recommended_action: str
    timestamp: datetime = field(default_factory=datetime.now)
    acknowledged: bool = False
    resolved: bool = False
    resolution_notes: Optional[str] = None


@dataclass
class ClinicalMetrics:
    """Clinical-specific metrics for medical agents"""
    agent_id: str
    specialty: MedicalSpecialty

    # Accuracy Metrics
    clinical_accuracy_score: float = 0.0
    evidence_quality_score: float = 0.0
    safety_validation_score: float = 0.0
    regulatory_compliance_score: float = 0.0

    # Safety Metrics
    safety_signals_detected: int = 0
    critical_safety_alerts: int = 0
    adverse_event_detections: int = 0
    contraindication_alerts: int = 0

    # Clinical Effectiveness
    correct_diagnoses_rate: float = 0.0
    treatment_recommendations_accuracy: float = 0.0
    drug_interaction_detection_rate: float = 0.0
    clinical_decision_support_usage: float = 0.0

    # Quality Indicators
    peer_review_score: float = 0.0
    evidence_citation_accuracy: float = 0.0
    clinical_guideline_adherence: float = 0.0
    patient_outcome_correlation: float = 0.0

    # Performance KPIs
    queries_processed_24h: int = 0
    average_response_time_ms: float = 0.0
    complex_query_resolution_rate: float = 0.0
    multi_agent_collaboration_score: float = 0.0

    # Regulatory and Compliance
    hipaa_compliance_score: float = 0.0
    gdpr_compliance_score: float = 0.0
    fda_guideline_adherence: float = 0.0
    clinical_audit_readiness: float = 0.0

    last_updated: datetime = field(default_factory=datetime.now)


class MetricsCollector:
    """Centralized metrics collection system"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Initialize Prometheus metrics
        self.registry = CollectorRegistry()
        self.setup_prometheus_metrics()

        # Initialize OpenTelemetry
        self.setup_opentelemetry()

        # Metrics storage
        self.metrics_buffer = deque(maxlen=10000)  # In-memory buffer
        self.metrics_lock = threading.Lock()

        # Agent tracking
        self.active_agents: Dict[str, AgentHealthCheck] = {}
        self.agent_metrics: Dict[str, List[AgentMetric]] = defaultdict(list)

        # Alert system
        self.active_alerts: Dict[str, PerformanceAlert] = {}
        self.alert_handlers: List[Callable] = []

        # Performance baselines
        self.performance_baselines: Dict[str, Dict[str, float]] = {}

    def setup_prometheus_metrics(self):
        """Initialize Prometheus metrics"""

        # Agent performance metrics
        self.agent_response_time = Histogram(
            'agent_response_time_seconds',
            'Agent response time in seconds',
            ['agent_id', 'agent_type', 'specialty', 'query_type'],
            registry=self.registry
        )

        self.agent_requests_total = Counter(
            'agent_requests_total',
            'Total agent requests processed',
            ['agent_id', 'agent_type', 'specialty', 'status'],
            registry=self.registry
        )

        self.agent_errors_total = Counter(
            'agent_errors_total',
            'Total agent errors',
            ['agent_id', 'agent_type', 'error_type'],
            registry=self.registry
        )

        self.agent_health_score = Gauge(
            'agent_health_score',
            'Agent health score (0-1)',
            ['agent_id', 'agent_type'],
            registry=self.registry
        )

        # Clinical metrics
        self.clinical_accuracy_score = Gauge(
            'clinical_accuracy_score',
            'Clinical accuracy score (0-1)',
            ['agent_id', 'specialty'],
            registry=self.registry
        )

        self.safety_signals_detected = Counter(
            'safety_signals_detected_total',
            'Total safety signals detected',
            ['agent_id', 'specialty', 'signal_type', 'severity'],
            registry=self.registry
        )

        # System resource metrics
        self.system_cpu_usage = Gauge(
            'system_cpu_usage_percent',
            'System CPU usage percentage',
            registry=self.registry
        )

        self.system_memory_usage = Gauge(
            'system_memory_usage_percent',
            'System memory usage percentage',
            registry=self.registry
        )

    def setup_opentelemetry(self):
        """Initialize OpenTelemetry instrumentation"""

        # Setup tracing
        tracer_provider = trace.get_tracer_provider()
        self.tracer = tracer_provider.get_tracer(__name__)

        # Setup metrics
        metric_reader = PrometheusMetricReader()
        provider = MeterProvider(metric_readers=[metric_reader])
        metrics.set_meter_provider(provider)

        self.meter = metrics.get_meter(__name__)

        # Initialize AsyncIO instrumentation
        AsyncioInstrumentor().instrument()

    async def collect_agent_metrics(self, agent_id: str, agent_type: str,
                                  operation: str, **kwargs) -> None:
        """Collect metrics for a specific agent operation"""

        timestamp = datetime.now()

        # Performance metrics
        if 'response_time' in kwargs:
            await self._record_performance_metric(
                agent_id, agent_type, 'response_time',
                kwargs['response_time'], timestamp, operation
            )

        if 'accuracy_score' in kwargs:
            await self._record_clinical_metric(
                agent_id, agent_type, 'accuracy_score',
                kwargs['accuracy_score'], timestamp
            )

        if 'safety_signals' in kwargs:
            await self._record_safety_metrics(
                agent_id, agent_type, kwargs['safety_signals'], timestamp
            )

        # Update Prometheus metrics
        self._update_prometheus_metrics(agent_id, agent_type, operation, kwargs)

    async def _record_performance_metric(self, agent_id: str, agent_type: str,
                                       metric_name: str, value: float,
                                       timestamp: datetime, operation: str):
        """Record performance metric"""

        metric = AgentMetric(
            metric_id=f"{agent_id}_{metric_name}_{int(timestamp.timestamp())}",
            agent_id=agent_id,
            metric_type=MetricType.PERFORMANCE,
            metric_name=metric_name,
            value=value,
            unit="seconds" if metric_name == "response_time" else "",
            timestamp=timestamp,
            labels={
                "agent_type": agent_type,
                "operation": operation
            }
        )

        with self.metrics_lock:
            self.metrics_buffer.append(metric)
            self.agent_metrics[agent_id].append(metric)

    async def _record_clinical_metric(self, agent_id: str, agent_type: str,
                                    metric_name: str, value: float,
                                    timestamp: datetime):
        """Record clinical-specific metric"""

        metric = AgentMetric(
            metric_id=f"{agent_id}_{metric_name}_{int(timestamp.timestamp())}",
            agent_id=agent_id,
            metric_type=MetricType.CLINICAL,
            metric_name=metric_name,
            value=value,
            unit="score",
            timestamp=timestamp,
            labels={
                "agent_type": agent_type
            },
            clinical_context="Clinical accuracy assessment",
            patient_impact="Direct impact on clinical decision quality"
        )

        with self.metrics_lock:
            self.metrics_buffer.append(metric)
            self.agent_metrics[agent_id].append(metric)

    async def _record_safety_metrics(self, agent_id: str, agent_type: str,
                                   safety_signals: List[Dict], timestamp: datetime):
        """Record safety-related metrics"""

        for signal in safety_signals:
            metric = AgentMetric(
                metric_id=f"{agent_id}_safety_{int(timestamp.timestamp())}_{signal.get('type', 'unknown')}",
                agent_id=agent_id,
                metric_type=MetricType.SAFETY,
                metric_name="safety_signal_detected",
                value=1,
                unit="count",
                timestamp=timestamp,
                labels={
                    "agent_type": agent_type,
                    "signal_type": signal.get('type', 'unknown'),
                    "severity": signal.get('severity', 'unknown')
                },
                clinical_context="Safety signal detection",
                patient_impact="Potential patient safety impact",
                regulatory_relevance="FDA/EMA safety reporting"
            )

            with self.metrics_lock:
                self.metrics_buffer.append(metric)
                self.agent_metrics[agent_id].append(metric)

    def _update_prometheus_metrics(self, agent_id: str, agent_type: str,
                                 operation: str, kwargs: Dict[str, Any]):
        """Update Prometheus metrics"""

        # Response time
        if 'response_time' in kwargs:
            self.agent_response_time.labels(
                agent_id=agent_id,
                agent_type=agent_type,
                specialty=kwargs.get('specialty', 'unknown'),
                query_type=operation
            ).observe(kwargs['response_time'])

        # Request counter
        status = 'success' if kwargs.get('success', True) else 'error'
        self.agent_requests_total.labels(
            agent_id=agent_id,
            agent_type=agent_type,
            specialty=kwargs.get('specialty', 'unknown'),
            status=status
        ).inc()

        # Error counter
        if not kwargs.get('success', True):
            error_type = kwargs.get('error_type', 'unknown')
            self.agent_errors_total.labels(
                agent_id=agent_id,
                agent_type=agent_type,
                error_type=error_type
            ).inc()

        # Clinical accuracy
        if 'accuracy_score' in kwargs:
            self.clinical_accuracy_score.labels(
                agent_id=agent_id,
                specialty=kwargs.get('specialty', 'unknown')
            ).set(kwargs['accuracy_score'])

        # Safety signals
        if 'safety_signals' in kwargs:
            for signal in kwargs['safety_signals']:
                self.safety_signals_detected.labels(
                    agent_id=agent_id,
                    specialty=kwargs.get('specialty', 'unknown'),
                    signal_type=signal.get('type', 'unknown'),
                    severity=signal.get('severity', 'unknown')
                ).inc()

    async def perform_health_check(self, agent_id: str, agent_type: str) -> AgentHealthCheck:
        """Perform comprehensive health check for an agent"""

        current_time = datetime.now()

        # Get recent metrics for this agent
        recent_metrics = self._get_recent_metrics(agent_id, timedelta(minutes=15))

        # Calculate health score components
        response_time_score = self._calculate_response_time_score(recent_metrics)
        error_rate_score = self._calculate_error_rate_score(recent_metrics)
        availability_score = self._calculate_availability_score(agent_id)
        clinical_score = self._calculate_clinical_score(recent_metrics)

        # Overall health score (weighted average)
        health_score = (
            response_time_score * 0.25 +
            error_rate_score * 0.25 +
            availability_score * 0.25 +
            clinical_score * 0.25
        )

        # Determine status
        if health_score >= 0.9:
            status = AgentStatus.HEALTHY
        elif health_score >= 0.7:
            status = AgentStatus.WARNING
        elif health_score >= 0.5:
            status = AgentStatus.CRITICAL
        else:
            status = AgentStatus.OFFLINE

        # Get system resource utilization
        resource_utilization = {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent
        }

        # Calculate performance metrics
        response_times = [m.value for m in recent_metrics if m.metric_name == 'response_time']
        avg_response_time = statistics.mean(response_times) if response_times else None

        error_count = len([m for m in recent_metrics if 'error' in str(m.value)])
        total_requests = len(recent_metrics)
        error_rate = (error_count / total_requests) if total_requests > 0 else 0.0

        # Identify issues and recommendations
        issues = []
        recommendations = []

        if health_score < 0.7:
            issues.append(f"Health score below threshold: {health_score:.2f}")
            recommendations.append("Investigate performance degradation")

        if error_rate > 0.05:  # >5% error rate
            issues.append(f"High error rate: {error_rate:.2%}")
            recommendations.append("Review error logs and fix recurring issues")

        if avg_response_time and avg_response_time > 2.0:  # >2 second response time
            issues.append(f"Slow response time: {avg_response_time:.2f}s")
            recommendations.append("Optimize agent performance and resource allocation")

        # Create health check result
        health_check = AgentHealthCheck(
            agent_id=agent_id,
            agent_type=agent_type,
            status=status,
            health_score=health_score,
            last_response_time=avg_response_time,
            error_rate=error_rate,
            resource_utilization=resource_utilization,
            clinical_metrics={
                'clinical_accuracy': clinical_score,
                'safety_compliance': self._calculate_safety_compliance(recent_metrics)
            },
            active_queries=self._count_active_queries(agent_id),
            completed_queries_24h=self._count_completed_queries_24h(agent_id),
            last_health_check=current_time,
            issues=issues,
            recommendations=recommendations
        )

        # Update agent tracking
        self.active_agents[agent_id] = health_check

        # Update Prometheus health score
        self.agent_health_score.labels(
            agent_id=agent_id,
            agent_type=agent_type
        ).set(health_score)

        # Check for alerts
        await self._check_for_alerts(health_check)

        return health_check

    def _get_recent_metrics(self, agent_id: str, time_window: timedelta) -> List[AgentMetric]:
        """Get recent metrics for an agent within time window"""

        cutoff_time = datetime.now() - time_window
        recent_metrics = []

        with self.metrics_lock:
            for metric in self.agent_metrics.get(agent_id, []):
                if metric.timestamp >= cutoff_time:
                    recent_metrics.append(metric)

        return recent_metrics

    def _calculate_response_time_score(self, metrics: List[AgentMetric]) -> float:
        """Calculate response time score (0-1, higher is better)"""

        response_times = [m.value for m in metrics if m.metric_name == 'response_time']

        if not response_times:
            return 0.8  # Neutral score if no data

        avg_response_time = statistics.mean(response_times)

        # Score calculation: excellent (<0.5s), good (<1s), fair (<2s), poor (>=2s)
        if avg_response_time < 0.5:
            return 1.0
        elif avg_response_time < 1.0:
            return 0.9
        elif avg_response_time < 2.0:
            return 0.7
        else:
            return 0.4

    def _calculate_error_rate_score(self, metrics: List[AgentMetric]) -> float:
        """Calculate error rate score (0-1, higher is better)"""

        if not metrics:
            return 0.8  # Neutral score if no data

        error_count = len([m for m in metrics if 'error' in str(m.value)])
        total_count = len(metrics)
        error_rate = error_count / total_count

        # Score calculation based on error rate
        if error_rate == 0:
            return 1.0
        elif error_rate < 0.01:  # <1% error rate
            return 0.95
        elif error_rate < 0.05:  # <5% error rate
            return 0.8
        elif error_rate < 0.10:  # <10% error rate
            return 0.6
        else:
            return 0.3

    def _calculate_availability_score(self, agent_id: str) -> float:
        """Calculate availability score based on uptime"""

        # For now, return a high score - in production, this would track actual uptime
        return 0.95

    def _calculate_clinical_score(self, metrics: List[AgentMetric]) -> float:
        """Calculate clinical performance score"""

        clinical_metrics = [m for m in metrics if m.metric_type == MetricType.CLINICAL]

        if not clinical_metrics:
            return 0.8  # Neutral score if no data

        accuracy_scores = [m.value for m in clinical_metrics if m.metric_name == 'accuracy_score']

        if accuracy_scores:
            return statistics.mean(accuracy_scores)
        else:
            return 0.8

    def _calculate_safety_compliance(self, metrics: List[AgentMetric]) -> float:
        """Calculate safety compliance score"""

        safety_metrics = [m for m in metrics if m.metric_type == MetricType.SAFETY]

        if not safety_metrics:
            return 0.9  # High score if no safety issues detected

        # Calculate based on severity of safety signals
        critical_signals = len([m for m in safety_metrics if 'critical' in m.labels.get('severity', '')])
        total_signals = len(safety_metrics)

        if critical_signals == 0:
            return 0.95
        else:
            # Reduce score based on critical signals ratio
            critical_ratio = critical_signals / total_signals
            return max(0.3, 0.95 - (critical_ratio * 0.65))

    def _count_active_queries(self, agent_id: str) -> int:
        """Count active queries for an agent"""
        # This would track active/ongoing queries in production
        return 0

    def _count_completed_queries_24h(self, agent_id: str) -> int:
        """Count completed queries in last 24 hours"""

        cutoff_time = datetime.now() - timedelta(hours=24)

        with self.metrics_lock:
            count = 0
            for metric in self.agent_metrics.get(agent_id, []):
                if (metric.timestamp >= cutoff_time and
                    metric.metric_name == 'request_completed'):
                    count += 1

        return count

    async def _check_for_alerts(self, health_check: AgentHealthCheck):
        """Check if any alerts should be generated based on health check"""

        alerts_to_create = []

        # Health score alert
        if health_check.health_score < 0.5:
            alerts_to_create.append({
                'type': 'health_score_critical',
                'severity': AlertSeverity.CRITICAL,
                'message': f"Agent {health_check.agent_id} health score critically low",
                'metric': 'health_score',
                'current_value': health_check.health_score,
                'threshold': 0.5,
                'clinical_impact': "Potential impact on clinical decision quality",
                'action': "Immediate investigation and remediation required"
            })
        elif health_check.health_score < 0.7:
            alerts_to_create.append({
                'type': 'health_score_warning',
                'severity': AlertSeverity.WARNING,
                'message': f"Agent {health_check.agent_id} health score below threshold",
                'metric': 'health_score',
                'current_value': health_check.health_score,
                'threshold': 0.7,
                'clinical_impact': "May affect clinical decision accuracy",
                'action': "Monitor closely and investigate performance issues"
            })

        # Error rate alert
        if health_check.error_rate > 0.1:  # >10% error rate
            alerts_to_create.append({
                'type': 'error_rate_high',
                'severity': AlertSeverity.ERROR,
                'message': f"Agent {health_check.agent_id} has high error rate",
                'metric': 'error_rate',
                'current_value': health_check.error_rate,
                'threshold': 0.1,
                'clinical_impact': "Increased risk of incorrect clinical recommendations",
                'action': "Review error logs and fix recurring issues"
            })

        # Response time alert
        if health_check.last_response_time and health_check.last_response_time > 5.0:
            alerts_to_create.append({
                'type': 'response_time_slow',
                'severity': AlertSeverity.WARNING,
                'message': f"Agent {health_check.agent_id} has slow response times",
                'metric': 'response_time',
                'current_value': health_check.last_response_time,
                'threshold': 5.0,
                'clinical_impact': "Delayed clinical decision support",
                'action': "Optimize agent performance and check resource constraints"
            })

        # Create alerts
        for alert_data in alerts_to_create:
            alert = PerformanceAlert(
                alert_id=f"alert_{health_check.agent_id}_{alert_data['type']}_{int(time.time())}",
                agent_id=health_check.agent_id,
                severity=alert_data['severity'],
                alert_type=alert_data['type'],
                message=alert_data['message'],
                metric_name=alert_data['metric'],
                current_value=alert_data['current_value'],
                threshold_value=alert_data['threshold'],
                clinical_impact=alert_data['clinical_impact'],
                recommended_action=alert_data['action']
            )

            self.active_alerts[alert.alert_id] = alert

            # Trigger alert handlers
            for handler in self.alert_handlers:
                try:
                    await handler(alert)
                except Exception as e:
                    self.logger.error(f"Alert handler failed: {e}")

    def add_alert_handler(self, handler: Callable[[PerformanceAlert], None]):
        """Add alert handler function"""
        self.alert_handlers.append(handler)

    async def get_agent_performance_summary(self, agent_id: str,
                                          time_window: timedelta = timedelta(hours=24)) -> Dict[str, Any]:
        """Get comprehensive performance summary for an agent"""

        recent_metrics = self._get_recent_metrics(agent_id, time_window)
        health_check = self.active_agents.get(agent_id)

        # Performance statistics
        response_times = [m.value for m in recent_metrics if m.metric_name == 'response_time']
        accuracy_scores = [m.value for m in recent_metrics if m.metric_name == 'accuracy_score']
        safety_metrics = [m for m in recent_metrics if m.metric_type == MetricType.SAFETY]

        summary = {
            'agent_id': agent_id,
            'time_window': str(time_window),
            'current_status': health_check.status.value if health_check else 'unknown',
            'health_score': health_check.health_score if health_check else 0.0,
            'performance': {
                'total_requests': len(recent_metrics),
                'avg_response_time': statistics.mean(response_times) if response_times else 0.0,
                'min_response_time': min(response_times) if response_times else 0.0,
                'max_response_time': max(response_times) if response_times else 0.0,
                'response_time_p95': np.percentile(response_times, 95) if response_times else 0.0,
                'error_rate': health_check.error_rate if health_check else 0.0
            },
            'clinical': {
                'avg_accuracy_score': statistics.mean(accuracy_scores) if accuracy_scores else 0.0,
                'safety_signals_detected': len(safety_metrics),
                'clinical_compliance_score': self._calculate_safety_compliance(recent_metrics)
            },
            'resource_utilization': health_check.resource_utilization if health_check else {},
            'active_alerts': len([a for a in self.active_alerts.values() if a.agent_id == agent_id and not a.resolved]),
            'issues': health_check.issues if health_check else [],
            'recommendations': health_check.recommendations if health_check else []
        }

        return summary

    async def get_system_overview(self) -> Dict[str, Any]:
        """Get system-wide monitoring overview"""

        total_agents = len(self.active_agents)
        healthy_agents = len([a for a in self.active_agents.values() if a.status == AgentStatus.HEALTHY])
        critical_agents = len([a for a in self.active_agents.values() if a.status == AgentStatus.CRITICAL])

        active_alerts = [a for a in self.active_alerts.values() if not a.resolved]
        critical_alerts = [a for a in active_alerts if a.severity == AlertSeverity.CRITICAL]

        # System resource usage
        system_resources = {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent
        }

        # Update Prometheus system metrics
        self.system_cpu_usage.set(system_resources['cpu_percent'])
        self.system_memory_usage.set(system_resources['memory_percent'])

        overview = {
            'system_health': {
                'status': 'healthy' if critical_agents == 0 and len(critical_alerts) == 0 else 'degraded',
                'total_agents': total_agents,
                'healthy_agents': healthy_agents,
                'warning_agents': len([a for a in self.active_agents.values() if a.status == AgentStatus.WARNING]),
                'critical_agents': critical_agents,
                'offline_agents': len([a for a in self.active_agents.values() if a.status == AgentStatus.OFFLINE])
            },
            'alerts': {
                'total_active': len(active_alerts),
                'critical': len(critical_alerts),
                'warnings': len([a for a in active_alerts if a.severity == AlertSeverity.WARNING]),
                'errors': len([a for a in active_alerts if a.severity == AlertSeverity.ERROR])
            },
            'performance': {
                'avg_health_score': statistics.mean([a.health_score for a in self.active_agents.values()]) if self.active_agents else 0.0,
                'total_queries_24h': sum([a.completed_queries_24h for a in self.active_agents.values()]),
                'avg_response_time': statistics.mean([a.last_response_time for a in self.active_agents.values() if a.last_response_time]) if self.active_agents else 0.0
            },
            'resources': system_resources,
            'timestamp': datetime.now().isoformat()
        }

        return overview


class AgentMonitoringDashboard:
    """Web dashboard for agent monitoring (placeholder for future implementation)"""

    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
        self.logger = logging.getLogger(__name__)

    async def generate_dashboard_data(self) -> Dict[str, Any]:
        """Generate data for monitoring dashboard"""

        system_overview = await self.metrics_collector.get_system_overview()

        # Agent details
        agent_summaries = []
        for agent_id in self.metrics_collector.active_agents.keys():
            summary = await self.metrics_collector.get_agent_performance_summary(agent_id)
            agent_summaries.append(summary)

        dashboard_data = {
            'overview': system_overview,
            'agents': agent_summaries,
            'alerts': [
                {
                    'id': alert.alert_id,
                    'agent_id': alert.agent_id,
                    'severity': alert.severity.value,
                    'type': alert.alert_type,
                    'message': alert.message,
                    'timestamp': alert.timestamp.isoformat(),
                    'resolved': alert.resolved
                }
                for alert in self.metrics_collector.active_alerts.values()
            ],
            'generated_at': datetime.now().isoformat()
        }

        return dashboard_data


async def main():
    """Example usage of the Agent Monitoring & Metrics System"""

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger(__name__)
    logger.info("Starting Agent Monitoring & Metrics System Demo")

    # Initialize metrics collector
    collector = MetricsCollector()

    # Add alert handler
    async def alert_handler(alert: PerformanceAlert):
        logger.warning(f"ALERT: {alert.severity.value.upper()} - {alert.message}")
        logger.warning(f"Clinical Impact: {alert.clinical_impact}")
        logger.warning(f"Recommended Action: {alert.recommended_action}")

    collector.add_alert_handler(alert_handler)

    # Simulate agent operations
    agent_id = "clinical_evidence_agent_001"
    agent_type = "ClinicalEvidenceAgent"

    # Simulate metrics collection
    await collector.collect_agent_metrics(
        agent_id=agent_id,
        agent_type=agent_type,
        operation="evidence_synthesis",
        response_time=1.2,
        accuracy_score=0.92,
        success=True,
        specialty="oncology",
        safety_signals=[
            {'type': 'drug_interaction', 'severity': 'moderate'},
            {'type': 'adverse_event', 'severity': 'mild'}
        ]
    )

    # Perform health check
    health_check = await collector.perform_health_check(agent_id, agent_type)
    logger.info(f"Health Check Result:")
    logger.info(f"  Agent: {health_check.agent_id}")
    logger.info(f"  Status: {health_check.status.value}")
    logger.info(f"  Health Score: {health_check.health_score:.2f}")
    logger.info(f"  Response Time: {health_check.last_response_time:.2f}s")
    logger.info(f"  Error Rate: {health_check.error_rate:.2%}")

    # Get performance summary
    summary = await collector.get_agent_performance_summary(agent_id)
    logger.info(f"Performance Summary:")
    logger.info(f"  Total Requests: {summary['performance']['total_requests']}")
    logger.info(f"  Avg Response Time: {summary['performance']['avg_response_time']:.2f}s")
    logger.info(f"  Clinical Accuracy: {summary['clinical']['avg_accuracy_score']:.2f}")

    # Get system overview
    overview = await collector.get_system_overview()
    logger.info(f"System Overview:")
    logger.info(f"  Total Agents: {overview['system_health']['total_agents']}")
    logger.info(f"  Healthy Agents: {overview['system_health']['healthy_agents']}")
    logger.info(f"  Active Alerts: {overview['alerts']['total_active']}")
    logger.info(f"  System CPU: {overview['resources']['cpu_percent']:.1f}%")
    logger.info(f"  System Memory: {overview['resources']['memory_percent']:.1f}%")

    logger.info("Agent Monitoring & Metrics System Demo Complete")


if __name__ == "__main__":
    asyncio.run(main())