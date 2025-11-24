"""
Hierarchical Agent Execution Engine

Built on LangChain Deep Agents library for production-ready hierarchical agent orchestration.

Features:
- Planning & task decomposition (write_todos tool)
- Context management (file system tools)
- Subagent spawning (task tool)
- Long-term memory (LangGraph Store)
- Middleware architecture (composable)

Universal engine for parent-child agent delegation across all VITAL services:
- Ask Expert (all 4 modes)
- Ask Panel (each panel member)
- Workflows (each task agent)
- Solution Builder (all composed agents)

Based on:
- deepagents library: https://pypi.org/project/deepagents/
- LangGraph: State management and execution
- LangChain: Tools and model integrations
"""

from .delegation_engine import DelegationEngine, should_use_deep_agent
from .deep_agent_factory import DeepAgentFactory, create_vital_deep_agent
from .subagent_middleware import VITALSubAgentMiddleware
from .memory_backend import create_vital_backend

__all__ = [
    "DelegationEngine",
    "should_use_deep_agent",
    "DeepAgentFactory",
    "create_vital_deep_agent",
    "VITALSubAgentMiddleware",
    "create_vital_backend",
]
