# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.state_schemas, structlog]
"""
VITAL Path AI Services - Ask Expert Input Processor Node

Common input processing for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Function: ask_expert_process_input_node
- Logs: ask_expert_input_processor_{action}
"""

from typing import Dict, Any
from datetime import datetime
import structlog

from langgraph_workflows.state_schemas import UnifiedWorkflowState, ExecutionStatus

logger = structlog.get_logger()


async def ask_expert_process_input_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Process input for Ask Expert workflows.
    
    Performs:
    - Query validation
    - Input sanitization
    - Query analysis
    
    Used by: Mode 1, 2, 3, 4
    """
    tenant_id = state.get("tenant_id")
    query = state.get("query", "")
    request_id = state.get("request_id", "unknown")
    mode = state.get("mode", "unknown")
    
    logger.info(
        "ask_expert_input_processor_started",
        tenant_id=tenant_id,
        request_id=request_id,
        mode=str(mode),
        query_length=len(query),
    )
    
    try:
        # Validate
        if not query or len(query.strip()) < 2:
            return {
                "status": ExecutionStatus.FAILED,
                "errors": ["Query must be at least 2 characters"],
                "nodes_executed": ["ask_expert_process_input"],
            }
        
        if len(query) > 50000:
            return {
                "status": ExecutionStatus.FAILED,
                "errors": ["Query exceeds maximum length"],
                "nodes_executed": ["ask_expert_process_input"],
            }
        
        # Sanitize
        sanitized_query = " ".join(query.strip().split())
        sanitized_query = sanitized_query.replace("\x00", "")
        
        logger.info(
            "ask_expert_input_processor_completed",
            tenant_id=tenant_id,
            request_id=request_id,
        )
        
        return {
            "query": sanitized_query,
            "query_length": len(sanitized_query),
            "status": ExecutionStatus.IN_PROGRESS,
            "nodes_executed": ["ask_expert_process_input"],
            "updated_at": datetime.utcnow(),
        }
        
    except Exception as e:
        logger.error(
            "ask_expert_input_processor_failed",
            tenant_id=tenant_id,
            request_id=request_id,
            error=str(e),
        )
        return {
            "status": ExecutionStatus.FAILED,
            "errors": [f"Input processing failed: {str(e)}"],
            "nodes_executed": ["ask_expert_process_input"],
        }
