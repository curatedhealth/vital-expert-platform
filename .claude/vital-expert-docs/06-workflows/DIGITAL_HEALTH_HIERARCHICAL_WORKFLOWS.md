# Digital Health Hierarchical Workflows

## 🏥 Overview

This guide explains how to structure digital health workflows using the **Process → Activity → Task → Step** hierarchy, enabling better organization, navigation, and execution of complex clinical, regulatory, and medical affairs workflows.

## 📊 Hierarchy Mapping for Digital Health

### Level 1: PROCESS (Use Case)
**Represents**: Complete end-to-end clinical or regulatory use case
- **Example**: UC_CD_001 - DTx Clinical Endpoint Selection & Validation
- **Scope**: Entire workflow from initiation to completion
- **Duration**: Days to weeks
- **Stakeholders**: Cross-functional teams (Clinical, Regulatory, Medical Affairs)

### Level 2: ACTIVITY (Phase/Workstream)
**Represents**: Major phases or workstreams within a use case
- **Example**: "Phase 2: Research" or "Regulatory Precedent Analysis Workstream"
- **Scope**: Logically grouped set of related tasks
- **Duration**: Hours to days
- **Stakeholders**: Specific functional teams

### Level 3: TASK (Deliverable)
**Represents**: Specific deliverables with clear outputs
- **Example**: T2.1 - Research DTx Regulatory Precedent
- **Scope**: Single deliverable with defined inputs/outputs
- **Duration**: 30 minutes to 4 hours
- **Stakeholders**: Individual roles or small teams
- **Mapped from**: JSON workflow "tasks" array

### Level 4: STEP (Action)
**Represents**: Granular execution steps within a task
- **Example**: "Search FDA De Novo Database" → "Analyze Results" → "Extract Endpoints"
- **Scope**: Individual actions or micro-tasks
- **Duration**: 5-30 minutes
- **Stakeholders**: Individual contributors

---

## 🎯 Example: UC_CD_001 - DTx Endpoint Selection

### Original JSON Structure
```json
{
  "use_case": {
    "code": "UC_CD_001",
    "title": "DTx Clinical Endpoint Selection & Validation",
    "workflows": [{
      "name": "Endpoint Selection & Validation Workflow",
      "tasks": [
        {"code": "T1.1", "title": "Define Clinical Context"},
        {"code": "T2.1", "title": "Research DTx Regulatory Precedent"},
        {"code": "T3.1", "title": "Identify Primary Endpoint Candidates"},
        {"code": "T4.1", "title": "Evaluate Psychometric Properties"},
        {"code": "T5.2", "title": "Final Recommendation"}
      ]
    }]
  }
}
```

### Hierarchical Structure

```
📁 PROCESS: DTx Clinical Endpoint Selection & Validation (UC_CD_001)
│
├── 📊 ACTIVITY: Phase 1 - Foundation
│   └── ✅ TASK: T1.1 - Define Clinical Context
│       ├── 🔹 STEP: Define Disease Burden
│       ├── 🔹 STEP: Define Target Population
│       ├── 🔹 STEP: Define Therapeutic Mechanism
│       └── 🔹 STEP: Generate Clinical Context Document
│
├── 📊 ACTIVITY: Phase 2 - Research
│   ├── ✅ TASK: T2.1 - Research DTx Regulatory Precedent
│   │   ├── 🔹 STEP: Search FDA De Novo Database
│   │   ├── 🔹 STEP: Analyze Precedent Submissions
│   │   └── 🔹 STEP: Extract Endpoint Information
│   └── ✅ TASK: T2.2 - Conduct Literature Review
│       ├── 🔹 STEP: Define Search Strategy (PICO)
│       ├── 🔹 STEP: Screen Studies
│       └── 🔹 STEP: Extract Psychometric Data
│
├── 📊 ACTIVITY: Phase 3 - Identification
│   ├── ✅ TASK: T3.1 - Identify Primary Endpoint Candidates
│   │   ├── 🔹 STEP: Generate Candidate List
│   │   ├── 🔹 STEP: Evaluate Against Criteria
│   │   └── 🔹 STEP: Rank Candidates
│   └── ✅ TASK: T3.2 - Identify Secondary Endpoints
│       ├── 🔹 STEP: Identify Secondary Endpoints
│       └── 🔹 STEP: Identify Exploratory Endpoints
│
├── 📊 ACTIVITY: Phase 4 - Validation
│   ├── ✅ TASK: T4.1 - Evaluate Psychometric Properties
│   │   ├── 🔹 STEP: Assess Reliability (Cronbach's α, ICC)
│   │   ├── 🔹 STEP: Assess Validity
│   │   ├── 🔹 STEP: Assess Responsiveness
│   │   └── 🔹 STEP: Determine MCID
│   └── ✅ TASK: T4.2 - Assess Digital Feasibility
│       ├── 🔹 STEP: Technical Feasibility
│       ├── 🔹 STEP: Patient Burden Assessment
│       └── 🔹 STEP: Data Quality Evaluation
│
└── 📊 ACTIVITY: Phase 5 - Decision & Documentation
    └── ✅ TASK: T5.2 - Final Recommendation & Stakeholder Alignment
        ├── 🔹 STEP: Synthesize Evidence
        ├── 🔹 STEP: Document Risk Mitigation
        ├── 🔹 STEP: Create Stakeholder Presentation
        └── 🔹 STEP: Obtain Stakeholder Approval
```

