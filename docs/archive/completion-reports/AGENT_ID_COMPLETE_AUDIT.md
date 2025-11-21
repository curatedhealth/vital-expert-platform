# 🚨 AGENT ID CRISIS - COMPLETE AUDIT REPORT

## ❌ CRITICAL FINDING: MULTIPLE INCOMPATIBLE AGENT ID SYSTEMS

Your application has **3 DIFFERENT agent ID systems** that don't talk to each other!

---

## 📊 THE THREE SYSTEMS

### **System 1: `dh_agent` Table** (Clinical Workflow Agents)
```
Format:   AGT-{KEBAB-CASE}
Example:  AGT-BIOSTATISTICS
Field:    code / unique_id
Count:    17 agents
```

**Sample Agents**:
- `AGT-BIOSTATISTICS` → "Biostatistics Analysis Agent"
- `AGT-CLINICAL-DATA-RETRIEVER` → "Clinical Data Retrieval Agent"
- `AGT-REGULATORY-STRATEGY` → "Regulatory Strategy Agent"

---

### **System 2: Agent Definition Files** (Digital Health Agents)
```
Format:   {snake_case}
Example:  digital_therapeutic_advisor
Field:    name / unique_id
Count:    15 agents (DEFINED but NOT IMPORTED!)
```

**Sample Agents**:
- `digital_therapeutic_advisor` → "Digital Therapeutic Advisor" ❌ **NOT IN DATABASE!**
- `remote_patient_monitoring_specialist` → "Remote Patient Monitoring Specialist" ❌ **NOT IN DATABASE!**
- `ai_medical_device_compliance_expert` → "AI/ML Medical Device Compliance Expert" ❌ **NOT IN DATABASE!**

**Location**: `/scripts/DIGITAL_HEALTH_AGENTS_15.json`

---

### **System 3: `ai_agents` Table** (Legacy?)
```
Format:   UUID (id field)
Example:  2d5cb6a4-50da-4acf-abc0-9767726a694b
Field:    id
Count:    10 agents (with DUPLICATES!)
```

**Sample Agents**:
- `2d5cb6a4-50da-4acf-abc0-9767726a694b` → "Business Strategist"
- `4729add8-29f4-4b10-bf74-1f73842d796f` → "Business Strategist" (DUPLICATE!)

---

## 🔴 ROOT CAUSE OF USER'S BUG

**User's Action** (from recording):
1. Clicks "Digital Therapeutic Advisor" in UI
2. Types query about ADHD strategy
3. Selects RAG domain "Digital-health"
4. Selects tool "Web Search"
5. Clicks Send button
6. **NOTHING HAPPENS!** ❌

**Why It Failed**:

```
Step 1: Frontend shows "Digital Therapeutic Advisor" 
        (loaded from... where? 🤔)

Step 2: User selects agent
        selectedAgents = ["digital-therapeutic-advisor"] or ["some-uuid"]

Step 3: Frontend sends to backend:
        agent_ids: ["digital-therapeutic-advisor"]

Step 4: Backend queries Supabase:
        SELECT * FROM agents WHERE id = 'digital-therapeutic-advisor'
        
Step 5: ❌ NO RESULTS! Agent doesn't exist in database!

Step 6: Backend returns error or empty response

Step 7: Frontend shows nothing / error
```

---

## 🔍 DETAILED INVESTIGATION FINDINGS

### **Finding 1: Frontend Context (`ask-expert-context.tsx`)**

**Current Code**:
```typescript
// Line 137:
const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

// Line 256-335: refreshAgents() function
const refreshAgents = async () => {
  const response = await fetch(`/api/agents?userId=${user.id}`);
  // ... processes agents
  setAgents(mappedAgents);
};
```

**Questions**:
- ❓ What does `/api/agents` endpoint return?
- ❓ What agent IDs are in the response?
- ❓ Where is "Digital Therapeutic Advisor" coming from?

---

### **Finding 2: Backend Agent Service**

**File**: `services/ai-engine/src/vital_shared/services/agent_service.py`

**Code** (Line 68):
```python
result = self.db.client.table("agents").select("*").eq("id", agent_id).eq("tenant_id", tenant_id).execute()
```

**Expects**:
- `agent_id` as string
- Queries `agents` table by `id` field
- But which table? `dh_agent`? `ai_agents`? Something else?

---

### **Finding 3: Database Reality Check**

**Query 1**: Search for "Digital Therapeutic Advisor" in `dh_agent`
```sql
SELECT id, code, name FROM dh_agent 
WHERE name ILIKE '%digital%' OR name ILIKE '%therapeutic%';
```
**Result**: ❌ **ZERO ROWS!**

**Query 2**: Search for "Digital Therapeutic Advisor" in `ai_agents`
```sql
SELECT id, name FROM ai_agents 
WHERE name ILIKE '%digital%' OR name ILIKE '%therapeutic%';
```
**Result**: ❌ **ZERO ROWS!**

**Query 3**: Check agent definition file
```bash
grep "Digital Therapeutic Advisor" scripts/DIGITAL_HEALTH_AGENTS_15.json
```
**Result**: ✅ **FOUND!** But only in JSON file, NOT in database!

---

## 🎯 THE REAL PROBLEM

