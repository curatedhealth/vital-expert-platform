# ✅ SKILLS SEED FILE - READY FOR MANUAL EXECUTION

## 📄 File Ready

**Location:** `services/ai-engine/database/data/skills/FINAL_seed_all_58_skills.sql`

## 🎯 What's Included

- **58 Total Skills** (16 VITAL + 42 Awesome Claude)
- **Schema-Compatible** with your existing database
- **Uses `complexity_score`** (1-10) which auto-sets `complexity_level` via trigger
- **Idempotent** - Safe to run multiple times (uses WHERE NOT EXISTS)

## 🚀 How to Run

### Option 1: Using psql (Recommended)

```bash
# Set your database connection
export DATABASE_URL="your_database_url_here"

# Or source from .env.local
source "/Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local"

# Run the seed script
cd "/Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine"
psql "$DATABASE_URL" -f database/data/skills/FINAL_seed_all_58_skills.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy the entire contents of `FINAL_seed_all_58_skills.sql`
4. Paste and click **Run**

## 📊 What Gets Loaded

### VITAL Command Center Skills (16)
- **Document Processing** (4): DOCX, PDF, PPTX, XLSX
- **Creative & Design** (4): Art Generation, Brand Guidelines, Canvas Design, Theme Factory
- **Development & Code** (5): Frontend Design, MCP Server, Skill Creator, Web Artifacts, Testing
- **Communication** (3): Internal Comms, Slack GIF, Templates

### Awesome Claude Skills (42)
- **Scientific & Research** (4): Databases, Lab Integrations, Python Packages, Analysis
- **Development & Code** (8): HTML Artifacts, TDD, Git Tools, AWS, etc.
- **Data & Analysis** (2): Root Cause Tracing, CSV Summarization
- **Writing & Research** (5): Article Extraction, Content Writing, Brainstorming, etc.
- **Learning & Knowledge** (2): Knowledge Networks, Iteration
- **Media & Content** (4): YouTube, Video, Images, EPUB
- **Collaboration** (5): Git, Code Review, Testing, Meetings, Linear
- **Security & Testing** (4): Fuzzing, Defense-in-Depth, Playwright, Debugging
- **Utility & Automation** (4): File Organization, Invoices, Skill Creators

## ✅ Verification

After running, verify with these queries:

```sql
-- Count loaded skills
SELECT COUNT(*) 
FROM skills 
WHERE implementation_type IS NOT NULL;
-- Expected: 58+ skills

-- See skills by source
SELECT 
    metadata->>'source' as source,
    COUNT(*) as count
FROM skills 
WHERE implementation_type IS NOT NULL
GROUP BY metadata->>'source';

-- See complexity distribution
SELECT 
    complexity_level,
    complexity_score,
    COUNT(*) as count
FROM skills 
WHERE implementation_type IS NOT NULL
GROUP BY complexity_level, complexity_score
ORDER BY complexity_score;

-- View sample skills
SELECT 
    name,
    category,
    complexity_level,
    complexity_score
FROM skills
WHERE implementation_type IS NOT NULL
ORDER BY complexity_score DESC
LIMIT 10;
```

## 🔍 Key Schema Info

### Complexity Mapping (Auto via Trigger)
```
Score 1-3  → basic
Score 4-5  → intermediate
Score 6-7  → advanced
Score 8-10 → expert
```

### Required Fields
- `name` - Skill name
- `slug` - URL-friendly identifier (must be unique)
- `description` - What the skill does
- `implementation_type` - prompt | tool | workflow | agent_graph
- `implementation_ref` - Path or URL to skill implementation
- `category` - Skill category
- `complexity_score` - Integer 1-10 (auto-sets complexity_level)
- `is_active` - Boolean (all set to true)
- `metadata` - JSONB with source and URLs

## 📋 What Happens After Seeding

Once skills are loaded, you can:

1. **Assign to Agents:**
   ```sql
   -- Use the assign_skills_to_agents.sql script
   psql "$DATABASE_URL" -f database/data/skills/assign_skills_to_agents.sql
   ```

2. **Load to Neo4j & Pinecone:**
   ```bash
   python scripts/seed_all_skills_to_databases.py
   ```

3. **Use in Agent Graphs:**
   - Create skill nodes in agent_graph_nodes
   - Reference skills by slug or ID
   - Execute via skill node compiler

4. **Test in UI:**
   - View in Knowledge Graph tab
   - Search semantically via Pinecone
   - Explore relationships via Neo4j

## ⚠️ Important Notes

1. **Idempotent:** Safe to run multiple times - only inserts new skills
2. **No Duplicates:** Uses `WHERE NOT EXISTS` to prevent duplicates by slug
3. **Trigger Active:** complexity_level auto-populated from complexity_score
4. **Transaction:** Wrapped in BEGIN/COMMIT for atomicity

## 🐛 Troubleshooting

**Problem:** "null value in column slug violates not-null constraint"
- **Solution:** Each skill has a unique slug defined in the seed script

**Problem:** "check constraint skills_complexity_level_check"
- **Solution:** Script uses complexity_score (integer) which auto-sets complexity_level via trigger

**Problem:** "duplicate key value violates unique constraint"
- **Solution:** Script uses WHERE NOT EXISTS - skill already exists, this is safe to ignore

## 📞 Next Steps

After running this seed file, see:
- `README_SKILLS_SEEDING.md` for complete pipeline guide
- `assign_skills_to_agents.sql` for agent assignments
- `seed_all_skills_to_databases.py` for Neo4j + Pinecone loading

---

**Ready to run!** Copy the command above and execute when ready. 🚀


