"""
VITAL Path - Structured Logging Configuration

Provides structured logging with:
- JSON output for production
- Pretty printing for development
- Correlation ID tracking
- Organization/user context
- Performance timing
"""

import logging
import sys
import os
from typing import Optional, Any, Dict
from datetime import datetime
from functools import wraps
import time
import structlog
from contextvars import ContextVar

# Context variables for request tracing
_correlation_id: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)
_request_id: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_correlation_id() -> Optional[str]:
    """Get current correlation ID."""
    return _correlation_id.get()


def set_correlation_id(correlation_id: str) -> None:
    """Set correlation ID for current context."""
    _correlation_id.set(correlation_id)


def get_request_id() -> Optional[str]:
    """Get current request ID."""
    return _request_id.get()


def set_request_id(request_id: str) -> None:
    """Set request ID for current context."""
    _request_id.set(request_id)


def add_context_processor(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """Add context from contextvars to log events."""
    from core.context import get_organization_id, get_user_id
    
    # Add correlation/request IDs
    if correlation_id := get_correlation_id():
        event_dict["correlation_id"] = correlation_id
    if request_id := get_request_id():
        event_dict["request_id"] = request_id
    
    # Add organization/user context
    if org_id := get_organization_id():
        event_dict["organization_id"] = org_id[:8] if len(org_id) > 8 else org_id
    if user_id := get_user_id():
        event_dict["user_id"] = user_id[:8] if len(user_id) > 8 else user_id
    
    return event_dict


def add_timestamp_processor(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """Add ISO timestamp to log events."""
    event_dict["timestamp"] = datetime.utcnow().isoformat() + "Z"
    return event_dict


def add_service_info_processor(
    logger: logging.Logger,
    method_name: str,
    event_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """Add service metadata to log events."""
    event_dict["service"] = "vital-ai-engine"
    event_dict["version"] = os.getenv("APP_VERSION", "3.7")
    event_dict["environment"] = os.getenv("ENVIRONMENT", "development")
    return event_dict


def configure_logging(
    level: str = None,
    json_output: bool = None,
    log_file: str = None,
) -> None:
    """
    Configure structured logging for the application.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_output: Use JSON format (default: True in production)
        log_file: Optional file path for log output
    """
    # Determine settings from environment
    level = level or os.getenv("LOG_LEVEL", "INFO")
    environment = os.getenv("ENVIRONMENT", "development")
    
    if json_output is None:
        json_output = environment in ("production", "staging")
    
    # Configure structlog processors
    shared_processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        add_timestamp_processor,
        add_service_info_processor,
        add_context_processor,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]
    
    if json_output:
        # JSON output for production
        processors = shared_processors + [
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Pretty output for development
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper()),
    )
    
    # Configure file output if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        logging.getLogger().addHandler(file_handler)
    
    # Suppress noisy loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)


def get_logger(name: str = None) -> structlog.BoundLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name (defaults to calling module)
    
    Returns:
        Bound structlog logger
    """
    return structlog.get_logger(name)


def log_execution_time(operation: str = None):
    """
    Decorator to log function execution time.
    
    Usage:
        @log_execution_time("fetch_agents")
        async def fetch_agents():
            ...
    """
    def decorator(func):
        op_name = operation or func.__name__
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start = time.perf_counter()
            
            try:
                result = await func(*args, **kwargs)
                duration = time.perf_counter() - start
                
                logger.info(
                    f"{op_name}_completed",
                    operation=op_name,
                    duration_ms=round(duration * 1000, 2),
                    success=True,
                )
                return result
                
            except Exception as e:
                duration = time.perf_counter() - start
                logger.error(
                    f"{op_name}_failed",
                    operation=op_name,
                    duration_ms=round(duration * 1000, 2),
                    success=False,
                    error=str(e),
                    error_type=type(e).__name__,
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start = time.perf_counter()
            
            try:
                result = func(*args, **kwargs)
                duration = time.perf_counter() - start
                
                logger.info(
                    f"{op_name}_completed",
                    operation=op_name,
                    duration_ms=round(duration * 1000, 2),
                    success=True,
                )
                return result
                
            except Exception as e:
                duration = time.perf_counter() - start
                logger.error(
                    f"{op_name}_failed",
                    operation=op_name,
                    duration_ms=round(duration * 1000, 2),
                    success=False,
                    error=str(e),
                    error_type=type(e).__name__,
                )
                raise
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


class LogContext:
    """
    Context manager for adding temporary log context.
    
    Usage:
        with LogContext(workflow_id="abc123", step="validation"):
            logger.info("Processing...")
    """
    
    def __init__(self, **context):
        self.context = context
        self.token = None
    
    def __enter__(self):
        self.token = structlog.contextvars.bind_contextvars(**self.context)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.token:
            structlog.contextvars.unbind_contextvars(*self.context.keys())


# Initialize logging on module import
configure_logging()


__all__ = [
    "configure_logging",
    "get_logger",
    "log_execution_time",
    "LogContext",
    "get_correlation_id",
    "set_correlation_id",
    "get_request_id",
    "set_request_id",
]






