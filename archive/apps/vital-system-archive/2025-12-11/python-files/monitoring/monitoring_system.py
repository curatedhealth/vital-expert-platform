"""
VITAL Path Unified Monitoring System
Comprehensive monitoring, metrics, alerting, and observability platform
"""

from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import time
import psutil
import threading
from abc import ABC, abstractmethod
import uuid
from collections import defaultdict, deque
import statistics
import sqlite3
import aiofiles
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"
    RATE = "rate"

class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"
    SILENCED = "silenced"

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class Metric:
    name: str
    type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str] = field(default_factory=dict)
    help_text: str = ""
    unit: str = ""

@dataclass
class Alert:
    alert_id: str
    name: str
    description: str
    severity: AlertSeverity
    status: AlertStatus
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    labels: Dict[str, str] = field(default_factory=dict)
    annotations: Dict[str, str] = field(default_factory=dict)
    rule_id: str = ""
    metric_value: Optional[float] = None
    threshold: Optional[float] = None

@dataclass
class HealthCheck:
    service_name: str
    status: HealthStatus
    last_check: datetime
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LogEntry:
    timestamp: datetime
    level: str
    service: str
    message: str
    correlation_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PerformanceMetrics:
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, float]
    response_time: float
    throughput: float
    error_rate: float
    active_connections: int
    timestamp: datetime

class MetricsCollector:
    def __init__(self):
        self.metrics: Dict[str, List[Metric]] = defaultdict(list)
        self.metric_history_limit = 10000
        self.collection_interval = 15  # seconds

    def record_metric(self, name: str, value: float, metric_type: MetricType,
                     labels: Dict[str, str] = None, help_text: str = "",
                     unit: str = ""):
        """Record a metric value"""
        metric = Metric(
            name=name,
            type=metric_type,
            value=value,
            timestamp=datetime.now(),
            labels=labels or {},
            help_text=help_text,
            unit=unit
        )

        self.metrics[name].append(metric)

        # Maintain history limit
        if len(self.metrics[name]) > self.metric_history_limit:
            self.metrics[name] = self.metrics[name][-self.metric_history_limit:]

        logger.debug(f"Recorded metric: {name}={value} {unit}")

    def get_metric_history(self, name: str, duration: timedelta = None) -> List[Metric]:
        """Get metric history for specified duration"""
        if name not in self.metrics:
            return []

        if duration is None:
            return self.metrics[name]

        cutoff_time = datetime.now() - duration
        return [m for m in self.metrics[name] if m.timestamp >= cutoff_time]

    def get_metric_statistics(self, name: str, duration: timedelta = None) -> Dict[str, float]:
        """Get statistical summary of metric"""
        history = self.get_metric_history(name, duration)
        if not history:
            return {}

        values = [m.value for m in history]
        return {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "p95": self._percentile(values, 95),
            "p99": self._percentile(values, 99),
            "std_dev": statistics.stdev(values) if len(values) > 1 else 0
        }

    def _percentile(self, values: List[float], percentile: int) -> float:
        """Calculate percentile"""
        sorted_values = sorted(values)
        k = (len(sorted_values) - 1) * percentile / 100
        f = int(k)
        c = k - f
        if f == len(sorted_values) - 1:
            return sorted_values[f]
        return sorted_values[f] * (1 - c) + sorted_values[f + 1] * c

