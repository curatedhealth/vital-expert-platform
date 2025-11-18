# 🎨 Interactive Workflow Node - Visual Guide

## Before & After

### ❌ Before (Static View Only)
```
┌─────────────────────────────────┐
│  Task 1.1                   1.1 │
│  Define Clinical Context        │
├─────────────────────────────────┤
│  👤 2 Agents                    │
│  Clinical Endpoint Selector     │
│  Regulatory Strategy Agent      │
│                                 │
│  🔧 1 Tool                      │
│  PubMed/MEDLINE                 │
│                                 │
│  📚 2 Sources                   │
│  ISPOR PRO Good Research...     │
│  FDA Digital Health Software... │
└─────────────────────────────────┘
     (View Only - No Editing)
```

### ✅ After (Interactive & Editable)
```
┌─────────────────────────────────┐
│  Task 1.1              1.1  [✏️] │ ← Edit Button!
│  Define Clinical Context        │
├─────────────────────────────────┤
│  👤 2 Agents                    │
│  Clinical Endpoint Selector     │
│  Regulatory Strategy Agent      │
│                                 │
│  🔧 1 Tool                      │
│  PubMed/MEDLINE                 │
│                                 │
│  📚 2 Sources                   │
│  ISPOR PRO Good Research...     │
│  FDA Digital Health Software... │
│                                 │
│  💭 User Prompt                 │
│  Focus on cardiovascular...     │
└─────────────────────────────────┘
    ↓ Click Edit Button ↓
```

## Edit Modal Dialog

```
╔════════════════════════════════════════════════╗
║  Edit Task Assignments                     ❌  ║
║  Configure agents, tools, RAG sources...       ║
╠════════════════════════════════════════════════╣
║                                                ║
║  👤 AI Agents (2 selected)                    ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Select agents...                      ▼ │ ║
║  └──────────────────────────────────────────┘ ║
║  [Clinical Endpoint ❌] [Regulatory Agent ❌]  ║
║                                                ║
║  🔧 Tools (1 selected)                        ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Select tools...                       ▼ │ ║
║  └──────────────────────────────────────────┘ ║
║  [PubMed/MEDLINE ❌]                           ║
║                                                ║
║  📚 Knowledge Sources (2 selected)            ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Select knowledge sources...           ▼ │ ║
║  └──────────────────────────────────────────┘ ║
║  [ISPOR PRO ❌] [FDA Digital Health ❌]        ║
║                                                ║
║  💭 User Prompt (Optional)                    ║
║  ┌──────────────────────────────────────────┐ ║
║  │ Focus on cardiovascular endpoints,       │ ║
║  │ especially those related to...           │ ║
║  │                                           │ ║
║  └──────────────────────────────────────────┘ ║
║                                                ║
╠════════════════════════════════════════════════╣
║                     [Cancel]  [💾 Save Changes]║
╚════════════════════════════════════════════════╝
```

## Dropdown with Search & Multi-Select

```
When you click a dropdown:

┌────────────────────────────────────┐
│ 🔍 Search agents...                │
├────────────────────────────────────┤
│ Scrollable List:                   │
│                                    │
│ ☑️ Clinical Endpoint Selector      │
│    AGENT-CLINICAL-001              │
│                                    │
│ ☑️ Regulatory Strategy Agent       │
│    AGENT-REG-002                   │
│                                    │
│ ☐  Biomarker Validation Agent      │
│    AGENT-BIO-003                   │
│                                    │
│ ☐  Statistical Analysis Agent      │
│    AGENT-STAT-004                  │
│                                    │
│ ☐  Literature Review Agent         │
│    AGENT-LIT-005                   │
│                                    │
│    ... (scroll for more)           │
└────────────────────────────────────┘
```

## Complete Workflow View

```
🚀 Interactive Workflow Designer        [👁️ View Mode] ← Toggle!
9 workflows • 32 tasks

┌──────────────────────────────────────────────┐
│                                              │
│            🟢 START                          │
│         Digital Biomarker                   │
│         Validation Strategy                 │
│                                              │
│              ↓                               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Workflow 1                     1  │     │
│  │  Phase 1: Foundation              │     │
│  └────────────────────────────────────┘     │
│                                              │
│              ↓                               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Task 1.1              1.1    [✏️]│     │
│  │  Define Clinical Context          │     │
│  ├────────────────────────────────────┤     │
│  │  👤 2 Agents                      │     │
│  │  🔧 1 Tool                        │     │
│  │  📚 2 Sources                     │     │
│  │  💭 User Prompt                   │     │
│  └────────────────────────────────────┘     │
│                                              │
│              ↓                               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Task 1.2              1.2    [✏️]│     │
│  │  Select Validation Approach       │     │
│  ├────────────────────────────────────┤     │
│  │  👤 3 Agents                      │     │
│  │  🔧 2 Tools                       │     │
│  │  📚 4 Sources                     │     │
│  └────────────────────────────────────┘     │
│                                              │
│              ↓                               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Workflow 2                     2  │     │
│  │  Phase 2: Execution               │     │
│  └────────────────────────────────────┘     │
│                                              │
│              ↓                               │
│             ...                              │
│              ↓                               │
│                                              │
│            🔴 END                            │
│                                              │
│   [🔍] [⊕] [⊖] [⤢]  ← React Flow Controls  │
│                                              │
└──────────────────────────────────────────────┘

Legend:
🟢 Start  🟣 Workflow  🔵 Task  🔴 End

💡 Edit Mode Active: Click the edit icon on any 
task node to configure agents, tools, RAG sources,
and user prompts.
```

