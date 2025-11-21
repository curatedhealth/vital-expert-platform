# Ask Expert Modes - Visual Workflow Comparison

**Date**: November 21, 2025
**Purpose**: Side-by-side visual comparison of all 4 Ask Expert mode workflows

---

## Mode 1: Interactive Manual (15-25s)

```
🚀 START (User selects expert + asks question)
  │
  ├─ 1️⃣ Load Agent (1-2s)
  ├─ 2️⃣ Load Context (2-3s)
  ├─ 3️⃣ Update Context (RAG) (3-5s)
  ├─ 4️⃣ Agent Reasoning (3-5s)
  │
  ├─ 🔀 Specialists? ──┬─ YES → 5️⃣ Spawn Specialists (2-3s)
  │                    └─ NO  ↓
  │
  ├─ 🔀 Tools? ────────┬─ YES → 6️⃣ Tool Execution (3-7s)
  │                    └─ NO  ↓
  │
  ├─ 7️⃣ Generate Response (5-10s)
  ├─ 8️⃣ Update Memory (1-2s)
  │
  └─ 🔀 Continue? → 🏁 END
```

**Key**: Single expert conversation with optional specialists/tools

---

## Mode 2: Interactive Automatic (45-60s)

```
🚀 START (User asks question - no expert selected)
  │
  ├─ 1️⃣ Analyze Query (2-3s)
  ├─ 2️⃣ Select Experts (AI) (2-3s) ⭐ [1-2 experts]
  ├─ 3️⃣ Load Selected Agents (1-2s)
  ├─ 4️⃣ Load Context (2-3s)
  ├─ 5️⃣ Update Context (RAG) (3-5s)
  ├─ 6️⃣ Multi-Expert Reasoning (4-6s)
  │
  ├─ 🔀 Switch Expert? ─┬─ YES → Back to Select Experts ⭐
  │                     └─ NO  ↓
  │
  ├─ 🔀 Specialists? ───┬─ YES → 7️⃣ Spawn Specialists (2-4s)
  │                     └─ NO  ↓
  │
  ├─ 🔀 Tools? ─────────┬─ YES → 8️⃣ Execute Team Tools (3-7s)
  │                     └─ NO  ↓
  │
  ├─ 9️⃣ Coordinate Experts (2-3s) ⭐
  ├─ 🔟 Generate Response (5-10s)
  ├─ 1️⃣1️⃣ Update Memory (1-2s)
  │
  └─ 🔀 Continue? → 🏁 END
```

**Key**: AI selects experts + multi-expert conversation with switching

---

## Mode 3: Autonomous Manual (3-5 min)

```
🚀 START (User selects expert + provides goal)
  │
  ├─ 1️⃣ Load Agent (1-2s)
  ├─ 2️⃣ Load Context (2-3s)
  ├─ 3️⃣ Analyze Goal (3-5s) ⭐
  ├─ 4️⃣ Decompose into Steps (4-6s) ⭐
  ├─ 5️⃣ Gather Information (5-10s)
  ├─ 6️⃣ Initialize Execution (1-2s)
  │
  ╔════════════════════════════════════════╗
  ║  EXECUTION LOOP (repeats per step)    ║
  ╠════════════════════════════════════════╣
  ║  7️⃣ Execute Current Step (10-30s)      ║
  ║  8️⃣ Spawn Specialists (2-4s)           ║
  ║  9️⃣ Execute Tools (5-15s)              ║
  ║                                        ║
  ║  🔀 Approval? ──┬─ YES → 🔟 Request    ║
  ║                 └─ NO  ↓               ║
  ║                                        ║
  ║  🔀 More Steps? ┬─ YES → Loop back ⭐  ║
  ║                 └─ NO  ↓               ║
  ╚════════════════════════════════════════╝
  │
  ├─ 1️⃣1️⃣ Finalize Artifacts (10-20s) ⭐
  ├─ 1️⃣2️⃣ Quality Assurance (5-10s) ⭐
  ├─ 1️⃣3️⃣ Generate Final Report (5-10s)
  ├─ 1️⃣4️⃣ Update Memory (2-3s)
  │
  └─ 🔀 Success? → 🏁 END
```

**Key**: Single expert autonomous workflow with goal decomposition and execution loop

---

## Mode 4: Autonomous Automatic (5-10 min)

