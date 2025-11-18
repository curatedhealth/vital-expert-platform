# Visual Workflow Designer

Production-ready visual workflow designer for building AI agent workflows with LangGraph, AutoGen, and CrewAI.

## Architecture

```
/src/features/workflow-designer/
├── types/              # TypeScript type definitions
├── constants/          # Node types, edge types, templates
├── components/         # React components
│   ├── designer/       # Main designer canvas
│   ├── palette/        # Node palette sidebar
│   ├── properties/     # Property panels
│   ├── toolbar/        # Toolbar actions
│   └── inspector/      # State and execution inspector
├── generators/         # Code generators
│   ├── langgraph/      # LangGraph code generation
│   ├── autogen/        # AutoGen code generation
│   └── crewai/         # CrewAI code generation
├── adapters/           # Framework adapters
├── services/           # API services
├── hooks/              # React hooks
├── utils/              # Utility functions
└── templates/          # Pre-built templates
```

## Database Schema

See `/database/migrations/020_create_workflows.sql` for the complete schema.

### Core Tables

- `workflows` - User-created workflow definitions
- `workflow_versions` - Version history with rollback support
- `workflow_shares` - Collaboration and permissions
- `workflow_executions` - Execution history and results
- `workflow_audit_log` - Complete audit trail
- `agent_templates` - Pre-built agent configurations
- `workflow_templates` - Pre-built workflow templates

## Features

### Phase 1: Foundation (Weeks 1-4)
- [x] Database schema and migrations
- [x] Type definitions
- [x] Node type system
- [ ] Visual editor with drag-and-drop
- [ ] Property panels
- [ ] Save/load workflows
- [ ] LangGraph code generation

### Phase 2: Execution & Monitoring (Weeks 5-8)
- [ ] Workflow execution API
- [ ] Real-time execution monitoring
- [ ] State inspector
- [ ] Debugging tools

### Phase 3: Multi-Framework (Weeks 9-12)
- [ ] Framework abstraction layer
- [ ] AutoGen adapter
- [ ] CrewAI adapter
- [ ] Agent templates (20+)
- [ ] Workflow templates (10+)

### Phase 4: Enterprise (Weeks 13-16)
- [ ] Versioning system
- [ ] Sharing & permissions
- [ ] RBAC & audit logging
- [ ] Performance optimization
- [ ] Testing & documentation

## Quick Start

### 1. Run Database Migration

```bash
# Apply the workflow designer schema
npm run migrate
```

### 2. Import Components

```typescript
import { WorkflowDesigner } from '@/features/workflow-designer/components/designer';
import type { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

function MyPage() {
  return <WorkflowDesigner />;
}
```

### 3. Generate Code

```typescript
import { LangGraphCodeGenerator } from '@/features/workflow-designer/generators/langgraph';

const generator = new LangGraphCodeGenerator();
const code = generator.generate(workflow);
```

## Node Types

- **Start** - Entry point
- **End** - Exit point
- **Agent** - AI agent with LLM
- **Tool** - Function/API call
- **Condition** - Branching logic
- **Parallel** - Concurrent execution
- **Human** - Human-in-the-loop
- **Subgraph** - Nested workflow

## API Endpoints

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Execution
- `POST /api/workflows/:id/execute` - Execute workflow
- `GET /api/workflows/:id/executions` - List executions
- `GET /api/executions/:id` - Get execution details

### Templates
- `GET /api/workflow-templates` - List templates
- `POST /api/workflows/from-template` - Create from template

## Development

### Adding a New Node Type

1. Update `types/workflow.ts`:
```typescript
export type NodeType = 'start' | 'end' | 'agent' | 'mynewtype';
```

2. Add to `constants/node-types.ts`:
```typescript
export const NODE_TYPE_DEFINITIONS = {
  mynewtype: {
    type: 'mynewtype',
    label: 'My New Type',
    icon: MyIcon,
    color: '#000000',
    // ...
  },
};
```

3. Implement in code generators

### Adding a Framework Adapter

1. Create adapter class:
```typescript
// adapters/MyFrameworkAdapter.ts
export class MyFrameworkAdapter extends FrameworkAdapter {
  name = 'myframework';
  
  generateCode(workflow: AbstractWorkflow): string {
    // Implementation
  }
}
```

2. Register in framework registry
3. Add code generation logic
4. Add validation rules

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## License

Internal use only - Vital Platform

## Support

For issues or questions, contact the engineering team.