class SystemMetricsCollector:
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
        self.running = False
        self.collection_thread = None

    def start_collection(self):
        """Start collecting system metrics"""
        self.running = True
        self.collection_thread = threading.Thread(target=self._collect_loop)
        self.collection_thread.daemon = True
        self.collection_thread.start()
        logger.info("System metrics collection started")

    def stop_collection(self):
        """Stop collecting system metrics"""
        self.running = False
        if self.collection_thread:
            self.collection_thread.join(timeout=5)
        logger.info("System metrics collection stopped")

    def _collect_loop(self):
        """Main collection loop"""
        while self.running:
            try:
                self._collect_system_metrics()
                time.sleep(15)  # Collect every 15 seconds
            except Exception as e:
                logger.error(f"System metrics collection error: {e}")
                time.sleep(30)  # Wait longer on error

    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        self.metrics_collector.record_metric(
            "system_cpu_usage",
            cpu_percent,
            MetricType.GAUGE,
            unit="%",
            help_text="System CPU usage percentage"
        )

        # Memory metrics
        memory = psutil.virtual_memory()
        self.metrics_collector.record_metric(
            "system_memory_usage",
            memory.percent,
            MetricType.GAUGE,
            unit="%",
            help_text="System memory usage percentage"
        )

        self.metrics_collector.record_metric(
            "system_memory_total",
            memory.total,
            MetricType.GAUGE,
            unit="bytes",
            help_text="Total system memory"
        )

        self.metrics_collector.record_metric(
            "system_memory_available",
            memory.available,
            MetricType.GAUGE,
            unit="bytes",
            help_text="Available system memory"
        )

        # Disk metrics
        disk = psutil.disk_usage('/')
        self.metrics_collector.record_metric(
            "system_disk_usage",
            (disk.used / disk.total) * 100,
            MetricType.GAUGE,
            unit="%",
            help_text="System disk usage percentage"
        )

        # Network metrics
        network = psutil.net_io_counters()
        if hasattr(self, '_last_network_stats'):
            bytes_sent_rate = network.bytes_sent - self._last_network_stats.bytes_sent
            bytes_recv_rate = network.bytes_recv - self._last_network_stats.bytes_recv

            self.metrics_collector.record_metric(
                "system_network_bytes_sent",
                bytes_sent_rate,
                MetricType.RATE,
                unit="bytes/s",
                help_text="Network bytes sent per second"
            )

            self.metrics_collector.record_metric(
                "system_network_bytes_recv",
                bytes_recv_rate,
                MetricType.RATE,
                unit="bytes/s",
                help_text="Network bytes received per second"
            )

        self._last_network_stats = network

        # Process count
        process_count = len(psutil.pids())
        self.metrics_collector.record_metric(
            "system_process_count",
            process_count,
            MetricType.GAUGE,
            help_text="Total number of running processes"
        )

class AlertRule:
    def __init__(self, rule_id: str, name: str, metric_name: str,
                 condition: str, threshold: float, duration: timedelta,
                 severity: AlertSeverity, description: str = ""):
        self.rule_id = rule_id
        self.name = name
        self.metric_name = metric_name
        self.condition = condition  # e.g., "gt", "lt", "eq", "ne"
        self.threshold = threshold
        self.duration = duration
        self.severity = severity
        self.description = description
        self.last_evaluation = None
        self.breach_start = None

    def evaluate(self, metrics: List[Metric]) -> Optional[Alert]:
        """Evaluate alert rule against metrics"""
        if not metrics:
            return None

        # Check if condition is met consistently over duration
        cutoff_time = datetime.now() - self.duration
        recent_metrics = [m for m in metrics if m.timestamp >= cutoff_time]

        if not recent_metrics:
            return None

        # Check if all recent metrics breach the threshold
        breach_count = 0
        for metric in recent_metrics:
            if self._check_condition(metric.value):
                breach_count += 1

        # If all recent metrics breach the threshold, trigger alert
        if breach_count == len(recent_metrics) and len(recent_metrics) > 0:
            if self.breach_start is None:
                self.breach_start = recent_metrics[0].timestamp

            # Only create alert if breach duration is met
            if datetime.now() - self.breach_start >= self.duration:
                alert = Alert(
                    alert_id=str(uuid.uuid4()),
                    name=self.name,
                    description=self.description,
                    severity=self.severity,
                    status=AlertStatus.ACTIVE,
                    triggered_at=datetime.now(),
                    rule_id=self.rule_id,
                    metric_value=recent_metrics[-1].value,
                    threshold=self.threshold,
                    labels={
                        "metric": self.metric_name,
                        "condition": self.condition,
                        "threshold": str(self.threshold)
                    }
                )
                return alert
        else:
            self.breach_start = None

        return None

    def _check_condition(self, value: float) -> bool:
        """Check if metric value meets condition"""
        if self.condition == "gt":
            return value > self.threshold
        elif self.condition == "lt":
            return value < self.threshold
        elif self.condition == "eq":
            return abs(value - self.threshold) < 0.001
        elif self.condition == "ne":
            return abs(value - self.threshold) >= 0.001
        elif self.condition == "gte":
            return value >= self.threshold
        elif self.condition == "lte":
            return value <= self.threshold
        return False

