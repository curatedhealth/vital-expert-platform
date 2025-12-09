"""
VITAL Path AI Services - Configuration

Initialization and configuration for Sentry, logging, and metrics.

Phase 1 Refactoring: Extracted from monolithic main.py
"""

import os
import structlog
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from prometheus_client import Counter, Histogram, REGISTRY


def initialize_sentry() -> None:
    """Initialize Sentry for error tracking."""
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(),
                StarletteIntegration(),
            ],
            traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
            profiles_sample_rate=0.1,  # 10% for profiling
            environment=os.getenv("RAILWAY_ENVIRONMENT", os.getenv("ENV", "development")),
            before_send=lambda event, hint: None if os.getenv("ENV") == "development" else event,
        )
        print("✅ Sentry initialized for error tracking")
    else:
        print("ℹ️ Sentry DSN not configured - error tracking disabled")


def initialize_logging() -> None:
    """Initialize structured logging with structlog."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()  # JSON for production
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    print("✅ Structured logging configured")


def initialize_metrics():
    """Initialize Prometheus metrics."""
    try:
        request_count = Counter(
            'http_requests_total', 
            'Total HTTP requests', 
            ['method', 'endpoint']
        )
        request_duration = Histogram(
            'http_request_duration_seconds', 
            'HTTP request duration'
        )
        return request_count, request_duration
    except ValueError:
        # Metrics already registered
        logger = structlog.get_logger()
        logger.warning("metrics_already_registered")
        # Find existing collectors
        for collector in list(REGISTRY._collector_to_names.keys()):
            if hasattr(collector, '_name'):
                if collector._name == 'http_requests_total':
                    request_count = collector
                elif collector._name == 'http_request_duration_seconds':
                    request_duration = collector
        return request_count, request_duration


# Singleton for metrics
_metrics = None

def get_metrics():
    """Get Prometheus metrics (singleton)."""
    global _metrics
    if _metrics is None:
        _metrics = initialize_metrics()
    return _metrics
