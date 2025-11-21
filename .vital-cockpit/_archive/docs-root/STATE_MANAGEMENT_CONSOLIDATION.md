# State Management Consolidation Plan

## Current Issues Identified

### 1. Duplicate Store Files

**Chat Stores** (3 duplicates):
- `/src/lib/stores/chat-store.ts` (PRIMARY - used by chat page)
- `/src/shared/services/stores/chat-store.ts` (DUPLICATE)
- `/src/shared/services/chat/chat-store.ts` (DUPLICATE)

**Agents Stores** (3 duplicates):
- `/src/lib/stores/agents-store.ts` (PRIMARY - used by most components)
- `/src/shared/services/stores/agents-store.ts` (DUPLICATE)
- `/src/shared/services/agents/agents-store.ts` (DUPLICATE)

**Total**: 6 store files when only 2 should exist

### 2. Type Inconsistencies

**Agent Type Variations**:
- `chat-store.ts`: Uses `Agent` with camelCase properties (`systemPrompt`, `ragEnabled`, `maxTokens`)
- `agents-store.ts`: Uses `Agent` with snake_case properties (`system_prompt`, `rag_enabled`, `max_tokens`)
- Missing unified type definition

**Result**: Type conversion required when passing agents between stores

### 3. Synchronization Issues

**Problem**: Chat store imports and syncs with agents store:
```typescript
// chat-store.ts line 5
import { useAgentsStore, type Agent as GlobalAgent } from '@/lib/stores/agents-store';

// Later in the code
syncWithGlobalStore: () => {
  const globalAgents = useAgentsStore.getState().agents;
  // Manual sync logic...
}
```

**Issues**:
- Manual synchronization prone to errors
- No automatic updates when agents change
- Possible stale data
- Unnecessary complexity

### 4. LocalStorage Conflicts

Both stores use `persist` middleware which can cause:
- Race conditions during hydration
- Conflicting data between stores
- Increased bundle size (duplicate data)

## Consolidation Strategy

### Phase 1: Unified Type Definitions

Create single source of truth for types in `/src/lib/types/`:

```typescript
// /src/lib/types/agent.types.ts
export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
  avatar: string;
  color: string;
  capabilities: string[];
  rag_enabled: boolean;
  temperature: number;
  max_tokens: number;
  // ... all fields unified
}

// Type adapters for backward compatibility
export function agentToChat(agent: Agent): ChatAgent {
  return {
    ...agent,
    systemPrompt: agent.system_prompt,
    ragEnabled: agent.rag_enabled,
    maxTokens: agent.max_tokens,
  };
}

export function chatToAgent(chatAgent: ChatAgent): Agent {
  return {
    ...chatAgent,
    system_prompt: chatAgent.systemPrompt,
    rag_enabled: chatAgent.ragEnabled,
    max_tokens: chatAgent.maxTokens,
  };
}
```

### Phase 2: Remove Duplicate Stores

**Keep**:
- `/src/lib/stores/agents-store.ts` (PRIMARY)
- `/src/lib/stores/chat-store.ts` (PRIMARY)

**Delete**:
- `/src/shared/services/stores/chat-store.ts`
- `/src/shared/services/stores/agents-store.ts`
- `/src/shared/services/chat/chat-store.ts`
- `/src/shared/services/agents/agents-store.ts`

**Update imports** across codebase to point to primary stores.

### Phase 3: Simplify Chat Store

Remove manual synchronization:

**Before**:
```typescript
// chat-store.ts
export interface ChatStore {
  agents: Agent[]; // Duplicate of agents-store
  syncWithGlobalStore: () => void; // Manual sync
  loadAgentsFromDatabase: () => Promise<void>; // Duplicate logic
}
```

**After**:
```typescript
// chat-store.ts
export interface ChatStore {
  // Remove agents array - use useAgentsStore() directly
  // Remove sync methods
  // Keep only chat-specific state
  chats: Chat[];
  messages: ChatMessage[];
  selectedAgentId: string | null; // Store ID instead of full agent
  currentChatId: string | null;
}

// In components, use both stores:
const { agents } = useAgentsStore();
const { selectedAgentId, messages } = useChatStore();
const selectedAgent = agents.find(a => a.id === selectedAgentId);
```

### Phase 4: Optimize Persistence

Configure persistence keys to avoid conflicts:

```typescript
// agents-store.ts
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'vital-agents-store',
    partialize: (state) => ({
      agents: state.agents,
      lastUpdated: state.lastUpdated,
    }),
  }
);

// chat-store.ts
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'vital-chat-store',
    partialize: (state) => ({
      chats: state.chats,
      currentChatId: state.currentChatId,
    }),
  }
);
```

## Implementation Plan

### Step 1: Create Unified Types (Low Risk)
- Create `/src/lib/types/agent.types.ts`
- Create `/src/lib/types/chat.types.ts`
- Add type adapters for backward compatibility
- No breaking changes yet

