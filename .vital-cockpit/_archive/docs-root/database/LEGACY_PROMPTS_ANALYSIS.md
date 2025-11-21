# LEGACY PROMPTS ANALYSIS - DIGITAL HEALTH RELEVANT

**Analysis Date**: November 3, 2025  
**Total Legacy Prompts Analyzed**: 128 (out of 3,561 total)  
**Focus**: Digital Health, DTx, SaMD, Biomarker, Clinical, Regulatory  

---

## EXECUTIVE SUMMARY

We identified **128 legacy prompts** that are highly relevant to our digital health use cases. These prompts are currently stored in the legacy `prompts` table and need to be:

1. **Migrated** into the PROMPTS™ framework structure (suites/sub-suites)
2. **Linked** to specific tasks, agents, and use cases
3. **Enhanced** with metadata (pattern, model_config, guardrails, etc.)

---

## BREAKDOWN BY DOMAIN

| Domain | Count | % of DH Relevant | Key Focus Areas |
|--------|-------|------------------|-----------------|
| **digital_health** | 7 | 5.5% | Digital biomarker validation (from UC_CD_002) |
| **heor** | 58 | 45.3% | Health economics, HEOR modeling, outcomes research |
| **clinical** | 1 | 0.8% | Clinical trial tracking |
| **regulatory_affairs** | 1 | 0.8% | FDA pre-submission strategy |
| **regulatory** | 1 | 0.8% | Regulatory submissions |
| **general** (DH-relevant) | 60 | 46.9% | FORGE™ framework, DTx, SaMD, biomarkers |

---

## BREAKDOWN BY CATEGORY

### Top 20 Categories

| Rank | Category | Count | Relevance to Digital Health |
|------|----------|-------|----------------------------|
| 1 | **Planning** | 18 | ⭐⭐⭐ DTx strategy, SaMD classification, regulatory pathways |
| 2 | **Health Economics & Outcomes Research** | 23 | ⭐⭐⭐ HEOR modeling, CEA, outcomes analysis |
| 3 | **Health Economics & Outcomes Research; Analysis** | 35 | ⭐⭐⭐ Advanced HEOR analytics |
| 4 | **Planning; Analysis** | 9 | ⭐⭐⭐ Digital biomarker concept, endpoint selection |
| 5 | **Evaluation** | 7 | ⭐⭐⭐ Biomarker verification, DTx validation |
| 6 | **Evaluation; Analysis** | 3 | ⭐⭐⭐ Digital biomarker evaluation |
| 7 | **Communication** | 4 | ⭐⭐ Digital engagement strategies |
| 8 | **Communication; Analysis** | 2 | ⭐⭐ Digital influencer mapping |
| 9 | **Creation** | 2 | ⭐⭐ DTx RCT design, SaMD architecture |
| 10 | **Creation; Analysis** | 1 | ⭐⭐⭐ DTx RCT design |
| 11 | **Evaluation; Creation** | 1 | ⭐⭐ Biomarker review |
| 12 | **general** | 19 | ⭐⭐⭐ FORGE™ framework prompts |
| 13 | **digital_biomarker_validation** | 7 | ⭐⭐⭐ V1/V2/V3 validation framework |
| 14 | **Reimbursement & Access Strategy** | 1 | ⭐⭐ Digital therapeutics coverage |
| 15 | **Reimbursement & Access Strategy; Analysis** | 1 | ⭐⭐ Digital therapeutics value |
| 16 | **Clinical Trial Tracking** | 1 | ⭐ Trial registry monitoring |
| 17 | **regulatory_affairs** | 1 | ⭐⭐⭐ FDA pre-submission |
| 18 | **Regulatory Intelligence** | 1 | ⭐⭐ Regulatory submissions |

---

## KEY PROMPT FAMILIES (By Naming Convention)

### 1. **FORGE™ Framework Prompts** (24 prompts)
*Format*: `forge-[verb]-[topic]-[complexity]`

