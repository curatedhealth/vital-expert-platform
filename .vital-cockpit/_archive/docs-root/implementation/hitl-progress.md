# HITL (Human-in-the-Loop) Implementation Progress

**Date**: 2025-10-03
**Status**: 40% Complete
**Remaining**: 3-4 hours

---

## ✅ Completed (40%)

### 1. State Fields (15% - from previous session)
**Location**: `/src/lib/services/langgraph-orchestrator.ts` lines 75-90

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

### 2. PatternNode Interface Update (10%)
**Location**: `/src/lib/services/langgraph-orchestrator.ts` line 131

```typescript
export interface PatternNode {
  id: string;
  type: 'consult_parallel' | 'consult_sequential' | 'check_consensus' | 'synthesize' | 'cluster_themes' | 'custom';
  label: string;
  config?: Record<string, any>;
  interruptBefore?: boolean; // ✅ NEW: If true, workflow pauses before executing this node for human approval
}
```

### 3. buildWorkflowFromPattern Updates (15%)
**Location**: `/src/lib/services/langgraph-orchestrator.ts` lines 425-464

```typescript
private buildWorkflowFromPattern(pattern: OrchestrationPattern): StateGraph<any> {
  const workflow = new StateGraph(OrchestrationStateAnnotation);

  // Collect nodes that require human approval (interruptBefore)
  const interruptNodes: string[] = [];

  // Add nodes
  for (const node of pattern.nodes) {
    const nodeFunction = this.getNodeFunction(node.type, node.config);
    workflow.addNode(node.id, nodeFunction);

    // Track nodes with interruptBefore for HITL
    if (node.interruptBefore) {
      interruptNodes.push(node.id);
    }
  }

  // ... rest of method
}
```

---

## ⏭️ Remaining Work (60%)

### 4. Compile with interruptBefore (15%) - NEXT
**Location**: `/src/lib/services/langgraph-orchestrator.ts` lines 181-185 and 299-303

**What to do**: Update both `orchestrate()` and `orchestrateStream()` methods to compile workflow with `interruptBefore` nodes.

**Code to add** (after line 182 in `orchestrate` method):
```typescript
// Build workflow from pattern
const workflow = this.buildWorkflowFromPattern(pattern);

// Collect interrupt nodes for HITL
const interruptNodes = pattern.nodes
  .filter(node => node.interruptBefore)
  .map(node => node.id);

// Compile with checkpointer and interrupt support for HITL
const app = workflow.compile({
  checkpointer: this.checkpointer,
  interruptBefore: interruptNodes.length > 0 ? interruptNodes : undefined
});
```

**Repeat for `orchestrateStream` method** at line 299.

---

### 5. Add updateState Method (15%)
**Location**: Add new method to `LangGraphOrchestrator` class

**Purpose**: Allows injecting human approval/rejection after workflow interruption

```typescript
/**
 * Update state after human approval/rejection (HITL)
 * Used to resume interrupted workflows with human input
 */
async updateState(params: {
  threadId: string;
  updates: Partial<OrchestrationState>;
}): Promise<void> {
  // Get current checkpoint
  const checkpoint = await this.checkpointer.get({
    configurable: { thread_id: params.threadId }
  });

  if (!checkpoint) {
    throw new Error(`No session found with thread ID: ${params.threadId}`);
  }

  // Update state with human input
  const updatedState = {
    ...checkpoint.values,
    ...params.updates
  };

  // Save updated checkpoint
  await this.checkpointer.put(
    { configurable: { thread_id: params.threadId } },
    updatedState,
    { source: 'update', writes: params.updates }
  );
}
```

---

### 6. Create Approval API Endpoints (20%)

#### A. GET /api/panel/approvals
**Location**: Create `/src/app/api/panel/approvals/route.ts`

**Purpose**: List all pending approvals (interrupted sessions)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

