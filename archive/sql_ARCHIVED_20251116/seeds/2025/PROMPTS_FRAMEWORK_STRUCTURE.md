# PROMPTS™ FRAMEWORK - SUPABASE DATA STRUCTURE
## Complete Suite and Sub-Suite Hierarchy

---

## 📊 **DATABASE SCHEMA OVERVIEW**

### **Table Hierarchy:**
```
dh_prompt_suite (Level 2: The 10 Suites)
    ↓
dh_prompt_subsuite (Sub-Acronyms like SUBMIT, COMPLY, etc.)
    ↓
dh_prompt (Individual prompts)
```

---

## **LEVEL 1: DOMAIN** (Stored in metadata)

1. Pharmaceutical Industry
2. Digital Health & DTx
3. Payers & Health Plans
4. Healthcare Providers
5. Regulatory & Compliance

---

## **LEVEL 2: THE 10 PROMPTS™ SUITES** (dh_prompt_suite table)

| Position | Suite ID | Name | Acronym | Category | Prompt Count | Domain | Function |
|----------|----------|------|---------|----------|--------------|--------|----------|
| 1 | SUITE-RULES | RULES™ - Regulatory Excellence | RULES™ | Regulatory & Compliance | 200+ | Pharmaceutical Industry | REGULATORY |
| 2 | SUITE-TRIALS | TRIALS™ - Clinical Development | TRIALS™ | Clinical Research | 180+ | Pharmaceutical Industry | CLINICAL |
| 3 | SUITE-GUARD | GUARD™ - Safety Framework | GUARD™ | Safety & Pharmacovigilance | 150+ | Pharmaceutical Industry | SAFETY |
| 4 | SUITE-VALUE | VALUE™ - Market Access | VALUE™ | Market Access & HEOR | 170+ | Payers & Health Plans | HEOR |
| 5 | SUITE-BRIDGE | BRIDGE™ - Stakeholder Engagement | BRIDGE™ | Medical Affairs | 140+ | Pharmaceutical Industry | MEDICAL_AFFAIRS |
| 6 | SUITE-PROOF | PROOF™ - Evidence Analytics | PROOF™ | Evidence Generation | 160+ | Pharmaceutical Industry | DATA_ANALYTICS |
| 7 | SUITE-CRAFT | CRAFT™ - Medical Writing | CRAFT™ | Medical Writing | 150+ | Pharmaceutical Industry | MEDICAL_AFFAIRS |
| 8 | SUITE-SCOUT | SCOUT™ - Competitive Intelligence | SCOUT™ | Competitive Intelligence | 130+ | Pharmaceutical Industry | BUSINESS_DEV |
| 9 | SUITE-PROJECT | PROJECT™ - Project Management | PROJECT™ | Project Management | 120+ | Pharmaceutical Industry | OPERATIONS |
| 10 | SUITE-FORGE | FORGE™ - Digital Health Development | FORGE™ | Digital Health | 140+ | Digital Health & DTx | DIGITAL_HEALTH |

**Total Prompts Across All Suites:** 1,540+

---

## **LEVEL 3: SUB-SUITES (Sub-Acronyms)** (dh_prompt_subsuite table)

### **FORGE™ Sub-Suites** (for UC_CD_001 & UC_CD_002)

| Suite | Sub-Suite ID | Name | Acronym | Description | Position |
|-------|--------------|------|---------|-------------|----------|
| FORGE™ | SUBSUITE-FORGE-DEVELOP | DEVELOP | DEVELOP | Digital Excellence & Validation & Evidence & Lifecycle & Optimization & Platform | 1 |
| FORGE™ | SUBSUITE-FORGE-VALIDATE | VALIDATE | VALIDATE | Validation & Assessment & Longitudinal Intelligence & Data & Assurance & Technical Excellence | 2 |
| FORGE™ | SUBSUITE-FORGE-REGULATE | REGULATE | REGULATE | Regulatory Excellence & Guidelines & Understanding & Legal & Assurance & Technical Excellence | 3 |
| FORGE™ | SUBSUITE-FORGE-INNOVATE | INNOVATE | INNOVATE | Intelligence & New Networks & Operations & Validation & Assurance & Technical Excellence | 4 |
| FORGE™ | SUBSUITE-FORGE-IMPLEMENT | IMPLEMENT | IMPLEMENT | Implementation & Multiplatform & Pilot & Lifecycle & Evidence & Medical & Excellence & New Technical Standards | 5 |

### **RULES™ Sub-Suites**

| Suite | Sub-Suite ID | Name | Acronym | Description | Position |
|-------|--------------|------|---------|-------------|----------|
| RULES™ | SUBSUITE-RULES-SUBMIT | SUBMIT | SUBMIT | Strategic Understanding & Breakthrough Methodologies In Tactical Preparation | 1 |
| RULES™ | SUBSUITE-RULES-COMPLY | COMPLY | COMPLY | Comprehensive Oversight & Management Procedures Legal & Yield | 2 |
| RULES™ | SUBSUITE-RULES-PATHWAY | PATHWAY | PATHWAY | Procedural Approval Tactics & Healthcare-Wide Authority Yield | 3 |
| RULES™ | SUBSUITE-RULES-APPROVE | APPROVE | APPROVE | Authorization Process & Regulatory Operations & Validation Execution | 4 |
| RULES™ | SUBSUITE-RULES-GLOBAL | GLOBAL | GLOBAL | Geographical Operations & Broad Agencies Legal Standards | 5 |

---

## **LEVEL 4: TASK TYPES** (Stored in prompt.metadata)

