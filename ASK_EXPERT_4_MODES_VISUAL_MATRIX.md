# Ask Expert - 4 Modes Visual Matrix & Flow

**Created:** November 6, 2025  
**Purpose:** Visual representation of the 4 Ask Expert modes and their current implementation flow

---

## 🎯 2×2 Mode Matrix

```
                      ┌────────────────────────────────────────────────────┐
                      │          AGENT SELECTION STRATEGY                  │
                      ├──────────────────────┬─────────────────────────────┤
                      │       MANUAL         │        AUTOMATIC            │
                      │   (User Selects)     │    (AI Selects Best)        │
┌─────────────────────┼──────────────────────┼─────────────────────────────┤
│                     │                      │                             │
│   QUERY TYPE        │   🎯 MODE 1          │   ⚡ MODE 2                 │
│                     │   Manual Expert      │   Automatic Expert          │
│   SIMPLE            │   Selection          │   Selection                 │
│   One-Shot Query    │                      │                             │
│   (No Conversation) │   "Quick Expert"     │   "Smart Search"            │
│                     │                      │                             │
│   ✓ Single question │   👤 User picks      │   🤖 AI picks               │
│   ✓ Fast answers    │      expert          │      expert                 │
│   ✗ No follow-ups   │   📚 Agent-specific  │   🌐 Universal              │
│   ✗ No workflows    │      knowledge       │      knowledge              │
│                     │   ⚡ 20-30 sec       │   ⚡ 20-30 sec              │
│                     │                      │                             │
│                     │   Example:           │   Example:                  │
│                     │   "What are FDA      │   "Best practices           │
│                     │    510(k) reqs?"     │    for clinical trials?"    │
│                     │    → User selects    │    → AI selects             │
│                     │      Regulatory      │      Clinical Expert        │
│                     │                      │                             │
├─────────────────────┼──────────────────────┼─────────────────────────────┤
│                     │                      │                             │
│   CONVERSATION TYPE │   🎯 MODE 3          │   🎼 MODE 4                 │
│                     │   Manual Autonomous  │   Automatic Autonomous      │
│   COMPLEX           │                      │                             │
│   Multi-Turn Chat   │   "Expert Partner"   │   "Expert Orchestra"        │
│   + Workflows       │                      │                             │
│                     │   👤 User picks      │   🤖 AI picks &             │
│   ✓ Multi-turn chat │      expert          │      switches               │
│   ✓ Workflows       │   🤝 Same expert     │   🎼 Multiple               │
│   ✓ Checkpoints     │      throughout      │      experts                │
│   ✓ Autonomous      │   🤖 AI planning &   │   🤖 AI orchestration       │
│                     │      execution       │      & synthesis            │
│                     │   ⏱️  1-2 hours      │   ⏱️  2-3 hours             │
│                     │                      │                             │
│                     │   Example:           │   Example:                  │
│                     │   "Research & draft  │   "Create comprehensive     │
│                     │    regulatory        │    market entry strategy"   │
│                     │    submission plan"  │    → AI orchestrates        │
│                     │    → Selected expert │      multiple experts       │
│                     │      works with AI   │      in harmony             │
│                     │                      │                             │
└─────────────────────┴──────────────────────┴─────────────────────────────┘
```

---

## 📊 Mode Comparison Table

| Feature | **Mode 1** | **Mode 2** | **Mode 3** | **Mode 4** |
|---------|------------|------------|------------|------------|
| **Name** | Manual Expert | Automatic Expert | Manual Autonomous | Automatic Autonomous |
| **Icon** | 🎯 Target | ⚡ Lightning | 🤝 Partnership | 🎼 Symphony |
| **Agent Selection** | User selects | AI selects | User selects | AI selects/switches |
| **Conversation** | One-shot | One-shot | Multi-turn | Multi-turn |
| **Knowledge Search** | Agent-specific | Universal | Agent-specific | Hybrid (all domains) |
| **Chat History** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Workflows** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Checkpoints** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Tool Integration** | Basic | Standard | Advanced | Advanced |
| **Time Estimate** | 20-30 sec | 20-30 sec | 1-2 hours | 2-3 hours |
| **Best For** | Known expert + simple query | Unknown expert + simple query | Deep dive with specific expert | Complex multi-domain problems |
| **Backend Enum** | `QUERY_MANUAL` | `QUERY_AUTOMATIC` | `CHAT_MANUAL` | `CHAT_AUTOMATIC` |
| **Frontend ID** | `mode-1-query-automatic` | `mode-2-query-manual` | `mode-3-chat-automatic` | `mode-4-chat-manual` |

