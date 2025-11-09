# 🔍 AGENT ID COMPLETE INVESTIGATION - IN PROGRESS

## 🎯 CRITICAL FINDING #1: Agent ID Format Mismatch

### **Source of Truth: Supabase + Agent Definition Files**

#### **Digital Therapeutic Advisor Example**:
```json
{
  "name": "digital_therapeutic_advisor",           // ← Internal ID (snake_case)
  "display_name": "Digital Therapeutic Advisor",   // ← UI Display Name
  "unique_id": "digital_therapeutic_advisor",      // ← Same as name
  "id": "eb896072-0c14-40ac-8b94-dc883aa3defd"    // ← UUID (if in database)
}
```

---

## 📊 DATABASE INVESTIGATION RESULTS

### **Table 1: `dh_agent` (Digital Health Agents)**

**Schema**:
- `id` (UUID) - Primary key
- `code` (text) - Agent code (e.g., "AGT-BIOSTATISTICS")
- `name` (text) - Display name (e.g., "Biostatistics Analysis Agent")
- `unique_id` (text) - Unique identifier (e.g., "AGT-BIOSTATISTICS")
- `agent_type` (text) - Type (SPECIALIST, RETRIEVER, SYNTHESIZER, etc.)
- `status` (text) - Status (active, inactive)

**Sample Agents** (17 found):
```
AGT-BIOSTATISTICS → "Biostatistics Analysis Agent"
AGT-CLINICAL-DATA-RETRIEVER → "Clinical Data Retrieval Agent"
AGT-CLINICAL-ENDPOINT → "Clinical Endpoint Selection Agent"
AGT-CLINICAL-REPORT-WRITER → "Clinical Report Writing Agent"
AGT-DECISION-SYNTHESIZER → "Decision Synthesis Agent"
AGT-DOCUMENT-VALIDATOR → "Document Validation Agent"
AGT-EVIDENCE-SYNTHESIZER → "Evidence Synthesis Agent"
AGT-LITERATURE-SEARCH → "Literature Search Agent"
AGT-PROJECT-COORDINATOR → "Project Coordination Agent"
AGT-PROTOCOL-DESIGNER → "Protocol Design Agent"
AGT-QUALITY-VALIDATOR → "Quality Validation Agent"
AGT-REGULATORY-COMPLIANCE → "Regulatory Compliance Checker Agent"
AGT-REGULATORY-INTELLIGENCE → "Regulatory Intelligence Agent"
AGT-REGULATORY-STRATEGY → "Regulatory Strategy Agent"
AGT-SUBMISSION-COMPILER → "Regulatory Submission Compiler Agent"
AGT-STATISTICAL-VALIDATOR → "Statistical Validation Agent"
AGT-WORKFLOW-ORCHESTRATOR → "Workflow Orchestration Agent"
```

**Key Findings**:
- ❌ **NO "Digital Therapeutic Advisor" in this table!**
- ✅ Uses `code` field with format: `AGT-{KEBAB-CASE}`
- ✅ All agents have `unique_id` = `code`

---

### **Table 2: `ai_agents` (AI Agents - Duplicate?)**

**Schema**:
- `id` (UUID) - Primary key
- `name` (varchar) - Agent name
- `description` (text) - Description
- `capabilities` (array) - Capabilities
- `is_custom` (boolean) - Is custom agent
- `is_public` (boolean) - Is public

**Sample Agents** (10 found, with duplicates):
```
Business Strategist (2 duplicates with different UUIDs)
Clinical Research Assistant (2 duplicates)
Market Access Strategist (2 duplicates)
Regulatory Expert (2 duplicates)
Technical Architect (2 duplicates)
```

**Key Findings**:
- ❌ **NO "Digital Therapeutic Advisor" in this table either!**
- ⚠️ **Has duplicate agents** with different UUIDs
- ❌ **Different schema** than `dh_agent`

---

### **Table 3: Agent Definition File** (`DIGITAL_HEALTH_AGENTS_15.json`)

