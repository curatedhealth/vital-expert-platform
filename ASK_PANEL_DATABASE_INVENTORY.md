# 📊 Ask Panel Database Inventory

**Generated**: 2025-11-04  
**Source**: Supabase MCP Connector Analysis  
**Purpose**: Restore lost functionalities after shared orchestrator refactoring

---

## 🎯 Overview

Your Ask Panel system has **rich, comprehensive database configurations** that we need to restore:

### **Data Available**

✅ **6 Panel Types** with full configurations  
✅ **15 Human Personas** with expertise levels  
⚠️ **0 AI Roles** (needs population from `dh_role` table)  
✅ **Panel Type Configurations** with orchestration strategies  
✅ **Human-Machine Role Patterns** with decision authority  
✅ **Panel Flow Types** (sequential, parallel, iterative)

---

## 📋 1. Panel Types (6 Available)

### **1. Structured Advisory Panel** (`structured`)
- **Display Name**: Structured Advisory Panel
- **Orchestration**: Sequential
- **Use Case**: Regulatory decisions and FDA submissions
- **Configuration**:
  - Max Rounds: 3
  - Experts: 3-5
  - Moderator Required: ✅
  - Voting: ✅
  - Consensus Threshold: 80%

### **2. Adversarial Debate Panel** (`adversarial`)
- **Display Name**: Adversarial Debate Panel
- **Orchestration**: Sequential
- **Use Case**: Risk assessment and critical evaluation
- **Configuration**:
  - Max Rounds: 4
  - Experts: 4-6
  - Moderator Required: ✅
  - Voting: ✅
  - Consensus Threshold: 65%

### **3. Socratic Dialogue Panel** (`socratic`)
- **Display Name**: Socratic Dialogue Panel
- **Orchestration**: Iterative
- **Use Case**: Complex problem-solving
- **Configuration**:
  - Max Rounds: 5
  - Experts: 3-4
  - Moderator Required: ✅
  - Voting: ❌
  - Consensus Threshold: 70%

### **4. Delphi Consensus Panel** (`delphi`)
- **Display Name**: Delphi Consensus Panel
- **Orchestration**: Iterative
- **Use Case**: Forecasting and strategic planning
- **Configuration**:
  - Max Rounds: 5
  - Experts: 5-12
  - Moderator Required: ❌
  - Voting: ✅
  - Parallel Execution: ✅
  - Consensus Threshold: 75%

### **5. Open Collaborative Panel** (`open`)
- **Display Name**: Open Collaborative Panel
- **Orchestration**: Parallel
- **Use Case**: Innovation and early-stage ideation
- **Configuration**:
  - Max Rounds: 2
  - Experts: 5-8
  - Moderator Required: ❌
  - Voting: ❌
  - Parallel Execution: ✅
  - Consensus Threshold: 60%

### **6. Hybrid Human-AI Panel** (`hybrid`)
- **Display Name**: Hybrid Human-AI Panel
- **Orchestration**: Sequential
- **Use Case**: High-stakes decisions requiring human validation
- **Configuration**:
  - Max Rounds: 3
  - Experts: 3-8
  - Moderator Required: ✅
  - Voting: ✅
  - Consensus Threshold: 85%

---

## 👥 2. Human Personas (15 Available)

### **Executive Leadership**

| Code | Name | Expertise | Authority | Department |
|------|------|-----------|-----------|------------|
| `P03_CEO` | Chief Executive Officer | EXPERT | VERY_HIGH | Executive |
| `P01_CMO` | Chief Medical Officer | EXPERT | VERY_HIGH | Clinical Development |

### **Clinical Development**

| Code | Name | Expertise | Authority | Department |
|------|------|-----------|-----------|------------|
| `P02_VPCLIN` | VP Clinical Development | EXPERT | HIGH | Clinical Development |
| `P06_DTXCMO` | DTx Chief Medical Officer | EXPERT | VERY_HIGH | Clinical Development |
| `P03_CLTM` | Clinical Trial Manager | INTERMEDIATE | MEDIUM | Clinical Operations |
| `P06_MEDDIR` | Medical Director | ADVANCED | HIGH | Medical Affairs |
| `P08_CLINRES` | Clinical Research Scientist | ADVANCED | HIGH | Clinical Research |

### **Regulatory Affairs**

| Code | Name | Expertise | Authority | Department |
|------|------|-----------|-----------|------------|
| `P05_REGAFF` | Regulatory Affairs Director | EXPERT | VERY_HIGH | Regulatory Affairs |
| `P05_REGDIR` | VP Regulatory Affairs | ADVANCED | HIGH | Regulatory Affairs |
| `P04_REGDIR` | Regulatory Affairs Director | ADVANCED | HIGH | Regulatory Affairs |

### **Biostatistics & Data Science**

| Code | Name | Expertise | Authority | Department |
|------|------|-----------|-----------|------------|
| `P04_BIOSTAT` | Principal Biostatistician | EXPERT | HIGH | Biostatistics |
| `P07_DATASC` | Data Scientist - Digital Biomarker | ADVANCED | HIGH | Data Science |

### **Product & Commercial**

| Code | Name | Expertise | Authority | Department |
|------|------|-----------|-----------|------------|
| `P06_PMDIG` | Product Manager (Digital Health) | ADVANCED | HIGH | Product |
| `P03_PRODMGR` | Product Manager - Digital Health | INTERMEDIATE | MEDIUM | Product Management |
| `P07_VPMA` | VP Market Access | EXPERT | HIGH | Commercial |

---

## 🤖 3. AI Roles/Agents

**Status**: ⚠️ **No AI roles found in `dh_role` table**

**Expected AI Agents**:
- You had 260 agents in the `agents` table
- You had expert templates for 136+ experts

