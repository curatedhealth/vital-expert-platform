# 🎯 Persona Data - Quick Reference Card

**Print this and keep at your desk!**

---

## ⚡ 4-Step Workflow

```
1. COPY TEMPLATE → 2. VALIDATE DATA → 3. TRANSFORM → 4. DEPLOY
```

---

## 🔒 Golden Rules (Memorize These!)

| Rule | Compliance |
|------|------------|
| **#1: ZERO JSONB** | No JSONB for structured data |
| **#2: 3NF Normalized** | Every entity gets its own table |
| **#3: Simple TEXT[]** | Arrays only for simple strings |

---

## ✅ Pre-Deployment Checklist

```
□ Enum values match template
□ Required fields populated
□ Data types correct
□ slug is unique
□ Reviewed generated SQL
□ Tested with 1-2 personas first
```

---

## 🚨 Common Errors & Quick Fixes

### Error: "null value violates not-null constraint"
**→ Fix**: Add to `DEFAULT_VALUES.json`

### Error: "invalid input value for enum"
**→ Fix**: Add to `VALUE_MAPPINGS.json`

### Error: "duplicate key violates unique constraint"
**→ Fix**: Make slug unique (add suffix)

### Error: "numeric field overflow"
**→ Fix**: Convert percentage (85 → 0.85)

---

## 📊 Critical Enum Values

| Field | Valid Values |
|-------|-------------|
| **pain_category** | operational, strategic, technology, interpersonal |
| **severity** | critical, high, medium, low |
| **goal_type** | primary, secondary, long_term, personal |
| **challenge_type** | daily, weekly, strategic, external |
| **meeting_load** | heavy, moderate, light |
| **energy_pattern** | high, medium, low |
| **confidence_level** | very_high, high, medium, low, very_low |

---

## 🛠️ Essential Commands

### Run Transformation
```bash
python3 final_transform.py
```

### Deploy
```bash
psql "$DATABASE_URL" -f DEPLOY_*.sql 2>&1 | tee deployment.log
```

### Verify
```sql
SELECT COUNT(*) FROM personas WHERE tenant_id = 'your-id';
```

### Check Compliance
```sql
-- Should return 0
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name LIKE 'persona%'
  AND data_type = 'jsonb'
  AND column_name != 'metadata';
```

---

## 📁 Required Files

| File | Purpose |
|------|---------|
| `V5_PERSONA_JSON_TEMPLATE.json` | Data structure reference |
| `DEFAULT_VALUES.json` | Required field defaults |
| `VALUE_MAPPINGS.json` | Enum conversions |
| `final_transform.py` | Transformation script |

---

## 💡 Pro Tips

1. **Always validate before transform** - Saves hours of debugging
2. **Test with 1 persona first** - Catch issues early
3. **Review generated SQL** - Spot check for NULLs
4. **Look for first error** - Ignore "aborted transaction" cascades
5. **Keep enums cheat sheet handy** - Most common error source

---

## 📞 Need Help?

**Read**: `DATA_TEAM_WORKFLOW_GUIDE.md` (full guide)
**Check**: `ALL_PERSONA_ATTRIBUTES_V5.md` (all fields)
**Reference**: `V5_PERSONA_JSON_TEMPLATE.json` (structure)

---

**Success Formula**: Template + Validation + Transform + Deploy = ✅

*v1.0 - Based on Medical Affairs v5.0 deployment*