**Suites**:
- **FORGE_REGULATE**: SaMD classification, 510(k), De Novo, Health Canada, FDA acceptance
- **FORGE_DEVELOP**: Product strategy, architecture, biomarker concept
- **FORGE_VALIDATE**: Endpoint selection, biomarker verification, DTx clinical validation, RCT design, sample size, MCID

**Examples**:
- `forge-regulate-samd-classification-expert`
- `forge-develop-product-strategy-dtx-expert`
- `forge-validate-dtx-endpoint-selection-expert`
- `forge-validate-biomarker-verification-advanced`

---

### 2. **VALUE™ Framework Prompts** (25 prompts)
*Format*: `value-[verb]-heor-[topic]-[complexity]`

**Suite**: VALUE_WORTH (HEOR & Value Demonstration)

**Sub-Suites**:
- HEOR Modeling (Markov, discrete event simulation, multi-state)
- Economic Evaluation (CEA, ICER, QALY)
- Outcomes Research (PRO, utility elicitation, caregiver burden)
- Advanced Analytics (Bayesian synthesis, survival extrapolation, sensitivity)

**Examples**:
- `value-worth-heor-adherence-modeling-advanced`
- `value-worth-heor-bayesian-synthesis-expert`
- `value-worth-heor-claims-analysis-intermediate`

---

### 3. **UC_CD_002 Digital Biomarker Validation** (7 prompts)
*Format*: `PRM-CD-002-[phase]-[step]-[name]`

**Suite**: Digital Biomarker Validation (FORGE™)

**Workflow**: V1 → V2 → V3 → FDA Pre-Sub

| Prompt ID | Name | Complexity | Phase |
|-----------|------|------------|-------|
| `PRM-CD-002-1.1-INTENDED-USE` | Digital Biomarker Intended Use Definition | Intermediate | Planning |
| `PRM-CD-002-2.1-V1-DESIGN` | Verification Study Design (V1) | Advanced | V1 |
| `PRM-CD-002-3.1-V1-EXECUTE` | Execute Verification Study & Analysis | Advanced | V1 |
| `PRM-CD-002-4.1-V2-DESIGN` | Analytical Validation Study Design (V2) | Advanced | V2 |
| `PRM-CD-002-5.1-V2-EXECUTE` | Execute Analytical Validation | Advanced | V2 |
| `PRM-CD-002-6.1-V3-DESIGN` | Clinical Validation Study Design (V3) | Expert | V3 |
| `PRM-CD-002-7.1-V3-EXECUTE` | Execute Clinical Validation & MCID | Expert | V3 |
| `PRM-CD-002-8.1-FDA-PRESUB` | Regulatory Strategy & FDA Pre-Submission | Expert | Regulatory |

---

### 4. **PROOF™ Framework Prompts** (2 prompts)
*Format*: `proof-[verb]-[topic]-[complexity]`

**Suite**: PROOF_MEASURE (Evidence & Measurement)

**Examples**:
- `proof-measure-digital-biomarker-expert`
- `proof-measure-digital-phenotyping-advanced`

---

### 5. **BRIDGE™ Framework Prompts** (4 prompts)
*Format*: `bridge-[verb]-digital-engagement-[complexity]`

**Suite**: BRIDGE_INFLUENCE (Communication & Stakeholder Engagement)

**Examples**:
- `bridge-influence-digital-engagement-basic`
- `bridge-influence-digital-engagement-intermediate`
- `bridge-influence-digital-engagement-advanced`
- `bridge-influence-digital-engagement-expert`

---

### 6. **CRAFT™ Framework Prompts** (1 prompt)
*Format*: `craft-[verb]-[topic]-[complexity]`

**Suite**: CRAFT_WRITE (Medical Writing & Documentation)

**Examples**:
- `craft-write-biomarker-review-advanced`

---

### 7. **PROJECT™ Framework Prompts** (1 prompt)
*Format*: `project-[verb]-[topic]-[complexity]`

**Suite**: PROJECT_LAUNCH (Program Management)

**Examples**:
- `project-launch-digital-engagement-advanced`

---

### 8. **SCOUT™ Framework Prompts** (2 prompts)
*Format*: `scout-[verb]-[topic]-[complexity]`

