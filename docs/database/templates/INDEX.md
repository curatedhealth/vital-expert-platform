# Content Loading System - Index

**Quick Navigation**: Choose your starting point based on your goal

---

## 🎯 I Want To...

### Load Personas for a New Business Function
👉 **Start Here**: [QUICKSTART.md](QUICKSTART.md) (15-30 min)

### Load Organizational Roles
👉 **Start Here**: [00_foundation/README_ROLE_LOADING_PROCESS.md](00_foundation/README_ROLE_LOADING_PROCESS.md)

### Understand How the System Works
👉 **Read**: [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)

### Get Complete Documentation
- **Personas**: [README_PERSONA_LOADING_PROCESS.md](README_PERSONA_LOADING_PROCESS.md)
- **Roles**: [00_foundation/README_ROLE_LOADING_PROCESS.md](00_foundation/README_ROLE_LOADING_PROCESS.md)

### See the Medical Affairs Example
👉 **View**: [03_content/LOAD_SUCCESS_REPORT.md](03_content/LOAD_SUCCESS_REPORT.md)

### Troubleshoot an Issue
👉 **Check**: [README_PERSONA_LOADING_PROCESS.md#troubleshooting](README_PERSONA_LOADING_PROCESS.md#🐛-troubleshooting)

---

## 📂 File Organization

```
PRODUCTION_TEMPLATES/
│
├── INDEX.md ← You are here
├── QUICKSTART.md ← 5-step persona quick start
├── SYSTEM_OVERVIEW.md ← System architecture
├── README_PERSONA_LOADING_PROCESS.md ← Persona complete guide
│
├── 00_foundation/ ← Templates & scripts
│   ├── 00_setup_org_structure_TEMPLATE.sql ← Org structure setup
│   ├── LOAD_ALL_PERSONAS_TEMPLATE.sh ← Persona loading script
│   ├── LOAD_ALL_ROLES_TEMPLATE.sh ← Role loading script
│   ├── ROLE_JSON_TEMPLATE.json ← Role JSON structure
│   └── README_ROLE_LOADING_PROCESS.md ← Role complete guide
│
├── json_data/ ← Your JSON files
│   ├── 01_roles/
│   │   └── {function_name}/
│   │       └── {function}_roles_part1.json
│   └── 02_personas/
│       └── {function_name}/
│           └── {function}_personas_part1.json
│
└── 03_content/ ← Generated SQL & reports
    ├── {function}_roles_part1.sql
    ├── {function}_personas_part1.sql
    └── LOAD_SUCCESS_REPORT.md
```

---

## 🚀 Quick Commands

### Generate Personas SQL from JSON
```bash
python3 scripts/transform_personas_json_to_sql_GENERIC.py \
  --input your_personas.json \
  --output your_personas.sql \
  --function-slug "your-function" \
  --tenant-id "your-tenant-uuid"
```

### Generate Roles SQL from JSON
```bash
python3 scripts/transform_roles_json_to_sql_GENERIC.py \
  --input your_roles.json \
  --output your_roles.sql \
  --function-slug "your-function" \
  --tenant-id "your-tenant-uuid"
```

### Load All Personas
```bash
./LOAD_ALL_YOUR_FUNCTION_PERSONAS.sh
```

### Load All Roles
```bash
./LOAD_ALL_YOUR_FUNCTION_ROLES.sh
```

### Verify Loads
```sql
-- Personas
SELECT COUNT(*) FROM personas WHERE function_id IN (
  SELECT id FROM org_functions WHERE slug = 'your-function'
);

-- Roles
SELECT COUNT(*) FROM org_roles WHERE function_id IN (
  SELECT id FROM org_functions WHERE slug = 'your-function'
);
```

---

## 📊 System Status

### Personas Loading System
| Component | Status | Notes |
|-----------|--------|-------|
| SQL Templates | ✅ Ready | Tested with Medical Affairs |
| Transformation Script | ✅ Ready | Handles old & new JSON formats |
| Loading Scripts | ✅ Ready | Error handling & verification |
| Documentation | ✅ Complete | Quick start + full guide |
| Medical Affairs Example | ✅ Complete | 67 personas loaded |

### Roles Loading System
| Component | Status | Notes |
|-----------|--------|-------|
| JSON Template | ✅ Ready | 111-column schema coverage |
| Transformation Script | ✅ Ready | Full enum and JSONB support |
| Loading Scripts | ✅ Ready | Error handling & verification |
| Documentation | ✅ Complete | Full guide with examples |
| Example Roles | ✅ Ready | CMO + VP Medical Affairs |

---

## 🎓 Learning Path

**For Beginners**:
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Follow the 5 steps
3. Verify success

**For Advanced Users**:
1. Review [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)
2. Customize templates as needed
3. Extend transformation script

**For Troubleshooting**:
1. Check [README_PERSONA_LOADING_PROCESS.md#troubleshooting](README_PERSONA_LOADING_PROCESS.md#🐛-troubleshooting)
2. Review Medical Affairs example
3. Verify schema matches

---

## 🔗 Related Documentation

- **Schema Reference**: `00_PREPARATION/PERSONA_JUNCTION_TABLES_SCHEMA.md`
- **VPANES Guide**: `00_PREPARATION/VPANES_SCHEMA.md`
- **Verification Queries**: `00_PREPARATION/VERIFY_PERSONA_LOAD.sql`
- **Supabase Query**: `00_PREPARATION/SUPABASE_QUERY_ALL_MEDICAL_AFFAIRS_PERSONAS.sql`

---

## 💡 Need Help?

1. **Check Documentation**: Most questions answered in README
2. **Review Example**: Medical Affairs load is fully documented
3. **Verify Schema**: Use information_schema queries
4. **Test Small**: Load 1 persona first, then all

---

**Ready?** → [Start with QUICKSTART.md](QUICKSTART.md)
