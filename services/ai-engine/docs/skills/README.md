# Skills Documentation Index

Welcome to the VITAL Skills Library documentation. This directory contains comprehensive documentation for all skill categories available in the platform.

## Skill Categories

### 1. [Planning Skills](./planning_skills.md)
Strategic planning, task breakdown, and workflow orchestration.
- Write TODOs
- Create Plan
- Strategic Planning

**Use Cases**: Complex task management, strategic initiatives, workflow design

---

### 2. [Delegation Skills](./delegation_skills.md)
Task assignment and agent spawning for distributed work.
- Delegate Task
- Spawn Specialist
- Spawn Worker

**Use Cases**: Multi-agent coordination, workload distribution, expertise routing

---

### 3. [Search Skills](./search_skills.md)
Hybrid search across multiple data sources using GraphRAG.
- Search Agents
- Search Knowledge Base
- Literature Search

**Use Cases**: Information retrieval, agent discovery, research

---

### 4. [Analysis Skills](./analysis_skills.md)
Data processing, statistical analysis, and insight generation.
- Clinical Data Analysis
- Evidence Synthesis
- Trend Analysis

**Use Cases**: Data science, research, decision support

---

### 5. [Generation Skills](./generation_skills.md)
Content creation and structured output generation.
- Scientific Writing
- Report Generation
- Code Generation

**Use Cases**: Documentation, automation, content creation

---

### 6. [Validation Skills](./validation_skills.md)
Quality assurance, compliance checking, and verification.
- Regulatory Compliance Check
- Data Quality Check
- Fact Verification

**Use Cases**: Quality control, compliance, error detection

---

### 7. [Communication Skills](./communication_skills.md)
Stakeholder interaction and information presentation.
- Scientific Communication
- Stakeholder Reporting
- Meeting Facilitation

**Use Cases**: Presentations, collaboration, knowledge sharing

---

### 8. [Data Retrieval Skills](./data_retrieval_skills.md)
Access to external databases and specialized data sources.
- FDA Database Search
- EMA Database Search
- Clinical Trials Search

**Use Cases**: Regulatory research, competitive intelligence, compliance

---

### 9. [Execution Skills](./execution_skills.md)
Workflow execution, task running, and process automation.
- Workflow Execution
- Task Execution
- Parallel Execution

**Use Cases**: Automation, batch processing, orchestration

---

### 10. [File Operations Skills](./file_operations_skills.md)
File and document manipulation capabilities.
- Read/Write/Edit Files
- File Conversion
- Directory Operations

**Use Cases**: Document processing, file management, data import/export

---

## Skill Architecture

### Execution Modes

Skills can be executed in two ways:

1. **Dynamic Execution** (`is_executable=true`)
   - Skills with `python_module` and `callable_name` in database
   - Loaded and executed dynamically
   - Most flexible and maintainable

2. **Type-Based Execution** (fallback)
   - Skills without dynamic configuration
   - Routed based on `skill_type` or `category`
   - Simpler but less flexible

### Database Integration

All skills are defined in the `skills` table with:
- `name`, `slug`, `description`
- `category`, `skill_type`
- `complexity_level`
- `python_module`, `callable_name` (for executable skills)
- `parameters_schema`
- `is_active`, `is_executable`

### Usage in LangGraph

Skills are compiled into LangGraph nodes via `skill_nodes.py`:

```python
from langgraph_compilation.nodes import compile_skill_node

node_func = await compile_skill_node({
    'node_name': 'analysis_step',
    'skill_id': skill_uuid,
    'config': {}
})
```

---

## Best Practices

### Skill Selection
1. Match skill complexity to agent level
2. Consider skill prerequisites
3. Check skill availability for tenant
4. Validate required permissions

### Skill Execution
1. Provide complete context
2. Handle errors gracefully
3. Validate inputs before execution
4. Monitor execution metrics

### Skill Development
1. Follow naming conventions
2. Document parameters clearly
3. Include usage examples
4. Add comprehensive error handling
5. Write integration tests

---

## Integration Points

### Tool Registry
Skills often use tools from the Tool Registry for external operations.

### GraphRAG Service
Search and retrieval skills integrate with GraphRAG for hybrid search.

### Agent Hierarchy
Skills are distributed across agent levels:
- **Level 1 (Master)**: Planning, delegation
- **Level 2 (Expert)**: Analysis, generation, validation
- **Level 3 (Specialist)**: Domain-specific execution
- **Level 4 (Worker)**: Routine execution, file operations
- **Level 5 (Tool)**: Atomic operations

---

## Getting Started

1. **Browse** skill categories above
2. **Review** examples and best practices
3. **Test** skills in development environment
4. **Integrate** into your agent workflows
5. **Monitor** performance and usage

---

## Support

For questions or issues:
- Check skill documentation
- Review database schema
- See LangGraph integration guide
- Contact platform team

---

**Last Updated**: November 23, 2025  
**Version**: 1.0.0