---

## 🔄 Current Implementation Flow

### **Step 1: User Interface Selection**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Ask Expert Interface                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Toggles:                                                       │
│  ┌────────────────────────────────────────────────────┐        │
│  │  [ ] Automatic (Agent Selection)                   │        │
│  │      ↑ OFF = Manual (User selects)                 │        │
│  │      ↓ ON  = Automatic (AI selects)                │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │  [ ] Autonomous (Workflows + Multi-turn)           │        │
│  │      ↑ OFF = Simple Query                          │        │
│  │      ↓ ON  = Complex Conversation + Workflows      │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
│  Selected Mode: [Mode Card Display]                            │
│  ┌────────────────────────────────────────────────────┐        │
│  │  🎯 Mode 1: Manual Expert Selection                │        │
│  │  Choose your specific expert for quick answers     │        │
│  │  ⏱️  ~20-30 seconds                                 │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Step 2: Mode Determination Logic**

```typescript
// Frontend Logic (apps/digital-health-startup/src/features/ask-expert/page.tsx)

const currentMode = useMemo(() => {
  if (!isAutomatic && !isAutonomous) return MODE_DEFS[1];  // Mode 1
  if (isAutomatic && !isAutonomous) return MODE_DEFS[2];   // Mode 2
  if (!isAutomatic && isAutonomous) return MODE_DEFS[3];   // Mode 3
  if (isAutomatic && isAutonomous) return MODE_DEFS[4];    // Mode 4
  return MODE_DEFS[1];
}, [isAutomatic, isAutonomous]);

// Mapping to backend
const modeToOrchestrationType = {
  'mode-1-query-automatic': 'QUERY_MANUAL',      // Mode 1
  'mode-2-query-manual': 'QUERY_AUTOMATIC',      // Mode 2
  'mode-3-chat-automatic': 'CHAT_MANUAL',        // Mode 3
  'mode-4-chat-manual': 'CHAT_AUTOMATIC',        // Mode 4
};
```

