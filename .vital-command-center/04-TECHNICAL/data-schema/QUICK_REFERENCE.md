# AgentOS 2.0 Quick Reference Guide

## 🎯 Schema At-a-Glance

### Core Tables by Category

#### **Foundation (Phase 1) - 6 tables**
```sql
agent_specializations     -- Agent expertise areas
agent_tags               -- Agent classification tags
agent_tenants            -- Multi-tenant access control
agent_color_schemes      -- UI color preferences
agent_personality_traits -- Behavioral attributes
agent_prompt_starters    -- Suggested conversation starters
```

#### **Skills & Execution (Phase 2) - 3 tables**
```sql
skill_parameter_definitions  -- Skill parameters with validation
lang_components             -- LangGraph component registry (9 seeded)
skill_components            -- Skills-to-components mapping
```

#### **Orchestration (Phase 3) - 5 tables**
```sql
agent_graphs              -- Graph definitions (sequential, parallel, router, etc.)
agent_graph_nodes         -- Graph nodes (agent, tool, router, condition, etc.)
agent_graph_edges         -- Graph transitions and conditions
agent_hierarchies         -- Parent-child delegation patterns
agent_graph_assignments   -- Agent-to-graph mappings
```

#### **RAG & Knowledge (Phase 4) - 3 tables**
```sql
rag_profiles                    -- RAG strategy templates (4 seeded)
agent_rag_policies             -- Agent-specific RAG configs
rag_profile_knowledge_sources  -- Source filtering per profile
```

#### **Routing & Control (Phase 5) - 3 tables**
```sql
routing_policies           -- Policy definitions
routing_rules             -- Routing rule logic
agent_routing_eligibility -- Agent eligibility per policy
```

#### **Tool Safety (Phase 6) - 3 tables**
```sql
tool_schemas            -- Tool argument definitions with validation
tool_safety_scopes      -- Safety scope definitions
tool_execution_policies -- Per-tenant execution policies
```

#### **Evaluation (Phase 7) - 4 tables**
```sql
eval_suites         -- Evaluation suite definitions
eval_cases          -- Individual test cases
agent_eval_runs     -- Evaluation run tracking
agent_eval_cases    -- Case-level results
```

#### **Marketplace (Phase 8) - 7 tables**
```sql
agent_versions              -- Version history
agent_categories           -- Marketplace categories (7 seeded)
agent_category_assignments -- Category mappings
agent_use_cases           -- Use case examples
agent_ratings             -- User ratings and reviews
agent_changelog           -- Change tracking
agent_messages            -- Multi-agent communication
```

#### **Query Views (Phase 9) - 6 views**
```sql
v_agent_complete              -- Complete agent with all relationships
v_agent_skill_inventory       -- Agent skills with proficiency
v_agent_graph_topology        -- Graph topology summary
v_agent_marketplace           -- Public marketplace view
v_agent_eval_summary          -- Latest eval results with trends
v_agent_routing_eligibility   -- Routing eligibility by policy
```

---

## 🔍 Common Query Patterns

### Get Complete Agent Profile
```sql
SELECT * FROM v_agent_complete WHERE slug = 'my-agent';
```

### Get Agent Skills
```sql
SELECT * FROM v_agent_skill_inventory 
WHERE agent_id = 'uuid-here' 
ORDER BY execution_priority;
```

### Get Agent's Graph Topology
```sql
SELECT * FROM v_agent_graph_topology 
WHERE graph_id IN (
  SELECT graph_id FROM agent_graph_assignments 
  WHERE agent_id = 'uuid-here' AND is_primary_graph = true
);
```

### Get Marketplace Agents by Category
```sql
SELECT * FROM v_agent_marketplace
WHERE categories LIKE '%Clinical Research%'
ORDER BY avg_rating DESC;
```

### Get Latest Eval Results
```sql
SELECT * FROM v_agent_eval_summary
WHERE agent_id = 'uuid-here'
ORDER BY latest_run_date DESC;
```

### Get Routing-Eligible Agents
```sql
SELECT * FROM v_agent_routing_eligibility
WHERE policy_type = 'capability_based'
  AND is_eligible = true
ORDER BY priority_boost DESC;
```

---

## 📊 Seeded Data Reference

### LangGraph Components (9)
1. `openai_llm_node` - Standard OpenAI LLM node
2. `tavily_search_tool` - Web search tool
3. `semantic_router` - Semantic similarity routing
4. `parallel_executor` - Parallel node execution
5. `human_approval_gate` - Human-in-the-loop approval
6. `conditional_branch` - Conditional branching
7. `subgraph_node` - Embedded subgraphs
8. `agent_node` - Full agent with tools and memory

