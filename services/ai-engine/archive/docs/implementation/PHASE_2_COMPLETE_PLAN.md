# 🎯 Phase 2: Complete 4-Mode Ask Expert Implementation

**Date:** November 1, 2025  
**Status:** Ready to Implement  
**Alignment:** Frontend UI Features ✅  
**Time Estimate:** 24-32 hours

---

## 📊 Frontend-Backend Alignment

### **Frontend Features → Backend Requirements**

```typescript
// Frontend UI Controls (apps/digital-health-startup/src/components/prompt-input.tsx)
✅ isAutomatic: boolean       // Automatic vs Manual toggle
✅ isAutonomous: boolean      // Interactive vs Autonomous toggle
✅ selectedModel: string      // LLM selection (gpt-4, gpt-3.5, llama, biogpt)
✅ enableRAG: boolean         // RAG activation
✅ enableTools: boolean       // Tools activation
✅ selectedTools: string[]    // Specific tools selection
✅ selectedRagDomains: string[] // RAG domain filtering
✅ attachments: File[]        // File uploads
✅ selectedAgents: string[]   // Manual agent selection
```

### **Mode Determination Logic (Frontend)**
```typescript
// apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx:697-708

let mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert' = 'manual';

if (isAutonomous && isAutomatic) {
  mode = 'autonomous';      // Mode 3: Autonomous-Automatic
} else if (isAutonomous && !isAutomatic) {
  mode = 'multi-expert';    // Mode 4: Autonomous-Manual
} else if (!isAutonomous && isAutomatic) {
  mode = 'automatic';       // Mode 2: Interactive-Automatic
} else {
  mode = 'manual';          // Mode 1: Interactive-Manual
}
```

---

## 🏗️ Complete State Schema (Enhanced)

