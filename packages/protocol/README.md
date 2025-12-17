# @vital/protocol

**The Single Source of Truth** for type definitions between VITAL frontend and backend.

## Overview

This package contains Zod schemas that define the contract between:
- **Frontend**: React Flow visual workflow designer
- **Backend**: LangGraph workflow compiler and executor

Any change to these schemas triggers:
1. TypeScript type regeneration (automatic via Zod inference)
2. JSON Schema export (for Pydantic generation)
3. CI validation (fails if backend schemas are out of sync)

## Installation

```bash
pnpm add @vital/protocol
```

## Usage

### Frontend (TypeScript)

```typescript
import { 
  WorkflowSchema, 
  validateWorkflow,
  validateWorkflowStructure,
  type Workflow,
  type WorkflowNode,
} from '@vital/protocol';

// Validate workflow JSON
const workflow = validateWorkflow(jsonData);

// Check graph structure
const validation = validateWorkflowStructure(workflow);
if (!validation.isValid) {
  console.error(validation.errors);
}
```

### Backend (Python)

The JSON schemas are exported and converted to Pydantic models:

```python
# Auto-generated from @vital/protocol
from src.api.schemas._generated import Workflow, WorkflowNode

workflow = Workflow.model_validate(json_data)
```

## Schema Structure

```
src/
├── schemas/
│   ├── common.schema.ts      # Shared primitives (UUID, DateTime, etc.)
│   ├── nodes.schema.ts       # All node types (Expert, Tool, Router, etc.)
│   ├── edges.schema.ts       # Edge types (Default, Conditional)
│   ├── workflow.schema.ts    # Complete workflow definition
│   ├── expert.schema.ts      # Ask Expert API schemas
│   └── job.schema.ts         # Async job tracking schemas
│
├── constants/
│   ├── node-types.ts         # NODE_TYPES enum
│   ├── modes.ts              # EXPERT_MODES enum
│   └── events.ts             # SSE_EVENT_TYPES enum
│
├── types/
│   └── index.ts              # Re-exported TypeScript types
│
└── generate-json-schemas.ts  # JSON Schema generator
```

## Available Schemas

### Workflow

- `WorkflowSchema` - Complete workflow definition
- `CreateWorkflowSchema` - For creating new workflows
- `UpdateWorkflowSchema` - For updating workflows
- `WorkflowSummarySchema` - List view summary

### Nodes

- `StartNodeSchema` - Entry point
- `EndNodeSchema` - Exit point
- `ExpertNodeSchema` - AI expert agent
- `PanelNodeSchema` - Multi-agent panel
- `ToolNodeSchema` - Generic tool execution
- `RAGQueryNodeSchema` - Knowledge base query
- `WebSearchNodeSchema` - Web search
- `RouterNodeSchema` - Conditional routing
- `ConditionNodeSchema` - If/else branching
- `ParallelNodeSchema` - Parallel execution
- `MergeNodeSchema` - Merge parallel results
- `HumanInputNodeSchema` - Wait for human input
- `ApprovalNodeSchema` - Wait for approval
- `TransformNodeSchema` - Data transformation
- `AggregateNodeSchema` - Data aggregation
- `DelayNodeSchema` - Add delay
- `LogNodeSchema` - Debug logging
- `WebhookNodeSchema` - External webhook call

### Expert API

- `ExpertRequestSchema` - Chat request
- `ExpertSyncResponseSchema` - Mode 1-2 response
- `ExpertAsyncResponseSchema` - Mode 3-4 job creation
- `ConversationSchema` - Full conversation
- `MessageSchema` - Single message

### Jobs

- `JobSchema` - Async job definition
- `JobStatusResponseSchema` - Polling response
- `JobResultResponseSchema` - Completed job result

## Scripts

```bash
# Build the package
pnpm build

# Generate JSON Schemas (for Python)
pnpm generate:json-schemas

# Type check
pnpm typecheck

# Watch mode for development
pnpm dev
```

## Type Synchronization

The codegen pipeline ensures TypeScript and Python stay in sync:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Zod Schemas   │────▶│  JSON Schemas   │────▶│ Pydantic Models │
│  (TypeScript)   │     │    (Export)     │     │    (Python)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│ TypeScript Types│                           │ Python Types    │
│   (Inferred)    │                           │  (Generated)    │
└─────────────────┘                           └─────────────────┘
```

Run `make sync-types` from the monorepo root to regenerate all types.

## Constants

```typescript
import { NODE_TYPES, EXPERT_MODES, SSE_EVENT_TYPES } from '@vital/protocol';

// Node types
NODE_TYPES.EXPERT // 'expert'
NODE_TYPES.ROUTER // 'router'

// Expert modes
EXPERT_MODES.MODE_1_INSTANT // 'mode_1_instant'
EXPERT_MODES.MODE_3_DEEP_RESEARCH // 'mode_3_deep_research'

// SSE events
SSE_EVENT_TYPES.TOKEN // 'token'
SSE_EVENT_TYPES.THOUGHT // 'thought'
```

## Contributing

1. Make schema changes in `src/schemas/`
2. Run `pnpm generate:json-schemas`
3. Run `make sync-types` from monorepo root
4. Verify both frontend and backend compile
5. Submit PR (CI will validate sync)

## License

Private - VITAL Path Platform