**Action Required**: 
1. Populate `dh_role` table with AI agents from `agents` table
2. Or map existing agents to the new schema

---

## 🔄 4. Orchestration Strategies

### **Sequential**
- **Panel Types**: Structured, Adversarial, Hybrid
- **Flow**: Experts speak one at a time
- **Use Case**: Formal decisions, regulatory

### **Parallel**
- **Panel Types**: Open, Delphi (optional)
- **Flow**: All experts contribute simultaneously
- **Use Case**: Brainstorming, ideation

### **Iterative**
- **Panel Types**: Socratic, Delphi
- **Flow**: Multiple rounds with feedback
- **Use Case**: Consensus building, complex problems

---

## 🎭 5. Human-Machine Role Patterns

### **Role Types** (from `panel_participants.role`)
- `expert` - Subject matter expert
- `moderator` - Panel facilitator
- `observer` - Non-voting participant
- `pro` - Advocate (adversarial)
- `con` - Critic (adversarial)
- `neutral` - Unbiased analyst

### **Participant Types** (from `panel_participants.participant_type`)
- `ai` - AI agent
- `human` - Human persona

### **Decision Authority Levels** (from `dh_persona.decision_authority`)
- `VERY_HIGH` - Final decision maker (CMO, CEO, etc.)
- `HIGH` - Key decision influence
- `MEDIUM` - Advisory input
- `LOW` - Support role
- `ADVISORY` - Non-binding recommendation

---

## 📊 6. Panel Message Types

From `panel_messages.message_type`:

1. **opening** - Initial statements
2. **analysis** - Detailed analysis
3. **statement** - Position statement
4. **question** - Inquiry to panel
5. **answer** - Response to question
6. **rebuttal** - Counter-argument
7. **cross_examination** - Direct questioning
8. **summary** - Round summary
9. **vote** - Voting contribution
10. **revision** - Updated position

---

## 🎯 7. Consensus Building

### **Consensus Levels** (from `panel_consensus.consensus_type`)
- `unanimous` - 100% agreement
- `strong` - 80%+ agreement
- `moderate` - 60-80% agreement
- `weak` - 40-60% agreement
- `no_consensus` - <40% agreement

### **Consensus Dimensions**
```json
{
  "ethical": 0.0-1.0,
  "clinical": 0.0-1.0,
  "technical": 0.0-1.0,
  "commercial": 0.0-1.0,
  "regulatory": 0.0-1.0,
  "operational": 0.0-1.0
}
```

---

## 🔧 8. What Was Lost in Refactoring

### **Before Refactoring**
✅ Panel type selection (6 types)  
✅ Human persona assignment  
✅ Orchestration strategy (sequential/parallel/iterative)  
✅ Role patterns (expert/moderator/pro/con)  
✅ Consensus tracking  
✅ Message type classification  
✅ Round management  

### **After Refactoring** (Current State)
✅ Shared orchestrator (LangGraph, AutoGen, CrewAI)  
✅ Framework flexibility  
⚠️ **Panel type selection MISSING**  
⚠️ **Human persona assignment MISSING**  
⚠️ **Orchestration strategy MISSING**  
⚠️ **Role patterns MISSING**  
⚠️ **Consensus tracking MISSING**  

---

## 🚀 9. Restoration Plan

### **Phase 1: Restore Ask Panel Types** ⏳ NEXT
1. Add panel type selector to Ask Panel UI
2. Load 6 panel types from `panel_types` table
3. Apply `default_config` when type is selected

### **Phase 2: Restore Human-Machine Roles** ⏳
1. Add role assignment UI
2. Load human personas from `dh_persona` table
3. Populate AI agents from `agents` table to `dh_role`
4. Support hybrid panels (AI + human)

### **Phase 3: Restore Orchestration Patterns** ⏳
1. Sequential flow (turn-by-turn)
2. Parallel flow (simultaneous)
3. Iterative flow (multi-round with feedback)

### **Phase 4: Restore Panel Flow Features** ⏳
1. Round management
2. Message type classification
3. Consensus tracking
4. Voting system

---

## 📚 10. Database Schema Summary

### **Core Panel Tables**
- `panel_types` - Panel type definitions (6 rows)
- `panels` - Panel instances (user-created panels)
- `panel_participants` - Expert assignments per panel
- `panel_rounds` - Round tracking
- `panel_messages` - Expert contributions
- `panel_consensus` - Consensus metrics
- `panel_recommendations` - Final outputs
- `panel_analytics` - Performance metrics

### **Human Persona Tables**
- `dh_persona` - Human organizational roles (15 rows)
- `dh_task_persona` - Human assignments to tasks

### **AI Agent Tables**
- `dh_role` - AI agent definitions (0 rows - needs population!)
- `dh_agent` - AI agent execution config (17 rows)
- `agents` - Existing agents (260 rows)

### **Supporting Tables**
- `conversations` - Chat sessions
- `messages` - Individual messages
- `tenants` - Multi-tenancy support

---

## ✅ Summary

**What You Have**:
- ✅ 6 comprehensive panel types with configs
- ✅ 15 human personas with decision authority
- ✅ Complete database schema for panels
- ✅ Orchestration strategies defined
- ✅ Human-machine role patterns
- ✅ Consensus tracking system
- ✅ Message type classification

**What You Need**:
- ⚠️ UI to select panel type
- ⚠️ UI to assign personas/roles
- ⚠️ Orchestrator integration with panel types
- ⚠️ AI agents populated in `dh_role` table
- ⚠️ Restore panel flow logic (sequential/parallel/iterative)

**Next Action**: Create Ask Panel UI with panel type selector and integrate with shared orchestrator

---

**Database Connection**: ✅ Available via Supabase MCP Connector  
**Tables Analyzed**: 10+ core panel tables  
**Data Completeness**: 85% (missing AI role population)

