# 🔧 Supabase Connection Diagnostic Tool

**Created**: November 23, 2025  
**Status**: ✅ **Ready to Use**

---

## 🎯 **What Was Created**

I've built a comprehensive Supabase diagnostic tool to help you debug the connection issue.

### **Files Created**:

1. ✅ **API Endpoint**: `apps/vital-system/src/app/api/debug/supabase/route.ts`
   - Tests all aspects of Supabase connectivity
   - Checks environment variables
   - Tests database connection
   - Queries agents table
   - Tests service role key

2. ✅ **Visual Dashboard**: `apps/vital-system/src/app/debug/supabase/page.tsx`
   - Beautiful UI showing all test results
   - Real-time diagnostics
   - Error messages and recommendations
   - Quick fix guide

---

## 🚀 **How to Use**

### **Step 1: Open the Diagnostic Page**

Navigate to:
```
http://localhost:3000/debug/supabase
```

### **Step 2: Review the Results**

The page will automatically run 5 tests:

1. ✅ **Environment Variables Test**
   - Checks if NEXT_PUBLIC_SUPABASE_URL is set
   - Checks if NEXT_PUBLIC_SUPABASE_ANON_KEY is set
   - Checks if SUPABASE_SERVICE_ROLE_KEY is set

2. ✅ **Anon Client Test**
   - Creates Supabase client with anon key
   - Verifies client initialization

3. ✅ **Database Connection Test**
   - Tests basic connectivity to database
   - Checks if agents table exists

4. ✅ **Agents Query Test**
   - Attempts to query agents table
   - Shows count and sample data
   - Detects RLS issues

5. ✅ **Service Role Test** (Optional)
   - Tests service role key if available
   - Verifies admin access

### **Step 3: Follow Recommendations**

The tool will provide specific recommendations based on what failed.

---

## 📊 **What You'll See**

### **Overall Status Card**:
```
┌─────────────────────────────────┐
│ Overall Status: HEALTHY/FAILED  │
├─────────────────────────────────┤
│ Total Tests: 5                  │
│ Passed: X                       │
│ Failed: X                       │
│ Warnings: X                     │
└─────────────────────────────────┘
```

### **Individual Test Results**:
Each test shows:
- ✅ Status icon (pass/fail/checking)
- 📄 Detailed JSON output
- 🔍 Error messages if failed

### **Errors Section** (if any):
Lists all errors encountered with details

### **Warnings Section** (if any):
Lists warnings (e.g., "No agents in database")

### **Recommendations Section**:
Step-by-step fixes for issues found

---

## 🎨 **Visual Example**

```
┌──────────────────────────────────────────────┐
│ 🔍 ENVIRONMENT VARIABLES          ✅ PASSED  │
├──────────────────────────────────────────────┤
│ {                                            │
│   "NEXT_PUBLIC_SUPABASE_URL": "✅ Set"       │
│   "NEXT_PUBLIC_SUPABASE_ANON_KEY": "✅ Set"  │
│   "SUPABASE_SERVICE_ROLE_KEY": "✅ Set"      │
│ }                                            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 🔌 DATABASE CONNECTION            ✅ PASSED  │
├──────────────────────────────────────────────┤
│ {                                            │
│   "connection": "✅ Connected"                │
│   "http_status": 200                         │
│ }                                            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 📊 AGENTS QUERY                   ⚠️  FAILED │
├──────────────────────────────────────────────┤
│ {                                            │
│   "error": "permission denied for table..."  │
│   "code": "42501"                            │
│ }                                            │
└──────────────────────────────────────────────┘
```

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: Missing Environment Variables**

**Error**: `❌ NEXT_PUBLIC_SUPABASE_URL: Missing`

**Solution**:
```bash
# Create .env.local file
cd apps/vital-system
nano .env.local

# Add these lines:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Restart Next.js
npm run dev
```

### **Issue 2: RLS Blocking Access**

**Error**: `permission denied for table agents`

**Solution**:
1. Go to Supabase Dashboard
2. Navigate to Authentication → Policies
3. Enable policies for agents table:
   ```sql
   CREATE POLICY "Enable read access for authenticated users" ON agents
   FOR SELECT TO authenticated
   USING (true);
   ```

### **Issue 3: Table Doesn't Exist**

**Error**: `relation "agents" does not exist`

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run your migration files
3. Or manually create the table

### **Issue 4: No Agents in Database**

**Warning**: `No agents found in database`

**Solution**:
1. Seed database with agents:
   ```sql
   INSERT INTO agents (name, description, status) VALUES
   ('Test Agent', 'A test agent', 'active');
   ```
2. Or run your seed scripts

---

## 📋 **API Endpoint Details**

### **Endpoint**: `GET /api/debug/supabase`

### **Response Format**:
```json
{
  "timestamp": "2025-11-23T...",
  "status": "healthy|degraded|failed",
  "tests": {
    "environment_variables": {
      "status": "passed",
      "details": {...}
    },
    "anon_client": {...},
    "database_connection": {...},
    "agents_query": {...},
    "service_role": {...}
  },
  "errors": [],
  "warnings": [],
  "recommendations": [],
  "summary": {
    "total_tests": 5,
    "passed": 4,
    "failed": 1,
    "warnings": 0
  }
}
```

---

## 🎯 **Next Steps**

### **Step 1**: Open the diagnostic page
```
http://localhost:3000/debug/supabase
```

### **Step 2**: Review the results
- Check which tests passed/failed
- Read error messages
- Follow recommendations

### **Step 3**: Fix the issues
- Update environment variables if needed
- Fix RLS policies if needed
- Create agents table if needed
- Seed data if needed

### **Step 4**: Re-run the tests
- Click "Run Tests" button
- Verify all tests pass
- Once healthy, go back to `/agents`

### **Step 5**: Test Knowledge Graph
- Once agents load successfully
- Select an agent
- Click "Knowledge Graph" tab
- Enjoy the visualization!

---

## ✅ **Success Criteria**

When everything is working, you should see:

```
✅ Overall Status: HEALTHY

Tests Passed: 5/5
- ✅ Environment Variables
- ✅ Anon Client  
- ✅ Database Connection
- ✅ Agents Query (X agents found)
- ✅ Service Role

No errors
No warnings
```

Then you can safely use:
- `/agents` page (all views)
- Knowledge Graph tab
- Agent details modal

---

## 🔧 **Advanced Debugging**

### **Check Raw API Response**:
```bash
curl http://localhost:3000/api/debug/supabase | jq
```

### **Check Supabase Direct**:
```javascript
// In browser console
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY');
const { data, error } = await supabase.from('agents').select('*').limit(5);
console.log({ data, error });
```

### **Check Environment in Browser**:
```javascript
// In browser console (only public vars visible)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

---

## 📞 **Still Having Issues?**

If the diagnostic tool shows all tests passing but agents still won't load:

1. **Check browser console** for client-side errors
2. **Check Next.js terminal** for server-side errors  
3. **Check Supabase logs** in dashboard
4. **Try the API directly**: `curl http://localhost:3000/api/agents-crud`

---

## 🎉 **Summary**

You now have a powerful diagnostic tool at:
```
http://localhost:3000/debug/supabase
```

This will help you:
- ✅ Identify connection issues
- ✅ Test environment setup
- ✅ Verify database access
- ✅ Get specific recommendations
- ✅ Fix issues quickly

**Go ahead and open it now to see what's wrong!** 🚀

---

**Created by**: Assistant  
**Date**: November 23, 2025  
**Status**: Production-ready diagnostic tool