class AlertManager:
    def __init__(self):
        self.rules: Dict[str, AlertRule] = {}
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.notification_handlers: List[Callable] = []
        self.evaluation_interval = 30  # seconds
        self.running = False
        self.evaluation_thread = None

    def add_rule(self, rule: AlertRule):
        """Add alert rule"""
        self.rules[rule.rule_id] = rule
        logger.info(f"Alert rule added: {rule.name}")

    def remove_rule(self, rule_id: str):
        """Remove alert rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
            logger.info(f"Alert rule removed: {rule_id}")

    def add_notification_handler(self, handler: Callable):
        """Add notification handler"""
        self.notification_handlers.append(handler)

    def start_evaluation(self, metrics_collector: MetricsCollector):
        """Start alert rule evaluation"""
        self.metrics_collector = metrics_collector
        self.running = True
        self.evaluation_thread = threading.Thread(target=self._evaluation_loop)
        self.evaluation_thread.daemon = True
        self.evaluation_thread.start()
        logger.info("Alert evaluation started")

    def stop_evaluation(self):
        """Stop alert rule evaluation"""
        self.running = False
        if self.evaluation_thread:
            self.evaluation_thread.join(timeout=5)
        logger.info("Alert evaluation stopped")

    def _evaluation_loop(self):
        """Main evaluation loop"""
        while self.running:
            try:
                self._evaluate_rules()
                time.sleep(self.evaluation_interval)
            except Exception as e:
                logger.error(f"Alert evaluation error: {e}")
                time.sleep(60)  # Wait longer on error

    def _evaluate_rules(self):
        """Evaluate all alert rules"""
        for rule in self.rules.values():
            try:
                metrics = self.metrics_collector.get_metric_history(
                    rule.metric_name,
                    rule.duration + timedelta(minutes=5)  # Get a bit more history
                )
                alert = rule.evaluate(metrics)

                if alert:
                    # Check if this is a new alert or update to existing
                    existing_alert = None
                    for existing in self.active_alerts.values():
                        if (existing.rule_id == rule.rule_id and
                            existing.status == AlertStatus.ACTIVE):
                            existing_alert = existing
                            break

                    if not existing_alert:
                        # New alert
                        self.active_alerts[alert.alert_id] = alert
                        self.alert_history.append(alert)
                        self._send_notifications(alert)
                        logger.warning(f"Alert triggered: {alert.name}")

            except Exception as e:
                logger.error(f"Error evaluating rule {rule.rule_id}: {e}")

    def acknowledge_alert(self, alert_id: str, user_id: str = None) -> bool:
        """Acknowledge an alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.status = AlertStatus.ACKNOWLEDGED
            alert.annotations["acknowledged_by"] = user_id or "system"
            alert.annotations["acknowledged_at"] = datetime.now().isoformat()
            logger.info(f"Alert acknowledged: {alert.name}")
            return True
        return False

    def resolve_alert(self, alert_id: str, user_id: str = None) -> bool:
        """Resolve an alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = datetime.now()
            alert.annotations["resolved_by"] = user_id or "system"
            logger.info(f"Alert resolved: {alert.name}")
            return True
        return False

    def _send_notifications(self, alert: Alert):
        """Send alert notifications"""
        for handler in self.notification_handlers:
            try:
                handler(alert)
            except Exception as e:
                logger.error(f"Notification handler error: {e}")

class HealthMonitor:
    def __init__(self):
        self.services: Dict[str, HealthCheck] = {}
        self.check_interval = 60  # seconds
        self.running = False
        self.monitor_thread = None

    def register_service(self, service_name: str, check_function: Callable,
                        timeout: int = 30):
        """Register a service for health monitoring"""
        self.services[service_name] = {
            'check_function': check_function,
            'timeout': timeout,
            'health_check': HealthCheck(
                service_name=service_name,
                status=HealthStatus.UNKNOWN,
                last_check=datetime.now()
            )
        }
        logger.info(f"Service registered for health monitoring: {service_name}")

    def start_monitoring(self):
        """Start health monitoring"""
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        logger.info("Health monitoring started")

    def stop_monitoring(self):
        """Stop health monitoring"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("Health monitoring stopped")

    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                self._check_all_services()
                time.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Health monitoring error: {e}")
                time.sleep(120)  # Wait longer on error

    def _check_all_services(self):
        """Check health of all registered services"""
        for service_name, service_config in self.services.items():
            try:
                start_time = time.time()
                check_function = service_config['check_function']
                timeout = service_config['timeout']

                # Run health check with timeout
                result = asyncio.run(asyncio.wait_for(
                    self._run_check(check_function),
                    timeout=timeout
                ))

                response_time = time.time() - start_time

                health_check = HealthCheck(
                    service_name=service_name,
                    status=HealthStatus.HEALTHY if result else HealthStatus.UNHEALTHY,
                    last_check=datetime.now(),
                    response_time=response_time,
                    error_message=None if result else "Health check failed"
                )

                self.services[service_name]['health_check'] = health_check

            except asyncio.TimeoutError:
                health_check = HealthCheck(
                    service_name=service_name,
                    status=HealthStatus.UNHEALTHY,
                    last_check=datetime.now(),
                    error_message="Health check timeout"
                )
                self.services[service_name]['health_check'] = health_check

            except Exception as e:
                health_check = HealthCheck(
                    service_name=service_name,
                    status=HealthStatus.UNHEALTHY,
                    last_check=datetime.now(),
                    error_message=str(e)
                )
                self.services[service_name]['health_check'] = health_check

    async def _run_check(self, check_function: Callable) -> bool:
        """Run health check function"""
        if asyncio.iscoroutinefunction(check_function):
            return await check_function()
        else:
            return check_function()

    def get_overall_health(self) -> HealthStatus:
        """Get overall system health"""
        if not self.services:
            return HealthStatus.UNKNOWN

        healthy_count = 0
        unhealthy_count = 0
        degraded_count = 0

        for service_config in self.services.values():
            health_check = service_config['health_check']
            if health_check.status == HealthStatus.HEALTHY:
                healthy_count += 1
            elif health_check.status == HealthStatus.UNHEALTHY:
                unhealthy_count += 1
            elif health_check.status == HealthStatus.DEGRADED:
                degraded_count += 1

        total_services = len(self.services)

        if unhealthy_count > 0:
            return HealthStatus.UNHEALTHY
        elif degraded_count > 0:
            return HealthStatus.DEGRADED
        elif healthy_count == total_services:
            return HealthStatus.HEALTHY
        else:
            return HealthStatus.UNKNOWN

