# 🛠️ UNIFIED TOOL LIBRARY - Recommendation

**Date**: November 3, 2025  
**Status**: ⚠️ Current: 2 separate tool tables  
**Goal**: ✅ Unified tool registry

---

## 🎯 **THE PROBLEM**

You currently have **TWO separate tool tables**:

### **Table 1: `dh_tool` (17 tools)**
- **Purpose**: Clinical/research software (R, SAS, Medidata, Veeva)
- **Scope**: Tenant-specific
- **Usage**: Referenced in workflows, assigned to tasks
- **Schema**: Basic (name, category, vendor, metadata)
- **Integration**: `dh_task_tool` join table

### **Table 2: `tools` (9 tools)**
- **Purpose**: AI function-calling tools (Web search, PubMed API, Calculator)
- **Scope**: System-wide
- **Usage**: Called by AI agents during execution
- **Schema**: Advanced (implementation, input/output schemas, LangGraph config)
- **Integration**: `agent_tools` join table

---

## ❌ **WHY THIS IS CONFUSING**

1. **Duplicate Concepts**: PubMed exists in BOTH tables
   - `dh_tool`: "PubMed/MEDLINE" (reference tool for humans)
   - `tools`: "PubMed Medical Research Search" (API for AI)

2. **Unclear Separation**: When should something be in `dh_tool` vs `tools`?

3. **Complex Queries**: Need to join both tables to get complete tool list

4. **Maintenance**: Update two places when adding tools

5. **User Confusion**: "Where do I find the tools?"

---

## ✅ **RECOMMENDED SOLUTION: UNIFIED `dh_tool` TABLE**

### **Keep**: `dh_tool` as the single source of truth
### **Enhance**: Add columns from `tools` for AI capabilities
### **Migrate**: Move 9 AI tools into `dh_tool`
### **Archive**: Deprecate `tools` table (or use for other purposes)

---

## 📊 **UNIFIED SCHEMA DESIGN**

### **Core Columns (from current `dh_tool`):**
```sql
id                  uuid PRIMARY KEY
tenant_id           uuid NOT NULL (FK to tenants)
unique_id           text NOT NULL
code                text NOT NULL
name                text NOT NULL
category            text (medical, statistical, web, computation, regulatory, etc.)
subcategory         text (research, search, analysis, etc.)
vendor              text (optional - for commercial tools)
version             text
is_active           boolean DEFAULT true
created_at          timestamp
updated_at          timestamp
```

### **Enhanced Columns (from `tools`):**
```sql
-- AI/Function Calling Capabilities
tool_type                   text NOT NULL 
  -- VALUES: 'ai_function', 'software_reference', 'api', 'saas', 'desktop', 'web_service'
  
implementation_type         text 
  -- 'python_function', 'api_call', 'external', 'manual'
  
implementation_path         text 
  -- e.g., 'tools.web_tools' for Python functions
  
function_name               text 
  -- Python function name if applicable
  
-- Schemas for AI Function Calling
input_schema                jsonb 
  -- JSON Schema for function inputs
  
output_schema               jsonb 
  -- JSON Schema for function outputs
  
-- Execution Configuration
is_async                    boolean DEFAULT false
max_execution_time_seconds  integer
retry_config                jsonb
rate_limit_per_minute       integer
cost_per_execution          decimal(10,4)

-- LangGraph Integration
langgraph_compatible        boolean DEFAULT false
langgraph_node_name         text

-- Access & Security
access_level                text DEFAULT 'public'
  -- 'public', 'tenant', 'role_based'
  
required_env_vars           text[]
allowed_tenants             uuid[]
allowed_roles               text[]

-- Documentation
tool_description            text
documentation_url           text
example_usage               jsonb
tags                        text[]

-- Existing from dh_tool
metadata                    jsonb 
  -- Flexible metadata (vendor info, compliance, etc.)
  
capabilities                jsonb 
  -- Tool-specific capabilities
  
access_requirements         jsonb 
  -- Licensing, credentials, etc.
```

---

## 🎯 **TOOL TYPE CLASSIFICATION**

### **Type 1: AI Function-Calling Tools** (`tool_type = 'ai_function'`)
**Examples**:
- Web Search (Tavily)
- PubMed API Search
- Calculator
- RAG Knowledge Search
- Web Scraper

**Characteristics**:
- ✅ Have `implementation_path` and `function_name`
- ✅ Have `input_schema` and `output_schema`
- ✅ Are `langgraph_compatible = true`
- ✅ Can be called by AI agents in real-time
- ✅ Have `cost_per_execution`

---

### **Type 2: Software Reference Tools** (`tool_type = 'software_reference'`)
**Examples**:
- R Statistical Software
- SAS
- IBM SPSS
- Stata

