# Phase 7: Testing & Quality Assurance - Implementation Plan

**Date:** January 29, 2025  
**Status:** 📋 **READY TO BEGIN**  
**Target:** 80%+ Test Coverage

---

## Current Testing Status

### ✅ Existing Infrastructure
- Jest configuration (`jest.config.js`)
- Vitest test files (some basic tests exist)
- Playwright E2E config (`playwright.config.ts`)
- Test setup file (`__tests__/setup.ts`)

### ⚠️ Gaps to Address
- Many tests are TODOs/stubs
- Unit test coverage is low
- Integration tests incomplete
- E2E tests need implementation
- No coverage reporting configured

---

## Phase 7 Implementation Tasks

### 7.1 Unit Tests (Target: 80%+ Coverage)

#### Priority 1: Core Services
- [ ] **Agent Selector Service** (`agent-selector-service.ts`)
  - `findCandidateAgents()` - GraphRAG search, fallback behavior
  - `rankAgents()` - Ranking algorithm
  - `selectBestAgent()` - End-to-end selection workflow
  - Circuit breaker integration
  - Error handling

- [ ] **Agent Metrics Service** (`agent-metrics-service.ts`)
  - `recordOperation()` - Metric recording with validation
  - `getMetrics()` - Query filtering and aggregation
  - `getAggregatedMetrics()` - Time range calculations
  - Zod validation

- [ ] **Agent Graph Service** (`agent-graph-service.ts`)
  - `createRelationship()` - Relationship creation
  - `findCollaborators()` - Graph traversal
  - `buildAgentTeam()` - Team building
  - `addKnowledgeNode()` - Knowledge graph operations

- [ ] **Deep Agent System** (`deep-agent-system.ts`)
  - `chainOfThought()` - Reasoning chain generation
  - `selfCritique()` - Self-evaluation
  - `delegateToChildren()` - Delegation mechanism

#### Priority 2: Advanced Patterns
- [ ] **Tree of Thoughts** (`patterns/tree-of-thoughts.ts`)
  - `expand()` - Thought expansion
  - `evaluate()` - Path scoring
  - `prune()` - Branch removal
  - `selectBestPath()` - Path selection

- [ ] **Constitutional AI** (`patterns/constitutional-ai.ts`)
  - `constitutionalReview()` - Principle checking
  - `reviseResponse()` - Violation correction
  - Healthcare constitution validation

- [ ] **Adversarial Agents** (`patterns/adversarial-agents.ts`)
  - Debate round execution
  - Critique refinement
  - Judge decision logic

- [ ] **Mixture of Experts** (`patterns/mixture-of-experts.ts`)
  - Expert routing
  - Response synthesis
  - Multi-expert coordination

#### Priority 3: Mode Handlers
- [ ] **Mode 1 Handler** (`mode1-manual-interactive.ts`)
  - Execution path determination
  - RAG retrieval
  - Tool execution
  - Metrics recording

- [ ] **Mode 2 Handler** (`mode2-automatic-agent-selection.ts`)
  - Agent selection workflow
  - Candidate agent search
  - Ranking logic

- [ ] **Mode 3 Handler** (`mode3-autonomous-automatic.ts`)
  - Goal understanding
  - ReAct loop execution
  - Iteration management

---

### 7.2 Integration Tests

#### Priority 1: API Endpoints
- [ ] **Agent CRUD API** (`/api/agents-crud`)
  - GET - List agents with tenant filtering
  - POST - Create agent with ownership
  - Permission validation
  - Tenant isolation

- [ ] **Agent Individual API** (`/api/agents/[id]`)
  - GET - Fetch single agent
  - PUT - Update agent (ownership check)
  - DELETE - Delete agent (ownership check)

- [ ] **Agent Search API** (`/api/agents/search`)
  - GraphRAG search flow
  - Fallback to database
  - Response formatting

- [ ] **Analytics API** (`/api/analytics/agents`)
  - Database query
  - Prometheus integration
  - Aggregation calculations
  - Mode metrics

#### Priority 2: Authentication & Authorization
- [ ] **Agent Auth Middleware** (`middleware/agent-auth.ts`)
  - `verifyAgentPermissions()` - Permission checks
  - `withAgentAuth()` - HOC integration
  - Tenant isolation
  - Admin bypass

- [ ] **Prompt Auth Middleware** (`middleware/prompt-auth.ts`)
  - Permission verification
  - Ownership validation

#### Priority 3: GraphRAG Workflow
- [ ] **GraphRAG Search Flow**
  - Vector search → Graph traversal → Result fusion
  - Fallback mechanisms
  - Circuit breaker behavior
  - Cache integration

- [ ] **Agent Relationship Graph**
  - Relationship creation
  - Multi-hop traversal
  - Knowledge graph queries

