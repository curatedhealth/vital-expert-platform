# Medical Affairs Analytics Agents - Seed Execution Guide

## Overview
This guide provides step-by-step instructions to seed a complete Medical Affairs Analytics agent hierarchy into your Supabase database.

## What Will Be Created

### Agents (5 total)
1. **Director of Medical Analytics** (Parent Agent)
   - Strategic leader and coordinator
   - Delegates to 4 specialist sub-agents

2. **Real-World Evidence Analyst** (Sub-agent)
   - RWE, HEOR, comparative effectiveness

3. **Clinical Data Scientist** (Sub-agent)
   - Clinical trials, ML, biomarker analysis

4. **Market Insights Analyst** (Sub-agent)
   - Market analysis, competitive intelligence

5. **HCP Engagement Analytics Specialist** (Sub-agent)
   - HCP behavior, omnichannel, MSL effectiveness

### Hierarchical Relationships (4 total)
- Director → RWE Analyst
- Director → Clinical Data Scientist
- Director → Market Insights Analyst
- Director → HCP Engagement Analytics Specialist

All relationships use `delegates_to` type with `auto_delegate=true` and `confidence_threshold=0.75`.

## Prerequisites

✅ AgentOS 3.0 Phase 0-3 schema must be applied:
- `agent_hierarchies` table exists
- `agents` table has required columns:
  - `name`, `display_name`, `description`, `system_prompt`
  - `model`, `temperature`, `max_tokens`
  - `capabilities` (TEXT[]), `business_function`

## Execution Steps

### Step 1: Navigate to Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar

### Step 2: Run the Seed File
1. Open the file: `.vital-command-center/04-TECHNICAL/data-schema/seeds/01_seed_medical_affairs_analytics_agents.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Success
You should see output like:
```
==================================================
Creating Medical Affairs Analytics Agents
==================================================

✓ Created: Director of Medical Analytics (ID: xxx)
✓ Created: Real-World Evidence Analyst (ID: xxx)
✓ Created: Clinical Data Scientist (ID: xxx)
✓ Created: Market Insights Analyst (ID: xxx)
✓ Created: HCP Engagement Analytics Specialist (ID: xxx)

Creating hierarchical relationships...

  ✓ Director → Real-World Evidence Analyst
  ✓ Director → Clinical Data Scientist
  ✓ Director → Market Insights Analyst
  ✓ Director → HCP Engagement Analytics Specialist

==================================================
Medical Affairs Analytics Team Created Successfully!
==================================================

Summary:
  - 1 Director (parent agent)
  - 4 Specialist agents (sub-agents)
  - 4 hierarchical delegation relationships
```

### Step 4: Review Verification Queries
The seed file includes 2 verification queries that will run automatically:

1. **Created Agents** - Shows all 5 agents with their business function
2. **Hierarchical Relationships** - Shows all 4 delegation relationships

## Expected Results

### Agents Table
```
| name                                     | business_function    | description_preview                          |
|------------------------------------------|----------------------|----------------------------------------------|
| Director of Medical Analytics            | Medical Analytics    | Senior leader overseeing medical analytics...
| Clinical Data Scientist                  | Medical Analytics    | Expert in clinical trial data analysis...     |
| HCP Engagement Analytics Specialist      | Medical Analytics    | Expert in healthcare professional (HCP)...    |
| Market Insights Analyst                  | Medical Analytics    | Expert in pharmaceutical market analysis...   |
| Real-World Evidence Analyst              | Medical Analytics    | Expert in real-world evidence analysis...     |
```

### Agent Hierarchies Table
```
| parent_agent                  | sub_agent                              | relationship_type | auto_delegate | confidence_threshold |
|-------------------------------|----------------------------------------|-------------------|---------------|----------------------|
| Director of Medical Analytics | Clinical Data Scientist                | delegates_to      | true          | 0.75                 |
| Director of Medical Analytics | HCP Engagement Analytics Specialist    | delegates_to      | true          | 0.75                 |
| Director of Medical Analytics | Market Insights Analyst                | delegates_to      | true          | 0.75                 |
| Director of Medical Analytics | Real-World Evidence Analyst            | delegates_to      | true          | 0.75                 |
```

## Troubleshooting

### Error: Column "role" does not exist
**Solution**: This seed file uses the correct schema (no `role` column). If you see this error, you may have the wrong seed file.

### Error: Relation "agent_hierarchies" does not exist
**Solution**: Run Phase 3 migration first:
```bash
psql $DATABASE_URL -f .vital-command-center/04-TECHNICAL/data-schema/phase3_agent_graphs.sql
```

### Error: Duplicate key value violates unique constraint
**Solution**: Agents already exist. Either:
1. Delete existing agents first, OR
2. Skip this seed file

To delete:
```sql
DELETE FROM agents WHERE name IN (
    'Director of Medical Analytics',
    'Real-World Evidence Analyst',
    'Clinical Data Scientist',
    'Market Insights Analyst',
    'HCP Engagement Analytics Specialist'
);
```

### Connection Timeout
**Solution**: The query is large but should complete in <10 seconds. If timeout occurs:
1. Check your database connection
2. Try running from local `psql` instead:
```bash
psql $DATABASE_URL -f .vital-command-center/04-TECHNICAL/data-schema/seeds/01_seed_medical_affairs_analytics_agents.sql
```

## Next Steps

After successful seeding:

1. ✅ **Test Hierarchical Delegation**:
   - Query the Director agent with a complex analytics request
   - Verify it delegates to appropriate sub-agents

2. ✅ **Assign Skills** (Optional):
   - Run `02_seed_agent_skills.sql` (to be created)

3. ✅ **Create Agent Graphs** (Optional):
   - Run `03_seed_agent_graphs.sql` (to be created)

4. ✅ **Integrate with Services**:
   - Use these agents in Ask Expert service
   - Test with Ask Panel service for multi-specialist queries

## Files Created
- `01_seed_medical_affairs_analytics_agents.sql` - Main seed file (THIS FILE)
- `SEED_EXECUTION_GUIDE.md` - This documentation

## Support
For issues or questions, refer to:
- `.vital-command-center/01-TEAM/agents/sql-supabase-specialist.md`
- `.vital-command-center/04-TECHNICAL/data-schema/README.md`

