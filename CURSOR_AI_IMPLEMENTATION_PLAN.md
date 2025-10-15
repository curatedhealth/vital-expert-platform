# Cursor AI Implementation Plan - VITAL Ask Expert & Chat Services Refactoring

## Overview

This document provides a **comprehensive step-by-step execution plan** for Cursor AI to implement all recommended fixes and architectural improvements. Each task includes specific commands, file paths, code snippets, verification steps, and progress tracking that Cursor can execute directly.

---

## 🚀 Quick Start Guide

### 1. Initial Setup (5 minutes)
```bash
# Navigate to project
cd /path/to/VITAL

# Create Cursor configuration
mkdir -p .cursor
cp .cursorrules .cursorrules
cp CURSOR_AI_IMPLEMENTATION_PLAN.md .cursor/implementation-plan.md

# Create context and commands files
touch .cursor/context.md .cursor/commands.md .cursor/progress.md

# Open Cursor
cursor .
```

### 2. Start Execution
```bash
# Open implementation plan
cursor .cursor/implementation-plan.md

# Begin Phase 1
# Copy commands from .cursor/commands.md and paste into Cursor
```

---

## 🎯 Cursor Setup Instructions

### Initial Configuration

1. **Open Cursor Settings** (`Cmd+,` or `Ctrl+,`)
2. **Configure AI Rules** - Add to `.cursorrules` file:

```markdown
# VITAL Project Rules for Cursor AI

## Context
Working on VITAL Ask Expert & Chat Services refactoring
Following clean architecture principles
Implementing dual-mode system (Manual/Automatic + Interactive/Autonomous)

## Code Standards
- Use TypeScript strict mode
- Follow single responsibility principle
- Write tests for all new code
- Add JSDoc comments for public APIs
- Use descriptive variable names
- Implement error handling at boundaries

## File Organization
- Core logic in /src/core (no framework dependencies)
- Infrastructure in /src/infrastructure 
- UI components in /src/presentation
- Shared utilities in /src/shared

## Git Commits
- Use conventional commits (feat:, fix:, refactor:, test:, docs:)
- One logical change per commit
- Include file paths in commit messages

## Testing
- Write tests before implementation (TDD)
- Minimum 80% coverage for new code
- Use describe/it blocks with clear descriptions

## Security
- Never log sensitive data
- Validate all inputs
- Sanitize outputs
- Use environment variables for secrets
```

3. **Create Project Context File** - `.cursor/context.md`:

```markdown
# Project Context for Cursor AI

## Current Issues to Fix
1. State management: 40+ synchronization issues
2. Duplicate functions (setInteractionMode)
3. Memory leaks (AbortController)
4. SSE event pipeline breaking reasoning display
5. No input validation
6. PII in logs
7. Missing rate limiting
8. Workflow not completing properly

## Target Architecture
- Clean Architecture with 4 layers
- Dual-mode system (Manual/Auto + Interactive/Autonomous)
- Event-driven communication
- Dependency injection
- Comprehensive testing

## Key Files to Refactor
- src/lib/stores/chat-store.ts (1500+ lines)
- src/features/chat/services/ask-expert-graph.ts
- src/app/api/chat/route.ts
- src/features/chat/components/chat-messages.tsx
```

---

## 📋 Implementation Phases

## PHASE 1: Critical Fixes & Cleanup

### Task 1.1: Fix Duplicate Functions

**Priority**: P0 - CRITICAL  
**Estimated Time**: 30 minutes  
**Dependencies**: None

```bash
# Cursor Command
@workspace Fix duplicate setInteractionMode function in chat-store.ts at lines 1026 and 1034. Keep only one implementation and ensure it properly updates the state.
```

**Pre-execution Checklist:**
- [ ] Create backup: `cp src/lib/stores/chat-store.ts src/lib/stores/chat-store.backup.ts`
- [ ] Check current duplicates: `grep -n "setInteractionMode.*=>" src/lib/stores/chat-store.ts`
- [ ] Note line numbers for verification

**Cursor Instructions:**
```typescript
// In src/lib/stores/chat-store.ts
// 1. Find both setInteractionMode functions (lines 1026 and 1034)
// 2. Delete the duplicate at line 1034
// 3. Update the remaining function to:

setInteractionMode: (mode: 'automatic' | 'manual') => {
  console.log('🔄 Setting interaction mode:', mode);
  const state = get();
  
  // Clear agent in automatic mode
  const newAgent = mode === 'automatic' ? null : state.selectedAgent;
  
  set({
    interactionMode: mode,
    selectedAgent: newAgent,
    error: null,
    liveReasoning: '',
    isReasoningActive: false,
    showAgentSelection: false
  });
  
  // Log the change
  console.log('✅ Interaction mode changed to:', mode);
  
  // Trigger any necessary side effects
  if (mode === 'automatic' && state.messages.length > 0) {
    // Re-analyze last message for agent selection
    const lastUserMessage = state.messages.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      // Will be handled by orchestrator
      console.log('📊 Ready for automatic agent selection');
    }
  }
};
```

**Post-execution Verification:**
```bash
# Verify only one setInteractionMode exists
grep -c "setInteractionMode.*=>" src/lib/stores/chat-store.ts
# Should return: 1

# Run type check
npm run type-check

# Test the changes
npm test -- --testNamePattern="setInteractionMode"
```

**Success Criteria:**
- [ ] Only one `setInteractionMode` function exists
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Function properly updates all related state

---

### Task 1.2: Consolidate State Management

**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1.1 completed
```bash
# Cursor Command
@workspace Refactor chat-store.ts to consolidate the 4 different agent state fields into a single unified structure. Create a backup first.
```

**Step-by-Step for Cursor:**

