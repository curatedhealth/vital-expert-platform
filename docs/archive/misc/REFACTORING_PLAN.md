# 🏗️ LangGraph Workflow Refactoring Plan

## Executive Summary

Currently, Mode 1 is being refined as the **gold standard** for streaming, serialization, and UX. However, the codebase has significant duplication and mode-specific features mixed with core functionality. This plan proposes a **scalable, maintainable architecture** that:

1. ✅ Makes Mode 1 the **base template** for all modes
2. ✅ Separates **core streaming logic** from **mode-specific features**
3. ✅ Eliminates code duplication across 4+ workflow files
4. ✅ Makes it easy to add new modes without rewriting core logic

---

## Current Architecture Issues

### 🔴 Problem 1: Code Duplication Across Modes

**Evidence:**
- Mode 1, 2, 3, 4 all have similar `validate_tenant_node`, `format_output_node`, RAG retrieval logic
- Streaming logic duplicated in each mode
- Same patterns repeated with slight variations

**Impact:**
- Bug fixes need to be applied 4 times
- Inconsistent behavior across modes
- Hard to maintain

### 🔴 Problem 2: Mode-Specific Features Mixed with Core Logic

**Evidence:**
- **Workflow Steps**: Only relevant for autonomous modes (Mode 3, 4) but code exists in all modes
- **ReAct Iterations**: Only for autonomous modes, but logic is intertwined
- **Agent Selection**: Different per mode (manual vs automatic) but not cleanly separated

**Impact:**
- Mode 1 has unused code paths for workflow steps
- Frontend receives data it doesn't need for certain modes
- Confusing to debug

### 🔴 Problem 3: Streaming Contract Not Standardized

**Evidence:**
- Each mode formats SSE events slightly differently
- Frontend has to handle mode-specific variations
- `langgraph_reasoning` format inconsistent

**Impact:**
- Frontend complexity increases
- Streaming bugs hard to trace
- New modes require frontend changes

---

## Proposed Architecture

### 🎯 Core Principles

1. **Inheritance Hierarchy**: BaseWorkflow → StreamingWorkflow → Mode-Specific
2. **Mixins for Features**: Clean separation of concerns (ToolChain, Memory, ReAct, etc.)
3. **Standardized Contracts**: All modes emit same SSE event structure
4. **Configuration-Driven**: Mode-specific behavior via config, not code duplication

---

## Detailed Refactoring Plan

### Phase 1: Extract Core Streaming Logic

**Objective**: Create a `StreamingWorkflowBase` that all modes inherit from.

#### 1.1 Create `StreamingWorkflowBase`

**File**: `services/ai-engine/src/langgraph_workflows/streaming_workflow_base.py`

