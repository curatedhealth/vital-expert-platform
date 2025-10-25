# @vital/types

Shared TypeScript type definitions for the VITAL Platform.

## Usage

```typescript
// Import all types
import { Agent, AgentStatus, Message, Conversation } from '@vital/types';

// Or import from specific modules
import { Agent, AgentStatus } from '@vital/types/agents';
import { Message } from '@vital/types/chat';
import { PaginatedResponse } from '@vital/types/common';
```

## Structure

- `agents/` - Agent-related types
- `chat/` - Chat and messaging types
- `common/` - Common utility types
- `rag/` - RAG (Retrieval-Augmented Generation) types (planned)
- `dashboard/` - Dashboard and metrics types (planned)
- `api/` - API request/response types (planned)

## Development

```bash
# Type check
pnpm type-check
```
