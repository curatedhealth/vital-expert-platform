# Ask Expert Page Refactoring Strategy

## Current State Analysis

**File:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
**Size:** 3,589 lines of code
**Status:** Monolithic component with multiple responsibilities

### Key Issues Identified

1. **Monolithic Architecture** - Single 3,589-line file handling everything
2. **Mixed Concerns** - UI, business logic, API calls, state management all in one place
3. **Parsing Errors** - Smart quotes, emojis, and malformed template literals throughout
4. **Maintainability** - Extremely difficult to debug, test, or extend
5. **Code Duplication** - Similar logic repeated across different modes
6. **State Management Complexity** - 50+ useState hooks in a single component

### Current Responsibilities (All in One File)

- Mode selection and routing (4 modes)
- SSE streaming connection management
- Message state management
- Tool orchestration UI and logic
- RAG integration
- Agent selection
- Chat history
- File attachments
- Dark mode
- Conversation management
- Real-time updates
- Error handling
- Metadata processing
- UI rendering

---

## Proposed Refactoring Strategy

### Phase 1: Extract Core Logic (Week 1)

#### 1.1 Create Custom Hooks (Separation of Concerns)

**Location:** `apps/digital-health-startup/src/features/ask-expert/hooks/`

```typescript
// useStreamingConnection.ts
export function useStreamingConnection() {
  // Extract all SSE connection logic
  // - connect/disconnect
  // - event parsing
  // - reconnection logic
  // - connection status
}

// useMessageManagement.ts
export function useMessageManagement() {
  // Extract all message-related state
  // - messages array
  // - add/update/delete operations
  // - streaming message state
  // - message metadata
}

// useModeLogic.ts
export function useModeLogic(mode: number) {
  // Extract mode-specific logic
  // - mode determination from toggles
  // - mode validation
  // - mode-specific defaults
}

// useToolOrchestration.ts
export function useToolOrchestration() {
  // Extract tool-related logic
  // - tool confirmation
  // - tool execution tracking
  // - tool results management
}

// useRAGIntegration.ts
export function useRAGIntegration() {
  // Extract RAG-related logic
  // - source retrieval
  // - citation management
  // - evidence tracking
}
```

#### 1.2 Create Service Layer

**Location:** `apps/digital-health-startup/src/features/ask-expert/services/`

```typescript
// streamingService.ts
export class StreamingService {
  async connect(endpoint: string, payload: any): Promise<ReadableStream>
  parseSSEEvent(line: string): SSEEvent | null
  handleReconnection(maxRetries: number): void
}

// messageService.ts
export class MessageService {
  formatMessage(content: string, metadata: any): Message
  validateMessage(message: Message): boolean
  persistMessage(message: Message): Promise<void>
}

// modeService.ts
export class ModeService {
  determineMode(isAutomatic: boolean, isAutonomous: boolean): number
  getEndpoint(mode: number): string
  validateModeRequirements(mode: number, context: any): boolean
}
```

#### 1.3 Extract Type Definitions

**Location:** `apps/digital-health-startup/src/features/ask-expert/types/`

```typescript
// messages.types.ts
export interface Message { ... }
export interface MessageMetadata { ... }
export interface StreamingState { ... }

// tools.types.ts
export interface ToolSuggestion { ... }
export interface ToolResult { ... }
export interface ExecutingTool { ... }

// modes.types.ts
export interface ModeConfig { ... }
export interface ModeRequirements { ... }

// sse.types.ts
export interface SSEEvent { ... }
export interface StreamChunk { ... }
```

---

### Phase 2: Component Decomposition (Week 2)

#### 2.1 Create Feature Components

**Location:** `apps/digital-health-startup/src/features/ask-expert/components/`

```
components/
├── Chat/
│   ├── MessageList.tsx           # Displays messages
│   ├── MessageInput.tsx           # Input with attachments
│   ├── StreamingIndicator.tsx    # Shows streaming status
│   └── FollowUpSuggestions.tsx   # Smart suggestions
│
├── Mode/
│   ├── ModeSelector.tsx           # Two-toggle interface
│   ├── ModeIndicator.tsx          # Current mode display
│   └── ModeRequirements.tsx       # Shows what's needed
│
├── Tools/
│   ├── ToolConfirmation.tsx       # Already exists ✓
│   ├── ToolExecutionStatus.tsx    # Already exists ✓
│   └── ToolResults.tsx            # Already exists ✓
│
├── RAG/
│   ├── SourcesList.tsx            # Chicago-style references
│   ├── InlineCitation.tsx         # Pill-style citations
│   └── EvidenceSummary.tsx        # RAG summary display
│
├── Reasoning/
│   ├── ReasoningPanel.tsx         # Progressive disclosure
│   ├── ReasoningStep.tsx          # Individual step
│   └── ReasoningMetrics.tsx       # Performance metrics
│
└── Layout/
    ├── ChatContainer.tsx          # Main chat layout
    ├── Sidebar.tsx                # Conversations + agents
    └── Header.tsx                 # Mode + settings
```

