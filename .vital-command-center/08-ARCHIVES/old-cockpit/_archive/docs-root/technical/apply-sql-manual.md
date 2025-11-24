# Manual SQL Application Guide

## VITAL Expert Database Setup

Since there are migration conflicts, we'll apply the SQL directly through the Supabase dashboard.

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your "VITAL" project (Reference ID: xazinxsiglqokwfmogyk)

### Step 2: Open SQL Editor
1. Navigate to "SQL Editor" in the left sidebar
2. Click "New query"

### Step 3: Apply Migrations in Order

#### Migration 1: Complete Cloud Migration
Copy and paste the contents of `supabase/migrations/20251008000004_complete_cloud_migration.sql` and run it.

#### Migration 2: Seed Agents
Copy and paste the contents of `supabase/migrations/20251008000005_seed_agents.sql` and run it.

#### Migration 3: Clean Policies
Copy and paste the contents of `supabase/migrations/20251008000006_clean_policies.sql` and run it.

### Step 4: Verify Setup
After running all three migrations, verify that:
1. The `agents` table has 21 records
2. The `profiles` table exists
3. All policies are created without errors

### Step 5: Update Vercel Environment Variables
Use these values in your Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes
```

### Step 6: Configure Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Set Site URL to your Vercel production URL
3. Add redirect URLs:
   - `https://your-app.vercel.app/dashboard`
   - `https://your-app.vercel.app/auth/callback`
4. Enable Email authentication

### Step 7: Deploy to Production
```bash
vercel --prod
```

## Troubleshooting

If you encounter any errors:
1. Check the Supabase logs in the dashboard
2. Verify all tables were created successfully
3. Ensure policies are applied without conflicts
4. Test the authentication flow after deployment