**Characteristics**:
- ❌ No direct API integration
- ✅ Used by human operators
- ✅ Referenced in task descriptions
- ✅ Have vendor/version info
- ❌ Not LangGraph compatible

---

### **Type 3: API/Web Services** (`tool_type = 'api'`)
**Examples**:
- Medidata Rave EDC (API available)
- Veeva Vault (API available)
- REDCap (API available)

**Characteristics**:
- ✅ Have API endpoints
- ✅ Could be AI-callable (future)
- ✅ Have authentication requirements
- ⚠️ May need wrapper functions

---

### **Type 4: SaaS/Enterprise Platforms** (`tool_type = 'saas'`)
**Examples**:
- Veeva CTMS
- Lorenz Docubridge
- Oracle Crystal Ball

**Characteristics**:
- ✅ Cloud-based platforms
- ✅ Used via web interface
- ❌ Limited/no API access
- ✅ Commercial licensing

---

### **Type 5: Knowledge Bases/Databases** (`tool_type = 'database'`)
**Examples**:
- PubMed/MEDLINE (can be both reference AND API)
- ClinicalTrials.gov (can be both reference AND API)
- Cochrane Library
- PROQOLID

**Characteristics**:
- ✅ Searchable databases
- ✅ May have API access
- ✅ Free or subscription
- ✅ Can be both human and AI accessible

---

## 🔄 **MIGRATION STRATEGY**

### **Phase 1: Extend `dh_tool` Schema** ✅
```sql
ALTER TABLE dh_tool 
ADD COLUMN tool_type text DEFAULT 'software_reference',
ADD COLUMN implementation_type text,
ADD COLUMN implementation_path text,
ADD COLUMN function_name text,
ADD COLUMN input_schema jsonb,
ADD COLUMN output_schema jsonb,
ADD COLUMN is_async boolean DEFAULT false,
ADD COLUMN max_execution_time_seconds integer,
ADD COLUMN retry_config jsonb,
ADD COLUMN rate_limit_per_minute integer,
ADD COLUMN cost_per_execution decimal(10,4) DEFAULT 0,
ADD COLUMN langgraph_compatible boolean DEFAULT false,
ADD COLUMN langgraph_node_name text,
ADD COLUMN access_level text DEFAULT 'public',
ADD COLUMN required_env_vars text[],
ADD COLUMN allowed_tenants uuid[],
ADD COLUMN allowed_roles text[],
ADD COLUMN tool_description text,
ADD COLUMN documentation_url text,
ADD COLUMN example_usage jsonb,
ADD COLUMN tags text[];
```

### **Phase 2: Migrate AI Tools from `tools` → `dh_tool`** ✅
```sql
INSERT INTO dh_tool (
    tenant_id,
    unique_id,
    code,
    name,
    category,
    subcategory,
    tool_type,
    implementation_type,
    implementation_path,
    function_name,
    input_schema,
    output_schema,
    is_async,
    max_execution_time_seconds,
    retry_config,
    rate_limit_per_minute,
    cost_per_execution,
    langgraph_compatible,
    langgraph_node_name,
    access_level,
    required_env_vars,
    tool_description,
    documentation_url,
    example_usage,
    tags,
    metadata,
    is_active
)
SELECT 
    (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
    'TL-AI-' || tool_code,  -- New unique_id format
    tool_code,
    tool_name,
    category,
    subcategory,
    'ai_function',  -- Mark as AI function
    implementation_type,
    implementation_path,
    function_name,
    input_schema,
    output_schema,
    is_async,
    max_execution_time_seconds,
    retry_config,
    rate_limit_per_minute,
    cost_per_execution::decimal,
    langgraph_compatible,
    langgraph_node_name,
    access_level,
    required_env_vars,
    tool_description,
    documentation_url,
    example_usage,
    tags,
    metadata,
    CASE WHEN status = 'active' THEN true ELSE false END
FROM tools
WHERE status = 'active';
```

### **Phase 3: Update Existing `dh_tool` Records** ✅
```sql
-- Mark existing tools with appropriate tool_type
UPDATE dh_tool 
SET tool_type = CASE 
    WHEN name LIKE '%Statistical%' OR name IN ('R Statistical Software', 'SAS', 'SPSS', 'Stata') 
        THEN 'software_reference'
    WHEN name LIKE '%EDC%' OR name LIKE '%CTMS%' OR name LIKE '%Vault%' 
        THEN 'saas'
    WHEN name IN ('PubMed/MEDLINE', 'ClinicalTrials.gov', 'Cochrane Library', 'PROQOLID') 
        THEN 'database'
    ELSE 'software_reference'
END
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
AND tool_type IS NULL;
```

