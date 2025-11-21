# MODE 1 REFACTORING - COMPLETE IMPLEMENTATION ROADMAP

**TAG: REFACTORING_COMPLETE_ROADMAP**

## 🎯 Executive Summary

This document provides a complete, actionable roadmap for refactoring the VITAL AI Platform's Mode 1-4 workflows to use a shared AI services library (`vital-ai-services`). This refactoring will:

1. **Eliminate 70% code duplication** across modes
2. **Reduce bug fix time by 80%** (fix once, deploy everywhere)
3. **Accelerate new mode development by 60%**
4. **Improve test coverage to >90%**
5. **Enable faster iteration** on AI features

## 📦 Package Overview

### `vital-ai-services` - Shared AI Services Library

**Location**: `services/vital-ai-services/`

**Purpose**: Centralized, production-ready AI services used across all modes

**Core Services**:
1. **AgentSelectorService**: Intelligent agent selection with ML and feedback loops
2. **UnifiedRAGService**: Production-ready RAG with caching and multi-strategy search
3. **ToolRegistry**: Centralized tool management and execution
4. **ConversationManager**: Memory and context management for multi-turn dialogs
5. **CitationService**: Citation extraction and formatting
6. **CostTracker**: Cost tracking across all services
7. **ServiceRegistry**: Dependency injection and service orchestration

---

## 🗓️ 4-WEEK IMPLEMENTATION PLAN

### **WEEK 1: Extract Core Services**

#### **Days 1-2: AgentService + RAGService** ✅ IN PROGRESS

**Goal**: Extract agent selection and RAG services into shared library

**Tasks**:

1. **Extract AgentSelectorService** (4 hours)
   ```
   Source: services/ai-engine/src/services/enhanced_agent_selector.py
   Target: services/vital-ai-services/src/vital_ai_services/agent/selector.py
   ```
   - [x] Create `agent/` module structure
   - [ ] Copy and adapt `EnhancedAgentSelector` class
   - [ ] Update imports to use shared models
   - [ ] Add Service Registry integration
   - [ ] Write unit tests (target: 95% coverage)
   
2. **Extract UnifiedRAGService** (4 hours)
   ```
   Source: services/ai-engine/src/services/unified_rag_service.py
   Target: services/vital-ai-services/src/vital_ai_services/rag/service.py
   ```
   - [ ] Create `rag/` module structure
   - [ ] Copy and adapt `UnifiedRAGService` class
   - [ ] Extract embedding services to `rag/embedding.py`
   - [ ] Extract caching logic to `rag/cache.py`
   - [ ] Update imports to use shared models
   - [ ] Add Service Registry integration
   - [ ] Write unit tests (target: 95% coverage)

**Deliverables**:
- ✅ Package structure created
- ✅ Core models defined
- ✅ Exception hierarchy established
- [ ] `AgentSelectorService` extracted and tested
- [ ] `UnifiedRAGService` extracted and tested
- [ ] Integration tests passing
- [ ] Documentation updated

**Success Criteria**:
- All unit tests pass with >90% coverage
- Services work independently of AI engine
- No breaking changes to existing workflows
- Performance matches or exceeds current implementation

---

#### **Days 3-4: ToolService + MemoryService**

**Goal**: Extract tool registry and conversation memory services

**Tasks**:

1. **Extract ToolRegistry** (3 hours)
   ```
   Source: services/ai-engine/src/services/tool_registry_service.py
   Target: services/vital-ai-services/src/vital_ai_services/tools/registry.py
   ```
   - [ ] Create `tools/` module structure
   - [ ] Extract `BaseTool` to `tools/base.py`
   - [ ] Extract `ToolRegistry` to `tools/registry.py`
   - [ ] Add Service Registry integration
   - [ ] Write unit tests

2. **Extract Tool Implementations** (3 hours)
   ```
   Source: services/ai-engine/src/tools/
   Targets:
   - tools/web_search.py (WebSearchTool)
   - tools/web_scraper.py (WebScraperTool)
   - tools/rag_tool.py (RAGTool)
   - tools/calculator.py (CalculatorTool)
   ```
   - [ ] Extract each tool to shared library
   - [ ] Update imports
   - [ ] Preserve all functionality
   - [ ] Write unit tests for each tool