1. **Create backup**:
```bash
cp src/lib/stores/chat-store.ts src/lib/stores/chat-store.backup.ts
```

2. **Create new state interface**:
```typescript
// Add at top of chat-store.ts after imports

interface UnifiedAgentState {
  active: Agent | null;          // Currently active agent
  library: Agent[];              // User's library agents
  suggested: Agent[];            // AI-suggested agents
  selection: {
    mode: 'manual' | 'automatic';
    confidence: number;
    reasoning: string;
    timestamp: Date;
  };
}

interface UnifiedChatState {
  // Agent state - single source of truth
  agent: UnifiedAgentState;
  
  // Interaction modes
  mode: {
    selection: 'manual' | 'automatic';
    interaction: 'interactive' | 'autonomous';
  };
  
  // Chat state
  chat: {
    current: Chat | null;
    messages: ChatMessage[];
    history: Chat[];
  };
  
  // Workflow state
  workflow: {
    step: string;
    status: 'idle' | 'running' | 'paused' | 'complete' | 'error';
    reasoning: ReasoningEvent[];
    requiresInput: boolean;
  };
  
  // UI state
  ui: {
    isLoading: boolean;
    error: string | null;
    showAgentSelector: boolean;
    showToolSelector: boolean;
  };
  
  // Cleanup
  abortController: AbortController | null;
}
```

3. **Update store creation**:
```bash
# Cursor Command
@workspace Update the ChatStore interface and initial state in chat-store.ts to use the new UnifiedChatState structure. Update all methods to use the new structure.
```

### Task 1.3: Add Memory Leak Prevention
```bash
# Cursor Command
@workspace Add cleanup method to chat-store.ts that properly cleans up AbortController and other resources. Add useEffect cleanup in all components using the store.
```

**Add cleanup method**:
```typescript
// In chat-store.ts actions section
cleanup: () => {
  const state = get();
  
  // Abort any pending requests
  if (state.abortController) {
    console.log('🧹 Aborting pending requests');
    state.abortController.abort();
  }
  
  // Clear temporary state
  set({
    abortController: null,
    ui: {
      ...state.ui,
      isLoading: false,
      error: null
    },
    workflow: {
      ...state.workflow,
      reasoning: [],
      status: 'idle'
    }
  });
  
  console.log('✅ Cleanup complete');
},
```

**Add to components**:
```typescript
// Template for all components using chat store
useEffect(() => {
  // Component logic here
  
  // Cleanup on unmount
  return () => {
    useChatStore.getState().cleanup();
  };
}, []);
```

### Task 1.4: Fix SSE Event Pipeline
```bash
# Cursor Command
@workspace Fix the SSE event pipeline in src/app/api/chat/route.ts to preserve event structure. The issue is that events are being transformed and losing their type field.
```

**Fix in route.ts**:
```typescript
// In src/app/api/chat/route.ts
// Replace the event forwarding logic:

for await (const event of streamModeAwareWorkflow(params)) {
  // CRITICAL: Preserve ALL original fields
  // Do NOT transform or rename fields
  const sseData = {
    ...event,  // Spread ALL original fields
    _meta: {   // Add metadata without affecting original
      timestamp: Date.now(),
      source: 'workflow',
      sessionId
    }
  };
  
  // Send exactly as is
  controller.enqueue(
    new TextEncoder().encode(`data: ${JSON.stringify(sseData)}\n\n`)
  );
}
```

---

## PHASE 2: Create Core Architecture

### Task 2.1: Create Directory Structure
```bash
# Cursor Command
@workspace Create the new directory structure for clean architecture. Create all folders under src/ as specified in the architecture document.
```

**Shell script for Cursor to execute**:
```bash
#!/bin/bash
# Create core architecture directories

# Core layer
mkdir -p src/core/domain/entities
mkdir -p src/core/domain/value-objects
mkdir -p src/core/domain/types
mkdir -p src/core/use-cases/agent
mkdir -p src/core/use-cases/chat
mkdir -p src/core/use-cases/workflow
mkdir -p src/core/services/agent-orchestrator
mkdir -p src/core/services/workflow-engine
mkdir -p src/core/services/autonomous-executor
mkdir -p src/core/services/memory-manager
mkdir -p src/core/repositories

# Infrastructure layer
mkdir -p src/infrastructure/api/chat
mkdir -p src/infrastructure/api/agent
mkdir -p src/infrastructure/api/workflow
mkdir -p src/infrastructure/repositories/supabase
mkdir -p src/infrastructure/repositories/in-memory
mkdir -p src/infrastructure/integrations/langchain
mkdir -p src/infrastructure/integrations/openai
mkdir -p src/infrastructure/integrations/rag
mkdir -p src/infrastructure/cache/redis
mkdir -p src/infrastructure/cache/memory
mkdir -p src/infrastructure/monitoring/logger
mkdir -p src/infrastructure/monitoring/metrics
mkdir -p src/infrastructure/monitoring/error-tracking

# Application layer
mkdir -p src/application/controllers
mkdir -p src/application/dto/request
mkdir -p src/application/dto/response
mkdir -p src/application/mappers
mkdir -p src/application/middleware

# Presentation layer
mkdir -p src/presentation/stores/chat
mkdir -p src/presentation/stores/agent
mkdir -p src/presentation/stores/workflow
mkdir -p src/presentation/components/chat
mkdir -p src/presentation/components/agent
mkdir -p src/presentation/components/workflow
mkdir -p src/presentation/components/common
mkdir -p src/presentation/hooks
mkdir -p src/presentation/contexts

# Shared
mkdir -p src/shared/utils
mkdir -p src/shared/constants
mkdir -p src/shared/decorators

# Tests
mkdir -p src/__tests__/unit/core
mkdir -p src/__tests__/unit/infrastructure
mkdir -p src/__tests__/integration
mkdir -p src/__tests__/e2e
mkdir -p src/__tests__/fixtures

echo "✅ Directory structure created"
```

