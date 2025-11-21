# Regulatory Affairs (RA) Use Cases - Seeding Plan

**Generated**: November 3, 2025  
**Domain**: Regulatory Affairs (RA)  
**Total Use Cases**: 10  
**Status**: In Progress

---

## 📋 **Complete RA Use Case List**

| ID | Use Case | Complexity | Duration | Status |
|----|----------|------------|----------|--------|
| UC_RA_001 | FDA Software Classification (SaMD) | INTERMEDIATE | 90 min | ✅ **SEEDED** |
| UC_RA_002 | 510(k) vs De Novo Pathway | ADVANCED | 120 min | ✅ **SEEDED (Part 1)** |
| UC_RA_003 | Predicate Device Identification | ADVANCED | 90 min | 🔄 Ready |
| UC_RA_004 | Pre-Submission Meeting Prep | INTERMEDIATE | 120 min | 🔄 Ready |
| UC_RA_005 | Clinical Evaluation Report (CER) | ADVANCED | 180 min | 🔄 Ready |
| UC_RA_006 | FDA Breakthrough Designation | EXPERT | 120 min | 🔄 Ready |
| UC_RA_007 | International Harmonization | EXPERT | 240 min | 🔄 Ready |
| UC_RA_008 | Cybersecurity Documentation | ADVANCED | 150 min | 🔄 Ready |
| UC_RA_009 | Software Validation Documentation | ADVANCED | 180 min | 🔄 Ready |
| UC_RA_010 | Post-Market Surveillance Planning | INTERMEDIATE | 120 min | 🔄 Ready |

---

## 🎯 **Key Characteristics**

### **Complexity Distribution**
- **INTERMEDIATE**: 3 use cases (RA_001, RA_004, RA_010)
- **ADVANCED**: 5 use cases (RA_002, RA_003, RA_005, RA_008, RA_009)
- **EXPERT**: 2 use cases (RA_006, RA_007)

### **Total Duration**: ~1,410 minutes (~23.5 hours)

### **Pattern Distribution**
- **DECISION_TREE**: RA_001
- **COT_WITH_PRECEDENT**: RA_002, RA_006
- **RAG_WITH_SEARCH**: RA_003
- **STRUCTURED_TEMPLATE**: RA_004, RA_009
- **STRUCTURED_GENERATION**: RA_005
- **MULTI_JURISDICTIONAL**: RA_007
- **CHECKLIST_WITH_TEMPLATES**: RA_008, RA_010

---

## 🤖 **Foundation Entities Used**

### **Most Used Agents**
1. **AGT-REGULATORY-STRATEGY** - Used in 9/10 use cases ⭐
2. **AGT-REGULATORY-INTELLIGENCE** - Used in 8/10 use cases
3. **AGT-REGULATORY-COMPLIANCE** - Used in 7/10 use cases
4. **AGT-WORKFLOW-ORCHESTRATOR** - Used in ALL 10 use cases
5. **AGT-LITERATURE-SEARCH** - Used in 6/10 use cases
6. **AGT-CLINICAL-REPORT-WRITER** - Used in 5/10 use cases
7. **AGT-DOCUMENT-VALIDATOR** - Used in 8/10 use cases

### **Key Personas**
1. **P04_REGDIR** - Regulatory Affairs Director (ALL use cases)
2. **P03_REGDIR** - Senior Regulatory Director (9 use cases)
3. **P05_REGAFF** - Regulatory Affairs Specialist (8 use cases)
4. **P06_DTXCMO** - DTx CMO (5 use cases)
5. **P02_MEDICAL_DIR** - Medical Director (4 use cases)

### **Critical RAG Sources**
1. **RAG-FDA-GUIDANCE** - Referenced in ALL 10 use cases ⭐
2. **RAG-FDA-DIGITAL-HEALTH** - Referenced in 8 use cases
3. **RAG-EMA-GUIDANCE** - Referenced in 3 use cases (EU-specific)
4. **RAG-ICH-GUIDELINES** - Referenced in 5 use cases
5. **RAG-REGULATORY-INTELLIGENCE** - Referenced in 7 use cases

### **Essential Tools**
1. **TOOL-REGULATORY-DB** - Used in 9/10 use cases
2. **TOOL-DOCUMENT-MGMT** - Used in ALL 10 use cases
3. **TOOL-LITERATURE-DB** - Used in 6/10 use cases
4. **TOOL-PROJECT-MGMT** - Used in 5/10 use cases

---

## 📂 **File Naming Convention**

```
26_ra_001_samd_classification_part1.sql      ✅ Created
26_ra_001_samd_classification_part2.sql      ✅ Created
27_ra_002_pathway_determination_part1.sql    ✅ Created
27_ra_002_pathway_determination_part2.sql    🔄 Next
28_ra_003_predicate_identification_part1.sql
28_ra_003_predicate_identification_part2.sql
29_ra_004_presub_meeting_part1.sql
29_ra_004_presub_meeting_part2.sql
30_ra_005_clinical_evaluation_part1.sql
30_ra_005_clinical_evaluation_part2.sql
31_ra_006_breakthrough_designation_part1.sql
31_ra_006_breakthrough_designation_part2.sql
32_ra_007_international_harmonization_part1.sql
32_ra_007_international_harmonization_part2.sql
33_ra_008_cybersecurity_documentation_part1.sql
33_ra_008_cybersecurity_documentation_part2.sql
34_ra_009_software_validation_part1.sql
34_ra_009_software_validation_part2.sql
35_ra_010_post_market_surveillance_part1.sql
35_ra_010_post_market_surveillance_part2.sql
```