class LogAggregator:
    def __init__(self, max_entries: int = 100000):
        self.log_entries: deque = deque(maxlen=max_entries)
        self.log_index: Dict[str, List[LogEntry]] = defaultdict(list)

    def add_log_entry(self, entry: LogEntry):
        """Add log entry"""
        self.log_entries.append(entry)

        # Index by service and level
        self.log_index[f"service:{entry.service}"].append(entry)
        self.log_index[f"level:{entry.level}"].append(entry)

        if entry.user_id:
            self.log_index[f"user:{entry.user_id}"].append(entry)

        if entry.correlation_id:
            self.log_index[f"correlation:{entry.correlation_id}"].append(entry)

    def search_logs(self, query: str = None, service: str = None,
                   level: str = None, start_time: datetime = None,
                   end_time: datetime = None, limit: int = 1000) -> List[LogEntry]:
        """Search log entries"""
        results = list(self.log_entries)

        # Filter by service
        if service:
            results = [e for e in results if e.service == service]

        # Filter by level
        if level:
            results = [e for e in results if e.level == level]

        # Filter by time range
        if start_time:
            results = [e for e in results if e.timestamp >= start_time]

        if end_time:
            results = [e for e in results if e.timestamp <= end_time]

        # Text search in message
        if query:
            results = [e for e in results if query.lower() in e.message.lower()]

        # Sort by timestamp (most recent first)
        results.sort(key=lambda x: x.timestamp, reverse=True)

        return results[:limit]