```python
"""
StreamingWorkflowBase: Gold Standard Streaming for All Modes

This is the BASE CLASS for all workflow modes. It provides:
- ✅ Standardized SSE streaming contract
- ✅ Real-time AI reasoning emissions
- ✅ Source metadata normalization
- ✅ Citation formatting
- ✅ Frontend-ready serialization

All modes (1, 2, 3, 4) inherit from this class.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, AsyncIterator
from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import UnifiedWorkflowState

class StreamingWorkflowBase(BaseWorkflow, ABC):
    """
    Base class for all streaming workflows.
    
    Enforces:
    - Standardized SSE event format
    - Real-time reasoning emissions
    - Source/citation normalization
    - LangGraph native streaming
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.mode_config = self.get_mode_config()
    
    @abstractmethod
    def get_mode_config(self) -> Dict[str, Any]:
        """
        Mode-specific configuration.
        
        Returns:
            {
                'supports_multi_turn': bool,  # True for Mode 1, 2
                'supports_autonomous': bool,  # True for Mode 3, 4
                'supports_workflow_steps': bool,  # True for Mode 3, 4
                'agent_selection': 'manual' | 'automatic',
                'max_iterations': int | None,  # For autonomous modes
            }
        """
        pass
    
    # =========================================================================
    # STANDARDIZED STREAMING METHODS (FROM MODE 1 GOLD STANDARD)
    # =========================================================================
    
    async def emit_reasoning(
        self,
        writer: Any,
        reasoning_type: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Emit standardized AI reasoning event.
        
        This is the GOLD STANDARD from Mode 1 - all modes use this.
        
        Args:
            writer: SSE stream writer
            reasoning_type: 'rag_retrieval_start' | 'rag_retrieval_observation' | 
                          'agent_execution_start' | 'agent_execution_complete' |
                          'react_thought' | 'react_action' | 'react_observation'
            content: Human-readable reasoning content
            metadata: Additional context (agent_name, sources_count, iteration, etc.)
        """
        event = {
            'type': 'langgraph_reasoning',
            'reasoning_type': reasoning_type,
            'content': content,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metadata': metadata or {}
        }
        
        await writer.write(json.dumps(event))
        logger.info(f"🧠 Emitted reasoning: {reasoning_type}", content_preview=content[:100])
    
    async def emit_workflow_step(
        self,
        writer: Any,
        step_name: str,
        status: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Emit workflow step event (ONLY for autonomous modes).
        
        This method checks mode_config before emitting.
        Non-autonomous modes silently skip.
        
        Args:
            writer: SSE stream writer
            step_name: 'planning' | 'execution' | 'synthesis' | 'iteration_N'
            status: 'in_progress' | 'completed'
            metadata: Additional context
        """
        if not self.mode_config.get('supports_workflow_steps', False):
            logger.debug(f"Skipping workflow step (not supported in this mode): {step_name}")
            return
        
        event = {
            'type': 'workflow_step',
            'step_name': step_name,
            'status': status,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metadata': metadata or {}
        }
        
        await writer.write(json.dumps(event))
        logger.info(f"📋 Emitted workflow step: {step_name} - {status}")
    
    def normalize_citation(self, doc: Dict[str, Any], index: int) -> Dict[str, Any]:
        """
        Normalize citation format (FROM MODE 1 GOLD STANDARD).
        
        This is the AUTHORITATIVE citation normalizer.
        All modes use this exact implementation.
        
        Args:
            doc: RAG document with nested metadata structure
            index: Citation number (1-indexed)
            
        Returns:
            Normalized citation dict with:
            - number, title, url, domain, organization, sourceType, similarity, excerpt
        """
        # Extract metadata (handles nested structure from RAG service)
        metadata = doc.get('metadata', {})
        
        # RAG service returns nested metadata structure:
        # { "metadata": { "metadata": { "title": "...", "url": "..." }, "page_content": "..." } }
        if 'metadata' in metadata and isinstance(metadata['metadata'], dict):
            inner_metadata = metadata['metadata']
        else:
            inner_metadata = metadata
        
        # Extract fields
        title = inner_metadata.get('title', 'Untitled Document')
        url = inner_metadata.get('url', inner_metadata.get('source', ''))
        domain = inner_metadata.get('domain', '')
        organization = inner_metadata.get('organization', '')
        source_type = inner_metadata.get('type', inner_metadata.get('source_type', 'document'))
        similarity = metadata.get('similarity', 0.0)
        
        # Extract excerpt from page_content (priority: nested > top-level > doc)
        page_content = metadata.get('page_content', '') or doc.get('page_content', '')
        excerpt = page_content[:200] + '...' if len(page_content) > 200 else page_content
        
        # Extract domain from URL if not provided
        if not domain and url:
            try:
                from urllib.parse import urlparse
                parsed = urlparse(url)
                domain = parsed.netloc or ''
            except:
                domain = ''
        
        return {
            'number': index,
            'title': title,
            'url': url,
            'domain': domain,
            'organization': organization,
            'sourceType': source_type,
            'similarity': float(similarity),
            'excerpt': excerpt
        }
    
    def normalize_sources(self, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Normalize source metadata for frontend display.
        
        Extracts title, domain, similarity, excerpt from nested RAG structures.
        
        Args:
            sources: Raw RAG sources with nested metadata
            
        Returns:
            List of normalized source dicts
        """
        normalized = []
        
        for idx, source in enumerate(sources, start=1):
            citation = self.normalize_citation(source, idx)
            normalized.append(citation)
        
        return normalized
    
    # =========================================================================
    # COMMON NODES (SHARED ACROSS ALL MODES)
    # =========================================================================
    
    @trace_node("validate_tenant")
    async def validate_tenant_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Validate tenant exists and has access.
        
        This is IDENTICAL across all modes - moved to base class.
        """
        tenant_id = state['tenant_id']
        
        logger.info("Validating tenant", tenant_id=tenant_id[:8])
        
        # Check cache first
        cache_key = f"tenant_validation:{tenant_id}"
        cached = await self.cache_manager.get(cache_key)
        
        if cached:
            logger.info("✅ Tenant validation (cached)", tenant_id=tenant_id[:8])
            return state
        
        # Validate via Supabase
        result = self.supabase_client.table('tenants').select('id').eq('id', tenant_id).execute()
        
        if not result.data:
            raise ValueError(f"Invalid tenant: {tenant_id}")
        
        # Cache for 1 hour
        await self.cache_manager.set(cache_key, True, ttl=3600)
        
        logger.info("✅ Tenant validated", tenant_id=tenant_id[:8])
        return state
    
    @trace_node("format_output")
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Format final output with normalized sources and citations.
        
        This is IDENTICAL across all modes - moved to base class.
        """
        response = state.get('response', '')
        sources = state.get('sources', [])
        
        # Normalize sources using gold standard method
        normalized_sources = self.normalize_sources(sources)
        
        # Extract inline citations from response
        import re
        citation_pattern = r'\[(\d+)\]'
        citation_numbers = [int(m.group(1)) for m in re.finditer(citation_pattern, response)]
        
        # Build citations list
        citations = []
        for num in citation_numbers:
            if 1 <= num <= len(normalized_sources):
                citations.append(normalized_sources[num - 1])
        
        # Update state
        state['sources'] = normalized_sources
        state['citations'] = citations
        state['status'] = ExecutionStatus.COMPLETED
        
        logger.info(
            "✅ Output formatted",
            sources=len(normalized_sources),
            citations=len(citations)
        )
        
        return state
```