### Task 2.2: Create Core Entities
```bash
# Cursor Command
@workspace Create core domain entities for Agent, Chat, Message, and User in src/core/domain/entities/
```

**Agent Entity**:
```typescript
// src/core/domain/entities/agent.entity.ts
export class Agent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly systemPrompt: string,
    public readonly capabilities: string[],
    public readonly tier: 1 | 2 | 3,
    public readonly knowledgeDomains: string[],
    public readonly model: string,
    public readonly temperature: number,
    public readonly maxTokens: number,
    public readonly ragEnabled: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  canHandleQuery(intent: QueryIntent): boolean {
    return this.capabilities.some(cap => 
      intent.requiredCapabilities.includes(cap)
    );
  }

  matchesDomain(domain: string): boolean {
    return this.knowledgeDomains.includes(domain);
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      tier: this.tier,
      capabilities: this.capabilities,
      knowledgeDomains: this.knowledgeDomains
    };
  }
}
```

### Task 2.3: Create Agent Orchestrator Service
```bash
# Cursor Command
@workspace Create the AgentOrchestrator service in src/core/services/agent-orchestrator/ with intelligent agent selection logic
```

**AgentOrchestrator Service**:
```typescript
// src/core/services/agent-orchestrator/agent-orchestrator.service.ts
import { Agent } from '@/core/domain/entities/agent.entity';
import { IIntentAnalyzer } from './intent-analyzer.interface';
import { IAgentScorer } from './agent-scorer.interface';

export interface AgentSelectionResult {
  selected: Agent | null;
  confidence: number;
  reasoning: string;
  alternatives: Agent[];
}

export class AgentOrchestrator {
  constructor(
    private readonly intentAnalyzer: IIntentAnalyzer,
    private readonly agentScorer: IAgentScorer
  ) {}

  async selectBestAgent(
    query: string,
    availableAgents: Agent[],
    context?: {
      chatHistory?: any[];
      userPreferences?: any;
    }
  ): Promise<AgentSelectionResult> {
    // Step 1: Analyze query intent
    console.log('🔍 Analyzing query intent...');
    const intent = await this.intentAnalyzer.analyze(query);
    
    // Step 2: Score all agents
    console.log('📊 Scoring agents...');
    const scoredAgents = await this.agentScorer.scoreAgents(
      availableAgents,
      intent,
      context
    );
    
    // Step 3: Select best agent
    const bestAgent = scoredAgents[0];
    const alternatives = scoredAgents.slice(1, 4);
    
    console.log(`✅ Selected: ${bestAgent.agent.name} (${bestAgent.score})`);
    
    return {
      selected: bestAgent.agent,
      confidence: bestAgent.score,
      reasoning: bestAgent.reasoning,
      alternatives: alternatives.map(a => a.agent)
    };
  }

  async suggestAgents(
    query: string,
    agents: Agent[],
    count: number = 3
  ): Promise<Agent[]> {
    const intent = await this.intentAnalyzer.analyze(query);
    const scored = await this.agentScorer.scoreAgents(agents, intent);
    return scored.slice(0, count).map(s => s.agent);
  }
}
```

### Task 2.4: Create Workflow Engine
```bash
# Cursor Command
@workspace Create the simplified WorkflowEngine service in src/core/services/workflow-engine/ with clean routing logic
```

**WorkflowEngine Service**:
```typescript
// src/core/services/workflow-engine/workflow-engine.service.ts
export interface WorkflowState {
  query: string;
  agent: Agent | null;
  mode: {
    selection: 'manual' | 'automatic';
    interaction: 'interactive' | 'autonomous';
  };
  context: any;
  response: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  currentStep: string;
  requiresInput: boolean;
  error?: string;
}

export class WorkflowEngine {
  private state: WorkflowState;
  
  async *execute(
    input: WorkflowInput
  ): AsyncGenerator<WorkflowEvent> {
    this.state = this.initializeState(input);
    
    try {
      // Step 1: Agent selection (if needed)
      if (!this.state.agent) {
        yield* this.selectAgent();
      }
      
      // Step 2: Process query
      yield* this.processQuery();
      
      // Step 3: Generate response
      yield* this.generateResponse();
      
      // Step 4: Complete
      yield {
        type: 'complete',
        state: this.state
      };
      
    } catch (error) {
      yield {
        type: 'error',
        error: error.message,
        state: this.state
      };
    }
  }
  
  private async *selectAgent(): AsyncGenerator<WorkflowEvent> {
    yield {
      type: 'reasoning',
      step: 'agent_selection',
      description: 'Selecting best agent for query...'
    };
    
    if (this.state.mode.selection === 'manual') {
      // Wait for user selection
      yield {
        type: 'user_input_required',
        prompt: 'Please select an agent',
        options: await this.getAgentSuggestions()
      };
      
      // Pause until user provides input
      this.state.requiresInput = true;
      return;
    }
    
    // Automatic selection
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.selectBestAgent(
      this.state.query,
      this.availableAgents
    );
    
    this.state.agent = result.selected;
    
    yield {
      type: 'agent_selected',
      agent: result.selected,
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  }
}
```

---

## PHASE 3: Implement Security & Validation

### Task 3.1: Create Validation Schemas
```bash
# Cursor Command
@workspace Create Zod validation schemas for all API requests in src/shared/validation/
```

