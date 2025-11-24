# Phase 2: LangGraph Compilation - Test Plan

**Date**: 2025-11-22  
**Status**: Implementation Ready  
**Coverage Target**: >80%

---

## Test Structure

```
backend/services/ai_engine/tests/langgraph_compiler/
├── conftest.py                    # Shared fixtures and setup
├── test_compiler.py               # Compiler core tests
├── test_checkpointer.py           # Checkpointer tests
├── test_agent_nodes.py            # Agent node tests
├── test_skill_nodes.py            # Skill node tests
├── test_panel_nodes.py            # Panel node tests
├── test_other_nodes.py            # Router/tool/human tests
├── test_patterns/
│   ├── test_tree_of_thoughts.py   # ToT pattern tests
│   ├── test_react_agent.py        # ReAct pattern tests
│   └── test_constitutional_ai.py  # Constitutional AI tests
└── test_integration.py            # End-to-end integration tests
```

---

## Test Categories

### 1. Unit Tests

**Scope**: Individual components in isolation  
**Mocking**: All external dependencies (database, OpenAI, etc.)  
**Coverage Target**: >90%

#### 1.1 Compiler Core (`test_compiler.py`)
- `test_initialize()` - Initialization succeeds
- `test_load_graph_definition()` - Loads graph from database
- `test_load_graph_nodes()` - Loads nodes correctly
- `test_load_graph_edges()` - Loads edges correctly
- `test_compile_graph_simple()` - Compiles 2-node graph
- `test_compile_graph_with_conditional_edges()` - Handles conditional routing
- `test_compile_graph_not_found()` - Handles missing graph
- `test_compile_node_agent()` - Delegates to agent compiler
- `test_compile_node_skill()` - Delegates to skill compiler
- `test_compile_node_panel()` - Delegates to panel compiler
- `test_compile_node_unknown_type()` - Raises error for unknown type

#### 1.2 Checkpointer (`test_checkpointer.py`)
- `test_initialize()` - Initialization succeeds
- `test_aget_checkpoint()` - Retrieves checkpoint by session
- `test_aget_checkpoint_not_found()` - Returns None for missing
- `test_aput_checkpoint()` - Saves checkpoint correctly
- `test_alist_checkpoints()` - Lists all checkpoints for session
- `test_get_session_history()` - Returns full history
- `test_delete_session()` - Deletes all checkpoints
- `test_get_latest_state()` - Gets most recent state
- `test_get_next_step_index()` - Auto-increments correctly

#### 1.3 Agent Nodes (`test_agent_nodes.py`)
- `test_compile_standard_agent()` - Standard agent node
- `test_compile_planner_agent()` - ToT planner node
- `test_compile_executor_agent()` - ReAct executor node
- `test_compile_critic_agent()` - Constitutional AI critic
- `test_compile_synthesizer_agent()` - Synthesizer node
- `test_load_agent()` - Loads from v_agent_complete
- `test_load_role()` - Loads from agent_node_roles
- `test_execute_standard_agent()` - Executes and updates state
- `test_agent_error_handling()` - Handles LLM errors

#### 1.4 Skill Nodes (`test_skill_nodes.py`)
- `test_compile_tool_skill()` - Tool skill node
- `test_compile_capability_skill()` - Capability skill node
- `test_compile_lang_component_skill()` - LangGraph component skill
- `test_load_skill()` - Loads from skills table
- `test_execute_skill()` - Stores results in state

#### 1.5 Panel Nodes (`test_panel_nodes.py`)
- `test_compile_panel_node()` - Panel node compilation
- `test_execute_parallel_panel()` - Parallel execution with asyncio.gather
- `test_execute_consensus_panel()` - Consensus with rounds
- `test_execute_debate_panel()` - Debate with pro/con positions
- `test_execute_sequential_panel()` - Sequential with context building
- `test_store_panel_vote()` - Database storage
- `test_store_panel_arbitration()` - Arbitration storage
- `test_has_consensus()` - Consensus detection
- `test_panel_agent_failure()` - Handles individual agent errors

#### 1.6 Other Nodes (`test_other_nodes.py`)
- `test_compile_router_node()` - Router compilation
- `test_router_key_based()` - Key-based routing
- `test_router_confidence_based()` - Confidence routing
- `test_compile_tool_node()` - Tool node
- `test_execute_tool()` - Tool execution
- `test_compile_human_node()` - Human-in-loop node
- `test_human_review_flag()` - Sets review flags

---

### 2. Pattern Tests

#### 2.1 Tree-of-Thoughts (`test_tree_of_thoughts.py`)
- `test_tot_initialization()` - Initializes correctly
- `test_tot_plan_simple()` - Generates simple plan
- `test_tot_plan_with_constraints()` - Respects constraints
- `test_generate_thoughts()` - Generates branching factor thoughts
- `test_evaluate_thoughts_by_value()` - Value-based evaluation
- `test_evaluate_thoughts_by_vote()` - Vote-based evaluation
- `test_find_best_path()` - Finds highest scoring path
- `test_extract_plan()` - Converts path to plan
- `test_get_tree()` - Serializes tree

#### 2.2 ReAct Agent (`test_react_agent.py`)
- `test_react_initialization()` - Initializes with tools
- `test_react_execute_simple()` - Simple task without tools
- `test_react_execute_with_tools()` - Task with tool calls
- `test_parse_react_response()` - Parses thought/action/observation
- `test_parse_tool_args()` - Parses tool arguments
- `test_execute_tool()` - Executes tool function
- `test_add_tool()` - Adds tool to toolbox
- `test_max_iterations()` - Stops at max iterations
- `test_tool_error_handling()` - Handles tool errors