```
🚀 START (User provides complex goal - no expert selected)
  │
  ├─ 1️⃣ Analyze Complex Goal (4-6s) ⭐
  ├─ 2️⃣ Assemble Expert Team (3-5s) ⭐ [2-4 experts]
  ├─ 3️⃣ Load Team Agents (2-3s)
  ├─ 4️⃣ Load Context (2-3s)
  ├─ 5️⃣ Decompose to Experts (5-8s) ⭐
  ├─ 6️⃣ Create Execution Plan (3-5s) ⭐
  ├─ 7️⃣ Gather Team Information (8-15s)
  ├─ 8️⃣ Initialize Team Execution (1-2s)
  │
  ╔════════════════════════════════════════════════╗
  ║  PARALLEL EXECUTION LOOP (repeats per phase)  ║
  ╠════════════════════════════════════════════════╣
  ║  9️⃣ Execute Parallel Phase (30-90s) ⭐        ║
  ║     [Multiple experts work simultaneously]     ║
  ║                                                ║
  ║  🔟 Spawn All Team Specialists (3-6s)         ║
  ║  1️⃣1️⃣ Execute Team Tools (10-30s)             ║
  ║  1️⃣2️⃣ Integrate Expert Results (10-20s) ⭐    ║
  ║                                                ║
  ║  🔀 Approval? ──┬─ YES → 1️⃣3️⃣ Request Team   ║
  ║                 └─ NO  ↓                       ║
  ║                                                ║
  ║  🔀 More Phases? ┬─ YES → Loop back ⭐        ║
  ║                  └─ NO  ↓                      ║
  ╚════════════════════════════════════════════════╝
  │
  ├─ 1️⃣4️⃣ Finalize Team Artifacts (15-30s) ⭐
  ├─ 1️⃣5️⃣ Quality Assurance (10-15s) ⭐
  ├─ 1️⃣6️⃣ Team Consensus Review (5-10s) ⭐
  ├─ 1️⃣7️⃣ Generate Comprehensive Response (10-20s)
  ├─ 1️⃣8️⃣ Update Memory (3-5s)
  │
  └─ 🔀 Success? → 🏁 END
```

**Key**: AI-assembled expert team with parallel execution and cross-expert integration

---

## Side-by-Side Feature Comparison

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     FEATURE MATRIX                                       │
├─────────────────┬────────────┬────────────┬────────────┬────────────────┤
│                 │   MODE 1   │   MODE 2   │   MODE 3   │    MODE 4      │
├─────────────────┼────────────┼────────────┼────────────┼────────────────┤
│ Expert Select   │   Manual   │    Auto    │   Manual   │     Auto       │
│ Interaction     │ Interactive│ Interactive│ Autonomous │  Autonomous    │
│ Experts         │      1     │     1-2    │      1     │      2-4       │
│ Time            │  15-25s    │   45-60s   │   3-5 min  │   5-10 min     │
├─────────────────┼────────────┼────────────┼────────────┼────────────────┤
│ Query Analysis  │     ❌     │     ✅     │     ❌     │      ✅        │
│ Goal Decomp     │     ❌     │     ❌     │     ✅     │      ✅        │
│ Multi-Step Loop │     ❌     │     ❌     │     ✅     │      ✅        │
│ Expert Switch   │     ❌     │     ✅     │     ❌     │      ❌        │
│ Multi-Expert    │     ❌     │     ✅     │     ❌     │      ✅        │
│ Parallel Exec   │     ❌     │     ❌     │     ❌     │      ✅        │
│ Integration     │     ❌     │     ✅     │     ❌     │      ✅        │
│ Approval Points │     ❌     │     ❌     │     ✅     │      ✅        │
│ Artifacts       │     ❌     │     ❌     │     ✅     │      ✅        │
│ QA Validation   │     ❌     │     ❌     │     ✅     │      ✅        │
│ Team Review     │     ❌     │     ❌     │     ❌     │      ✅        │
└─────────────────┴────────────┴────────────┴────────────┴────────────────┘
```

---

## Workflow Complexity Progression

```
Mode 1: Interactive Manual
  Complexity: ████░░░░░░ (40%)
  Nodes:      13
  Phases:     7
  Use Case:   Quick expert conversation

Mode 2: Interactive Automatic
  Complexity: ██████░░░░ (60%)
  Nodes:      18
  Phases:     8
  Use Case:   Smart multi-expert discussion

Mode 3: Autonomous Manual
  Complexity: ████████░░ (80%)
  Nodes:      19
  Phases:     8
  Use Case:   Goal-driven expert workflow

Mode 4: Autonomous Automatic
  Complexity: ██████████ (100%)
  Nodes:      22
  Phases:     9
  Use Case:   Complex collaborative execution