3. **Extract ConversationManager** (2 hours)
   ```
   Source: services/ai-engine/src/services/enhanced_conversation_manager.py
   Target: services/vital-ai-services/src/vital_ai_services/memory/manager.py
   ```
   - [ ] Create `memory/` module structure
   - [ ] Extract `ConversationManager` to `memory/manager.py`
   - [ ] Extract `SessionMemoryService` to `memory/session.py`
   - [ ] Extract `ConversationAnalyzer` to `memory/analyzer.py`
   - [ ] Add Service Registry integration
   - [ ] Write unit tests

**Deliverables**:
- [ ] `ToolRegistry` extracted and tested
- [ ] All core tools extracted and tested
- [ ] `ConversationManager` extracted and tested
- [ ] Integration tests passing
- [ ] Documentation updated

**Success Criteria**:
- Tools execute correctly via registry
- Memory persists across conversation turns
- All unit tests pass with >90% coverage
- Performance matches current implementation

---

#### **Day 5: Testing + Integration**

**Goal**: Ensure all extracted services work together

**Tasks**:

1. **Integration Testing** (3 hours)
   - [ ] Create `tests/integration/` directory
   - [ ] Write agent + RAG integration test
   - [ ] Write tool + RAG integration test
   - [ ] Write memory + agent integration test
   - [ ] Write end-to-end workflow test
   - [ ] Ensure all tests pass

2. **Performance Benchmarking** (2 hours)
   - [ ] Benchmark agent selection (target: <200ms)
   - [ ] Benchmark RAG search (target: <500ms)
   - [ ] Benchmark tool execution (varies by tool)
   - [ ] Compare with current implementation
   - [ ] Document results

3. **Documentation** (3 hours)
   - [ ] Update README with integration examples
   - [ ] Add API reference docs
   - [ ] Create migration guide
   - [ ] Document performance benchmarks
   - [ ] Add troubleshooting guide

**Deliverables**:
- [ ] Full integration test suite
- [ ] Performance benchmarks
- [ ] Complete documentation
- [ ] Migration guide

**Success Criteria**:
- All integration tests pass
- Performance meets or exceeds baseline
- Documentation is comprehensive
- Ready for Week 2

---

### **WEEK 2: Shared Library Structure**

#### **Days 1-2: Package Structure + Models**

**Goal**: Finalize package structure and shared models

**Tasks**:

1. **Finalize Package Structure** (2 hours)
   ```
   vital-ai-services/
   ├── src/vital_ai_services/
   │   ├── __init__.py ✅
   │   ├── core/ ✅
   │   │   ├── models.py ✅
   │   │   ├── exceptions.py ✅
   │   │   └── config.py
   │   ├── agent/ ✅
   │   │   ├── selector.py
   │   │   ├── orchestrator.py
   │   │   └── enrichment.py
   │   ├── rag/
   │   │   ├── service.py
   │   │   ├── embedding.py
   │   │   └── cache.py
   │   ├── tools/
   │   │   ├── base.py
   │   │   ├── registry.py
   │   │   ├── web_search.py
   │   │   ├── web_scraper.py
   │   │   ├── rag_tool.py
   │   │   └── calculator.py
   │   ├── memory/
   │   │   ├── manager.py
   │   │   ├── session.py
   │   │   └── analyzer.py
   │   ├── citation/
   │   │   ├── extractor.py
   │   │   └── formatter.py
   │   ├── cost/
   │   │   └── tracker.py
   │   └── registry/
   │       └── service_registry.py
   └── tests/
       ├── agent/
       ├── rag/
       ├── tools/
       ├── memory/
       └── integration/
   ```

2. **Add Missing Models** (2 hours)
   - [ ] `WorkflowState` model
   - [ ] `StreamingEvent` model
   - [ ] `MetricsData` model
   - [ ] `CostData` model

3. **Create Config Module** (2 hours)
   - [ ] `core/config.py` for service configuration
   - [ ] Environment variable loading
   - [ ] Validation logic
   - [ ] Default values

