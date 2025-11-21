# 🚀 UC_RA_001 Execution Guide

## ✅ Files Ready

1. **`UC_RA_001.sql`** - Clean, single-file seed script
2. **`execute_UC_RA_001_supabase.sh`** - Execution script using Supabase CLI

---

## 🎯 **RECOMMENDED: Execute Using Supabase CLI**

### Step 1: Navigate to the seeds directory
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"
```

### Step 2: Execute the script
```bash
./execute_UC_RA_001_supabase.sh
```

This will:
- Use your linked Supabase project
- Execute `UC_RA_001.sql`
- Show verification output

---

## 📊 Expected Output

You should see:
```
=========================================
UC_RA_001: FDA Software Classification
=========================================

📁 Executing: UC_RA_001.sql

NOTICE:  ✓ Using tenant_id: <uuid>
NOTICE:  
NOTICE:  ========================================
NOTICE:  UC_RA_001: FDA Software Classification
NOTICE:  ========================================
NOTICE:  Tasks:              6
NOTICE:  Agent Assignments:  11
NOTICE:  Persona Assignments: 7
NOTICE:  Tool Assignments:   3
NOTICE:  RAG Assignments:    5
NOTICE:  ========================================
NOTICE:  ✓ UC_RA_001 seeded successfully!

✅ Execution complete!
```

---

## 🔧 Alternative: Use Supabase Studio SQL Editor

If the CLI doesn't work, you can use the web interface:

1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql
2. Open `UC_RA_001.sql` in your editor
3. Copy the entire contents
4. Paste into the SQL editor
5. Click "Run"

---

## ❓ Troubleshooting

### Error: "Project not linked"
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
supabase link --project-ref xazinxsiglqokwfmogyk
```

### Error: "Tenant not found"
The seed script expects a tenant with slug `'digital-health-startup'`. 
Check if it exists:
```sql
SELECT id, slug, name FROM tenants WHERE slug = 'digital-health-startup';
```

If it doesn't exist, you'll need to create it or update the script with your actual tenant slug.

---

## 🎯 Next Steps After Success

Once UC_RA_001 executes successfully:
1. I'll convert the remaining 9 RA use cases to the same format
2. We'll create a master execution script for all 10
3. You'll be able to seed all Regulatory Affairs use cases at once

---

## 🚀 Try it now!

Run:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"
./execute_UC_RA_001_supabase.sh
```

Let me know what happens! 🎉

