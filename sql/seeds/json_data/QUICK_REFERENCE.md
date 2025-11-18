# JSON Data System - Quick Reference Card

**Status**: ✅ Personas Loaded Successfully

---

## Verify Your Persona Load

```bash
export PGPASSWORD='flusd9fqEb4kkTJ1'
DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

psql "$DB_URL" -f sql/seeds/00_PREPARATION/VERIFY_PERSONA_LOAD.sql
```

---

## Load More Personas

```bash
# 1. Copy template
cp sql/seeds/json_data/02_personas/TEMPLATE_personas.json my_new_personas.json

# 2. Edit file (fill in data)

# 3. Validate
python3 scripts/validate_persona_json.py my_new_personas.json

# 4. Transform to SQL
python3 scripts/transform_persona_json_to_sql.py my_new_personas.json

# 5. Load to database
psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f sql/seeds/03_content/my_new_personas.sql
```

---

## JSON Template Locations

| Content Type | Template Location |
|--------------|-------------------|
| **Personas** | `sql/seeds/json_data/02_personas/TEMPLATE_personas.json` |
| Org Structure | `sql/seeds/json_data/01_org_structure/TEMPLATE_*.json` |
| JTBDs | `sql/seeds/json_data/03_jtbds/TEMPLATE_jtbds.json` |
| Agents | `sql/seeds/json_data/04_agents/TEMPLATE_agents.json` |
| Workflows | `sql/seeds/json_data/05_workflows/TEMPLATE_workflows.json` |
| Prompts | `sql/seeds/json_data/06_prompts/TEMPLATE_prompts.json` |
| Tools | `sql/seeds/json_data/07_tools/TEMPLATE_tools.json` |
| Knowledge | `sql/seeds/json_data/08_knowledge/TEMPLATE_knowledge.json` |
| Strategic Priorities | `sql/seeds/json_data/09_strategic_priorities/TEMPLATE_strategic_priorities.json` |
| Use Cases | `sql/seeds/json_data/10_use_cases/TEMPLATE_use_cases.json` |

---

## Key Files

| File | Purpose |
|------|---------|
| `00_README_FIRST.md` | Quick start guide |
| `README.md` | Complete documentation (464 lines) |
| `SYSTEM_READY.md` | System status and usage |
| `QUICK_REFERENCE.md` | This file |
| `VERIFY_PERSONA_LOAD.sql` | Verification queries |
| `PERSONA_LOAD_SUCCESS.md` | Success guide with examples |

---

## What's Loaded

✅ **Personas** → Main table + 20 junction tables
✅ **Fully Normalized** → NO JSONB anywhere
✅ **Evidence Sources** → All 10 columns working
✅ **VPANES Scoring** → Complete dimensional scores
✅ **Org Structure Links** → Function, department, role

---

## Sample Queries

### Count Personas
```sql
SELECT COUNT(*) FROM personas;
```

### List Personas with Goals
```sql
SELECT p.name, p.title, COUNT(g.id) as goal_count
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
GROUP BY p.id, p.name, p.title;
```

### Get Persona Evidence Sources
```sql
SELECT source_type, citation, sample_size, confidence_level
FROM persona_evidence_sources
WHERE persona_id = (SELECT id FROM personas LIMIT 1);
```

---

## Documentation

- **Complete Guide**: [README.md](README.md)
- **Persona Details**: `/sql/seeds/TEMPLATES/json_templates/README_JSON_TEMPLATES.md`
- **System Overview**: [SYSTEM_READY.md](SYSTEM_READY.md)
- **Success Guide**: `/sql/seeds/00_PREPARATION/PERSONA_LOAD_SUCCESS.md`
- **Project Structure**: `/PROJECT_STRUCTURE_FINAL.md`

---

## Next Steps

1. ✅ **Verify loaded personas** - Run verification queries
2. 🔄 **Load more personas** - Follow workflow above
3. 🔄 **Load other content types** - Use templates (transformation scripts coming)

---

**Version**: 1.0
**Created**: 2025-11-16
**Status**: Production Ready