**Suite**: SCOUT_ASSESS (Intelligence & Monitoring)

**Examples**:
- `scout-monitor-trial-registry-basic`
- `scout-monitor-regulatory-submission-basic`

---

### 9. **Generic Digital Health Prompts** (60 prompts)
*Format*: Various (no consistent naming)

**Topics**:
- Digital engagement (8 prompts)
- Digital biomarker concept (4 prompts)
- Digital endpoint (4 prompts)
- Digital therapeutics (4 prompts)
- SaMD architecture (4 prompts)
- SaMD classification (4 prompts)
- DTx RCT design (4 prompts)
- DTx endpoint selection (4 prompts)
- Sample size calculation (4 prompts)
- Regulatory strategy (8 prompts)
- Biomarker verification/validation (8 prompts)

---

## MIGRATION STRATEGY

### Phase 1: Map to PROMPTS™ Suites

| Legacy Suite/Prefix | PROMPTS™ Suite | PROMPTS™ Sub-Suite | Priority |
|---------------------|----------------|-------------------|----------|
| `forge-regulate-*` | FORGE™ | Regulatory Pathways | 🔴 HIGH |
| `forge-develop-*` | FORGE™ | Product Development | 🔴 HIGH |
| `forge-validate-*` | FORGE™ | Clinical Validation | 🔴 HIGH |
| `value-worth-heor-*` | VALUE™ | HEOR & Outcomes | 🟡 MEDIUM |
| `proof-measure-*` | PROOF™ | Evidence & Measurement | 🟡 MEDIUM |
| `bridge-influence-*` | BRIDGE™ | Stakeholder Engagement | 🟢 LOW |
| `craft-write-*` | CRAFT™ | Medical Writing | 🟢 LOW |
| `project-launch-*` | PROJECT™ | Program Management | 🟢 LOW |
| `scout-monitor-*` | SCOUT™ | Intelligence & Monitoring | 🟢 LOW |
| `PRM-CD-002-*` | FORGE™ | Digital Biomarker Validation | 🔴 HIGH |
| Generic DH prompts | (Various) | (Various) | 🟡 MEDIUM |

---

### Phase 2: Link to Use Cases & Tasks

**Target**: 50 Use Cases (CD, RA, MA, etc.)

**Relationship Mappings Required**:

1. **Prompt → Task** (`dh_prompt.task_id` FK)
   - Each prompt must be linked to a specific task within a workflow
   
2. **Task → Agent** (`dh_task_agent` join table)
   - Each task must have assigned agents (primary, reviewer, approver)
   
3. **Prompt → Agent** (implicit via `dh_prompt.owner` or direct mapping)
   - Each prompt should specify which agent(s) can use it
   
4. **Task → Tool** (`dh_task_tool` join table)
   - Each task specifies required tools
   
5. **Task → RAG** (`dh_task_rag` join table)
   - Each task specifies required RAG sources

---

### Phase 3: Enhance Metadata

**Required Enhancements for Migration**:

1. **`pattern`**: Add correct pattern type (CoT, Few-Shot, ReAct, etc.)
2. **`system_prompt`**: Extract/create system instructions
3. **`user_template`**: Extract/create user input template
4. **`model_config`**: Add model settings (claude-3-5-sonnet, temperature, etc.)
5. **`metadata.suite`**: Map to PROMPTS™ suite
6. **`metadata.sub_suite`**: Map to PROMPTS™ sub-suite
7. **`metadata.workflow`**: Link to use case workflow
8. **`unique_id`**: Generate consistent unique IDs (e.g., `PRM-SUITE-SUBSUITE-001`)

---

## RECOMMENDED PROMPTS FOR IMMEDIATE MIGRATION

### TOP 20 HIGH-PRIORITY PROMPTS