### Step 2: Update Primary Stores (Medium Risk)
- Update `/src/lib/stores/agents-store.ts` to use unified types
- Update `/src/lib/stores/chat-store.ts` to use unified types
- Test thoroughly in development

### Step 3: Find and Replace Imports (Low Risk)
- Search codebase for duplicate store imports
- Replace with primary store imports
- Verify no broken imports

### Step 4: Delete Duplicate Files (Medium Risk)
- Delete duplicate store files
- Run build to catch any remaining references
- Fix any build errors

### Step 5: Simplify Chat Store (High Risk)
- Remove agents array from chat store
- Remove sync methods
- Update chat components to use both stores
- Test all chat functionality

### Step 6: Optimize Persistence (Low Risk)
- Configure persistence keys
- Add partialize to reduce localStorage size
- Test hydration on page reload

## Testing Strategy

### Unit Tests
```typescript
describe('Agents Store', () => {
  it('loads agents from database', async () => {
    const { loadAgents } = useAgentsStore.getState();
    await loadAgents();
    expect(useAgentsStore.getState().agents.length).toBeGreaterThan(0);
  });
});

describe('Chat Store', () => {
  it('creates new chat', () => {
    const { createNewChat } = useChatStore.getState();
    createNewChat();
    expect(useChatStore.getState().currentChatId).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Chat with Agents', () => {
  it('selects agent and sends message', async () => {
    const { loadAgents } = useAgentsStore.getState();
    const { selectAgent, sendMessage } = useChatStore.getState();

    await loadAgents();
    const agent = useAgentsStore.getState().agents[0];
    selectAgent(agent.id);

    await sendMessage('Hello');

    expect(useChatStore.getState().messages).toHaveLength(2); // user + assistant
  });
});
```

### Manual Testing Checklist
- [ ] Load chat page - agents display correctly
- [ ] Select agent - agent profile shows
- [ ] Send message - response received
- [ ] Create new chat - starts fresh
- [ ] Reload page - state persists
- [ ] Open agents page - agents load
- [ ] Edit agent - changes save
- [ ] Delete agent - removed from both stores
- [ ] Create custom agent - appears in agents list
- [ ] Add agent to chat - available for selection

## Risk Mitigation

### Low Risk Changes (Do First)
1. Create unified type definitions
2. Add type adapters
3. Update imports to primary stores
4. Configure persistence keys

### Medium Risk Changes (Do Second)
1. Delete duplicate store files
2. Update primary stores to use unified types
3. Optimize persistence configuration

### High Risk Changes (Do Last)
1. Remove agents array from chat store
2. Remove sync methods
3. Update all chat components

### Rollback Plan
- Keep backup of original store files
- Use git branches for each phase
- Test thoroughly before merging
- Have feature flag to switch between old/new implementation

## Expected Benefits

### Code Quality
- **50% reduction in store code**: 6 files → 2 files
- **Eliminated duplication**: Single source of truth
- **Type safety**: Unified type definitions
- **Simplified logic**: No manual synchronization

### Performance
- **Reduced bundle size**: No duplicate store code
- **Faster hydration**: Optimized persistence
- **Better memory usage**: Single agents array
- **Fewer re-renders**: Simplified dependencies

### Developer Experience
- **Clearer structure**: Only 2 stores to understand
- **Easier debugging**: Single place to check state
- **Fewer bugs**: No sync issues
- **Better maintainability**: Less code to maintain

### User Experience
- **More reliable**: No sync issues causing stale data
- **Faster**: Optimized re-renders
- **Consistent**: Same data everywhere

## Migration Timeline

### Week 1: Preparation
- Create unified types
- Add type adapters
- Write comprehensive tests
- Create backup branch

### Week 2: Low Risk Changes
- Update imports across codebase
- Configure persistence
- Run test suite
- Deploy to staging

### Week 3: Medium Risk Changes
- Delete duplicate files
- Update primary stores
- Test thoroughly
- Deploy to staging

### Week 4: High Risk Changes
- Simplify chat store
- Update chat components
- Full regression testing
- Deploy to production with monitoring

## Monitoring

### Metrics to Track
- Store hydration time
- Component re-render count
- Memory usage
- Bundle size
- Error rate
- User-reported issues

### Success Criteria
- ✅ All tests pass
- ✅ No increase in error rate
- ✅ Bundle size reduced by 10%+
- ✅ No user-reported issues for 1 week
- ✅ Code review approved by 2+ engineers

## Related Documentation

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/best-practices)
- [Next.js State Management](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)
- [Type Safety in Zustand](https://docs.pmnd.rs/zustand/guides/typescript)

## Next Steps

1. ✅ Document current issues (Complete)
2. Create unified type definitions
3. Add comprehensive tests
4. Implement Phase 1 (Low Risk)
5. Test and deploy to staging
6. Implement Phase 2 (Medium Risk)
7. Implement Phase 3 (High Risk)
8. Monitor production metrics
