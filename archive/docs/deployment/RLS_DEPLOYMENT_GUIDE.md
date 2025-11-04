# 🚀 RLS DEPLOYMENT GUIDE

**Status**: ⏳ Ready to deploy (environment configuration needed)

---

## ⚠️ ENVIRONMENT CONFIGURATION REQUIRED

The RLS deployment script needs database connection strings for each environment.

### What You Need

The script expects one of these environment variables:

```bash
# For development
DATABASE_URL_DEV="postgresql://user:password@host:port/database"

# For preview/staging
DATABASE_URL_PREVIEW="postgresql://user:password@host:port/database"

# For production
DATABASE_URL_PROD="postgresql://user:password@host:port/database"
```

---

## 📋 OPTION 1: Use Existing DATABASE_URL (Quick)

If you have `DATABASE_URL` already set in your `.env` file, you can deploy to that environment:

```bash
# Load your .env file
source .env

# Deploy using the main DATABASE_URL (typically your dev/staging database)
psql "$DATABASE_URL" < database/sql/migrations/001_enable_rls_comprehensive_v2.sql

# Verify
psql "$DATABASE_URL" << 'EOF'
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public';
EOF
```

**Expected Output**: Should show ~41 policies

---

## 📋 OPTION 2: Set Environment-Specific URLs

### Step 1: Get Your Database URLs

You need your Supabase database connection strings. These should be in your `.env` file or Supabase dashboard.

**Format**: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres`

### Step 2: Set Environment Variables

Create a file: `.env.deployment`

```bash
# Development/Staging Database
DATABASE_URL_DEV="postgresql://postgres:YOUR_PASSWORD@your-project.supabase.co:5432/postgres"

# Preview Database (if different)
DATABASE_URL_PREVIEW="postgresql://postgres:YOUR_PASSWORD@your-preview-project.supabase.co:5432/postgres"

# Production Database
DATABASE_URL_PROD="postgresql://postgres:YOUR_PASSWORD@your-prod-project.supabase.co:5432/postgres"
```

### Step 3: Load and Deploy

```bash
# Load environment variables
source .env.deployment

# Deploy to preview
./scripts/database/deploy-rls.sh preview

# Verify
./scripts/database/verify-rls.sh preview
```

---

## 📋 OPTION 3: Direct Deployment (Recommended for Testing)

If you want to test the RLS deployment without the wrapper script:

### Step 1: Check Your Current DATABASE_URL

```bash
# Source your .env
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
source .env

# Check if DATABASE_URL is set
echo $DATABASE_URL
```

### Step 2: Deploy Directly

```bash
# Deploy RLS migration
psql "$DATABASE_URL" -f database/sql/migrations/001_enable_rls_comprehensive_v2.sql

# Or using Supabase CLI if you have it
# supabase db push
```

### Step 3: Verify Deployment

```bash
# Count RLS policies
psql "$DATABASE_URL" -c "SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public';"

# List all policies
psql "$DATABASE_URL" -c "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;"

# Check helper functions
psql "$DATABASE_URL" -c "SELECT proname FROM pg_proc WHERE proname LIKE '%tenant_context%';"
```

**Expected Results**:
- ✅ ~41 RLS policies
- ✅ Policies on tables: agents, consultations, messages, user_agents, etc.
- ✅ Helper functions: set_tenant_context, get_tenant_context, clear_tenant_context

---

## 🔍 QUICK DATABASE URL CHECK

Let me help you verify your database configuration:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Check if DATABASE_URL exists in .env
grep "DATABASE_URL" .env | head -3

# Check Supabase configuration
grep "SUPABASE" .env | head -5
```

---

## ✅ RECOMMENDED APPROACH FOR YOUR SETUP

Based on your project structure, I recommend:

### 1. **Use Your Existing Supabase Database** (Simplest)

You likely have a `DATABASE_URL` or `SUPABASE_URL` already configured. Let's use that:

```bash
# Navigate to project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Load environment
source .env

# Deploy RLS directly
psql "$DATABASE_URL" -f database/sql/migrations/001_enable_rls_comprehensive_v2.sql
```

### 2. **Or Use Supabase MCP Connector** (What You Used Before)

Since you successfully deployed to dev using the MCP connector:

```bash
# The MCP connector already deployed to your dev database
# You saw this working in Day 2

# To deploy to production, use the same approach with production credentials
```

---

## 🎯 NEXT STEPS - CHOOSE YOUR PATH

### Path A: Direct SQL Deployment (Recommended)

```bash
# 1. Navigate to project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# 2. Source your environment
source .env

# 3. Deploy
psql "$DATABASE_URL" -f database/sql/migrations/001_enable_rls_comprehensive_v2.sql

# 4. Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
```

### Path B: Configure Environment Variables

```bash
# 1. Set environment variables for preview/production
export DATABASE_URL_PREVIEW="your-preview-database-url"
export DATABASE_URL_PROD="your-production-database-url"

# 2. Deploy using script
./scripts/database/deploy-rls.sh preview
./scripts/database/deploy-rls.sh production

# 3. Verify
./scripts/database/verify-rls.sh preview
./scripts/database/verify-rls.sh production
```

### Path C: Use Supabase Dashboard (Visual)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `database/sql/migrations/001_enable_rls_comprehensive_v2.sql`
4. Paste and run in SQL Editor
5. Verify in Database → Policies section

---

## 📊 WHAT YOU DEPLOYED IN DEV

**From Day 2**: You already deployed RLS to your **dev environment** using the Supabase MCP connector.

**Status**: ✅ Dev has 41 RLS policies active

**What's Left**: 
- ⏳ Deploy to preview (if you have a separate preview database)
- ⏳ Deploy to production database

---

## 💡 RECOMMENDED IMMEDIATE ACTION

Since you already deployed to dev successfully, let's verify what you have:

```bash
# Check your current .env for database URLs
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
cat .env | grep -E "(DATABASE_URL|SUPABASE_URL|SUPABASE_DB)" | head -10
```

**Then I can help you**:
1. Confirm what's already deployed
2. Identify your production database URL
3. Deploy to production with the right command

---

## 🚨 IMPORTANT NOTE

**You may have already completed this!**

On Day 2, you deployed RLS to your development database via the Supabase MCP connector. 

**If your "dev" database IS your production database**, then you're already done! ✅

Let's verify what you have deployed and where your databases are.

---

## 🎯 ACTION REQUIRED FROM YOU

**Please provide**:

1. Do you have separate databases for dev, preview, and production?
   - OR is your "dev" database actually your production database?

2. What does your `.env` file show for database connections?

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
cat .env | grep -i "database\|supabase" | grep -v "PASSWORD" | grep -v "#"
```

Run this command and share the output (with sensitive values redacted), then I can provide the exact commands for your setup!

---

**CURRENT STATUS**: ⏳ **Waiting for environment configuration**

**NEXT**: Verify your database setup, then deploy to production ✅