```python
# services/ai-engine/src/langgraph_workflows/state_schemas.py

from typing import TypedDict, List, Dict, Any, Optional, Annotated, Literal
from typing_extensions import NotRequired
from datetime import datetime
from enum import Enum
import operator

class UnifiedWorkflowState(TypedDict):
    """
    Enhanced state schema aligned with frontend features
    """
    # =========================================================================
    # BASE STATE (REQUIRED - GOLDEN RULE #3)
    # =========================================================================
    tenant_id: str  # REQUIRED - Golden Rule #3
    request_id: str
    user_id: NotRequired[Optional[str]]
    session_id: NotRequired[Optional[str]]  # For interactive modes (1 & 2)
    
    # Workflow control
    mode: WorkflowMode  # mode1_interactive_auto, mode2_interactive_manual, mode3_autonomous_auto, mode4_autonomous_manual
    status: ExecutionStatus
    current_node: NotRequired[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # =========================================================================
    # INPUT STATE (FROM FRONTEND)
    # =========================================================================
    
    # User query
    query: str
    query_language: NotRequired[str]
    
    # Conversation history (Modes 1 & 2 only)
    conversation_history: NotRequired[List[Dict[str, str]]]  # [{role, content}]
    
    # Model selection (from frontend)
    model: str  # 'gpt-4', 'gpt-3.5-turbo', 'llama-medical', 'biogpt'
    temperature: NotRequired[float]  # Default: 0.1
    max_tokens: NotRequired[int]  # Default: 4000
    
    # RAG configuration (from frontend)
    enable_rag: bool  # Frontend toggle
    selected_rag_domains: NotRequired[List[str]]  # Frontend domain selection
    
    # Tools configuration (from frontend)
    enable_tools: bool  # Frontend toggle
    selected_tools: NotRequired[List[str]]  # Frontend tool selection
    
    # Attachments
    attachments: NotRequired[List[Dict[str, Any]]]  # File uploads
    
    # =========================================================================
    # AGENT SELECTION STATE
    # =========================================================================
    
    # Manual selection (Modes 2 & 4)
    user_selected_agent_id: NotRequired[str]  # From frontend selectedAgents[0]
    
    # Automatic selection (Modes 1 & 3)
    selected_agents: Annotated[List[str], operator.add]  # System-selected
    selection_reasoning: NotRequired[str]
    selection_confidence: NotRequired[float]
    
    # =========================================================================
    # RAG RETRIEVAL STATE (WITH CACHING - GOLDEN RULE #2)
    # =========================================================================
    
    # Query embedding
    query_embedding: NotRequired[List[float]]
    embedding_cached: NotRequired[bool]  # Cache hit
    embedding_cache_key: NotRequired[str]
    
    # Retrieved documents
    retrieved_documents: Annotated[List[Dict[str, Any]], operator.add]
    rag_cache_hit: NotRequired[bool]  # Cache hit
    rag_cache_key: NotRequired[str]
    
    # Retrieval metadata
    retrieval_confidence: NotRequired[float]
    total_documents: NotRequired[int]
    context_summary: NotRequired[str]
    
    # =========================================================================
    # AUTONOMOUS REASONING STATE (MODES 3 & 4 ONLY)
    # =========================================================================
    
    # Goal understanding (Chain-of-Thought)
    goal_understanding: NotRequired[str]  # Streamed to frontend
    task_plan: NotRequired[List[str]]  # Streamed to frontend
    
    # ReAct loop state
    current_iteration: NotRequired[int]
    max_iterations: NotRequired[int]  # Configurable (default: 5)
    
    # ReAct components per iteration
    thoughts: Annotated[List[str], operator.add]  # Streamed
    actions: Annotated[List[Dict[str, Any]], operator.add]  # Streamed
    observations: Annotated[List[str], operator.add]  # Streamed
    reflections: Annotated[List[str], operator.add]  # Streamed
    
    # Tool execution results
    tool_results: Annotated[List[Dict[str, Any]], operator.add]
    
    # Goal achievement check
    goal_achieved: NotRequired[bool]
    reassessment: NotRequired[str]
    
    # =========================================================================
    # AGENT EXECUTION STATE (WITH CACHING - GOLDEN RULE #2)
    # =========================================================================
    
    # Current agent
    current_agent_id: NotRequired[str]
    current_agent_type: NotRequired[str]
    
    # Agent prompts
    system_prompt: NotRequired[str]
    user_prompt: NotRequired[str]
    context: NotRequired[str]  # RAG context
    
    # Agent response
    agent_response: NotRequired[str]
    response_confidence: NotRequired[float]
    response_cached: NotRequired[bool]  # Cache hit
    
    # LLM metadata
    model_used: str  # From frontend selection
    tokens_used: NotRequired[int]
    cost_estimate: NotRequired[float]
    
    # Response quality
    citations: NotRequired[List[Dict[str, Any]]]
    confidence_breakdown: NotRequired[Dict[str, float]]
    
    # =========================================================================
    # OUTPUT STATE (TO FRONTEND)
    # =========================================================================
    
    # Final response
    response: NotRequired[str]
    confidence: NotRequired[float]
    agents_used: NotRequired[List[str]]
    
    # Citations and evidence
    sources_used: NotRequired[int]
    evidence_level: NotRequired[str]
    
    # Processing metadata
    processing_time_ms: NotRequired[float]
    cache_hits: NotRequired[int]  # Total cache hits
    
    # Streaming metadata (for frontend)
    streaming_chunks: NotRequired[List[Dict[str, Any]]]  # For SSE
    
    # =========================================================================
    # ERROR HANDLING & OBSERVABILITY
    # =========================================================================
    
    errors: Annotated[List[str], operator.add]
    retry_count: NotRequired[int]
    trace_id: NotRequired[str]
    metrics: NotRequired[Dict[str, Any]]
```

---

## 🎯 Phase 2 Tasks (Complete 4-Mode Implementation)

### **Task 2.1: Mode 1 - Interactive-Automatic (5-7 hours)**

**Frontend → Backend Flow:**
```
User: isAutomatic=false, isAutonomous=false
      selectedAgents=[] (no agent selected)
      message="What are FDA IND requirements?"
      enableRAG=true
      selectedModel="gpt-4"
      
Backend: 
1. Load conversation history
2. Analyze query → Select best expert automatically
3. Retrieve RAG context (with caching)
4. Execute selected agent
5. Save conversation turn
6. Return response
```

