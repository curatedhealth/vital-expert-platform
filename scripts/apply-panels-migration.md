# Apply Panels Migration to Supabase

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251126000001_create_panels_table.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration
6. Repeat for `supabase/migrations/20251126000002_ensure_profiles_table.sql` if needed

## Option 2: Using Supabase CLI

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations
supabase db push
```

## Option 3: Direct SQL Connection

If you have the database connection string:

```bash
# Using psql
psql "your-connection-string" -f supabase/migrations/20251126000001_create_panels_table.sql
psql "your-connection-string" -f supabase/migrations/20251126000002_ensure_profiles_table.sql
```

## Verify Migration

After applying, verify the tables exist:

```sql
-- Check panels table
SELECT COUNT(*) FROM public.panels;
-- Should return 6 (the 6 panel templates)

-- Check profiles table
SELECT COUNT(*) FROM public.profiles;
```

## After Migration

Once the migration is applied, you can remove the fallback configuration from `.env.local` lines 182-184.