#### 1.2 Mode-Specific Subclasses

**Mode 1: Manual, Non-Autonomous**
```python
# mode1_manual_workflow.py
class Mode1ManualWorkflow(StreamingWorkflowBase):
    def get_mode_config(self) -> Dict[str, Any]:
        return {
            'supports_multi_turn': True,
            'supports_autonomous': False,
            'supports_workflow_steps': False,  # ✅ No workflow steps
            'agent_selection': 'manual',
            'max_iterations': None,
        }
    
    def build_graph(self) -> StateGraph:
        # Simple graph: validate → retrieve → execute → format
        # No ReAct loop, no workflow steps
        ...
```

**Mode 2: Automatic, Non-Autonomous**
```python
# mode2_automatic_workflow.py
class Mode2AutomaticWorkflow(StreamingWorkflowBase, ToolChainMixin, MemoryIntegrationMixin):
    def get_mode_config(self) -> Dict[str, Any]:
        return {
            'supports_multi_turn': True,
            'supports_autonomous': False,
            'supports_workflow_steps': False,  # ✅ No workflow steps
            'agent_selection': 'automatic',
            'max_iterations': None,
        }
    
    def build_graph(self) -> StateGraph:
        # Similar to Mode 1 but with agent selection node
        ...
```

**Mode 3: Automatic, Autonomous**
```python
# mode3_autonomous_auto_workflow.py
class Mode3AutonomousAutoWorkflow(StreamingWorkflowBase, ToolChainMixin, MemoryIntegrationMixin):
    def get_mode_config(self) -> Dict[str, Any]:
        return {
            'supports_multi_turn': False,
            'supports_autonomous': True,
            'supports_workflow_steps': True,  # ✅ YES - emit workflow steps
            'agent_selection': 'automatic',
            'max_iterations': 5,
        }
    
    def build_graph(self) -> StateGraph:
        # ReAct loop with workflow steps
        # Uses emit_workflow_step() which checks config
        ...
```

