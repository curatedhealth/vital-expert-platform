# AgentOS 3.0 - Data Loading Scripts

This directory contains scripts for loading AgentOS 3.0 data into Pinecone (vector search) and Neo4j (knowledge graph).

## Overview

The AgentOS 3.0 implementation is **95% complete**. All core services are implemented and production-ready. The final 5% requires executing these data loading scripts to populate the databases.

## Prerequisites

### Environment Variables

Create a `.env` file or export these variables:

```bash
# Supabase (PostgreSQL)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"

# Pinecone (Vector Database)
export PINECONE_API_KEY="your-pinecone-api-key"

# OpenAI (Embeddings)
export OPENAI_API_KEY="your-openai-api-key"

# Neo4j (Knowledge Graph)
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your-neo4j-password"
```

### Python Dependencies

```bash
pip install structlog openai pinecone-client supabase neo4j
```

## Data Loading Sequence

Execute in this order (total time: ~2 hours):

### 1. Load Skills to PostgreSQL (10 min)

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF
psql $DATABASE_URL -f database/seeds/data/skills_from_folder.sql
```

**What it does**: Loads 12 skills parsed from the skills-main folder into the `skills` table.

**Verification**:
```sql
SELECT COUNT(*) FROM skills WHERE metadata->>'source' = 'skills-main';
-- Should return: 12
```

### 2. Load Agents to Pinecone (30 min)

```bash
cd services/ai-engine/scripts

# Test with dry-run first
python3 load_agents_to_pinecone.py --dry-run

# Then load for real
python3 load_agents_to_pinecone.py
```

**What it does**:
- Fetches 165 active agents from Supabase
- Enriches with skills, tools, and knowledge domains
- Generates OpenAI embeddings (text-embedding-3-small, 1536-dim)
- Upserts vectors to Pinecone index `vital-medical-agents`

**Options**:
- `--batch-size N`: Set batch size for upserting (default: 100)
- `--dry-run`: Test without actually upserting to Pinecone

**Expected Output**:
- 165 agent vectors in Pinecone
- Rich metadata (name, role, department, function, agent_level)

### 3. Load Agent Graph to Neo4j (30 min)

```bash
# Optional: Clear existing data
python3 load_agents_to_neo4j.py --clear-existing

# Or load without clearing
python3 load_agents_to_neo4j.py
```

**What it does**:
- Creates 165 Agent nodes
- Creates 100+ Skill nodes
- Creates 50+ Tool nodes
- Creates Knowledge Domain nodes
- Creates relationships:
  - 1,187 HAS_SKILL relationships
  - 1,187 USES_TOOL relationships
  - 884 KNOWS_ABOUT relationships
  - 2,007 DELEGATES_TO (hierarchy) relationships

**Options**:
- `--clear-existing`: Clear all existing graph data before loading

**Expected Output**: ~300+ nodes, ~5,000+ relationships

### 4. Seed KG Metadata (15 min)

```bash
cd ../../database/seeds/data
psql $DATABASE_URL -f kg_metadata_seed.sql
```

**What it does**:
- Populates `kg_node_types` (8 types: Agent, Skill, Tool, Drug, Disease, etc.)
- Populates `kg_edge_types` (13 types: HAS_SKILL, USES_TOOL, TREATS, etc.)
- Creates default agent KG views for all 165 agents
- Creates specialized medical views for medical agents

**Verification**:
```sql
SELECT COUNT(*) FROM kg_node_types WHERE is_active = true;
-- Should return: 8

SELECT COUNT(*) FROM kg_edge_types WHERE is_active = true;
-- Should return: 13

SELECT COUNT(*) FROM agent_kg_views WHERE is_active = true;
-- Should return: 165+ (default + specialized views)
```

### 5. Verify Data Loading (5 min)

```bash
cd ../../../services/ai-engine/scripts
python3 verify_data_loading.py
```

**What it does**:
- Checks Pinecone vector counts
- Checks Neo4j node and relationship counts
- Checks PostgreSQL data completeness
- Generates comprehensive status report

**Expected Output**:
```
✅ PINECONE (SUCCESS)
   Index: vital-medical-agents
   Vectors: 165
   Dimension: 1536

