# Add Missing Tables to Remote Database

## Quick Start

**Run this SQL in Supabase SQL Editor to add all missing tables at once:**

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
2. Click "SQL Editor" in left sidebar
3. Click "New Query"

### Step 2: Run the SQL
Copy the entire content from:
```
database/sql/add_missing_tables.sql
```

Or run it in sections below.

---

## Tables Being Added

### 1. ✅ conversations
**Purpose:** Store chat conversations between users and agents

**Features:**
- Links to tenant, user, and agent
- Status tracking (active, archived, deleted)
- Last message timestamp for sorting
- Full RLS policies for tenant isolation

**Key Columns:**
- `tenant_id` - Tenant isolation
- `user_id` - Conversation owner
- `agent_id` - Which agent (can be null for multi-agent)
- `title` - Conversation name
- `status` - active/archived/deleted
- `last_message_at` - For sorting by recency

### 2. ✅ agent_tools
**Purpose:** Link agents to their available tools

**Features:**
- Many-to-many relationship between agents and tools
- Enable/disable tools per agent
- Priority ordering
- Custom configuration per agent-tool pair

**Key Columns:**
- `agent_id` - Which agent
- `tool_id` - Which tool
- `enabled` - Is this tool active?
- `config` - Custom configuration JSON
- `priority` - Execution order

### 3. ✅ organizational_roles
**Purpose:** Define roles within organizational structure

**Features:**
- Links to departments
- Seniority levels
- Skills and responsibilities tracking
- Hierarchical organization support

**Key Columns:**
- `name` - Role title
- `slug` - URL-friendly identifier
- `department_id` - Which department
- `level` - executive/senior/mid/junior/entry
- `responsibilities` - Array of duties
- `required_skills` - Array of skills

### 4. ✅ business_functions
**Purpose:** Define business capabilities and functions

**Features:**
- Hierarchical structure (parent-child)
- Categorization (core, support, strategic, operational)
- Key activities and metrics
- Links to agents and roles

**Key Columns:**
- `name` - Function name
- `slug` - URL-friendly identifier
- `category` - core/support/strategic/operational
- `parent_function_id` - For hierarchy
- `key_activities` - What this function does
- `success_metrics` - How to measure success

### 5. ✅ user_memory
**Purpose:** Enhanced user memory and personalization

**Features:**
- Different memory types (preference, context, fact, goal, history)
- Confidence scoring
- Expiration support
- Vector embeddings for semantic search
- Source tracking

**Key Columns:**
- `user_id` - Which user
- `tenant_id` - Tenant isolation
- `memory_type` - preference/context/fact/goal/history
- `key` - Memory identifier
- `value` - Memory content
- `confidence_score` - How confident (0-1)
- `embedding` - Vector for semantic search
- `expires_at` - Optional expiration

---

## Security (RLS Policies)

All tables include Row Level Security:

### conversations
- ✅ Users see only conversations in their tenant
- ✅ Users can only create/edit/delete their own conversations

### agent_tools
- ✅ Anyone can view enabled tools
- ✅ Authenticated users can manage

### organizational_roles
- ✅ Public read access
- ✅ Authenticated users can manage

### business_functions
- ✅ Public read access
- ✅ Authenticated users can manage

### user_memory
- ✅ Users see only their own memory
- ✅ Strict isolation by user_id and tenant_id

---

## Features Included

### 🔄 Auto-Update Timestamps
All tables have `updated_at` triggers that automatically update when rows change.

### 🔍 Optimized Indexes
Strategic indexes on:
- Foreign keys for fast joins
- Status/type columns for filtering
- Timestamp columns for sorting
- Search fields for queries

### 🔐 Tenant Isolation
Where applicable:
- `tenant_id` foreign keys
- RLS policies enforcing tenant boundaries
- Indexes for fast tenant filtering

---

## After Running SQL

### Verify Tables Were Created:

```sql
SELECT
  table_name,
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE table_name = t.table_name
   AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'conversations',
    'agent_tools',
    'organizational_roles',
    'business_functions',
    'user_memory'
  )
ORDER BY table_name;
```

**Expected Output:**
```
agent_tools              | 8
business_functions       | 10
conversations           | 10
organizational_roles     | 10
user_memory             | 14
```

### Verify RLS Policies:

```sql
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN (
  'conversations',
  'agent_tools',
  'organizational_roles',
  'business_functions',
  'user_memory'
)
ORDER BY tablename, policyname;
```

You should see multiple policies per table.

---

## What This Enables

### ✅ Chat Functionality
- Store conversation history
- Link messages to conversations
- Track conversation metadata
- Support multi-tenant isolation

### ✅ Tool Management
- Assign tools to agents dynamically
- Enable/disable per agent
- Configure tool parameters
- Track tool usage

### ✅ Organizational Structure
- Map agents to roles and functions
- Define reporting hierarchies
- Track skills and responsibilities
- Support org chart visualization

### ✅ User Personalization
- Remember user preferences
- Store conversation context
- Track user goals and facts
- Enable semantic memory search

---

## Integration with Existing Schema

These tables integrate with:
- ✅ `agents` - via agent_id foreign keys
- ✅ `tenants` - via tenant_id for isolation
- ✅ `tools` - via agent_tools junction table
- ✅ `departments` - via organizational_roles
- ✅ `profiles` / `auth.users` - for user relationships
- ✅ `messages` - via conversation_id

---

## Next Steps After Running SQL

1. **Verify creation:**
   ```bash
   # Run verification query in Supabase
   ```

2. **Test conversations API:**
   - Create a test conversation
   - Verify RLS works
   - Test tenant isolation

3. **Populate organizational data:**
   - Add business functions
   - Define organizational roles
   - Link to departments

4. **Configure agent tools:**
   - Link agents to tools
   - Set configurations
   - Test tool execution

5. **Update frontend:**
   - API routes for conversations
   - UI for org structure
   - Memory management interface

---

## Migration Script Location

**Full SQL:**
```
database/sql/add_missing_tables.sql
```

**Run this file in Supabase SQL Editor** - it includes all tables, indexes, RLS policies, and triggers.
