# VITAL Path - Supabase Cloud Deployment Guide

**Issue Resolved**: Fixed the `must be owner of relation users` error and `organization_id` column issues.

---

## 🚀 **Quick Deployment (5 minutes)**

### Step 1: Deploy Main Schema
1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
2. **Go to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Copy and Paste**: Copy the entire contents of `supabase/migrations/20250101_basic_schema.sql`
4. **Execute**: Click "Run" to execute the migration
5. **Verify**: Check that all 18 tables are created successfully

**Note**: The automated deployment script requires a custom `exec_sql` function that doesn't exist on Supabase Cloud by default. Manual deployment via the Dashboard is the recommended approach.

### Step 2: Set Up User Profile Creation (Optional)
1. **Go to Authentication Settings**: Authentication → Settings → User Management
2. **Enable Profile Creation**: Look for "Create user profile on signup" option
3. **Or Use Manual Function**: The `create_profile_for_user()` function is available for manual profile creation

---

## 🔧 **Alternative: Automated Deployment**

If you prefer to use the deployment script:

```bash
# Run the deployment script
node scripts/deploy-to-supabase-cloud.js
```

**Note**: The script now uses direct REST API calls instead of the `exec_sql` function.

---

## ✅ **What's Fixed**

### ❌ **Previous Issue**
```
ERROR: 42501: must be owner of relation users
```

### ✅ **Solution Applied**
1. **Removed Auth Trigger**: Removed the problematic trigger on `auth.users` table
2. **Created Helper Functions**: Added `create_profile_for_user()` and `sync_all_user_profiles()` functions
3. **Updated Deployment Script**: Improved error handling and API calls

---

## 📋 **Verification Checklist**

After deployment, verify these components:

### ✅ **Core Tables** (18 tables)
- [ ] `profiles` - User profiles
- [ ] `organizations` - Organization management  
- [ ] `user_organizations` - User-org relationships
- [ ] `agents` - AI agents
- [ ] `llm_providers` - LLM provider configurations
- [ ] `llm_models` - LLM model definitions
- [ ] `llm_usage_logs` - Usage tracking
- [ ] `knowledge_domains` - Knowledge categorization
- [ ] `knowledge_documents` - Document storage
- [ ] `document_embeddings` - Vector embeddings
- [ ] `chat_sessions` - Chat conversations
- [ ] `chat_messages` - Individual messages
- [ ] `workflows` - Workflow definitions
- [ ] `workflow_executions` - Workflow runs
- [ ] `analytics_events` - Analytics tracking
- [ ] `performance_metrics` - Performance data
- [ ] `audit_logs` - Audit trail
- [ ] `compliance_records` - Compliance tracking

### ✅ **Extensions**
- [ ] `uuid-ossp` - UUID generation
- [ ] `pgcrypto` - Cryptographic functions
- [ ] `vector` - Vector embeddings

### ✅ **Functions**
- [ ] `handle_new_user()` - User profile creation
- [ ] `create_profile_for_user()` - Manual profile creation
- [ ] `sync_all_user_profiles()` - Sync existing users
- [ ] `update_updated_at_column()` - Timestamp updates

### ✅ **RLS Policies**
- [ ] All tables have RLS enabled
- [ ] Basic "allow all for authenticated users" policies active

---

## 🎯 **Next Steps After Deployment**

### 1. **Test Connection**
```bash
# Test the application connection
npm run dev
```

### 2. **Create Test User** (Optional)
```sql
-- Use the helper function to create a profile
SELECT public.create_profile_for_user(
  'user-uuid-here',
  'test@example.com',
  'Test User'
);
```

### 3. **Sync Existing Users** (If any exist)
```sql
-- Sync all existing users to create profiles
SELECT public.sync_all_user_profiles();
```

---

## 🚨 **Troubleshooting**

### If you still get permission errors:
1. **Check Service Role**: Ensure you're using the service role key, not the anon key
2. **Verify Project Access**: Make sure you have admin access to the Supabase project
3. **Try Manual Deployment**: Use the Supabase Dashboard SQL Editor instead of scripts

### If tables don't appear:
1. **Refresh the Dashboard**: Sometimes the UI needs a refresh
2. **Check for Errors**: Look for any error messages in the SQL Editor
3. **Verify Schema**: Check that you're looking in the `public` schema

---

## 📞 **Support**

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
- **SQL Editor**: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql
- **Documentation**: https://supabase.com/docs

---

## 🎉 **Success!**

Once deployed, your VITAL Path application will be fully connected to Supabase Cloud with:
- ✅ Complete database schema
- ✅ User authentication
- ✅ Row-level security
- ✅ Vector embeddings support
- ✅ Performance optimizations

**The application is now ready for production!** 🚀