---

### 7.3 E2E Tests

#### Priority 1: Core User Flows
- [ ] **Agent Management Flow**
  - User creates agent → Updates agent → Deletes agent
  - Permission denied scenarios
  - Tenant isolation verification

- [ ] **Agent Selection Flow**
  - Mode 2: Automatic selection → Execution
  - GraphRAG success path
  - GraphRAG fallback path
  - Database fallback path

- [ ] **Chat Workflow**
  - Mode 1: Manual agent selection → Chat interaction
  - Mode 3: Autonomous reasoning → Multi-turn conversation
  - RAG context retrieval
  - Tool execution

- [ ] **Analytics Dashboard**
  - Dashboard loads with real data
  - Time range filtering
  - Mode-specific metrics display
  - GraphRAG metrics display

#### Priority 2: Error Scenarios
- [ ] **Authentication Failures**
  - Unauthenticated requests
  - Invalid tokens
  - Permission denied

- [ ] **Service Failures**
  - GraphRAG service down → Fallback
  - Database connection failure
  - LLM API timeout

---

### 7.4 Test Infrastructure Enhancements

#### Coverage Reporting
- [ ] Configure coverage tools (Vitest coverage or Istanbul)
- [ ] Set up coverage thresholds (80% minimum)
- [ ] Generate coverage reports (HTML + terminal)
- [ ] Integrate with CI/CD

#### Test Utilities
- [ ] Mock factory for agents
- [ ] Mock factory for Supabase clients
- [ ] Mock factory for LLM responses
- [ ] Test database setup/teardown
- [ ] Authentication helpers for tests

#### CI/CD Integration
- [ ] GitHub Actions workflow for tests
- [ ] Coverage upload (Codecov/CodeClimate)
- [ ] Test result reporting
- [ ] Fail build if coverage drops below threshold

---

## Implementation Strategy

### Week 1: Unit Tests (Core Services)
**Goal:** 80%+ coverage on critical services

1. Agent Metrics Service (highest priority - just implemented)
2. Agent Selector Service (core functionality)
3. Agent Graph Service (relationship management)
4. Deep Agent base classes (reasoning patterns)

### Week 2: Unit Tests (Patterns & Modes)
**Goal:** Complete all unit tests

1. Advanced patterns (ToT, Constitutional AI, etc.)
2. Mode handlers (Mode 1, 2, 3)
3. Authentication middleware
4. Utility services

### Week 3: Integration Tests
**Goal:** API endpoints and workflows

1. Agent CRUD API
2. Agent Search API
3. Analytics API
4. Authentication flow
5. GraphRAG workflow

### Week 4: E2E Tests & Infrastructure
**Goal:** End-to-end coverage and CI/CD

1. Complete E2E test scenarios
2. Coverage reporting setup
3. CI/CD integration
4. Documentation

---

## Success Metrics

### Coverage Targets
- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user flows covered

### Quality Targets
- Zero flaky tests
- All tests passing in CI
- Fast test execution (<5 minutes total)
- Clear test failure messages

---

## Test File Structure

```
apps/digital-health-startup/src/__tests__/
├── unit/
│   ├── services/
│   │   ├── agent-selector-service.test.ts
│   │   ├── agent-metrics-service.test.ts
│   │   ├── agent-graph-service.test.ts
│   │   ├── deep-agent-system.test.ts
│   │   └── ...
│   ├── patterns/
│   │   ├── tree-of-thoughts.test.ts
│   │   ├── constitutional-ai.test.ts
│   │   ├── adversarial-agents.test.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── agent-auth.test.ts
│   │   └── prompt-auth.test.ts
│   └── handlers/
│       ├── mode1-manual-interactive.test.ts
│       ├── mode2-automatic-agent-selection.test.ts
│       └── mode3-autonomous-automatic.test.ts
├── integration/
│   ├── api/
│   │   ├── agents-crud.test.ts
│   │   ├── agents-search.test.ts
│   │   ├── agents-individual.test.ts
│   │   └── analytics-agents.test.ts
│   ├── workflows/
│   │   ├── graphrag-workflow.test.ts
│   │   └── agent-selection-workflow.test.ts
│   └── auth/
│       └── permission-system.test.ts
└── e2e/
    ├── agent-management.e2e.test.ts
    ├── chat-workflow.e2e.test.ts
    └── analytics-dashboard.e2e.test.ts
```

---

## Next Steps

1. **Start with Unit Tests** - Focus on newly implemented services
2. **Prioritize by Risk** - Test critical paths first
3. **Incremental Approach** - Complete one service at a time
4. **Measure Coverage** - Track progress with coverage reports

---

**Ready to begin Phase 7!**