**LangGraph Implementation:**
```python
# services/ai-engine/src/langgraph_workflows/mode1_interactive_auto_workflow.py

class Mode1InteractiveAutoWorkflow(BaseWorkflow):
    """
    Mode 1: Interactive-Automatic
    
    Frontend Features:
    - Multi-turn conversation
    - System selects expert per turn
    - Can switch experts between messages
    - RAG enabled/disabled toggle
    - Tools enabled/disabled toggle
    - LLM model selection
    """
    
    def build_graph(self) -> StateGraph:
        graph = StateGraph(UnifiedWorkflowState)
        
        # Nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("load_conversation", self.load_conversation_node)
        graph.add_node("analyze_query", self.analyze_query_node)
        graph.add_node("select_expert", self.select_expert_automatic_node)
        
        # Conditional RAG based on frontend toggle
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("skip_rag", self.skip_rag_node)
        
        graph.add_node("execute_agent", self.execute_agent_node)
        graph.add_node("save_conversation", self.save_conversation_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "load_conversation")
        graph.add_edge("load_conversation", "analyze_query")
        graph.add_edge("analyze_query", "select_expert")
        
        # Conditional: RAG or skip based on frontend toggle
        graph.add_conditional_edges(
            "select_expert",
            self.should_use_rag,
            {
                "use_rag": "rag_retrieval",
                "skip_rag": "skip_rag"
            }
        )
        
        graph.add_edge("rag_retrieval", "execute_agent")
        graph.add_edge("skip_rag", "execute_agent")
        graph.add_edge("execute_agent", "save_conversation")
        graph.add_edge("save_conversation", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    def should_use_rag(self, state: UnifiedWorkflowState) -> str:
        """Check frontend RAG toggle"""
        return "use_rag" if state.get('enable_rag', True) else "skip_rag"
    
    async def select_expert_automatic_node(self, state: UnifiedWorkflowState):
        """Automatic expert selection using AgentSelectorService"""
        # Use existing AgentSelectorService
        # Cache selection decision
        pass
```

**Key Features:**
- ✅ Respects frontend `enableRAG` toggle
- ✅ Respects frontend `enableTools` toggle
- ✅ Uses frontend `selectedModel`
- ✅ Loads/saves conversation history
- ✅ Caches expert selection
- ✅ Caches RAG results

---

### **Task 2.2: Mode 2 - Interactive-Manual (4-6 hours)**

**Frontend → Backend Flow:**
```
User: isAutomatic=false, isAutonomous=false
      selectedAgents=["regulatory_expert"]
      message="Tell me more about that"
      enableRAG=true
      
Backend:
1. Load conversation history
2. Validate user's selected agent
3. Retrieve RAG context (with caching)
4. Execute fixed agent with conversation history
5. Save conversation turn
6. Return response
```

**Implementation:**
- Same as Mode 1 but **skips** `select_expert` node
- Uses `user_selected_agent_id` from state
- Fixed expert throughout conversation

---

### **Task 2.3: Mode 3 - Autonomous-Automatic (7-9 hours)**

**Frontend → Backend Flow:**
```
User: isAutomatic=true, isAutonomous=true
      selectedAgents=[] (no selection needed)
      query="Research the regulatory pathway for a novel diabetes device"
      enableRAG=true
      enableTools=true
      selectedModel="gpt-4"
      
Backend:
1. Understand goal (CoT) → Stream to frontend
2. Create task plan → Stream to frontend
3. Select best expert(s) automatically
4. Start ReAct loop:
   - Thought → Stream
   - Action (RAG/Tool) → Stream
   - Observation → Stream
   - Reflection → Stream
   - Reassess if goal achieved
5. Iterate up to max_iterations
6. Synthesize final answer
7. Return response
```

