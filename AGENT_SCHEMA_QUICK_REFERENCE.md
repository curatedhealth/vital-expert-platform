# Agent Schema Quick Reference

**For Developers:** Copy-paste SQL snippets for common operations

---

## Installation

```bash
# Apply migrations
psql $DATABASE_URL -f supabase/migrations/012_agent_workflow_integration.sql
psql $DATABASE_URL -f supabase/migrations/013_migrate_agent_knowledge_domains.sql

# Verify
psql $DATABASE_URL -f scripts/verify_agent_schema.sql
```

---

## Common Queries

### Find Best Agent for Question

```sql
SELECT
    agent_id,
    display_name,
    tier,
    match_score
FROM get_workflow_compatible_agents(
    p_tenant_id := '00000000-0000-0000-0000-000000000001', -- Replace
    p_workflow_type := 'ask_expert',
    p_required_capabilities := ARRAY['fda_510k_submission'],
    p_required_domains := ARRAY['FDA_REGULATORY'],
    p_min_tier := 1,
    p_max_tier := 2
)
LIMIT 1;
```

### Select Panel of 5 Experts

```sql
SELECT * FROM get_workflow_compatible_agents(
    p_tenant_id := 'YOUR_TENANT_ID',
    p_workflow_type := 'ask_panel',
    p_required_capabilities := ARRAY['clinical_trial_design', 'statistical_planning'],
    p_required_domains := ARRAY['CLINICAL_TRIALS'],
    p_min_tier := 2,
    p_max_tier := 3
)
LIMIT 5;
```

### Get Agent with Full Details

```sql
SELECT
    a.*,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'domain', COALESCE(kd.name, akd.domain_name),
                'proficiency', akd.proficiency_level,
                'is_primary', akd.is_primary_domain
            )
        )
        FROM agent_knowledge_domains akd
        LEFT JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE akd.agent_id = a.id
    ) as knowledge_domains
FROM agents a
WHERE a.name = 'fda-regulatory-strategist';
```

### List All Agents by Tier

```sql
SELECT
    tier,
    COUNT(*) as agent_count,
    array_agg(display_name ORDER BY display_name) as agents
FROM agents
WHERE status = 'active'
GROUP BY tier
ORDER BY tier;
```

---

## Workflow Operations

### Create Workflow Instance

```sql
INSERT INTO workflow_instances (
    tenant_id,
    user_id,
    workflow_type,
    workflow_mode,
    input_data,
    status,
    started_at
)
VALUES (
    'YOUR_TENANT_ID',
    'YOUR_USER_ID',
    'ask_panel',
    2,
    '{"question": "Your question here", "context": "Additional context"}'::jsonb,
    'running',
    NOW()
)
RETURNING id;
```

### Assign Agents to Workflow

```sql
INSERT INTO agent_assignments (
    workflow_instance_id,
    agent_id,
    assignment_role,
    status
)
VALUES
    ('workflow-id', 'agent-1-id', 'primary', 'assigned'),
    ('workflow-id', 'agent-2-id', 'specialist', 'assigned'),
    ('workflow-id', 'agent-3-id', 'reviewer', 'assigned');
```

### Update Agent Response

```sql
UPDATE agent_assignments
SET
    status = 'completed',
    agent_response = '{"answer": "...", "reasoning": "..."}'::jsonb,
    response_summary = 'Brief summary of response',
    confidence_score = 92.5,
    completed_at = NOW()
WHERE id = 'assignment-id';
```

### Complete Workflow

```sql
UPDATE workflow_instances
SET
    status = 'completed',
    output_data = '{"consensus": "...", "recommendation": "..."}'::jsonb,
    completed_at = NOW()
WHERE id = 'workflow-id';
```

### Get Workflow Status

```sql
SELECT
    wi.*,
    COUNT(aa.id) as total_agents,
    COUNT(aa.id) FILTER (WHERE aa.status = 'completed') as completed_agents,
    ROUND(AVG(aa.confidence_score), 2) as avg_confidence
FROM workflow_instances wi
LEFT JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
WHERE wi.id = 'workflow-id'
GROUP BY wi.id;
```

---

## TypeScript API Examples

### Find Best Agent

```typescript
const { data: bestAgent } = await supabase
  .rpc('get_workflow_compatible_agents', {
    p_tenant_id: tenantId,
    p_workflow_type: 'ask_expert',
    p_required_capabilities: ['fda_510k_submission'],
    p_required_domains: ['FDA_REGULATORY'],
    p_min_tier: 1,
    p_max_tier: 2,
  })
  .limit(1)
  .single();
```

### Create Workflow