## Key Visual Elements

### 1. **Task Node Header**
```
┌─────────────────────────────────┐
│  [Task 1] ← Badge    [✏️] ← Edit│
│  Title Here              1.1 ↑  │
│                          Position
```

### 2. **Assignment Sections**
```
Agent Section (Blue):
┌─────────────────────────┐
│ 👤 2 Agents             │ ← Icon + Count
│ ┌─────────┬─────────┐   │
│ │Agent 1  │Agent 2  │   │ ← Grid Layout
│ │Order: 1 │Order: 2 │   │
│ └─────────┴─────────┘   │
└─────────────────────────┘

Tool Section (Green):
┌─────────────────────────┐
│ 🔧 1 Tool               │
│ [PubMed] ← Badge        │
└─────────────────────────┘

RAG Section (Purple):
┌─────────────────────────┐
│ 📚 2 Sources            │
│ ┌─────────────────────┐ │
│ │ ISPOR PRO          │ │
│ │ [document] ← Badge │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ FDA Digital Health │ │
│ │ [guidance]         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 3. **Empty State**
```
┌─────────────────────────────────┐
│                                 │
│         ⚠️                      │
│      No assignments             │
│                                 │
│   [+ Add Assignments]           │
│                                 │
└─────────────────────────────────┘
```

### 4. **Badge Colors**
- **Blue** = Agents
- **Green** = Tools  
- **Purple** = RAG Sources
- **Gray** = Metadata (codes, types, etc.)

### 5. **Button States**
```
Edit Mode:
[✏️ Edit Mode] ← Blue background, active

View Mode:
[👁️ View Mode] ← White background, outline
```

## User Interactions

### 1. **Click Edit Button**
→ Opens modal dialog

### 2. **Click Dropdown**
→ Shows searchable list with checkboxes

### 3. **Type in Search**
→ Filters list instantly

### 4. **Click Checkbox**
→ Adds/removes item from selection

### 5. **Click X on Badge**
→ Removes item from selection

### 6. **Type in Textarea**
→ Updates user prompt text

### 7. **Click Save**
→ Saves to database → Updates node → Closes modal

### 8. **Click Cancel**
→ Discards changes → Closes modal

## Responsive Design

### Desktop (Wide):
- Dropdowns show full content
- Grid layout for agents (2 columns)
- All badges visible

### Tablet (Medium):
- Dropdowns adapt to width
- Grid maintains 2 columns
- Badges wrap if needed

### Mobile (Narrow):
- Modal scrolls vertically
- Grid becomes 1 column
- Badges stack vertically

## Color Palette

```
Primary Colors:
- Blue 600 (#2563eb)  - Agents
- Green 600 (#16a34a) - Tools
- Purple 600 (#9333ea) - RAG Sources
- Red 600 (#dc2626)   - End node
- Green 600 (#16a34a) - Start node

Background Colors:
- Blue 50 (#eff6ff)   - Agent sections
- Green 50 (#f0fdf4)  - Tool sections
- Purple 50 (#faf5ff) - RAG sections
- Gray 50 (#f9fafb)   - Node backgrounds

Text Colors:
- Gray 900 (#111827)  - Primary text
- Gray 600 (#4b5563)  - Secondary text
- Gray 500 (#6b7280)  - Helper text
```

## Icons Used

```
- Bot (👤)           - AI Agents
- Wrench (🔧)        - Tools
- Database (📚)      - RAG Sources
- AlertCircle (💭)   - User Prompt
- Edit (✏️)          - Edit button
- Eye (👁️)           - View mode
- Save (💾)          - Save button
- X (❌)             - Close/Remove
- Plus (➕)          - Add items
- Play (▶️)          - Start node
- CheckCircle (✅)   - End node
- WorkflowIcon (🔄)  - Workflow nodes
```

## State Indicators

```
Normal State:
┌─────────────────────────┐
│  Task Node              │ ← Border: gray
└─────────────────────────┘

Selected State:
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Task Node              ┃ ← Border: blue, shadow
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

Hover State:
┌─────────────────────────┐
│  Task Node              │ ← Shadow increases
└─────────────────────────┘

Loading State:
┌─────────────────────────┐
│  [💾 Saving...]         │ ← Button disabled
└─────────────────────────┘
```

## Success Indicators

```
After Save:
1. Modal shows: "Saving..." (500ms)
2. API updates database
3. Node data refreshes
4. Badges update instantly
5. Modal closes
6. (Optional) Toast notification
```

## Best Practices

✅ **Do:**
- Keep agent names clear and descriptive
- Use meaningful user prompts
- Select only required tools
- Choose relevant RAG sources

❌ **Don't:**
- Assign too many agents (3-5 max recommended)
- Leave user prompt empty if context is needed
- Select duplicate or conflicting tools
- Overload tasks with unnecessary RAG sources

---

**Ready to design workflows interactively!** 🎨✨

