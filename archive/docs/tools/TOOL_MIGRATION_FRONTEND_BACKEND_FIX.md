# 🔧 TOOL MIGRATION - Frontend/Backend Fix Required

**Date**: November 3, 2025  
**Status**: ⚠️ **ACTION REQUIRED**  
**Impact**: Tool selection in Mode 1-4 not working correctly

---

## 🚨 **PROBLEM IDENTIFIED**

After migrating tools to the unified `dh_tool` table, **both frontend and backend are still querying the old `tools` table** (now archived as `tools_legacy`).

### **Current State:**
1. ✅ `dh_tool` table - Unified, has 26 tools (9 AI + 17 software)
2. ✅ `tools_legacy` table - Old table, archived, has 9 AI tools
3. ❌ Frontend TypeScript - Still queries `tools` (now renamed to `tools_legacy`)
4. ❌ Python Backend - Queries `tools` (which is now `tools_legacy`)
5. ❌ Modal/Tool Selection - Not fetching from correct table

---

## 📊 **AFFECTED COMPONENTS**

### **Frontend (TypeScript)**

| File | Line | Issue | Fix Needed |
|------|------|-------|------------|
| `tool-registry-service.ts` | 116 | `.from('tools')` | Change to `.from('dh_tool')` |
| `tool-registry-service.ts` | 144 | `.from('tools')` | Change to `.from('dh_tool')` |
| `tool-registry-service.ts` | 182 | `.from('tools')` | Change to `.from('dh_tool')` |
| `tool-registry-service.ts` | 205 | `.from('tools')` | Change to `.from('dh_tool')` |
| `tool-registry-service.ts` | 238 | `.from('agent_tools')` | ✅ OK (joins to `dh_tool`) |
| `dynamic-tool-loader.ts` | All | Uses `tool-registry-service` | ✅ Will auto-fix |
| `agent-tool-loader.ts` | 40 | Uses `agents.tools` column | ✅ OK (different table) |

### **Backend (Python)**

| File | Line | Issue | Fix Needed |
|------|------|-------|------------|
| `tool_registry_service.py` | 50 | `.table("tools")` | Change to `.table("dh_tool")` |
| `tool_registry_service.py` | All | Column names differ | Update to match `dh_tool` schema |

### **Database**

| Table | Status | Notes |
|-------|--------|-------|
| `dh_tool` | ✅ Active | Unified table with 26 tools |
| `tools_legacy` | ⚠️ Archived | Old table, read-only |
| `agent_tools` | ✅ Active | Links agents to tools (needs FK update) |

---

## 🎯 **REQUIRED FIXES**

### **Fix 1: Update Frontend tool-registry-service.ts**

**File**: `apps/digital-health-startup/src/lib/services/tool-registry-service.ts`

**Changes Needed**:

1. **Column Mapping** (old `tools` → new `dh_tool`):
```typescript
// OLD SCHEMA (tools_legacy)
tool_id → id
tool_key → unique_id
tool_name → name
tool_description → tool_description (same)
tool_type → tool_type (same)
implementation_path → implementation_path (same)
requires_api_key → (in metadata or required_env_vars)
api_key_env_var → required_env_vars[]
is_active → is_active (same)

// NEW SCHEMA (dh_tool)
id
unique_id
code
name
category
tool_type
implementation_type
implementation_path
function_name
langgraph_compatible
cost_per_execution
is_active
// ... plus 15+ other columns
```

2. **Query Updates**:
```typescript
// OLD
.from('tools')
.select(`
  *,
  category:tool_categories(*),
  tags:tool_tag_assignments(tag:tool_tags(*))
`)

// NEW
.from('dh_tool')
.select(`
  *,
  // Note: dh_tool uses category as text, not FK
`)
.eq('tenant_id', tenantId) // Multi-tenant!
```

3. **Interface Updates**:
```typescript
export interface Tool {
  id: string;
  unique_id: string; // Was: tool_key
  name: string;     // Was: tool_name
  tool_description?: string; // NEW column
  category: string; // Now text, not FK
  tool_type: 'ai_function' | 'software_reference' | 'database' | 'saas' | 'api' | 'ai_framework';
  implementation_type?: string;
  implementation_path?: string;
  function_name?: string;
  langgraph_compatible: boolean;
  cost_per_execution?: number;
  required_env_vars?: string[];
  is_active: boolean;
  // ... other new fields
}
```

### **Fix 2: Update Backend tool_registry_service.py**

**File**: `services/ai-engine/src/services/tool_registry_service.py`

**Changes Needed**:

1. **Table Name**:
```python
# OLD
response = await self.supabase.table("tools").select("*")...

# NEW
response = await self.supabase.table("dh_tool").select("*")...
```