```typescript
const { data: workflow } = await supabase
  .from('workflow_instances')
  .insert({
    tenant_id: tenantId,
    user_id: userId,
    workflow_type: 'ask_panel',
    workflow_mode: 2,
    input_data: { question, context },
    status: 'running',
    started_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Get Workflow History

```typescript
const { data: workflows } = await supabase
  .from('workflow_instances')
  .select(`
    *,
    agent_assignments (
      id,
      status,
      confidence_score,
      agents (display_name, avatar)
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

---

## Monitoring Queries

### Active Workflows

```sql
SELECT
    wi.id,
    wi.workflow_type,
    wi.workflow_mode,
    wi.status,
    wi.started_at,
    EXTRACT(EPOCH FROM (NOW() - wi.started_at)) / 60 as running_minutes,
    COUNT(aa.id) as agent_count,
    COUNT(aa.id) FILTER (WHERE aa.status = 'completed') as completed_agents
FROM workflow_instances wi
LEFT JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
WHERE wi.status IN ('pending', 'running')
GROUP BY wi.id
ORDER BY wi.started_at;
```

### Agent Workload

```sql
SELECT
    a.display_name,
    a.tier,
    COUNT(*) FILTER (WHERE aa.status = 'assigned') as assigned,
    COUNT(*) FILTER (WHERE aa.status = 'working') as working,
    COUNT(*) FILTER (WHERE aa.status = 'completed' AND aa.completed_at >= NOW() - INTERVAL '1 hour') as completed_last_hour,
    ROUND(AVG(aa.duration_seconds) FILTER (WHERE aa.status = 'completed'), 2) as avg_duration
FROM agents a
JOIN agent_assignments aa ON a.id = aa.agent_id
WHERE aa.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY a.id, a.display_name, a.tier
ORDER BY working DESC, assigned DESC;
```

### Workflow Success Rate

```sql
SELECT
    workflow_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) as success_rate,
    ROUND(AVG(duration_seconds) FILTER (WHERE status = 'completed'), 2) as avg_duration_sec
FROM workflow_instances
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY workflow_type;
```

---

## Data Maintenance

### Clean Old Workflows

```sql
-- Delete workflows older than 90 days
DELETE FROM workflow_instances
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('completed', 'failed', 'cancelled');
```

### Analyze Tables

```sql
-- Update statistics for query planner
ANALYZE agents;
ANALYZE agent_knowledge_domains;
ANALYZE workflow_instances;
ANALYZE agent_assignments;
```

### Rebuild Indexes

```sql
-- If queries are slow, rebuild indexes
REINDEX TABLE agents;
REINDEX TABLE agent_knowledge_domains;
REINDEX TABLE workflow_instances;
```

---

## Troubleshooting

### No Agents Returned

```sql
-- Check tenant has agents
SELECT COUNT(*) FROM tenant_agents WHERE tenant_id = 'YOUR_TENANT_ID';

-- Check agent data
SELECT a.name, a.tier, a.status, a.capabilities
FROM agents a
JOIN tenant_agents ta ON a.id = ta.agent_id
WHERE ta.tenant_id = 'YOUR_TENANT_ID';
```

### Workflow Stuck

```sql
-- Check assignment statuses
SELECT status, COUNT(*) FROM agent_assignments
WHERE workflow_instance_id = 'workflow-id'
GROUP BY status;

-- Manually complete if needed
UPDATE workflow_instances
SET status = 'completed', completed_at = NOW()
WHERE id = 'workflow-id';
```

### Slow Queries

```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'workflow_instances')
ORDER BY idx_scan DESC;

-- Run EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM get_workflow_compatible_agents(...);
```

---

## Performance Tips

1. Always use `get_workflow_compatible_agents()` function (indexed and optimized)
2. Add `LIMIT` to all queries to prevent full table scans
3. Use `created_at` indexes for time-based filtering
4. Run `ANALYZE` after bulk inserts
5. Monitor `pg_stat_user_indexes` for unused indexes

---

## Key Table Relationships

```
organizations (tenants)
  └─► tenant_agents
        └─► agents
              ├─► agent_knowledge_domains
              │     └─► knowledge_domains
              ├─► agent_capabilities
              │     └─► capabilities
              └─► agent_assignments
                    └─► workflow_instances
```

---

## Environment Variables Needed

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

---

## Quick Test

```sql
-- Verify installation
SELECT COUNT(*) FROM workflow_instances; -- Should work
SELECT COUNT(*) FROM agent_assignments;  -- Should work
SELECT * FROM get_workflow_compatible_agents(
    'YOUR_TENANT_ID', 'ask_expert', NULL, NULL, 1, 5
) LIMIT 1; -- Should return agent
```

---

**Status:** Production-Ready ✅
**Last Updated:** 2025-11-21
