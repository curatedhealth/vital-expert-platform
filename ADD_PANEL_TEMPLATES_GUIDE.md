# 🚀 Add All 6 Ask Panel Mode Templates

## What This Does

Adds **all 6 Ask Panel mode templates** to the template library so they appear in your Templates dialog alongside the 4 Ask Expert modes.

### The 6 Ask Panel Modes:

1. **Mode 1** - Open Discussion (4 experts, open collaboration)
2. **Mode 2** - Structured Panel (6 experts, sequential speaking)
3. **Mode 3** - Consensus Building (5 experts, voting enabled)
4. **Mode 4** - Debate Panel (6 experts, 3 rounds, adversarial)
5. **Mode 5** - Expert Review (8 experts, tools enabled, comprehensive)
6. **Mode 6** - Multi-Phase Analysis (3 phases: discovery → analysis → synthesis)

**Result**: Your Templates dialog will show **10 templates total** (4 Ask Expert + 6 Ask Panel)

---

## How to Apply Migration 025

### Via Supabase Dashboard

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy entire contents of `025_add_panel_templates.sql`
4. Paste and click **Run**
5. Should see: `Success. No rows returned` (or similar success message)

---

## Verify It Worked

### Via Supabase SQL Editor:

```sql
SELECT template_name, template_category, is_featured 
FROM template_library 
WHERE deleted_at IS NULL
ORDER BY template_category, template_name;
```

**Expected**: 10 rows total
- 4 with `template_category = 'expert_consultation'` (Ask Expert)
- 6 with `template_category = 'panel_discussion'` (Ask Panel)

### Via API:

```bash
curl http://localhost:3000/api/templates?type=workflow | jq '.templates | length'
```

**Expected**: `10`

### Count by category:

```bash
curl http://localhost:3000/api/templates?type=workflow | jq '[.templates | group_by(.template_category)[] | {category: .[0].template_category, count: length}]'
```

**Expected**:
```json
[
  {
    "category": "expert_consultation",
    "count": 4
  },
  {
    "category": "panel_discussion",
    "count": 6
  }
]
```

---

## What You'll See in Designer

After applying migration and **refreshing browser**:

```
┌─────────────────────────────────────────────┐
│   Select Workflow Template                   │
│   Choose a pre-built workflow...             │
├─────────────────────────────────────────────┤
│                                               │
│   ✨ Ask Expert Modes (4)                   │
│   ┌──────────┐ ┌──────────┐                 │
│   │ Mode 1   │ │ Mode 2   │ ...             │
│   │ Direct   │ │ + Tools  │                 │
│   └──────────┘ └──────────┘                 │
│                                               │
│   👥 Panel Workflows (6)  ← ALL 6 MODES!    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │ Mode 1   │ │ Mode 2   │ │ Mode 3   │   │
│   │  Open    │ │Structured│ │Consensus │   │
│   │⭐📦      │ │⭐📦      │ │⭐📦      │   │
│   └──────────┘ └──────────┘ └──────────┘   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │ Mode 4   │ │ Mode 5   │ │ Mode 6   │   │
│   │  Debate  │ │ Expert   │ │Multi-    │   │
│   │  Panel   │ │ Review   │ │Phase     │   │
│   │⭐📦      │ │⭐📦      │ │⭐📦      │   │
│   └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘

Legend: ⭐ Featured  📦 Built-in
```

---

## After Applying

1. ✅ **Apply migration** in Supabase SQL Editor
2. 🔄 **Refresh browser** at `http://localhost:3000/designer`
3. 🖱️ **Click "+ Templates"** button in toolbar
4. 👀 **See all 10 templates** organized by category!

---

## Note About "Failed to fetch user agents" Error

This console error is **unrelated** to templates and **safe to ignore**. It occurs because:
- The AI Assistant panel tries to fetch user agents on load
- The `/api/user-agents` endpoint requires authentication
- This doesn't affect template functionality at all

You can hide it by:
1. Adding proper authentication, or
2. Disabling the AI Assistant panel temporarily, or
3. Just ignoring it (won't affect templates)

---

## Summary

- **Before**: 4 templates (Ask Expert only)
- **After**: 10 templates (4 Ask Expert + 6 Ask Panel modes)
- **Action**: Apply migration 025 in Supabase → Refresh browser
- **Location**: `database/migrations/025_add_panel_templates.sql`

---

**Ready to apply!** Copy the SQL, paste in Supabase, refresh, and enjoy all 10 templates! 🎉