**Mode 4: Manual, Autonomous**
```python
# mode4_autonomous_manual_workflow.py
class Mode4AutonomousManualWorkflow(StreamingWorkflowBase, ToolChainMixin, MemoryIntegrationMixin):
    def get_mode_config(self) -> Dict[str, Any]:
        return {
            'supports_multi_turn': False,
            'supports_autonomous': True,
            'supports_workflow_steps': True,  # ✅ YES - emit workflow steps
            'agent_selection': 'manual',
            'max_iterations': 5,
        }
    
    def build_graph(self) -> StateGraph:
        # Same as Mode 3 but no agent selection node
        ...
```

---

### Phase 2: Create Reusable Node Mixins

**Objective**: Extract common node patterns into mixins.

#### 2.1 `RAGRetrievalMixin`

```python
# langgraph_workflows/mixins/rag_retrieval_mixin.py

class RAGRetrievalMixin:
    """
    Provides standardized RAG retrieval with streaming reasoning.
    
    Used by ALL modes that need RAG.
    """
    
    @trace_node("rag_retrieval")
    async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Retrieve relevant documents from RAG.
        
        Emits:
        - langgraph_reasoning: rag_retrieval_start
        - langgraph_reasoning: rag_retrieval_observation
        """
        query = state['query']
        agent_id = state['agent_id']
        enable_rag = state.get('enable_rag', True)
        
        # Emit reasoning START
        if hasattr(self, 'writer') and self.writer:
            await self.emit_reasoning(
                self.writer,
                'rag_retrieval_start',
                f'Searching knowledge base for relevant information about: {query[:100]}...',
                metadata={'agent_id': agent_id}
            )
        
        if not enable_rag:
            logger.info("RAG disabled by user, skipping retrieval")
            state['rag_sources'] = []
            state['rag_summary'] = "No documents retrieved (RAG disabled)."
            return state
        
        # Retrieve documents
        results = await self.rag_service.retrieve(
            query=query,
            tenant_id=state['tenant_id'],
            agent_id=agent_id,
            top_k=5
        )
        
        # Emit reasoning OBSERVATION
        if hasattr(self, 'writer') and self.writer:
            await self.emit_reasoning(
                self.writer,
                'rag_retrieval_observation',
                f'Retrieved {len(results)} relevant documents from knowledge base.',
                metadata={
                    'agent_id': agent_id,
                    'sources_count': len(results)
                }
            )
        
        # Update state
        state['rag_sources'] = results
        state['rag_summary'] = self._build_rag_summary(results)
        
        return state
    
    def _build_rag_summary(self, sources: List[Dict]) -> str:
        """Build context summary from RAG sources."""
        if not sources:
            return "No relevant documents found."
        
        summary_parts = []
        for idx, doc in enumerate(sources[:5], start=1):
            metadata = doc.get('metadata', {})
            
            # Handle nested metadata
            if 'metadata' in metadata:
                inner_meta = metadata['metadata']
            else:
                inner_meta = metadata
            
            title = inner_meta.get('title', f'Document {idx}')
            similarity = metadata.get('similarity', 0.0)
            page_content = metadata.get('page_content', doc.get('page_content', ''))
            excerpt = page_content[:150]
            
            summary_parts.append(
                f"[{idx}] {title} (relevance: {similarity:.2f})\n{excerpt}..."
            )
        
        return "\n\n".join(summary_parts)
```

#### 2.2 `AgentExecutionMixin`

