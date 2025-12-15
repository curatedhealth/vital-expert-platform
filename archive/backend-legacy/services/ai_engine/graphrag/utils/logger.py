"""
Structured logging utilities for GraphRAG service.
Provides correlation ID tracking, structured JSON logging, and performance tracking.
"""

import logging
import json
import sys
import time
from typing import Any, Dict, Optional
from datetime import datetime
from contextvars import ContextVar
from functools import wraps
from uuid import UUID, uuid4

# Context variable for correlation ID propagation
correlation_id_var: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)


class CorrelationIdFilter(logging.Filter):
    """Adds correlation ID to all log records."""
    
    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = correlation_id_var.get() or "no-correlation-id"
        return True


class JSONFormatter(logging.Formatter):
    """Formats log records as JSON with structured fields."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "correlation_id": getattr(record, 'correlation_id', 'no-correlation-id'),
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add any extra fields
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'created', 'filename', 'funcName', 
                          'levelname', 'levelno', 'lineno', 'module', 'msecs', 
                          'message', 'pathname', 'process', 'processName', 'relativeCreated',
                          'thread', 'threadName', 'exc_info', 'exc_text', 'stack_info',
                          'correlation_id']:
                # Convert UUID to string
                if isinstance(value, UUID):
                    value = str(value)
                log_data[key] = value
        
        return json.dumps(log_data)


class TextFormatter(logging.Formatter):
    """Formats log records as human-readable text."""
    
    def format(self, record: logging.LogRecord) -> str:
        correlation_id = getattr(record, 'correlation_id', 'no-correlation-id')
        base = super().format(record)
        return f"[{correlation_id[:8]}] {base}"


def get_logger(name: str, log_format: str = "json", log_level: str = "INFO") -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (usually __name__)
        log_format: "json" or "text"
        log_level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level.upper()))
    
    # Add correlation ID filter
    handler.addFilter(CorrelationIdFilter())
    
    # Set formatter
    if log_format.lower() == "json":
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger


def set_correlation_id(correlation_id: Optional[str] = None) -> str:
    """
    Set correlation ID for current context.
    
    Args:
        correlation_id: Optional correlation ID, will generate one if not provided
    
    Returns:
        The correlation ID that was set
    """
    if correlation_id is None:
        correlation_id = str(uuid4())
    correlation_id_var.set(correlation_id)
    return correlation_id


def get_correlation_id() -> Optional[str]:
    """Get current correlation ID from context."""
    return correlation_id_var.get()


def clear_correlation_id():
    """Clear correlation ID from context."""
    correlation_id_var.set(None)


def log_execution_time(logger: logging.Logger, operation: str):
    """
    Decorator to log execution time of a function.
    
    Args:
        logger: Logger instance to use
        operation: Name of the operation being timed
    
    Example:
        @log_execution_time(logger, "vector_search")
        async def search_vectors(query):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                elapsed_ms = int((time.time() - start_time) * 1000)
                logger.info(
                    f"{operation} completed",
                    extra={
                        "operation": operation,
                        "duration_ms": elapsed_ms,
                        "success": True
                    }
                )
                return result
            except Exception as e:
                elapsed_ms = int((time.time() - start_time) * 1000)
                logger.error(
                    f"{operation} failed",
                    extra={
                        "operation": operation,
                        "duration_ms": elapsed_ms,
                        "success": False,
                        "error": str(e)
                    },
                    exc_info=True
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                elapsed_ms = int((time.time() - start_time) * 1000)
                logger.info(
                    f"{operation} completed",
                    extra={
                        "operation": operation,
                        "duration_ms": elapsed_ms,
                        "success": True
                    }
                )
                return result
            except Exception as e:
                elapsed_ms = int((time.time() - start_time) * 1000)
                logger.error(
                    f"{operation} failed",
                    extra={
                        "operation": operation,
                        "duration_ms": elapsed_ms,
                        "success": False,
                        "error": str(e)
                    },
                    exc_info=True
                )
                raise
        
        # Return async or sync wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


class LogContext:
    """
    Context manager for adding extra fields to all logs within a block.
    
    Example:
        with LogContext(logger, agent_id="123", session_id="456"):
            logger.info("Processing request")
            # Log will include agent_id and session_id
    """
    
    def __init__(self, logger: logging.Logger, **extra_fields):
        self.logger = logger
        self.extra_fields = extra_fields
        self.old_factory = None
    
    def __enter__(self):
        old_factory = logging.getLogRecordFactory()
        
        def record_factory(*args, **kwargs):
            record = old_factory(*args, **kwargs)
            for key, value in self.extra_fields.items():
                setattr(record, key, value)
            return record
        
        logging.setLogRecordFactory(record_factory)
        self.old_factory = old_factory
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.old_factory:
            logging.setLogRecordFactory(self.old_factory)


# Create module-level logger
logger = get_logger(__name__)


# Example usage
if __name__ == "__main__":
    # Test structured logging
    test_logger = get_logger("test", log_format="json")
    
    set_correlation_id("test-correlation-123")
    
    test_logger.info("Test message", extra={"user_id": "456", "action": "search"})
    
    with LogContext(test_logger, agent_id="agent-789"):
        test_logger.info("Inside context")
    
    test_logger.info("Outside context")
    
    clear_correlation_id()

