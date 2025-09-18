# 🎯 MA01 CURSOR AI - ONE PAGE CHEATSHEET
## Keep This Open While You Work

---

## 📋 WHAT YOU'RE BUILDING
A medical intelligence system that searches research, analyzes trends, and generates reports.

---

## 🔄 THE ONLY WORKFLOW YOU NEED

```
1. COPY prompt from this sheet
2. PASTE into Cursor
3. TEST that it works
4. COMMIT your changes
5. MOVE to next phase
```

---

## 📌 PHASE-BY-PHASE PROMPTS

### PHASE 0: Setup (Do First!)
```
@workspace Analyze my codebase: What framework, database, API structure, auth, and UI library am I using?
```
Save response to `my-stack.txt`

### PHASE 1: Database
```
@workspace Add jobs and workflows tables to our [YOUR DB] schema. Keep existing tables. Generate migrations.
```
Then: `@workspace Run migrations and verify existing features work`

### PHASE 2: API
```
@workspace Add CRUD endpoints for /api/jobs using our existing auth, database, and patterns. Don't create new patterns.
```
Then: `@workspace Test all 5 endpoints work`

### PHASE 3: AI Agent  
```
@workspace Add simple agent using our existing [OpenAI/Claude] that takes medical query and returns response with citations.
```
Then: `@workspace Add PHARMA format to agent responses`

### PHASE 4: UI
```
@workspace Add job management page to dashboard with table, delete buttons, and create form. Use existing components.
```

### PHASE 5: Connect
```
@workspace Connect jobs to agent: add query field, process with agent, save and display response.
```

### PHASE 6: Polish
```
@workspace Add search box and loading states using our existing patterns.
```

---

## ✅ AFTER EACH PHASE, CHECK:

```bash
# Test it works
- New feature works? ✓
- Old features work? ✓
- No errors? ✓

# Save progress
git add .
git commit -m "feat: Complete Phase X"
```

---

## 🚨 EMERGENCY FIXES

### If Something Breaks:
```
@workspace The last change broke [feature]. Fix while keeping new functionality.
```

### If Can't Fix:
```bash
git reset --hard HEAD  # Go back to last commit
```

### If Cursor Creates New Files:
```
Don't create new files. Modify existing [filename] instead.
```

### If Wrong Pattern:
```
Follow the same pattern as [existing file] not a new approach.
```

---

## 📊 PROGRESS TRACKER

| Phase | Task | Done? |
|-------|------|-------|
| 0 | Setup & Analysis | ☐ |
| 1 | Database Tables | ☐ |
| 2 | CRUD API | ☐ |
| 3 | AI Agent | ☐ |
| 4 | Basic UI | ☐ |
| 5 | Connect AI+Jobs | ☐ |
| 6 | Polish | ☐ |

---

## 🎯 SUCCESS = 
✓ Create job → ✓ AI processes query → ✓ See results in UI → ✓ Old features work

---

## 💡 GOLDEN RULES

1. **ONE phase at a time**
2. **TEST after each prompt**
3. **COMMIT when it works**
4. **NEVER skip phases**
5. **MODIFY don't create**

---

## 🔗 QUICK REFERENCES

**Your Stack:** Check `my-stack.txt`
**Full Guide:** `cursor_simple_execution_plan.md`
**If Stuck:** See Phase 0 analysis

---

**Start with Phase 0. In 6 phases, you're done!** 🚀
