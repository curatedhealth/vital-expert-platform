# ===================================================================
# Enterprise Monitoring Service - Phase 2 Enhanced
# OpenTelemetry, Prometheus, and comprehensive observability
# ===================================================================

import asyncio
import json
import logging
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from enum import Enum
import uuid
from dataclasses import dataclass, asdict, field
import psutil
import asyncpg
import redis.asyncio as redis
from prometheus_client import (
    Counter, Histogram, Gauge, Summary, CollectorRegistry,
    generate_latest, CONTENT_TYPE_LATEST, start_http_server
)
from opentelemetry import trace, metrics
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
import structlog
from fastapi import FastAPI, Response
from fastapi.responses import PlainTextResponse
import uvicorn

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class MonitoringLevel(Enum):
    """Monitoring alert levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class MetricType(Enum):
    """Types of metrics"""
    COUNTER = "counter"
    HISTOGRAM = "histogram"
    GAUGE = "gauge"
    SUMMARY = "summary"

class HealthStatus(Enum):
    """Health check statuses"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class AlertRule:
    """Alert rule definition"""
    rule_id: str
    name: str
    metric_name: str
    condition: str  # e.g., "> 0.8", "< 0.1"
    threshold: float
    duration: timedelta
    level: MonitoringLevel
    description: str
    enabled: bool = True
    last_triggered: Optional[datetime] = None
    trigger_count: int = 0

@dataclass
class Alert:
    """Monitoring alert"""
    alert_id: str
    rule_id: str
    metric_name: str
    current_value: float
    threshold: float
    level: MonitoringLevel
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    acknowledged: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class HealthCheckResult:
    """Health check result"""
    service_name: str
    status: HealthStatus
    response_time: float
    message: str
    details: Dict[str, Any]
    checked_at: datetime = datetime.utcnow()

@dataclass
class PerformanceMetrics:
    """System performance metrics"""
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, float]
    open_connections: int
    request_rate: float
    error_rate: float
    response_time_p95: float
    timestamp: datetime = datetime.utcnow()

class PrometheusMetrics:
    """Prometheus metrics registry"""

    def __init__(self, registry: Optional[CollectorRegistry] = None):
        self.registry = registry or CollectorRegistry()
        self._initialize_metrics()

    def _initialize_metrics(self):
        """Initialize Prometheus metrics"""
        # Request metrics
        self.http_requests_total = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status_code'],
            registry=self.registry
        )

        self.http_request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint'],
            registry=self.registry
        )

        # Database metrics
        self.db_connections_active = Gauge(
            'db_connections_active',
            'Active database connections',
            registry=self.registry
        )

        self.db_query_duration = Histogram(
            'db_query_duration_seconds',
            'Database query duration',
            ['query_type', 'table'],
            registry=self.registry
        )

        # Business metrics
        self.orchestration_requests = Counter(
            'orchestration_requests_total',
            'Total orchestration requests',
            ['stage', 'status'],
            registry=self.registry
        )

        self.clinical_validations = Counter(
            'clinical_validations_total',
            'Total clinical validations',
            ['validation_type', 'result'],
            registry=self.registry
        )

        self.vital_framework_stages = Histogram(
            'vital_framework_stage_duration_seconds',
            'VITAL framework stage duration',
            ['stage'],
            registry=self.registry
        )

        self.collaboration_sessions = Gauge(
            'collaboration_sessions_active',
            'Active collaboration sessions',
            registry=self.registry
        )

        # System metrics
        self.system_cpu_usage = Gauge(
            'system_cpu_usage_percent',
            'System CPU usage',
            registry=self.registry
        )

        self.system_memory_usage = Gauge(
            'system_memory_usage_percent',
            'System memory usage',
            registry=self.registry
        )

        self.system_disk_usage = Gauge(
            'system_disk_usage_percent',
            'System disk usage',
            ['mount_point'],
            registry=self.registry
        )

        # Error metrics
        self.errors_total = Counter(
            'errors_total',
            'Total errors',
            ['service', 'error_type', 'severity'],
            registry=self.registry
        )

        self.alerts_total = Counter(
            'alerts_total',
            'Total alerts triggered',
            ['level', 'rule_name'],
            registry=self.registry
        )