**Total Files**: 20 SQL files (2 per use case)

---

## 🔄 **Dependencies**

### **Foundation Dependencies** (All RA use cases require):
- ✅ `00_foundation_agents.sql`
- ✅ `01_foundation_personas.sql`
- ✅ `02_foundation_tools.sql`
- ✅ `03_foundation_rag_sources.sql`
- ✅ `05_foundation_prompts.sql`

### **Use Case Dependencies**:
- **UC_RA_002** depends on **UC_RA_001** (pathway needs classification)
- **UC_RA_003** depends on **UC_RA_002** (predicate search needs pathway)
- **UC_RA_004** depends on **UC_RA_001**, **UC_RA_002** (Pre-Sub needs classification + pathway)
- **UC_RA_005** depends on **UC_CD_010** (CER needs trial data)
- **UC_RA_006** depends on **UC_CD_001**, **UC_RA_002** (Breakthrough needs endpoints + pathway)
- **UC_RA_007** depends on **UC_RA_001-006** (Harmonization synthesizes all)
- **UC_RA_008** depends on **UC_PD_008** (Cybersecurity needs privacy architecture)
- **UC_RA_009** depends on **UC_PD_001**, **UC_PD_009** (Software val needs requirements)
- **UC_RA_010** depends on **UC_RA_002**, **UC_EG_001** (PMSR needs pathway + RWE)

---

## 📊 **Task Count Estimates**

| Use Case | Estimated Tasks | Workflows |
|----------|----------------|-----------|
| UC_RA_001 | 6 tasks | 1 workflow |
| UC_RA_002 | 6 tasks | 1 workflow |
| UC_RA_003 | 5 tasks | 1 workflow |
| UC_RA_004 | 7 tasks | 1 workflow |
| UC_RA_005 | 8 tasks | 1 workflow |
| UC_RA_006 | 6 tasks | 1 workflow |
| UC_RA_007 | 9 tasks | 2 workflows |
| UC_RA_008 | 7 tasks | 1 workflow |
| UC_RA_009 | 8 tasks | 1 workflow |
| UC_RA_010 | 6 tasks | 1 workflow |
| **TOTAL** | **68 tasks** | **11 workflows** |

---

## ✅ **Quality Standards**

All RA use cases will follow these standards:

1. **Schema Compliance**: All `NOT NULL` fields explicitly provided
2. **`ON CONFLICT` Clauses**: All inserts have proper conflict handling
3. **Tenant ID**: All records include `tenant_id` from `session_config`
4. **Task Dependencies**: Logical `BLOCKS` dependencies defined
5. **Agent Assignment Types**: Correct use of `PRIMARY_EXECUTOR`, `CO_EXECUTOR`, `VALIDATOR`
6. **Persona Responsibilities**: Proper use of `APPROVE`, `REVIEW`, `CONSULT`, `VALIDATE`
7. **Review Timing**: Accurate `BEFORE_AGENT_RUNS`, `AFTER_AGENT_RUNS`, `PARALLEL`
8. **RAG Query Context**: Specific, actionable search queries
9. **Tool Configuration**: Proper `connection_config` JSONB
10. **Metadata**: Rich metadata for agent roles, tool purposes, RAG contexts

---

## 🚀 **Execution Plan**

### **Phase 1: Core Regulatory Pathways** (✅ COMPLETE)
- UC_RA_001: FDA SaMD Classification ✅
- UC_RA_002: 510(k) vs De Novo ✅ (Part 1)

### **Phase 2: Predicate & Pre-Market** (🔄 IN PROGRESS)
- UC_RA_002: Part 2
- UC_RA_003: Predicate Identification
- UC_RA_004: Pre-Sub Meeting

### **Phase 3: Clinical & Strategic**
- UC_RA_005: Clinical Evaluation Report
- UC_RA_006: Breakthrough Designation

### **Phase 4: Global & Compliance**
- UC_RA_007: International Harmonization
- UC_RA_008: Cybersecurity Documentation

### **Phase 5: Software & Post-Market**
- UC_RA_009: Software Validation
- UC_RA_010: Post-Market Surveillance

---

## 📝 **Next Steps**

1. ✅ Complete UC_RA_002 Part 2
2. Create UC_RA_003 (Parts 1 & 2)
3. Create UC_RA_004 (Parts 1 & 2)
4. Create UC_RA_005 (Parts 1 & 2)
5. Create UC_RA_006 (Parts 1 & 2)
6. Create UC_RA_007 (Parts 1 & 2)
7. Create UC_RA_008 (Parts 1 & 2)
8. Create UC_RA_009 (Parts 1 & 2)
9. Create UC_RA_010 (Parts 1 & 2)
10. Execute all seed files
11. Verify in database
12. Update frontend to display RA use cases

---

**Estimated Completion Time**: 2-3 hours (all 18 remaining files)  
**Total RA Domain**: 20 SQL files, 68 tasks, 11 workflows

🎯 **Goal**: Complete regulatory affairs workflow automation for digital health products!