class MonitoringDashboard:
    def __init__(self, metrics_collector: MetricsCollector,
                 alert_manager: AlertManager,
                 health_monitor: HealthMonitor,
                 log_aggregator: LogAggregator):
        self.metrics_collector = metrics_collector
        self.alert_manager = alert_manager
        self.health_monitor = health_monitor
        self.log_aggregator = log_aggregator

    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        return {
            "system_health": {
                "overall_status": self.health_monitor.get_overall_health().value,
                "services": {
                    name: {
                        "status": config['health_check'].status.value,
                        "last_check": config['health_check'].last_check.isoformat(),
                        "response_time": config['health_check'].response_time,
                        "error_message": config['health_check'].error_message
                    }
                    for name, config in self.health_monitor.services.items()
                }
            },
            "alerts": {
                "active_count": len([a for a in self.alert_manager.active_alerts.values()
                                   if a.status == AlertStatus.ACTIVE]),
                "critical_count": len([a for a in self.alert_manager.active_alerts.values()
                                     if a.status == AlertStatus.ACTIVE and
                                        a.severity == AlertSeverity.CRITICAL]),
                "recent_alerts": [
                    {
                        "name": alert.name,
                        "severity": alert.severity.value,
                        "status": alert.status.value,
                        "triggered_at": alert.triggered_at.isoformat(),
                        "metric_value": alert.metric_value,
                        "threshold": alert.threshold
                    }
                    for alert in sorted(self.alert_manager.alert_history[-10:],
                                      key=lambda x: x.triggered_at, reverse=True)
                ]
            },
            "performance": await self._get_performance_summary(),
            "logs": {
                "total_entries": len(self.log_aggregator.log_entries),
                "recent_errors": len([
                    e for e in list(self.log_aggregator.log_entries)[-1000:]
                    if e.level in ['ERROR', 'CRITICAL'] and
                       (datetime.now() - e.timestamp).total_seconds() < 3600
                ])
            },
            "timestamp": datetime.now().isoformat()
        }

    async def _get_performance_summary(self) -> Dict[str, Any]:
        """Get performance metrics summary"""
        cpu_stats = self.metrics_collector.get_metric_statistics(
            "system_cpu_usage", timedelta(hours=1)
        )
        memory_stats = self.metrics_collector.get_metric_statistics(
            "system_memory_usage", timedelta(hours=1)
        )

        return {
            "cpu_usage": {
                "current": cpu_stats.get("mean", 0),
                "max_1h": cpu_stats.get("max", 0),
                "avg_1h": cpu_stats.get("mean", 0)
            },
            "memory_usage": {
                "current": memory_stats.get("mean", 0),
                "max_1h": memory_stats.get("max", 0),
                "avg_1h": memory_stats.get("mean", 0)
            },
            "alerts_triggered_24h": len([
                a for a in self.alert_manager.alert_history
                if (datetime.now() - a.triggered_at).days < 1
            ])
        }

