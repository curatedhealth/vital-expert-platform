# 🎯 WORKFLOW EDITOR - 5-MINUTE QUICK START

## 🚀 GET STARTED IN 3 STEPS

### **Step 1: Start Server** (30 seconds)
```bash
cd apps/digital-health-startup
pnpm dev
```

### **Step 2: Open Editor** (10 seconds)
```
http://localhost:3000/workflows/editor?mode=create
```

### **Step 3: Build Your First Workflow** (4 minutes)

---

## 📖 VISUAL GUIDE

### **What You'll See**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back    Edit Workflow         [Save Draft]  [Publish]           │
├──────────┬──────────────────────────────────────────┬───────────────┤
│          │                                          │               │
│  PALETTE │           CANVAS                        │  PROPERTIES   │
│          │                                          │               │
│ ┌──────┐ │  ┌─────────────────────────────────┐   │  ┌──────────┐ │
│ │Search│ │  │                                  │   │  │Workflow  │ │
│ └──────┘ │  │    Drag nodes here               │   │  │  Tab     │ │
│          │  │                                  │   │  └──────────┘ │
│ Tasks    │  │    ┌────────┐                   │   │               │
│ ─────    │  │    │ Task 1 │                   │   │  Title:       │
│  ☐ Task  │  │    └────┬───┘                   │   │  [________]   │
│  ═ Loop  │  │         │                        │   │               │
│          │  │    ┌────▼───┐                   │   │  Description: │
│ Logic    │  │    │ Agent  │                   │   │  [________]   │
│ ─────    │  │    └────────┘                   │   │  [________]   │
│  ◇ If    │  │                                  │   │               │
│          │  └─────────────────────────────────┘   │  Stats:       │
│ AI       │  [⟲][⤢] Auto Layout  Zoom: 100%       │  • 2 nodes    │
│ ─────    │                                          │               │
│  🤖Agent │                                          │               │
│  💾 RAG  │                                          │               │
└──────────┴──────────────────────────────────────────┴───────────────┘
```

---

## 🎮 TRY THESE ACTIONS

### **Action 1: Add a Task** ✨
1. Look at left sidebar
2. Find "Task" under Tasks section
3. **Drag** it to the canvas
4. Drop anywhere

**Result**: You'll see a blue task node!

---

### **Action 2: Add an AI Agent** 🤖
1. Click "Library" tab (top of left sidebar)
2. Click "Agents" sub-tab
3. You'll see your Supabase agents
4. **Drag** any agent to canvas

**Result**: Agent node with pre-filled data!

---

### **Action 3: Connect Nodes** 🔗
1. Hover over the bottom of Task node
2. You'll see a small circle (handle)
3. **Click and drag** from that circle
4. Connect to top of Agent node

**Result**: Animated connection line!

---

### **Action 4: Auto-Arrange** ✨
1. Add 3-4 more nodes (any types)
2. Connect them randomly
3. Click **"Layout"** button in toolbar
4. Select **"Auto Arrange"**

**Result**: Nodes organize perfectly!

---

### **Action 5: Edit Node** ✏️
1. **Click** any node to select it
2. Look at right sidebar
3. It switches to "Node" tab
4. Change the "Label" field
5. Press Enter

**Result**: Node label updates instantly!

---

### **Action 6: Copy/Paste** 📋
1. **Click** a node to select it
2. Press **`Cmd+C`** (or `Ctrl+C`)
3. Press **`Cmd+V`** (or `Ctrl+V`)

**Result**: Duplicate node appears!

---

### **Action 7: Undo/Redo** ⏪⏩
1. Delete a node (select + press Delete)
2. Press **`Cmd+Z`** to undo
3. Press **`Cmd+Shift+Z`** to redo

**Result**: Node comes back!

---

### **Action 8: Save Workflow** 💾
1. Click **"Save Draft"** (top right)
2. Wait for green toast notification

**Result**: Workflow saved to Supabase!

---

## 🎨 NODE TYPES CHEAT SHEET

| Drag This | Get This | For This |
|-----------|----------|----------|
| ☐ Task | Blue box | General work |
| ◇ Conditional | Orange diamond | If/Then logic |
| ⟲ Loop | Pink circle | Repeat actions |
| 🤖 Agent | Indigo gradient | AI processing |
| 💾 RAG | Cyan gradient | Knowledge queries |
| ═ Parallel | Purple box | Simultaneous tasks |
| 👤 Human Review | Green box | Need approval |
| ☁️ API | Gray box | External calls |

---

## ⌨️ KEYBOARD SHORTCUTS

| Press | To Do |
|-------|-------|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+C` | Copy selected |
| `Cmd+X` | Cut selected |
| `Cmd+V` | Paste |
| `Delete` | Delete selected |
| `Cmd+S` | Save workflow |
| `Cmd+0` | Fit to view |
| `Escape` | Clear selection |

---

## 🐛 COMMON ISSUES

### **Q: Nodes won't drag?**
**A**: Make sure you're dragging FROM the palette (left sidebar) ONTO the canvas.

### **Q: Can't connect nodes?**
**A**: Look for the small circle at bottom of node. Drag FROM there TO the top circle of another node.

### **Q: Auto-layout doesn't work?**
**A**: Need at least 2 nodes on canvas.

### **Q: Library tab is empty?**
**A**: Check your API routes:
- `/api/workflows/agents`
- `/api/workflows/rags`
- `/api/workflows/tools`

### **Q: Save button is grayed out?**
**A**: No changes to save yet. Make a change first!

---

## 🎯 PRACTICE CHALLENGE

**Build this workflow in 2 minutes**:

1. Add a "Task" node
2. Add an "AI Agent" node (from Library)
3. Add a "Conditional" node
4. Connect Task → Agent → Conditional
5. Click "Auto Layout"
6. Edit Task label to "Analyze Document"
7. Save workflow

**Done?** 🎉 You're now a pro!

---

## 📚 NEED HELP?

**Full Documentation**:
- `WORKFLOW_EDITOR_PHASE2_COMPLETE.md` - Feature details
- `WORKFLOW_EDITOR_IMPLEMENTATION_COMPLETE.md` - Technical guide

**Test URLs**:
```
Create:    /workflows/editor?mode=create
Edit:      /workflows/editor?mode=edit&id=WF_001
Template:  /workflows/editor?mode=template&template=reg-review
```

---

## 🚀 YOU'RE READY!

Open your browser and go to:
**http://localhost:3000/workflows/editor?mode=create**

**Happy workflow building!** 🎊

