# Quick Start: Load Personas for Any Business Function

**Time to Complete**: 15-30 minutes
**Prerequisites**: Python 3, PostgreSQL access, JSON persona files

---

## 1️⃣ Setup Organizational Structure (5 min)

```bash
# Copy template
cp database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_org_structure_TEMPLATE.sql \
   database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_YOUR_FUNCTION_org.sql

# Edit the file and replace:
# - {{TENANT_ID}} with your tenant UUID
# - {{FUNCTION_NAME}} with "Your Function Name" (e.g., "Market Access")
# - {{FUNCTION_SLUG}} with "your-function-slug" (e.g., "market-access")
# - {{FUNCTION_DESCRIPTION}} with a brief description
# - Add your departments and roles

# Run it
PGPASSWORD='flusd9fqEb4kkTJ1' psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_YOUR_FUNCTION_org.sql
```

---

## 2️⃣ Transform JSON to SQL (5-10 min)

```bash
# For each JSON file, run:
python3 scripts/transform_personas_json_to_sql_GENERIC.py \
  --input "path/to/your_personas_part1.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/your_function_personas_part1.sql" \
  --function-slug "your-function-slug" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 1 \
  --total-parts 3
```

**Repeat for part 2 and part 3** (change `--part-number` and file names)

---

## 3️⃣ Create Loading Script (2 min)

```bash
# Copy template
cp database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/LOAD_ALL_PERSONAS_TEMPLATE.sh \
   database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_YOUR_FUNCTION_PERSONAS.sh

# Edit and replace:
# - FUNCTION_NAME="Your Function Name"
# - FUNCTION_SLUG="your_function"
# - TOTAL_PERSONAS=50 (your actual count)
# - PART1_COUNT=20 (your actual count)
# - PART2_COUNT=20 (your actual count)
# - PART3_COUNT=10 (your actual count)
# - File names to match your SQL files

# Make executable
chmod +x database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_YOUR_FUNCTION_PERSONAS.sh
```

---

## 4️⃣ Load All Personas (5 min)

```bash
cd database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content
./LOAD_ALL_YOUR_FUNCTION_PERSONAS.sh
```

**Expected Output**:
- ✅ Part 1 loaded successfully
- ✅ Part 2 loaded successfully
- ✅ Part 3 loaded successfully
- ✅ All personas loaded successfully!

---

## 5️⃣ Verify (1 min)

```bash
PGPASSWORD='flusd9fqEb4kkTJ1' psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" -c "
SELECT COUNT(*) as persona_count
FROM personas p
JOIN org_functions f ON f.id = p.function_id
WHERE f.slug = 'your-function-slug';
"
```

---

## ✅ Done!

Your personas are now loaded and ready to use.

### Next Steps:
- Query personas in Supabase SQL Editor
- Export to JSON for use in your app
- Create dashboards and reports

---

## 📚 Need Help?

See the complete guide: [README_PERSONA_LOADING_PROCESS.md](README_PERSONA_LOADING_PROCESS.md)