**Validation Schemas**:
```typescript
// src/shared/validation/chat.schemas.ts
import { z } from 'zod';

export const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long'),
    
  userId: z.string()
    .email('Invalid email format'),
    
  sessionId: z.string()
    .uuid()
    .optional()
    .default(() => crypto.randomUUID()),
    
  agent: z.object({
    id: z.string(),
    name: z.string(),
    display_name: z.string().optional(),
    system_prompt: z.string().max(10000)
  }).nullable(),
  
  interactionMode: z.enum(['manual', 'automatic'])
    .default('automatic'),
    
  autonomousMode: z.boolean()
    .default(false),
    
  selectedTools: z.array(z.string())
    .max(10, 'Too many tools selected')
    .optional()
    .default([]),
    
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  }))
    .max(100, 'Chat history too long')
    .optional()
    .default([])
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Validation middleware
export function validateChatRequest(data: unknown): ChatRequest {
  return ChatRequestSchema.parse(data);
}
```

### Task 3.2: Create Secure Logging
```bash
# Cursor Command
@workspace Create secure logging utilities that remove PII in src/infrastructure/monitoring/logger/
```

**Secure Logger**:
```typescript
// src/infrastructure/monitoring/logger/secure-logger.ts
import crypto from 'crypto';

export class SecureLogger {
  private static sensitiveFields = [
    'password', 'token', 'secret', 'apiKey',
    'email', 'userId', 'sessionId', 'message',
    'ssn', 'creditCard', 'phoneNumber'
  ];
  
  static sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const key in data) {
      const value = data[key];
      const lowerKey = key.toLowerCase();
      
      if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
        if (lowerKey.includes('userid')) {
          sanitized[key] = this.hashValue(value);
        } else if (lowerKey.includes('message')) {
          sanitized[key] = `[${value?.length || 0} chars]`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  private static hashValue(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex')
      .substring(0, 8);
  }
  
  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const sanitized = data ? this.constructor.sanitize(data) : undefined;
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      data: sanitized
    }));
  }
}

export const logger = new SecureLogger();
```

### Task 3.3: Implement Rate Limiting
```bash
# Cursor Command
@workspace Create rate limiting middleware in src/application/middleware/rate-limiter.middleware.ts
```

**Rate Limiter**:
```typescript
// src/application/middleware/rate-limiter.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: NextRequest) => string;
}

class RateLimiter {
  private windows = new Map<string, {
    count: number;
    resetAt: number;
  }>();
  
  constructor(private config: RateLimitConfig) {
    // Cleanup old windows every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  async middleware(req: NextRequest): Promise<NextResponse | null> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    
    let window = this.windows.get(key);
    
    // Create or reset window
    if (!window || window.resetAt < now) {
      window = {
        count: 0,
        resetAt: now + this.config.windowMs
      };
      this.windows.set(key, window);
    }
    
    // Check limit
    if (window.count >= this.config.maxRequests) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((window.resetAt - now) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(this.config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(window.resetAt).toISOString()
          }
        }
      );
    }
    
    // Increment counter
    window.count++;
    
    // Continue to next middleware
    return null;
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, window] of this.windows.entries()) {
      if (window.resetAt < now) {
        this.windows.delete(key);
      }
    }
  }
}

// Create limiters
export const chatLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10,
  keyGenerator: (req) => {
    // Use IP or user ID
    const userId = req.headers.get('x-user-id');
    return userId || req.ip || 'anonymous';
  }
});

export const expensiveLimiter = new RateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 100,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    return `expensive:${userId || req.ip || 'anonymous'}`;
  }
});
```

---

## PHASE 4: Create Tests

### Task 4.1: Setup Testing Framework
```bash
# Cursor Command
@workspace Setup Vitest testing framework with React Testing Library. Create test configuration and sample tests.
```

**Install dependencies**:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @vitest/ui jsdom
```

**Vitest config**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '*.config.ts',
        '*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Task 4.2: Create Unit Tests
```bash
# Cursor Command
@workspace Create unit tests for AgentOrchestrator, WorkflowEngine, and ChatStore
```

**AgentOrchestrator Test**:
```typescript
// src/__tests__/unit/core/services/agent-orchestrator.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockIntentAnalyzer: any;
  let mockAgentScorer: any;
  
  beforeEach(() => {
    mockIntentAnalyzer = {
      analyze: vi.fn()
    };
    
    mockAgentScorer = {
      scoreAgents: vi.fn()
    };
    
    orchestrator = new AgentOrchestrator(
      mockIntentAnalyzer,
      mockAgentScorer
    );
  });
  
  describe('selectBestAgent', () => {
    it('should select the highest scoring agent', async () => {
      // Arrange
      const query = 'What are the symptoms of diabetes?';
      const mockAgents = [
        { id: '1', name: 'Medical Expert', tier: 2 },
        { id: '2', name: 'General Assistant', tier: 1 }
      ];
      
      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'medical',
        requiredCapabilities: ['medical-knowledge']
      });
      
      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.95, reasoning: 'Medical expertise' },
        { agent: mockAgents[1], score: 0.3, reasoning: 'General knowledge' }
      ]);
      
      // Act
      const result = await orchestrator.selectBestAgent(
        query,
        mockAgents
      );
      
      // Assert
      expect(result.selected).toBe(mockAgents[0]);
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBe('Medical expertise');
      expect(result.alternatives).toHaveLength(1);
    });
    
    it('should handle no suitable agents', async () => {
      // Test empty agent list
      const result = await orchestrator.selectBestAgent(
        'test query',
        []
      );
      
      expect(result.selected).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });
});
```

### Task 4.3: Create Integration Tests
```bash
# Cursor Command
@workspace Create integration tests for the complete workflow from API to response
```

**Integration Test**:
```typescript
// src/__tests__/integration/chat-workflow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/chat/route';

