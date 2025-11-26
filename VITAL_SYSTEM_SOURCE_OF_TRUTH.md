# 🎯 VITAL System - Single Source of Truth

**Date**: November 23, 2025  
**Decision**: vital-system is the canonical implementation  
**Status**: ✅ Established

---

## 📋 Overview

**vital-system** is now the **single source of truth** for all VITAL platform code, features, and implementations.

All other apps (`digital-health-startup`, `pharma`, etc.) should:
1. **Import** from vital-system where possible
2. **Reference** vital-system documentation
3. **Not duplicate** code that exists in vital-system

---

## ✅ What's in vital-system (Complete)

### Core Features
- ✅ All workflow builders (WorkflowBuilder + WorkflowDesigner)
- ✅ Designer pages (`/designer`, `/designer-legacy`, `/designer-modern`)
- ✅ All contexts (`designer-context`, `ask-expert-context`, etc.)
- ✅ Complete component library
- ✅ LangGraph GUI integration
- ✅ React Flow workflow designer
- ✅ Database migrations and schemas
- ✅ API routes for all features
- ✅ Multi-framework support (LangGraph, AutoGen, CrewAI)

### Directory Structure (Source of Truth)
```
/apps/vital-system/
├── src/
│   ├── app/(app)/
│   │   ├── designer/              ✅ Main designer page
│   │   ├── designer-legacy/       ✅ Legacy builder
│   │   ├── designer-modern/       ✅ Modern builder
│   │   ├── ask-expert/            ✅ Expert consultation
│   │   ├── ask-expert-v1/         ✅ Expert v1
│   │   ├── ask-panel/             ✅ Panel discussions
│   │   ├── agents/                ✅ Agent management
│   │   ├── knowledge/             ✅ Knowledge base
│   │   ├── workflows/             ✅ Workflow management
│   │   └── ...
│   ├── components/
│   │   ├── langgraph-gui/         ✅ Legacy workflow builder
│   │   │   ├── WorkflowBuilder.tsx
│   │   │   ├── NodePalette.tsx
│   │   │   ├── AIChatbot.tsx
│   │   │   ├── panel-workflows/   ✅ Mode 1-4 workflows
│   │   │   └── ...
│   │   └── ui/                    ✅ Shared components
│   ├── features/
│   │   └── workflow-designer/     ✅ Modern workflow designer
│   │       ├── components/
│   │       ├── generators/        ✅ LangGraph/AutoGen/CrewAI
│   │       ├── types/
│   │       ├── utils/
│   │       └── ...
│   ├── contexts/
│   │   ├── designer-context.tsx   ✅ Designer state
│   │   ├── ask-expert-context.tsx ✅ Expert state
│   │   └── ...
│   └── lib/
│       ├── langgraph-gui/         ✅ LangGraph utilities
│       └── ...
├── database/
│   ├── migrations/                ✅ All migrations
│   └── seeds/                     ✅ Seed data
└── package.json                   ✅ Dependencies

Port: 3000 (default Next.js port)
```

---

## 🚫 Other Apps - What to Do

### digital-health-startup, pharma, etc.

**Status**: Should reference vital-system, not duplicate

**If you need a page from vital-system**:

#### Option 1: Import from vital-system (Recommended)
```typescript
// In digital-health-startup/src/app/(app)/designer/page.tsx
export { default } from '@vital/vital-system/src/app/(app)/designer/page';
```

#### Option 2: Create a simple wrapper
```typescript
// In digital-health-startup/src/app/(app)/designer/page.tsx
import { DesignerPage } from '@vital/vital-system/components/designer';

export default function Page() {
  return <DesignerPage />;
}
```

#### Option 3: Symlink to vital-system
```bash
# Not recommended but possible
cd apps/digital-health-startup/src/app/(app)
ln -s ../../../vital-system/src/app/(app)/designer designer
```

---

## 📦 Package Structure

### vital-system exports (Future)

To make vital-system consumable by other apps, add to `package.json`:

```json
{
  "name": "@vital/vital-system",
  "exports": {
    "./components/*": "./src/components/*",
    "./features/*": "./src/features/*",
    "./contexts/*": "./src/contexts/*",
    "./lib/*": "./src/lib/*",
    "./pages/*": "./src/app/(app)/*"
  }
}
```

---

## 🎯 Current Status

### ✅ vital-system (Port 3000) - Source of Truth

