# Ask Expert Mode 1 Workflow - ReactFlow Implementation

## Overview

This directory contains the ReactFlow/LangGraph workflow implementation for **Ask Expert Mode 1: Interactive Manual**, as specified in the detailed workflow visualization document.

## Files

### `mode1-workflow.ts`
Raw workflow definition with complete node and edge configurations. This is a standalone implementation that can be used independently.

**Key Features:**
- 13 nodes total (8 LangGraph nodes + 3 conditional + 2 control)
- Complete state machine with all conditional edges
- Detailed metadata and performance metrics
- Self-documenting with inline descriptions

**Usage:**
```typescript
import { createMode1Workflow, getMode1WorkflowStats } from './mode1-workflow';

const workflow = createMode1Workflow();
// Returns: { nodes: Node[], edges: Edge[], metadata: {...} }

const stats = getMode1WorkflowStats();
// Returns workflow statistics
```

## Panel Workflows Integration

The Mode 1 workflow is also integrated into the panel workflows system at:
`../panel-workflows/mode1-ask-expert.ts`

This integration allows the workflow to be:
1. Loaded via `createDefaultPanelWorkflow('mode1_ask_expert')`
2. Displayed in the WorkflowBuilder component
3. Executed with the LangGraph backend
4. Customized with expert configurations

## Architecture

### LangGraph State Machine

The workflow implements a complete LangGraph state machine with 8 core nodes:

#### Phase 1: Initialization (1-4s)
1. **load_agent** - Fetch agent profile, persona, knowledge bases, sub-agent pool
2. **load_context** - Load conversation history (last 10 turns)

#### Phase 2: Context Enrichment (3-5s)
3. **update_context** - Hybrid RAG search (semantic + keyword fusion)

#### Phase 3: Reasoning & Planning (3-5s)
4. **agent_reasoning** - Chain-of-thought analysis, determine tool/specialist needs

#### Phase 4: Sub-Agent Orchestration (2-3s, conditional)
5. **spawn_specialists** - Dynamically spawn Level 3 specialist sub-agents

#### Phase 5: Tool Execution (3-7s, conditional)
6. **tool_execution** - Execute tools (FDA API, Standards DB, etc.)

#### Phase 6: Response Generation (5-10s)
7. **generate_response** - Synthesize expert response with streaming

#### Phase 7: Persistence (1-2s)
8. **update_memory** - Persist conversation to database

### Conditional Edges

The workflow includes 3 decision points:

1. **check_specialist_need** - Route based on `needs_specialists` flag
2. **check_tools_need** - Route based on `needs_tools` flag
3. **check_continuation** - Route based on `continue_conversation` and `error` flags

### Data Flow

```
User Message
    ↓
[Load Agent] → [Load Context] → [Update Context (RAG)]
    ↓
[Agent Reasoning]
    ↓
[Check Specialists?] ─(yes)→ [Spawn Specialists]
    ↓                             ↓
[Check Tools?] ←──────────────────┘
    ↓
[Tool Execution] ─(if needed)→ [Generate Response]
    ↓                              ↓
                            [Update Memory]
                                   ↓
                            [Check Continue?]
                                   ↓
                                [END]
```

## Performance Targets

| Metric | Target | Actual (P50) |
|--------|--------|--------------|
| Response Time (P50) | 15-20s | TBD |
| Response Time (P95) | 25-30s | TBD |
| Response Time (P99) | 35-40s | TBD |
| RAG Retrieval | <3s | TBD |
| Tool Execution | <5s per tool | TBD |
| LLM Generation | <8s | TBD |

## Usage in ask-panel-v1

The workflow is automatically available in the Designer page (ask-panel-v1):

```typescript
// apps/digital-health-startup/src/app/(app)/ask-panel-v1/page.tsx
import { WorkflowBuilder } from '@/components/langgraph-gui/WorkflowBuilder';

export default function AskPanelV1Page() {
  return (
    <WorkflowBuilder
      apiBaseUrl="/api/langgraph-gui"
      embedded={true}
      className="h-full"
    />
  );
}
```

To load the Mode 1 workflow:

1. Open the Designer page in VITAL
2. Click "New Workflow" or "Load Template"
3. Select "Ask Expert Mode 1: Interactive Manual"
4. The workflow will be loaded into the visual canvas

## Customization

### Expert Configuration

You can customize the expert agent by modifying:
`panel-workflows/mode1-ask-expert.ts`

Key customization points:
- Expert persona and system prompt
- Knowledge base IDs
- Sub-agent pool
- Tool availability
- Model selection (GPT-4, Claude, etc.)

### Node Configuration

Each node can be customized with:
- **model**: LLM model to use (gpt-4-turbo-preview, claude-3-opus, etc.)
- **temperature**: Creativity level (0.0-1.0)
- **tools**: Available tools for that step
- **duration**: Expected execution time
- **operations**: Specific operations to perform

### Example Customization

```typescript
{
  id: 'agent_reasoning',
  type: 'task',
  taskId: 'chain_of_thought_reasoning',
  data: {
    config: {
      model: 'claude-3-opus-20240229', // Change model
      temperature: 0.2, // More deterministic
      reasoning_mode: 'tree_of_thoughts' // Use ToT instead of CoT
    }
  }
}
```

## Testing

To test the workflow:

1. **Visual Testing**: Load in Designer and verify all nodes/edges render correctly
2. **Execution Testing**: Send a test query and verify SSE streaming
3. **Integration Testing**: Verify database persistence and session management
4. **Performance Testing**: Measure response times at P50/P95/P99

## Deployment

The workflow is deployed as part of the VITAL application:

1. Frontend: ReactFlow visualization in ask-panel-v1
2. Backend: LangGraph execution via `/api/langgraph-gui` endpoints
3. Database: Conversation persistence in Supabase

## Monitoring

Key metrics to monitor:
- Node execution times (per node)
- Total workflow duration
- Tool success/failure rates
- RAG retrieval relevance scores
- LLM token usage and costs
- Database write latency

## Related Documentation

- [MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md](/.claude/vital-expert-docs/04-services/ask-expert/MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md) - Complete specification
- [LangGraph State Management](https://python.langgraph.com/docs/concepts/state/) - LangGraph docs
- [ReactFlow Documentation](https://reactflow.dev/docs/introduction/) - ReactFlow API

## Support

For questions or issues:
1. Check the detailed workflow visualization document
2. Review the LangGraph state schema in the specification
3. Test with the Designer visual tool
4. Check backend logs for execution details

---

**Version**: 1.0
**Date**: November 20, 2025
**Status**: Production Ready ✅
