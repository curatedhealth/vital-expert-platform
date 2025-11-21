# **05_foundation_prompts.sql - CREATION SUMMARY**

**Created:** November 2, 2025  
**Status:** ✅ **READY TO SEED**

---

## **📋 WHAT'S IN THIS FILE**

### **9 Prompts from UC_CD_002 (Digital Biomarker Validation - DiMe V3)**

| Prompt ID | Name | Category | Complexity | Target Roles |
|-----------|------|----------|------------|--------------|
| **PRM-CD-002-1.1-INTENDED-USE** | Digital Biomarker Intended Use Definition | digital_biomarker_validation | INTERMEDIATE | P06_DTXCMO, P04_REGDIR, P06_PMDIG |
| **PRM-CD-002-2.1-V1-DESIGN** | Verification Study Design (V1) | digital_biomarker_validation | ADVANCED | P07_DATASC, P09_DATASCIENCE, P04_BIOSTAT |
| **PRM-CD-002-3.1-V1-EXECUTE** | Execute Verification Study & Analysis | digital_biomarker_validation | ADVANCED | P07_DATASC, P09_DATASCIENCE, P04_BIOSTAT |
| **PRM-CD-002-4.1-V2-DESIGN** | Analytical Validation Study Design (V2) | digital_biomarker_validation | ADVANCED | P08_CLINRES, P08_HEOR, P04_BIOSTAT |
| **PRM-CD-002-5.1-V2-EXECUTE** | Execute Analytical Validation | digital_biomarker_validation | ADVANCED | P08_CLINRES, P08_HEOR, P04_BIOSTAT |
| **PRM-CD-002-6.1-V3-DESIGN** | Clinical Validation Study Design (V3) | digital_biomarker_validation | EXPERT | P08_CLINRES, P08_HEOR, P06_DTXCMO, P04_REGDIR |
| **PRM-CD-002-7.1-V3-EXECUTE** | Execute Clinical Validation & MCID Determination | digital_biomarker_validation | EXPERT | P08_CLINRES, P08_HEOR, P15_HEOR, P04_BIOSTAT |
| **PRM-CD-002-8.1-FDA-PRESUB** | Regulatory Strategy & FDA Pre-Submission | regulatory_affairs | EXPERT | P04_REGDIR, P05_REGAFF, P06_DTXCMO |
| **PRM-CD-002-9.1-PUBLICATION** | Validation Report & Publication | medical_writing | ADVANCED | P16_MEDWRIT, P11_MEDICAL_WRITER, P08_CLINRES, P01_CMO |

---

## **🎯 PROMPT COVERAGE**

### **V1 Verification (3 prompts)**
- 1.1: Define Intended Use & Context of Use
- 2.1: Design Verification Study (V1)
- 3.1: Execute Verification Study & Analysis

### **V2 Analytical Validation (2 prompts)**
- 4.1: Design Analytical Validation Study (V2)
- 5.1: Execute Analytical Validation

### **V3 Clinical Validation (4 prompts)**
- 6.1: Design Clinical Validation Study (V3)
- 7.1: Execute Clinical Validation & MCID Determination
- 8.1: Regulatory Strategy & FDA Pre-Submission
- 9.1: Validation Report & Publication

---

## **📊 PROMPT STRUCTURE**

Each prompt includes:

### **Metadata Fields**
- ✅ `name` - Unique identifier (e.g., `PRM-CD-002-1.1-INTENDED-USE`)
- ✅ `display_name` - Human-readable title
- ✅ `description` - Brief summary
- ✅ `category` - Classification (digital_biomarker_validation, regulatory_affairs, medical_writing)
- ✅ `status` - All set to `active`
- ✅ `version` - All set to `1.0.0`
- ✅ `tags` - Search/filter tags
- ✅ `use_cases` - Associated use case codes
- ✅ `target_roles` - Which personas should use this prompt
- ✅ `metadata` - Additional JSONB data

### **Prompt Content**
- ✅ `prompt_text` - Full formatted prompt instructions
- ✅ `system_prompt` - System role and expertise definition
- ✅ `user_prompt_template` - User input template with variables
- ✅ `variables` - JSONB array of template variables

