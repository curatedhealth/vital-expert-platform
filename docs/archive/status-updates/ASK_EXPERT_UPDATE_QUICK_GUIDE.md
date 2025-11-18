# 🚀 Ask Expert Service - Agent Migration Quick Reference

**TL;DR:** All agents are now in the `agents` table. Update your queries and field names.

---

## ⚡ Quick Migration Checklist

- [ ] Replace `dh_agent` → `agents`
- [ ] Replace `ai_agents` → `agents`
- [ ] Update field names (see below)
- [ ] Access complex data from `metadata` JSONB
- [ ] Filter by `is_active = true` instead of checking `deleted_at`
- [ ] Test all agent queries
- [ ] Update TypeScript interfaces
- [ ] Test Ask Expert functionality end-to-end

---

## 📋 Field Mapping Cheat Sheet

### ❌ OLD → ✅ NEW

| Old | New | Where |
|-----|-----|-------|
| `dh_agent.unique_id` | `agents.id` | UUID |
| `dh_agent.agent_name` | `agents.name` | String |
| `dh_agent.display_name` | `agents.name` | String |
| `dh_agent.agent_type` | `agents.agent_category` | String |
| `dh_agent.specialization` | `agents.expertise` | String |
| `dh_agent.capabilities` | `agents.metadata.capabilities` | JSONB |
| `dh_agent.skills` | `agents.metadata.skills` | JSONB |
| `dh_agent.tools` | `agents.metadata.tools` | JSONB |
| `dh_agent.model_config` | `agents.metadata.model_config` | JSONB |
| `dh_agent.system_prompt` | `agents.metadata.system_prompt` | JSONB |
| `ai_agents.type` | `agents.agent_category` | String |
| `ai_agents.config` | `agents.metadata.model_config` | JSONB |
| `.is('deleted_at', 'null')` | `.eq('is_active', true)` | Boolean |

---

## 🔥 Code Examples (Before/After)

### 1. Get All Active Agents

**❌ OLD:**
```typescript
const { data: dhAgents } = await supabase
  .from('dh_agent')
  .select('*')
  .is('deleted_at', 'null');

const { data: aiAgents } = await supabase
  .from('ai_agents')
  .select('*')
  .is('deleted_at', 'null');

const allAgents = [...(dhAgents || []), ...(aiAgents || [])];
```

**✅ NEW:**
```typescript
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .eq('is_active', true)
  .eq('is_public', true);
```

---

### 2. Get Agent by ID

**❌ OLD:**
```typescript
const { data: agent } = await supabase
  .from('dh_agent')
  .select('*')
  .eq('unique_id', agentId)
  .single();
```

**✅ NEW:**
```typescript
const { data: agent } = await supabase
  .from('agents')
  .select('*')
  .eq('id', agentId)
  .single();

// Access nested data
const capabilities = agent?.metadata?.capabilities || [];
const systemPrompt = agent?.metadata?.system_prompt || '';
```

---

### 3. Filter Agents by Type/Category

**❌ OLD:**
```typescript
const { data: taskAgents } = await supabase
  .from('dh_agent')
  .select('*')
  .eq('agent_type', 'task');
```

**✅ NEW:**
```typescript
const { data: taskAgents } = await supabase
  .from('agents')
  .select('*')
  .eq('agent_category', 'task')
  .eq('is_active', true);
```

---

### 4. Get Agents for Industry (NEW CAPABILITY!)

**✅ NEW:**
```typescript
// Option 1: Using the registry view (EASIEST)
const { data: pharmaAgents } = await supabase
  .from('agent_registry_view')
  .select('*')
  .contains('industries', ['Pharmaceuticals']);

// Option 2: Using JOIN
const { data: pharmaAgents } = await supabase
  .from('agents')
  .select(`
    *,
    agent_industry_mapping!inner(
      industries(industry_name)
    )
  `)
  .eq('agent_industry_mapping.industries.industry_name', 'Pharmaceuticals')
  .eq('is_active', true);
```

---

### 5. Get Agents for Persona (NEW CAPABILITY!)

**✅ NEW:**
```typescript
const { data: personaAgents } = await supabase
  .from('agent_registry_view')
  .select('*')
  .contains('supported_personas', [personaName]);
```

---

### 6. Search Agents by Name/Expertise

**✅ NEW:**
```typescript
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .or('name.ilike.%regulatory%,expertise.ilike.%regulatory%')
  .eq('is_active', true);
```

---

## 🎯 TypeScript Interface

**Replace your old interfaces with this:**

```typescript
interface Agent {
  // Core fields
  id: string;                          // UUID
  name: string;                        // Agent name
  description?: string | null;         // Optional description
  
  // Categorization
  category: string;                    // e.g., 'general', 'medical_affairs'
  agent_category: string;              // e.g., 'task', 'workflow', 'orchestrator'
  expertise?: string | null;           // Area of expertise
  
  // Behavior
  communication_style?: string | null; // How agent communicates
  can_delegate: boolean;               // Can this agent delegate tasks?
  delegation_rules?: Record<string, any> | null;
  escalation_rules?: Record<string, any> | null;
  parent_agent_id?: string | null;     // Hierarchy support
  
  // Status flags
  is_active: boolean;                  // Is agent active?
  is_public: boolean;                  // Shared across tenants?
  is_featured: boolean;                // Featured in UI?
  
  // Multi-tenancy
  tenant_id?: string | null;
  owner_tenant_id?: string | null;
  
  // Flexible storage (IMPORTANT!)
  metadata: {
    // Migration tracking
    source?: 'dh_agent' | 'ai_agents' | 'manual';
    original_id?: string;
    
    // Agent capabilities (from old tables)
    capabilities?: string[];
    skills?: string[];
    tools?: string[];
    
    // Configuration
    model_config?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      [key: string]: any;
    };
    system_prompt?: string;
    
    // Any other custom data
    [key: string]: any;
  };
  
  // Audit
  created_at: string;
  updated_at: string;
}

// For enriched queries using the view
interface AgentWithContext extends Agent {
  industries?: string[];              // From agent_industry_mapping
  supported_personas?: string[];      // From agent_persona_mapping
}
```