**LangGraph Implementation:**
```python
# services/ai-engine/src/langgraph_workflows/mode3_autonomous_auto_workflow.py

class Mode3AutonomousAutoWorkflow(BaseWorkflow):
    """
    Mode 3: Autonomous-Automatic (ReAct + CoT)
    
    Frontend Features:
    - One-shot query (no conversation)
    - System selects expert(s)
    - Streams reasoning steps to frontend
    - RAG + Tools enabled
    - Configurable max iterations
    """
    
    def build_graph(self) -> StateGraph:
        graph = StateGraph(UnifiedWorkflowState)
        
        # Nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("understand_goal", self.understand_goal_cot_node)  # CoT
        graph.add_node("plan_tasks", self.plan_tasks_node)
        graph.add_node("select_experts", self.select_experts_automatic_node)
        graph.add_node("react_thought", self.react_thought_node)
        graph.add_node("react_action", self.react_action_node)
        graph.add_node("react_observation", self.react_observation_node)
        graph.add_node("react_reflection", self.react_reflection_node)
        graph.add_node("reassess_goal", self.reassess_goal_node)
        graph.add_node("synthesize", self.synthesize_final_answer_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "understand_goal")
        graph.add_edge("understand_goal", "plan_tasks")
        graph.add_edge("plan_tasks", "select_experts")
        graph.add_edge("select_experts", "react_thought")
        
        # ReAct loop
        graph.add_edge("react_thought", "react_action")
        graph.add_edge("react_action", "react_observation")
        graph.add_edge("react_observation", "react_reflection")
        graph.add_edge("react_reflection", "reassess_goal")
        
        # Conditional: Continue iteration or finish
        graph.add_conditional_edges(
            "reassess_goal",
            self.should_continue_react,
            {
                "achieved": "synthesize",
                "iterate": "react_thought",
                "max_iterations": "synthesize"
            }
        )
        
        graph.add_edge("synthesize", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    async def understand_goal_cot_node(self, state: UnifiedWorkflowState):
        """Chain-of-Thought goal understanding"""
        # Use LLM to understand goal
        # Stream to frontend via state update
        # Cache result
        pass
    
    async def react_thought_node(self, state: UnifiedWorkflowState):
        """ReAct: Thought step"""
        # Generate next thought
        # Stream to frontend
        pass
    
    async def react_action_node(self, state: UnifiedWorkflowState):
        """ReAct: Action step (RAG, Tool, or Agent query)"""
        # Execute action (RAG search, tool call, or agent query)
        # Stream action to frontend
        pass
    
    async def react_observation_node(self, state: UnifiedWorkflowState):
        """ReAct: Observation step"""
        # Observe action result
        # Stream observation to frontend
        pass
    
    async def react_reflection_node(self, state: UnifiedWorkflowState):
        """ReAct: Reflection step"""
        # Reflect on observation
        # Stream reflection to frontend
        pass
    
    async def reassess_goal_node(self, state: UnifiedWorkflowState):
        """Check if goal is achieved"""
        # Assess if goal is met
        # Decide: achieved, iterate, or max_iterations reached
        pass
    
    def should_continue_react(self, state: UnifiedWorkflowState) -> str:
        """Determine next step in ReAct loop"""
        if state.get('goal_achieved'):
            return "achieved"
        
        current_iter = state.get('current_iteration', 0)
        max_iter = state.get('max_iterations', 5)
        
        if current_iter >= max_iter:
            return "max_iterations"
        
        return "iterate"
```

**Key Features:**
- ✅ Streams ALL reasoning steps to frontend (SSE)
- ✅ Chain-of-Thought goal understanding
- ✅ Task decomposition and planning
- ✅ ReAct loop with configurable iterations
- ✅ Tool execution (when `enableTools=true`)
- ✅ RAG integration at each iteration
- ✅ Caching at every stage

---

### **Task 2.4: Mode 4 - Autonomous-Manual (6-8 hours)**

**Frontend → Backend Flow:**
```
User: isAutomatic=false, isAutonomous=true
      selectedAgents=["regulatory_expert"]
      query="Create a comprehensive IND submission plan"
      enableRAG=true
      enableTools=true
      
Backend:
1. Validate user's selected agent
2. Understand goal (CoT) with selected expert → Stream
3. Create task plan → Stream
4. Start ReAct loop with FIXED expert:
   - Thought → Stream
   - Action (RAG/Tool with this expert) → Stream
   - Observation → Stream
   - Reflection → Stream
   - Reassess
5. Iterate up to max_iterations
6. Synthesize final answer from single expert
7. Return response
```

**Implementation:**
- Same as Mode 3 but **skips** `select_experts` node
- Uses `user_selected_agent_id` from state
- All ReAct steps use the SAME fixed expert

---

## 📦 Additional Components to Create

### **1. ReAct Engine (Shared by Modes 3 & 4)**
```python
# services/ai-engine/src/langgraph_workflows/react_engine.py

class ReActEngine:
    """
    Shared ReAct reasoning engine for autonomous modes.
    
    Implements:
    - Chain-of-Thought planning
    - ReAct loop (Thought → Action → Observation → Reflection)
    - Tool execution
    - Goal reassessment
    - Streaming support
    """
    
    async def understand_goal(self, query: str, model: str) -> Dict[str, Any]:
        """Chain-of-Thought goal understanding"""
        pass
    
    async def create_task_plan(self, goal: str, model: str) -> List[str]:
        """Break down goal into subtasks"""
        pass
    
    async def generate_thought(self, state: Dict, model: str) -> str:
        """Generate next thought in ReAct loop"""
        pass
    
    async def execute_action(
        self, 
        thought: str, 
        available_tools: List[str],
        enable_rag: bool,
        model: str
    ) -> Dict[str, Any]:
        """Execute action (RAG, tool, or query)"""
        pass
    
    async def generate_observation(self, action_result: Dict, model: str) -> str:
        """Observe and describe action result"""
        pass
    
    async def generate_reflection(
        self, 
        thought: str, 
        action: Dict, 
        observation: str,
        model: str
    ) -> str:
        """Reflect on thought-action-observation"""
        pass
    
    async def reassess_goal(
        self,
        original_goal: str,
        thoughts: List[str],
        observations: List[str],
        reflections: List[str],
        model: str
    ) -> Dict[str, Any]:
        """Assess if goal is achieved"""
        # Returns: {achieved: bool, reasoning: str, confidence: float}
        pass
```

