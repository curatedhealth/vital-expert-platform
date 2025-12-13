# Archived Ask Expert Workflows

> **Archived:** December 12, 2025
> **Reason:** Superseded by unified architecture

## Deprecated Files

| File | Replacement | Migration |
|------|-------------|-----------|
| `ask_expert_mode3_workflow.py` | `unified_autonomous_workflow.py` | Use `create_mode3_workflow()` |
| `ask_expert_mode4_workflow.py` | `unified_autonomous_workflow.py` | Use `create_mode4_workflow()` |

## Why Unified?

The Mode 3 and Mode 4 workflows were **99% identical**. The ONLY difference was:
- **Mode 3**: User manually selects the agent (MANUAL strategy)
- **Mode 4**: System automatically selects via Fusion Search (AUTOMATIC strategy)

Both modes include the FULL safety suite:
- `check_budget` - Token/cost budget enforcement
- `self_correct` - Autonomous error recovery
- `circuit_breaker` - Failure protection
- `hitl_plan_approval` - Human approval for plans
- `hitl_step_review` - Human review of steps

## Migration Example

### Before (Deprecated)
```python
from langgraph_workflows.ask_expert import AskExpertMode3Workflow

workflow = AskExpertMode3Workflow(supabase_client=client)
```

### After (Unified)
```python
from langgraph_workflows.ask_expert.unified_autonomous_workflow import create_mode3_workflow

workflow = create_mode3_workflow(
    supabase_client=client,
    rag_service=rag_service,  # Optional
    agent_orchestrator=orchestrator,  # Optional
    hitl_service=hitl_service,  # Optional
)
```

## Architecture Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Mode │ Type        │ Agent Selection    │ Safety/HITL Nodes                 │
├──────┼─────────────┼────────────────────┼───────────────────────────────────┤
│  1   │ Interactive │ MANUAL (user)      │ Basic flow ONLY                   │
│  2   │ Interactive │ AUTOMATIC (Fusion) │ Basic flow ONLY                   │
├──────┼─────────────┼────────────────────┼───────────────────────────────────┤
│  3   │ Autonomous  │ MANUAL (user)      │ FULL safety suite + HITL          │
│  4   │ Autonomous  │ AUTOMATIC (Fusion) │ FULL safety suite + HITL          │
└─────────────────────────────────────────────────────────────────────────────┘
```

Key insight: Mode 1=Mode 2 (Interactive pair), Mode 3=Mode 4 (Autonomous pair).
Agent selection is the ONLY differentiator within each mode pair.

## DO NOT USE

These files are archived for reference only. They will not be maintained.
Use the unified workflows for all new implementations.
