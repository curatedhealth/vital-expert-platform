# Phase 0: Schema Completion Execution Instructions

## Overview
Phase 0 adds 13 new tables for GraphRAG and Advanced Agents support.

## Execution Method

Due to the size of this migration, please execute it directly in your Supabase SQL Editor or via `psql`:

### Option 1: Supabase SQL Editor
1. Navigate to your Supabase project SQL Editor
2. Open the file: `.vital-docs/vital-expert-docs/11-data-schema/agents/migrations/phase0_schema_completion.sql`
3. Copy and paste the entire content
4. Click "Run"

### Option 2: psql Command Line
```bash
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/migrations/phase0_schema_completion.sql
```

## Verification

After execution, run the verification script:

```bash
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/migrations/verification/phase0_verification.sql
```

## Expected Results

- **13 new tables** created
- **1 column** added to `agent_graph_nodes`
- **10 agent node roles** seeded
- Multiple indexes and constraints created

## Tables Created

### Knowledge Graph Metadata (4 tables)
- `kg_node_types` - Registry of allowed node types
- `kg_edge_types` - Registry of allowed edge types  
- `agent_kg_views` - Per-agent graph view filters
- `kg_sync_log` - Postgres ↔ Neo4j sync tracking

### Node Roles & Validators (3 tables)
- `agent_node_roles` - Node role definitions
- `agent_validators` - Validator registry
- `agent_node_validators` - Node-validator assignments

### Memory System (4 tables)
- `agent_memory_episodic` - Session-level memory
- `agent_memory_semantic` - Learned facts
- `agent_memory_instructions` - Adaptive rules
- `agent_state` - LangGraph state persistence

### Panel System (2 tables)
- `agent_panel_votes` - Individual agent votes
- `agent_panel_arbitrations` - Panel arbitration results

## Next Steps

After successful execution:
1. Run `seed_kg_metadata.sql` (being created next)
2. Run `seed_agent_kg_views.sql` (being created next)
3. Proceed to Phase 1: GraphRAG Foundation

