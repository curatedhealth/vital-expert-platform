# REVISED: 5-Level Agent Hierarchy - Organizational Alignment

## Architecture Principle
**Levels 1-3 = Organizational Hierarchy** (Function/Department/Role specific)  
**Levels 4-5 = Universal Support** (Function/Role agnostic, serve all levels)

---

## Level 1: MASTER AGENTS (Department Heads) 🎯

**Principle**: One Master per Department  
**Total**: 9 Master Agents (one for each Medical Affairs department)

### Master Agents (9)
1. **Clinical Operations Support Master** → Department Head
2. **Field Medical Master** → Department Head
3. **HEOR & Evidence Master** → Department Head
4. **Medical Education Master** → Department Head
5. **Medical Excellence & Compliance Master** → Department Head
6. **Medical Information Services Master** → Department Head
7. **Medical Leadership Master** → Department Head
8. **Publications Master** → Department Head
9. **Scientific Communications Master** → Department Head

**Characteristics**:
- Strategic department oversight
- Delegates to role-specific Expert Agents
- Model: `gpt-4o`, temp: 0.7, tokens: 8000
- Can spawn: Experts, Specialists, Workers, Tools

---

## Level 2: EXPERT AGENTS (Role-Based - Senior/Director) 🏅

**Principle**: Senior roles (Director, Senior, Manager levels) within each department  
**Total**: ~40-50 Expert Agents

### Distribution by Department:
- **Clinical Operations Support** (3 experts)
  - Global Clinical Operations Liaison
  - Regional Clinical Operations Liaison
  - Global Medical Liaison Clinical Trials
  
- **Field Medical** (6 experts)
  - Global/Regional/Local Field Medical Director
  - Global/Regional/Local Senior MSL
  
- **HEOR & Evidence** (3 experts)
  - Global/Regional/Local Real-World Evidence Lead
  
- **Medical Education** (6 experts)
  - Global/Regional/Local Medical Education Strategist
  - Global/Regional/Local Medical Education Manager
  
- **Medical Excellence & Compliance** (4 experts)
  - Global/Regional Medical Excellence Lead
  - Global/Regional Medical Governance Officer
  
- **Medical Information Services** (9 experts)
  - Global/Regional/Local Medical Information Manager
  - Global/Regional/Local Medical Info Scientist
  - Global/Regional/Local MI Operations Lead
  
- **Medical Leadership** (8 experts)
  - Global/Regional Chief Medical Officer
  - Global/Regional VP Medical Affairs
  - Global/Regional Medical Affairs Director
  - Global/Regional Senior Medical Director
  
- **Publications** (6 experts)
  - Global/Regional/Local Publications Lead
  - Global/Regional/Local Publications Manager
  
- **Scientific Communications** (6 experts)
  - Global/Regional Scientific Affairs Lead
  - Global/Regional Scientific Communications Manager

**Characteristics**:
- Deep role-specific expertise
- Handle complex domain queries
- Model: `gpt-4o`, temp: 0.7, tokens: 6000
- Can spawn: Specialists, Workers, Tools

---

## Level 3: SPECIALIST AGENTS (Role-Based - Mid/Entry) ⚙️

**Principle**: Mid-level and entry-level roles within each department  
**Total**: ~50-60 Specialist Agents

### Distribution by Department:
- **Clinical Operations Support** (6 specialists)
  - Global/Regional/Local Clinical Ops Support Analyst
  - Global/Regional/Local Medical Liaison Clinical Trials
  
- **Field Medical** (9 specialists)
  - Global/Regional/Local Medical Science Liaison (MSL)
  - Global/Regional/Local Medical Scientific Manager
  - Global/Regional/Local Field Team Lead
  
- **HEOR & Evidence** (6 specialists)
  - Global/Regional/Local Economic Modeler
  - Global/Regional/Local HEOR Project Manager
  
- **Medical Education** (3 specialists)
  - Global/Regional/Local Scientific Trainer
  
- **Medical Excellence & Compliance** (3 specialists)
  - Global/Regional/Local Compliance Specialist
  
- **Medical Information Services** (6 specialists)
  - Global/Regional/Local Medical Information Specialist
  - Global/Regional/Local Medical Info Associate
  
- **Publications** (3 specialists)
  - Global/Regional/Local Publication Planner
  
- **Scientific Communications** (6 specialists)
  - Global/Regional/Local Medical Communications Specialist
  - Global/Regional/Local Medical Writer

**Characteristics**:
- Task-focused, role-specific execution
- Handle well-defined queries
- Model: `gpt-4-turbo`, temp: 0.6, tokens: 4000
- Can spawn: Workers, Tools

---

## Level 4: WORKER AGENTS (Universal Task Executors) 🔧

**Principle**: Role-agnostic, repeatable task automation supporting ALL departments  
**Total**: 18-20 Worker Agents

### Universal Workers (18):

