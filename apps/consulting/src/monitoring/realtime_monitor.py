"""
VITAL Path Phase 3: Real-time Monitoring System
Comprehensive real-time monitoring, alerting, and health checking system.
"""

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable, Set
from enum import Enum
import json
from datetime import datetime, timedelta
import logging
import asyncio
import websockets
import aiohttp
from collections import deque, defaultdict
import statistics
import psutil
import time

class HealthStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class MonitorType(Enum):
    SYSTEM = "system"
    APPLICATION = "application"
    BUSINESS = "business"
    NETWORK = "network"
    DATABASE = "database"
    SECURITY = "security"
    USER_EXPERIENCE = "user_experience"

class NotificationChannel(Enum):
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    SMS = "sms"
    DASHBOARD = "dashboard"
    PAGER_DUTY = "pager_duty"

class MetricAggregation(Enum):
    AVERAGE = "average"
    SUM = "sum"
    COUNT = "count"
    MIN = "min"
    MAX = "max"
    PERCENTILE = "percentile"
    RATE = "rate"

@dataclass
class HealthCheck:
    check_id: str
    name: str
    description: str
    monitor_type: MonitorType
    check_function: Callable
    interval_seconds: int
    timeout_seconds: int
    failure_threshold: int
    recovery_threshold: int
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class HealthCheckResult:
    check_id: str
    timestamp: datetime
    status: HealthStatus
    response_time_ms: float
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

@dataclass
class MonitoringRule:
    rule_id: str
    name: str
    description: str
    metric_name: str
    condition: str
    threshold_value: float
    aggregation: MetricAggregation
    window_size_seconds: int
    evaluation_interval_seconds: int
    notification_channels: List[NotificationChannel]
    severity: str
    enabled: bool = True

@dataclass
class Alert:
    alert_id: str
    rule_id: str
    metric_name: str
    current_value: float
    threshold_value: float
    condition: str
    severity: str
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

@dataclass
class MetricPoint:
    timestamp: datetime
    value: float
    tags: Dict[str, str] = field(default_factory=dict)

@dataclass
class NotificationTemplate:
    template_id: str
    channel: NotificationChannel
    subject_template: str
    body_template: str
    format_type: str = "text"

class MetricsBuffer:
    """Thread-safe metrics buffer with time-window aggregation."""

    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self.data = defaultdict(lambda: deque(maxlen=max_size))
        self._lock = asyncio.Lock()

    async def add_point(self, metric_name: str, point: MetricPoint):
        async with self._lock:
            self.data[metric_name].append(point)

    async def get_points(self, metric_name: str,
                        start_time: datetime,
                        end_time: datetime) -> List[MetricPoint]:
        async with self._lock:
            points = self.data.get(metric_name, [])
            return [p for p in points if start_time <= p.timestamp <= end_time]

    async def aggregate(self, metric_name: str,
                       start_time: datetime,
                       end_time: datetime,
                       aggregation: MetricAggregation) -> Optional[float]:
        points = await self.get_points(metric_name, start_time, end_time)
        if not points:
            return None

        values = [p.value for p in points]

        if aggregation == MetricAggregation.AVERAGE:
            return statistics.mean(values)
        elif aggregation == MetricAggregation.SUM:
            return sum(values)
        elif aggregation == MetricAggregation.COUNT:
            return len(values)
        elif aggregation == MetricAggregation.MIN:
            return min(values)
        elif aggregation == MetricAggregation.MAX:
            return max(values)
        elif aggregation == MetricAggregation.RATE:
            if len(values) < 2:
                return 0.0
            time_diff = (end_time - start_time).total_seconds()
            return (values[-1] - values[0]) / time_diff if time_diff > 0 else 0.0

        return None

class RealtimeMonitor:
    """
    Comprehensive real-time monitoring system providing health checks,
    metrics collection, alerting, and real-time notifications.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.health_checks = {}
        self.monitoring_rules = {}
        self.notifications = {}
        self.metrics_buffer = MetricsBuffer()
        self.active_alerts = {}
        self.check_results_history = defaultdict(lambda: deque(maxlen=100))
        self.websocket_clients = set()
        self.running = False

        # Initialize notification templates
        self.notification_templates = self._initialize_notification_templates()

        # Initialize built-in health checks
        self._initialize_builtin_health_checks()

        # Initialize built-in monitoring rules
        self._initialize_builtin_monitoring_rules()

    def _initialize_notification_templates(self) -> Dict[str, NotificationTemplate]:
        """Initialize notification templates for different channels."""
        return {
            "email_alert": NotificationTemplate(
                template_id="email_alert",
                channel=NotificationChannel.EMAIL,
                subject_template="VITAL Path Alert: {severity} - {metric_name}",
                body_template="""