| Rank | Prompt Name | Use Cases | Priority | Reason |
|------|-------------|-----------|----------|--------|
| 1 | `forge-regulate-samd-classification-expert` | UC_RA_001 | 🔴 CRITICAL | Core regulatory prompt |
| 2 | `forge-validate-dtx-endpoint-selection-expert` | UC_CD_001 | 🔴 CRITICAL | Core validation prompt |
| 3 | `forge-validate-biomarker-verification-advanced` | UC_CD_002 | 🔴 CRITICAL | V1 validation |
| 4 | `forge-validate-dtx-clinical-validation-expert` | UC_CD_002 | 🔴 CRITICAL | V3 validation |
| 5 | `forge-develop-product-strategy-dtx-expert` | Multiple | 🔴 HIGH | Product planning |
| 6 | `forge-validate-dtx-rct-design-expert` | UC_CD_003 | 🔴 HIGH | RCT design |
| 7 | `forge-validate-sample-size-dtx-advanced` | UC_CD_007 | 🔴 HIGH | Sample size calc |
| 8 | `forge-validate-digital-endpoint-mcid-advanced` | UC_CD_002 | 🔴 HIGH | MCID determination |
| 9 | `forge-regulate-de-novo-strategy-dtx-expert` | UC_RA_003 | 🔴 HIGH | De Novo pathway |
| 10 | `forge-regulate-510k-strategy-samd-advanced` | UC_RA_004 | 🔴 HIGH | 510(k) pathway |
| 11 | `forge-regulate-digital-endpoint-fda-acceptance-expert` | UC_CD_001, UC_RA_002 | 🔴 HIGH | FDA acceptance |
| 12 | `forge-develop-digital-biomarker-concept-advanced` | UC_CD_002 | 🟡 MEDIUM | Concept development |
| 13 | `proof-measure-digital-biomarker-expert` | UC_CD_002 | 🟡 MEDIUM | Biomarker evidence |
| 14 | `value-worth-heor-adherence-modeling-advanced` | UC_MA_001-010 | 🟡 MEDIUM | HEOR modeling |
| 15 | `value-worth-heor-cea-development-intermediate` | UC_MA_001-010 | 🟡 MEDIUM | CEA development |
| 16 | `value-coverage-digital-therapeutics-advanced` | UC_MA_001-010 | 🟡 MEDIUM | DTx value/coverage |
| 17 | `craft-write-biomarker-review-advanced` | UC_CD_002 | 🟢 LOW | Literature review |
| 18 | `bridge-influence-digital-engagement-advanced` | Multiple | 🟢 LOW | Stakeholder engagement |
| 19 | `project-launch-digital-engagement-advanced` | Multiple | 🟢 LOW | Project management |
| 20 | `scout-monitor-trial-registry-basic` | UC_CD_003-010 | 🟢 LOW | Trial intelligence |

---

## NEXT STEPS

### Immediate Actions (Today)

1. ✅ **Analyze legacy prompts** (COMPLETED)
2. ⏳ **Create migration SQL script** (IN PROGRESS)
3. ⏳ **Seed prompts for remaining 50 use cases** (PENDING)
4. ⏳ **Verify all relationships** (PENDING)

### SQL Files to Create

1. `LEGACY_PROMPTS_MIGRATION_SUITES.sql` - Create/update suites for legacy prompts
2. `LEGACY_PROMPTS_MIGRATION_PROMPTS.sql` - Migrate 128 prompts to `dh_prompt`
3. `USECASE_PROMPTS_SEED_ALL.sql` - Seed prompts for all 50 use cases
4. `VERIFY_RELATIONSHIPS.sql` - Verification queries for all relationships

---

## STATISTICS SUMMARY

| Metric | Count |
|--------|-------|
| **Total Legacy Prompts** | 3,561 |
| **Digital Health Relevant** | 128 (3.6%) |
| **FORGE™ Framework** | 24 (18.8%) |
| **VALUE™ Framework** | 25 (19.5%) |
| **UC_CD_002 Prompts** | 7 (5.5%) |
| **HEOR Prompts** | 58 (45.3%) |
| **Regulatory Prompts** | 15 (11.7%) |
| **High Priority** | 48 (37.5%) |
| **Medium Priority** | 50 (39.1%) |
| **Low Priority** | 30 (23.4%) |

---

**END OF ANALYSIS**