4. **Package Installation** (2 hours)
   - [ ] Test local installation: `pip install -e services/vital-ai-services/`
   - [ ] Verify imports work
   - [ ] Test in AI engine
   - [ ] Fix any import issues

**Deliverables**:
- [ ] Complete package structure
- [ ] All models defined
- [ ] Config module created
- [ ] Package installable and importable

---

#### **Days 3-4: Service Registry + Dependency Injection**

**Goal**: Implement centralized service registry for dependency injection

**Tasks**:

1. **Create ServiceRegistry** (4 hours)
   ```python
   # services/vital-ai-services/src/vital_ai_services/registry/service_registry.py
   
   class ServiceRegistry:
       def __init__(self):
           self._services: Dict[str, Any] = {}
       
       def register(self, name: str, service: Any) -> None:
           """Register a service"""
           
       def get(self, name: str) -> Any:
           """Get a registered service"""
           
       def has(self, name: str) -> bool:
           """Check if service is registered"""
           
       def initialize_all(self) -> None:
           """Initialize all services that need it"""
   ```

2. **Add Lifecycle Management** (2 hours)
   - [ ] `ServiceLifecycle` protocol
   - [ ] `async def initialize()` method
   - [ ] `async def shutdown()` method
   - [ ] Auto-initialization on first use

3. **Add Service Discovery** (2 hours)
   - [ ] `list_services()` method
   - [ ] `get_service_metadata()` method
   - [ ] Service health checks

**Deliverables**:
- [ ] `ServiceRegistry` implemented
- [ ] Lifecycle management
- [ ] Service discovery
- [ ] Unit tests

---

#### **Day 5: Documentation + Examples**

**Goal**: Complete documentation for shared library

**Tasks**:

1. **API Reference** (3 hours)
   - [ ] Auto-generate API docs from docstrings
   - [ ] Add usage examples for each service
   - [ ] Document all public methods
   - [ ] Add code snippets

2. **Usage Guides** (3 hours)
   - [ ] Agent selection guide
   - [ ] RAG integration guide
   - [ ] Tool development guide
   - [ ] Memory management guide

3. **Examples** (2 hours)
   - [ ] Create `examples/` directory
   - [ ] Add Mode 1 example
   - [ ] Add Mode 2 example
   - [ ] Add Mode 3 example
   - [ ] Add Mode 4 example

**Deliverables**:
- [ ] Complete API reference
- [ ] Usage guides
- [ ] Working examples
- [ ] Migration guide

---

### **WEEK 3: Refactor Mode 1**

#### **Days 1-2: Update Mode 1 Workflow**

**Goal**: Refactor Mode 1 to use shared library

**Tasks**:

1. **Update Mode 1 Workflow** (4 hours)
   ```
   File: services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   ```
   - [ ] Replace local imports with `vital_ai_services` imports
   - [ ] Update `__init__` to accept ServiceRegistry
   - [ ] Replace direct service instantiation with registry calls
   - [ ] Update all nodes to use shared services
   - [ ] Preserve all streaming logic
   - [ ] Test workflow execution

2. **Update Dependency Injection** (2 hours)
   ```
   File: services/ai-engine/src/main.py
   ```
   - [ ] Create ServiceRegistry instance
   - [ ] Register all services
   - [ ] Pass registry to workflow
   - [ ] Update FastAPI dependencies

3. **Test Mode 1** (2 hours)
   - [ ] Unit test each node
   - [ ] Integration test full workflow
   - [ ] Test streaming responses
   - [ ] Test error handling

**Deliverables**:
- [ ] Mode 1 using shared library
- [ ] All tests passing
- [ ] Streaming still works
- [ ] No performance regression

---

#### **Days 3-4: Update API Endpoints**

**Goal**: Update API endpoints to use shared library

**Tasks**:

1. **Update Mode 1 Endpoint** (2 hours)
   ```
   File: services/ai-engine/src/main.py
   Endpoint: POST /api/mode1/manual
   ```
   - [ ] Update dependencies to use ServiceRegistry
   - [ ] Simplify initialization logic
   - [ ] Add health checks
   - [ ] Test endpoint