### **Step 3: Backend Processing**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Backend Orchestration Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. API Endpoint: /api/ask-expert/orchestrate                  │
│     ↓                                                           │
│  2. Mode Mapper (mode-mapper.ts)                               │
│     ↓                                                           │
│  3. OrchestrationMode Enum Mapping:                            │
│     - Mode 1 → QUERY_MANUAL                                    │
│     - Mode 2 → QUERY_AUTOMATIC                                 │
│     - Mode 3 → CHAT_MANUAL (was CHAT_AUTONOMOUS)               │
│     - Mode 4 → CHAT_AUTOMATIC (was CHAT_AGENT_SELECTION)       │
│     ↓                                                           │
│  4. LangGraph Orchestrator (unified-langgraph-orchestrator.ts) │
│     ↓                                                           │
│  5. Mode-Specific Processing:                                  │
│                                                                 │
│     MODE 1: QUERY_MANUAL                                       │
│     ┌─────────────────────────────────────────────┐           │
│     │ • User-selected agent                       │           │
│     │ • Agent-specific knowledge search           │           │
│     │ • Single response                           │           │
│     │ • No conversation history                   │           │
│     └─────────────────────────────────────────────┘           │
│                                                                 │
│     MODE 2: QUERY_AUTOMATIC                                    │
│     ┌─────────────────────────────────────────────┐           │
│     │ • AI selects best agent                     │           │
│     │ • Universal knowledge search                │           │
│     │ • Single response                           │           │
│     │ • No conversation history                   │           │
│     └─────────────────────────────────────────────┘           │
│                                                                 │
│     MODE 3: CHAT_MANUAL                                        │
│     ┌─────────────────────────────────────────────┐           │
│     │ • User-selected agent (consistent)          │           │
│     │ • Multi-turn conversation                   │           │
│     │ • Autonomous reasoning & planning           │           │
│     │ • Workflow support + checkpoints            │           │
│     │ • Tool chaining & research synthesis        │           │
│     └─────────────────────────────────────────────┘           │
│                                                                 │
│     MODE 4: CHAT_AUTOMATIC                                     │
│     ┌─────────────────────────────────────────────┐           │
│     │ • AI selects/switches agents dynamically    │           │
│     │ • Multi-turn conversation                   │           │
│     │ • Autonomous reasoning & planning           │           │
│     │ • Workflow support + checkpoints            │           │
│     │ • Multi-expert orchestration & synthesis    │           │
│     └─────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Step 4: Knowledge Search Strategy**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Search Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODE 1 (QUERY_MANUAL):                                        │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Query → Agent-Specific Search                   │         │
│  │  • Function: search_knowledge_for_agent()        │         │
│  │  • Searches: Selected agent's domains only       │         │
│  │  • Max Results: 15                               │         │
│  │  • Example: Regulatory Expert → FDA, EMA domains │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  MODE 2 (QUERY_AUTOMATIC):                                     │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Query → Universal Search + Agent Selection      │         │
│  │  • Function: search_knowledge_by_embedding()     │         │
│  │  • Searches: ALL domains (null filter)           │         │
│  │  • Max Results: 10                               │         │
│  │  • Then: AI selects best matching agent          │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  MODE 3 (CHAT_MANUAL):                                         │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Multi-turn → Agent-Specific + Context           │         │
│  │  • Function: search_knowledge_for_agent()        │         │
│  │  • Searches: Selected agent's domains            │         │
│  │  • Context: Accumulated conversation history     │         │
│  │  • Autonomous: Tool chaining enabled             │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  MODE 4 (CHAT_AUTOMATIC):                                      │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Multi-turn → Hybrid Search + Dynamic Switching  │         │
│  │  • Function: Hybrid (keyword + semantic)         │         │
│  │  • Searches: ALL domains with rich metadata      │         │
│  │  • Context: Multi-expert conversation history    │         │
│  │  • Autonomous: Multi-expert orchestration        │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Step 5: Response Generation**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Response Generation                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODE 1 & 2 (Simple Query):                                    │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Knowledge Search                                │         │
│  │         ↓                                        │         │
│  │  LLM Generation (Single Turn)                    │         │
│  │         ↓                                        │         │
│  │  Response with Sources                           │         │
│  │         ↓                                        │         │
│  │  Stream to Frontend                              │         │
│  │  ⏱️  ~20-30 seconds                              │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  MODE 3 & 4 (Autonomous Workflow):                             │
│  ┌──────────────────────────────────────────────────┐         │
│  │  1. Query Analysis & Planning                    │         │
│  │     • Understand goal                            │         │
│  │     • Break into steps                           │         │
│  │     • Identify required tools                    │         │
│  │     ↓                                            │         │
│  │  2. Autonomous Execution Loop                    │         │
│  │     • Research (RAG search)                      │         │
│  │     • Tool usage (web search, calculator, etc.)  │         │
│  │     • Document generation                        │         │
│  │     • Synthesis                                  │         │
│  │     ↓                                            │         │
│  │  3. Checkpoint (if complex)                      │         │
│  │     • Present plan/progress                      │         │
│  │     • Request user approval                      │         │
│  │     • Continue or adjust                         │         │
│  │     ↓                                            │         │
│  │  4. Final Synthesis                              │         │
│  │     • Combine all findings                       │         │
│  │     • Generate comprehensive response            │         │
│  │     • Include all sources                        │         │
│  │     ↓                                            │         │
│  │  5. Stream to Frontend                           │         │
│  │  ⏱️  1-3 hours (with checkpoints)                │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Mode Characteristics

