# 🧪 Postman API Testing Guide - VITAL.expert

## Overview

This guide helps you set up and test the VITAL.expert Supabase API using Postman.

**Files Created**:
- `VITAL_AI_Platform_Complete.postman_collection.json` - 30+ API endpoints
- `VITAL_AI_Platform_Supabase.postman_environment.json` - Supabase environment variables

---

## 1. Import into Postman

### Step 1: Open Postman
- Download from https://www.postman.com/downloads/ if needed
- Or use Postman web app

### Step 2: Import Collection
1. Click **Import** (top left)
2. Select **File** tab
3. Choose `VITAL_AI_Platform_Complete.postman_collection.json`
4. Click **Import**

### Step 3: Import Environment
1. Click **Import** again
2. Select `VITAL_AI_Platform_Supabase.postman_environment.json`
3. Click **Import**

### Step 4: Activate Environment
1. Click environment dropdown (top right)
2. Select **"VITAL AI - Supabase Production"**
3. Verify `base_url` and `anon_key` are set

---

## 2. Collection Structure

The collection has 9 folders with 30+ endpoints:

### 1️⃣ Agents (5 endpoints)
- Get All Agents
- Count Agents (Expected: 254)
- Filter by Role
- Search by Name
- Get Agent with Capabilities (with JOIN)

### 2️⃣ Personas (4 endpoints)
- Get All Personas
- Count Personas (Expected: 335)
- Filter by Industry
- Search by Job Title

### 3️⃣ Jobs-to-be-Done (4 endpoints)
- Get All JTBDs
- Count JTBDs (Expected: 338)
- Filter by Functional Area
- Search by Keyword

### 4️⃣ Workflows (4 endpoints)
- Get All Workflows
- Count Workflows
- Filter by Status
- Get Workflow with Tasks (with JOIN)

### 5️⃣ Tasks (3 endpoints)
- Get All Tasks
- Count Tasks
- Filter by Type

### 6️⃣ Expert Consultations (3 endpoints) - **RLS Protected**
- Get My Consultations
- Count My Consultations
- Get Consultation with Messages

### 7️⃣ Panel Discussions (2 endpoints) - **RLS Protected**
- Get My Panels
- Count My Panels

### 8️⃣ Knowledge Base (2 endpoints)
- Get All Knowledge Sources
- Search Knowledge

### 9️⃣ Health Checks (2 endpoints)
- API Health Check
- Get All Table Counts

---

## 3. Quick Start Testing

### Test 1: API Health Check ✅
**Endpoint**: `Health Checks > API Health Check`

**Expected Result**:
```json
[
  {
    "id": "some-uuid"
  }
]
```

**Status**: Should return `200 OK`

---

### Test 2: Count Agents ✅
**Endpoint**: `Agents > Count Agents`

**Expected Result**:
```json
[
  {
    "count": 254
  }
]
```

**What it means**:
- `254` = All agents imported successfully ✅
- `0` = No data imported yet (import data first)
- Other number = Partial import

---

### Test 3: Get Agents ✅
**Endpoint**: `Agents > Get All Agents`

**Expected Result**:
```json
[
  {
    "id": "uuid-here",
    "name": "Dr. Sarah Chen",
    "role": "expert",
    "specialty": "Digital Health",
    "description": "...",
    "created_at": "2025-11-13T..."
  },
  ...
]
```

**Status**: Should return `200 OK` with array of 10 agents

---

### Test 4: Count Personas ✅
**Endpoint**: `Personas > Count Personas`

**Expected Result**:
```json
[
  {
    "count": 335
  }
]
```

---

### Test 5: Count JTBDs ✅
**Endpoint**: `Jobs-to-be-Done > Count JTBDs`

**Expected Result**:
```json
[
  {
    "count": 338
  }
]
```

---

## 4. Advanced Testing

### Test Filtering

**Example**: Filter agents by role = "expert"
```
GET {{base_url}}/agents?role=eq.expert&select=id,name,role,specialty&limit=10
```

**Postman Request**: `Agents > Filter by Role`

**Expected**: Only agents with `role = "expert"`

---

### Test Search (ILIKE)

**Example**: Search agents with "Dr" in name
```
GET {{base_url}}/agents?name=ilike.*Dr*&select=id,name,specialty
```

**Postman Request**: `Agents > Search by Name`

**Expected**: Agents like "Dr. Sarah Chen", "Dr. Michael Rodriguez", etc.

---

### Test JOINs

**Example**: Get agents with their capabilities
```
GET {{base_url}}/agents?select=id,name,agent_capabilities(capability_name,proficiency_level)&limit=3
```

**Postman Request**: `Agents > Get Agent with Capabilities`

