# 🎨 Protocol Toggles - Visual Guide

## New Edit Modal Layout

```
╔════════════════════════════════════════════════════════╗
║  Edit Task Assignments                             ❌  ║
║  Configure agents, tools, RAG sources, and protocols  ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  🤖 AI Agents (2 selected)                            ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Select agents...                              ▼ │ ║
║  └──────────────────────────────────────────────────┘ ║
║  [Agent 1 ❌] [Agent 2 ❌]                             ║
║                                                        ║
║  🔧 Tools (1 selected)                                ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Select tools...                               ▼ │ ║
║  └──────────────────────────────────────────────────┘ ║
║  [Tool 1 ❌]                                           ║
║                                                        ║
║  📚 Knowledge Sources (2 selected)                    ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Select knowledge sources...                   ▼ │ ║
║  └──────────────────────────────────────────────────┘ ║
║  [Source 1 ❌] [Source 2 ❌]                           ║
║                                                        ║
║  ──────────────────────────────────────────────────── ║
║                                                        ║
║  Workflow Protocols                                   ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ 👤  Human in the Loop (HITL)             [ON] │  ║
║  │     Requires human approval before exec.      │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ ✓  PHARMA Protocol                      [OFF] │  ║
║  │    Pharmaceutical compliance validation       │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ 📋  VERIFY Protocol                      [ON] │  ║
║  │     Output verification and validation        │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  💭 User Prompt (Optional)                            ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Focus on cardiovascular endpoints,               │ ║
║  │ especially those related to...                   │ ║
║  │                                                   │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                         [Cancel]  [💾 Save Changes]   ║
╚════════════════════════════════════════════════════════╝
```

## Protocol Toggle States

### 1. Human in the Loop (HITL) - Blue Theme

**OFF State:**
```
┌────────────────────────────────────────┐
│ 👤  Human in the Loop (HITL)     [⚪] │
│     Requires human approval           │
└────────────────────────────────────────┘
```

**ON State:**
```
┌────────────────────────────────────────┐
│ 👤  Human in the Loop (HITL)     [🔵] │
│     Requires human approval           │
└────────────────────────────────────────┘
```

### 2. PHARMA Protocol - Green Theme

**OFF State:**
```
┌────────────────────────────────────────┐
│ ✓  PHARMA Protocol               [⚪] │
│    Pharmaceutical compliance          │
└────────────────────────────────────────┘
```

**ON State:**
```
┌────────────────────────────────────────┐
│ ✓  PHARMA Protocol               [🟢] │
│    Pharmaceutical compliance          │
└────────────────────────────────────────┘
```

### 3. VERIFY Protocol - Purple Theme

**OFF State:**
```
┌────────────────────────────────────────┐
│ 📋  VERIFY Protocol              [⚪] │
│     Output verification               │
└────────────────────────────────────────┘
```

**ON State:**
```
┌────────────────────────────────────────┐
│ 📋  VERIFY Protocol              [🟣] │
│     Output verification               │
└────────────────────────────────────────┘
```

## Task Node Display (Compact View)

When protocols are enabled, they show on the task node:

```
┌─────────────────────────────────────┐
│  Task 1.1              1.1     [✏️] │
│  Define Clinical Context            │
├─────────────────────────────────────┤
│  👤 2 Agents                        │
│  🔧 1 Tool                          │
│  📚 2 Sources                       │
│                                     │
│  ⚙️ Protocols:                      │
│  • HITL ✓  • PHARMA ✓  • VERIFY ✓  │
└─────────────────────────────────────┘
```

## Protocol Meanings

### 🔵 Human in the Loop (HITL)
```
Purpose: Human oversight and approval
When:    Before task execution
Action:  Workflow pauses for approval
Result:  Task only runs after human confirms
```

### 🟢 PHARMA Protocol
```
Purpose: Pharmaceutical compliance
When:    During task execution
Action:  Apply pharma-specific validations
Result:  Ensures regulatory compliance
```