### **Mode 1: Manual Expert Selection** 🎯

```
┌─────────────────────────────────────────────────────────┐
│                     MODE 1: 🎯                          │
│                Manual Expert Selection                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Theme: Precision & Focus                              │
│  Color: Blue (#3B82F6)                                 │
│  Icon: Target 🎯                                       │
│                                                         │
│  User Journey:                                         │
│  ┌───────────────────────────────────────────┐        │
│  │ 1. User selects expert manually           │        │
│  │    👤 → "I need Regulatory Expert"        │        │
│  │         ↓                                 │        │
│  │ 2. User asks specific question            │        │
│  │    💬 "What are FDA 510(k) requirements?" │        │
│  │         ↓                                 │        │
│  │ 3. Agent-specific knowledge search        │        │
│  │    📚 Searches Regulatory domain only     │        │
│  │         ↓                                 │        │
│  │ 4. Expert provides focused answer         │        │
│  │    🎯 Single, precise response            │        │
│  │         ↓                                 │        │
│  │ 5. Done (no follow-ups)                   │        │
│  │    ✅ Query complete                      │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
│  Perfect For:                                          │
│  • "I know which expert I need"                        │
│  • Quick, focused questions                            │
│  • Specific expertise required                         │
│  • Fast turnaround needed                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Mode 2: Automatic Expert Selection** ⚡

```
┌─────────────────────────────────────────────────────────┐
│                     MODE 2: ⚡                          │
│              Automatic Expert Selection                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Theme: Intelligence & Discovery                       │
│  Color: Amber (#F59E0B)                                │
│  Icon: Lightning ⚡                                     │
│                                                         │
│  User Journey:                                         │
│  ┌───────────────────────────────────────────┐        │
│  │ 1. User asks question (no expert selected)│        │
│  │    💬 "Best practices for clinical trials"│        │
│  │         ↓                                 │        │
│  │ 2. AI analyzes query intelligently        │        │
│  │    🤖 Keywords: clinical, trials, best    │        │
│  │         ↓                                 │        │
│  │ 3. Universal knowledge search             │        │
│  │    🌐 Searches ALL domains                │        │
│  │         ↓                                 │        │
│  │ 4. AI selects best matching expert        │        │
│  │    🎯 "Clinical Trial Expert (95%)"       │        │
│  │         ↓                                 │        │
│  │ 5. Expert provides comprehensive answer   │        │
│  │    ⚡ Smart, context-aware response       │        │
│  │         ↓                                 │        │
│  │ 6. Done (no follow-ups)                   │        │
│  │    ✅ Query complete                      │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
│  Perfect For:                                          │
│  • "I don't know which expert to ask"                  │
│  • Exploratory questions                               │
│  • Broad topic inquiries                               │
│  • Let AI find the best expert                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Mode 3: Manual Autonomous** 🤝

```
┌─────────────────────────────────────────────────────────┐
│                     MODE 3: 🤝                          │
│                Manual Autonomous                        │
│            (Expert + AI Partnership)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Theme: Partnership & Consistency                      │
│  Color: Purple (#8B5CF6)                               │
│  Icon: Handshake 🤝                                    │
│                                                         │
│  User Journey:                                         │
│  ┌───────────────────────────────────────────┐        │
│  │ 1. User selects expert partner            │        │
│  │    👤 → "Regulatory Expert"               │        │
│  │         ↓                                 │        │
│  │ 2. User describes complex project         │        │
│  │    💬 "Research & draft regulatory plan"  │        │
│  │         ↓                                 │        │
│  │ 3. AI creates workflow plan               │        │
│  │    🤖 Phase 1: Classification             │        │
│  │       Phase 2: Strategy Development       │        │
│  │       Phase 3: Document Creation          │        │
│  │         ↓                                 │        │
│  │ 4. Checkpoint: User approves plan         │        │
│  │    ✅ "Looks good, proceed"               │        │
│  │         ↓                                 │        │
│  │ 5. Expert + AI collaborate               │        │
│  │    🤝 Expert knowledge + AI execution     │        │
│  │       Multi-turn conversation             │        │
│  │       Tool chaining & research            │        │
│  │         ↓                                 │        │
│  │ 6. Progress checkpoints                   │        │
│  │    📊 User reviews, provides guidance     │        │
│  │         ↓                                 │        │
│  │ 7. Final deliverable                      │        │
│  │    📄 Complete regulatory submission plan │        │
│  │         ↓                                 │        │
│  │ 8. Follow-up conversations possible       │        │
│  │    💬 "How about CE marking?"             │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
│  Perfect For:                                          │
│  • "I need a specific expert for deep work"            │
│  • Complex multi-step projects                         │
│  • Consistent expert voice throughout                  │
│  • Workflow planning & execution                       │
│  • Document generation & synthesis                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Mode 4: Automatic Autonomous** 🎼

```
┌─────────────────────────────────────────────────────────┐
│                     MODE 4: 🎼                          │
│              Automatic Autonomous                       │
│              (Expert Orchestra)                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Theme: Orchestration & Harmony                        │
│  Color: Green (#10B981)                                │
│  Icon: Musical Note 🎼                                 │
│                                                         │
│  User Journey:                                         │
│  ┌───────────────────────────────────────────┐        │
│  │ 1. User describes ambitious project       │        │
│  │    💬 "Create comprehensive market entry  │        │
│  │        strategy for biotech product"      │        │
│  │         ↓                                 │        │
│  │ 2. AI analyzes complexity                 │        │
│  │    🤖 Requires: Regulatory + Market +     │        │
│  │       Clinical + Business experts         │        │
│  │         ↓                                 │        │
│  │ 3. AI creates orchestrated workflow       │        │
│  │    🎼 Movement 1: Regulatory Analysis     │        │
│  │       Movement 2: Market Research         │        │
│  │       Movement 3: Clinical Feasibility    │        │
│  │       Movement 4: Business Strategy       │        │
│  │       Movement 5: Synthesis               │        │
│  │         ↓                                 │        │
│  │ 4. Checkpoint: User approves symphony     │        │
│  │    ✅ "Perfect, let's begin"              │        │
│  │         ↓                                 │        │
│  │ 5. AI conducts expert orchestra           │        │
│  │    🎼 Regulatory Expert (lead)            │        │
│  │       → Market Expert (harmony)           │        │
│  │       → Clinical Expert (solo)            │        │
│  │       → Business Expert (finale)          │        │
│  │         ↓                                 │        │
│  │ 6. Seamless expert transitions            │        │
│  │    🔄 Context preserved across experts    │        │
│  │       Each expert contributes their part  │        │
│  │         ↓                                 │        │
│  │ 7. Periodic checkpoints                   │        │
│  │    📊 "Movement 1 complete. Continue?"    │        │
│  │         ↓                                 │        │
│  │ 8. Grand synthesis                        │        │
│  │    🎉 AI combines all expert insights     │        │
│  │       into comprehensive strategy         │        │
│  │         ↓                                 │        │
│  │ 9. Comprehensive deliverable              │        │
│  │    📄 85-page strategy with attribution   │        │
│  │       Each expert's contribution marked   │        │
│  │         ↓                                 │        │
│  │ 10. Multi-expert follow-ups possible      │        │
│  │    💬 AI switches experts as needed       │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
│  Perfect For:                                          │
│  • "I need the best minds working together"            │
│  • Complex multi-domain challenges                     │
│  • Comprehensive solutions required                    │
│  • Multiple perspectives needed                        │
│  • AI-orchestrated collaboration                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔀 Mode Selection Decision Tree

```
START: What kind of help do you need?
│
├─ "I have a QUICK QUESTION"
│  │
│  ├─ "I KNOW which expert to ask"
│  │  └─→ 🎯 MODE 1: Manual Expert Selection
│  │      • Select your expert
│  │      • Get focused answer
│  │      • Done in 20-30 seconds
│  │
│  └─ "I DON'T KNOW which expert to ask"
│     └─→ ⚡ MODE 2: Automatic Expert Selection
│         • AI finds best expert
│         • Get smart answer
│         • Done in 20-30 seconds
│
└─ "I have a COMPLEX PROJECT / Need WORKFLOW"
   │
   ├─ "I want ONE SPECIFIC EXPERT throughout"
   │  └─→ 🤝 MODE 3: Manual Autonomous
   │      • Select your expert partner
   │      • AI plans & executes with that expert
   │      • Consistent expert voice
   │      • Checkpoints for approval
   │      • 1-2 hour workflows
   │
   └─ "I want the BEST EXPERTS working together"
      └─→ 🎼 MODE 4: Automatic Autonomous
          • AI orchestrates multiple experts
          • Seamless expert transitions
          • Multi-perspective synthesis
          • Checkpoints for approval
          • 2-3 hour workflows
```

---

## 📋 Quick Selection Guide

### **Choose Mode 1 (🎯) When:**
- ✅ You know exactly which expert you need
- ✅ You have a specific, focused question
- ✅ You want a fast answer (20-30 seconds)
- ✅ No follow-up conversation needed
- ❌ DON'T choose if: You're unsure which expert or need multi-step workflow

### **Choose Mode 2 (⚡) When:**
- ✅ You don't know which expert to ask
- ✅ You have a quick question
- ✅ You want AI to find the best expert
- ✅ You trust AI's expert selection
- ❌ DON'T choose if: You need a specific expert or multi-step workflow

### **Choose Mode 3 (🤝) When:**
- ✅ You need a specific expert for deep work
- ✅ You want consistent expert voice throughout
- ✅ You have a complex project with multiple steps
- ✅ You need AI planning & execution assistance
- ✅ You want control via checkpoints
- ❌ DON'T choose if: You need multiple expert perspectives

### **Choose Mode 4 (🎼) When:**
- ✅ You have a complex, multi-domain challenge
- ✅ You need multiple expert perspectives
- ✅ You want AI to orchestrate expert collaboration
- ✅ You need comprehensive, synthesized solutions
- ✅ You want AI to handle expert transitions
- ❌ DON'T choose if: You need simple answers or specific expert consistency

---

## 🏗️ Technical Architecture

### **Frontend Components**

```
┌─────────────────────────────────────────────────────────┐
│            Frontend Architecture                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  page.tsx (Main Ask Expert Page)                       │
│  ├─ EnhancedModeSelector (Mode selection UI)           │
│  ├─ AgentSelector (Modes 1 & 3)                        │
│  ├─ PromptInput (Query input)                          │
│  ├─ ResponseDisplay (Streaming responses)              │
│  └─ WorkflowCheckpoints (Modes 3 & 4)                  │
│                                                         │
│  State Management:                                     │
│  ├─ isAutomatic: boolean                               │
│  ├─ isAutonomous: boolean                              │
│  ├─ selectedAgent: Agent | null                        │
│  ├─ conversationHistory: Message[]                     │
│  └─ checkpointStatus: CheckpointState                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Backend Services**

```
┌─────────────────────────────────────────────────────────┐
│            Backend Architecture                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  API Route: /api/ask-expert/orchestrate                │
│     ↓                                                   │
│  mode-mapper.ts (Mode ID → Enum mapping)               │
│     ↓                                                   │
│  unified-langgraph-orchestrator.ts                     │
│  ├─ Mode 1: QUERY_MANUAL                               │
│  │   └─ Single agent, one-shot                         │
│  ├─ Mode 2: QUERY_AUTOMATIC                            │
│  │   └─ Agent selection, one-shot                      │
│  ├─ Mode 3: CHAT_MANUAL                                │
│  │   └─ Single agent, autonomous workflow              │
│  └─ Mode 4: CHAT_AUTOMATIC                             │
│      └─ Multi-agent, autonomous orchestration          │
│                                                         │
│  Supporting Services:                                  │
│  ├─ unified-rag-service.ts (Knowledge search)          │
│  ├─ agent-service.ts (Agent management)                │
│  ├─ tool-registry.ts (Tool integration)                │
│  └─ checkpoint-service.ts (Workflow checkpoints)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Status

### **Current Status: ✅ All 4 Modes Implemented**

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend UI | ✅ Complete | 2-toggle system working |
| Mode Selection | ✅ Complete | All 4 modes selectable |
| Mode 1 Implementation | ✅ Complete | QUERY_MANUAL working |
| Mode 2 Implementation | ✅ Complete | QUERY_AUTOMATIC working |
| Mode 3 Implementation | ✅ Complete | CHAT_MANUAL with workflows |
| Mode 4 Implementation | ✅ Complete | CHAT_AUTOMATIC with orchestration |
| Knowledge Search | ✅ Complete | All search strategies implemented |
| Checkpoint System | ✅ Complete | Human-in-the-loop for Modes 3 & 4 |
| Tool Integration | ✅ Complete | Advanced tools for Modes 3 & 4 |

### **Verified Functionality:**
- ✅ Mode toggling and selection
- ✅ Agent selection (Modes 1 & 3)
- ✅ Knowledge search strategies
- ✅ Streaming responses
- ✅ Conversation history (Modes 3 & 4)
- ✅ Workflow planning (Modes 3 & 4)
- ✅ Checkpoints (Modes 3 & 4)
- ✅ Multi-expert orchestration (Mode 4)

---

## 🎯 Usage Examples

### **Example 1: Mode 1 (Quick Expert Query)**

```
User: Selects "Regulatory Expert"
Query: "What are the key requirements for FDA 510(k) submission?"
Time: ~25 seconds
Result: Focused regulatory answer with FDA-specific sources
```

### **Example 2: Mode 2 (Smart Discovery)**

```
User: No expert selected
Query: "What are best practices for Phase 3 clinical trials?"
AI: Analyzes → Selects "Clinical Trial Expert" (93% confidence)
Time: ~30 seconds
Result: Comprehensive clinical trial answer
```

### **Example 3: Mode 3 (Expert Partnership)**

```
User: Selects "Regulatory Expert"
Query: "Research and draft a complete regulatory submission strategy"
AI: Creates 3-phase workflow
  Phase 1: Device Classification (15 min)
  Phase 2: Regulatory Pathway Analysis (25 min)
  Phase 3: Submission Document Draft (45 min)
User: Approves plan at checkpoint
Execution: Expert + AI collaborate with tool chaining
Result: Comprehensive regulatory strategy document
Time: ~1.5 hours
```

### **Example 4: Mode 4 (Expert Orchestra)**

```
User: No expert selected
Query: "Create comprehensive market entry strategy for new biotech"
AI: Analyzes complexity → Requires 4 experts
  Movement 1: Regulatory Expert (regulatory landscape)
  Movement 2: Market Access Expert (market analysis)
  Movement 3: Clinical Expert (clinical feasibility)
  Movement 4: Business Expert (financial modeling)
User: Approves orchestration at checkpoint
Execution: AI conducts symphony, seamless expert transitions
Synthesis: AI combines all perspectives into unified strategy
Result: 85-page comprehensive strategy with expert attribution
Time: ~2.5 hours
```

---

## 🔗 Related Documentation

- **Implementation Details:** `apps/digital-health-startup/src/features/ask-expert/utils/mode-mapper.ts`
- **Mode PRDs:**
  - `MODE1_HELPER_PRD.md` - Manual Expert Selection
  - `MODE2_HELPER_PRD.md` - Automatic Expert Selection
  - `MODE3_HELPER_PRD.md` - Manual Autonomous
  - `MODE4_HELPER_PRD.md` - Automatic Autonomous
- **User Journeys:**
  - `MODE1_USER_JOURNEY.md`
  - `MODE2_USER_JOURNEY.md`
  - `MODE3_USER_JOURNEY.md`
  - `MODE4_USER_JOURNEY.md`
- **Integration Status:** `docs/4_MODE_INTEGRATION_COMPLETE.md`

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** Complete & Current