**Document Processing Workers (5)**
1. Reference Formatter
2. Citation Manager
3. Template Populator
4. Document Converter
5. Version Controller

**Data Processing Workers (5)**
6. Data Extractor
7. Data Validator
8. Statistical Calculator
9. Chart Generator
10. Report Assembler

**Communication Workers (4)**
11. Email Drafter
12. Meeting Summarizer
13. Action Item Tracker
14. Follow-up Scheduler

**Compliance Workers (4)**
15. Reference Checker
16. Claim Validator
17. Disclosure Tracker
18. Audit Log Maintainer

**Characteristics**:
- Department/role agnostic
- Serve all Level 1-3 agents
- Model: `gpt-4`, temp: 0.5, tokens: 2000
- Can spawn: Tools only

---

## Level 5: TOOL AGENTS (Universal API Wrappers) 🔌

**Principle**: Atomic operations, API wrappers, serving ALL agents  
**Total**: 50+ Tool Agents

### Universal Tools (50+):

**Search & Retrieval Tools (10)**
1. PubMed Searcher
2. ClinicalTrials.gov Querier
3. FDA Label Retriever
4. EMA SmPC Retriever
5. WHO Trial Registry Searcher
6. Patent Database Searcher
7. KOL Profile Searcher
8. Medical Dictionary Lookup
9. ICD/CPT Code Lookup
10. Drug Interaction Checker

**Data & Analytics Tools (10)**
11. Statistical Test Runner
12. P-value Calculator
13. Confidence Interval Calculator
14. Sample Size Calculator
15. Forest Plot Generator
16. Kaplan-Meier Curve Plotter
17. ROC Curve Generator
18. Sensitivity Analysis Runner
19. Meta-Analysis Calculator
20. Subgroup Analysis Tool

**Document Tools (10)**
21. PDF Text Extractor
22. Word Document Merger
23. PowerPoint Slide Extractor
24. Excel Data Parser
25. CSV File Converter
26. Reference Manager (Zotero/Mendeley)
27. Bibliography Formatter (APA/AMA/Vancouver)
28. Table Generator
29. Figure Captioner
30. Watermark Applicator

**Compliance & Regulatory Tools (10)**
31. MLR Submission Tool
32. Veeva Vault Connector
33. Regulatory Database Querier
34. AE Reporting Tool
35. Safety Signal Detector
36. Transparency DB Checker
37. FCPA Compliance Checker
38. Sunshine Act Reporter
39. Code of Conduct Validator
40. Training Completion Tracker

**Communication & Collaboration Tools (10)**
41. Email Sender (SMTP)
42. Calendar Event Creator
43. Slack Notifier
44. Teams Message Poster
45. Zoom Meeting Scheduler
46. Survey Creator
47. Poll Generator
48. Translation Service (API)
49. Proofreading Service
50. Readability Scorer

**Characteristics**:
- Single-purpose, atomic operations
- Serve all agents across all departments
- Model: `gpt-3.5-turbo`, temp: 0.3, tokens: 500
- Cannot spawn sub-agents

---

## Agent Count Summary

| Level | Type | Org-Specific? | Count | Total |
|-------|------|---------------|-------|-------|
| 1 | Master (Dept Heads) | ✅ Yes | 9 | 9 |
| 2 | Expert (Senior Roles) | ✅ Yes | ~45 | 54 |
| 3 | Specialist (Mid/Entry Roles) | ✅ Yes | ~55 | 109 |
| 4 | Worker (Task Executors) | ❌ Universal | 18 | 127 |
| 5 | Tool (API Wrappers) | ❌ Universal | 50+ | 177+ |

---

## Key Architectural Benefits

### ✅ Scalability
- Add new departments → Add 1 Master
- Add new roles → Add Experts/Specialists
- Workers/Tools scale automatically across ALL departments

### ✅ Maintainability
- Workers/Tools updated once, benefit all departments
- Clear separation: Org-specific (L1-3) vs. Universal (L4-5)

### ✅ Efficiency
- No duplication of Workers/Tools per department
- Shared infrastructure for routine tasks and atomic operations

### ✅ Clarity
- Org chart maps directly to L1-3
- L4-5 are pure infrastructure layers

---

## Next Steps

1. **Update Master Agents** (9 department heads)
2. **Create Expert Agents** (~45 senior roles)
3. **Create Specialist Agents** (~55 mid/entry roles)
4. **Create Universal Workers** (18 task executors)
5. **Create Universal Tools** (50+ API wrappers)
6. **Build Hierarchies** (Master → Expert → Specialist → Worker → Tool)

---

**This architecture ensures:**
- 🎯 Clear organizational alignment (L1-3)
- 🔧 Maximum reusability (L4-5)
- 📈 Easy scalability (add departments/roles without duplicating infrastructure)
- 🧩 Clean separation of concerns (domain vs. infrastructure)