---

## 📋 Digital Health Use Case Categories

### Clinical Development (CD)

| Use Case | Process Name | Activities | Example Tasks |
|----------|--------------|-----------|---------------|
| UC_CD_001 | DTx Endpoint Selection | 5 phases | T1.1 Clinical Context, T2.1 Precedent Research, T3.1 Primary Candidates |
| UC_CD_002 | Digital Biomarker Validation | 3 validation stages (V1, V2, V3) | T1.1 Verification, T2.1 Analytical Validation, T3.1 Clinical Validation |
| UC_CD_003 | RCT Design | 4 design phases | T1.1 Protocol Development, T2.1 Sample Size, T3.1 Statistical Analysis Plan |

### Regulatory Affairs (RA)

| Use Case | Process Name | Activities | Example Tasks |
|----------|--------------|-----------|---------------|
| UC_RA_001 | SAMD Classification | 3 assessment phases | T1.1 Intended Use, T2.1 Risk Classification, T3.1 Regulatory Pathway |
| UC_RA_002 | Pre-Sub Meeting | 4 preparation phases | T1.1 Question Development, T2.1 Package Assembly, T3.1 FDA Submission |
| UC_RA_003 | Clinical Evaluation | 5 evidence phases | T1.1 Literature Review, T2.1 Clinical Data Analysis, T3.1 Benefit-Risk Assessment |

### Medical Affairs (MA)

| Use Case | Process Name | Strategic Pillar | Activities |
|----------|--------------|------------------|-----------|
| UC_MA_001 | Value Dossier Development | SP01: Growth & Market Access | 4 dossier phases |
| UC_MA_002 | Health Economics Evidence | SP01: Growth & Market Access | 3 economic phases |
| UC_MA_003 | Scientific Publications | SP02: Scientific Excellence | 4 publication phases |
| UC_MA_004 | KOL Engagement Strategy | SP03: Stakeholder Engagement | 3 engagement phases |

---

## 🔧 Implementation Guide

### Step 1: Map Existing Workflows to Hierarchy

For each digital health use case JSON file:

1. **PROCESS = Use Case**
   - Title: `use_case.title`
   - Code: `use_case.code`
   - Description: `use_case.summary`

2. **ACTIVITIES = Logical Phases**
   - Group tasks by phase or workstream
   - Common patterns:
     - **Foundation** → Context setting
     - **Research** → Evidence gathering
     - **Analysis** → Evaluation and assessment
     - **Validation** → Quality assurance
     - **Decision** → Finalization and approval

3. **TASKS = JSON tasks array**
   - Map directly from `workflows[0].tasks`
   - Preserve task codes (T1.1, T2.1, etc.)
   - Include agents, tools, inputs, outputs

4. **STEPS = Break down tasks**
   - Decompose each task into 2-5 actionable steps
   - Sequence steps logically
   - Add estimated time per step

### Step 2: Create Hierarchical Workflow Component

```typescript
// Example structure
{
  id: 'process-uc-cd-001',
  type: 'process',
  data: {
    label: 'DTx Clinical Endpoint Selection',
    useCase: 'UC_CD_001',
    domain: 'Clinical Development',
    children: ['activity-foundation', 'activity-research', ...],
  }
}
```

### Step 3: Add Metadata

Enrich each level with relevant metadata:

**Process Level:**
- Use case code
- Domain (CD/RA/MA)
- Complexity level
- Therapeutic area
- Regulatory references
- Compliance flags (HIPAA, GDPR, Part 11)

**Activity Level:**
- Phase name
- SLA targets
- Quality gates
- Dependencies

**Task Level:**
- Task code (T1.1, T2.1, etc.)
- Agents/personas
- Tools required
- RAG sources
- Prompts
- Inputs/outputs
- KPIs
- Duration estimate

**Step Level:**
- Step number
- Action description
- Estimated time
- Prerequisites

---

## 🎨 Visual Design Patterns

### Color Coding by Domain

**Clinical Development (CD):**
- Process: `#7C3AED` (Purple)
- Activity: `#6366F1` (Indigo)
- Task: `#3B82F6` (Blue)
- Step: `#14B8A6` (Teal)

**Regulatory Affairs (RA):**
- Process: `#DC2626` (Red)
- Activity: `#EA580C` (Orange)
- Task: `#F59E0B` (Amber)
- Step: `#EAB308` (Yellow)

**Medical Affairs (MA):**
- Process: `#059669` (Emerald)
- Activity: `#10B981` (Green)
- Task: `#22C55E` (Light Green)
- Step: `#84CC16` (Lime)

### Icon System

- **Process**: 📁 FolderTree
- **Activity**: 📊 Layers
- **Task**: ✅ CheckSquare
- **Step**: 🔹 GitBranch

### Badge System

Display additional context:
- **Agents**: `👤 P01_CMO, P05_REGDIR`
- **Tools**: `🔧 FDA Database, Endpoint Matrix`
- **Duration**: `⏱️ 30 min`
- **Status**: `✓ Complete` `⚠️ In Progress` `○ Pending`

---

## 📝 Data Structure Example

### Process Node
```typescript
{
  id: 'process-dtx-endpoint',
  type: 'process',
  position: { x: 400, y: 50 },
  data: {
    label: 'DTx Clinical Endpoint Selection & Validation',
    description: 'Structured workflow for selecting clinical endpoints',
    hierarchyLevel: 'process',
    children: ['activity-foundation', 'activity-research', ...],
    childrenCount: 5,
    metadata: {
      useCase: 'UC_CD_001',
      domain: 'Clinical Development',
      complexity: 'Advanced',
      therapeuticArea: 'Behavioral Health',
      indication: 'MDD',
      phase: 'Pivotal',
      compliance: ['HIPAA', 'GDPR', 'Part 11'],
    }
  }
}
```

### Activity Node
```typescript
{
  id: 'activity-research',
  type: 'activity',
  position: { x: 100, y: 300 },
  data: {
    label: 'Phase 2: Research',
    description: 'Research regulatory precedents and existing evidence',
    hierarchyLevel: 'activity',
    parentId: 'process-dtx-endpoint',
    children: ['task-precedent-research', 'task-literature-review'],
    childrenCount: 2,
    sla: { targetHours: 8, qualityGate: 0.9 }
  }
}
```

### Task Node
```typescript
{
  id: 'task-precedent-research',
  type: 'task',
  position: { x: 100, y: 100 },
  data: {
    label: 'T2.1: Research DTx Regulatory Precedent',
    description: 'Identify FDA-accepted endpoints in comparable DTx',
    hierarchyLevel: 'task',
    parentId: 'activity-research',
    children: ['step-fda-search', 'step-analysis', 'step-extraction'],
    childrenCount: 3,
    taskCode: 'T2.1',
    agents: ['P02_VPCLIN', 'P05_REGDIR'],
    tools: ['FDA De Novo Database', 'Literature Databases'],
    estimatedDuration: '2 hours',
    outputs: ['Regulatory Precedent Analysis Document'],
    kpis: { 'Precedents_Identified': 3 }
  }
}
```

### Step Node
```typescript
{
  id: 'step-fda-search',
  type: 'step',
  position: { x: 100, y: 100 },
  data: {
    label: 'Search FDA De Novo Database',
    description: 'Query FDA database for cleared DTx in behavioral health',
    hierarchyLevel: 'step',
    parentId: 'task-precedent-research',
    stepNumber: 1,
    estimatedTime: '20 min',
    tool: 'FDA.gov Database',
    output: 'List of comparable DTx submissions'
  }
}
```

---

## 🚀 Usage in Workflow Editor

### Loading the Example