describe('Chat Workflow Integration', () => {
  describe('POST /api/chat', () => {
    it('should handle manual mode with agent', async () => {
      // Arrange
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'Hello',
          userId: 'test@example.com',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          agent: {
            id: 'test-agent',
            name: 'Test Agent',
            system_prompt: 'You are a test agent'
          },
          interactionMode: 'manual',
          autonomousMode: false
        }
      });
      
      // Act
      const response = await POST(req);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
    
    it('should reject invalid requests', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields
          message: ''
        }
      });
      
      const response = await POST(req);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });
  });
});
```

---

## PHASE 5: Migration Scripts

### Task 5.1: Create Migration Runner
```bash
# Cursor Command
@workspace Create automated migration scripts to refactor existing code to new architecture
```

**Migration Script**:
```typescript
// scripts/migrate-to-clean-architecture.ts
import fs from 'fs-extra';
import path from 'path';

class ArchitectureMigration {
  private sourceDir = 'src';
  private backupDir = 'src.backup';
  
  async run() {
    console.log('🚀 Starting architecture migration...');
    
    // Step 1: Backup
    await this.createBackup();
    
    // Step 2: Create new structure
    await this.createDirectoryStructure();
    
    // Step 3: Move files
    await this.migrateFiles();
    
    // Step 4: Update imports
    await this.updateImports();
    
    // Step 5: Verify
    await this.verifyMigration();
    
    console.log('✅ Migration complete!');
  }
  
  private async createBackup() {
    console.log('📦 Creating backup...');
    await fs.copy(this.sourceDir, this.backupDir);
  }
  
  private async migrateFiles() {
    const migrations = [
      {
        from: 'src/lib/stores/chat-store.ts',
        to: 'src/presentation/stores/chat/chat.store.ts'
      },
      {
        from: 'src/features/chat/services/ask-expert-graph.ts',
        to: 'src/core/services/workflow-engine/workflow-engine.service.ts'
      },
      {
        from: 'src/app/api/chat/route.ts',
        to: 'src/infrastructure/api/chat/route.ts'
      }
    ];
    
    for (const migration of migrations) {
      if (await fs.pathExists(migration.from)) {
        await fs.move(migration.from, migration.to);
        console.log(`✓ Moved ${migration.from} → ${migration.to}`);
      }
    }
  }
  
  private async updateImports() {
    // Update import paths in all TypeScript files
    const files = await this.getAllTypeScriptFiles();
    
    const importMappings = {
      '@/lib/stores/': '@/presentation/stores/',
      '@/features/chat/services/': '@/core/services/',
      '@/app/api/': '@/infrastructure/api/'
    };
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      let modified = false;
      
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        if (content.includes(oldPath)) {
          content = content.replace(new RegExp(oldPath, 'g'), newPath);
          modified = true;
        }
      }
      
      if (modified) {
        await fs.writeFile(file, content);
        console.log(`✓ Updated imports in ${file}`);
      }
    }
  }
  
  private async getAllTypeScriptFiles(): Promise<string[]> {
    // Recursively find all .ts and .tsx files
    const files: string[] = [];
    
    async function walk(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.match(/\.(ts|tsx)$/)) {
          files.push(fullPath);
        }
      }
    }
    
    await walk(this.sourceDir);
    return files;
  }
  
  private async verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    // Check that key files exist in new locations
    const requiredFiles = [
      'src/core/services/agent-orchestrator/agent-orchestrator.service.ts',
      'src/presentation/stores/chat/chat.store.ts',
      'src/infrastructure/api/chat/route.ts'
    ];
    
    for (const file of requiredFiles) {
      if (!await fs.pathExists(file)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    
    console.log('✅ All required files present');
  }
}

// Run migration
new ArchitectureMigration().run().catch(console.error);
```

---

## PHASE 6: Cursor Automation Commands

### Batch Commands for Cursor

Create a file `.cursor/commands.md` with these commands for Cursor to execute:

```markdown
# Cursor Batch Commands

## Phase 1: Critical Fixes
1. Fix duplicate setInteractionMode in chat-store.ts
2. Consolidate agent state fields into single source
3. Add cleanup method and useEffect cleanup
4. Fix SSE event pipeline to preserve structure
5. Run tests to verify fixes

## Phase 2: Architecture Setup
1. Create directory structure using script
2. Create all domain entities
3. Create service interfaces
4. Create repository interfaces
5. Setup dependency injection

## Phase 3: Security
1. Create Zod validation schemas
2. Implement secure logger
3. Add rate limiting middleware
4. Add input sanitization
5. Remove all console.log with sensitive data

## Phase 4: Testing
1. Setup Vitest configuration
2. Create unit tests for services
3. Create integration tests
4. Create E2E tests
5. Run coverage report

## Phase 5: Migration
1. Run backup script
2. Execute migration script
3. Update all imports
4. Verify build
5. Run all tests

## Phase 6: Documentation
1. Generate API documentation
2. Update README
3. Create CHANGELOG
4. Add JSDoc comments
5. Create architecture diagrams
```

---

## 🎯 Verification Checklist

After each phase, run these verification commands:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test

# Build
npm run build

# Coverage
npm run test:coverage
```

---

## 📊 Progress Tracking

Create `.cursor/progress.md` to track completion:

```markdown
# Implementation Progress

## Phase 1: Critical Fixes ⏳
- [ ] Fix duplicate functions
- [ ] Consolidate state
- [ ] Add cleanup
- [ ] Fix SSE pipeline

## Phase 2: Architecture 🏗️
- [ ] Directory structure
- [ ] Domain entities
- [ ] Services
- [ ] Repositories

## Phase 3: Security 🔐
- [ ] Validation
- [ ] Logging
- [ ] Rate limiting
- [ ] Sanitization

## Phase 4: Testing 🧪
- [ ] Setup
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

## Phase 5: Migration 🔄
- [ ] Backup
- [ ] Migration
- [ ] Import updates
- [ ] Verification

## Phase 6: Documentation 📚
- [ ] API docs
- [ ] README
- [ ] CHANGELOG
- [ ] Comments
```

