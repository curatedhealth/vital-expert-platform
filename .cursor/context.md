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