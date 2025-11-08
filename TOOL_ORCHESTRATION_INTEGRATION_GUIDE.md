# Tool Orchestration System - Integration Guide

**Version:** 1.0  
**Date:** November 8, 2025  
**Author:** VITAL AI Platform Team

---

## 📖 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [How to Add a New Tool](#how-to-add-a-new-tool)
6. [How to Test](#how-to-test)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

---

## 🎯 OVERVIEW

The Tool Orchestration System enables the AI to intelligently suggest, execute, and display results from external tools (web search, PubMed, FDA, etc.) during Mode 1 consultations.

### **Key Features**
- ✅ **Smart Tool Suggestion** - GPT-4 analyzes queries to recommend relevant tools
- ✅ **User Control** - Expensive/slow tools require user approval
- ✅ **Parallel Execution** - Multiple tools run simultaneously  
- ✅ **Real-time Progress** - Live updates via SSE streaming
- ✅ **Formatted Results** - Tool-specific display (links, articles, tables)
- ✅ **Cost Tracking** - Transparent pricing for each tool

### **Components**
```
Backend (Python)          Frontend (React/TypeScript)
├── ToolMetadata          ├── ToolConfirmation (modal)
├── ToolSuggestionService ├── ToolExecutionStatus (progress)
├── ToolExecutionService  └── ToolResults (display)
└── LangGraph Nodes
```

---

## 🏗️ ARCHITECTURE

### **Data Flow**

```
1. User Query
    ↓
2. RAG Retrieval (existing)
    ↓
3. Tool Suggestion Node (NEW)
   - GPT-4 analyzes query
   - Suggests relevant tools
   - Determines if confirmation needed
    ↓
4. Conditional Edge (NEW)
   ├─ [Needs Confirmation] → Wait for user approval
   └─ [No Confirmation] → Execute immediately
    ↓
5. Tool Execution Node (NEW)
   - Parallel execution
   - Progress updates
   - Result formatting
    ↓
6. Agent Execution (existing)
   - Uses tool results
   - Generates response
    ↓
7. Format Output (existing)
```

### **SSE Event Flow**

```typescript
Backend Event              Frontend Handler
───────────────────────────────────────────────
tool_suggestion         → ToolConfirmation.show()
                           (if needs_confirmation)

tool_execution_start    → ToolExecutionStatus.start()

tool_execution_progress → ToolExecutionStatus.update()

tool_execution_result   → ToolResults.add()

tool_execution_complete → ToolExecutionStatus.complete()
```

---

## 🔧 BACKEND SETUP

### **1. Tool Metadata** (`services/ai-engine/src/models/tool_metadata.py`)

Define a new tool in `TOOL_REGISTRY`:

```python
from models.tool_metadata import ToolMetadata, ToolCategory, ToolCostTier, ToolExecutionSpeed

TOOL_REGISTRY["my_tool"] = ToolMetadata(
    name="my_tool",
    display_name="My Custom Tool",
    description="What this tool does",
    icon="tool",
    category=ToolCategory.RESEARCH,
    cost_tier=ToolCostTier.LOW,
    speed=ToolExecutionSpeed.FAST,
    requires_confirmation=False,  # Set True for expensive tools
    requires_api_key=True,
    supports_streaming=False,
    rate_limit_per_minute=10,
    max_input_length=1000,
    estimated_duration_seconds=3.0,
    required_params=["query"],
    optional_params=["limit"],
    example_inputs=[
        {"query": "example search", "limit": 5}
    ],
    example_outputs=[
        {"type": "search_results", "results": [...]}
    ],
    is_enabled=True,
    is_beta=False
)
```

### **2. Tool Executor** (`services/ai-engine/src/services/tool_execution_service.py`)

Implement the tool logic in `ToolExecutionService`:

```python
class ToolExecutionService:
    def _load_tool_executors(self) -> Dict[str, Callable]:
        return {
            "my_tool": self._execute_my_tool,
            # ... other tools
        }
    
    async def _execute_my_tool(
        self,
        parameters: Dict[str, Any],
        state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute my custom tool"""
        try:
            query = parameters.get("query", "")
            limit = parameters.get("limit", 5)
            
            # Your tool logic here
            results = await self._perform_search(query, limit)
            
            return {
                "type": "my_tool_results",
                "results": results,
                "summary": f"Found {len(results)} results"
            }
        except Exception as e:
            logger.error(f"❌ [My Tool] Error: {e}")
            raise
```

### **3. LangGraph Integration** (Already done)

The tool nodes are already integrated:
- `tool_suggestion_node` - Suggests tools
- `tool_execution_node` - Executes tools
- Workflow edges are configured

---

## 💻 FRONTEND SETUP

### **1. Component Usage**

All three components are already integrated in `apps/.../ask-expert/page.tsx`.

**ToolConfirmation:**
```typescript
<ToolConfirmation
  open={toolConfirmation.isOpen}
  tools={toolConfirmation.tools}
  message={toolConfirmation.message}
  reasoning={toolConfirmation.reasoning}
  onApprove={toolConfirmation.handleApprove}
  onDecline={toolConfirmation.handleDecline}
/>
```

**ToolExecutionStatus:**
```typescript
{toolExecutionStatus.tools.length > 0 && (
  <ToolExecutionStatusComponent
    tools={toolExecutionStatus.tools}
    showProgress={true}
  />
)}
```

**ToolResults:**
```typescript
{toolResults.length > 0 && (
  <ToolResults
    results={toolResults}
    showCost={true}
    defaultExpanded={false}
  />
)}
```

### **2. SSE Event Handlers** (Already integrated)

Events are handled in the `handleSend` SSE processing loop around line 1363.

---

## ➕ HOW TO ADD A NEW TOOL

### **Step 1: Define Tool Metadata**

Edit `services/ai-engine/src/models/tool_metadata.py`:

```python
TOOL_REGISTRY["calculator"] = ToolMetadata(
    name="calculator",
    display_name="Calculator",
    description="Perform mathematical calculations",
    icon="calculator",
    category=ToolCategory.UTILITY,
    cost_tier=ToolCostTier.FREE,
    speed=ToolExecutionSpeed.INSTANT,
    requires_confirmation=False,
    estimated_duration_seconds=0.1,
    required_params=["expression"],
    example_inputs=[
        {"expression": "2 + 2"}
    ]
)
```

### **Step 2: Implement Executor**

Edit `services/ai-engine/src/services/tool_execution_service.py`:

```python
async def _execute_calculator(
    self,
    parameters: Dict[str, Any],
    state: Dict[str, Any]
) -> Dict[str, Any]:
    expression = parameters.get("expression", "")
    
    try:
        # Use safe eval or math library
        result = eval(expression, {"__builtins__": {}}, {})
        
        return {
            "type": "calculation",
            "expression": expression,
            "result": result
        }
    except Exception as e:
        raise ToolExecutionError(f"Invalid expression: {e}")
```

Register it:

```python
def _load_tool_executors(self) -> Dict[str, Callable]:
    return {
        "calculator": self._execute_calculator,
        # ... other tools
    }
```

### **Step 3: Add Frontend Formatter** (Optional)

Edit `apps/.../components/ToolResults.tsx` to add custom display:

```typescript
function CalculatorResults({ data }: { data: any }) {
  return (
    <Card className="p-4 bg-primary/5">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {data.expression}
        </div>
        <div className="text-2xl font-bold">
          = {data.result}
        </div>
      </div>
    </Card>
  );
}
```

And use it in `renderResult()`:

```typescript
case 'calculation':
  return <CalculatorResults data={result.result} />;
```

### **Step 4: Test**

1. Restart AI engine: `cd services/ai-engine && python3 src/main.py`
2. Test query: "Calculate 15 * 23"
3. Verify tool suggestion, execution, and results display

---

## 🧪 HOW TO TEST

### **1. Backend Testing**

```bash
# Start AI engine
cd services/ai-engine
python3 src/main.py

# Check logs
tail -f ai-engine.log | grep "Tool"
```

**Test Queries:**
- ❓ "What are the latest FDA guidelines?" → Suggests web_search
- ❓ "Find research on ADHD treatment" → Suggests pubmed_search
- ❓ "Calculate the BMI for 70kg and 1.75m" → Suggests calculator

### **2. Frontend Testing**

```bash
# Start Next.js dev server
cd apps/digital-health-startup
pnpm dev
```

**Test Checklist:**
- [ ] ToolConfirmation modal appears for expensive tools
- [ ] Modal shows correct tool details, cost, duration
- [ ] Approve button sends approval to backend
- [ ] Decline button skips tool execution
- [ ] ToolExecutionStatus shows during execution
- [ ] Progress bars animate 0% → 100%
- [ ] ToolResults display after completion
- [ ] Results are collapsible
- [ ] Tool-specific formatting works
- [ ] Dark mode works
- [ ] Multiple tools work together

### **3. Integration Testing**

**Test Case 1: Free Tool (No Confirmation)**
```
Query: "Find CRISPR research"
Expected:
  1. No confirmation modal
  2. Immediate execution
  3. Progress indicator
  4. PubMed results displayed
```

**Test Case 2: Expensive Tool (With Confirmation)**
```
Query: "What are the latest FDA guidelines?"
Expected:
  1. ToolConfirmation modal appears
  2. Shows web_search, cost $0.005
  3. User clicks Approve
  4. Progress indicator 0% → 100%
  5. Web search results with links
```

**Test Case 3: Multiple Tools**
```
Query: "Find research and calculate success rate"
Expected:
  1. Suggests pubmed_search + calculator
  2. Both execute in parallel
  3. Both results displayed
```

**Test Case 4: Declined Confirmation**
```
Query: "What are the latest FDA guidelines?"
Expected:
  1. Modal appears
  2. User clicks Decline
  3. Tools skipped
  4. AI continues without tool results
```

---

## 🔍 TROUBLESHOOTING

### **Problem: Modal doesn't appear**

**Check:**
1. Tool has `requires_confirmation=True` in metadata?
2. Tool cost is > $0?
3. Console shows `tool_suggestion` event?

**Fix:**
```python
# In tool_metadata.py
TOOL_REGISTRY["my_tool"] = ToolMetadata(
    ...
    requires_confirmation=True,  # ✅ Set this
    cost_tier=ToolCostTier.MEDIUM,  # ✅ Not FREE
)
```

### **Problem: Progress doesn't update**

**Check:**
1. Backend emitting `tool_execution_progress` events?
2. Frontend SSE handler processing events?

**Fix:**
```python
# In tool_execution_service.py
async def _execute_single_tool(...):
    # Emit progress events
    await self._emit_progress(tool_name, 0)
    # ... do work ...
    await self._emit_progress(tool_name, 50)
    # ... more work ...
    await self._emit_progress(tool_name, 100)
```

### **Problem: Results don't display**

**Check:**
1. Tool returns correct format?
2. Frontend receives `tool_execution_result` event?
3. Result stored in `toolResults` state?

**Fix:**
```python
# Ensure tool returns this structure
return {
    "type": "my_tool_results",  # ✅ Must have type
    "results": [...],           # ✅ Your data
    "summary": "..."            # ✅ Optional summary
}
```

### **Problem: Linter errors**

The page.tsx file has pre-existing encoding issues with special characters. These don't affect functionality. To fix:

```bash
# Clean Next.js cache
rm -rf apps/digital-health-startup/.next
pnpm dev
```

---

## 📚 API REFERENCE

### **Backend Models**

**ToolMetadata:**
```python
class ToolMetadata(BaseModel):
    name: str
    display_name: str
    description: str
    icon: str = "tool"
    category: ToolCategory
    cost_tier: ToolCostTier
    speed: ToolExecutionSpeed
    requires_confirmation: bool = False
    requires_api_key: bool = False
    supports_streaming: bool = False
    rate_limit_per_minute: Optional[int] = None
    max_input_length: Optional[int] = None
    estimated_duration_seconds: float = 5.0
    required_params: List[str] = []
    optional_params: List[str] = []
    example_inputs: List[Dict[str, Any]] = []
    example_outputs: List[Dict[str, Any]] = []
    is_enabled: bool = True
    is_beta: bool = False
```

**ToolExecutionRequest:**
```python
class ToolExecutionRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    user_approved: bool = False
    priority: int = 0
```

**ToolExecutionResult:**
```python
class ToolExecutionResult(BaseModel):
    tool: str
    status: Literal["success", "error", "timeout"]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    duration_seconds: float
    cost: float
    timestamp: str
```

### **Frontend Types**

**ToolSuggestion:**
```typescript
interface ToolSuggestion {
  tool_name: string;
  display_name?: string;
  description?: string;
  confidence: number;
  reasoning: string;
  parameters: Record<string, any>;
  cost_tier?: 'free' | 'low' | 'medium' | 'high';
  estimated_cost?: number;
  estimated_duration?: number;
}
```

**ToolExecutionStatus:**
```typescript
type ToolExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'timeout';

interface ExecutingTool {
  tool_name: string;
  display_name: string;
  status: ToolExecutionStatus;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  error?: string;
}
```

**ToolResult:**
```typescript
interface ToolResult {
  tool_name: string;
  display_name: string;
  status: 'success' | 'error' | 'timeout';
  result?: {
    type: string;
    [key: string]: any;
  };
  error?: string;
  duration_seconds: number;
  cost: number;
}
```

### **SSE Events**

**tool_suggestion:**
```json
{
  "stream_mode": "custom",
  "data": {
    "type": "tool_suggestion",
    "suggestions": [
      {
        "tool_name": "web_search",
        "display_name": "Web Search",
        "description": "Search the web",
        "confidence": 0.95,
        "reasoning": "Query asks for 'latest'",
        "parameters": {"query": "FDA guidelines"},
        "cost_tier": "low",
        "estimated_cost": 0.005,
        "estimated_duration_seconds": 3
      }
    ],
    "needs_confirmation": true,
    "message": "I recommend Web Search",
    "reasoning": "Need current information"
  }
}
```

**tool_execution_start:**
```json
{
  "stream_mode": "custom",
  "data": {
    "type": "tool_execution_start",
    "tools": [
      {
        "tool_name": "web_search",
        "display_name": "Web Search",
        "estimated_duration_seconds": 3
      }
    ]
  }
}
```

**tool_execution_progress:**
```json
{
  "stream_mode": "custom",
  "data": {
    "type": "tool_execution_progress",
    "tool_name": "web_search",
    "progress": 65
  }
}
```

**tool_execution_result:**
```json
{
  "stream_mode": "custom",
  "data": {
    "type": "tool_execution_result",
    "tool_name": "web_search",
    "display_name": "Web Search",
    "status": "success",
    "result": {
      "type": "web_search",
      "results": [
        {
          "title": "FDA Guidelines 2024",
          "url": "https://fda.gov/...",
          "snippet": "Latest guidelines...",
          "domain": "fda.gov"
        }
      ],
      "summary": "Found 5 web results"
    },
    "duration_seconds": 2.8,
    "cost": 0.005
  }
}
```

**tool_execution_complete:**
```json
{
  "stream_mode": "custom",
  "data": {
    "type": "tool_execution_complete"
  }
}
```

---

## 🎯 NEXT STEPS

### **Immediate**
1. [ ] Test end-to-end with backend running
2. [ ] Fix any discovered issues
3. [ ] Deploy to development environment

### **Short-term Enhancements**
1. [ ] Add Calculator tool implementation
2. [ ] Add PubMed tool implementation
3. [ ] Add FDA database tool implementation
4. [ ] Add SSE reconnection logic
5. [ ] Add connection status UI

### **Long-term**
1. [ ] Add tool usage analytics
2. [ ] Add tool result caching
3. [ ] Add streaming progress from tools
4. [ ] Add tool-specific icons
5. [ ] Add tool marketplace

---

## 📞 SUPPORT

**Documentation:**
- `TOOL_ORCHESTRATION_COMPLETE.md` - Comprehensive details
- `TOOL_ORCHESTRATION_QUICK_REF.md` - Quick reference
- `TOOL_INTEGRATION_TESTING_SUMMARY.md` - Testing checklist

**Code Locations:**
- Backend: `services/ai-engine/src/`
- Frontend: `apps/digital-health-startup/src/features/ask-expert/components/`
- Integration: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

---

**Status:** ✅ Integration complete, ready for testing  
**Version:** 1.0  
**Last Updated:** November 8, 2025

