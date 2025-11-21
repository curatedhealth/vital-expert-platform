# Prompt Input Component Verification & Fixes

## Current Status Analysis

### 1. LangGraph Button Purpose ✅

**Location**: `apps/digital-health-startup/src/components/prompt-input.tsx` (lines 368-382)

**Purpose**:
- Toggle button to enable/disable LangGraph workflow orchestration
- When `useLangGraph=true`: Routes to LangGraph mode handlers (via `langgraph-mode-orchestrator.ts`)
- When `useLangGraph=false`: Routes to standard mode handlers (Mode1, Mode2, etc.)
- Currently disabled by default (`useLangGraph = false`)

**Code**:
```typescript
{onUseLangGraphChange && (
  <button
    onClick={() => onUseLangGraphChange(!useLangGraph)}
    className={...}
    title={useLangGraph ? 'LangGraph: ON - Workflow orchestration with state management' : 'LangGraph: OFF - Standard mode'}
  >
    <Sparkles className="w-3 h-3" />
    LangGraph
  </button>
)}
```

**Status**: ✅ **WORKING** - Button is functional, but need to verify it's being used correctly

---

### 2. Tool Selector - Current Implementation ❌

**Location**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` (lines 325-343)

**Current Implementation**:
```typescript
const availableTools = useMemo(() => {
  if (!selectedAgents.length) {
    return [] as string[];
  }

  const toolSet = new Set<string>();
  selectedAgents.forEach((agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent?.tools && Array.isArray(agent.tools)) {
      agent.tools.forEach((tool) => {
        if (typeof tool === 'string' && tool.trim().length > 0) {
          toolSet.add(tool.trim());
        }
      });
    }
  });

  return Array.from(toolSet).sort((a, b) => a.localeCompare(b));
}, [agents, selectedAgents]);
```

**Problem**: 
- ❌ Only reads from `agents.tools` JSON column
- ❌ Does NOT fetch from `agent_tools` or `agent_tool_assignments` tables
- ❌ Missing tools assigned via database relationships

**Database Tables**:
- `agents.tools` - JSON array of tool names (legacy)
- `agent_tools` - Relationship table (agent_id, tool_id)
- `agent_tool_assignments` - Advanced assignment table with priority, enabled status, etc.
- `dh_tool` - Tool registry with full tool details

**Fix Required**: 
- ✅ Fetch tools from `agent_tools` table via Supabase
- ✅ Include tools from `agent_tool_assignments` table (if exists)
- ✅ Fallback to `agents.tools` JSON column for backward compatibility

---

### 3. Selected Tools & LangGraph Integration ⚠️

**Frontend** (`apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` line 828):
```typescript
requestedTools: enableTools ? selectedTools : undefined,
```

**API Route** (`apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts` line 173):
```typescript
requestedTools: body.requestedTools,
```

**Standard Mode Handlers** (Mode1, Mode2, etc.):
- ✅ `requestedTools` is passed to mode handlers
- ✅ Mode handlers pass to AI Engine via `enable_tools` and tool parameters

**LangGraph Mode Handler** (`apps/digital-health-startup/src/features/chat/services/langgraph-mode-orchestrator.ts`):
- ⚠️ **NEEDS VERIFICATION** - Check if `requestedTools` is passed to LangGraph workflows

**AI Engine Workflows** (`services/ai-engine/src/langgraph_workflows/`):
- ✅ Workflows accept `available_tools` parameter
- ✅ `Mode2InteractiveManualWorkflow` uses `agent_tools` from database (line 619)
- ✅ `Mode3AutonomousAutoWorkflow` uses `agent_tools` from database (line 573)
- ✅ `Mode4AutonomousManualWorkflow` uses `agent_tools` from database (line 586)
- ⚠️ `Mode1InteractiveAutoWorkflow` uses hardcoded tools (line 576) - **NEEDS FIX**

**Status**: 
- ✅ Selected tools ARE passed to workflows
- ⚠️ But workflows prefer database `agent_tools` over frontend `selected_tools`
- ⚠️ Need to ensure frontend `selected_tools` override database tools when specified

---

## Fixes Required

### Fix 1: Update Tool Selector to Fetch from Database ✅

**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Change**: Replace `availableTools` useMemo to fetch from database

### Fix 2: Verify LangGraph Uses Selected Tools ✅

**File**: `apps/digital-health-startup/src/features/chat/services/langgraph-mode-orchestrator.ts`

**Change**: Ensure `requestedTools` is passed to LangGraph workflows

### Fix 3: Update Mode1 Workflow to Use Database Tools ✅

**File**: `services/ai-engine/src/langgraph_workflows/mode1_interactive_auto_workflow.py`

**Change**: Replace hardcoded tools with database-backed tool registry

---

## Database Schema

### Tables Used:
1. **`agents`** - Agent definitions
   - `id` (uuid)
   - `tools` (jsonb) - Legacy tool names array
   
2. **`agent_tools`** - Agent-Tool relationships
   - `agent_id` (text)
   - `tool_id` (uuid)
   - `is_enabled` (boolean)
   - `priority` (integer)
   
3. **`agent_tool_assignments`** - Advanced assignments (if exists)
   - `agent_id` (uuid)
   - `tool_id` (uuid)
   - `is_enabled` (boolean)
   - `priority` (integer)
   
4. **`dh_tool`** - Tool registry
   - `id` (uuid)
   - `name` (text)
   - `code` (text)
   - `is_active` (boolean)

---

## Next Steps

1. ✅ Fix tool selector to fetch from database
2. ✅ Verify LangGraph button functionality
3. ✅ Ensure selected tools are used by LangGraph workflows
4. ✅ Update Mode1 workflow to use database tools instead of hardcoded

