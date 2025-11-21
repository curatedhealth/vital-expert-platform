# 🚀 EXECUTION GUIDE: Regulatory Affairs Use Cases

## ❌ Issue: Supabase CLI doesn't support direct SQL execution

The `supabase db execute --file` command doesn't exist in the Supabase CLI.

---

## ✅ SOLUTION OPTIONS

### **Option 1: Supabase SQL Editor (Recommended - Easiest)**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy and paste the content of each SQL file (starting with UC_RA_001.sql)
5. Click **"Run"** (or press `Cmd+Enter`)
6. Repeat for all 10 files

**Files to execute in order:**
```
UC_RA_001.sql
UC_RA_002.sql
UC_RA_003.sql
UC_RA_004.sql
UC_RA_005.sql
UC_RA_006.sql
UC_RA_007.sql
UC_RA_008.sql
UC_RA_009.sql
UC_RA_010.sql
```

---

### **Option 2: Install PostgreSQL Client (`psql`)**

Install PostgreSQL tools which include `psql`:

#### On macOS (using Homebrew):
```bash
brew install postgresql@16
```

#### Then execute files:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Get your database connection string from Supabase Dashboard
# Settings > Database > Connection String (Direct connection)

# Execute each file
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres" -f UC_RA_001.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres" -f UC_RA_002.sql
# ... repeat for all 10 files
```

---

### **Option 3: Use Migrations (Copy to migrations folder)**

Convert seed files to migrations that Supabase CLI can handle:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Copy each SQL file as a migration
cp database/sql/seeds/2025/UC_RA_001.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_uc_ra_001.sql

# Then push migrations
supabase db push
```

---

### **Option 4: Python Script (if you have Supabase Python client)**

```bash
# Install Supabase Python client
pip install supabase

# Run the Python script
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"
python3 execute_ra_usecases.py
```

---

### **Option 5: Node.js Script**

Create a file `execute_seeds.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://xazinxsiglqokwfmogyk.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'
);

const files = [
  'UC_RA_001.sql',
  'UC_RA_002.sql',
  // ... all 10 files
];

async function executeSqlFile(filename) {
  const sql = fs.readFileSync(filename, 'utf8');
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) throw error;
  return data;
}

// Execute all files...
```

---

## 🎯 RECOMMENDED APPROACH

**For immediate execution**: Use **Option 1 (SQL Editor)** - it's the fastest and doesn't require any installations.

**For automated/repeated execution**: Install PostgreSQL client tools (**Option 2**) and use `psql`.

---

## 📝 Files Location

All 10 SQL files are ready in:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/
```

---

## ✅ What Each File Does

Each file:
1. Creates a temporary `session_config` table
2. Inserts the use case, workflow(s), and tasks
3. Sets up dependencies between tasks
4. (For detailed files) Assigns agents, personas, tools, and RAGs
5. Runs verification queries to confirm insertion
6. Outputs success message with counts

---

## 🔍 Verify Execution

After running each file, you should see output like:
```
========================================
UC_RA_001: FDA Software Classification (SaMD)
========================================
Tasks: 6, Agents: 11, Personas: 7, Tools: 3, RAGs: 5
========================================
✓ UC_RA_001 seeded successfully!
```

You can also verify in Supabase Dashboard:
- Go to **Table Editor**
- Check tables: `dh_use_case`, `dh_workflow`, `dh_task`
- You should see 10 new use cases, multiple workflows, and 68 total tasks

---

## 💡 Troubleshooting

**If you get "tenant not found"**:
- Make sure the tenant `digital-health-startup` exists in your `tenants` table
- You can check with: `SELECT * FROM tenants WHERE slug = 'digital-health-startup';`

**If you get foreign key errors**:
- Make sure foundation data is seeded first (agents, personas, tools, RAG sources)
- Make sure the domain 'RA' exists in `dh_domain` table

---

## 📞 Need Help?

If you encounter any issues, share the error message and I can help debug!