**Working Pages**:
- `/designer` - Main designer with navigation banner
- `/designer-legacy` - Legacy WorkflowBuilder
- `/designer-modern` - Modern React Flow designer
- `/ask-expert` - Expert consultation
- `/ask-expert-v1` - Expert v1
- `/ask-panel` - Panel discussions
- All other core pages

**Components**:
- ✅ `WorkflowBuilder` - Complete with Library Panel, AI Chatbot, Mode 1-4
- ✅ `WorkflowDesigner` - Modern React Flow implementation
- ✅ All contexts (designer-context, ask-expert-context, etc.)
- ✅ Complete UI library

### ⚠️ digital-health-startup (Port 3001) - Should Reference vital-system

**Current State**: 
- Has copies of designer pages (just created)
- Has its own components (duplicated)
- Should be cleaned up to reference vital-system

**Recommended Action**:
1. Remove duplicated pages from digital-health-startup
2. Import from vital-system instead
3. Or add custom tenant-specific features on top of vital-system

---

## 🛠️ Migration Plan

### Phase 1: Establish vital-system as canonical ✅
- [x] Confirm all pages exist in vital-system
- [x] Verify all contexts exist
- [x] Document structure

### Phase 2: Clean up other apps
- [ ] Remove duplicated code from digital-health-startup
- [ ] Remove duplicated code from pharma
- [ ] Set up imports from vital-system

### Phase 3: Make vital-system exportable
- [ ] Add proper exports to package.json
- [ ] Create barrel exports for components
- [ ] Document API for other apps

---

## 📖 Developer Guidelines

### When adding new features:

1. **Add to vital-system FIRST**
   ```
   /apps/vital-system/src/...
   ```

2. **Document in vital-system**
   ```
   /apps/vital-system/README.md
   ```

3. **If other apps need it**:
   - Import from vital-system
   - Don't copy-paste code
   - Extend if needed, don't duplicate

### When fixing bugs:

1. **Fix in vital-system**
2. **Verify fix works in vital-system**
3. **Test in consuming apps** (if they import it)

---

## 🎨 Content Location

### The "Library Panel" Question

You mentioned `/ask-panel-v1` has the Library Panel content you want to keep.

**In vital-system**, this exists as:
- Component: `/apps/vital-system/src/components/langgraph-gui/WorkflowBuilder.tsx`
- Library: `/apps/vital-system/src/components/langgraph-gui/NodePalette.tsx`
- Panel Workflows: `/apps/vital-system/src/components/langgraph-gui/panel-workflows/`

**The Library Panel includes**:
- Search PubMed
- Search Clinical Trials  
- FDA Database Search
- Web Search
- Search arXiv
- And 20+ other tasks

**This is already in vital-system!** ✅

---

## 🔗 URLs

### vital-system (Canonical)
```
http://localhost:3000/designer
http://localhost:3000/designer-legacy
http://localhost:3000/designer-modern
http://localhost:3000/ask-panel
http://localhost:3000/ask-expert
```

### digital-health-startup (Should import from vital-system)
```
http://localhost:3001/...
```

---

## 🚀 Next Steps

### Today
1. ✅ Establish vital-system as source of truth (DONE)
2. ✅ Document structure (DONE)
3. [ ] Test vital-system pages on port 3000

### This Week
1. [ ] Clean up duplicated code in digital-health-startup
2. [ ] Set up proper imports from vital-system
3. [ ] Document which app runs on which port

### Long Term
1. [ ] Create shared package structure
2. [ ] Move common code to /packages if needed
3. [ ] Set up proper workspace references

---

## 📞 Questions?

**Q: What about ask-panel-v1 in digital-health-startup?**  
A: The same content exists in vital-system. Use vital-system as the source.

**Q: Can I still run digital-health-startup?**  
A: Yes, but configure it to import from vital-system instead of duplicating.

**Q: Which port should I use?**  
A: Use port 3000 (vital-system) for primary development.

**Q: What if I need tenant-specific features?**  
A: Add them in the tenant app, but import base functionality from vital-system.

---

## ✅ Summary

| Aspect | Decision |
|--------|----------|
| **Source of Truth** | vital-system |
| **Primary Port** | 3000 |
| **Primary App** | vital-system |
| **Other Apps** | Import from vital-system |
| **New Features** | Add to vital-system first |
| **Bug Fixes** | Fix in vital-system |
| **Documentation** | Maintain in vital-system |

---

**Established**: November 23, 2025  
**Status**: Active  
**Enforcement**: Required for all new code