class OpenTelemetrySetup:
    """OpenTelemetry configuration and setup"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tracer = None
        self.meter = None

    def initialize(self):
        """Initialize OpenTelemetry"""
        # Setup tracing
        trace.set_tracer_provider(TracerProvider())
        self.tracer = trace.get_tracer(__name__)

        # Setup Jaeger exporter
        jaeger_config = self.config.get('jaeger', {})
        if jaeger_config.get('enabled', False):
            jaeger_exporter = JaegerExporter(
                agent_host_name=jaeger_config.get('host', 'localhost'),
                agent_port=jaeger_config.get('port', 14268),
            )
            span_processor = BatchSpanProcessor(jaeger_exporter)
            trace.get_tracer_provider().add_span_processor(span_processor)

        # Setup metrics with Prometheus reader
        prometheus_reader = PrometheusMetricReader()
        metrics.set_meter_provider(MeterProvider(metric_readers=[prometheus_reader]))
        self.meter = metrics.get_meter(__name__)

        # Auto-instrument libraries
        RequestsInstrumentor().instrument()
        Psycopg2Instrumentor().instrument()
        RedisInstrumentor().instrument()

        logger.info("OpenTelemetry initialized successfully")

    def get_tracer(self):
        """Get tracer instance"""
        return self.tracer

    def get_meter(self):
        """Get meter instance"""
        return self.meter

class HealthChecker:
    """Health checking service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.checks: Dict[str, Callable] = {}
        self.results: Dict[str, HealthCheckResult] = {}
        self.check_interval = config.get('check_interval', 30)  # seconds

    def register_check(self, name: str, check_func: Callable):
        """Register health check function"""
        self.checks[name] = check_func
        logger.info(f"Registered health check: {name}")

    async def run_all_checks(self) -> Dict[str, HealthCheckResult]:
        """Run all registered health checks"""
        results = {}

        for name, check_func in self.checks.items():
            try:
                start_time = time.time()
                result = await self._run_check(check_func)
                response_time = time.time() - start_time

                health_result = HealthCheckResult(
                    service_name=name,
                    status=result.get('status', HealthStatus.UNKNOWN),
                    response_time=response_time,
                    message=result.get('message', ''),
                    details=result.get('details', {})
                )

                results[name] = health_result
                self.results[name] = health_result

            except Exception as e:
                health_result = HealthCheckResult(
                    service_name=name,
                    status=HealthStatus.UNHEALTHY,
                    response_time=0.0,
                    message=f"Health check failed: {str(e)}",
                    details={'error': str(e)}
                )
                results[name] = health_result
                self.results[name] = health_result

        return results

    async def _run_check(self, check_func: Callable) -> Dict[str, Any]:
        """Run individual health check"""
        if asyncio.iscoroutinefunction(check_func):
            return await check_func()
        else:
            return check_func()

    def get_overall_health(self) -> HealthStatus:
        """Get overall system health status"""
        if not self.results:
            return HealthStatus.UNKNOWN

        statuses = [result.status for result in self.results.values()]

        if HealthStatus.UNHEALTHY in statuses:
            return HealthStatus.UNHEALTHY
        elif HealthStatus.DEGRADED in statuses:
            return HealthStatus.DEGRADED
        elif all(status == HealthStatus.HEALTHY for status in statuses):
            return HealthStatus.HEALTHY
        else:
            return HealthStatus.UNKNOWN

