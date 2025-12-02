# 🗺️ VITAL Workflow Designer - Quick Reference

## 📍 Page Routes

### Production Pages (Use These)

| Route | Page | Description | Status |
|-------|------|-------------|--------|
| `/designer` | **Modern Workflow Designer** | Enhanced designer with all features | ✅ **RECOMMENDED** |
| `/ask-panel-v1` | Legacy Workflow Builder | Original builder (reference only) | ✅ Legacy |

### Comparison Pages (Created for Migration)

| Route | Page | Description | Status |
|-------|------|-------------|--------|
| `/designer-legacy` | Legacy for Comparison | Side-by-side comparison view | ⚠️ Optional |
| `/designer-modern` | Modern for Comparison | Side-by-side comparison view | ⚠️ Optional |

---

## 🎯 Which Page Should I Use?

### For Regular Use
👉 **Use `/designer`** (Modern WorkflowDesignerEnhanced)

**Why?**
- ✅ Clean, modern UI
- ✅ More canvas space (collapsible chatbot)
- ✅ Better node organization (Built-in vs Custom)
- ✅ Professional toolbar with all features
- ✅ 10 legacy templates + 98 custom nodes
- ✅ Better error handling
- ✅ Searchable node library

### For Reference Only
📚 **Check `/ask-panel-v1`** (Legacy WorkflowBuilder)

**Why?**
- 📖 Original implementation
- 🔍 Verify migration accuracy
- 🧪 Compare behavior

---

## 🎨 Modern Designer Features (`/designer`)

### Left Sidebar
```
┌─────────────────────────┐
│ Node Palette (Built-in) │ ← 9 standard React Flow nodes
│ • Start                 │
│ • End                   │
│ • Agent                 │
│ • Tool                  │
│ • Condition             │
│ • Parallel              │
│ • Human                 │
│ • Subgraph              │
│ • Orchestrator          │
├─────────────────────────┤
│ Node Library (Custom)   │ ← 98 legacy TaskLibrary nodes
│ [Search bar]            │
│ [Category filters]      │
│ • Clinical (12)         │
│ • Regulatory (8)        │
│ • R&D (15)              │
│ • Manufacturing (10)    │
│ • etc...                │
└─────────────────────────┘
```

### Top Toolbar
```
┌──────────────────────────────────────────────────────────────┐
│ [Templates] [Layout ▼] [Undo] [Redo] | [Save] [Run] [⚙️]    │
└──────────────────────────────────────────────────────────────┘
```

### Templates Dialog
```
┌─────────────────────────────────────────────────────────┐
│  Select Workflow Template                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✨ Ask Expert Modes (4)                                │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ Mode 1       │ │ Mode 2       │  ...                 │
│  │ Chat-Manual  │ │ Query-Manual │                      │
│  └──────────────┘ └──────────────┘                      │
│                                                          │
│  👥 Panel Workflows (6)                                 │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ Structured   │ │ Open Panel   │  ...                 │
│  │ Panel        │ │              │                      │
│  └──────────────┘ └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Bottom Right
```
┌─────────────────────────────────────┐
│ 💬 AI Assistant (Click to expand)   │ ← Collapsible by default
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Load a Template
1. Open `http://localhost:3000/designer`
2. Click **"Templates"** button in toolbar
3. Select any template (e.g., "Structured Panel")
4. Template loads on canvas with all nodes

### 2. Configure API Keys
1. Click **"Settings"** (⚙️) button
2. Enter OpenAI API key
3. (Optional) Enter Pinecone API key
4. Click **"Save"**

### 3. Execute Workflow
1. Click **"Run"** button
2. Watch AI chatbot for progress
3. See results when complete

### 4. Create Custom Workflow
1. Drag nodes from **"Node Palette (Built-in)"**
2. Or drag from **"Node Library (Custom)"**
3. Connect nodes by dragging from one to another
4. Select node to edit properties in right panel
5. Click **"Save"** when done

---

## 🔍 Node Library Search

### Search Examples
- Search: `"clinical"` → Shows all clinical nodes
- Search: `"FDA"` → Shows FDA-related nodes
- Search: `"regulatory"` → Shows regulatory nodes

### Category Filters
Click category badges to filter:
- 🏥 Clinical
- 📋 Regulatory
- 🔬 R&D
- 🏭 Manufacturing
- 📊 Analytics
- 🔧 Tools

---

## ⚙️ Toolbar Actions

| Button | Action | Shortcut |
|--------|--------|----------|
| Templates | Load pre-built workflow | - |
| Layout ▼ | Auto-layout options | - |
| Undo | Undo last change | Ctrl+Z |
| Redo | Redo last change | Ctrl+Y |
| Save | Save workflow | Ctrl+S |
| Run | Execute workflow | - |
| ⚙️ | Settings (API keys) | - |

---

## 🎯 Template Categories

### Ask Expert Modes (4 templates)
1. **Ask Expert Mode 1** - Single expert, chat-based
2. **Ask Expert Mode 2** - User selects expert
3. **Ask Expert Mode 3** - Auto-select via GraphRAG
4. **Ask Expert Mode 4** - Deep agents with sub-spawning

### Panel Workflows (6 templates)
1. **Structured Panel** - Structured multi-expert consultation
2. **Open Panel** - Open discussion format
3. **Expert Panel** - Expert consensus panel
4. **Socratic Panel** - Iterative questioning
5. **Devil's Advocate Panel** - Critical analysis
6. **Structured Ask Expert** - Structured consultation

---

## 🐛 Troubleshooting

### Issue: "Please configure your OpenAI API key"
**Solution**: Click Settings (⚙️) → Enter API key → Save

### Issue: "Failed to fetch user agents"
**Solution**: This is a known non-blocking issue. Workflow designer still works.

### Issue: "Python AI Engine error: 404"
**Solution**: Python backend not yet implemented. See `IMPLEMENTATION_GUIDE.md`

### Issue: Templates not loading
**Solution**: Templates load from local `PANEL_CONFIGS`. Check console for errors.

### Issue: Custom nodes not showing
**Solution**: Run database migration `026_seed_all_nodes_FULL.sql`

---

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `LANGGRAPH_INTEGRATION.md` | Full architecture & API specs | Developers |
| `LANGGRAPH_BACKEND_STATUS.md` | Quick status overview | Everyone |
| `IMPLEMENTATION_GUIDE.md` | Python backend guide | Backend devs |
| `WORKFLOW_COMPARISON.md` | Legacy vs Modern comparison | Product team |
| `QUICK_REFERENCE.md` | This file! | End users |

---

## 🎉 Summary

**Main Page**: `http://localhost:3000/designer`

**Features**:
- ✅ 10 pre-built templates (exact legacy workflows)
- ✅ 98 custom nodes from TaskLibrary
- ✅ 9 built-in React Flow node types
- ✅ Drag & drop workflow builder
- ✅ AI chatbot for execution feedback
- ✅ Search & filter nodes
- ✅ Auto-layout options
- ✅ Save & execute workflows

**Status**: Frontend 100% complete, ready for Python backend integration! 🚀