### 🟣 VERIFY Protocol
```
Purpose: Output validation
When:    After task execution
Action:  Verify outputs meet criteria
Result:  Validated and documented results
```

## Interaction Flow

### 1. Opening the Modal
```
User clicks [✏️] on task node
         ↓
Modal opens with current state
         ↓
Fetch available options from Supabase:
  - Agents from dh_agent
  - Tools from dh_tool
  - RAG sources from dh_rag_source
         ↓
Display populated dropdowns + current protocols
```

### 2. Selecting Items
```
Click dropdown → Opens searchable list
         ↓
Type to search → Filters list
         ↓
Click checkbox → Adds to selection
         ↓
Badge appears → Shows selected item
         ↓
Click X on badge → Removes from selection
```

### 3. Toggling Protocols
```
Click switch → Toggles ON/OFF
         ↓
Visual feedback:
  - Background color changes
  - Switch moves right/left
  - Icon remains visible
         ↓
State stored in component
```

### 4. Saving
```
Click [💾 Save Changes]
         ↓
Send to API:
  PUT /api/workflows/tasks/[taskId]/assignments
  {
    agentIds, toolIds, ragIds,
    userPrompt,
    humanInLoop, pharmaProtocol, verifyProtocol
  }
         ↓
Update Supabase:
  - Junction tables (agents, tools, rags)
  - dh_task.extra (userPrompt)
  - dh_task.guardrails (humanInLoop)
  - dh_task.run_policy (pharmaProtocol, verifyProtocol)
         ↓
Node refreshes with new data
         ↓
Modal closes
```

## Color Palette

### HITL (Blue):
```
Background:    #eff6ff (blue-50)
Border:        #bfdbfe (blue-200)
Icon BG:       #2563eb (blue-600)
Title:         #1e3a8a (blue-900)
Description:   #1d4ed8 (blue-700)
Switch Active: #2563eb (blue-600)
```

### PHARMA (Green):
```
Background:    #f0fdf4 (green-50)
Border:        #bbf7d0 (green-200)
Icon BG:       #16a34a (green-600)
Title:         #14532d (green-900)
Description:   #15803d (green-700)
Switch Active: #16a34a (green-600)
```

### VERIFY (Purple):
```
Background:    #faf5ff (purple-50)
Border:        #e9d5ff (purple-200)
Icon BG:       #9333ea (purple-600)
Title:         #581c87 (purple-900)
Description:   #7e22ce (purple-700)
Switch Active: #9333ea (purple-600)
```

## Icons

### HITL (Human in the Loop):
```svg
User Icon
<svg viewBox="0 0 24 24">
  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
  <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
```

### PHARMA Protocol:
```svg
Check Circle Icon
<svg viewBox="0 0 24 24">
  <path d="M9 12l2 2 4-4" />
  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

### VERIFY Protocol:
```svg
Document Icon
<svg viewBox="0 0 24 24">
  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
```

## Responsive Behavior

### Desktop (Wide):
- Protocols display side by side
- Full descriptions visible
- Large switch controls

### Tablet (Medium):
- Protocols stack vertically
- Descriptions truncate if needed
- Medium switch controls

### Mobile (Narrow):
- Modal scrolls vertically
- Protocols stack with icons
- Compact switch controls

## State Persistence

### Initial Load:
```javascript
// From database
humanInLoop: false
pharmaProtocol: false  
verifyProtocol: false
```

### After Toggle:
```javascript
// In component state
humanInLoop: true
pharmaProtocol: false
verifyProtocol: true
```

### After Save:
```javascript
// Written to dh_task
guardrails: { humanInLoop: true }
run_policy: { 
  pharmaProtocol: false,
  verifyProtocol: true
}
```

---

**Ready to use! Refresh your browser and click Edit on any task node to see the new protocol toggles!** 🎉

