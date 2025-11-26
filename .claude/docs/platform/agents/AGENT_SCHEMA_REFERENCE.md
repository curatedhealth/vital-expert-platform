# Agent Schema Quick Reference

**For Developers:** Copy-paste SQL snippets for common operations

**Last Updated**: November 26, 2025  
**Status**: ✅ Production-Ready  
**Total Agents**: 489 (fully enriched)

---

## Table of Contents

1. [Common Queries](#common-queries)
2. [Agent Level Queries](#agent-level-queries)
3. [Capabilities & Skills](#capabilities--skills)
4. [Knowledge Domains](#knowledge-domains)
5. [System Prompts (AgentOS 3.0)](#system-prompts-agentos-30)
6. [Agent Relationships](#agent-relationships)
7. [Workflow Operations](#workflow-operations)
8. [Multi-Tenancy](#multi-tenancy)
9. [LLM Configuration](#llm-configuration)
10. [TypeScript/JavaScript Examples](#typescriptjavascript-examples)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Troubleshooting](#troubleshooting)

---

## Common Queries

### Find Best Agent for Question

```sql
SELECT
    a.id,
    a.name,
    a.display_name,
    a.tagline,
    al.level_name,
    f.function_name,
    d.department_name,
    r.role_name,
    -- Calculate match score (simplified)
    (
        CASE WHEN a.function_name ILIKE '%regulatory%' THEN 40 ELSE 0 END +
        CASE WHEN al.level_number <= 2 THEN 20 ELSE 10 END
    ) as match_score
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN org_functions f ON a.function_id = f.id
LEFT JOIN org_departments d ON a.department_id = d.id
LEFT JOIN org_roles r ON a.role_id = r.id
WHERE a.status = 'active'
  AND a.tenant_id = '00000000-0000-0000-0000-000000000001' -- Replace with your tenant
ORDER BY match_score DESC, al.level_number ASC
LIMIT 1;
```

### Get Agent with Full Details

```sql
SELECT
    a.*,
    al.level_name,
    al.level_number,
    f.function_name,
    d.department_name,
    r.role_name,
    spt.template_name as system_prompt_template,
    -- Capabilities
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'capability', c.capability_name,
                'proficiency', ac.proficiency_level,
                'is_primary', ac.is_primary
            )
        )
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.id
        WHERE ac.agent_id = a.id
    ) as capabilities,
    -- Knowledge Domains
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'domain', kd.domain_name,
                'proficiency', akd.proficiency_level,
                'is_primary', akd.is_primary_domain
            )
        )
        FROM agent_knowledge_domains akd
        JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE akd.agent_id = a.id
    ) as knowledge_domains,
    -- Skills
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'skill', s.skill_name,
                'proficiency', ask.proficiency_level
            )
        )
        FROM agent_skills ask
        JOIN skills s ON ask.skill_id = s.id
        WHERE ask.agent_id = a.id
        LIMIT 10
    ) as top_skills
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN org_functions f ON a.function_id = f.id
LEFT JOIN org_departments d ON a.department_id = d.id
LEFT JOIN org_roles r ON a.role_id = r.id
LEFT JOIN system_prompt_templates spt ON a.system_prompt_template_id = spt.id
WHERE a.slug = 'regulatory-affairs-director'; -- Replace with agent slug
```

### List All Agents by Level

```sql
SELECT
    al.level_number,
    al.level_name,
    COUNT(*) as agent_count,
    jsonb_agg(
        jsonb_build_object(
            'name', a.name,
            'tagline', a.tagline,
            'function', a.function_name
        )
        ORDER BY a.name
    ) as agents
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.status = 'active'
  AND a.deleted_at IS NULL
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;
```

### Search Agents by Capability

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    c.capability_name,
    ac.proficiency_level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
JOIN agent_capabilities ac ON a.id = ac.agent_id
JOIN capabilities c ON ac.capability_id = c.id
WHERE c.capability_slug = 'fda-regulatory-strategy' -- Replace with capability
  AND ac.proficiency_level IN ('expert', 'advanced')
  AND a.status = 'active'
ORDER BY 
    CASE ac.proficiency_level
        WHEN 'expert' THEN 1
        WHEN 'advanced' THEN 2
        WHEN 'intermediate' THEN 3
        ELSE 4
    END,
    al.level_number;
```

---

## Agent Level Queries

### Get Agent Level Details

```sql
SELECT
    al.*,
    COUNT(a.id) as total_agents,
    COUNT(a.id) FILTER (WHERE a.status = 'active') as active_agents,
    jsonb_agg(DISTINCT lm.model_id) as allowed_models
FROM agent_levels al
LEFT JOIN agents a ON al.id = a.agent_level_id
LEFT JOIN agent_level_models alm ON al.id = alm.agent_level_id
LEFT JOIN llm_models lm ON alm.llm_model_id = lm.id
GROUP BY al.id
ORDER BY al.level_number;
```

### Find Agents by Level and Function

```sql
SELECT
    a.name,
    a.tagline,
    a.function_name,
    a.department_name,
    a.role_name,
    al.level_name
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 2 -- L2 Expert
  AND a.function_name = 'Regulatory Affairs'
  AND a.status = 'active'
ORDER BY a.department_name, a.name;
```

### Agent Level Distribution

```sql
SELECT
    al.level_number,
    al.level_name,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage,
    string_agg(DISTINCT a.function_name, ', ') as functions
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;
```

---

## Capabilities & Skills

### Get All Capabilities with Agent Count

```sql
SELECT
    c.capability_name,
    c.category,
    c.complexity_level,
    COUNT(ac.agent_id) as agent_count,
    COUNT(DISTINCT cs.skill_id) as skill_count
FROM capabilities c
LEFT JOIN agent_capabilities ac ON c.id = ac.capability_id
LEFT JOIN capability_skills cs ON c.id = cs.capability_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.capability_name, c.category, c.complexity_level
ORDER BY agent_count DESC;
```

### Get Skills for Capability

```sql
SELECT
    c.capability_name,
    s.skill_name,
    cs.importance_level,
    cs.relationship_type,
    COUNT(ask.agent_id) as agents_with_skill
FROM capabilities c
JOIN capability_skills cs ON c.id = cs.capability_id
JOIN skills s ON cs.skill_id = s.id
LEFT JOIN agent_skills ask ON s.id = ask.skill_id
WHERE c.capability_slug = 'fda-regulatory-strategy' -- Replace
GROUP BY c.id, c.capability_name, s.id, s.skill_name, cs.importance_level, cs.relationship_type
ORDER BY cs.importance_level, s.skill_name;
```

### Assign Capability to Agent

```sql
INSERT INTO agent_capabilities (
    agent_id,
    capability_id,
    proficiency_level,
    is_primary
)
VALUES (
    (SELECT id FROM agents WHERE slug = 'your-agent-slug'),
    (SELECT id FROM capabilities WHERE capability_slug = 'your-capability-slug'),
    'expert', -- or 'advanced', 'intermediate', 'basic'
    TRUE -- Set to TRUE if this is the agent's primary capability
)
ON CONFLICT (agent_id, capability_id) 
DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary = EXCLUDED.is_primary,
    updated_at = NOW();
```

### Assign Skills to Agent

```sql
INSERT INTO agent_skills (agent_id, skill_id, proficiency_level)
SELECT
    (SELECT id FROM agents WHERE slug = 'your-agent-slug'),
    s.id,
    'advanced' -- Default proficiency
FROM skills s
WHERE s.skill_slug IN (
    'fda-510k-submission',
    'ind-application-review',
    'regulatory-writing'
)
ON CONFLICT (agent_id, skill_id) DO NOTHING;
```

### Get Agent's Skill Gaps (Prerequisites Not Met)

```sql
WITH agent_skills_list AS (
    SELECT skill_id
    FROM agent_skills
    WHERE agent_id = (SELECT id FROM agents WHERE slug = 'your-agent-slug')
),
prerequisite_check AS (
    SELECT
        s.skill_name as target_skill,
        prereq.skill_name as required_skill,
        CASE WHEN asl.skill_id IS NOT NULL THEN TRUE ELSE FALSE END as has_prerequisite
    FROM skills s
    CROSS JOIN LATERAL unnest(s.prerequisites) as prereq_id
    JOIN skills prereq ON prereq.id = prereq_id
    LEFT JOIN agent_skills_list asl ON asl.skill_id = prereq_id
    WHERE s.id IN (SELECT skill_id FROM agent_skills_list)
)
SELECT
    target_skill,
    required_skill,
    has_prerequisite
FROM prerequisite_check
WHERE has_prerequisite = FALSE
ORDER BY target_skill, required_skill;
```

---

## Knowledge Domains

### Get All Knowledge Domains with Hierarchy

```sql
WITH RECURSIVE domain_tree AS (
    -- Root domains
    SELECT
        id,
        domain_name,
        domain_code,
        tier,
        parent_domain_id,
        0 as depth,
        domain_name as path
    FROM knowledge_domains
    WHERE parent_domain_id IS NULL
    
    UNION ALL
    
    -- Child domains
    SELECT
        kd.id,
        kd.domain_name,
        kd.domain_code,
        kd.tier,
        kd.parent_domain_id,
        dt.depth + 1,
        dt.path || ' > ' || kd.domain_name
    FROM knowledge_domains kd
    JOIN domain_tree dt ON kd.parent_domain_id = dt.id
)
SELECT
    REPEAT('  ', depth) || domain_name as hierarchy,
    domain_code,
    tier,
    depth,
    (SELECT COUNT(*) FROM agent_knowledge_domains WHERE knowledge_domain_id = dt.id) as agent_count
FROM domain_tree dt
ORDER BY path;
```

### Assign Knowledge Domain to Agent

```sql
INSERT INTO agent_knowledge_domains (
    agent_id,
    knowledge_domain_id,
    domain_name, -- Cached for performance
    proficiency_level,
    is_primary_domain
)
VALUES (
    (SELECT id FROM agents WHERE slug = 'your-agent-slug'),
    (SELECT id FROM knowledge_domains WHERE domain_code = 'FDA_REGULATORY'),
    'FDA Regulatory Affairs',
    'expert',
    TRUE
)
ON CONFLICT (agent_id, knowledge_domain_id)
DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    is_primary_domain = EXCLUDED.is_primary_domain,
    updated_at = NOW();
```

### Find Agents by Knowledge Domain

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    akd.proficiency_level,
    akd.is_primary_domain
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
JOIN agent_knowledge_domains akd ON a.id = akd.agent_id
JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
WHERE kd.domain_code = 'FDA_REGULATORY'
  AND akd.proficiency_level IN ('expert', 'advanced')
  AND a.status = 'active'
ORDER BY
    CASE akd.proficiency_level
        WHEN 'expert' THEN 1
        WHEN 'advanced' THEN 2
        ELSE 3
    END,
    al.level_number;
```

---

## System Prompts (AgentOS 3.0)

### Get All System Prompt Templates

```sql
SELECT
    template_name,
    agent_level,
    agent_level_name,
    version,
    token_budget_min,
    token_budget_max,
    can_spawn_levels,
    can_use_worker_pool,
    can_use_tool_registry,
    LENGTH(base_prompt) as base_prompt_length,
    LENGTH(level_specific_prompt) as level_specific_prompt_length,
    is_active
FROM system_prompt_templates
ORDER BY 
    CASE agent_level
        WHEN 'L1' THEN 1
        WHEN 'L2' THEN 2
        WHEN 'L3' THEN 3
        WHEN 'L4' THEN 4
        WHEN 'L5' THEN 5
    END;
```

### Link Agent to System Prompt Template

```sql
-- Update agent to use system prompt template
UPDATE agents
SET
    system_prompt_template_id = (
        SELECT id FROM system_prompt_templates
        WHERE agent_level = 'L2' -- Match agent's level
        LIMIT 1
    ),
    prompt_variables = jsonb_build_object(
        'domain', 'FDA Regulatory Affairs',
        'specialty', '510(k) Submissions',
        'tone', 'authoritative',
        'output_format', 'structured_report'
    ),
    updated_at = NOW()
WHERE slug = 'your-agent-slug';
```

### Bulk Link All Agents to Templates (By Level)

```sql
UPDATE agents a
SET
    system_prompt_template_id = spt.id,
    updated_at = NOW()
FROM agent_levels al
JOIN system_prompt_templates spt ON CONCAT('L', al.level_number::TEXT) = spt.agent_level
WHERE a.agent_level_id = al.id
  AND a.system_prompt_template_id IS NULL;

-- Verify
SELECT
    al.level_name,
    COUNT(*) as total_agents,
    COUNT(a.system_prompt_template_id) as linked_agents,
    COUNT(*) - COUNT(a.system_prompt_template_id) as missing_links
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;
```

### Render System Prompt for Agent (Preview)

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    spt.template_name,
    -- Base prompt
    LEFT(spt.base_prompt, 200) || '...' as base_prompt_preview,
    -- Level-specific prompt
    LEFT(spt.level_specific_prompt, 200) || '...' as level_prompt_preview,
    -- Agent variables
    a.prompt_variables,
    -- Dynamic context: capabilities
    (
        SELECT string_agg(c.display_name, ', ')
        FROM agent_capabilities ac
        JOIN capabilities c ON ac.capability_id = c.id
        WHERE ac.agent_id = a.id
          AND ac.proficiency_level IN ('expert', 'advanced')
    ) as agent_capabilities,
    -- Dynamic context: domains
    (
        SELECT string_agg(kd.domain_name, ', ')
        FROM agent_knowledge_domains akd
        JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE akd.agent_id = a.id
          AND akd.is_primary_domain = TRUE
    ) as primary_domains
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN system_prompt_templates spt ON a.system_prompt_template_id = spt.id
WHERE a.slug = 'your-agent-slug';
```

---

## Agent Relationships

### Get Agent's Direct Children (Delegation)

```sql
SELECT
    parent.name as parent_agent,
    child.name as child_agent,
    ar.relationship_type,
    child_level.level_name as child_level,
    ar.priority,
    ar.can_delegate,
    ar.context_isolation,
    ar.activation_conditions
FROM agent_relationships ar
JOIN agents parent ON ar.parent_agent_id = parent.id
JOIN agents child ON ar.child_agent_id = child.id
JOIN agent_levels child_level ON child.agent_level_id = child_level.id
WHERE parent.slug = 'regulatory-affairs-master'
  AND ar.is_active = TRUE
ORDER BY ar.priority DESC, child_level.level_number;
```

### Get Complete Delegation Chain (Recursive)

```sql
WITH RECURSIVE delegation_chain AS (
    -- Base: Start with specified agent
    SELECT
        a.id,
        a.name,
        a.slug,
        a.tagline,
        al.level_number,
        al.level_name,
        NULL::UUID as parent_id,
        0 as depth,
        ARRAY[a.id] as path
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE a.slug = 'regulatory-affairs-master' -- Starting agent
    
    UNION ALL
    
    -- Recursive: Find children
    SELECT
        child.id,
        child.name,
        child.slug,
        child.tagline,
        child_level.level_number,
        child_level.level_name,
        dc.id as parent_id,
        dc.depth + 1,
        dc.path || child.id
    FROM delegation_chain dc
    JOIN agent_relationships ar ON dc.id = ar.parent_agent_id
    JOIN agents child ON ar.child_agent_id = child.id
    JOIN agent_levels child_level ON child.agent_level_id = child_level.id
    WHERE ar.relationship_type IN ('orchestrates', 'delegates_to', 'uses_worker', 'uses_tool')
      AND ar.is_active = TRUE
      AND NOT (child.id = ANY(dc.path)) -- Prevent cycles
)
SELECT
    REPEAT('  ', depth) || level_name || ': ' || name as hierarchy,
    tagline,
    slug,
    depth,
    level_number
FROM delegation_chain
ORDER BY depth, level_number, name;
```

### Create Agent Relationship

```sql
INSERT INTO agent_relationships (
    parent_agent_id,
    child_agent_id,
    relationship_type,
    can_delegate,
    context_isolation,
    priority,
    activation_conditions
)
VALUES (
    (SELECT id FROM agents WHERE slug = 'regulatory-affairs-master'),
    (SELECT id FROM agents WHERE slug = 'fda-510k-expert'),
    'delegates_to',
    TRUE,
    TRUE, -- Child gets isolated context
    100, -- High priority
    jsonb_build_object(
        'task_complexity', 'high',
        'domain', 'FDA 510(k)',
        'confidence_threshold', 0.85
    )
)
ON CONFLICT (parent_agent_id, child_agent_id, relationship_type)
DO UPDATE SET
    priority = EXCLUDED.priority,
    activation_conditions = EXCLUDED.activation_conditions,
    updated_at = NOW();
```

### Find All L1 Masters and Their L2 Experts

```sql
SELECT
    master.name as master_agent,
    master.function_name,
    jsonb_agg(
        jsonb_build_object(
            'name', expert.name,
            'tagline', expert.tagline,
            'department', expert.department_name,
            'relationship', ar.relationship_type
        )
        ORDER BY expert.name
    ) as experts
FROM agents master
JOIN agent_levels ml ON master.agent_level_id = ml.id
JOIN agent_relationships ar ON master.id = ar.parent_agent_id
JOIN agents expert ON ar.child_agent_id = expert.id
JOIN agent_levels el ON expert.agent_level_id = el.id
WHERE ml.level_number = 1 -- L1 Master
  AND el.level_number = 2 -- L2 Expert
  AND ar.relationship_type IN ('orchestrates', 'delegates_to')
  AND ar.is_active = TRUE
GROUP BY master.id, master.name, master.function_name
ORDER BY master.function_name, master.name;
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
    '00000000-0000-0000-0000-000000000001', -- Tenant ID
    'user-uuid-here',
    'ask_expert',
    1, -- Mode 1: Single Expert
    jsonb_build_object(
        'question', 'What are the FDA requirements for 510(k) submission?',
        'context', 'Medical device, Class II',
        'urgency', 'high'
    ),
    'running',
    NOW()
)
RETURNING id, created_at;
```

### Assign Agent to Workflow

```sql
INSERT INTO agent_assignments (
    workflow_instance_id,
    agent_id,
    assignment_role,
    status,
    assigned_at
)
VALUES (
    'workflow-instance-uuid',
    (SELECT id FROM agents WHERE slug = 'fda-510k-expert'),
    'primary', -- or 'specialist', 'reviewer', 'critic'
    'assigned',
    NOW()
)
RETURNING id;
```

### Update Agent Response

```sql
UPDATE agent_assignments
SET
    status = 'completed',
    agent_response = jsonb_build_object(
        'answer', 'The FDA 510(k) submission requires...',
        'reasoning', 'Based on FDA guidance documents...',
        'citations', ARRAY['21 CFR 807', 'FDA Guidance K97-1'],
        'recommendations', ARRAY['Prepare predicate device comparison', 'Conduct biocompatibility testing']
    ),
    response_summary = 'Comprehensive 510(k) requirements with predicate analysis',
    confidence_score = 92.5,
    completed_at = NOW()
WHERE id = 'assignment-uuid';
```

### Complete Workflow

```sql
UPDATE workflow_instances
SET
    status = 'completed',
    output_data = jsonb_build_object(
        'final_answer', 'Aggregated answer from all agents...',
        'consensus', 'All agents agree on core requirements',
        'confidence', 92.5,
        'sources', ARRAY['FDA guidance', 'CFR regulations']
    ),
    completed_at = NOW()
WHERE id = 'workflow-instance-uuid';
```

### Get Workflow Status

```sql
SELECT
    wi.id,
    wi.workflow_type,
    wi.status,
    wi.started_at,
    wi.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(wi.completed_at, NOW()) - wi.started_at)) as duration_seconds,
    COUNT(aa.id) as total_agents,
    COUNT(aa.id) FILTER (WHERE aa.status = 'completed') as completed_agents,
    COUNT(aa.id) FILTER (WHERE aa.status = 'failed') as failed_agents,
    ROUND(AVG(aa.confidence_score), 2) as avg_confidence,
    jsonb_agg(
        jsonb_build_object(
            'agent', a.name,
            'status', aa.status,
            'confidence', aa.confidence_score
        )
        ORDER BY aa.assigned_at
    ) as agent_details
FROM workflow_instances wi
LEFT JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
LEFT JOIN agents a ON aa.agent_id = a.id
WHERE wi.id = 'workflow-instance-uuid'
GROUP BY wi.id;
```

---

## Multi-Tenancy

### Get All Tenants with Agent Counts

```sql
SELECT
    o.id,
    o.tenant_key,
    o.organization_name,
    o.tenant_type,
    COUNT(DISTINCT ta.agent_id) as total_agents,
    COUNT(DISTINCT ta.agent_id) FILTER (WHERE ta.is_enabled = TRUE) as enabled_agents,
    o.is_active
FROM organizations o
LEFT JOIN tenant_agents ta ON o.id = ta.tenant_id
GROUP BY o.id
ORDER BY o.organization_name;
```

### Get Tenant's Available Agents

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    a.function_name,
    ta.is_enabled,
    ta.usage_count,
    ta.last_used_at
FROM tenant_agents ta
JOIN agents a ON ta.agent_id = a.id
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE ta.tenant_id = (
    SELECT id FROM organizations WHERE tenant_key = 'pharma'
)
  AND ta.is_enabled = TRUE
  AND a.status = 'active'
ORDER BY a.function_name, al.level_number, a.name;
```

### Assign Agent to Tenant

```sql
INSERT INTO tenant_agents (
    tenant_id,
    agent_id,
    is_enabled,
    custom_config
)
VALUES (
    (SELECT id FROM organizations WHERE tenant_key = 'digital-health'),
    (SELECT id FROM agents WHERE slug = 'data-processor-worker'),
    TRUE,
    jsonb_build_object(
        'priority', 'high',
        'max_concurrent_tasks', 10
    )
)
ON CONFLICT (tenant_id, agent_id)
DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    custom_config = EXCLUDED.custom_config,
    updated_at = NOW();
```

### Track Agent Usage by Tenant

```sql
UPDATE tenant_agents
SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
WHERE tenant_id = 'tenant-uuid'
  AND agent_id = 'agent-uuid';
```

---

## LLM Configuration

### Get All LLM Models with Pricing

```sql
SELECT
    p.provider_name,
    m.model_name,
    m.model_id,
    m.context_window,
    m.max_output_tokens,
    m.input_cost_per_1k,
    m.output_cost_per_1k,
    m.supports_function_calling,
    m.quality_tier,
    m.is_active
FROM llm_models m
JOIN llm_providers p ON m.provider_id = p.id
WHERE m.is_active = TRUE
ORDER BY p.provider_name, m.quality_tier, m.model_name;
```

### Find Best Model for Agent Level

```sql
SELECT
    al.level_name,
    m.model_id,
    m.context_window,
    m.input_cost_per_1k,
    m.output_cost_per_1k,
    alm.is_default,
    alm.priority_order
FROM agent_levels al
JOIN agent_level_models alm ON al.id = alm.agent_level_id
JOIN llm_models m ON alm.llm_model_id = m.id
WHERE al.level_number = 2 -- L2 Expert
  AND m.is_active = TRUE
ORDER BY alm.priority_order;
```

### Calculate LLM Cost for Workflow

```sql
SELECT
    wi.id as workflow_id,
    SUM(
        (aa.input_tokens / 1000.0) * m.input_cost_per_1k +
        (aa.output_tokens / 1000.0) * m.output_cost_per_1k
    ) as total_cost_usd
FROM workflow_instances wi
JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
JOIN agents a ON aa.agent_id = a.id
JOIN llm_models m ON a.base_model = m.model_id
WHERE wi.id = 'workflow-instance-uuid'
GROUP BY wi.id;
```

---

## TypeScript/JavaScript Examples

### Find Best Agent (Supabase Client)

```typescript
const { data: bestAgent, error } = await supabase
  .from('agents')
  .select(`
    id,
    name,
    tagline,
    agent_levels!inner (
      level_name,
      level_number
    ),
    org_functions (
      function_name
    )
  `)
  .eq('status', 'active')
  .eq('tenant_id', tenantId)
  .eq('org_functions.function_name', 'Regulatory Affairs')
  .order('agent_levels.level_number', { ascending: true })
  .limit(1)
  .single();
```

### Get Agent with Full Profile

```typescript
const { data: agentProfile, error } = await supabase
  .from('agents')
  .select(`
    *,
    agent_levels (level_name, level_number),
    org_functions (function_name),
    org_departments (department_name),
    org_roles (role_name),
    system_prompt_templates (template_name, agent_level),
    agent_capabilities (
      proficiency_level,
      is_primary,
      capabilities (capability_name, category)
    ),
    agent_knowledge_domains (
      proficiency_level,
      is_primary_domain,
      knowledge_domains (domain_name, domain_code)
    )
  `)
  .eq('slug', 'regulatory-affairs-director')
  .single();
```

### Create Workflow with Agent Assignment

```typescript
// 1. Create workflow
const { data: workflow, error: workflowError } = await supabase
  .from('workflow_instances')
  .insert({
    tenant_id: tenantId,
    user_id: userId,
    workflow_type: 'ask_expert',
    workflow_mode: 1,
    input_data: {
      question: 'What are FDA 510(k) requirements?',
      context: 'Class II medical device',
    },
    status: 'running',
    started_at: new Date().toISOString(),
  })
  .select()
  .single();

if (workflowError) throw workflowError;

// 2. Assign agent
const { data: assignment, error: assignmentError } = await supabase
  .from('agent_assignments')
  .insert({
    workflow_instance_id: workflow.id,
    agent_id: agentId,
    assignment_role: 'primary',
    status: 'assigned',
    assigned_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Get User's Workflow History

```typescript
const { data: workflows, error } = await supabase
  .from('workflow_instances')
  .select(`
    id,
    workflow_type,
    status,
    created_at,
    completed_at,
    input_data,
    output_data,
    agent_assignments (
      id,
      status,
      confidence_score,
      agents (
        name,
        tagline,
        avatar_url
      )
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## Monitoring & Analytics

### Active Workflows

```sql
SELECT
    wi.id,
    wi.workflow_type,
    wi.workflow_mode,
    wi.status,
    wi.started_at,
    EXTRACT(EPOCH FROM (NOW() - wi.started_at)) / 60 as running_minutes,
    COUNT(aa.id) as total_agents,
    COUNT(aa.id) FILTER (WHERE aa.status = 'completed') as completed_agents,
    COUNT(aa.id) FILTER (WHERE aa.status = 'working') as working_agents
FROM workflow_instances wi
LEFT JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
WHERE wi.status IN ('pending', 'running')
GROUP BY wi.id
ORDER BY wi.started_at DESC;
```

### Agent Workload & Performance

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    COUNT(*) as total_assignments,
    COUNT(*) FILTER (WHERE aa.status = 'assigned') as assigned,
    COUNT(*) FILTER (WHERE aa.status = 'working') as working,
    COUNT(*) FILTER (WHERE aa.status = 'completed') as completed,
    COUNT(*) FILTER (WHERE aa.status = 'failed') as failed,
    ROUND(AVG(aa.confidence_score) FILTER (WHERE aa.status = 'completed'), 2) as avg_confidence,
    ROUND(AVG(aa.duration_seconds) FILTER (WHERE aa.status = 'completed'), 2) as avg_duration_sec
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_assignments aa ON a.id = aa.agent_id
WHERE aa.assigned_at >= NOW() - INTERVAL '24 hours' -- Last 24 hours
GROUP BY a.id, a.name, a.tagline, al.level_name
HAVING COUNT(*) > 0
ORDER BY total_assignments DESC
LIMIT 20;
```

### Workflow Success Rate by Type

```sql
SELECT
    workflow_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    COUNT(*) FILTER (WHERE status IN ('pending', 'running')) as in_progress,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) as success_rate_pct,
    ROUND(AVG(duration_seconds) FILTER (WHERE status = 'completed'), 2) as avg_duration_sec,
    ROUND(AVG(
        (SELECT AVG(confidence_score) 
         FROM agent_assignments 
         WHERE workflow_instance_id = workflow_instances.id 
           AND status = 'completed')
    ), 2) as avg_confidence
FROM workflow_instances
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY workflow_type
ORDER BY total DESC;
```

### Top Performing Agents (By Confidence Score)

```sql
SELECT
    a.name,
    a.tagline,
    al.level_name,
    a.function_name,
    COUNT(aa.id) as total_tasks,
    ROUND(AVG(aa.confidence_score), 2) as avg_confidence,
    ROUND(STDDEV(aa.confidence_score), 2) as confidence_stddev,
    MIN(aa.confidence_score) as min_confidence,
    MAX(aa.confidence_score) as max_confidence,
    COUNT(*) FILTER (WHERE aa.confidence_score >= 90) as high_confidence_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
JOIN agent_assignments aa ON a.id = aa.agent_id
WHERE aa.status = 'completed'
  AND aa.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY a.id, a.name, a.tagline, al.level_name, a.function_name
HAVING COUNT(aa.id) >= 5 -- At least 5 tasks
ORDER BY avg_confidence DESC, total_tasks DESC
LIMIT 20;
```

### Cost Analysis by Agent Level

```sql
SELECT
    al.level_name,
    COUNT(DISTINCT aa.id) as total_invocations,
    SUM(aa.input_tokens) as total_input_tokens,
    SUM(aa.output_tokens) as total_output_tokens,
    ROUND(SUM(
        (aa.input_tokens / 1000.0) * m.input_cost_per_1k +
        (aa.output_tokens / 1000.0) * m.output_cost_per_1k
    ), 2) as total_cost_usd,
    ROUND(AVG(
        (aa.input_tokens / 1000.0) * m.input_cost_per_1k +
        (aa.output_tokens / 1000.0) * m.output_cost_per_1k
    ), 4) as avg_cost_per_invocation
FROM agent_assignments aa
JOIN agents a ON aa.agent_id = a.id
JOIN agent_levels al ON a.agent_level_id = al.id
JOIN llm_models m ON a.base_model = m.model_id
WHERE aa.status = 'completed'
  AND aa.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;
```

---

## Troubleshooting

### Check Agent Completeness

```sql
SELECT
    'Missing System Prompt Template' as issue,
    COUNT(*) as count
FROM agents
WHERE system_prompt_template_id IS NULL
  AND status = 'active'

UNION ALL

SELECT
    'Missing Agent Level',
    COUNT(*)
FROM agents
WHERE agent_level_id IS NULL
  AND status = 'active'

UNION ALL

SELECT
    'Missing Function',
    COUNT(*)
FROM agents
WHERE function_id IS NULL
  AND status = 'active'

UNION ALL

SELECT
    'No Capabilities Assigned',
    COUNT(DISTINCT a.id)
FROM agents a
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
WHERE ac.id IS NULL
  AND a.status = 'active'

UNION ALL

SELECT
    'No Knowledge Domains',
    COUNT(DISTINCT a.id)
FROM agents a
LEFT JOIN agent_knowledge_domains akd ON a.id = akd.agent_id
WHERE akd.id IS NULL
  AND a.status = 'active';
```

### Verify Agent Relationships

```sql
-- Check for orphaned relationships (referencing deleted agents)
SELECT
    ar.id,
    ar.relationship_type,
    ar.parent_agent_id,
    ar.child_agent_id
FROM agent_relationships ar
LEFT JOIN agents parent ON ar.parent_agent_id = parent.id
LEFT JOIN agents child ON ar.child_agent_id = child.id
WHERE parent.id IS NULL OR child.id IS NULL OR parent.deleted_at IS NOT NULL OR child.deleted_at IS NOT NULL;

-- Check for circular relationships
WITH RECURSIVE circular_check AS (
    SELECT
        parent_agent_id,
        child_agent_id,
        ARRAY[parent_agent_id, child_agent_id] as path,
        FALSE as is_circular
    FROM agent_relationships
    WHERE is_active = TRUE
    
    UNION ALL
    
    SELECT
        cc.parent_agent_id,
        ar.child_agent_id,
        cc.path || ar.child_agent_id,
        ar.child_agent_id = ANY(cc.path) as is_circular
    FROM circular_check cc
    JOIN agent_relationships ar ON cc.child_agent_id = ar.parent_agent_id
    WHERE NOT cc.is_circular
      AND ar.is_active = TRUE
      AND array_length(cc.path, 1) < 10 -- Prevent infinite recursion
)
SELECT DISTINCT
    path,
    'CIRCULAR RELATIONSHIP DETECTED' as issue
FROM circular_check
WHERE is_circular = TRUE;
```

### Find Duplicate Agents

```sql
SELECT
    name,
    COUNT(*) as duplicate_count,
    array_agg(id) as agent_ids,
    array_agg(status) as statuses
FROM agents
WHERE deleted_at IS NULL
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
```

### Workflow Debugging

```sql
-- Find stuck workflows
SELECT
    id,
    workflow_type,
    status,
    started_at,
    EXTRACT(EPOCH FROM (NOW() - started_at)) / 60 as minutes_running
FROM workflow_instances
WHERE status IN ('pending', 'running')
  AND started_at < NOW() - INTERVAL '30 minutes'
ORDER BY started_at;

-- Check workflow without agent assignments
SELECT
    wi.id,
    wi.workflow_type,
    wi.status,
    wi.created_at
FROM workflow_instances wi
LEFT JOIN agent_assignments aa ON wi.id = aa.workflow_instance_id
WHERE aa.id IS NULL
  AND wi.status != 'cancelled'
ORDER BY wi.created_at DESC;
```

### Database Performance Check

```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'agent%'
ORDER BY size_bytes DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'agent%'
ORDER BY idx_scan DESC;
```

---

## Data Maintenance

### Clean Old Workflows (Soft Delete)

```sql
-- Mark old completed workflows as archived
UPDATE workflow_instances
SET
    status = 'archived',
    updated_at = NOW()
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '90 days'
RETURNING id, workflow_type, completed_at;
```

### Rebuild Denormalized Fields

```sql
-- Update cached function/department/role names in agents table
UPDATE agents a
SET
    function_name = f.function_name,
    department_name = d.department_name,
    role_name = r.role_name,
    updated_at = NOW()
FROM org_functions f, org_departments d, org_roles r
WHERE a.function_id = f.id
  AND a.department_id = d.id
  AND a.role_id = r.id
  AND (
    a.function_name != f.function_name OR
    a.department_name != d.department_name OR
    a.role_name != r.role_name OR
    a.function_name IS NULL OR
    a.department_name IS NULL OR
    a.role_name IS NULL
  );
```

### Analyze & Vacuum Tables

```sql
-- Update statistics for query planner
ANALYZE agents;
ANALYZE agent_capabilities;
ANALYZE agent_skills;
ANALYZE agent_knowledge_domains;
ANALYZE agent_relationships;
ANALYZE workflow_instances;
ANALYZE agent_assignments;

-- Reclaim space (run during maintenance window)
VACUUM ANALYZE agents;
VACUUM ANALYZE agent_assignments;
VACUUM ANALYZE workflow_instances;
```

---

## Key Table Relationships Summary

```
organizations (tenants)
  └── tenant_agents
        └── agents
              ├── agent_levels (L1-L5)
              ├── org_functions → org_departments → org_roles
              ├── system_prompt_templates (AgentOS 3.0)
              ├── agent_capabilities → capabilities → capability_skills → skills
              ├── agent_skills → skills
              ├── agent_knowledge_domains → knowledge_domains
              ├── agent_relationships (parent-child, delegation)
              └── agent_assignments → workflow_instances
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

---

## Quick Test Suite

```sql
-- 1. Verify agent count
SELECT COUNT(*) as total_agents FROM agents WHERE status = 'active';
-- Expected: 489

-- 2. Verify all agents have levels
SELECT COUNT(*) as agents_with_levels FROM agents WHERE agent_level_id IS NOT NULL;
-- Expected: 489

-- 3. Verify system prompt template linkage
SELECT COUNT(*) as agents_with_templates FROM agents WHERE system_prompt_template_id IS NOT NULL;
-- Expected: 489

-- 4. Verify capabilities assignment
SELECT COUNT(DISTINCT agent_id) as agents_with_capabilities FROM agent_capabilities;
-- Expected: 489

-- 5. Verify knowledge domains
SELECT COUNT(DISTINCT agent_id) as agents_with_domains FROM agent_knowledge_domains;
-- Expected: 489
```

---

## Performance Tips

1. **Use Indexes**: All foreign keys and frequently queried columns are indexed
2. **Denormalized Fields**: `function_name`, `department_name`, `role_name` in agents table avoid JOINs
3. **Limit Results**: Always use `LIMIT` to prevent full table scans
4. **Filter Early**: Put most restrictive filters in `WHERE` clause first
5. **Use CTEs**: For complex queries, use Common Table Expressions (WITH clauses)
6. **Batch Operations**: Use `INSERT ... ON CONFLICT` for upserts
7. **Monitor Performance**: Check `pg_stat_user_indexes` for unused indexes

---

## Additional Resources

- **Complete Schema Guide**: `AGENT_SCHEMA_COMPLETE_GUIDE.md`
- **Visual Diagram**: `AGENT_SCHEMA_DIAGRAM.md`
- **Agent Enrichment Status**: `AGENT_ENRICHMENT_COMPLETE_CERTIFIED.md`
- **AgentOS 3.0 Hierarchy**: `AGENTOS_3.0_FIVE_LEVEL_AGENT_HIERARCHY.md`

---

**Status**: ✅ Production-Ready  
**Last Updated**: November 26, 2025  
**Total Agents**: 489  
**Total Tables**: 35+  
**Total Records**: 8,022+ enrichment records
