"""
VITAL Workflow Modes

All 4 modes inherit from BaseWorkflow for maximum code reuse.

Mode Comparison:
----------------
| Mode | RAG | Tools | Confirmations | Conversation | Use Case |
|------|-----|-------|---------------|--------------|----------|
| 1    | ✓   | ✓     | Yes           | No           | Research with control |
| 2    | ✓   | ✓     | No            | No           | Fast research |
| 3    | ✓   | ✓     | Yes           | Yes          | Interactive chat |
| 4    | ✓   | ✓     | No            | Yes          | Fast AI assistant |

Code Reduction:
---------------
Before (traditional): ~2,650 lines (700 per mode × 4)
After (with BaseWorkflow): ~1,260 lines (700 shared + 140 per mode × 4)
Savings: 79% reduction (1,390 lines eliminated)

Architecture:
-------------
BaseWorkflow (vital_shared)
    ├── 5 Shared Nodes (80% of logic)
    │   ├── load_agent_node
    │   ├── rag_retrieval_node
    │   ├── tool_suggestion_node
    │   ├── tool_execution_node
    │   └── save_conversation_node
    │
    ├── Mode1ManualWorkflow (140 lines)
    │   └── execute_llm_node + confirmation conditionals
    │
    ├── Mode2AutomaticWorkflow (120 lines)
    │   ├── auto_approve_tools_node
    │   └── execute_llm_node
    │
    ├── Mode3ChatManualWorkflow (140 lines)
    │   ├── load_conversation_history_node
    │   └── execute_llm_node (context-aware)
    │
    └── Mode4ChatAutomaticWorkflow (150 lines)
        ├── load_conversation_history_node
        ├── auto_approve_tools_node
        └── execute_llm_node (context-aware)

Usage:
------
from langgraph_workflows.modes import (
    create_mode1_workflow,
    create_mode2_workflow,
    create_mode3_workflow,
    create_mode4_workflow
)
from vital_shared import ServiceRegistry

# Initialize services once
ServiceRegistry.initialize(db_client, pinecone_client)

# Create workflow
workflow = create_mode1_workflow(
    agent_service=ServiceRegistry.get_agent_service(),
    rag_service=ServiceRegistry.get_rag_service(),
    tool_service=ServiceRegistry.get_tool_service(),
    memory_service=ServiceRegistry.get_memory_service(),
    streaming_service=ServiceRegistry.get_streaming_service()
)

# Execute
await workflow.initialize()
result = await workflow.execute(
    user_id="user-123",
    tenant_id="tenant-456",
    session_id="session-789",
    query="What are FDA requirements?"
)
"""

from langgraph_workflows.modes.mode1_manual_workflow import (
    Mode1ManualWorkflow,
    create_mode1_workflow
)
from langgraph_workflows.modes.mode2_automatic_workflow import (
    Mode2AutomaticWorkflow,
    create_mode2_workflow
)
from langgraph_workflows.modes.mode3_chat_manual_workflow import (
    Mode3ChatManualWorkflow,
    create_mode3_workflow
)
from langgraph_workflows.modes.mode4_chat_automatic_workflow import (
    Mode4ChatAutomaticWorkflow,
    create_mode4_workflow
)

__all__ = [
    # Workflow classes
    "Mode1ManualWorkflow",
    "Mode2AutomaticWorkflow",
    "Mode3ChatManualWorkflow",
    "Mode4ChatAutomaticWorkflow",
    
    # Factory functions
    "create_mode1_workflow",
    "create_mode2_workflow",
    "create_mode3_workflow",
    "create_mode4_workflow",
]