```python
# langgraph_workflows/mixins/agent_execution_mixin.py

class AgentExecutionMixin:
    """
    Provides standardized agent execution with streaming reasoning.
    
    Used by ALL modes.
    """
    
    @trace_node("agent_execution")
    async def agent_execution_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Execute agent with LLM, emit real-time reasoning.
        
        Emits:
        - langgraph_reasoning: agent_execution_start
        - langgraph_reasoning: agent_execution_complete
        """
        agent_name = state.get('agent_name', 'Expert')
        
        # Emit reasoning START
        if hasattr(self, 'writer') and self.writer:
            await self.emit_reasoning(
                self.writer,
                'agent_execution_start',
                f'{agent_name} is analyzing your question and formulating a comprehensive response...',
                metadata={'agent_name': agent_name}
            )
        
        # Execute agent
        response = await self.agent_orchestrator.execute(
            agent_id=state['agent_id'],
            query=state['query'],
            context=state.get('rag_summary', ''),
            model=state.get('model', 'gpt-4'),
            stream_callback=self._stream_token if hasattr(self, 'writer') else None
        )
        
        # Emit reasoning COMPLETE
        if hasattr(self, 'writer') and self.writer:
            await self.emit_reasoning(
                self.writer,
                'agent_execution_complete',
                f'{agent_name} has completed the analysis.',
                metadata={
                    'agent_name': agent_name,
                    'response_length': len(response)
                }
            )
        
        state['response'] = response
        state['messages'].append({
            'role': 'assistant',
            'content': response
        })
        
        return state
```

#### 2.3 `ReActLoopMixin`

```python
# langgraph_workflows/mixins/react_loop_mixin.py

class ReActLoopMixin:
    """
    Provides ReAct (Reasoning + Acting) loop with workflow steps.
    
    ONLY used by autonomous modes (Mode 3, 4).
    """
    
    @trace_node("react_iteration")
    async def react_iteration_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Single ReAct iteration: Thought → Action → Observation → Reflection.
        
        Emits:
        - workflow_step: iteration_N (if config allows)
        - langgraph_reasoning: react_thought
        - langgraph_reasoning: react_action
        - langgraph_reasoning: react_observation
        """
        iteration = state.get('react_iteration', 1)
        
        # Emit workflow step (config-aware)
        if hasattr(self, 'writer') and self.writer:
            await self.emit_workflow_step(
                self.writer,
                f'iteration_{iteration}',
                'in_progress',
                metadata={'iteration': iteration}
            )
        
        # Generate thought
        thought = await self.react_engine.generate_thought(state)
        
        # Emit reasoning
        if hasattr(self, 'writer') and self.writer:
            await self.emit_reasoning(
                self.writer,
                'react_thought',
                thought,
                metadata={'iteration': iteration}
            )
        
        # ... rest of ReAct logic
        
        return state
```

---

### Phase 3: Standardize Frontend Contract

**Objective**: Single SSE event structure for all modes.

#### 3.1 SSE Event Schema

```typescript
// Frontend type definition (shared across all modes)

type SSEEvent = 
  | {
      type: 'langgraph_reasoning';
      reasoning_type: 
        | 'rag_retrieval_start' 
        | 'rag_retrieval_observation'
        | 'agent_execution_start'
        | 'agent_execution_complete'
        | 'react_thought'       // Only in Mode 3, 4
        | 'react_action'        // Only in Mode 3, 4
        | 'react_observation';  // Only in Mode 3, 4
      content: string;
      timestamp: string;
      metadata: Record<string, any>;
    }
  | {
      type: 'workflow_step';  // Only emitted by Mode 3, 4
      step_name: string;
      status: 'in_progress' | 'completed';
      timestamp: string;
      metadata: Record<string, any>;
    }
  | {
      type: 'content_chunk';
      content: string;
    }
  | {
      type: 'final';
      response: string;
      sources: NormalizedSource[];
      citations: Citation[];
      rag_summary: string;
      metadata: Record<string, any>;
    };

interface NormalizedSource {
  number: number;
  title: string;
  url: string;
  domain: string;
  organization: string;
  sourceType: string;
  similarity: number;
  excerpt: string;
}
```