---

## 🚀 Final Deployment Commands

```bash
# Final verification before deployment
npm run lint && npm run type-check && npm run test && npm run build

# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:e2e

# Deploy to production
npm run deploy:production
```

---

## 🔧 Verification & Monitoring Tools

### Automated Verification Script

Create `.cursor/verify.sh`:

```bash
#!/bin/bash

echo "🔍 Running VITAL Implementation Verification"
echo "==========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Phase 1 Verifications
echo -e "\n${YELLOW}Phase 1: Critical Fixes${NC}"

# Check for duplicate functions
echo -n "1.1 Duplicate functions removed: "
count=$(grep -c "setInteractionMode.*=>" src/lib/stores/chat-store.ts 2>/dev/null || echo 0)
if [ "$count" -eq 1 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (found $count instances)${NC}"
fi

# Check for unified state
echo -n "1.2 State consolidated: "
if grep -q "agent: {" src/lib/stores/chat-store.ts && \
   grep -q "active:" src/lib/stores/chat-store.ts && \
   grep -q "library:" src/lib/stores/chat-store.ts; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Check for cleanup method
echo -n "1.3 Cleanup method exists: "
if grep -q "cleanup.*=>" src/lib/stores/chat-store.ts; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Check TypeScript
echo -n "TypeScript compilation: "
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Check tests
echo -n "Tests passing: "
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (some tests failing)${NC}"
fi

# Check for console.logs with sensitive data
echo -n "PII in logs: "
sensitive_logs=$(grep -r "console.log.*userId\|console.log.*email\|console.log.*sessionId" src/ 2>/dev/null | wc -l)
if [ "$sensitive_logs" -eq 0 ]; then
    echo -e "${GREEN}✓ (none found)${NC}"
else
    echo -e "${RED}✗ ($sensitive_logs potential issues)${NC}"
fi

echo -e "\n==========================================="
echo "Verification complete!"
```

### Progress Tracking Script

Create `.cursor/track-progress.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ProgressTracker {
  constructor() {
    this.progressFile = path.join(__dirname, 'progress.md');
    this.dashboardFile = path.join(__dirname, 'dashboard.md');
  }

  checkTask(phase, task, check) {
    const checks = {
      '1.1': () => this.checkDuplicateFunctions(),
      '1.2': () => this.checkStateConsolidation(),
      '1.3': () => this.checkCleanupMethod(),
      '1.4': () => this.checkSSEPipeline(),
      '2.1': () => this.checkDirectoryStructure(),
      '2.2': () => this.checkDomainEntities(),
      '2.3': () => this.checkAgentOrchestrator(),
      '3.1': () => this.checkValidationSchemas(),
      '3.2': () => this.checkSecureLogging(),
      '3.3': () => this.checkRateLimiting(),
      '4.1': () => this.checkTestSetup(),
      '4.2': () => this.checkUnitTests(),
      '5.1': () => this.checkMigration(),
      '6.1': () => this.checkDocumentation()
    };

    return checks[`${phase}.${task}`]?.() || false;
  }

  checkDuplicateFunctions() {
    const content = fs.readFileSync('src/lib/stores/chat-store.ts', 'utf8');
    const matches = content.match(/setInteractionMode.*=>/g);
    return matches && matches.length === 1;
  }

  checkStateConsolidation() {
    const content = fs.readFileSync('src/lib/stores/chat-store.ts', 'utf8');
    return content.includes('agent: {') && 
           content.includes('active:') &&
           content.includes('library:');
  }

  checkCleanupMethod() {
    const content = fs.readFileSync('src/lib/stores/chat-store.ts', 'utf8');
    return content.includes('cleanup:');
  }

  checkSSEPipeline() {
    const content = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');
    return content.includes('...event') && 
           content.includes('_meta:');
  }

  checkDirectoryStructure() {
    const requiredDirs = [
      'src/core/domain/entities',
      'src/infrastructure/api/chat',
      'src/presentation/stores/chat',
      'src/application/controllers'
    ];
    return requiredDirs.every(dir => fs.existsSync(dir));
  }

  checkDomainEntities() {
    return fs.existsSync('src/core/domain/entities/agent.entity.ts') &&
           fs.existsSync('src/core/domain/entities/chat.entity.ts');
  }

  checkAgentOrchestrator() {
    return fs.existsSync('src/core/services/agent-orchestrator/agent-orchestrator.service.ts');
  }

  checkValidationSchemas() {
    return fs.existsSync('src/shared/validation/chat.schemas.ts');
  }

  checkSecureLogging() {
    return fs.existsSync('src/infrastructure/monitoring/logger/secure-logger.ts');
  }

  checkRateLimiting() {
    return fs.existsSync('src/application/middleware/rate-limiter.middleware.ts');
  }

  checkTestSetup() {
    return fs.existsSync('vitest.config.ts') &&
           fs.existsSync('src/__tests__/setup.ts');
  }

  checkUnitTests() {
    return fs.existsSync('src/__tests__/unit/core/services/agent-orchestrator.test.ts');
  }

  checkMigration() {
    return fs.existsSync('scripts/migrate-to-clean-architecture.ts');
  }

  checkDocumentation() {
    return fs.existsSync('CHANGELOG.md') &&
           fs.readFileSync('README.md', 'utf8').includes('Clean Architecture');
  }

  updateProgress() {
    const tasks = [
      { phase: 1, task: 1, name: 'Fix duplicate functions' },
      { phase: 1, task: 2, name: 'Consolidate state' },
      { phase: 1, task: 3, name: 'Memory cleanup' },
      { phase: 1, task: 4, name: 'Fix SSE pipeline' },
      { phase: 2, task: 1, name: 'Directory structure' },
      { phase: 2, task: 2, name: 'Domain entities' },
      { phase: 2, task: 3, name: 'Agent orchestrator' },
      { phase: 3, task: 1, name: 'Validation schemas' },
      { phase: 3, task: 2, name: 'Secure logging' },
      { phase: 3, task: 3, name: 'Rate limiting' },
      { phase: 4, task: 1, name: 'Test setup' },
      { phase: 4, task: 2, name: 'Unit tests' },
      { phase: 5, task: 1, name: 'Migration' },
      { phase: 6, task: 1, name: 'Documentation' }
    ];

    let completed = 0;
    const results = tasks.map(t => {
      const done = this.checkTask(t.phase, t.task);
      if (done) completed++;
      return `- [${done ? 'x' : ' '}] Phase ${t.phase}.${t.task}: ${t.name}`;
    });

    const percentage = Math.round((completed / tasks.length) * 100);
    
    console.log(`\n📊 Progress: ${percentage}% (${completed}/${tasks.length} tasks)`);
    console.log('═'.repeat(50));
    results.forEach(r => console.log(r));
    
    this.updateDashboard(percentage, completed, tasks.length);
  }

  updateDashboard(percentage, completed, total) {
    const dashboard = `# VITAL Implementation Dashboard

