# Medical Affairs - Quick Reference Card

> 30 Agents | 7 Departments | 3 Tiers
> Last Updated: October 6, 2025

---

## 📋 Agent Directory (30 Agents)

### TIER 1: Ultra-Specialists (11 agents)

| Code | Agent | Department | Focus |
|------|-------|------------|-------|
| MA-001 | Medical Science Liaison Advisor | Field Medical | KOL engagement |
| MA-005 | Medical Information Specialist | Medical Information | Medical inquiries |
| MA-008 | Publication Strategy Lead | Med Comms & Writing | Publications |
| MA-009 | Medical Education Director | Med Comms & Writing | CME programs |
| MA-010 | Medical Writer - Scientific | Med Comms & Writing | Manuscripts |
| MA-011 | Medical Writer - Regulatory | Med Comms & Writing | CSRs, protocols |
| MA-015 | Real-World Evidence Specialist | Evidence & HEOR | RWE studies |
| MA-016 | Health Economics Specialist | Evidence & HEOR | Economic models |
| MA-017 | Biostatistician | Evidence & HEOR | Statistical analysis |
| MA-020 | Clinical Study Liaison | Clinical Ops | Investigator relations |
| MA-021 | Medical Monitor | Clinical Ops | Safety oversight |

### TIER 2: Specialists (13 agents)

| Code | Agent | Department | Focus |
|------|-------|------------|-------|
| MA-002 | Regional Medical Director | Field Medical | Regional strategy |
| MA-003 | Therapeutic Area MSL Lead | Field Medical | TA expertise |
| MA-006 | Medical Librarian | Medical Information | Literature surveillance |
| MA-007 | Medical Content Manager | Medical Information | Content governance |
| MA-012 | Medical Communications Manager | Med Comms & Writing | Comms strategy |
| MA-013 | Medical Editor | Med Comms & Writing | Editorial review |
| MA-018 | Epidemiologist | Evidence & HEOR | Disease epidemiology |
| MA-019 | Outcomes Research Manager | Evidence & HEOR | PRO studies |
| MA-022 | Clinical Data Manager | Clinical Ops | Data quality |
| MA-024 | Medical Excellence Director | Excellence & Governance | Best practices |
| MA-025 | Medical Review Committee Coordinator | Excellence & Governance | Review processes |
| MA-027 | Medical Affairs Strategist | Strategy & Operations | Strategic planning |
| MA-028 | Therapeutic Area Expert | Strategy & Operations | TA leadership |

### TIER 3: Generalists (6 agents)

| Code | Agent | Department | Focus |
|------|-------|------------|-------|
| MA-004 | Field Medical Trainer | Field Medical | MSL training |
| MA-014 | Congress & Events Manager | Med Comms & Writing | Event planning |
| MA-023 | Clinical Trial Disclosure Manager | Clinical Ops | Transparency |
| MA-026 | Medical Quality Assurance Manager | Excellence & Governance | Quality systems |
| MA-029 | Global Medical Advisor | Strategy & Operations | Global coordination |
| MA-030 | Medical Affairs Operations Manager | Strategy & Operations | Operations |

---

## 🏢 Department Structure

### 1. Field Medical (4 agents)
- **Tier 1**: Medical Science Liaison Advisor
- **Tier 2**: Regional Medical Director, TA MSL Lead
- **Tier 3**: Field Medical Trainer

### 2. Medical Information (3 agents)
- **Tier 1**: Medical Information Specialist
- **Tier 2**: Medical Librarian, Medical Content Manager

### 3. Medical Communications & Writing (7 agents)
- **Tier 1**: Publication Lead, Education Director, 2x Writers
- **Tier 2**: Comms Manager, Medical Editor
- **Tier 3**: Congress Manager

### 4. Evidence Generation & HEOR (5 agents)
- **Tier 1**: RWE Specialist, HEOR Specialist, Biostatistician
- **Tier 2**: Epidemiologist, Outcomes Manager

### 5. Clinical Operations Support (4 agents)
- **Tier 1**: Clinical Liaison, Medical Monitor
- **Tier 2**: Data Manager
- **Tier 3**: Disclosure Manager

### 6. Medical Excellence & Governance (3 agents)
- **Tier 2**: Excellence Director, Committee Coordinator
- **Tier 3**: QA Manager

### 7. Medical Strategy & Operations (4 agents)
- **Tier 2**: MA Strategist, TA Expert
- **Tier 3**: Global Advisor, Operations Manager

---

## 🎯 When to Use Which Agent

### For KOL Engagement
→ MA-001: Medical Science Liaison Advisor

### For Medical Inquiries
→ MA-005: Medical Information Specialist

### For Publications
→ MA-008: Publication Strategy Lead
→ MA-010: Medical Writer - Scientific

### For Regulatory Documents
→ MA-011: Medical Writer - Regulatory

### For Medical Education
→ MA-009: Medical Education Director

### For Real-World Evidence
→ MA-015: RWE Specialist
→ MA-016: Health Economics Specialist

### For Clinical Trials
→ MA-020: Clinical Study Liaison
→ MA-021: Medical Monitor

### For Data & Statistics
→ MA-017: Biostatistician
→ MA-022: Clinical Data Manager

### For Strategy
→ MA-027: Medical Affairs Strategist
→ MA-028: Therapeutic Area Expert

### For Operations
→ MA-030: Medical Affairs Operations Manager

---

## 🔧 Model Assignments

| Model | Tier | Count | Use Case |
|-------|------|-------|----------|
| **gpt-4-turbo-preview** | T1 | 11 | High accuracy, strategic |
| **gpt-4o** | T2 | 13 | Advanced reasoning, specialist |
| **claude-3-opus** | T3 | 6 | Operational, coordination |

---

## 📊 Quick Stats

- **Total Agents**: 36 (30 new + 6 legacy)
- **Total Departments**: 7
- **Total Roles**: 28
- **Tier 1**: 11 agents (31%)
- **Tier 2**: 13 agents (36%)
- **Tier 3**: 12 agents (33%)

---

## 🚀 Access Information

**Database**: Supabase
**Business Function**: Medical Affairs
**Function ID**: 5942a717-4363-4cec-b9b7-db644617e91c

**Query Example**:
```sql
SELECT * FROM agents
WHERE business_function = 'Medical Affairs'
ORDER BY tier, name;
```

---

## 📁 Documentation

- **Complete Summary**: `MEDICAL_AFFAIRS_COMPLETE_IMPORT_SUMMARY.md`
- **Agent Spec**: `MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json`
- **Org Structure**: `MEDICAL_AFFAIRS_EXPANDED_STRUCTURE_30.md`
- **Import Script**: `scripts/import-medical-affairs-complete.js`

---

**Version**: 1.0 | **Status**: Production Ready | **Updated**: Oct 6, 2025
