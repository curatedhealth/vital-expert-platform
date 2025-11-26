# Agent Production Readiness - Gap Analysis

**Date**: November 24, 2025  
**Status**: ⚠️ **3 CRITICAL GAPS IDENTIFIED**

---

## 📊 Current Status

| Requirement | Current | Target | Gap | Priority |
|-------------|---------|--------|-----|----------|
| **System Prompts** | ✅ 489/489 (100%) | 489 | 0 | ✅ COMPLETE |
| **Prompt Starters** | ❌ 0/489 (0%) | 1,956-3,912 (4-8 each) | 1,956-3,912 | 🔴 CRITICAL |
| **Prompt Library** | ❌ Table Missing | 200-400 prompts | ALL | 🔴 CRITICAL |
| **Function Mapping** | ❌ 0/489 (0%) | 489 | 489 | 🔴 CRITICAL |
| **Department Mapping** | ✅ 489/489 (100%) | 489 | 0 | ✅ COMPLETE |
| **Role Mapping (M2M)** | ❌ Table Missing | 489-1,467 | ALL | 🔴 CRITICAL |

---

## 🔴 CRITICAL GAPS

### 1. Prompt Starters: 0/489 agents (0%)
**What's Missing**: 
- No `agent_prompt_starters` records exist
- Need 4-8 starters per agent = **1,956 to 3,912 total records**

**Impact**: 
- Agents have no quick-start prompts for users
- Poor user experience - users don't know what to ask
- No guided onboarding for each agent

### 2. Prompt Library: Table Missing
**What's Missing**:
- `prompt_library` table doesn't exist
- No detailed prompts to connect starters to
- Need 200-400 reusable prompt templates

**Impact**:
- Cannot create prompt starters (foreign key dependency)
- No centralized prompt management
- No prompt versioning or reuse

### 3. Function Mapping: 0/489 agents (0%)
**What's Missing**:
- `function_name` field is NULL for all agents
- Only `department_name` is populated

**Impact**:
- Incomplete organizational hierarchy
- Cannot filter/search by business function
- Missing critical metadata for agent selection

### 4. Role Mapping (Many-to-Many): Table Missing
**What's Missing**:
- `agent_roles` junction table doesn't exist
- Currently using single `role_name` field (not M2M)
- Need proper many-to-many relationships

**Impact**:
- Agents can only have ONE role (should support multiple)
- Cannot query "all agents with role X"
- Inflexible organizational model

---

## ✅ WHAT'S WORKING

### 1. System Prompts: 489/489 (100%) ✅
All agents have gold-standard system prompts with proper structure.

### 2. Department Mapping: 489/489 (100%) ✅
All agents correctly mapped to departments.

### 3. Agent Enrichment: 8,022 records ✅
- Skills, knowledge domains, RAG policies, hierarchies, categories, industries, memory instructions all complete.

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Database Schema (15 min)
Create missing tables with proper relationships.

**Tables to Create**:
1. `prompt_library` - Centralized prompt repository
2. `agent_prompt_starters` - Link agents to starter prompts
3. `agent_roles` - Many-to-many junction table for roles

**SQL Schema**:
```sql
-- 1. Prompt Library
CREATE TABLE prompt_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    use_case TEXT,
    complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_template BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 2. Agent Prompt Starters
CREATE TABLE agent_prompt_starters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
    starter_text TEXT NOT NULL,
    display_order INTEGER,
    context_hint TEXT,
    expected_response_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(agent_id, prompt_id)
);

-- 3. Agent Roles (Many-to-Many)
CREATE TABLE agent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, role_id)
);

-- Indexes
CREATE INDEX idx_prompt_library_category ON prompt_library(category);
CREATE INDEX idx_prompt_library_tags ON prompt_library USING gin(tags);
CREATE INDEX idx_agent_prompt_starters_agent ON agent_prompt_starters(agent_id);
CREATE INDEX idx_agent_prompt_starters_prompt ON agent_prompt_starters(prompt_id);
CREATE INDEX idx_agent_roles_agent ON agent_roles(agent_id);
CREATE INDEX idx_agent_roles_role ON agent_roles(role_id);
```

### Phase 2: Function Mapping (10 min)
Update all 489 agents with correct `function_name`.

**Approach**:
- Extract function from department hierarchy
- Map departments → functions using `org_function_departments` table
- Update `agents.function_name` and `agents.function_id`

### Phase 3: Prompt Library Population (30 min)
Create 200-400 reusable prompt templates.

