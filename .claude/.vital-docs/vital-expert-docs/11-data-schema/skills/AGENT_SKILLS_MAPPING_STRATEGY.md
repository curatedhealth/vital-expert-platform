# Agent-to-Skills Mapping Complete Strategy

**Date**: November 22, 2025  
**Status**: ✅ Ready for Execution  
**Total Mappings**: ~580+ mappings for 165 agents

---

## 📊 **Mapping Strategy Overview**

### **Skill Assignment by Agent Level**

| Level | Agent Count | Skills per Agent | Total Mappings | Strategy |
|-------|-------------|------------------|----------------|----------|
| **Level 1 (Masters)** | 9 | 5-7 strategic | ~60 | Leadership + Domain-specific |
| **Level 2 (Experts)** | 45 | 5-8 domain | ~270 | Scientific Core + Specialization |
| **Level 3 (Specialists)** | 43 | 3-5 specialized | ~170 | Operational + Focus Area |
| **Level 4 (Workers)** | 18 | 1-2 task | ~30 | Task-specific skills |
| **Level 5 (Tools)** | 50 | 1 atomic | ~50 | Single atomic skill |
| **TOTAL** | **165** | **~3.5 avg** | **~580** | |

---

## 🎯 **Skill Categories by Agent Level**

### **Level 1: Master Agents (Strategic Leadership)**

**Core Skills (All Masters)**:
- Strategic Thinking
- Team Leadership
- People Management
- Decision Making
- Vision Setting
- Project Management
- Change Management

**Department-Specific Skills**:
- **Clinical Operations**: Clinical Research, Protocol Development, Medical Monitoring
- **Field Medical**: MSL Operations, KOL Management, Scientific Exchange
- **HEOR**: Health Economics, Real-World Evidence, Biostatistics
- **Medical Education**: Scientific Communication, Field Force Training
- **Compliance**: Regulatory Compliance, Quality Assurance, SOPs & Governance
- **Medical Information**: Medical Information Management, Literature Review
- **Publications**: Publication Planning, Scientific Writing
- **Scientific Communications**: Scientific Communication, Medical Writing
- **Medical Leadership**: Business Acumen, Stakeholder Management

---

### **Level 2: Expert Agents (Domain Expertise)**

**Core Skills (All Experts)**:
- Clinical Research Knowledge
- Medical Literature Review
- Scientific Writing
- Evidence Synthesis

**Department-Specific Skills**:
- **Field Medical**: KOL Management, Scientific Exchange, MSL Operations, Insights Generation, Relationship Building
- **Clinical Operations**: Clinical Protocol Development, Medical Monitoring, Clinical Data Analysis, Regulatory Compliance
- **HEOR**: Health Economics, Real-World Evidence, Biostatistics, Data Analysis
- **Medical Education**: Field Force Training, Presentation Skills, Scientific Communication, Mentoring
- **Compliance**: Regulatory Compliance, Quality Assurance, SOPs & Governance, Risk Management, Audit Readiness
- **Medical Information**: Medical Information Management, Medical Information Systems, Medical Writing
- **Publications**: Publication Planning, Scientific Writing, Medical Writing, Project Management
- **Scientific Communications**: Scientific Communication, Medical Writing, Presentation Skills, Congress Management
- **Medical Leadership**: Strategic Thinking, Team Leadership, Business Acumen, Decision Making, Stakeholder Management

---

### **Level 3: Specialist Agents (Specialized Execution)**

**Core Skills (All Specialists)**:
- Collaboration
- Problem Solving
- Project Management
- Critical Thinking

**Department-Specific Skills**:
- **Field Medical**: Scientific Exchange, Relationship Building, Scientific Communication
- **Clinical Operations**: Clinical Data Analysis, Medical Monitoring, Clinical Research Knowledge
- **HEOR**: Data Analysis, Evidence Synthesis, Research Skills
- **Medical Education**: Presentation Skills, Scientific Communication, Medical Writing
- **Compliance**: Quality Assurance, Regulatory Compliance, SOPs & Governance
- **Medical Information**: Medical Literature Review, Medical Information Management, Medical Writing
- **Publications**: Scientific Writing, Medical Writing, Medical Literature Review
- **Scientific Communications**: Medical Writing, Scientific Communication, Presentation Skills

---

### **Level 4: Worker Agents (Task-Specific)**

