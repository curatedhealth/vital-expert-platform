# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph, langchain, postgres]
"""
LangGraph Compilation Package
Compiles agent graphs from PostgreSQL into executable LangGraph workflows

Features:
- Agent graph compilation
- Node type compilation (agent, skill, panel, router, tool, human)
- Postgres-backed state persistence
- Deep agent pattern support (Tree-of-Thoughts, ReAct, Constitutional AI)
"""

from .compiler import AgentGraphCompiler, compile_agent_graph
from .state import AgentState, WorkflowState
from .checkpointer import get_postgres_checkpointer

__all__ = [
    'AgentGraphCompiler',
    'compile_agent_graph',
    'AgentState',
    'WorkflowState',
    'get_postgres_checkpointer'
]

__version__ = '1.0.0'