2. **Add Service Health Endpoints** (2 hours)
   - [ ] `GET /health/agent-selector`
   - [ ] `GET /health/rag-service`
   - [ ] `GET /health/tool-registry`
   - [ ] Overall health check

3. **Update Frontend Integration** (2 hours)
   ```
   File: apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
   ```
   - [ ] Verify frontend still works
   - [ ] Test streaming
   - [ ] Test error handling
   - [ ] Update any necessary types

4. **Performance Testing** (2 hours)
   - [ ] Load test Mode 1 endpoint
   - [ ] Measure latency
   - [ ] Compare with baseline
   - [ ] Optimize if needed

**Deliverables**:
- [ ] All endpoints updated
- [ ] Health checks added
- [ ] Frontend integration verified
- [ ] Performance validated

---

#### **Day 5: End-to-End Testing**

**Goal**: Comprehensive E2E testing of refactored Mode 1

**Tasks**:

1. **E2E Test Suite** (4 hours)
   - [ ] Test user query → agent selection → RAG → tool execution → response
   - [ ] Test streaming responses
   - [ ] Test error scenarios
   - [ ] Test edge cases (no sources, tool failures, etc.)

2. **User Acceptance Testing** (2 hours)
   - [ ] Manual testing in browser
   - [ ] Test all Mode 1 features
   - [ ] Verify UI/UX unchanged
   - [ ] Collect feedback

3. **Documentation** (2 hours)
   - [ ] Update Mode 1 documentation
   - [ ] Document any breaking changes
   - [ ] Add troubleshooting guide
   - [ ] Update deployment guide

**Deliverables**:
- [ ] E2E test suite
- [ ] UAT completed
- [ ] Documentation updated
- [ ] Mode 1 production-ready

---

### **WEEK 4: Templates for Modes 2-4**

#### **Days 1-2: Create BaseWorkflow Class**

**Goal**: Create abstract base class for all modes

**Tasks**:

1. **Create BaseWorkflow** (4 hours)
   ```python
   # services/vital-ai-services/src/vital_ai_services/workflows/base.py
   
   class BaseWorkflow(ABC):
       def __init__(self, registry: ServiceRegistry):
           self.registry = registry
           self.agent_selector = registry.get("agent_selector")
           self.rag_service = registry.get("rag_service")
           self.tool_registry = registry.get("tool_registry")
           self.memory_manager = registry.get("memory_manager")
       
       @abstractmethod
       async def execute(self, state: WorkflowState) -> WorkflowState:
           """Execute workflow"""
           
       async def select_agent(self, state: WorkflowState) -> WorkflowState:
           """Common agent selection logic"""
           
       async def retrieve_context(self, state: WorkflowState) -> WorkflowState:
           """Common RAG retrieval logic"""
           
       async def execute_tools(self, state: WorkflowState) -> WorkflowState:
           """Common tool execution logic"""
   ```

2. **Add Common Mixins** (2 hours)
   - [ ] `AgentSelectionMixin`
   - [ ] `RAGRetrievalMixin`
   - [ ] `ToolExecutionMixin`
   - [ ] `MemoryMixin`
   - [ ] `StreamingMixin`

3. **Test BaseWorkflow** (2 hours)
   - [ ] Create test workflow
   - [ ] Test each mixin
   - [ ] Test composition
   - [ ] Verify extensibility

**Deliverables**:
- [ ] `BaseWorkflow` abstract class
- [ ] Common mixins
- [ ] Unit tests
- [ ] Documentation

---

#### **Days 3-4: Create Mode Templates**

**Goal**: Create templates for Modes 2-4

**Tasks**:

1. **Mode 2 Template** (2 hours)
   ```
   Mode 2: Interactive Automatic (single-turn, automatic agent selection)
   Template: services/vital-ai-services/templates/mode2_template.py
   ```
   - [ ] Extend BaseWorkflow
   - [ ] Add automatic agent selection
   - [ ] Add RAG retrieval
   - [ ] Add tool execution
   - [ ] Add response formatting

