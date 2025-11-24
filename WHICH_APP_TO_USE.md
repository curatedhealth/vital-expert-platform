# vital-system vs digital-health-startup

**Quick Reference**: What to use and when

---

## 🎯 Use vital-system (Port 3000)

### For Development
- ✅ Primary development environment
- ✅ All feature additions
- ✅ Bug fixes
- ✅ Testing new features
- ✅ Documentation

### What It Has
- ✅ All designer pages (`/designer`, `/designer-legacy`, `/designer-modern`)
- ✅ WorkflowBuilder with Library Panel
- ✅ All 20+ workflow tasks (Search PubMed, Clinical Trials, FDA, etc.)
- ✅ Mode 1-4 panel workflows
- ✅ AI Chatbot integration
- ✅ Modern WorkflowDesigner (React Flow)
- ✅ Multi-framework support
- ✅ Complete database schema
- ✅ All contexts and utilities

### Start vital-system
```bash
cd apps/vital-system
pnpm dev
# Opens on http://localhost:3000
```

---

## ⚠️ digital-health-startup (Port 3001)

### Use For
- Tenant-specific customizations
- Testing tenant features
- When you specifically need the digital-health-startup tenant

### What To Do
- Import from vital-system (don't duplicate)
- Add tenant-specific features only
- Reference vital-system for base functionality

### Start digital-health-startup
```bash
cd apps/digital-health-startup
pnpm dev
# Opens on http://localhost:3001
```

---

## 📊 Quick Comparison

| Feature | vital-system | digital-health-startup |
|---------|--------------|----------------------|
| **Port** | 3000 | 3001 |
| **Role** | Source of Truth | Tenant App |
| **Development** | Primary | Secondary |
| **Designer Pages** | ✅ Original | Copy (should import) |
| **Library Panel** | ✅ Original | Copy (should import) |
| **WorkflowBuilder** | ✅ Original | Copy (should import) |
| **Use For** | All dev work | Tenant features only |

---

## ✅ Your Specific Question

**You asked**: "which one is ask-panel-v1?"

**Answer**: 
- The **content** (Library Panel, WorkflowBuilder) exists in **vital-system**
- Path: `/apps/vital-system/src/components/langgraph-gui/WorkflowBuilder.tsx`
- Use: `http://localhost:3000/designer` or `/designer-legacy`

The copy in digital-health-startup should be removed or configured to import from vital-system.

---

## 🚀 Recommendation

### Start Here
```bash
cd apps/vital-system
pnpm dev
```

Then visit:
- `http://localhost:3000/designer-legacy` ← Has your Library Panel & all features!

This is your canonical source. Everything else should reference this.

