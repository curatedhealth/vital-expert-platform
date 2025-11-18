# ✅ JSON Templates - New Centralized Location

**Date**: 2025-11-17
**Action**: All JSON templates moved to centralized location

---

## 📍 New Template Location

**All JSON templates are now stored at**:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/TEMPLATES/json_templates/
```

---

## 📚 Templates Available

### 1. V5_PERSONA_JSON_TEMPLATE.json
**Generic template for all business functions**
- Location: `/sql/seeds/TEMPLATES/json_templates/V5_PERSONA_JSON_TEMPLATE.json`
- Use for: Sales, Marketing, Product Management, etc.
- Time: 60-90 minutes

### 2. MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json
**Medical Affairs specific with guidance**
- Location: `/sql/seeds/TEMPLATES/json_templates/MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json`
- Use for: New Medical Affairs personas with OPTIONS
- Time: 20-30 minutes
- Pre-filled: ✅ Tenant, industry, function, tools, stakeholders

### 3. MEDICAL_AFFAIRS_EXAMPLE_FILLED.json
**Complete working example**
- Location: `/sql/seeds/TEMPLATES/json_templates/MEDICAL_AFFAIRS_EXAMPLE_FILLED.json`
- Use for: Fast copy-modify-deploy
- Time: 15-20 minutes
- Status: ✅ Deployment tested

---

## 🗂️ Directory Structure

```
sql/seeds/
├── TEMPLATES/
│   └── json_templates/                    ← ALL JSON TEMPLATES HERE
│       ├── INDEX.md                       ← Start here for template selection
│       ├── V5_PERSONA_JSON_TEMPLATE.json
│       ├── MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json
│       └── MEDICAL_AFFAIRS_EXAMPLE_FILLED.json
│
└── 00_PREPARATION/
    ├── README_DATA_TEAM.md                ← Main entry point
    ├── DATA_TEAM_WORKFLOW_GUIDE.md        ← Full workflow
    ├── QUICK_REFERENCE_CARD.md            ← Enum values
    ├── MEDICAL_AFFAIRS_QUICK_START.md     ← MA quick guide
    ├── ALL_PERSONA_ATTRIBUTES_V5.md       ← Field catalog
    │
    ├── final_transform.py                 ← Transformation script
    ├── DEFAULT_VALUES.json                ← Default configs
    └── VALUE_MAPPINGS.json                ← Enum mappings
```

---

## 🚀 Quick Access

### For Medical Affairs Team

**Start here**:
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/seeds/TEMPLATES/json_templates
```

**Quick start guide**:
```bash
# Read the index
cat INDEX.md

# Copy example template
cp MEDICAL_AFFAIRS_EXAMPLE_FILLED.json ~/Desktop/My_New_Persona.json

# Edit and customize
# Then transform and deploy
```

### For Other Business Functions

**Start here**:
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/seeds/TEMPLATES/json_templates
```

**Copy generic template**:
```bash
cp V5_PERSONA_JSON_TEMPLATE.json ~/Desktop/Sales_Persona.json
```

---

## 📖 Documentation Updates

### Updated References

All documentation now points to new location:

**README_DATA_TEAM.md**:
- Template location updated ✅
- Quick start paths updated ✅

**DATA_TEAM_WORKFLOW_GUIDE.md**:
- Template references updated ✅
- File organization updated ✅

**MEDICAL_AFFAIRS_QUICK_START.md**:
- Template paths updated ✅
- Copy commands updated ✅

---

## 🎯 Benefits of Centralized Location

### Before (Scattered)
- Templates in 00_PREPARATION/
- Mixed with working files
- Hard to find
- Unclear organization

### After (Centralized)
- ✅ All templates in one place
- ✅ Clear separation from working files
- ✅ Easy to browse
- ✅ Logical organization
- ✅ Scalable for future templates

---

## 📋 Template Selection Guide

**Read**: `/sql/seeds/TEMPLATES/json_templates/INDEX.md`

This index provides:
- Template comparison table
- Decision tree for selection
- Usage tips
- Quick start for each template

---

## 🔄 Migration Summary

**Templates Moved**:
1. ✅ V5_PERSONA_JSON_TEMPLATE.json
2. ✅ MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json
3. ✅ MEDICAL_AFFAIRS_EXAMPLE_FILLED.json

**Documentation Created**:
- ✅ INDEX.md (template selector)
- ✅ TEMPLATE_LOCATION_UPDATE.md (this file)

**Documentation Updated**:
- ✅ All path references updated
- ✅ All copy commands updated
- ✅ File organization sections updated

---

## ✅ Verification

**Check templates are accessible**:
```bash
ls -la /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/seeds/TEMPLATES/json_templates/
```

**Expected output**:
```
INDEX.md
MEDICAL_AFFAIRS_EXAMPLE_FILLED.json
MEDICAL_AFFAIRS_PERSONA_TEMPLATE.json
V5_PERSONA_JSON_TEMPLATE.json
```

All present ✅

---

## 🚀 Next Steps

### For Data Team

1. **Bookmark new location**:
   ```
   /sql/seeds/TEMPLATES/json_templates/
   ```

2. **Read INDEX.md** for template selection

3. **For Medical Affairs**:
   - Use `MEDICAL_AFFAIRS_EXAMPLE_FILLED.json`
   - Copy, modify, deploy (15-20 min)

4. **For other functions**:
   - Use `V5_PERSONA_JSON_TEMPLATE.json`
   - Customize for your function
   - Create function-specific template

---

## 📞 Support

### Questions about templates?
- Read: `/sql/seeds/TEMPLATES/json_templates/INDEX.md`

### Questions about process?
- Read: `/sql/seeds/00_PREPARATION/DATA_TEAM_WORKFLOW_GUIDE.md`

### Medical Affairs specific?
- Read: `/sql/seeds/00_PREPARATION/MEDICAL_AFFAIRS_QUICK_START.md`

---

## 🎉 Summary

**All JSON templates now centralized** at:
```
/sql/seeds/TEMPLATES/json_templates/
```

**3 templates available**:
1. Generic (all functions)
2. Medical Affairs (with guidance)
3. Medical Affairs (working example)

**All documentation updated** to reference new location ✅

**Team can now easily**:
- Find templates
- Select right template
- Copy and customize
- Deploy successfully

---

*Template Migration Complete*
*Date: 2025-11-17*
*New Location: /sql/seeds/TEMPLATES/json_templates/*
*Status: ✅ Production Ready*