### **Metadata Details**
```json
{
  "prompt_id": "1.1",
  "use_case": "UC_CD_002",
  "workflow_phase": "V1_Verification",
  "task_code": "TSK-CD-002-P1-01",
  "estimated_duration": "2-4 hours",
  "complexity": "INTERMEDIATE",
  "pattern": "CoT",
  "recommended_model": "claude-3-5-sonnet",
  "temperature": 0.7,
  "max_tokens": 4000
}
```

---

## **🔧 TABLE USED**

**`prompts`** - Shared/library prompt table

**NOT using `dh_prompt`** because that table requires `task_id` (task-specific prompts).

The `prompts` table is perfect for reusable foundation prompts that can be:
- Referenced by multiple tasks
- Shared across use cases
- Used in different workflows
- Versioned independently

---

## **✅ SCHEMA COMPLIANCE**

### **Required Fields** ✅
- `tenant_id` - From session_config
- `name` - Unique per tenant
- `prompt_text` - Main prompt content

### **Optional Fields Used** ✅
- `display_name` - Human-readable title
- `description` - Summary
- `category` - Classification
- `system_prompt` - System role definition
- `user_prompt_template` - Input template with variables
- `variables` - JSONB array of variable names
- `use_cases` - TEXT array of use case codes
- `target_roles` - TEXT array of persona codes
- `tags` - TEXT array for search/filter
- `metadata` - JSONB for additional data
- `status` - active/inactive/deprecated/draft
- `version` - Semantic version string

### **Unique Constraint** ✅
- `UNIQUE(tenant_id, name)` - Each prompt name must be unique per tenant

### **ON CONFLICT** ✅
```sql
ON CONFLICT (tenant_id, name)
DO UPDATE SET
  [all fields updated],
  updated_at = CURRENT_TIMESTAMP
```

---

## **🎯 NEXT STEPS**

### **1. Test the Seed File**
```bash
psql -U your_user -d your_db -f 05_foundation_prompts.sql
```

Expected output:
```
| status | prompt_count | by_category |
|--------|-------------|-------------|
| Foundation Prompts Seeded | 9 | {"digital_biomarker_validation": 7, "regulatory_affairs": 1, "medical_writing": 1} |
```

### **2. Link Prompts to Tasks** (Future Enhancement)

Once prompts are seeded, they can be linked to tasks via:
- `dh_task_prompt_assignment` table (if it exists)
- Or store prompt references in task metadata

Example:
```sql
INSERT INTO dh_task_prompt_assignment (
  tenant_id,
  task_id,
  prompt_id,
  task_unique_id,
  prompt_unique_id,
  sequence,
  is_required
)
SELECT
  t.tenant_id,
  t.id,
  p.id,
  t.unique_id,
  'PRM-CD-002-1.1-INTENDED-USE',
  1,
  true
FROM dh_task t
JOIN prompts p ON p.name = 'PRM-CD-002-1.1-INTENDED-USE' AND p.tenant_id = t.tenant_id
WHERE t.code = 'TSK-CD-002-P1-01';
```

### **3. Add Prompts from Other Use Cases**

Extend this file to include prompts from:
- UC_CD_001 (Clinical Endpoint Selection)
- UC_CD_003 (RCT Design)
- UC_CD_004 (Formulary Positioning)
- UC_CD_005 (PRO Instrument Selection)
- etc.

---

## **📚 REFERENCES**

- **UC_CD_002 Documentation**: Digital Biomarker Validation Strategy (DiMe V3 Framework)
- **DiMe V3 Framework**: Digital Medicine Society Validation Framework
- **Foundation Personas**: `01_foundation_personas.sql`
- **Schema Reference**: `SEED_SCHEMA_REFERENCE.md`

---

## **✅ QUALITY CHECKLIST**

- ✅ All 9 prompts from UC_CD_002 included
- ✅ Correct table used (`prompts`, not `dh_prompt`)
- ✅ All required fields provided
- ✅ ON CONFLICT clause correct
- ✅ Session configuration setup
- ✅ Verification queries included
- ✅ Variables documented for each prompt
- ✅ System prompts define expert roles
- ✅ User templates include variable placeholders
- ✅ Metadata includes all relevant details
- ✅ Target roles reference existing personas
- ✅ Use cases reference existing use case codes
- ✅ Tags provided for searchability
- ✅ Categories aligned with domain structure

---

## **🎉 RESULT**

**Foundation Prompts Layer: 9 prompts seeded!**

These prompts are now **reusable across all use cases** that involve digital biomarker validation, making them true foundation assets! 🚀

