# Digital Health Workflow System - Hierarchy

**Date**: November 2, 2025  
**Terminology Clarification**

---

## 📊 System Hierarchy

```
DOMAIN (Top Level)
  ↓
USE CASE (Feature/Capability)
  ↓
WORKFLOW (Process/Phase)
  ↓
TASK (Atomic Action)
  ↓
ASSIGNMENTS (Resources)
  ├─ Agents (AI)
  ├─ Tools (Software)
  ├─ RAG Sources (Knowledge)
  └─ Personas (Human Roles)
```

---

## 🏗️ Detailed Structure

### 1. **DOMAIN** (Business Area)
The highest level organizational unit representing major business areas.

**Examples**:
- **CD** (Clinical Development)
- **MA** (Market Access)
- **RA** (Regulatory Affairs)
- **PD** (Product Development)
- **EG** (Engagement)
- **RW** (Real-World Evidence)

**Purpose**: Group related use cases by business function

---

### 2. **USE CASE** (Feature/Capability)
A specific business capability or feature that solves a problem.

**Example**: `UC_CD_001: DTx Clinical Endpoint Selection & Validation`

**Components**:
- **Code**: `UC_CD_001`
- **Title**: "DTx Clinical Endpoint Selection & Validation"
- **Description**: Comprehensive guidance for selecting and validating clinical endpoints
- **Domain**: CD (Clinical Development)
- **Complexity**: Expert
- **Duration**: 120 minutes
- **Deliverables**: List of expected outputs
- **Prerequisites**: Required inputs
- **Success Metrics**: KPIs for success

**Contains**: 1 or more Workflows

---

### 3. **WORKFLOW** (Process/Phase)
A sequence of tasks that accomplish part of the use case.

**Example**: `Phase 1: Foundation & Context`

**Components**:
- **Name**: "Phase 1: Foundation & Context"
- **Description**: "Establish clear clinical context and identify patient-centered outcomes"
- **Position**: 1 (order in the use case)
- **Metadata**:
  - Duration: 30 minutes
  - Complexity: Intermediate
  - Deliverables: ["Clinical Context Document", "Patient Outcome Framework"]

**Contains**: Multiple Tasks (typically 2-15)

**Relationship**: 
- Belongs to **1 Use Case**
- Contains **multiple Tasks**

---

### 4. **TASK** (Atomic Action)
The smallest unit of work - a single, actionable step.

**Example**: `TSK-CD-001-P1-01: Define Clinical Context`

**Components**:
- **Code**: `TSK-CD-001-P1-01`
- **Title**: "Define Clinical Context"
- **Objective**: "Establish clear understanding of clinical problem, target population, and intervention approach"
- **Position**: 1 (order in workflow)
- **Complexity**: Intermediate
- **Duration**: 15 minutes

**Assignments** (What executes the task):
- **Agents**: AI agents that execute the task
- **Tools**: Software tools used
- **RAG Sources**: Knowledge bases consulted
- **Personas**: Human roles involved (review, approve, etc.)

**Relationship**:
- Belongs to **1 Workflow**
- Has **multiple Agents** (1 primary, 0-5 supporting)
- Has **0-10 Tools**
- Has **0-5 RAG Sources**
- Has **1-3 Personas** (human oversight)

---

## 📋 Example: Full Hierarchy

```
DOMAIN: Clinical Development (CD)
    ↓
USE CASE: UC_CD_001 - DTx Clinical Endpoint Selection & Validation
    ├─ Duration: 120 minutes
    ├─ Complexity: Expert
    ├─ 8 Workflows
    └─ 13 Tasks (total across all workflows)
        ↓
    WORKFLOW 1: Phase 1: Foundation & Context
        ├─ Duration: 30 minutes
        ├─ 2 Tasks
        └─ Deliverables: ["Clinical Context Document"]
            ↓
        TASK 1: Define Clinical Context
            ├─ Duration: 15 minutes
            ├─ Position: 1
            └─ Assignments:
                ├─ AGENTS (2):
                │   ├─ Clinical Data Analyst (PRIMARY_EXECUTOR, Order: 1)
                │   └─ Regulatory Specialist (VALIDATOR, Order: 2)
                ├─ TOOLS (3):
                │   ├─ Clinical Trial Database
                │   ├─ Statistical Analysis Tool
                │   └─ Document Generator
                ├─ RAG SOURCES (2):
                │   ├─ FDA Guidance Documents
                │   └─ Clinical Trial Protocols Database
                └─ PERSONAS (2):
                    ├─ Clinical Development Lead (APPROVE, AFTER_AGENT_RUNS)
                    └─ Medical Director (REVIEW, AFTER_AGENT_RUNS)
```