**One Primary Skill per Worker**:
- Action Item Tracker → Project Management
- Adverse Event Detector → Pharmacovigilance
- Citation Formatter → Medical Writing
- Compliance Checker → Regulatory Compliance
- Data Extraction → Data Analysis
- Document Archiver → Database Management
- Email Drafter → Technical Writing
- Literature Search → Medical Literature Review
- Meeting Notes Compiler → Technical Writing
- Metadata Tagger → Medical Information Systems
- Off-Label Use Monitor → Regulatory Compliance
- PDF Generator → Microsoft Office Suite
- Quality Reviewer → Quality Assurance
- Report Compiler → Data Analysis
- Slide Builder → Presentation Skills
- Summary Generator → Scientific Writing
- Translation Worker → Cross-cultural Communication
- Version Controller → SOPs & Governance

---

### **Level 5: Tool Agents (Atomic Skills)**

**One Atomic Skill per Tool**:
- **Text Processing** (13 tools): Medical Writing, Data Analysis, Microsoft Office Suite
- **Data Tools** (15 tools): Data Analysis, Microsoft Office Suite, Database Management
- **Search Tools** (8 tools): Medical Literature Review, Clinical Research Knowledge, Research Skills
- **NLP Tools** (4 tools): Data Analysis, Medical Writing
- **Compliance Tools** (2 tools): Regulatory Compliance
- **File Tools** (8 tools): Microsoft Office Suite, Presentation Skills

---

## 📋 **Execution Instructions**

### **Step 1: Verify Skills Are Seeded**

First confirm total skills count:

📁 Run: [quick_skills_count.sql](file:///Users/hichamnaim/Downloads/Cursor/VITAL%20path/.vital-command-center/04-TECHNICAL/data-schema/diagnostics/quick_skills_count.sql)

**Expected**: 156+ skills total

---

### **Step 2: Run Agent-Skills Mapping**

📁 **Execute:** [seed_agent_skills_mappings_complete.sql](file:///Users/hichamnaim/Downloads/Cursor/VITAL%20path/.vital-command-center/04-TECHNICAL/data-schema/seeds/seed_agent_skills_mappings_complete.sql)

**Expected Output**:
```
=================================================================
✅ AGENT-SKILL MAPPINGS COMPLETED
=================================================================

📊 Total Mappings Created: ~580

📋 Agents Mapped by Level:
  ├─ Level 1 (Masters): 9 agents mapped
  ├─ Level 2 (Experts): 45 agents mapped
  ├─ Level 3 (Specialists): 43 agents mapped
  ├─ Level 4 (Workers): 18 agents mapped
  └─ Level 5 (Tools): 50 agents mapped

📈 Skills per Agent Level:
  ├─ Master: 9 agents, avg 6.5 skills/agent
  ├─ Expert: 45 agents, avg 6.0 skills/agent
  ├─ Specialist: 43 agents, avg 4.0 skills/agent
  ├─ Worker: 18 agents, avg 1.7 skills/agent
  └─ Tool: 50 agents, avg 1.0 skills/agent
```

---

### **Step 3: Verify Mappings**

Run final verification:

```sql
-- Check mappings by level
SELECT 
    al.name as agent_level,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT CASE WHEN as2.agent_id IS NOT NULL THEN a.id END) as agents_with_skills,
    ROUND(AVG(skill_counts.skill_count), 1) as avg_skills_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_skills as2 ON a.id = as2.agent_id
LEFT JOIN (
    SELECT agent_id, COUNT(*) as skill_count
    FROM agent_skills
    GROUP BY agent_id
) skill_counts ON a.id = skill_counts.agent_id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Check top skills mapped
SELECT 
    s.name as skill_name,
    s.category,
    COUNT(as2.agent_id) as mapped_to_agents
FROM skills s
JOIN agent_skills as2 ON s.id = as2.skill_id
GROUP BY s.id, s.name, s.category
ORDER BY mapped_to_agents DESC
LIMIT 20;
```

---

## ✅ **Completion Checklist**

- [x] Created comprehensive skills library (156+ skills)
- [x] Created agent-to-skill mapping strategy
- [x] Created mapping seed file for 165 agents
- [ ] Execute seed file in Supabase
- [ ] Verify ~580 mappings created
- [ ] Confirm all 165 agents have skills
- [ ] Complete TODO #6

---

## 🚀 **Next Steps After Mapping**

1. ✅ **Skills mapped** (~580 mappings)
2. 🔜 **Update system prompts** (add documentation references)
3. 🔜 **Complete backend integration**
4. 🔜 **Test agent skill queries**

---

**Status**: Ready for execution! 🎯