**15 Premium Agents Defined**:
1. `digital_therapeutic_advisor` → "Digital Therapeutic Advisor"
2. `remote_patient_monitoring_specialist` → "Remote Patient Monitoring Specialist"
3. `ai_medical_device_compliance_expert` → "AI/ML Medical Device Compliance Expert"
4. `clinical_decision_support_designer` → "Clinical Decision Support Designer"
5. `telehealth_program_manager` → "Telehealth Program Manager"
6. `mhealth_app_strategist` → "mHealth App Strategist"
7. `wearable_device_integration_specialist` → "Wearable Device Integration Specialist"
8. `patient_engagement_platform_advisor` → "Patient Engagement Platform Advisor"
9. `digital_health_privacy_advisor` → "Digital Health Privacy Advisor"
10. `health_data_interoperability_advisor` → "Health Data Interoperability Advisor"
11. `digital_health_user_research_advisor` → "Digital Health User Research Advisor"
12. `digital_health_reimbursement_navigator` → "Digital Health Reimbursement Navigator"
13. `digital_health_cybersecurity_advisor` → "Digital Health Cybersecurity Advisor"
14. `digital_health_marketing_advisor` → "Digital Health Marketing Advisor"

**Key Findings**:
- ✅ **This is the SOURCE file!**
- ✅ Uses `name` field with format: `{snake_case}`
- ✅ Has `display_name` field for UI display
- ❌ **NOT YET IMPORTED to database!**

---

## 🔴 CRITICAL PROBLEMS IDENTIFIED

### **Problem 1: Multiple Agent ID Systems**

**System A: `dh_agent` table**
```
ID Format: AGT-{KEBAB-CASE}
Example: AGT-BIOSTATISTICS
Field: code / unique_id
```

**System B: Agent Definition Files**
```
ID Format: {snake_case}
Example: digital_therapeutic_advisor
Field: name / unique_id
```

**System C: Frontend (Current)**
```
ID Format: string[] from context
Example: ["digital-therapeutic-advisor"] or ["agent-id-uuid"]
Usage: selectedAgents state
```

**Result**: **3 DIFFERENT ID SYSTEMS! 🚨**

---

### **Problem 2: "Digital Therapeutic Advisor" NOT in Database**

**Evidence**:
- ❌ Not in `dh_agent` table
- ❌ Not in `ai_agents` table
- ✅ Only in JSON definition file (`DIGITAL_HEALTH_AGENTS_15.json`)

**Impact**: User clicks "Digital Therapeutic Advisor" in UI, but:
1. Frontend tries to send agent ID to backend
2. Backend looks for agent in database
3. **Agent doesn't exist in database!**
4. Query fails ❌

---

### **Problem 3: Frontend Bug (Fixed in Previous Step)**

**Original Bug** (Line 310):
```typescript
agent_ids: currentMode === 1 ? selectedAgents.map(a => a.id) : undefined
//                                                    ↑ BUG!
```

**Fixed**:
```typescript
agent_ids: currentMode === 1 ? selectedAgents : undefined
//                              ↑ CORRECT!
```

**But**: This fix only works if `selectedAgents` contains the **correct agent IDs** that match the **database**!

---

## 🔍 NEXT STEPS

1. ⏳ **Check Frontend**: Where are agents fetched from? What IDs are used?
2. ⏳ **Check Backend**: What agent IDs does AI engine expect?
3. ⏳ **Check Pinecone**: What agent IDs are in vector metadata?
4. ⏳ **Create ID Mapping**: Map all 3 systems together
5. ⏳ **Fix All Mismatches**: Standardize on ONE ID format

---

## 📝 PRELIMINARY RECOMMENDATIONS

### **Option A: Standardize on UUIDs** (Recommended)
- Use database UUID as primary identifier
- Store UUID in Pinecone metadata
- Frontend sends UUID to backend
- Backend queries by UUID

### **Option B: Standardize on snake_case names**
- Import all agents from JSON files to database
- Use `name` field (snake_case) as identifier
- Frontend sends name to backend
- Backend queries by name

### **Option C: Create ID Mapping Layer**
- Keep all 3 systems
- Create translation layer (frontend ↔ backend ↔ database)
- Maintain mapping table

---

**Status**: Investigation ongoing...
**Next**: Check frontend agent loading & backend API expectations