---

## 🧪 Testing Script

**Run this to verify your updates work:**

```typescript
// test-agent-migration.ts
import { supabase } from './lib/supabase';

async function testAgentMigration() {
  console.log('🧪 Testing Agent Migration...\n');
  
  // Test 1: Get all active agents
  const { data: agents, error: e1 } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true);
  
  console.log(`✅ Test 1: Found ${agents?.length || 0} active agents`);
  if (e1) console.error('❌ Error:', e1);
  
  // Test 2: Get agent with metadata
  const { data: agent, error: e2 } = await supabase
    .from('agents')
    .select('*')
    .eq('name', 'Regulatory Expert')
    .single();
  
  console.log(`✅ Test 2: Agent metadata:`, {
    capabilities: agent?.metadata?.capabilities,
    skills: agent?.metadata?.skills,
  });
  if (e2) console.error('❌ Error:', e2);
  
  // Test 3: Use registry view
  const { data: viewAgents, error: e3 } = await supabase
    .from('agent_registry_view')
    .select('*')
    .limit(5);
  
  console.log(`✅ Test 3: Registry view returned ${viewAgents?.length || 0} agents`);
  if (e3) console.error('❌ Error:', e3);
  
  // Test 4: Filter by category
  const { data: taskAgents, error: e4 } = await supabase
    .from('agents')
    .select('*')
    .eq('agent_category', 'task')
    .eq('is_active', true);
  
  console.log(`✅ Test 4: Found ${taskAgents?.length || 0} task agents`);
  if (e4) console.error('❌ Error:', e4);
  
  console.log('\n🎉 All tests complete!');
}

testAgentMigration();
```

---

## 🚨 Common Pitfalls

### 1. ❌ Still using old table names
```typescript
// ❌ WRONG
.from('dh_agent')
.from('ai_agents')

// ✅ CORRECT
.from('agents')
```

### 2. ❌ Using deleted_at filter
```typescript
// ❌ WRONG
.is('deleted_at', 'null')

// ✅ CORRECT
.eq('is_active', true)
```

### 3. ❌ Accessing capabilities as direct field
```typescript
// ❌ WRONG
agent.capabilities

// ✅ CORRECT
agent.metadata?.capabilities || []
```

### 4. ❌ Using old field names
```typescript
// ❌ WRONG
.eq('agent_type', 'task')
.eq('unique_id', id)

// ✅ CORRECT
.eq('agent_category', 'task')
.eq('id', id)
```

### 5. ❌ Not handling null metadata
```typescript
// ❌ WRONG (will crash if metadata is null)
const skills = agent.metadata.skills;

// ✅ CORRECT (safe access)
const skills = agent?.metadata?.skills || [];
```

---

## 📊 Database Views Available

### `agent_registry_view` - Use This for Rich Queries!

```sql
SELECT 
  id,
  name,
  description,
  category,
  agent_category,
  expertise,
  communication_style,
  is_active,
  is_public,
  is_featured,
  metadata,
  industries,              -- ARRAY of industry names
  supported_personas       -- ARRAY of persona names
FROM agent_registry_view
WHERE is_active = true;
```

**Example:**
```typescript
// Get all Medical Affairs agents that support Chief Medical Officer
const { data } = await supabase
  .from('agent_registry_view')
  .select('*')
  .eq('category', 'medical_affairs')
  .contains('supported_personas', ['Chief Medical Officer']);
```

---

## 🎯 Migration Timeline

### Week 1: Update Queries
- [ ] Day 1-2: Update database queries in services
- [ ] Day 3: Update TypeScript interfaces
- [ ] Day 4: Test in development environment
- [ ] Day 5: Code review and fixes

### Week 2: Deploy & Monitor
- [ ] Day 1: Deploy to staging
- [ ] Day 2-3: QA testing
- [ ] Day 4: Deploy to production
- [ ] Day 5: Monitor and address issues

---

## 📞 Need Help?

**Check these resources:**
1. Full documentation: `PHASE_2_AGENT_MIGRATION_COMPLETE.md`
2. Schema SQL: `scripts/phase2/01_create_agents_FIXED.sql`
3. Migration script: `scripts/phase2/02_migrate_agents_data.py`
4. Validation script: `scripts/phase2/03_validate_agent_migration.py`

**Quick SQL to explore:**
```sql
-- See all agents
SELECT id, name, category, agent_category, is_active FROM agents LIMIT 10;

-- See agent with metadata
SELECT name, metadata FROM agents WHERE name = 'Regulatory Expert';

-- See registry view in action
SELECT * FROM agent_registry_view LIMIT 5;

-- Count agents by category
SELECT agent_category, COUNT(*) FROM agents GROUP BY agent_category;
```

---

## ✅ Final Checklist Before Going Live

- [ ] All queries updated to use `agents` table
- [ ] Field names updated (agent_type → agent_category, etc.)
- [ ] Metadata access implemented correctly
- [ ] TypeScript interfaces updated
- [ ] Tests pass in development
- [ ] QA testing complete
- [ ] Error handling for null metadata
- [ ] Rollback plan ready (just in case)
- [ ] Team trained on new schema
- [ ] Documentation updated

---

**🎉 You got this! The new architecture is cleaner, faster, and more flexible.**

Questions? Check the full doc or ask the team! 🚀