## Overall Progress: ${'▓'.repeat(Math.floor(percentage/10))}${'░'.repeat(10-Math.floor(percentage/10))} ${percentage}%

### Phase Completion
| Phase | Status | Progress | Completed | Total |
|-------|--------|----------|-----------|-------|
| 1. Critical Fixes | ${completed >= 4 ? '✅ Complete' : '🟡 In Progress'} | ${'▓'.repeat(Math.floor((completed/4)*6))}${'░'.repeat(6-Math.floor((completed/4)*6))} | ${Math.min(completed, 4)}/4 | 4 |
| 2. Core Architecture | ${completed >= 7 ? '✅ Complete' : '⏳ Pending'} | ${'▓'.repeat(Math.floor(((completed-4)/3)*6))}${'░'.repeat(6-Math.floor(((completed-4)/3)*6))} | ${Math.max(0, completed-4)}/3 | 3 |
| 3. Security | ${completed >= 10 ? '✅ Complete' : '⏳ Pending'} | ${'▓'.repeat(Math.floor(((completed-7)/3)*6))}${'░'.repeat(6-Math.floor(((completed-7)/3)*6))} | ${Math.max(0, completed-7)}/3 | 3 |
| 4. Testing | ${completed >= 12 ? '✅ Complete' : '⏳ Pending'} | ${'▓'.repeat(Math.floor(((completed-10)/2)*6))}${'░'.repeat(6-Math.floor(((completed-10)/2)*6))} | ${Math.max(0, completed-10)}/2 | 2 |
| 5. Migration | ${completed >= 13 ? '✅ Complete' : '⏳ Pending'} | ${'▓'.repeat(Math.floor(((completed-12)/1)*6))}${'░'.repeat(6-Math.floor(((completed-12)/1)*6))} | ${Math.max(0, completed-12)}/1 | 1 |
| 6. Documentation | ${completed >= 14 ? '✅ Complete' : '⏳ Pending'} | ${'▓'.repeat(Math.floor(((completed-13)/1)*6))}${'░'.repeat(6-Math.floor(((completed-13)/1)*6))} | ${Math.max(0, completed-13)}/1 | 1 |

### Today's Focus
- Current: Phase ${Math.floor(completed/4) + 1} - Task ${(completed % 4) + 1}
- Next: Phase ${Math.floor(completed/4) + 1} - Task ${(completed % 4) + 2}
- Blocker: None

### Metrics
- TypeScript Errors: ${this.getTypeScriptErrors()}
- Test Coverage: ${this.getTestCoverage()}%
- Build Time: ${this.getBuildTime()}s
- Bundle Size: ${this.getBundleSize()}KB

### Recent Commits
${this.getRecentCommits()}
`;

    fs.writeFileSync(this.dashboardFile, dashboard);
    console.log(`\n✅ Dashboard updated: ${percentage}% complete`);
  }

  getTypeScriptErrors() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('npm run type-check 2>&1', { encoding: 'utf8' });
      const errorCount = (output.match(/error TS/g) || []).length;
      return errorCount;
    } catch (e) {
      return 'Unknown';
    }
  }

  getTestCoverage() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('npm run test:coverage 2>&1', { encoding: 'utf8' });
      const match = output.match(/All files\s+\|\s+(\d+\.?\d*)/);
      return match ? Math.round(parseFloat(match[1])) : 0;
    } catch (e) {
      return 0;
    }
  }

  getBuildTime() {
    try {
      const { execSync } = require('child_process');
      const start = Date.now();
      execSync('npm run build', { encoding: 'utf8' });
      return ((Date.now() - start) / 1000).toFixed(1);
    } catch (e) {
      return 'Failed';
    }
  }

  getBundleSize() {
    try {
      const stats = fs.statSync('.next/static/chunks/pages/_app.js');
      return Math.round(stats.size / 1024);
    } catch (e) {
      return 'Unknown';
    }
  }

  getRecentCommits() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('git log --oneline -5', { encoding: 'utf8' });
      return output.split('\n').filter(line => line.trim()).map(line => `- ${line}`).join('\n');
    } catch (e) {
      return '- No recent commits';
    }
  }
}

// Run tracker
const tracker = new ProgressTracker();
tracker.updateProgress();
```

### Daily Execution Template

Create `.cursor/daily-plan.md`:

```markdown
# Daily Execution Plan

## Day 1 (Phase 1: Tasks 1.1-1.2)
- [ ] 9:00 - Fix duplicate functions (30 min)
- [ ] 9:30 - Verify and test (15 min)
- [ ] 9:45 - Consolidate state (2 hours)
- [ ] 11:45 - Test all state methods (30 min)
- [ ] 14:00 - Update components using store (1 hour)
- [ ] 15:00 - Run full test suite
- [ ] 15:30 - Commit changes

## Day 2 (Phase 1: Tasks 1.3-1.4)
- [ ] 9:00 - Add cleanup methods (1 hour)
- [ ] 10:00 - Update all components (1 hour)
- [ ] 11:00 - Fix SSE pipeline (2 hours)
- [ ] 14:00 - Test SSE streaming (1 hour)
- [ ] 15:00 - Integration testing
- [ ] 16:00 - Commit changes

## Day 3 (Phase 2: Tasks 2.1-2.2)
- [ ] 9:00 - Create directory structure (30 min)
- [ ] 9:30 - Create domain entities (2 hours)
- [ ] 11:30 - Create entity tests (1 hour)
- [ ] 14:00 - Create value objects (1 hour)
- [ ] 15:00 - Documentation
- [ ] 16:00 - Commit changes
```

### Troubleshooting Guide

Create `.cursor/troubleshooting.md`:

```markdown
# Troubleshooting Guide

## Issue: Cursor doesn't recognize the commands

**Solution:**
1. Ensure .cursorrules is in project root
2. Restart Cursor
3. Use @workspace prefix for commands
4. Try more specific instructions

## Issue: TypeScript errors after changes

**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check

# If errors persist, check imports
npm run lint -- --fix
```

## Issue: Tests failing after state consolidation

**Solution:**
1. Update test mocks to use new state structure
2. Check that all components are updated
3. Clear test cache: `npm test -- --clearCache`

## Issue: SSE events not streaming

**Solution:**
1. Check browser DevTools Network tab
2. Verify Content-Type is 'text/event-stream'
3. Check for event transformation in pipeline
4. Test with curl: `curl -N http://localhost:3000/api/chat`

## Issue: Memory leaks still occurring

**Solution:**
1. Check all useEffect hooks have cleanup
2. Verify AbortController.abort() is called
3. Use React DevTools Profiler to find leaks
4. Check for unsubscribed event listeners
```

---

## 📋 Complete Execution Checklist

```markdown
# ✅ VITAL Implementation Execution Checklist

## Pre-Implementation
- [ ] Backup entire project
- [ ] Create new git branch: `git checkout -b refactor/clean-architecture`
- [ ] Install Cursor rules and context files
- [ ] Review implementation plan
- [ ] Set up progress tracking

## Phase 1: Critical Fixes (Days 1-2)
- [ ] Task 1.1: Fix duplicate functions
  - [ ] Execute command in Cursor
  - [ ] Verify with grep
  - [ ] Run tests
  - [ ] Update progress
- [ ] Task 1.2: Consolidate state
  - [ ] Create backup
  - [ ] Execute refactor
  - [ ] Update all references
  - [ ] Test thoroughly
- [ ] Task 1.3: Add cleanup
  - [ ] Add cleanup method
  - [ ] Update components
  - [ ] Verify no leaks
- [ ] Task 1.4: Fix SSE
  - [ ] Update pipeline
  - [ ] Test streaming
  - [ ] Verify events

## Phase 2: Core Architecture (Days 3-5)
- [ ] Task 2.1: Create structure
  - [ ] Run mkdir script
  - [ ] Verify structure
- [ ] Task 2.2: Create entities
  - [ ] Create classes
  - [ ] Add methods
  - [ ] Write tests
- [ ] Task 2.3: Create services
  - [ ] AgentOrchestrator
  - [ ] WorkflowEngine
  - [ ] Tests

## Phase 3: Security (Days 6-7)
- [ ] Task 3.1: Validation
  - [ ] Install Zod
  - [ ] Create schemas
  - [ ] Apply to routes
- [ ] Task 3.2: Secure logging
  - [ ] Create SecureLogger
  - [ ] Replace console.logs
  - [ ] Verify no PII
- [ ] Task 3.3: Rate limiting
  - [ ] Create middleware
  - [ ] Apply to routes
  - [ ] Test limits

## Phase 4: Testing (Days 8-9)
- [ ] Task 4.1: Setup
  - [ ] Install Vitest
  - [ ] Configure
- [ ] Task 4.2: Write tests
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests

## Phase 5: Migration (Day 10)
- [ ] Task 5.1: Run migration
  - [ ] Backup
  - [ ] Execute script
  - [ ] Verify structure
  - [ ] Update imports

## Phase 6: Documentation (Day 11)
- [ ] Task 6.1: Update docs
  - [ ] README
  - [ ] CHANGELOG
  - [ ] API docs
  - [ ] Comments

## Post-Implementation
- [ ] Run full test suite
- [ ] Check test coverage (>80%)
- [ ] Performance testing
- [ ] Security audit
- [ ] Create PR
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Smoke tests
- [ ] Deploy to production
- [ ] Monitor metrics
```

---

## 🎯 Success Metrics

After complete execution, you should see:

1. **No duplicate functions** ✅
2. **Single source of truth for state** ✅
3. **No memory leaks** ✅
4. **Working SSE pipeline** ✅
5. **Input validation on all routes** ✅
6. **No PII in logs** ✅
7. **Rate limiting active** ✅
8. **80%+ test coverage** ✅
9. **Clean architecture structure** ✅
10. **Full documentation** ✅

This enhanced plan provides Cursor AI with everything needed to systematically implement all recommendations with comprehensive verification, progress tracking, and troubleshooting support.