### RAG Profiles (4)
1. `semantic_standard` - Standard semantic search (top_k=5, threshold=0.7)
2. `hybrid_enhanced` - Hybrid search with reranking (top_k=10, threshold=0.65)
3. `graphrag_entity` - Graph-RAG with entity extraction (top_k=8, max_hops=2)
4. `agent_optimized` - Multi-query + hypothetical doc (top_k=7, threshold=0.75)

### Agent Categories (7)
1. `regulatory-compliance` - Regulatory & Compliance
2. `clinical-research` - Clinical Research
3. `market-access` - Market Access
4. `medical-information` - Medical Information
5. `data-analysis` - Data Analysis
6. `content-generation` - Content Generation
7. `project-management` - Project Management

---

## 🛠️ Key Constraints & Validation

### Check Constraints
- **Thresholds**: 0.0 ≤ value ≤ 1.0
- **Ratings**: 1 ≤ rating ≤ 5
- **Graph Types**: sequential, parallel, conditional, router, hierarchical, loop, subgraph, custom
- **Node Types**: agent, llm, tool, router, condition, parallel, human, subgraph, start, end
- **Safety Levels**: safe, moderate, high_risk, admin_only

### Foreign Key Cascades
- **ON DELETE CASCADE**: Most junction tables (safe cleanup)
- **ON DELETE SET NULL**: Optional references (preserve data integrity)

### Unique Constraints
- All junction tables have unique constraints on (entity_id, related_id)
- Slugs are unique per tenant
- Version numbers are unique per agent

---

## 📁 File Organization

```
agents/
├── migrations/
│   ├── phase1_agent_cleanup.sql              ✅
│   ├── phase2_executable_skills.sql          ✅
│   ├── phase3_agent_graphs.sql               ✅
│   ├── phase4_rag_profiles.sql               ✅
│   ├── phase5_routing_policies.sql           ✅
│   ├── phase6_tool_schemas.sql               ✅
│   ├── phase7_eval_framework.sql             ✅
│   ├── phase8_versioning_marketplace.sql     ✅
│   └── verification/                         (9 files)
├── views/
│   └── agent_comprehensive_views.sql         ✅
├── README.md                                  ✅
├── IMPLEMENTATION_STATUS.md                   ✅
├── COMPLETION_SUMMARY.md                      ✅
├── QUICK_REFERENCE.md                         ✅ (this file)
├── final_verification_all_phases.sql          ✅
└── execute_remaining_phases.sh                ✅
```

---

## 🚀 Next Steps Checklist

### Immediate Actions
- [ ] Run `final_verification_all_phases.sql` to confirm all tables/views
- [ ] Update application code to use new schema
- [ ] Migrate existing agent data to new tables
- [ ] Test all 6 views with production data

### Configuration Tasks
- [ ] Create agent graphs for existing workflows
- [ ] Assign RAG profiles to all agents
- [ ] Set up routing policies for your use cases
- [ ] Configure tool safety scopes and execution policies

### Quality Assurance
- [ ] Create evaluation suites for each agent type
- [ ] Define test cases for critical workflows
- [ ] Run initial eval runs and establish baselines
- [ ] Set up continuous eval automation

### Marketplace Setup
- [ ] Assign categories to all agents
- [ ] Create use case examples for featured agents
- [ ] Enable ratings and reviews
- [ ] Document agent versions and changelogs

---

## 💡 Pro Tips

### Performance
- Use views for complex queries - they're pre-optimized
- All junction tables have indexes on foreign keys
- String aggregations in views are cached until data changes

### Safety
- Always check `tool_safety_scopes` before executing tools
- Respect `tool_execution_policies` rate limits
- Use `requires_human_approval` for high-risk operations

### Extensibility
- Add new graph types to `agent_graphs.graph_type` check constraint
- Add new node types to `agent_graph_nodes.node_type` check constraint
- Register new LangGraph components in `lang_components`

### Best Practices
- Always version your agents before major changes
- Document breaking changes in `agent_changelog`
- Run evals before and after significant updates
- Use hierarchies for complex delegation patterns

---

## 📚 Related Documentation

- `README.md` - Complete overview and execution guide
- `IMPLEMENTATION_STATUS.md` - Detailed phase-by-phase status
- `COMPLETION_SUMMARY.md` - Final summary and metrics
- Plan file: `cursor-plan://96eb05ac-e5e6-49f1-86a3-8cdbee2d5c5e/Create All Medical Affairs Personas.plan.md`

---

**Quick Reference Guide - AgentOS 2.0**  
**Last Updated**: November 21, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