---

## 🔗 Navigation Flow

```
User Journey:

1. /workflows
   ↓ (Browse Use Cases by Domain)
   
2. Click Use Case Card
   ↓
   
3. /workflows/UC_CD_001
   ↓ (View Use Case Details)
   
4. See Tabs:
   - Workflows & Tasks (list all workflows and their tasks)
   - Flow Diagram (visual representation)
   - Deliverables
   - Prerequisites
   - Success Metrics
   
5. Expand Workflow
   ↓ (See all tasks in that workflow)
   
6. View Task Details:
   - Task title & objective
   - Agents assigned (blue section)
   - Tools needed (green section)
   - Knowledge sources (purple section)
   - Human oversight (personas)
```

---

## 📝 Terminology Updates

### ✅ Correct Terminology:

- **"Use Case Catalog"** (not "Workflow Catalog")
- **"Back to Use Cases"** (not "Back to Workflows")
- **"Search use cases..."** (not "Search workflows...")
- **"X use cases"** (not "X workflows") - when counting use cases
- **"X workflows"** - when counting workflows within a use case
- **"X tasks"** - when counting tasks within a workflow

### Page Titles:
- **Main Page**: "Use Case Catalog"
- **Detail Page**: "[Use Case Title]" with subtitle "Use Case Details"

---

## 🎯 Database Schema Alignment

```sql
-- Hierarchy in database:

dh_domain (conceptual - represented by code prefix)
    ↓
dh_use_case (has domain_id or domain code)
    ├─ code: UC_CD_001
    ├─ domain: CD
    └─ metadata: {complexity, duration, deliverables, ...}
        ↓
dh_workflow (has use_case_id)
    ├─ use_case_id: FK → dh_use_case.id
    ├─ name: "Phase 1: Foundation & Context"
    └─ position: 1
        ↓
dh_task (has workflow_id)
    ├─ workflow_id: FK → dh_workflow.id
    ├─ code: TSK-CD-001-P1-01
    └─ position: 1
        ↓
Assignments (multiple junction tables):
    ├─ dh_task_agent (task_id, agent_id, assignment_type, execution_order)
    ├─ dh_task_tool (task_id, tool_id)
    ├─ dh_task_rag (task_id, rag_source_id)
    └─ dh_task_persona (task_id, persona_id, responsibility, review_timing)
```

---

## 📊 Current System Stats

| Level | Count | Example |
|-------|-------|---------|
| **Domains** | 6 | CD, MA, RA, PD, EG, RW |
| **Use Cases** | 50 | UC_CD_001, UC_MA_001, ... |
| **Workflows** | 86 | Phase 1, Phase 2, ... |
| **Tasks** | 151 | TSK-CD-001-P1-01, ... |
| **Agents** | 268 | Clinical Data Analyst, ... |
| **Tools** | ~50 | Statistical Analysis Tool, ... |
| **RAG Sources** | ~30 | FDA Guidance, Clinical Protocols, ... |
| **Personas** | ~25 | Clinical Dev Lead, Medical Director, ... |

---

## ✅ Summary

**Correct Hierarchy**:
1. **Domain** → Business area (e.g., Clinical Development)
2. **Use Case** → Feature/capability (e.g., Endpoint Selection)
3. **Workflow** → Process/phase (e.g., Phase 1: Foundation)
4. **Task** → Atomic action (e.g., Define Clinical Context)
5. **Assignments** → Resources (Agents, Tools, RAG, Personas)

**User Navigation**:
- Browse **Use Cases** by **Domain**
- Click a **Use Case** to see its **Workflows**
- Expand a **Workflow** to see its **Tasks**
- View **Task** details to see **Assignments**

---

**All terminology now correctly reflects this hierarchy!** ✅