### **Phase 4: Migrate Agent Assignments** ✅
```sql
-- Create new join table if needed, or update existing dh_task_tool
-- Map agent_tools → dh_task_agent with tool assignments

-- Update agent tool assignments to use new unified dh_tool
-- (This step depends on your agent architecture)
```

### **Phase 5: Archive `tools` Table** ⚠️
```sql
-- Rename to tools_legacy for historical reference
ALTER TABLE tools RENAME TO tools_legacy;

-- Or drop if no longer needed (after full migration)
-- DROP TABLE tools;
```

---

## 📋 **UNIFIED TOOL CATEGORIES**

After unification, your tools will be organized as:

### **Medical/Clinical (8 tools)**
- PubMed Search (AI + Reference)
- ClinicalTrials.gov (AI + Reference)
- FDA Drugs (AI)
- WHO Guidelines (AI)
- Cochrane Library (Reference)
- PROQOLID (Reference)
- Medidata Rave EDC (SaaS)
- REDCap (API)

### **Statistical/Computational (5 tools)**
- R Statistical Software (Reference)
- SAS (Reference)
- IBM SPSS (Reference)
- Stata (Reference)
- Calculator (AI)

### **Web/Research (4 tools)**
- Web Search - Tavily (AI)
- Web Scraper (AI)
- arXiv Search (AI)
- RAG Knowledge Search (AI)

### **Regulatory/Enterprise (5 tools)**
- Veeva Vault CTMS (SaaS)
- Veeva Vault RIM (SaaS)
- Lorenz Docubridge (SaaS)
- TreeAge Pro (Software)
- Oracle Crystal Ball (Software)

### **Workflow/System (2 tools)**
- LangGraph SDK (AI Framework)
- Task Manager (System)

**Total**: ~24-26 unified tools

---

## ✅ **BENEFITS OF UNIFIED APPROACH**

1. ✅ **Single Source of Truth**: One table for all tools
2. ✅ **Clear Classification**: `tool_type` distinguishes AI vs reference tools
3. ✅ **Flexible**: Can handle any tool type (AI, software, API, SaaS)
4. ✅ **Backward Compatible**: Existing `dh_task_tool` still works
5. ✅ **Future-Proof**: Easy to add new tool types
6. ✅ **Tenant Support**: Multi-tenant by default
7. ✅ **Complete Metadata**: Combines best of both schemas
8. ✅ **Easier Queries**: One table to query for all tools
9. ✅ **Better UX**: Users see complete tool catalog
10. ✅ **Maintainable**: Update once, use everywhere

---

## 🚀 **RECOMMENDED ACTION PLAN**

### **Option A: Full Migration** (Recommended for clean architecture)
1. ✅ Extend `dh_tool` schema (add AI columns)
2. ✅ Migrate 9 AI tools from `tools` → `dh_tool`
3. ✅ Update existing 17 tools with `tool_type`
4. ✅ Update agent assignments
5. ✅ Archive/drop `tools` table
6. ✅ Update frontend to use single tool source

**Timeline**: 2-3 hours  
**Risk**: Low (can rollback easily)  
**Benefit**: Clean, unified architecture

---

### **Option B: Soft Migration** (Keep both temporarily)
1. ✅ Extend `dh_tool` schema
2. ✅ Copy AI tools to `dh_tool`
3. ✅ Create view `v_all_tools` that unions both tables
4. ⏳ Gradually migrate agent code to use `dh_tool`
5. ⏳ Eventually archive `tools` table

**Timeline**: 4-6 hours (spread over time)  
**Risk**: Very low (no breaking changes)  
**Benefit**: Safe transition period

---

### **Option C: Keep Separate** (Not recommended)
- Keep both tables as-is
- Create unified view for queries
- Accept the complexity

**Timeline**: 1 hour (just create view)  
**Risk**: Low  
**Benefit**: No migration work  
**Drawback**: Perpetual confusion ❌

---

## 🎯 **MY STRONG RECOMMENDATION**

### **Go with Option A: Full Migration** ✅

**Why**:
1. Clean architecture
2. Single source of truth
3. Easier to maintain
4. Better user experience
5. Future-proof design
6. Only 2-3 hours of work
7. Low risk with high benefit

**When**:
- Now (you're already at 92% complete)
- Before frontend integration
- Before production deployment

---

## 📊 **AFTER UNIFICATION**

You'll have:
- ✅ **26 unified tools** in `dh_tool`
- ✅ **Clear categorization** via `tool_type`
- ✅ **9 AI-callable tools** for agents
- ✅ **17 reference/software tools** for workflows
- ✅ **Single query** to get all tools
- ✅ **Cleaner architecture**
- ✅ **Better documentation**

---

**Would you like me to execute Option A (Full Migration) right now?** 

I can:
1. Create the migration SQL
2. Execute it via MCP
3. Verify the results
4. Update documentation

It will take about 10-15 minutes to complete! ✅