#### 2.3 Constitutional AI (`test_constitutional_ai.py`)
- `test_constitutional_initialization()` - Init with constitution
- `test_critique_passes()` - Response passes all principles
- `test_critique_fails()` - Response fails some principles
- `test_critique_principle()` - Single principle evaluation
- `test_revise_output()` - Revises based on critique
- `test_iterative_critique()` - Multiple revision rounds
- `test_single_critique()` - Single-pass mode
- `test_get_max_severity()` - Severity calculation
- `test_add_principle()` - Adds principle to constitution
- `test_default_constitution()` - Medical AI principles

---

### 3. Integration Tests (`test_integration.py`)

**Scope**: End-to-end workflows  
**Mocking**: Minimal (only external APIs)  
**Coverage Target**: >70%

#### 3.1 Simple Graph Execution
- `test_compile_and_execute_simple_graph()` - 2-node graph (agent → END)
- `test_state_persistence()` - Checkpoints saved during execution
- `test_state_recovery()` - Resume from checkpoint

#### 3.2 Conditional Routing
- `test_conditional_routing_graph()` - Router directs to different paths
- `test_confidence_based_routing()` - Routes based on confidence

#### 3.3 Panel Execution
- `test_parallel_panel_execution()` - Multiple agents in parallel
- `test_consensus_panel_execution()` - Consensus with rounds
- `test_debate_panel_execution()` - Debate with positions

#### 3.4 Deep Agent Patterns
- `test_tot_planner_execution()` - ToT planner in graph
- `test_react_executor_execution()` - ReAct executor with tools
- `test_constitutional_critic_execution()` - Critic validates output

#### 3.5 Complex Workflows
- `test_planner_executor_critic_workflow()` - Full ToT → ReAct → Constitutional
- `test_panel_then_synthesizer()` - Panel discussion → synthesizer
- `test_human_in_loop_workflow()` - Agent → Human → Critic

#### 3.6 Error Handling
- `test_node_error_recovery()` - Handles node errors gracefully
- `test_invalid_graph()` - Handles malformed graph definitions
- `test_missing_agent()` - Handles missing agent references

---

## Test Fixtures (`conftest.py`)

### Database Fixtures
```python
@pytest.fixture
async def mock_pg_client():
    \"\"\"Mock PostgreSQL client\"\"\"
    
@pytest.fixture
async def test_graph_definition():
    \"\"\"Sample graph definition\"\"\"
    
@pytest.fixture
async def test_agent():
    \"\"\"Sample agent record\"\"\"
```

### Pattern Fixtures
```python
@pytest.fixture
def mock_openai_client():
    \"\"\"Mock OpenAI client\"\"\"
    
@pytest.fixture
def sample_constitution():
    \"\"\"Sample constitutional principles\"\"\"
    
@pytest.fixture
def sample_tools():
    \"\"\"Sample tool functions for ReAct\"\"\"
```

### State Fixtures
```python
@pytest.fixture
def initial_state():
    \"\"\"Initial AgentState for testing\"\"\"
    
@pytest.fixture
def session_id():
    \"\"\"Test session UUID\"\"\"
```

---

## Mocking Strategy

### OpenAI API Mocking
```python
@pytest.fixture
def mock_openai_response():
    return {
        "choices": [{
            "message": {
                "content": "Test response"
            }
        }]
    }
```

### Database Mocking
```python
@pytest.fixture
async def mock_pg_connection():
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value={...})
    conn.fetch = AsyncMock(return_value=[...])
    return conn
```

### LangGraph Mocking
- Don't mock LangGraph itself - use actual StateGraph
- Mock only the node functions being tested

---

## Test Execution

### Run All Tests
```bash
pytest backend/services/ai_engine/tests/langgraph_compiler/ -v
```

### Run with Coverage
```bash
pytest backend/services/ai_engine/tests/langgraph_compiler/ --cov=langgraph_compiler --cov-report=html
```

### Run Specific Test File
```bash
pytest backend/services/ai_engine/tests/langgraph_compiler/test_compiler.py -v
```

### Run Integration Tests Only
```bash
pytest backend/services/ai_engine/tests/langgraph_compiler/test_integration.py -v
```

---

## Success Criteria

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Code coverage >80% overall
- ✅ Pattern coverage >85%
- ✅ No flaky tests
- ✅ Tests run in <60 seconds (unit)
- ✅ Tests run in <300 seconds (integration)

---

## Implementation Priority

1. **Critical (P0)**: `conftest.py`, `test_compiler.py`, `test_checkpointer.py`
2. **High (P1)**: `test_agent_nodes.py`, `test_panel_nodes.py`, `test_integration.py`
3. **Medium (P2)**: Pattern tests, skill/router/tool/human tests
4. **Low (P3)**: Performance tests, stress tests

---

## Notes

- Use `pytest-asyncio` for async test support
- Use `pytest-mock` for mocking utilities
- Use `pytest-cov` for coverage reports
- Tests should be deterministic (no random failures)
- Each test should be independent (no shared state)
- Mock external APIs (OpenAI, Neo4j, Pinecone) in unit tests
- Use test database for integration tests

---

**Test Implementation Status**: Plan Complete, Ready for Implementation  
**Estimated Test Code**: ~2,000-2,500 lines  
**Estimated Implementation Time**: 4-6 hours