2. **Mode 3 Template** (2 hours)
   ```
   Mode 3: Chat Manual (multi-turn, manual agent selection)
   Template: services/vital-ai-services/templates/mode3_template.py
   ```
   - [ ] Extend BaseWorkflow
   - [ ] Add memory management
   - [ ] Add conversation context
   - [ ] Add iterative reasoning
   - [ ] Add multi-turn handling

3. **Mode 4 Template** (2 hours)
   ```
   Mode 4: Chat Automatic (multi-turn, automatic agent selection)
   Template: services/vital-ai-services/templates/mode4_template.py
   ```
   - [ ] Extend BaseWorkflow
   - [ ] Add memory management
   - [ ] Add automatic agent selection per turn
   - [ ] Add conversation context
   - [ ] Add iterative reasoning

4. **Template Documentation** (2 hours)
   - [ ] Document each template
   - [ ] Add usage examples
   - [ ] Explain customization points
   - [ ] Add best practices

**Deliverables**:
- [ ] Mode 2 template
- [ ] Mode 3 template
- [ ] Mode 4 template
- [ ] Template documentation

---

#### **Day 5: Final Testing + Deployment Prep**

**Goal**: Final validation and deployment preparation

**Tasks**:

1. **Final Testing** (3 hours)
   - [ ] Test all templates
   - [ ] Test Mode 1 in production
   - [ ] Load testing
   - [ ] Security audit

2. **Deployment Preparation** (3 hours)
   - [ ] Create deployment guide
   - [ ] Update CI/CD pipeline
   - [ ] Prepare rollback plan
   - [ ] Create monitoring dashboard

3. **Knowledge Transfer** (2 hours)
   - [ ] Team presentation
   - [ ] Q&A session
   - [ ] Code walkthrough
   - [ ] Handoff documentation

**Deliverables**:
- [ ] Final test results
- [ ] Deployment guide
- [ ] Monitoring dashboard
- [ ] Team trained

---

## 📊 Success Metrics

### Code Quality
- **Code Duplication**: <10% (target: 70% reduction)
- **Test Coverage**: >90% for shared library
- **Cyclomatic Complexity**: <10 per function
- **Documentation Coverage**: 100% of public APIs

### Performance
- **Agent Selection**: <200ms (p95)
- **RAG Search**: <500ms (p95)
- **Tool Execution**: Varies by tool, within 10% of baseline
- **End-to-End Latency**: <2s (p95)

### Reliability
- **Error Rate**: <0.1%
- **Uptime**: >99.9%
- **Cache Hit Rate**: >80%
- **Fallback Success Rate**: 100%

### Development Velocity
- **New Mode Development**: <5 days (target: 60% reduction)
- **Bug Fix Time**: <2 hours (target: 80% reduction)
- **Feature Addition Time**: <1 day (target: 50% reduction)

---

## 🚀 Quick Start (After Implementation)

### For Developers

```bash
# Install shared library
cd services/vital-ai-services
pip install -e .

# Run tests
pytest

# Start AI engine with shared library
cd services/ai-engine
python3 src/main.py
```

### For New Mode Development

```python
from vital_ai_services.workflows.base import BaseWorkflow
from vital_ai_services.registry import ServiceRegistry

class MyNewWorkflow(BaseWorkflow):
    async def execute(self, state: WorkflowState) -> WorkflowState:
        # 1. Select agent (if automatic)
        state = await self.select_agent(state)
        
        # 2. Retrieve context
        state = await self.retrieve_context(state)
        
        # 3. Execute tools (if needed)
        state = await self.execute_tools(state)
        
        # 4. Generate response
        state = await self.generate_response(state)
        
        return state
```

---

## 📞 Support

For questions or issues:
- **Documentation**: See `services/vital-ai-services/README.md`
- **Examples**: See `services/vital-ai-services/examples/`
- **Issues**: Create GitHub issue with `[vital-ai-services]` prefix
- **Team**: Contact VITAL AI Platform Team

---

**Status**: ✅ Foundation Complete, 🚧 Week 1 In Progress

**Last Updated**: 2025-11-07

**Next Milestone**: Complete Week 1 Days 1-2 (AgentService + RAGService extraction)