class AlertManager:
    """Alert management and notification system"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.rules: Dict[str, AlertRule] = {}
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.notification_handlers: List[Callable] = []

    def add_rule(self, rule: AlertRule):
        """Add alert rule"""
        self.rules[rule.rule_id] = rule
        logger.info(f"Added alert rule: {rule.name}")

    def remove_rule(self, rule_id: str):
        """Remove alert rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
            logger.info(f"Removed alert rule: {rule_id}")

    def register_notification_handler(self, handler: Callable):
        """Register notification handler"""
        self.notification_handlers.append(handler)

    async def evaluate_metrics(self, metrics: Dict[str, float]):
        """Evaluate metrics against alert rules"""
        for rule in self.rules.values():
            if not rule.enabled:
                continue

            metric_value = metrics.get(rule.metric_name)
            if metric_value is None:
                continue

            should_alert = self._evaluate_condition(
                metric_value, rule.condition, rule.threshold
            )

            if should_alert:
                await self._trigger_alert(rule, metric_value)
            else:
                await self._resolve_alert(rule.rule_id)

    def _evaluate_condition(self, value: float, condition: str, threshold: float) -> bool:
        """Evaluate alert condition"""
        try:
            if condition == '>':
                return value > threshold
            elif condition == '<':
                return value < threshold
            elif condition == '>=':
                return value >= threshold
            elif condition == '<=':
                return value <= threshold
            elif condition == '==':
                return value == threshold
            elif condition == '!=':
                return value != threshold
            else:
                # Support complex conditions like "> 0.8 for 5 minutes"
                return eval(f"{value} {condition} {threshold}")
        except Exception as e:
            logger.error(f"Error evaluating condition '{condition}': {e}")
            return False

    async def _trigger_alert(self, rule: AlertRule, current_value: float):
        """Trigger alert"""
        alert_id = f"{rule.rule_id}_{int(time.time())}"

        # Check if alert already exists for this rule
        existing_alert = None
        for alert in self.active_alerts.values():
            if alert.rule_id == rule.rule_id and not alert.resolved_at:
                existing_alert = alert
                break

        if existing_alert:
            # Update existing alert
            existing_alert.current_value = current_value
            return

        # Create new alert
        alert = Alert(
            alert_id=alert_id,
            rule_id=rule.rule_id,
            metric_name=rule.metric_name,
            current_value=current_value,
            threshold=rule.threshold,
            level=rule.level,
            message=f"{rule.name}: {rule.metric_name} is {current_value:.2f} (threshold: {rule.threshold:.2f})",
            triggered_at=datetime.utcnow()
        )

        self.active_alerts[alert_id] = alert
        self.alert_history.append(alert)

        # Update rule statistics
        rule.last_triggered = datetime.utcnow()
        rule.trigger_count += 1

        # Send notifications
        await self._send_notifications(alert)

        logger.warning(f"Alert triggered: {alert.message}")

    async def _resolve_alert(self, rule_id: str):
        """Resolve alert"""
        for alert_id, alert in list(self.active_alerts.items()):
            if alert.rule_id == rule_id and not alert.resolved_at:
                alert.resolved_at = datetime.utcnow()
                del self.active_alerts[alert_id]
                logger.info(f"Alert resolved: {alert.message}")

    async def _send_notifications(self, alert: Alert):
        """Send alert notifications"""
        for handler in self.notification_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(alert)
                else:
                    handler(alert)
            except Exception as e:
                logger.error(f"Notification handler error: {e}")

class SystemMonitor:
    """System performance monitoring"""

    def __init__(self):
        self.process = psutil.Process()

    def get_performance_metrics(self) -> PerformanceMetrics:
        """Get current system performance metrics"""
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)

        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent

        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent

        # Network I/O
        network_io = psutil.net_io_counters()
        network_stats = {
            'bytes_sent': network_io.bytes_sent,
            'bytes_recv': network_io.bytes_recv,
            'packets_sent': network_io.packets_sent,
            'packets_recv': network_io.packets_recv
        }

        # Process-specific metrics
        try:
            process_connections = len(self.process.connections())
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            process_connections = 0

        return PerformanceMetrics(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            network_io=network_stats,
            open_connections=process_connections,
            request_rate=0.0,  # Would be calculated from request metrics
            error_rate=0.0,    # Would be calculated from error metrics
            response_time_p95=0.0  # Would be calculated from response time metrics
        )