**Expected**:
```json
[
  {
    "id": "uuid",
    "name": "Dr. Sarah Chen",
    "agent_capabilities": [
      {
        "capability_name": "Clinical Research",
        "proficiency_level": "expert"
      },
      {
        "capability_name": "Data Analysis",
        "proficiency_level": "advanced"
      }
    ]
  }
]
```

---

### Test RLS (Row Level Security)

**⚠️ Note**: RLS-protected endpoints require authentication

**Without Authentication**:
```
GET {{base_url}}/expert_consultations?select=*
```
**Result**: Returns `[]` (empty array) because no user is authenticated

**With Authentication** (after you implement auth):
1. Login via your app
2. Copy the JWT token
3. In Postman environment, set `auth_token` variable
4. Update request header: `Authorization: Bearer {{auth_token}}`
5. Now you'll see only YOUR consultations

**RLS Protected Tables**:
- expert_consultations
- expert_messages
- panel_discussions
- panel_messages
- workflow_executions
- audit_log

---

## 5. Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 OK | Success | ✅ Request worked |
| 201 Created | Resource created | ✅ POST succeeded |
| 204 No Content | Success, no body | ✅ DELETE succeeded |
| 400 Bad Request | Invalid query | Check query syntax |
| 401 Unauthorized | No auth token | Add authentication |
| 403 Forbidden | RLS blocked | Check RLS policies |
| 404 Not Found | Invalid endpoint | Check table name |
| 406 Not Acceptable | Invalid select | Fix select syntax |
| 500 Server Error | Database error | Check server logs |

---

## 6. Supabase Query Syntax

### Basic SELECT
```
?select=*                           # All columns
?select=id,name,email               # Specific columns
?select=id,name&limit=10            # With limit
?select=id,name&offset=20&limit=10  # Pagination
```

### Filtering
```
?name=eq.John                       # Exact match
?age=gt.30                          # Greater than
?age=lt.50                          # Less than
?age=gte.30                         # Greater than or equal
?age=lte.50                         # Less than or equal
?name=neq.John                      # Not equal
?name=like.*John*                   # SQL LIKE
?name=ilike.*john*                  # Case-insensitive LIKE
?age=in.(30,40,50)                  # IN clause
```

### Multiple Filters
```
?role=eq.expert&specialty=eq.Digital Health   # AND
?or=(role.eq.expert,role.eq.advisor)          # OR
```

### Ordering
```
?order=created_at.desc              # Descending
?order=name.asc                     # Ascending
?order=created_at.desc,name.asc     # Multiple
```

### Counting
```
?select=count                       # Count records
Header: Prefer: count=exact
```

### JOINs (Foreign Keys)
```
?select=id,name,related_table(column1,column2)
?select=id,name,agent_capabilities(*)
```

---

## 7. Postman Variables

The environment has these variables:

| Variable | Value | Usage |
|----------|-------|-------|
| `base_url` | https://bomltkhixeatxuoxmolq.supabase.co/rest/v1 | API base URL |
| `anon_key` | eyJhbG... | Anon/public key |
| `service_key` | (empty) | Admin key (DO NOT COMMIT) |
| `auth_token` | (empty) | User JWT after login |
| `agent_id` | (empty) | Sample agent UUID |
| `persona_id` | (empty) | Sample persona UUID |
| `jtbd_id` | (empty) | Sample JTBD UUID |
| `workflow_id` | (empty) | Sample workflow UUID |

**How to use**:
1. Run "Get All Agents" request
2. Copy an `id` from response
3. Go to Environment (top right)
4. Set `agent_id` = copied UUID
5. Now you can use `{{agent_id}}` in other requests

---

## 8. Common Testing Scenarios

### Scenario 1: Verify Data Import ✅

**Run these requests in order**:
1. `Agents > Count Agents` → Expect 254
2. `Personas > Count Personas` → Expect 335
3. `Jobs-to-be-Done > Count JTBDs` → Expect 338
4. `Workflows > Count Workflows` → Check your workflow count
5. `Tasks > Count Tasks` → Check your task count

**If counts are 0**: Data hasn't been imported yet. Run the import script first.

---

### Scenario 2: Test RLS Policies ✅

**Without Auth**:
1. `Expert Consultations > Get My Consultations` → Expect `[]` (empty)
2. `Panel Discussions > Get My Panels` → Expect `[]` (empty)

**Why empty?** No user authenticated, so RLS blocks all records.

**With Auth** (requires app integration):
1. Login via your Next.js app
2. Copy JWT token from localStorage/cookies
3. Set `auth_token` in Postman environment
4. Re-run requests → Should see your records only

---

### Scenario 3: Test Search & Filter ✅