#### 2.2 Create Container Component

**Location:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

```typescript
// New clean page.tsx (~200 lines)
export default function AskExpertPage() {
  return (
    <AskExpertProvider>
      <ChatHistoryProvider>
        <AskExpertContainer />
      </ChatHistoryProvider>
    </AskExpertProvider>
  );
}

// AskExpertContainer.tsx (~300 lines)
function AskExpertContainer() {
  // Use custom hooks
  const connection = useStreamingConnection();
  const messages = useMessageManagement();
  const mode = useModeLogic();
  const tools = useToolOrchestration();
  const rag = useRAGIntegration();

  // Compose UI from feature components
  return (
    <ChatLayout>
      <Header mode={mode} />
      <MessageList messages={messages} />
      <StreamingIndicator connection={connection} />
      <MessageInput onSend={handleSend} />
      <ToolOrchestration tools={tools} />
      <RAGPanel rag={rag} />
    </ChatLayout>
  );
}
```

---

### Phase 3: Event Handler Refactoring (Week 3)

#### 3.1 Create Event Processing Pipeline

**Location:** `apps/digital-health-startup/src/features/ask-expert/streaming/`

```typescript
// eventProcessor.ts
export class SSEEventProcessor {
  private handlers: Map<string, EventHandler> = new Map();

  register(eventType: string, handler: EventHandler) {
    this.handlers.set(eventType, handler);
  }

  async process(event: SSEEvent) {
    const handler = this.handlers.get(event.event);
    if (handler) {
      await handler.handle(event.data);
    }
  }
}

// handlers/
//   - ContentHandler.ts        # Handle content streaming
//   - ReasoningHandler.ts      # Handle reasoning events
//   - ToolHandler.ts           # Handle tool events
//   - SourceHandler.ts         # Handle RAG sources
//   - MetadataHandler.ts       # Handle metadata updates
```

#### 3.2 Simplify Event Parsing

```typescript
// Current: 1000+ lines of nested switch/if statements
// Proposed: Clean event routing

const eventProcessor = new SSEEventProcessor();

// Register handlers
eventProcessor.register('content', new ContentHandler(setState));
eventProcessor.register('reasoning', new ReasoningHandler(setState));
eventProcessor.register('tool_suggestion', new ToolHandler(setState));
eventProcessor.register('sources', new SourceHandler(setState));

// Process events
while (reader) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const events = parseSSE(value);
  for (const event of events) {
    await eventProcessor.process(event);
  }
}
```

---

### Phase 4: Mode-Specific Logic Isolation (Week 4)

#### 4.1 Create Mode Strategies

**Location:** `apps/digital-health-startup/src/features/ask-expert/modes/`

```typescript
// ModeStrategy.ts (Interface)
export interface ModeStrategy {
  validateRequirements(context: Context): boolean;
  getEndpoint(): string;
  processResponse(stream: ReadableStream): AsyncGenerator<Update>;
  getDefaultConfig(): ModeConfig;
}

// Mode1Strategy.ts - Manual Interactive
export class Mode1Strategy implements ModeStrategy {
  validateRequirements(context) {
    return context.selectedAgents.length > 0;
  }
  
  getEndpoint() {
    return '/api/mode1/manual';
  }
  
  // Mode 1 specific processing
}

// Mode2Strategy.ts - Automatic Agent Selection
// Mode3Strategy.ts - Autonomous Multi-Agent
// Mode4Strategy.ts - Fully Autonomous
```

#### 4.2 Mode Factory

```typescript
// modeFactory.ts
export class ModeFactory {
  static create(mode: number): ModeStrategy {
    switch (mode) {
      case 1: return new Mode1Strategy();
      case 2: return new Mode2Strategy();
      case 3: return new Mode3Strategy();
      case 4: return new Mode4Strategy();
      default: throw new Error(`Unknown mode: ${mode}`);
    }
  }
}

// Usage in component
const strategy = ModeFactory.create(currentMode);
if (!strategy.validateRequirements(context)) {
  showError('Requirements not met');
  return;
}

const stream = await fetchStream(strategy.getEndpoint(), payload);
for await (const update of strategy.processResponse(stream)) {
  applyUpdate(update);
}
```

