# How to Run the Critical Domains Migration

## 📋 Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on **SQL Editor** in the left sidebar

2. **Copy the Migration SQL**
   - Open the file: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`
   - Copy ALL the SQL content (Ctrl+A, Ctrl+C)

3. **Paste and Run**
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

---

## 📋 Option 2: Command Line (if you have psql)

```bash
# Connect to Supabase
psql -h [your-supabase-host] -U postgres -d postgres

# Then run:
\i database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

---

## 📋 Option 3: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

---

## ✅ After Running - Verify

Run this in Supabase SQL Editor:

```sql
SELECT * FROM verify_critical_domains_mapping();
```

You should see:
- `digital_health` domain with document/chunk counts
- `regulatory_affairs` domain with document/chunk counts
- Both showing `enterprise_confidential` access policy