#### 3.2 Frontend Handler (Simplified)

```typescript
// All modes use the SAME handler
const handleSSE = (event: SSEEvent) => {
  switch (event.type) {
    case 'langgraph_reasoning':
      // Append to reasoning array
      setReasoningSteps(prev => [...prev, event]);
      break;
    
    case 'workflow_step':
      // Only Mode 3, 4 emit this
      setWorkflowSteps(prev => [...prev, event]);
      break;
    
    case 'content_chunk':
      setStreamingContent(prev => prev + event.content);
      break;
    
    case 'final':
      // All modes emit this with full metadata
      setFinalMessage({
        content: event.response,
        sources: event.sources,
        citations: event.citations,
        reasoning: reasoningSteps,  // From langgraph_reasoning
        workflowSteps: workflowSteps,  // Empty for Mode 1, 2
      });
      break;
  }
};
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Create `StreamingWorkflowBase` class
- [ ] Extract `normalize_citation()` and `normalize_sources()` to base
- [ ] Extract `validate_tenant_node()` and `format_output_node()` to base
- [ ] Test Mode 1 with new base class (no functional changes)

### Week 2: Mixins
- [ ] Create `RAGRetrievalMixin`
- [ ] Create `AgentExecutionMixin`
- [ ] Create `ReActLoopMixin`
- [ ] Update Mode 1 to use mixins
- [ ] Test Mode 1 thoroughly

### Week 3: Apply to Other Modes
- [ ] Refactor Mode 2 to inherit from `StreamingWorkflowBase`
- [ ] Refactor Mode 3 to inherit from `StreamingWorkflowBase` + `ReActLoopMixin`
- [ ] Refactor Mode 4 to inherit from `StreamingWorkflowBase` + `ReActLoopMixin`
- [ ] Remove duplicated code from all mode files

### Week 4: Testing & Documentation
- [ ] Integration tests for all 4 modes
- [ ] Contract tests for SSE events
- [ ] Update API documentation
- [ ] Create developer guide for adding new modes

---

## Benefits After Refactoring

### ✅ Maintainability
- **80% less code duplication**: Core logic in one place
- **Single source of truth**: Bug fixes apply to all modes
- **Clear separation**: Mode-specific vs core functionality

### ✅ Scalability
- **Easy to add Mode 5, 6, etc.**: Just inherit from `StreamingWorkflowBase`
- **Mixins for features**: Compose capabilities (ReAct, Memory, ToolChain)
- **Configuration-driven**: Change behavior via config, not code

### ✅ Developer Experience
- **Predictable patterns**: All modes follow same structure
- **Less cognitive load**: Understand one mode = understand all
- **Better testing**: Test base class once, modes inherit confidence

### ✅ Frontend Consistency
- **Single SSE handler**: Works for all modes
- **Predictable data structures**: Same source/citation format
- **Progressive enhancement**: Modes add features, don't change contract

---

## Success Metrics

1. **Code Reduction**: Reduce workflow code by 60-80%
2. **Consistency**: All modes use identical `normalize_citation()`, `normalize_sources()`
3. **Frontend Simplification**: Remove mode-specific handlers
4. **Test Coverage**: 90%+ coverage of `StreamingWorkflowBase`
5. **Bug Reduction**: Fewer mode-specific streaming bugs

---

## Next Steps

1. **Review this plan** with the team
2. **Approve refactoring approach** (inheritance + mixins + config)
3. **Start with Week 1**: Extract Mode 1 base class
4. **Incremental rollout**: One mode at a time, validate each step

---

**Status**: 📋 Proposal - Awaiting Approval  
**Owner**: Engineering Team  
**Last Updated**: 2025-11-07