Alert Details:
- Metric: {metric_name}
- Current Value: {current_value}
- Threshold: {threshold_value}
- Condition: {condition}
- Triggered At: {triggered_at}
- Message: {message}

This is an automated alert from the VITAL Path monitoring system.
                """.strip()
            ),
            "slack_alert": NotificationTemplate(
                template_id="slack_alert",
                channel=NotificationChannel.SLACK,
                subject_template="",
                body_template="""
🚨 *{severity} Alert*
*Metric:* {metric_name}
*Value:* {current_value} (threshold: {threshold_value})
*Condition:* {condition}
*Time:* {triggered_at}
*Message:* {message}
                """.strip(),
                format_type="markdown"
            ),
            "webhook_alert": NotificationTemplate(
                template_id="webhook_alert",
                channel=NotificationChannel.WEBHOOK,
                subject_template="",
                body_template=json.dumps({
                    "alert_type": "metric_threshold",
                    "severity": "{severity}",
                    "metric_name": "{metric_name}",
                    "current_value": "{current_value}",
                    "threshold_value": "{threshold_value}",
                    "condition": "{condition}",
                    "triggered_at": "{triggered_at}",
                    "message": "{message}"
                })
            )
        }

    def _initialize_builtin_health_checks(self):
        """Initialize built-in system health checks."""

        # System CPU check
        self.health_checks["system_cpu"] = HealthCheck(
            check_id="system_cpu",
            name="System CPU Usage",
            description="Monitor system CPU utilization",
            monitor_type=MonitorType.SYSTEM,
            check_function=self._check_cpu_usage,
            interval_seconds=30,
            timeout_seconds=5,
            failure_threshold=3,
            recovery_threshold=2
        )

        # System memory check
        self.health_checks["system_memory"] = HealthCheck(
            check_id="system_memory",
            name="System Memory Usage",
            description="Monitor system memory utilization",
            monitor_type=MonitorType.SYSTEM,
            check_function=self._check_memory_usage,
            interval_seconds=30,
            timeout_seconds=5,
            failure_threshold=3,
            recovery_threshold=2
        )

        # Disk space check
        self.health_checks["system_disk"] = HealthCheck(
            check_id="system_disk",
            name="System Disk Space",
            description="Monitor disk space usage",
            monitor_type=MonitorType.SYSTEM,
            check_function=self._check_disk_usage,
            interval_seconds=300,
            timeout_seconds=10,
            failure_threshold=2,
            recovery_threshold=1
        )

        # Application health check
        self.health_checks["app_health"] = HealthCheck(
            check_id="app_health",
            name="Application Health",
            description="Monitor application components health",
            monitor_type=MonitorType.APPLICATION,
            check_function=self._check_application_health,
            interval_seconds=60,
            timeout_seconds=15,
            failure_threshold=2,
            recovery_threshold=1
        )

    def _initialize_builtin_monitoring_rules(self):
        """Initialize built-in monitoring rules."""

        # High CPU usage rule
        self.monitoring_rules["high_cpu"] = MonitoringRule(
            rule_id="high_cpu",
            name="High CPU Usage",
            description="Alert when CPU usage exceeds threshold",
            metric_name="system.cpu.usage",
            condition="greater_than",
            threshold_value=80.0,
            aggregation=MetricAggregation.AVERAGE,
            window_size_seconds=300,
            evaluation_interval_seconds=60,
            notification_channels=[NotificationChannel.DASHBOARD, NotificationChannel.EMAIL],
            severity="warning"
        )

        # High memory usage rule
        self.monitoring_rules["high_memory"] = MonitoringRule(
            rule_id="high_memory",
            name="High Memory Usage",
            description="Alert when memory usage exceeds threshold",
            metric_name="system.memory.usage",
            condition="greater_than",
            threshold_value=85.0,
            aggregation=MetricAggregation.AVERAGE,
            window_size_seconds=300,
            evaluation_interval_seconds=60,
            notification_channels=[NotificationChannel.DASHBOARD, NotificationChannel.EMAIL],
            severity="warning"
        )

        # Application error rate rule
        self.monitoring_rules["high_error_rate"] = MonitoringRule(
            rule_id="high_error_rate",
            name="High Application Error Rate",
            description="Alert when application error rate is high",
            metric_name="application.error_rate",
            condition="greater_than",
            threshold_value=5.0,
            aggregation=MetricAggregation.RATE,
            window_size_seconds=600,
            evaluation_interval_seconds=120,
            notification_channels=[NotificationChannel.DASHBOARD, NotificationChannel.SLACK],
            severity="critical"
        )

    async def start_monitoring(self):
        """Start the real-time monitoring system."""
        try:
            self.running = True
            self.logger.info("Starting real-time monitoring system")

            # Start health check tasks
            health_check_tasks = [
                asyncio.create_task(self._run_health_check_loop(check))
                for check in self.health_checks.values()
            ]

            # Start rule evaluation tasks
            rule_evaluation_tasks = [
                asyncio.create_task(self._run_rule_evaluation_loop(rule))
                for rule in self.monitoring_rules.values()
                if rule.enabled
            ]

            # Start metrics collection task
            metrics_task = asyncio.create_task(self._collect_system_metrics())

            # Start WebSocket server for real-time updates
            websocket_task = asyncio.create_task(self._start_websocket_server())

            # Wait for all tasks
            await asyncio.gather(
                *health_check_tasks,
                *rule_evaluation_tasks,
                metrics_task,
                websocket_task,
                return_exceptions=True
            )

        except Exception as e:
            self.logger.error(f"Error in monitoring system: {str(e)}")
        finally:
            self.running = False

    async def stop_monitoring(self):
        """Stop the monitoring system gracefully."""
        self.running = False
        self.logger.info("Stopping real-time monitoring system")

    async def _run_health_check_loop(self, health_check: HealthCheck):
        """Run individual health check in a loop."""
        consecutive_failures = 0
        consecutive_successes = 0
        last_status = HealthStatus.UNKNOWN

        while self.running:
            try:
                start_time = time.time()

                # Execute health check with timeout
                try:
                    result = await asyncio.wait_for(
                        health_check.check_function(),
                        timeout=health_check.timeout_seconds
                    )
                except asyncio.TimeoutError:
                    result = HealthCheckResult(
                        check_id=health_check.check_id,
                        timestamp=datetime.now(),
                        status=HealthStatus.UNHEALTHY,
                        response_time_ms=(time.time() - start_time) * 1000,
                        message="Health check timed out",
                        error="Timeout"
                    )
                except Exception as e:
                    result = HealthCheckResult(
                        check_id=health_check.check_id,
                        timestamp=datetime.now(),
                        status=HealthStatus.UNHEALTHY,
                        response_time_ms=(time.time() - start_time) * 1000,
                        message=f"Health check failed: {str(e)}",
                        error=str(e)
                    )
                else:
                    if not isinstance(result, HealthCheckResult):
                        result = HealthCheckResult(
                            check_id=health_check.check_id,
                            timestamp=datetime.now(),
                            status=HealthStatus.HEALTHY,
                            response_time_ms=(time.time() - start_time) * 1000,
                            message="Health check passed"
                        )

                # Update consecutive counters
                if result.status in [HealthStatus.UNHEALTHY, HealthStatus.CRITICAL]:
                    consecutive_failures += 1
                    consecutive_successes = 0
                else:
                    consecutive_successes += 1
                    consecutive_failures = 0

                # Determine if status change should trigger notification
                status_changed = False
                if (consecutive_failures >= health_check.failure_threshold and
                    last_status != HealthStatus.UNHEALTHY):
                    status_changed = True
                    last_status = HealthStatus.UNHEALTHY
                elif (consecutive_successes >= health_check.recovery_threshold and
                      last_status != HealthStatus.HEALTHY):
                    status_changed = True
                    last_status = HealthStatus.HEALTHY

                # Store result
                self.check_results_history[health_check.check_id].append(result)

                # Send real-time update
                await self._broadcast_health_update(result)

                # Trigger notifications if status changed
                if status_changed:
                    await self._handle_health_status_change(health_check, result, last_status)

            except Exception as e:
                self.logger.error(f"Error in health check loop {health_check.check_id}: {str(e)}")

            await asyncio.sleep(health_check.interval_seconds)

    async def _run_rule_evaluation_loop(self, rule: MonitoringRule):
        """Run monitoring rule evaluation in a loop."""
        while self.running and rule.enabled:
            try:
                await self._evaluate_monitoring_rule(rule)
            except Exception as e:
                self.logger.error(f"Error evaluating rule {rule.rule_id}: {str(e)}")

            await asyncio.sleep(rule.evaluation_interval_seconds)

    async def _evaluate_monitoring_rule(self, rule: MonitoringRule):
        """Evaluate a monitoring rule and trigger alerts if necessary."""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(seconds=rule.window_size_seconds)

            # Aggregate metric value over the window
            aggregated_value = await self.metrics_buffer.aggregate(
                rule.metric_name, start_time, end_time, rule.aggregation
            )

            if aggregated_value is None:
                return  # No data available

            # Check condition
            alert_triggered = False
            if rule.condition == "greater_than":
                alert_triggered = aggregated_value > rule.threshold_value
            elif rule.condition == "less_than":
                alert_triggered = aggregated_value < rule.threshold_value
            elif rule.condition == "equals":
                alert_triggered = abs(aggregated_value - rule.threshold_value) < 0.001

            # Handle alert state
            alert_id = f"{rule.rule_id}_{rule.metric_name}"

            if alert_triggered:
                if alert_id not in self.active_alerts:
                    # Create new alert
                    alert = Alert(
                        alert_id=alert_id,
                        rule_id=rule.rule_id,
                        metric_name=rule.metric_name,
                        current_value=aggregated_value,
                        threshold_value=rule.threshold_value,
                        condition=rule.condition,
                        severity=rule.severity,
                        message=f"Metric {rule.metric_name} {rule.condition} {rule.threshold_value}",
                        triggered_at=datetime.now()
                    )

                    self.active_alerts[alert_id] = alert
                    await self._send_alert_notifications(alert, rule.notification_channels)
                    await self._broadcast_alert_update(alert)
            else:
                if alert_id in self.active_alerts:
                    # Resolve existing alert
                    alert = self.active_alerts[alert_id]
                    alert.resolved_at = datetime.now()
                    del self.active_alerts[alert_id]
                    await self._send_resolution_notifications(alert, rule.notification_channels)
                    await self._broadcast_alert_resolution(alert)

        except Exception as e:
            self.logger.error(f"Error evaluating monitoring rule {rule.rule_id}: {str(e)}")

    async def _collect_system_metrics(self):
        """Collect system metrics continuously."""
        while self.running:
            try:
                timestamp = datetime.now()

                # CPU metrics
                cpu_percent = psutil.cpu_percent()
                await self.metrics_buffer.add_point(
                    "system.cpu.usage",
                    MetricPoint(timestamp, cpu_percent, {"host": "localhost"})
                )

                # Memory metrics
                memory = psutil.virtual_memory()
                await self.metrics_buffer.add_point(
                    "system.memory.usage",
                    MetricPoint(timestamp, memory.percent, {"host": "localhost"})
                )

                # Disk metrics
                disk = psutil.disk_usage('/')
                disk_percent = (disk.used / disk.total) * 100
                await self.metrics_buffer.add_point(
                    "system.disk.usage",
                    MetricPoint(timestamp, disk_percent, {"host": "localhost", "mount": "/"})
                )

                # Network metrics
                network = psutil.net_io_counters()
                await self.metrics_buffer.add_point(
                    "system.network.bytes_sent",
                    MetricPoint(timestamp, network.bytes_sent, {"host": "localhost"})
                )
                await self.metrics_buffer.add_point(
                    "system.network.bytes_recv",
                    MetricPoint(timestamp, network.bytes_recv, {"host": "localhost"})
                )

            except Exception as e:
                self.logger.error(f"Error collecting system metrics: {str(e)}")

            await asyncio.sleep(10)  # Collect every 10 seconds

    # Built-in health check functions
    async def _check_cpu_usage(self) -> HealthCheckResult:
        """Check CPU usage health."""
        cpu_percent = psutil.cpu_percent(interval=1)

        if cpu_percent > 90:
            status = HealthStatus.CRITICAL
            message = f"CPU usage critically high: {cpu_percent:.1f}%"
        elif cpu_percent > 80:
            status = HealthStatus.WARNING
            message = f"CPU usage high: {cpu_percent:.1f}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"CPU usage normal: {cpu_percent:.1f}%"

        return HealthCheckResult(
            check_id="system_cpu",
            timestamp=datetime.now(),
            status=status,
            response_time_ms=1000,  # 1 second interval
            message=message,
            details={"cpu_percent": cpu_percent}
        )

    async def _check_memory_usage(self) -> HealthCheckResult:
        """Check memory usage health."""
        memory = psutil.virtual_memory()

        if memory.percent > 95:
            status = HealthStatus.CRITICAL
            message = f"Memory usage critically high: {memory.percent:.1f}%"
        elif memory.percent > 85:
            status = HealthStatus.WARNING
            message = f"Memory usage high: {memory.percent:.1f}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"Memory usage normal: {memory.percent:.1f}%"

        return HealthCheckResult(
            check_id="system_memory",
            timestamp=datetime.now(),
            status=status,
            response_time_ms=50,
            message=message,
            details={"memory_percent": memory.percent, "available_gb": memory.available / (1024**3)}
        )

    async def _check_disk_usage(self) -> HealthCheckResult:
        """Check disk usage health."""
        disk = psutil.disk_usage('/')
        usage_percent = (disk.used / disk.total) * 100

        if usage_percent > 95:
            status = HealthStatus.CRITICAL
            message = f"Disk usage critically high: {usage_percent:.1f}%"
        elif usage_percent > 85:
            status = HealthStatus.WARNING
            message = f"Disk usage high: {usage_percent:.1f}%"
        else:
            status = HealthStatus.HEALTHY
            message = f"Disk usage normal: {usage_percent:.1f}%"

        return HealthCheckResult(
            check_id="system_disk",
            timestamp=datetime.now(),
            status=status,
            response_time_ms=100,
            message=message,
            details={
                "usage_percent": usage_percent,
                "free_gb": disk.free / (1024**3),
                "total_gb": disk.total / (1024**3)
            }
        )

    async def _check_application_health(self) -> HealthCheckResult:
        """Check application health."""
        # This would check various application components
        # For demo purposes, return healthy status

        return HealthCheckResult(
            check_id="app_health",
            timestamp=datetime.now(),
            status=HealthStatus.HEALTHY,
            response_time_ms=200,
            message="All application components are healthy",
            details={
                "database": "healthy",
                "cache": "healthy",
                "api": "healthy",
                "workers": "healthy"
            }
        )

    async def _send_alert_notifications(self, alert: Alert, channels: List[NotificationChannel]):
        """Send alert notifications through specified channels."""
        for channel in channels:
            try:
                if channel == NotificationChannel.EMAIL:
                    await self._send_email_notification(alert)
                elif channel == NotificationChannel.SLACK:
                    await self._send_slack_notification(alert)
                elif channel == NotificationChannel.WEBHOOK:
                    await self._send_webhook_notification(alert)
                elif channel == NotificationChannel.DASHBOARD:
                    # Dashboard notifications are handled by WebSocket broadcasts
                    pass
            except Exception as e:
                self.logger.error(f"Error sending {channel.value} notification: {str(e)}")

    async def _send_email_notification(self, alert: Alert):
        """Send email notification (placeholder implementation)."""
        template = self.notification_templates["email_alert"]
        subject = template.subject_template.format(
            severity=alert.severity,
            metric_name=alert.metric_name
        )
        body = template.body_template.format(
            metric_name=alert.metric_name,
            current_value=alert.current_value,
            threshold_value=alert.threshold_value,
            condition=alert.condition,
            triggered_at=alert.triggered_at.isoformat(),
            message=alert.message
        )

        self.logger.info(f"Email notification: {subject}")
        # In a real implementation, this would send an actual email

    async def _send_slack_notification(self, alert: Alert):
        """Send Slack notification (placeholder implementation)."""
        template = self.notification_templates["slack_alert"]
        message = template.body_template.format(
            severity=alert.severity.upper(),
            metric_name=alert.metric_name,
            current_value=alert.current_value,
            threshold_value=alert.threshold_value,
            condition=alert.condition,
            triggered_at=alert.triggered_at.strftime("%Y-%m-%d %H:%M:%S"),
            message=alert.message
        )

        self.logger.info(f"Slack notification: {message}")
        # In a real implementation, this would send to Slack webhook

    async def _send_webhook_notification(self, alert: Alert):
        """Send webhook notification."""
        template = self.notification_templates["webhook_alert"]
        payload = json.loads(template.body_template.format(
            severity=alert.severity,
            metric_name=alert.metric_name,
            current_value=alert.current_value,
            threshold_value=alert.threshold_value,
            condition=alert.condition,
            triggered_at=alert.triggered_at.isoformat(),
            message=alert.message
        ))

        self.logger.info(f"Webhook notification: {payload}")
        # In a real implementation, this would POST to webhook URL

    async def _send_resolution_notifications(self, alert: Alert, channels: List[NotificationChannel]):
        """Send alert resolution notifications."""
        for channel in channels:
            try:
                if channel == NotificationChannel.EMAIL:
                    self.logger.info(f"Alert resolved: {alert.alert_id}")
                elif channel == NotificationChannel.SLACK:
                    self.logger.info(f"Slack: Alert resolved - {alert.metric_name}")
                elif channel == NotificationChannel.WEBHOOK:
                    self.logger.info(f"Webhook: Alert resolved - {alert.alert_id}")
            except Exception as e:
                self.logger.error(f"Error sending resolution notification: {str(e)}")

    async def _handle_health_status_change(self, health_check: HealthCheck,
                                         result: HealthCheckResult,
                                         new_status: HealthStatus):
        """Handle health check status changes."""
        self.logger.info(f"Health check {health_check.check_id} status changed to {new_status.value}")

        # Create alert-like notification for health status changes
        if new_status == HealthStatus.UNHEALTHY:
            alert = Alert(
                alert_id=f"health_{health_check.check_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                rule_id=f"health_{health_check.check_id}",
                metric_name=health_check.name,
                current_value=0,  # Health checks don't have numeric values
                threshold_value=0,
                condition="health_check_failed",
                severity="warning",
                message=result.message,
                triggered_at=result.timestamp
            )
            await self._send_alert_notifications(alert, [NotificationChannel.DASHBOARD])

    async def _start_websocket_server(self):
        """Start WebSocket server for real-time updates."""
        async def handle_websocket(websocket, path):
            self.websocket_clients.add(websocket)
            try:
                await websocket.wait_closed()
            finally:
                self.websocket_clients.discard(websocket)

        # In a real implementation, this would start an actual WebSocket server
        # For now, just simulate the server loop
        while self.running:
            await asyncio.sleep(1)

    async def _broadcast_health_update(self, result: HealthCheckResult):
        """Broadcast health check update to WebSocket clients."""
        if not self.websocket_clients:
            return

        message = {
            "type": "health_update",
            "data": {
                "check_id": result.check_id,
                "status": result.status.value,
                "timestamp": result.timestamp.isoformat(),
                "message": result.message,
                "response_time": result.response_time_ms
            }
        }

        # In a real implementation, this would send to actual WebSocket clients
        self.logger.debug(f"Broadcasting health update: {message}")

    async def _broadcast_alert_update(self, alert: Alert):
        """Broadcast alert update to WebSocket clients."""
        message = {
            "type": "alert_triggered",
            "data": {
                "alert_id": alert.alert_id,
                "metric_name": alert.metric_name,
                "severity": alert.severity,
                "current_value": alert.current_value,
                "threshold_value": alert.threshold_value,
                "triggered_at": alert.triggered_at.isoformat()
            }
        }

        self.logger.debug(f"Broadcasting alert update: {message}")

    async def _broadcast_alert_resolution(self, alert: Alert):
        """Broadcast alert resolution to WebSocket clients."""
        message = {
            "type": "alert_resolved",
            "data": {
                "alert_id": alert.alert_id,
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
            }
        }

        self.logger.debug(f"Broadcasting alert resolution: {message}")

    # Public API methods
    async def add_custom_health_check(self, health_check: HealthCheck):
        """Add a custom health check."""
        self.health_checks[health_check.check_id] = health_check

        if self.running:
            # Start the health check loop
            asyncio.create_task(self._run_health_check_loop(health_check))

    async def add_monitoring_rule(self, rule: MonitoringRule):
        """Add a monitoring rule."""
        self.monitoring_rules[rule.rule_id] = rule

        if self.running and rule.enabled:
            # Start the rule evaluation loop
            asyncio.create_task(self._run_rule_evaluation_loop(rule))

    async def record_metric(self, metric_name: str, value: float,
                          tags: Optional[Dict[str, str]] = None):
        """Record a custom metric value."""
        point = MetricPoint(
            timestamp=datetime.now(),
            value=value,
            tags=tags or {}
        )

        await self.metrics_buffer.add_point(metric_name, point)

    async def get_health_status(self) -> Dict[str, Any]:
        """Get current health status of all checks."""
        status_summary = {
            "overall_status": HealthStatus.HEALTHY.value,
            "checks": {},
            "summary": {
                "total": len(self.health_checks),
                "healthy": 0,
                "warning": 0,
                "unhealthy": 0,
                "unknown": 0
            }
        }

        overall_status = HealthStatus.HEALTHY

        for check_id, check in self.health_checks.items():
            results = list(self.check_results_history.get(check_id, []))
            if results:
                latest = results[-1]
                status_summary["checks"][check_id] = {
                    "name": check.name,
                    "status": latest.status.value,
                    "last_check": latest.timestamp.isoformat(),
                    "message": latest.message,
                    "response_time": latest.response_time_ms
                }

                # Update counters
                if latest.status == HealthStatus.HEALTHY:
                    status_summary["summary"]["healthy"] += 1
                elif latest.status == HealthStatus.WARNING:
                    status_summary["summary"]["warning"] += 1
                    if overall_status == HealthStatus.HEALTHY:
                        overall_status = HealthStatus.WARNING
                elif latest.status == HealthStatus.UNHEALTHY:
                    status_summary["summary"]["unhealthy"] += 1
                    overall_status = HealthStatus.UNHEALTHY
                elif latest.status == HealthStatus.CRITICAL:
                    status_summary["summary"]["unhealthy"] += 1
                    overall_status = HealthStatus.CRITICAL
                else:
                    status_summary["summary"]["unknown"] += 1
            else:
                status_summary["checks"][check_id] = {
                    "name": check.name,
                    "status": HealthStatus.UNKNOWN.value,
                    "last_check": None,
                    "message": "No data available",
                    "response_time": 0
                }
                status_summary["summary"]["unknown"] += 1

        status_summary["overall_status"] = overall_status.value
        return status_summary

    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get all active alerts."""
        return [
            {
                "alert_id": alert.alert_id,
                "rule_id": alert.rule_id,
                "metric_name": alert.metric_name,
                "severity": alert.severity,
                "current_value": alert.current_value,
                "threshold_value": alert.threshold_value,
                "condition": alert.condition,
                "message": alert.message,
                "triggered_at": alert.triggered_at.isoformat(),
                "acknowledged": alert.acknowledged_at is not None,
                "acknowledged_by": alert.acknowledged_by
            }
            for alert in self.active_alerts.values()
        ]

    async def acknowledge_alert(self, alert_id: str, user_id: str) -> bool:
        """Acknowledge an active alert."""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.acknowledged_at = datetime.now()
            alert.acknowledged_by = user_id

            # Broadcast acknowledgment
            await self._broadcast_alert_update(alert)
            return True

        return False

# Example usage and testing
async def main():
    """Test the real-time monitoring system."""
    monitor = RealtimeMonitor()

    # Add some custom metrics
    await monitor.record_metric("application.requests", 150)
    await monitor.record_metric("application.errors", 2)
    await monitor.record_metric("application.response_time", 250)

    # Get health status
    health_status = await monitor.get_health_status()
    print("System Health Status:")
    print(f"Overall: {health_status['overall_status']}")
    print(f"Healthy checks: {health_status['summary']['healthy']}")

    # Get active alerts
    alerts = await monitor.get_active_alerts()
    print(f"\nActive alerts: {len(alerts)}")

    print("Real-time monitoring system initialized successfully!")

if __name__ == "__main__":
    asyncio.run(main())