```

---

## Unique Nodes by Mode

### Mode 1 Only
- None (Mode 1 is the base pattern)

### Mode 2 Additions
```
✅ Analyze Query
✅ Select Experts (AI)
✅ Check Expert Switch
✅ Coordinate Experts
```

### Mode 3 Additions
```
✅ Analyze Goal
✅ Decompose into Steps
✅ Initialize Execution
✅ Execute Current Step [LOOP]
✅ Check Approval Needed
✅ Request Approval
✅ Check More Steps
✅ Finalize Artifacts
✅ Quality Assurance
```

### Mode 4 Additions
```
✅ Analyze Complex Goal
✅ Assemble Expert Team
✅ Load Team Agents
✅ Decompose to Experts
✅ Create Execution Plan
✅ Gather Team Information
✅ Initialize Team Execution
✅ Execute Parallel Phase [LOOP]
✅ Spawn Team Specialists
✅ Execute Team Tools
✅ Integrate Expert Results
✅ Check More Phases
✅ Finalize Team Artifacts
✅ Team Consensus Review
```

---

## Timing Breakdown by Phase

### Mode 1: Interactive Manual (Total: 15-25s)
```
Phase 1 (Init):          3-5s   ████████░░░░░░░░░░░░░░░░░░░░░░░░
Phase 2 (Context):       3-5s   ████████░░░░░░░░░░░░░░░░░░░░░░░░
Phase 3 (Reasoning):     3-5s   ████████░░░░░░░░░░░░░░░░░░░░░░░░
Phase 4 (Specialists):   2-3s   █████░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 5 (Tools):         3-7s   ██████████░░░░░░░░░░░░░░░░░░░░░░
Phase 6 (Generation):    5-10s  ███████████████░░░░░░░░░░░░░░░░░
Phase 7 (Persistence):   1-2s   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Mode 2: Interactive Automatic (Total: 45-60s)
```
Phase 1 (Init+Select):   7-11s  ███████████░░░░░░░░░░░░░░░░░░░░░
Phase 2 (Context):       3-5s   █████░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 3 (Reasoning):     4-6s   ██████░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 4 (Specialists):   2-4s   ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 5 (Tools):         3-7s   ███████░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 6 (Coordination):  2-3s   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 7 (Generation):    5-10s  ██████████░░░░░░░░░░░░░░░░░░░░░░
Phase 8 (Persistence):   1-2s   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Mode 3: Autonomous Manual (Total: 3-5 min)
```
Phase 1 (Init):          3-5s   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 2 (Planning):      7-11s  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 3 (Info):          5-10s  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 4 (Setup):         1-2s   █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 5 (Execution):     60-120s████████████████████████████░░░░░
Phase 6 (Finalize):      15-30s ████████░░░░░░░░░░░░░░░░░░░░░░░░
Phase 7 (Report):        5-10s  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 8 (Persistence):   2-3s   █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Mode 4: Autonomous Automatic (Total: 5-10 min)
```
Phase 1 (Team):          11-17s ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 2 (Planning):      8-13s  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 3 (Info):          8-15s  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 4 (Setup):         1-2s   █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 5 (Parallel):      120-240s████████████████████████████████
Phase 6 (Integration):   10-20s ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 7 (Finalize):      30-60s ████████░░░░░░░░░░░░░░░░░░░░░░░░
Phase 8 (Report):        10-20s ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 9 (Persistence):   3-5s   █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

---

## Decision Points Comparison

```
MODE 1: 3 decision points
├─ Specialists?
├─ Tools?
└─ Continue?

MODE 2: 4 decision points
├─ Switch Expert?
├─ Specialists?
├─ Tools?
└─ Continue?

MODE 3: 4 decision points
├─ Specialists?
├─ Tools?
├─ Approval Needed?
├─ More Steps?
└─ Success?

MODE 4: 4 decision points
├─ Specialists?
├─ Tools?
├─ Approval Needed?
├─ More Phases?
└─ Success?
```

---

## Use Case Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│  "I want to discuss my 510(k) strategy with the            │
│   FDA Regulatory Expert"                                    │
│                                                             │
│  → MODE 1: Interactive Manual                              │
│     ✅ You know which expert                               │
│     ✅ Conversational back-and-forth                       │
│     ✅ Quick response (15-25s)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  "I need advice on entering the EU market with             │
│   my medical device"                                        │
│                                                             │
│  → MODE 2: Interactive Automatic                           │
│     ✅ Not sure which expert(s)                            │
│     ✅ Want multiple perspectives                          │
│     ✅ Conversational but guided (45-60s)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  "I need the Clinical Trials Expert to create a            │
│   Phase II study protocol"                                  │
│                                                             │
│  → MODE 3: Autonomous Manual                               │
│     ✅ You know the expert                                 │
│     ✅ You have a clear goal/deliverable                   │
│     ✅ Need comprehensive execution (3-5 min)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  "Create a complete FDA 510(k) submission package          │
│   for my cardiac monitoring device"                         │
│                                                             │
│  → MODE 4: Autonomous Automatic                            │
│     ✅ Complex multi-domain goal                           │
│     ✅ Not sure which experts needed                       │
│     ✅ Need comprehensive team execution (5-10 min)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

Four distinct workflow patterns, each building on the previous:

1. **Mode 1**: Simple expert conversation (base pattern)
2. **Mode 2**: Smart multi-expert discussion (adds AI selection)
3. **Mode 3**: Goal-driven workflow (adds autonomous execution)
4. **Mode 4**: Team collaboration (combines AI selection + autonomous execution + parallelism)

All implemented following the same ReactFlow TypeScript structure for consistency and maintainability.
