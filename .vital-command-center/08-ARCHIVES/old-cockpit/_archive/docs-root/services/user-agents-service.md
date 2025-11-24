# User Agents Service Documentation

## Overview

The `UserAgentsService` provides enterprise-grade management of user-agent relationships, replacing localStorage with database-backed persistence. It implements SOLID principles, resilience patterns, and comprehensive observability.

**File:** `apps/digital-health-startup/src/lib/services/user-agents/user-agents-service.ts`

---

## Architecture

### Interface-Based Design

The service implements `IUserAgentsService` interface, following Dependency Inversion Principle:

```typescript
export interface IUserAgentsService {
  getUserAgents(userId: string): Promise<UserAgent[]>
  addUserAgent(userId: string, agentId: string, options?: AddOptions): Promise<UserAgent>
  removeUserAgent(userId: string, agentId: string): Promise<void>
  migrateFromLocalStorage(userId: string): Promise<MigrationResult>
  bulkAddUserAgents(userId: string, agentIds: string[]): Promise<BulkResult>
}
```

### Resilience Features

- **Circuit Breaker**: Prevents cascading failures during database outages
- **Retry Logic**: Exponential backoff with jitter (3 retries)
- **Structured Logging**: All operations logged with correlation IDs
- **Error Handling**: Typed exceptions with context

---

## Methods

### `getUserAgents(userId: string)`

Fetch all agents that a user has added to their list.

**Features:**
- Retry with exponential backoff
- Circuit breaker protection
- Structured logging
- Cache integration (via React Query)

**Example:**
```typescript
const agents = await userAgentsService.getUserAgents('user-123');
```

### `addUserAgent(userId: string, agentId: string, options?)`

Add an agent to a user's list.

**Options:**
```typescript
interface AddUserAgentOptions {
  originalAgentId?: string;
  isUserCopy?: boolean;
  metadata?: Record<string, unknown>;
}
```

**Example:**
```typescript
const userAgent = await userAgentsService.addUserAgent(
  'user-123',
  'agent-456',
  { isUserCopy: true }
);
```

### `removeUserAgent(userId: string, agentId: string)`

Remove an agent from a user's list.

**Example:**
```typescript
await userAgentsService.removeUserAgent('user-123', 'agent-456');
```

### `migrateFromLocalStorage(userId: string)`

Migrate agents from localStorage to database (one-time).

**Returns:**
```typescript
interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Array<{ agentId: string; error: string }>;
}
```

**Example:**
```typescript
const result = await userAgentsService.migrateFromLocalStorage('user-123');
if (result.success) {
  console.log(`Migrated ${result.migratedCount} agents`);
}
```

### `bulkAddUserAgents(userId: string, agentIds: string[], options?)`

Add multiple agents in batch (used for migration).

**Features:**
- Processes in batches of 5
- Handles errors gracefully
- Returns summary with success/failure counts

---

## Usage with React

### Using the Hook

```typescript
import { useUserAgents } from '@/lib/hooks/use-user-agents';

function MyComponent() {
  const { query, addMutation, removeMutation, migrateMutation } = useUserAgents(user?.id || null);
  
  const agents = query.data || [];
  const isLoading = query.isLoading;
  
  const handleAdd = () => {
    addMutation.mutate('agent-id', {
      onSuccess: () => console.log('Agent added'),
      onError: (error) => console.error('Failed:', error),
    });
  };
  
  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  );
}
```

---

## Error Handling

All methods throw typed exceptions:

```typescript
try {
  await userAgentsService.addUserAgent(userId, agentId);
} catch (error) {
  if (error instanceof UserAgentOperationError) {
    console.error('Operation failed:', error.message);
    console.error('Context:', error.context);
  }
}
```

**Error Types:**
- `UserAgentOperationError`: General operation errors
- `DatabaseConnectionError`: Database connectivity issues
- `AgentNotFoundError`: Agent not found

---

## Observability

### Logging

All operations are logged with structured data:

```typescript
{
  operation: 'getUserAgents',
  operationId: 'op_123',
  userId: 'user-123',
  duration: 45,
  count: 5
}
```

### Metrics

Metrics are automatically exported to Prometheus:
- `user_agent_operations_total` (counter)
- `user_agent_operation_duration_ms` (histogram)

### Tracing

Distributed tracing via OpenTelemetry-compatible service:
- Request correlation IDs
- Span tracking
- Performance metrics

---

## Performance

### Caching

- React Query integration for client-side caching
- 5-minute stale time
- Automatic cache invalidation on mutations

### Batch Operations

- Batch size: 5 agents per batch
- Delay between batches: 100ms
- Automatic error recovery

---

## Migration Strategy

### Phase 1: Initial Migration

1. User logs in
2. Check for localStorage data
3. Auto-migrate on first load
4. Clear localStorage on success

### Phase 2: Gradual Rollout

1. Monitor migration success rate
2. Handle edge cases
3. Validate data integrity

### Phase 3: Cleanup

1. Remove localStorage fallback code
2. Archive migration logic
3. Update documentation

---

## Testing

### Unit Tests

```typescript
describe('UserAgentsService', () => {
  it('should fetch user agents', async () => {
    const agents = await service.getUserAgents('user-123');
    expect(agents).toBeDefined();
  });
});
```

### Integration Tests

Test with real database (test environment):
- Create/read/update/delete operations
- Error scenarios
- Batch operations

---

## Configuration

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)

### Retry Configuration

```typescript
// Default retry settings
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: true
}
```

### Circuit Breaker Configuration

```typescript
{
  timeout: 10000, // 10 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000 // 30 seconds
}
```

---

## Best Practices

1. **Always use the hook** in React components (provides caching)
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during operations
4. **Validate user ID** before operations
5. **Use bulk operations** for migrations only

---

## Changelog

### v1.0.0 (2025-01-29)
- Initial service implementation
- Circuit breaker integration
- Retry logic with exponential backoff
- Structured logging
- localStorage migration support