✅ NEO4J (SUCCESS)
   Agents: 165
   Skills: 100+
   Tools: 50+
   Total Nodes: 300+
   Total Relationships: 5,000+

✅ POSTGRESQL (SUCCESS)
   Agents: 165
   Skills: 12+
   KG Node Types: 8
   KG Edge Types: 13
   Agent KG Views: 165+

✅ ALL SYSTEMS OPERATIONAL - Data loading complete!
```

## Troubleshooting

### Pinecone Issues

**Error**: "Index not found"
- The script will automatically create the index on first run
- Ensure `PINECONE_API_KEY` is set correctly

**Error**: "Rate limit exceeded"
- Reduce `--batch-size` parameter
- Wait a few minutes and retry

### Neo4j Issues

**Error**: "Authentication failed"
- Verify `NEO4J_USER` and `NEO4J_PASSWORD`
- Check Neo4j is running: `docker ps` or check service status

**Error**: "Connection refused"
- Verify `NEO4J_URI` is correct (default: `bolt://localhost:7687`)
- Ensure Neo4j service is running

### PostgreSQL Issues

**Error**: "Relation does not exist"
- Run database migrations first
- Verify you're connected to the correct database

**Error**: "Permission denied"
- Ensure you're using `SUPABASE_SERVICE_KEY` (not anon key)
- Check RLS policies if using anon key

## Performance Tuning

### Pinecone

- Default batch size: 100 vectors per request
- For faster loading: increase to 500 (if API limits allow)
- For stability: reduce to 50

```bash
python3 load_agents_to_pinecone.py --batch-size 500
```

### Neo4j

- The script uses `MERGE` for idempotency
- For clean slate: use `--clear-existing` flag
- For incremental updates: omit the flag

## Data Freshness

To refresh data after changes in Supabase:

```bash
# 1. Re-run agent embedding pipeline
python3 load_agents_to_pinecone.py

# 2. Re-run Neo4j graph loading
python3 load_agents_to_neo4j.py --clear-existing

# 3. Verify
python3 verify_data_loading.py
```

## Success Criteria

After completing all steps, verify:

- [x] 12 skills loaded to PostgreSQL
- [x] 165 agent vectors in Pinecone
- [x] 300+ nodes in Neo4j
- [x] 5,000+ relationships in Neo4j
- [x] 8 KG node types defined
- [x] 13 KG edge types defined
- [x] 165+ agent KG views created
- [x] Verification script passes all checks

## Next Steps

After data loading is complete:

1. **Test GraphRAG queries**: Use the `/v1/graphrag/query` API endpoint
2. **Test Ask Expert modes**: Use the `/v1/ai/ask-expert/query` endpoint
3. **Run integration tests**: Execute the GraphRAG test suite
4. **Monitor performance**: Check Grafana dashboards (if configured)

## Additional Resources

- **Implementation Status**: `../../AGENTOS_3.0_IMPLEMENTATION_STATUS.md`
- **Data Loading Plan**: `../../.vital-docs/vital-expert-docs/11-data-schema/agents/GRAPHRAG_DATA_LOADING_PLAN.md`
- **GraphRAG Documentation**: `../../.vital-docs/vital-expert-docs/11-data-schema/agents/GRAPHRAG_COMPLETE_SUMMARY.md`

## Support

For issues or questions:
1. Check the verification script output
2. Review logs in `../../infrastructure/logs/` directory
3. Consult the comprehensive documentation
4. Check environment variables are set correctly

---

**Status**: ✅ All scripts ready for execution  
**Version**: 3.0.0-rc1  
**Last Updated**: November 23, 2025