**The 15 Digital Health Agents (including "Digital Therapeutic Advisor") were DEFINED but NEVER IMPORTED to the database!**

**Evidence**:
1. ✅ JSON file exists: `scripts/DIGITAL_HEALTH_AGENTS_15.json`
2. ✅ Contains 15 agent definitions
3. ❌ NOT in `dh_agent` table
4. ❌ NOT in `ai_agents` table
5. ❌ NOT queryable by backend

**Impact**:
- Users can't select these agents
- Queries fail silently
- Mode 1 is completely broken for these agents

---

## 🔧 IMMEDIATE SOLUTIONS

### **Solution 1: Import Missing Agents** ⭐ (RECOMMENDED)

**Step 1**: Run import script
```bash
cd scripts
node import-digital-health-agents.js
```

**Step 2**: Verify import
```sql
SELECT COUNT(*) FROM ai_agents 
WHERE name IN ('Digital Therapeutic Advisor', 'Remote Patient Monitoring Specialist', ...);
-- Expected: 15
```

**Step 3**: Get agent UUIDs
```sql
SELECT id, name FROM ai_agents 
WHERE name = 'Digital Therapeutic Advisor';
```

**Step 4**: Update frontend to use correct UUIDs

---

### **Solution 2: Fix Frontend-Backend ID Mapping**

**Option A**: Frontend sends UUIDs
```typescript
// Frontend stores agent objects with UUIDs:
const agent = {
  id: "eb896072-0c14-40ac-8b94-dc883aa3defd",
  name: "digital_therapeutic_advisor",
  displayName: "Digital Therapeutic Advisor"
};

// When sending to backend:
agent_ids: [agent.id]  // Send UUID
```

**Option B**: Backend accepts snake_case names
```python
# Backend query:
result = self.db.client.table("agents")\
  .select("*")\
  .eq("name", agent_id)\  # Query by name instead of id
  .eq("tenant_id", tenant_id)\
  .execute()
```

**Option C**: Add ID translation layer
```typescript
const AGENT_ID_MAP = {
  "digital-therapeutic-advisor": "eb896072-0c14-40ac-8b94-dc883aa3defd",
  "remote-patient-monitoring-specialist": "uuid-here",
  // ...
};

// Translate before sending:
agent_ids: selectedAgents.map(id => AGENT_ID_MAP[id] || id)
```

---

## 📋 COMPLETE FIX CHECKLIST

### **Phase 1: Database (URGENT)** 🚨
- [ ] Run import script to add 15 Digital Health agents
- [ ] Verify all agents are in database with correct IDs
- [ ] Check for duplicate agents and clean up
- [ ] Standardize on ONE primary agent table

### **Phase 2: Backend**
- [ ] Verify `/api/agents` endpoint returns correct agent IDs
- [ ] Ensure agent service queries correct table
- [ ] Add logging to show what agent IDs backend receives
- [ ] Test backend with actual agent IDs from database

### **Phase 3: Frontend**
- [ ] Verify `refreshAgents()` fetches correct agent IDs
- [ ] Ensure `selectedAgents` contains database-compatible IDs
- [ ] Fix any ID translation if needed
- [ ] Test agent selection end-to-end

### **Phase 4: Pinecone** (If using RAG)
- [ ] Check what agent IDs are in Pinecone metadata
- [ ] Sync Pinecone metadata with database IDs
- [ ] Test RAG queries with correct agent IDs

---

## 🚀 RECOMMENDED ACTION PLAN

### **Immediate (Today)**:
1. ✅ **Import missing agents** - Run import script
2. ✅ **Get agent UUIDs** - Query database for IDs
3. ✅ **Test one agent** - Verify "Digital Therapeutic Advisor" works

### **Short-term (This Week)**:
1. ✅ **Audit all agent tables** - Identify which table is source of truth
2. ✅ **Standardize ID format** - Choose UUID or snake_case
3. ✅ **Fix frontend/backend mapping** - Ensure IDs match
4. ✅ **Clean up duplicates** - Remove redundant agent entries

### **Long-term (Next Sprint)**:
1. ✅ **Create agent management service** - Centralize agent operations
2. ✅ **Add agent validation** - Verify IDs exist before queries
3. ✅ **Implement agent sync** - Keep all systems in sync
4. ✅ **Document ID conventions** - Prevent future mismatches

---

## 🎯 NEXT STEPS

**I need your input**:

1. **Which agent table is the source of truth?**
   - `dh_agent`?
   - `ai_agents`?
   - JSON files?

2. **Should I run the import script now?**
   - This will add the 15 missing agents to the database

3. **What ID format do you want to standardize on?**
   - UUIDs (recommended for database queries)
   - snake_case names (simpler but needs unique constraint)
   - Current hybrid (requires translation layer)

**Let me know and I'll implement the complete fix!** 🚀

---

## 📚 INVESTIGATION FILES CREATED

1. ✅ `AGENT_ID_INVESTIGATION.md` - Detailed investigation
2. ✅ `MODE1_CRITICAL_BUG_AUDIT.md` - Mode 1 bug analysis
3. ✅ `MODE1_BUG_FIXED.md` - Frontend bug fix
4. ✅ This file - Complete audit report