**Search for "Digital" in JTBDs**:
1. Go to `Jobs-to-be-Done > Search by Keyword`
2. Click **Send**
3. Review results containing "digital transformation", "digital health", etc.

**Filter Personas by Industry = Healthcare**:
1. Go to `Personas > Filter by Industry`
2. Click **Send**
3. All results should have `"industry": "Healthcare"`

---

### Scenario 4: Test JOINs ✅

**Get Workflows with Tasks**:
1. Go to `Workflows > Get Workflow with Tasks`
2. Click **Send**
3. Should return workflows with nested `tasks` array

**Expected Structure**:
```json
[
  {
    "id": "workflow-uuid",
    "name": "Patient Onboarding",
    "tasks": [
      {
        "id": "task-uuid-1",
        "name": "Verify Insurance",
        "type": "llm_prompt"
      },
      {
        "id": "task-uuid-2",
        "name": "Schedule Appointment",
        "type": "api_call"
      }
    ]
  }
]
```

---

## 9. Troubleshooting

### Issue: "No records returned"

**Possible Causes**:
1. ❌ Data not imported yet
   - **Fix**: Run `import_production_data.py` script
2. ❌ RLS blocking access
   - **Fix**: Use authenticated request or check RLS policies
3. ❌ Wrong filter syntax
   - **Fix**: Check Supabase query syntax above

---

### Issue: 401 Unauthorized

**Cause**: Missing or invalid API key

**Fix**:
1. Check environment is selected (top right)
2. Verify `anon_key` is set in environment
3. Check request headers include:
   - `apikey: {{anon_key}}`
   - `Authorization: Bearer {{anon_key}}`

---

### Issue: 406 Not Acceptable

**Cause**: Invalid `select` syntax

**Examples**:
- ❌ `?select=id name` (missing comma)
- ✅ `?select=id,name`

- ❌ `?select=related_table.*` (wrong JOIN syntax)
- ✅ `?select=related_table(*)`

---

### Issue: 400 Bad Request

**Cause**: Invalid filter syntax

**Examples**:
- ❌ `?name=John` (missing operator)
- ✅ `?name=eq.John`

- ❌ `?age=>30` (wrong operator format)
- ✅ `?age=gt.30`

---

## 10. Performance Monitoring

### Fixed Performance Monitoring Script ✅

**File**: `monitor_performance_simple.sql`

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `monitor_performance_simple.sql`
3. Click **Run**

**What it checks**:
- ✅ Average query time (<200ms target)
- ✅ Cache hit ratio (>99% target)
- ✅ Slow queries (>200ms)
- ✅ Table bloat (dead tuples)
- ✅ Index usage
- ✅ Connection statistics

**Status**: ✅ Fixed - No more "tablename does not exist" errors

---

## 11. Next Steps

After testing APIs in Postman:

1. ✅ **Verify all counts match expected**:
   - 254 agents
   - 335 personas
   - 338 JTBDs

2. ✅ **Test all filter types**:
   - Exact match (`eq`)
   - Pattern match (`ilike`)
   - Range (`gt`, `lt`)

3. ✅ **Test all JOIN queries**:
   - Agents with capabilities
   - Workflows with tasks
   - Consultations with messages

4. ✅ **Document any issues**:
   - Missing data
   - Slow queries
   - RLS problems

5. ✅ **Integrate with your app**:
   - Use same query patterns
   - Implement authentication
   - Handle RLS properly

---

## 12. Summary

### What You Have

✅ **Postman Collection**: 30+ endpoints across 9 categories
✅ **Environment File**: Pre-configured for Supabase
✅ **Performance Monitoring**: Fixed SQL script
✅ **Testing Guide**: This comprehensive guide

### Files Created

1. `VITAL_AI_Platform_Complete.postman_collection.json` - Main collection
2. `VITAL_AI_Platform_Supabase.postman_environment.json` - Environment
3. `monitor_performance_simple.sql` - Performance monitoring (fixed)
4. `POSTMAN_TESTING_GUIDE.md` - This guide

### Quick Testing Checklist

- [ ] Import collection into Postman
- [ ] Import environment into Postman
- [ ] Select "VITAL AI - Supabase Production" environment
- [ ] Run "API Health Check" → Should get 200 OK
- [ ] Run "Count Agents" → Should get 254 (or 0 if not imported)
- [ ] Run "Count Personas" → Should get 335 (or 0)
- [ ] Run "Count JTBDs" → Should get 338 (or 0)
- [ ] Test filtering (Filter by Role)
- [ ] Test search (Search by Name)
- [ ] Test JOINs (Get Agent with Capabilities)
- [ ] Run performance monitoring SQL

---

**Last Updated**: 2025-11-13
**Collection Version**: 2.0.0
**Status**: ✅ Ready for Testing