**Categories**:
- Clinical & Medical (50 prompts)
- Regulatory & Compliance (40 prompts)
- Market Access & HEOR (40 prompts)
- Safety & Pharmacovigilance (30 prompts)
- Operations & Analytics (20 prompts)
- Manufacturing & Supply Chain (10 prompts)
- Finance & Business (10 prompts)

**Template Structure**:
```json
{
  "title": "Generate Clinical Trial Protocol Summary",
  "content": "I need help creating a comprehensive summary of a clinical trial protocol. Please include:\n\n1. Study Design Overview\n- Trial phase and design type\n- Primary and secondary endpoints\n- Patient population and inclusion/exclusion criteria\n\n2. Regulatory Considerations\n- FDA guidance alignment\n- ICH-GCP compliance requirements\n- Special regulatory pathways (if applicable)\n\n3. Safety Monitoring\n- Adverse event reporting\n- Data Safety Monitoring Board requirements\n\nPlease provide your response in a structured format suitable for regulatory submission.",
  "category": "Clinical Operations",
  "tags": ["clinical-trials", "protocols", "regulatory"],
  "complexity_level": "advanced"
}
```

### Phase 4: Prompt Starters Generation (45 min)
Create 4-8 prompt starters per agent (1,956-3,912 total).

**Generation Strategy**:
1. Use agent's `department_name`, `role_name`, `expertise_level`, `agent_level_id`
2. Match to relevant prompts in library by category/tags
3. Generate starter text that's contextual to the agent
4. Create 4-8 starters covering different use cases

**Example for "Regulatory Affairs Specialist"**:
```python
starters = [
    "Help me prepare a 510(k) submission for a Class II medical device",
    "What are the FDA requirements for clinical trial protocol amendments?",
    "Review this drug labeling draft for regulatory compliance",
    "Generate a response to an FDA information request",
    "Analyze this pre-IND meeting package for completeness",
    "Compare EU MDR vs FDA requirements for our product"
]
```

### Phase 5: Role Mapping (M2M) (20 min)
Create many-to-many relationships for agent roles.

**Approach**:
1. Extract current `role_name` from agents
2. Find matching `org_roles.id`
3. Create primary mapping in `agent_roles`
4. Add 1-2 secondary roles where applicable

---

## 📋 EXECUTION CHECKLIST

### ✅ Prerequisites
- [x] All 489 agents have system prompts
- [x] All agents have department mapping
- [x] Organizational tables exist (org_functions, org_departments, org_roles)

### 🔲 Phase 1: Schema (15 min)
- [ ] Create `prompt_library` table
- [ ] Create `agent_prompt_starters` table
- [ ] Create `agent_roles` table
- [ ] Create all indexes
- [ ] Verify foreign key constraints

### 🔲 Phase 2: Functions (10 min)
- [ ] Map departments → functions
- [ ] Update `agents.function_name`
- [ ] Update `agents.function_id`
- [ ] Verify 100% coverage

### 🔲 Phase 3: Prompt Library (30 min)
- [ ] Create 200-400 prompt templates
- [ ] Categorize by domain
- [ ] Tag appropriately
- [ ] Set complexity levels
- [ ] Verify all active

### 🔲 Phase 4: Prompt Starters (45 min)
- [ ] Generate 4-8 starters per agent
- [ ] Link to prompt library
- [ ] Set display order
- [ ] Add context hints
- [ ] Verify 1,956+ total records

### 🔲 Phase 5: Role Mapping (20 min)
- [ ] Create agent-role mappings
- [ ] Set primary roles
- [ ] Add secondary roles where applicable
- [ ] Verify many-to-many works

---

## ⏱️ TIME ESTIMATE

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 1: Schema | 15 min | Low |
| Phase 2: Functions | 10 min | Low |
| Phase 3: Prompt Library | 30 min | Medium |
| Phase 4: Prompt Starters | 45 min | High |
| Phase 5: Role Mapping | 20 min | Low |
| **TOTAL** | **2 hours** | **Medium** |

---

## 🎯 SUCCESS CRITERIA

After completion, we should have:

- ✅ 489/489 agents with system prompts (DONE)
- ✅ 489/489 agents with function mapping
- ✅ 489/489 agents with department mapping (DONE)
- ✅ 489/489 agents with 1+ role mappings (M2M)
- ✅ 200-400 prompts in library
- ✅ 1,956-3,912 prompt starters (4-8 per agent)
- ✅ 100% production-ready agents

---

## 🚀 READY TO PROCEED?

Shall I implement all 5 phases to complete production readiness?

**Estimated Time**: 2 hours  
**Complexity**: Medium  
**Impact**: Critical for production launch