1. **ANALYSIS** - Data interpretation, assessment
2. **CREATION** - Document generation, strategy development
3. **EVALUATION** - Scoring, gap analysis, benchmarking
4. **PLANNING** - Strategy, roadmaps, timelines
5. **COMMUNICATION** - Stakeholder engagement, reporting

---

## **LEVEL 5: COMPLEXITY** (Stored in prompt.metadata)

1. **BASIC** - Simple Q&A, foundational concepts (400 prompts)
2. **INTERMEDIATE** - Multi-step reasoning, tactical guidance (600 prompts)
3. **ADVANCED** - Complex problem-solving, strategic planning (500 prompts)
4. **EXPERT** - Deep domain expertise, high-stakes decisions (200 prompts)

---

## **NAMING CONVENTION**

### **Suite Level:**
```
SUITE-{SUITE_NAME}
Example: SUITE-FORGE, SUITE-RULES, SUITE-TRIALS
```

### **Sub-Suite Level:**
```
SUBSUITE-{SUITE}-{SUBSUITE_NAME}
Example: SUBSUITE-FORGE-VALIDATE, SUBSUITE-RULES-SUBMIT
```

### **Prompt Level:**
```
PRM-{USE_CASE}-{PHASE}-{TASK_NUMBER}
Example: PRM-CD-002-P1-01, PRM-RA-001-01
```

---

## **METADATA STRUCTURE**

### **Suite Metadata (JSONB):**
```json
{
  "acronym": "FORGE™",
  "full_name": "Foundation Optimization Regulatory Guidelines Engineering",
  "tagline": "Forge Digital Innovation",
  "domain": "Digital Health & DTx",
  "function": "DIGITAL_HEALTH",
  "prompt_count": 140,
  "complexity_levels": ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"],
  "key_areas": [
    "Digital therapeutics (DTx) development",
    "Software as a Medical Device (SaMD) pathways",
    "Digital biomarker validation"
  ],
  "target_roles": [
    "Digital Health Developers",
    "DTx Clinical Teams",
    "SaMD Regulatory Specialists"
  ]
}
```

### **Sub-Suite Metadata (JSONB):**
```json
{
  "acronym": "VALIDATE",
  "full_expansion": "Validation & Assessment & Longitudinal Intelligence & Data & Assurance & Technical Excellence",
  "suite": "FORGE™",
  "key_activities": [
    "Clinical validation",
    "V3 framework",
    "Digital biomarker validation"
  ],
  "complexity_range": ["INTERMEDIATE", "ADVANCED", "EXPERT"]
}
```

### **Prompt Metadata (JSONB):**
```json
{
  "suite": "Digital Biomarker Validation",
  "sub_suite": "Verification (V1)",
  "workflow": "Phase 1: V1 Verification",
  "step_number": "1.1",
  "estimated_time_hours": 3,
  "complexity": "Intermediate",
  "domain": "DIGITAL_HEALTH",
  "function": "CLINICAL",
  "task_type": "ANALYSIS",
  "deliverables": [
    "Intended Use Statement",
    "Context of Use Document"
  ]
}
```

---

## **USE CASE MAPPING**

### **UC_CD_001: DTx Clinical Endpoint Selection**
- **Suite**: FORGE™
- **Sub-Suites Used**: DEVELOP, VALIDATE, REGULATE
- **Phases**: 5 (Foundation → Research → Identification → Validation → Decision)
- **Tasks**: 13
- **Prompts**: 13 (to be seeded)

### **UC_CD_002: Digital Biomarker Validation**
- **Suite**: FORGE™
- **Sub-Suites Used**: VALIDATE
- **Framework**: DiMe V3 (V1 → V2 → V3)
- **Steps**: 9
- **Prompts**: 2 (seeded), 7 (remaining)

---

## **CURRENT STATUS**

### **Seeded:**
✅ 1 Suite (FORGE™)
✅ 2 Prompts for UC_CD_002

### **To Be Seeded:**
⏳ 9 Remaining Suites (RULES™, TRIALS™, GUARD™, VALUE™, BRIDGE™, PROOF™, CRAFT™, SCOUT™, PROJECT™)
⏳ 50+ Sub-Suites across all 10 suites
⏳ 1,538+ Remaining Prompts

---

## **QUERIES FOR VIEWING DATA**

### **View All Suites:**
```sql
SELECT 
    unique_id,
    name,
    metadata->>'acronym' as acronym,
    category,
    (metadata->>'prompt_count')::int as prompt_count,
    position
FROM dh_prompt_suite
ORDER BY position;
```

### **View Sub-Suites for a Suite:**
```sql
SELECT 
    ps.name as suite_name,
    pss.unique_id,
    pss.name as subsuite_name,
    pss.metadata->>'acronym' as acronym,
    pss.position
FROM dh_prompt_subsuite pss
JOIN dh_prompt_suite ps ON pss.suite_id = ps.id
WHERE ps.unique_id = 'SUITE-FORGE'
ORDER BY pss.position;
```

### **View Prompts by Suite:**
```sql
SELECT 
    p.unique_id,
    p.name,
    p.metadata->>'suite' as suite,
    p.metadata->>'sub_suite' as sub_suite,
    p.metadata->>'complexity' as complexity,
    p.pattern
FROM dh_prompt p
WHERE p.metadata->>'suite' LIKE '%FORGE%'
ORDER BY p.unique_id;
```

---

## **NEXT STEPS**

1. ✅ Seed all 10 PROMPTS™ suites
2. ✅ Seed all sub-suites for each suite
3. ✅ Link existing prompts to their suites/sub-suites
4. ✅ Seed remaining prompts for UC_CD_001 and UC_CD_002
5. ✅ Create views/APIs for easy prompt discovery

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Status**: In Progress - Framework Structure Defined

