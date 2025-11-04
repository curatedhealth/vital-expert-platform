"""
Monitoring and Metrics Setup for VITAL Path AI Services
"""

import os
import logging
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import structlog

logger = structlog.get_logger()

# Define metrics
REQUEST_COUNT = Counter(
    'vital_ai_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'vital_ai_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_AGENTS = Gauge(
    'vital_ai_active_agents',
    'Number of active agents'
)

RAG_QUERIES = Counter(
    'vital_ai_rag_queries_total',
    'Total RAG queries',
    ['agent_id', 'status']
)

RAG_QUERY_DURATION = Histogram(
    'vital_ai_rag_query_duration_seconds',
    'RAG query duration in seconds',
    ['agent_id']
)

AGENT_RESPONSES = Counter(
    'vital_ai_agent_responses_total',
    'Total agent responses',
    ['agent_id', 'status']
)

AGENT_RESPONSE_DURATION = Histogram(
    'vital_ai_agent_response_duration_seconds',
    'Agent response duration in seconds',
    ['agent_id']
)

DATABASE_CONNECTIONS = Gauge(
    'vital_ai_database_connections',
    'Number of active database connections'
)

VECTOR_SEARCHES = Counter(
    'vital_ai_vector_searches_total',
    'Total vector searches',
    ['status']
)

VECTOR_SEARCH_DURATION = Histogram(
    'vital_ai_vector_search_duration_seconds',
    'Vector search duration in seconds'
)

def setup_monitoring():
    """Setup monitoring and metrics collection"""
    try:
        # Start Prometheus metrics server
        prometheus_port = int(os.getenv('PROMETHEUS_PORT', 9090))
        start_http_server(prometheus_port)
        
        logger.info(f"✅ Monitoring setup complete - Prometheus metrics on port {prometheus_port}")
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        logger.info("✅ Logging configuration complete")
        
    except Exception as e:
        logger.error(f"❌ Failed to setup monitoring: {e}")
        raise

def record_request(method: str, endpoint: str, duration: float, status: str = "success"):
    """Record request metrics"""
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)

def record_rag_query(agent_id: str, duration: float, status: str = "success"):
    """Record RAG query metrics"""
    RAG_QUERIES.labels(agent_id=agent_id, status=status).inc()
    RAG_QUERY_DURATION.labels(agent_id=agent_id).observe(duration)

def record_agent_response(agent_id: str, duration: float, status: str = "success"):
    """Record agent response metrics"""
    AGENT_RESPONSES.labels(agent_id=agent_id, status=status).inc()
    AGENT_RESPONSE_DURATION.labels(agent_id=agent_id).observe(duration)

def record_vector_search(duration: float, status: str = "success"):
    """Record vector search metrics"""
    VECTOR_SEARCHES.labels(status=status).inc()
    VECTOR_SEARCH_DURATION.observe(duration)

def set_active_agents(count: int):
    """Set active agents count"""
    ACTIVE_AGENTS.set(count)

def set_database_connections(count: int):
    """Set database connections count"""
    DATABASE_CONNECTIONS.set(count)