```typescript
import { DigitalHealthHierarchicalWorkflow } from '@/components/workflow-editor/examples/DigitalHealthHierarchicalWorkflow';

function WorkflowPage() {
  return (
    <>
      <DigitalHealthHierarchicalWorkflow />
      <WorkflowEditor mode="create" />
    </>
  );
}
```

### Navigation Flow

1. **Start at Process Level**: See UC_CD_001 node
2. **Click "Open"**: View 5 Activity nodes (Phases 1-5)
3. **Click "Open" on Phase 2**: View Research tasks (T2.1, T2.2)
4. **Click "Open" on T2.1**: View detailed steps
5. **Press Esc or Click Back**: Navigate back up

### Editing Workflow

1. **Select any node**: Properties panel opens
2. **For hierarchical nodes**: See children list, add/delete options
3. **Edit metadata**: Update agents, tools, durations
4. **Add new child**: Click "Add Activity/Task/Step" button
5. **Save workflow**: Cmd/Ctrl + S

---

## 📊 Benefits for Digital Health Teams

### 1. **Clinical Development Teams**
- Clear endpoint selection process
- Traceable regulatory decisions
- Structured evidence synthesis
- Automated document generation

### 2. **Regulatory Affairs Teams**
- Organized submission preparation
- Compliance checkpoint tracking
- Risk mitigation documentation
- FDA precedent integration

### 3. **Medical Affairs Teams**
- Strategic pillar alignment
- Value dossier assembly
- Publication planning
- KOL engagement tracking

### 4. **Cross-Functional Teams**
- Shared visibility into progress
- Clear handoffs between phases
- Consistent documentation
- Audit trail for compliance

---

## 🔗 Integration with Existing Systems

### Database Schema Mapping

```sql
-- Process = dh_use_case
SELECT code, title, summary, domain
FROM dh_use_case
WHERE code = 'UC_CD_001';

-- Activity = logical grouping (new table or virtual)
-- Could add: dh_workflow_phase table

-- Task = dh_task
SELECT code, title, objective, agents, tools
FROM dh_task
WHERE use_case_code = 'UC_CD_001';

-- Step = decomposed from tasks (new granularity)
-- Could add: dh_task_step table
```

### JSON Import/Export

Import existing JSON workflows:
```typescript
async function importWorkflowFromJSON(jsonPath: string) {
  const workflow = await fetch(jsonPath).then(r => r.json());
  const hierarchicalNodes = convertToHierarchy(workflow);
  return hierarchicalNodes;
}
```

---

## 📈 Future Enhancements

1. **Auto-generation from JSON**: Convert existing UC JSON files to hierarchical workflows
2. **Template Library**: Pre-built templates for common use cases
3. **Execution Tracking**: Real-time progress through steps
4. **AI Prompt Integration**: Link prompts to specific steps
5. **Document Generation**: Auto-generate deliverables from completed steps
6. **Compliance Automation**: Automated quality gates and checkpoints
7. **Analytics Dashboard**: Visualize progress, bottlenecks, cycle times
8. **Export to Project Tools**: Sync to Jira, Asana, Monday.com

---

## 📚 Related Files

- **Example Implementation**: [DigitalHealthHierarchicalWorkflow.tsx](apps/digital-health-startup/src/components/workflow-editor/examples/DigitalHealthHierarchicalWorkflow.tsx)
- **JSON Seed Files**: `database/sql/workflows-dh-seeds/UC_CD_*.json`
- **Database Schema**: `database/sql/migrations/2025/20251101110000_digital_health_workflow_schema.sql`
- **Workflow Types**: [workflow.ts](apps/digital-health-startup/src/features/workflow-designer/types/workflow.ts)
- **Navigation Guide**: [HIERARCHICAL_NAVIGATION_GUIDE.md](HIERARCHICAL_NAVIGATION_GUIDE.md)

---

## ✅ Quick Start Checklist

- [ ] Load DigitalHealthHierarchicalWorkflow example
- [ ] Navigate through UC_CD_001 hierarchy
- [ ] Edit a task node to add custom steps
- [ ] Create a new Process for your use case
- [ ] Map your JSON workflows to hierarchy
- [ ] Test navigation with breadcrumbs and Esc key
- [ ] Export workflow as JSON
- [ ] Share with team for feedback

---

**Ready to transform your digital health workflows with hierarchical structure!** 🏥🚀