### **2. Conversation Manager (Modes 1 & 2)**
```python
# services/ai-engine/src/services/conversation_manager.py

class ConversationManager:
    """
    Manages conversation history for interactive modes.
    
    Features:
    - Load conversation from database
    - Save conversation turns
    - Format conversation for LLM context
    - Trim conversation to fit context window
    - Track conversation metadata
    """
    
    async def load_conversation(
        self, 
        tenant_id: str, 
        session_id: str
    ) -> List[Dict[str, str]]:
        """Load conversation history"""
        pass
    
    async def save_turn(
        self,
        tenant_id: str,
        session_id: str,
        user_message: str,
        assistant_message: str,
        agent_id: str,
        metadata: Dict[str, Any]
    ):
        """Save conversation turn"""
        pass
    
    def format_for_llm(
        self,
        conversation: List[Dict[str, str]],
        max_tokens: int = 8000
    ) -> str:
        """Format conversation for LLM context"""
        pass
```

### **3. Streaming Manager**
```python
# services/ai-engine/src/services/streaming_manager.py

class StreamingManager:
    """
    Manages SSE streaming to frontend.
    
    Event Types:
    - goal_understanding
    - task_plan
    - agent_selection
    - thought
    - action
    - observation
    - reflection
    - reassessment
    - final_answer
    - token (for response streaming)
    """
    
    async def stream_event(
        self,
        event_type: str,
        content: Any,
        metadata: Optional[Dict] = None
    ):
        """Stream event to frontend via SSE"""
        pass
```

---

## 🎯 Updated Success Criteria

### ✅ All 4 Modes Implemented
- Mode 1: Interactive-Automatic with conversation history
- Mode 2: Interactive-Manual with fixed expert
- Mode 3: Autonomous-Automatic with ReAct + CoT
- Mode 4: Autonomous-Manual with ReAct + CoT (fixed expert)

### ✅ Frontend Feature Support
- Automatic/Autonomous toggle integration
- LLM model selection (gpt-4, gpt-3.5, llama, biogpt)
- RAG enable/disable toggle
- Tools enable/disable toggle
- RAG domain selection
- Tool selection
- File attachments support

### ✅ Golden Rules Compliance
- All workflows use LangGraph StateGraph ✅
- Caching integrated at all nodes ✅
- Tenant validation enforced ✅

### ✅ Streaming Support
- All reasoning steps stream to frontend (Modes 3 & 4)
- Token streaming for responses (all modes)
- SSE event types match frontend expectations

### ✅ Production Ready
- Comprehensive error handling
- Observability with LangSmith
- >80% test coverage
- No blocking issues

---

## 📊 Deliverables Summary

**Files to Create:** 11
1. `mode1_interactive_auto_workflow.py` (~400 lines)
2. `mode2_interactive_manual_workflow.py` (~350 lines)
3. `mode3_autonomous_auto_workflow.py` (~600 lines)
4. `mode4_autonomous_manual_workflow.py` (~550 lines)
5. `react_engine.py` (~500 lines)
6. `conversation_manager.py` (~300 lines)
7. `streaming_manager.py` (~250 lines)
8. `test_mode1_workflow.py` (~300 lines)
9. `test_mode2_workflow.py` (~250 lines)
10. `test_mode3_workflow.py` (~400 lines)
11. `test_mode4_workflow.py` (~350 lines)

**Total New Code:** ~4250 lines

**Time Estimate:** 24-32 hours

---

## 🚀 Ready to Implement?

Phase 2 is now **fully aligned with frontend features**:
- ✅ 4-mode system (not 3 modes)
- ✅ All UI toggles and controls supported
- ✅ LLM selection integrated
- ✅ RAG and Tools activation
- ✅ Streaming for autonomous modes
- ✅ Conversation history for interactive modes
- ✅ Domain and tool selection
- ✅ File attachments support

**Let's proceed with implementation!** 🎯