class EnterpriseMonitoringService:
    """Main enterprise monitoring service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.prometheus_metrics = PrometheusMetrics()
        self.otel_setup = OpenTelemetrySetup(config.get('opentelemetry', {}))
        self.health_checker = HealthChecker(config.get('health_checks', {}))
        self.alert_manager = AlertManager(config.get('alerts', {}))
        self.system_monitor = SystemMonitor()
        self.redis_client = None
        self.postgres_pool = None
        self.monitoring_tasks: List[asyncio.Task] = []
        self.metrics_server_task = None

    async def initialize(self):
        """Initialize monitoring service"""
        # Initialize OpenTelemetry
        self.otel_setup.initialize()

        # Initialize Redis
        redis_config = self.config.get('redis', {})
        self.redis_client = redis.Redis(
            host=redis_config.get('host', 'localhost'),
            port=redis_config.get('port', 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL
        postgres_url = self.config.get('postgres_url')
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Register default health checks
        await self._register_default_health_checks()

        # Setup default alert rules
        self._setup_default_alert_rules()

        # Setup notification handlers
        self._setup_notification_handlers()

        # Start monitoring tasks
        await self._start_monitoring_tasks()

        # Start metrics server
        await self._start_metrics_server()

        logger.info("Enterprise Monitoring Service initialized")

    async def _register_default_health_checks(self):
        """Register default health checks"""

        # Database health check
        async def db_health_check():
            if not self.postgres_pool:
                return {'status': HealthStatus.UNKNOWN, 'message': 'Database not configured'}

            try:
                async with self.postgres_pool.acquire() as conn:
                    await conn.execute('SELECT 1')
                return {'status': HealthStatus.HEALTHY, 'message': 'Database connection OK'}
            except Exception as e:
                return {
                    'status': HealthStatus.UNHEALTHY,
                    'message': f'Database connection failed: {str(e)}'
                }

        # Redis health check
        async def redis_health_check():
            try:
                await self.redis_client.ping()
                return {'status': HealthStatus.HEALTHY, 'message': 'Redis connection OK'}
            except Exception as e:
                return {
                    'status': HealthStatus.UNHEALTHY,
                    'message': f'Redis connection failed: {str(e)}'
                }

        # System health check
        def system_health_check():
            metrics = self.system_monitor.get_performance_metrics()

            status = HealthStatus.HEALTHY
            messages = []

            if metrics.cpu_usage > 90:
                status = HealthStatus.DEGRADED
                messages.append(f'High CPU usage: {metrics.cpu_usage:.1f}%')

            if metrics.memory_usage > 90:
                status = HealthStatus.DEGRADED
                messages.append(f'High memory usage: {metrics.memory_usage:.1f}%')

            if metrics.disk_usage > 90:
                status = HealthStatus.DEGRADED
                messages.append(f'High disk usage: {metrics.disk_usage:.1f}%')

            message = '; '.join(messages) if messages else 'System performance OK'

            return {
                'status': status,
                'message': message,
                'details': asdict(metrics)
            }

        # Register health checks
        self.health_checker.register_check('database', db_health_check)
        self.health_checker.register_check('redis', redis_health_check)
        self.health_checker.register_check('system', system_health_check)

    def _setup_default_alert_rules(self):
        """Setup default alert rules"""

        # High CPU usage alert
        cpu_alert = AlertRule(
            rule_id='high_cpu_usage',
            name='High CPU Usage',
            metric_name='cpu_usage_percent',
            condition='>',
            threshold=80.0,
            duration=timedelta(minutes=5),
            level=MonitoringLevel.HIGH,
            description='CPU usage is consistently high'
        )
        self.alert_manager.add_rule(cpu_alert)

        # High memory usage alert
        memory_alert = AlertRule(
            rule_id='high_memory_usage',
            name='High Memory Usage',
            metric_name='memory_usage_percent',
            condition='>',
            threshold=85.0,
            duration=timedelta(minutes=5),
            level=MonitoringLevel.HIGH,
            description='Memory usage is consistently high'
        )
        self.alert_manager.add_rule(memory_alert)

        # High error rate alert
        error_rate_alert = AlertRule(
            rule_id='high_error_rate',
            name='High Error Rate',
            metric_name='error_rate_percent',
            condition='>',
            threshold=5.0,
            duration=timedelta(minutes=2),
            level=MonitoringLevel.CRITICAL,
            description='Error rate is too high'
        )
        self.alert_manager.add_rule(error_rate_alert)

        # Database connection issues
        db_alert = AlertRule(
            rule_id='database_connections',
            name='Database Connection Issues',
            metric_name='db_connections_active',
            condition='>',
            threshold=80.0,
            duration=timedelta(minutes=1),
            level=MonitoringLevel.MEDIUM,
            description='High number of database connections'
        )
        self.alert_manager.add_rule(db_alert)

    def _setup_notification_handlers(self):
        """Setup notification handlers"""

        async def log_notification_handler(alert: Alert):
            """Log alert notification"""
            logger.error(
                "Alert triggered",
                alert_id=alert.alert_id,
                rule_id=alert.rule_id,
                metric=alert.metric_name,
                value=alert.current_value,
                threshold=alert.threshold,
                level=alert.level.value,
                message=alert.message
            )

        # Register notification handlers
        self.alert_manager.register_notification_handler(log_notification_handler)

    async def _start_monitoring_tasks(self):
        """Start background monitoring tasks"""

        # System metrics collection task
        async def collect_system_metrics():
            while True:
                try:
                    metrics = self.system_monitor.get_performance_metrics()

                    # Update Prometheus metrics
                    self.prometheus_metrics.system_cpu_usage.set(metrics.cpu_usage)
                    self.prometheus_metrics.system_memory_usage.set(metrics.memory_usage)
                    self.prometheus_metrics.system_disk_usage.labels(mount_point='/').set(metrics.disk_usage)

                    # Store metrics for alert evaluation
                    metric_values = {
                        'cpu_usage_percent': metrics.cpu_usage,
                        'memory_usage_percent': metrics.memory_usage,
                        'disk_usage_percent': metrics.disk_usage
                    }

                    # Evaluate alerts
                    await self.alert_manager.evaluate_metrics(metric_values)

                    await asyncio.sleep(self.config.get('metrics_interval', 10))

                except Exception as e:
                    logger.error(f"System metrics collection error: {e}")
                    await asyncio.sleep(5)

        # Health check task
        async def run_health_checks():
            while True:
                try:
                    await self.health_checker.run_all_checks()
                    await asyncio.sleep(self.health_checker.check_interval)
                except Exception as e:
                    logger.error(f"Health check error: {e}")
                    await asyncio.sleep(10)

        # Start tasks
        self.monitoring_tasks.append(asyncio.create_task(collect_system_metrics()))
        self.monitoring_tasks.append(asyncio.create_task(run_health_checks()))

    async def _start_metrics_server(self):
        """Start Prometheus metrics server"""
        try:
            # Create FastAPI app for metrics endpoint
            app = FastAPI(title="VITAL Path Monitoring")

            @app.get("/metrics")
            async def metrics():
                """Prometheus metrics endpoint"""
                return PlainTextResponse(
                    generate_latest(self.prometheus_metrics.registry),
                    media_type=CONTENT_TYPE_LATEST
                )

            @app.get("/health")
            async def health():
                """Health check endpoint"""
                results = await self.health_checker.run_all_checks()
                overall_status = self.health_checker.get_overall_health()

                return {
                    'status': overall_status.value,
                    'timestamp': datetime.utcnow().isoformat(),
                    'checks': {
                        name: {
                            'status': result.status.value,
                            'response_time': result.response_time,
                            'message': result.message
                        }
                        for name, result in results.items()
                    }
                }

            @app.get("/alerts")
            async def get_alerts():
                """Get active alerts"""
                return {
                    'active_alerts': [asdict(alert) for alert in self.alert_manager.active_alerts.values()],
                    'alert_count': len(self.alert_manager.active_alerts)
                }

            # Start server
            metrics_port = self.config.get('metrics_port', 8090)

            config = uvicorn.Config(
                app,
                host="0.0.0.0",
                port=metrics_port,
                log_level="info"
            )
            server = uvicorn.Server(config)
            self.metrics_server_task = asyncio.create_task(server.serve())

            logger.info(f"Metrics server started on port {metrics_port}")

        except Exception as e:
            logger.error(f"Failed to start metrics server: {e}")

    def record_orchestration_request(self, stage: str, status: str):
        """Record orchestration request metric"""
        self.prometheus_metrics.orchestration_requests.labels(stage=stage, status=status).inc()

    def record_clinical_validation(self, validation_type: str, result: str):
        """Record clinical validation metric"""
        self.prometheus_metrics.clinical_validations.labels(
            validation_type=validation_type, result=result
        ).inc()

    def record_vital_stage_duration(self, stage: str, duration: float):
        """Record VITAL framework stage duration"""
        self.prometheus_metrics.vital_framework_stages.labels(stage=stage).observe(duration)

    def record_http_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Record HTTP request metrics"""
        self.prometheus_metrics.http_requests_total.labels(
            method=method, endpoint=endpoint, status_code=str(status_code)
        ).inc()

        self.prometheus_metrics.http_request_duration.labels(
            method=method, endpoint=endpoint
        ).observe(duration)

    def record_database_query(self, query_type: str, table: str, duration: float):
        """Record database query metrics"""
        self.prometheus_metrics.db_query_duration.labels(
            query_type=query_type, table=table
        ).observe(duration)

    def record_error(self, service: str, error_type: str, severity: str):
        """Record error metric"""
        self.prometheus_metrics.errors_total.labels(
            service=service, error_type=error_type, severity=severity
        ).inc()

    def set_active_collaboration_sessions(self, count: int):
        """Set active collaboration sessions count"""
        self.prometheus_metrics.collaboration_sessions.set(count)

    def set_database_connections(self, count: int):
        """Set active database connections count"""
        self.prometheus_metrics.db_connections_active.set(count)

    async def get_metrics_summary(self) -> Dict[str, Any]:
        """Get comprehensive metrics summary"""
        # Get system metrics
        system_metrics = self.system_monitor.get_performance_metrics()

        # Get health status
        overall_health = self.health_checker.get_overall_health()
        health_results = await self.health_checker.run_all_checks()

        # Get active alerts
        active_alerts = list(self.alert_manager.active_alerts.values())

        return {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_health': overall_health.value,
            'system_metrics': asdict(system_metrics),
            'health_checks': {
                name: {
                    'status': result.status.value,
                    'response_time': result.response_time,
                    'message': result.message
                }
                for name, result in health_results.items()
            },
            'active_alerts': len(active_alerts),
            'alert_summary': {
                'critical': len([a for a in active_alerts if a.level == MonitoringLevel.CRITICAL]),
                'high': len([a for a in active_alerts if a.level == MonitoringLevel.HIGH]),
                'medium': len([a for a in active_alerts if a.level == MonitoringLevel.MEDIUM]),
                'low': len([a for a in active_alerts if a.level == MonitoringLevel.LOW])
            }
        }

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Enterprise Monitoring Service")

        # Cancel monitoring tasks
        for task in self.monitoring_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        # Stop metrics server
        if self.metrics_server_task:
            self.metrics_server_task.cancel()
            try:
                await self.metrics_server_task
            except asyncio.CancelledError:
                pass

        # Close connections
        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Enterprise Monitoring Service shutdown complete")

# Factory function
async def create_monitoring_service(config: Dict[str, Any]) -> EnterpriseMonitoringService:
    """Create and initialize Enterprise Monitoring Service"""
    service = EnterpriseMonitoringService(config)
    await service.initialize()
    return service

# Context manager for request timing
class RequestTimer:
    """Context manager for timing requests"""

    def __init__(self, monitoring_service: EnterpriseMonitoringService,
                 method: str, endpoint: str):
        self.monitoring_service = monitoring_service
        self.method = method
        self.endpoint = endpoint
        self.start_time = None
        self.status_code = 200

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.status_code = 500

        duration = time.time() - self.start_time if self.start_time else 0
        self.monitoring_service.record_http_request(
            self.method, self.endpoint, self.status_code, duration
        )

    def set_status_code(self, status_code: int):
        """Set response status code"""
        self.status_code = status_code