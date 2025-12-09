"""
VITAL Path AI Services - Ask Expert Shared Nodes

Reusable LangGraph nodes for Ask Expert Mode 1-4 workflows.

Naming Convention:
- Functions: ask_expert_{node_name}_node
- Factory functions: create_ask_expert_{node_name}_node

Architecture (AGENT_OS_GOLD_STANDARD v6.0):
- L3-A Context Engineer: Orchestrates L4 Workers and L5 Tools
- L3-B Specialist: Domain expertise, invoked by L3-A
- L4 Workers: Task-specific agents (RAG, citation, grading)
- L5 Tools: Atomic functions (search, parse, validate)
"""

from .input_processor import ask_expert_process_input_node
from .rag_retriever import (
    ask_expert_rag_retriever_node,
    create_ask_expert_rag_node,
)
from .response_formatter import ask_expert_format_response_node
from .error_handler import (
    ask_expert_error_handler_node,
    AskExpertWorkflowError,
    AskExpertErrorType,
)
from .l3_context_engineer import (
    L3ContextEngineerOrchestrator,
    L3OrchestrationType,
    ToolCategory,
    WorkerType,
    classify_query_intent,
    create_l3_context_engineer_node,
)
from .parallel_tools_executor import (
    ParallelToolExecutor,
    QueryIntent,
    ask_expert_parallel_tools_node,
    create_parallel_executor,
)

__all__ = [
    # Input/Output nodes
    "ask_expert_process_input_node",
    "ask_expert_format_response_node",
    # RAG nodes
    "ask_expert_rag_retriever_node",
    "create_ask_expert_rag_node",
    # Error handling
    "ask_expert_error_handler_node",
    "AskExpertWorkflowError",
    "AskExpertErrorType",
    # L3 Context Engineer (NEW)
    "L3ContextEngineerOrchestrator",
    "L3OrchestrationType",
    "ToolCategory",
    "WorkerType",
    "classify_query_intent",
    "create_l3_context_engineer_node",
    # L5 Parallel Tools
    "ParallelToolExecutor",
    "QueryIntent",
    "ask_expert_parallel_tools_node",
    "create_parallel_executor",
]