2. **Column Mapping**:
```python
# OLD
tool_code = tool_config["tool_code"]
tool_name = tool_config["tool_name"]
tool_description = tool_config["tool_description"]

# NEW
tool_code = tool_config["code"]
tool_name = tool_config["name"]
tool_description = tool_config.get("tool_description", "")
unique_id = tool_config["unique_id"]
```

3. **Add Tenant Filter**:
```python
# NEW - Multi-tenant support
response = await self.supabase.table("dh_tool")\
    .select("*")\
    .eq("code", tool_code)\
    .eq("tenant_id", tenant_id)\  # CRITICAL!
    .eq("is_active", True)\
    .execute()
```

### **Fix 3: Update agent_tools FK Constraint**

**Database Migration**:
```sql
-- Update agent_tools to reference dh_tool
ALTER TABLE agent_tools DROP CONSTRAINT IF EXISTS agent_tools_tool_id_fkey;

ALTER TABLE agent_tools 
ADD CONSTRAINT agent_tools_tool_id_fkey 
FOREIGN KEY (tool_id) 
REFERENCES dh_tool(id) 
ON DELETE CASCADE;
```

### **Fix 4: Populate dh_tool.code from unique_id**

Some tools might not have `code` populated:
```sql
UPDATE dh_tool 
SET code = CASE 
    WHEN code IS NULL OR code = '' THEN 
        UPPER(REPLACE(unique_id, '-', '_'))
    ELSE code
END
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);
```

---

## 🔍 **TESTING CHECKLIST**

After fixes, test these scenarios:

### **Mode 1: Manual Interactive**
- [ ] Select agent
- [ ] Verify tools load in UI
- [ ] Toggle tools on/off
- [ ] Send message with tools enabled
- [ ] Verify tool execution in response

### **Mode 2: Automatic Agent Selection**
- [ ] Ask question
- [ ] Verify agent auto-selected
- [ ] Verify correct tools loaded
- [ ] Check tool usage in response

### **Mode 3: Autonomous Automatic**
- [ ] Trigger autonomous mode
- [ ] Verify tool selection happens
- [ ] Check tool execution logs

### **Mode 4: Autonomous Manual**
- [ ] Select agent manually
- [ ] Enable autonomous mode
- [ ] Verify tools from selected agent
- [ ] Check workflow execution

### **Tool Registry UI**
- [ ] Open tool selection modal
- [ ] Verify 26 tools displayed (not just 9)
- [ ] Check tool categories correct
- [ ] Verify tool descriptions
- [ ] Test tool enable/disable

---

## 📝 **IMPLEMENTATION STEPS**

### **Step 1: Frontend Fix (TypeScript)**
1. Update `tool-registry-service.ts`:
   - Change table name to `dh_tool`
   - Update column names
   - Add tenant filtering
   - Update interfaces

2. Update `dynamic-tool-loader.ts`:
   - Update Tool interface reference
   - Adjust column name usage

3. Clear browser cache/localStorage

### **Step 2: Backend Fix (Python)**
1. Update `tool_registry_service.py`:
   - Change table name to `dh_tool`
   - Update column mappings
   - Add tenant_id parameter
   - Update method signatures

2. Test with pytest:
```bash
cd services/ai-engine
pytest tests/test_tool_registry.py -v
```

### **Step 3: Database Fix (SQL)**
1. Update FK constraint
2. Populate missing `code` values
3. Verify data integrity

### **Step 4: Integration Testing**
1. Test all 4 modes
2. Verify tool loading
3. Check tool execution
4. Monitor logs for errors

### **Step 5: Monitor & Rollback Plan**
1. Monitor Supabase logs
2. Check frontend console
3. If issues, temporarily rename:
```sql
ALTER TABLE tools_legacy RENAME TO tools; -- Rollback
ALTER TABLE dh_tool RENAME TO dh_tool_backup; -- Temporarily disable
```

---

## 🎯 **ESTIMATED TIME**

| Task | Duration | Complexity |
|------|----------|------------|
| Frontend Fix | 30 min | Medium |
| Backend Fix | 30 min | Medium |
| Database Fix | 10 min | Low |
| Testing | 45 min | Medium |
| **TOTAL** | **2 hours** | Medium |

---

## 🚨 **PRIORITY**

**HIGH** - Tool selection is currently broken in Modes 1-4

---

## 📞 **NEXT STEPS**

1. ✅ Review this document
2. ⚠️ Approve migration plan
3. ⏳ Execute fixes (in order)
4. ⏳ Test thoroughly
5. ⏳ Deploy to production

---

**Would you like me to proceed with implementing these fixes now?**

Options:
- **A**: Fix Frontend Only (TypeScript) - 30 min
- **B**: Fix Backend Only (Python) - 30 min  
- **C**: Fix Both + Database - 2 hours (RECOMMENDED)
- **D**: Create separate PRs for each fix

**Recommended**: Option C - Fix everything at once to avoid partial breakage.