export async function GET(request: NextRequest) {
  try {
    // Get all sessions
    const sessions = await langGraphOrchestrator.listSessions();

    // Filter for interrupted sessions (pending approval)
    const pendingApprovals = sessions.filter(session =>
      session.humanGateRequired ||
      session.interruptReason !== null
    );

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

---

#### B. POST /api/panel/approvals/[threadId]
**Location**: Create `/src/app/api/panel/approvals/[threadId]/route.ts`

**Purpose**: Submit approval or rejection for interrupted workflow

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const body = await request.json();
    const { approved, feedback } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'approved field must be boolean' },
        { status: 400 }
      );
    }

    // Update state with human decision
    await langGraphOrchestrator.updateState({
      threadId: params.threadId,
      updates: {
        humanApproval: approved,
        humanFeedback: feedback || null,
        interruptReason: null // Clear interrupt
      }
    });

    // Resume session with approval decision
    const result = await langGraphOrchestrator.resumeSession(params.threadId);

    return NextResponse.json({
      success: true,
      threadId: params.threadId,
      approved,
      result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### 7. Update Streaming for Interrupt Events (10%)
**Location**: `/src/lib/services/langgraph-orchestrator.ts` in `orchestrateStream` method

**What to do**: Emit special interrupt event when workflow pauses

```typescript
async *orchestrateStream(params: {
  // ... existing params
}): AsyncGenerator<any, void, unknown> {
  // ... existing code

  for await (const chunk of stream) {
    const nodeName = Object.keys(chunk)[0];
    const state = chunk[nodeName];

    // Check if workflow is interrupted (HITL)
    if (state.interruptReason) {
      yield {
        type: 'interrupt',
        node: nodeName,
        sessionId,
        threadId: sessionId,
        reason: state.interruptReason,
        data: state.interruptData,
        requiresApproval: true,
        timestamp: new Date().toISOString()
      };

      // Don't yield 'complete' - workflow is paused
      return;
    }

    // ... existing yield logic
  }
}
```

---

## 🧪 Testing Checklist

Once implementation is complete, test the following flow:

### Test Case 1: Interrupt Before Synthesis
1. Create a pattern with `interruptBefore: true` on synthesize node
2. Start orchestration
3. Verify workflow pauses before synthesis
4. Check `/api/panel/approvals` shows pending approval
5. POST approval with `approved: true`
6. Verify workflow resumes and completes

### Test Case 2: Rejection Flow
1. Start workflow with interrupt
2. POST approval with `approved: false` and feedback
3. Verify workflow terminates with rejection reason
4. Check final state includes human feedback

### Test Case 3: Streaming with Interrupts
1. Use `orchestrateStream` with interrupt pattern
2. Verify 'interrupt' event is emitted
3. Verify 'complete' event NOT emitted until approval
4. Resume and verify completion

---

## 📊 Completion Estimate

| Task | Status | Time |
|------|--------|------|
| State fields | ✅ Complete | - |
| PatternNode interface | ✅ Complete | - |
| buildWorkflowFromPattern updates | ✅ Complete | - |
| Compile with interruptBefore | ⏭️ Next | 1 hour |
| updateState method | ⏭️ Pending | 1 hour |
| Approval API endpoints | ⏭️ Pending | 1-1.5 hours |
| Streaming interrupt events | ⏭️ Pending | 0.5 hour |
| Testing | ⏭️ Pending | 0.5 hour |
| **TOTAL REMAINING** | | **3-4 hours** |

---

## 🎯 Next Steps

1. **Update compile calls** in `orchestrate()` and `orchestrateStream()` to include `interruptBefore` nodes
2. **Add `updateState()` method** to LangGraphOrchestrator class
3. **Create approval API endpoints**:
   - `/src/app/api/panel/approvals/route.ts`
   - `/src/app/api/panel/approvals/[threadId]/route.ts`
4. **Update streaming** to emit interrupt events
5. **Test interrupt → approve → resume flow**

---

**File**: HITL_IMPLEMENTATION_PROGRESS.md
**Last Updated**: 2025-10-03
**Current Status**: 40% complete, 3-4 hours remaining
