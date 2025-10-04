# Human-in-the-Loop (HITL) Implementation Status

## ✅ What Was Completed

### 1. State Annotation Updated
**File**: [/src/lib/services/langgraph-orchestrator.ts](src/lib/services/langgraph-orchestrator.ts#L74-90)

Added HITL state fields to `OrchestrationStateAnnotation`:
```typescript
// Human-in-the-Loop (HITL) state
interruptReason: Annotation<string | null>({
  reducer: (_, update) => update,
  default: () => null
}),
interruptData: Annotation<any | null>({
  reducer: (_, update) => update,
  default: () => null
}),
humanApproval: Annotation<boolean | null>({
  reducer: (_, update) => update,
  default: () => null
}),
humanFeedback: Annotation<string | null>({
  reducer: (_, update) => update,
  default: () => null
}),
```

**Status**: ✅ **COMPLETE**

---

## ⚠️ What Remains To Implement

### 2. Workflow Compilation with Interrupts
**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Method**: `buildWorkflowFromPattern()`

**What needs to be done**:
```typescript
private buildWorkflowFromPattern(pattern: OrchestrationPattern, enableHITL: boolean = false): StateGraph<any> {
  const workflow = new StateGraph(OrchestrationStateAnnotation);

  // Add nodes
  for (const node of pattern.nodes) {
    const nodeFunction = this.getNodeFunction(node.type, node.config);
    workflow.addNode(node.id, nodeFunction);
  }

  // Add edges (existing code)...

  // NEW: Configure interrupt points
  if (enableHITL) {
    // Find synthesis nodes (or other critical decision points)
    const synthesizeNodes = pattern.nodes.filter(n => n.type === 'synthesize');

    // Compile with interruptBefore for human approval
    return workflow.compile({
      checkpointer: this.checkpointer,
      interruptBefore: synthesizeNodes.map(n => n.id)  // ← Pause before synthesis
    });
  }

  return workflow.compile({ checkpointer: this.checkpointer });
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

### 3. Update `orchestrate()` Method
**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Method**: `orchestrate()`

**What needs to be done**:
```typescript
async orchestrate(params: {
  mode: string;
  question: string;
  personas: string[];
  evidenceSources?: any[];
  customPattern?: OrchestrationPattern;
  threadId?: string;
  enableHITL?: boolean;  // ← NEW parameter
}): Promise<any> {
  // ... existing code ...

  // Build workflow with optional HITL
  const workflow = this.buildWorkflowFromPattern(pattern, params.enableHITL);

  // Compile with interrupt configuration
  const compileOptions: any = { checkpointer: this.checkpointer };

  if (params.enableHITL) {
    // Find nodes that need human approval
    const approvalNodes = pattern.nodes
      .filter(n => n.type === 'synthesize' || n.config?.requiresApproval)
      .map(n => n.id);

    compileOptions.interruptBefore = approvalNodes;
  }

  const app = workflow.compile(compileOptions);

  // Execute workflow
  const result = await app.invoke(/* ... */);

  // Check if workflow was interrupted
  if (result.interruptReason) {
    return {
      interrupted: true,
      interruptReason: result.interruptReason,
      interruptData: result.interruptData,
      threadId: sessionId,
      // Partial results so far
      replies: Array.from(result.replies.values()),
      currentState: result
    };
  }

  // ... rest of existing code ...
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

### 4. Create Approval API Endpoints

#### 4.1 Get Pending Approvals
**File**: `/src/app/api/panel/approvals/route.ts` (NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/approvals - List sessions awaiting human approval
 */
export async function GET(request: NextRequest) {
  try {
    const sessions = await langGraphOrchestrator.listSessions();

    // Filter for sessions with pending interrupts
    const pendingApprovals = sessions.filter(s => s.interrupted);

    return NextResponse.json({
      success: true,
      approvals: pendingApprovals,
      count: pendingApprovals.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

#### 4.2 Submit Approval Decision
**File**: `/src/app/api/panel/approvals/[threadId]/route.ts` (NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * POST /api/panel/approvals/[threadId] - Approve or reject workflow continuation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { approved, feedback } = await request.json();
    const threadId = params.threadId;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required field: approved (boolean)' },
        { status: 400 }
      );
    }

    // Update state with human approval
    const result = await langGraphOrchestrator.updateState(threadId, {
      humanApproval: approved,
      humanFeedback: feedback || null
    });

    // Resume workflow after approval
    if (approved) {
      const resumeResult = await langGraphOrchestrator.resumeSession(threadId);

      return NextResponse.json({
        success: true,
        approved: true,
        resumed: true,
        result: resumeResult
      });
    } else {
      return NextResponse.json({
        success: true,
        approved: false,
        message: 'Workflow rejected by human reviewer',
        feedback
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

### 5. Add `updateState()` Method to Orchestrator
**File**: `/src/lib/services/langgraph-orchestrator.ts`

```typescript
/**
 * Update state for interrupted workflow (for human approval)
 */
async updateState(threadId: string, stateUpdate: Partial<OrchestrationState>): Promise<void> {
  // Get the app for this session
  const checkpoint = await this.checkpointer.get({ configurable: { thread_id: threadId } });

  if (!checkpoint) {
    throw new Error(`No session found with thread ID: ${threadId}`);
  }

  const state = checkpoint.values as OrchestrationState;
  const pattern = this.builtInPatterns.get(state.mode);

  if (!pattern) {
    throw new Error(`Unknown pattern mode: ${state.mode}`);
  }

  // Build and compile workflow
  const workflow = this.buildWorkflowFromPattern(pattern, true); // enable HITL
  const app = workflow.compile({ checkpointer: this.checkpointer });

  // Update the state using LangGraph's updateState method
  await app.updateState(
    { configurable: { thread_id: threadId } },
    stateUpdate
  );
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

### 6. Update Streaming to Handle Interrupts
**File**: `/src/lib/services/langgraph-orchestrator.ts`
**Method**: `orchestrateStream()`

**What needs to be done**:
```typescript
async *orchestrateStream(params: {
  // ... existing params ...
  enableHITL?: boolean;
}): AsyncGenerator<any, void, unknown> {
  // ... existing code ...

  // Compile with optional HITL
  const compileOptions: any = { checkpointer: this.checkpointer };

  if (params.enableHITL) {
    compileOptions.interruptBefore = ['synthesize'];
  }

  const app = workflow.compile(compileOptions);

  // Stream workflow execution
  const stream = app.stream(/* ... */, { configurable: { thread_id: sessionId } });

  for await (const chunk of stream) {
    const nodeName = Object.keys(chunk)[0];
    const state = chunk[nodeName];

    // Check if workflow was interrupted
    if (state.interruptReason) {
      yield {
        type: 'interrupt',
        reason: state.interruptReason,
        data: state.interruptData,
        threadId: sessionId,
        awaitingApproval: true,
        timestamp: new Date().toISOString()
      };

      // Stream ends here, waiting for human approval
      return;
    }

    // ... existing streaming code ...
  }
}
```

**Status**: ❌ **NOT IMPLEMENTED**

---

## 📊 Implementation Completeness

| Component | Status | Completion |
|-----------|--------|------------|
| State Annotation | ✅ Complete | 100% |
| Workflow Compilation | ❌ Not Started | 0% |
| Orchestrate Method | ❌ Not Started | 0% |
| Approval API Endpoints | ❌ Not Started | 0% |
| UpdateState Method | ❌ Not Started | 0% |
| Streaming Integration | ❌ Not Started | 0% |
| Frontend UI | ❌ Not Started | 0% |

**Overall HITL Completion**: ~15% (state fields only)

---

## 🎯 How HITL Works (Once Implemented)

### Workflow Execution Flow

```
1. User starts consultation with enableHITL=true
   POST /api/panel/orchestrate { enableHITL: true, ... }

2. Workflow executes normally
   ├─ Expert consultation
   ├─ Consensus checking
   └─ Ready to synthesize

3. **INTERRUPT** before synthesis
   ├─ Workflow pauses
   ├─ State saved to checkpoint
   ├─ Returns { interrupted: true, threadId, interruptReason }

4. User reviews partial results
   GET /api/panel/sessions/[threadId]

5. User approves or rejects
   POST /api/panel/approvals/[threadId]
   { approved: true, feedback: "Looks good" }

6. Workflow resumes (if approved)
   ├─ updateState() injects approval
   ├─ resumeSession() continues workflow
   └─ Synthesize node executes

7. Final result returned
```

---

## 🔍 Use Cases for HITL

### 1. **Regulatory Compliance**
- Pause before finalizing FDA submission recommendation
- Human reviewer checks citations and evidence
- Approve only if meets regulatory standards

### 2. **High-Stakes Decisions**
- Pause before Go/No-Go decision on $100M+ drug
- Executive reviews panel consensus
- Can reject and request additional expert input

### 3. **Quality Control**
- Pause if panel shows high polarization
- Quality reviewer checks for bias or errors
- Can modify question and restart

### 4. **Budget Approval**
- Pause before expensive clinical trial recommendation
- CFO reviews cost implications
- Approve only if budget allows

---

## 📚 LangGraph Documentation References

- [Interrupt Before Nodes](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/breakpoints/)
- [Update State](https://langchain-ai.github.io/langgraph/reference/graphs/#langgraph.graph.StateGraph.updateState)
- [Human-in-the-Loop Patterns](https://langchain-ai.github.io/langgraph/concepts/#human-in-the-loop)

---

## ✅ Testing Plan (Once Implemented)

### Test 1: Basic Interrupt
```bash
# Start consultation with HITL
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should we pursue Phase 3 trials?",
    "panel": {"members": [...]},
    "mode": "debate",
    "enableHITL": true
  }'

# Response should show: { interrupted: true, threadId: "..." }
```

### Test 2: Approve and Resume
```bash
# Approve the consultation
curl -X POST http://localhost:3000/api/panel/approvals/[THREAD_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "feedback": "Panel consensus looks solid"
  }'

# Should resume and complete synthesis
```

### Test 3: Reject
```bash
# Reject the consultation
curl -X POST http://localhost:3000/api/panel/approvals/[THREAD_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "feedback": "Need more expert input on safety"
  }'

# Should NOT resume workflow
```

---

## 🚀 Next Steps to Complete HITL

### Phase 1: Core Implementation (2-3 hours)
1. Update `buildWorkflowFromPattern()` to support `interruptBefore`
2. Update `orchestrate()` to pass HITL configuration
3. Add `updateState()` method for state modification
4. Test interrupt functionality

### Phase 2: API Endpoints (1-2 hours)
5. Create `/api/panel/approvals/route.ts`
6. Create `/api/panel/approvals/[threadId]/route.ts`
7. Test approval/rejection flow

### Phase 3: Streaming Integration (1 hour)
8. Update `orchestrateStream()` to handle interrupts
9. Emit `interrupt` event type
10. Test streaming + HITL together

### Phase 4: Frontend UI (2-3 hours)
11. Create approval queue UI
12. Add approve/reject buttons
13. Show interrupt reason and partial results
14. Test end-to-end user flow

**Total Estimated Time**: 6-9 hours

---

## 🎉 Benefits Once Complete

- ✅ Regulatory compliance (human oversight required)
- ✅ Quality control (catch errors before finalization)
- ✅ Budget approval (pause for financial review)
- ✅ Risk mitigation (human veto on high-stakes decisions)
- ✅ Audit trail (who approved what and when)
- ✅ Flexibility (modify workflow based on human feedback)

---

**Current Status**: State annotation ready, implementation ~15% complete
**Next Priority**: Implement `buildWorkflowFromPattern()` interrupt configuration
**Documentation**: See [FULL_LANGGRAPH_MIGRATION_PLAN.md](FULL_LANGGRAPH_MIGRATION_PLAN.md) Phase 3