class MonitoringOrchestrator:
    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.system_metrics_collector = SystemMetricsCollector(self.metrics_collector)
        self.alert_manager = AlertManager()
        self.health_monitor = HealthMonitor()
        self.log_aggregator = LogAggregator()
        self.dashboard = MonitoringDashboard(
            self.metrics_collector,
            self.alert_manager,
            self.health_monitor,
            self.log_aggregator
        )
        self.initialized = False

    async def initialize(self):
        """Initialize monitoring system"""
        if self.initialized:
            return

        # Setup default alert rules
        await self._setup_default_alert_rules()

        # Setup default health checks
        await self._setup_default_health_checks()

        # Start monitoring components
        self.system_metrics_collector.start_collection()
        self.alert_manager.start_evaluation(self.metrics_collector)
        self.health_monitor.start_monitoring()

        self.initialized = True
        logger.info("Monitoring system initialized")

    async def shutdown(self):
        """Shutdown monitoring system"""
        self.system_metrics_collector.stop_collection()
        self.alert_manager.stop_evaluation()
        self.health_monitor.stop_monitoring()
        logger.info("Monitoring system shutdown")

    async def _setup_default_alert_rules(self):
        """Setup default alert rules"""
        default_rules = [
            AlertRule(
                rule_id="high_cpu_usage",
                name="High CPU Usage",
                metric_name="system_cpu_usage",
                condition="gt",
                threshold=80.0,
                duration=timedelta(minutes=5),
                severity=AlertSeverity.WARNING,
                description="CPU usage is consistently above 80% for 5 minutes"
            ),
            AlertRule(
                rule_id="high_memory_usage",
                name="High Memory Usage",
                metric_name="system_memory_usage",
                condition="gt",
                threshold=90.0,
                duration=timedelta(minutes=3),
                severity=AlertSeverity.ERROR,
                description="Memory usage is consistently above 90% for 3 minutes"
            ),
            AlertRule(
                rule_id="disk_space_low",
                name="Low Disk Space",
                metric_name="system_disk_usage",
                condition="gt",
                threshold=85.0,
                duration=timedelta(minutes=1),
                severity=AlertSeverity.WARNING,
                description="Disk usage is above 85%"
            ),
            AlertRule(
                rule_id="disk_space_critical",
                name="Critical Disk Space",
                metric_name="system_disk_usage",
                condition="gt",
                threshold=95.0,
                duration=timedelta(seconds=30),
                severity=AlertSeverity.CRITICAL,
                description="Disk usage is critically low - above 95%"
            )
        ]

        for rule in default_rules:
            self.alert_manager.add_rule(rule)

    async def _setup_default_health_checks(self):
        """Setup default health checks"""
        # Database health check
        async def check_database():
            try:
                # This would check actual database connection
                return True
            except Exception:
                return False

        # API health check
        async def check_api():
            try:
                # This would check API endpoints
                return True
            except Exception:
                return False

        self.health_monitor.register_service("database", check_database)
        self.health_monitor.register_service("api", check_api)

    def record_custom_metric(self, name: str, value: float,
                           metric_type: MetricType = MetricType.GAUGE,
                           labels: Dict[str, str] = None,
                           help_text: str = "", unit: str = ""):
        """Record custom application metric"""
        self.metrics_collector.record_metric(
            name, value, metric_type, labels, help_text, unit
        )

    def log_event(self, level: str, service: str, message: str,
                 user_id: str = None, session_id: str = None,
                 correlation_id: str = None, metadata: Dict[str, Any] = None):
        """Log application event"""
        log_entry = LogEntry(
            timestamp=datetime.now(),
            level=level,
            service=service,
            message=message,
            user_id=user_id,
            session_id=session_id,
            correlation_id=correlation_id,
            metadata=metadata or {}
        )
        self.log_aggregator.add_log_entry(log_entry)

    async def get_monitoring_summary(self) -> Dict[str, Any]:
        """Get comprehensive monitoring summary"""
        return await self.dashboard.get_dashboard_data()

# Global monitoring orchestrator instance
monitoring_orchestrator = MonitoringOrchestrator()