---

### Phase 5: Testing Infrastructure (Week 5)

#### 5.1 Unit Tests

```typescript
// hooks/__tests__/useStreamingConnection.test.ts
// hooks/__tests__/useMessageManagement.test.ts
// services/__tests__/StreamingService.test.ts
// modes/__tests__/Mode1Strategy.test.ts
```

#### 5.2 Integration Tests

```typescript
// components/__tests__/AskExpertContainer.test.tsx
// streaming/__tests__/eventProcessor.test.ts
```

#### 5.3 E2E Tests

```typescript
// e2e/mode1-workflow.spec.ts
// e2e/tool-orchestration.spec.ts
// e2e/streaming-reconnection.spec.ts
```

---

## Benefits of This Refactoring

### Maintainability
- **Single Responsibility:** Each file/component has one clear purpose
- **Easy Debugging:** Issues isolated to specific modules
- **Clear Dependencies:** Explicit imports show relationships

### Scalability
- **Add New Modes:** Just implement `ModeStrategy` interface
- **Add New Tools:** Register handler in event processor
- **Extend Features:** Modify specific hooks/components

### Testability
- **Unit Tests:** Test each hook/service independently
- **Integration Tests:** Test component interactions
- **Mocking:** Easy to mock hooks and services

### Code Quality
- **Type Safety:** TypeScript interfaces for all contracts
- **No Parsing Errors:** Clean, properly formatted code
- **Consistent Patterns:** Same approach across features

### Developer Experience
- **Fast Builds:** Smaller files compile faster
- **Better IDE Support:** Autocomplete and navigation work better
- **Easier Onboarding:** New developers can understand structure quickly

---

## Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Create new structure alongside existing
2. Migrate one feature at a time (tools, then RAG, then messages)
3. Test each migration thoroughly
4. Keep old code until all features migrated
5. Remove old monolith when complete

**Timeline:** 5 weeks
**Risk:** Low
**Can be paused:** Yes

### Option B: Big Bang Rewrite
1. Create complete new structure
2. Rewrite all logic at once
3. Switch in single deployment

**Timeline:** 3-4 weeks
**Risk:** High
**Can be paused:** No

---

## Recommended Next Steps

### Immediate (This Session)
1. ✅ Create this strategy document
2. Fix critical parsing errors to unblock development
3. Commit current working state
4. Get user approval for refactoring approach

### Week 1: Foundation
1. Create folder structure
2. Extract types to separate files
3. Create first custom hook (`useStreamingConnection`)
4. Test in isolation

### Week 2: Core Features
1. Extract message management
2. Extract mode logic
3. Create service layer
4. Migrate Mode 1 to new structure

### Week 3: Advanced Features
1. Implement event processor
2. Migrate tool orchestration
3. Migrate RAG integration
4. Create comprehensive tests

### Week 4: Remaining Modes
1. Implement mode strategies
2. Migrate Mode 2, 3, 4
3. Create mode factory
4. End-to-end testing

### Week 5: Cleanup & Documentation
1. Remove old monolith
2. Write comprehensive docs
3. Performance optimization
4. Final QA

---

## Success Metrics

- ✅ No file over 500 lines
- ✅ Zero parsing errors
- ✅ 80%+ test coverage
- ✅ Build time < 30 seconds
- ✅ Easy to add new modes
- ✅ Clear documentation
- ✅ Type-safe throughout

---

## Questions for User

1. **Timeline:** Do you prefer gradual migration (5 weeks, low risk) or big bang (3-4 weeks, higher risk)?

2. **Priority:** Which feature should we migrate first?
   - Option A: Tool Orchestration (newest, cleanest code)
   - Option B: Message Management (core functionality)
   - Option C: Streaming Connection (foundational)

3. **Testing:** What level of test coverage is required?
   - Option A: Basic (happy path only)
   - Option B: Standard (80% coverage)
   - Option C: Comprehensive (90%+ coverage)

4. **Immediate Action:** Should we:
   - Option A: Start refactoring now
   - Option B: Fix remaining parsing errors first, then refactor
   - Option C: Complete Tool Orchestration integration first, then refactor

---

**Document Status:** Draft for Review
**Created:** 2025-11-08
**Last Updated:** 2025-11-08

