# User Management System - Getting Started Guide

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: Guide

---

## Prerequisites

- PostgreSQL database (via Supabase)
- Node.js 18+ (for API)
- psql CLI tool
- Basic SQL knowledge

## Quick Start (5 Minutes)

### Step 1: Deploy the Schema

Run the normalized schema migration:

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path

# Option A: Via Supabase SQL Editor (Recommended)
# 1. Open https://app.supabase.com
# 2. Go to SQL Editor
# 3. Copy contents of scripts/normalized-user-agents-complete.sql
# 4. Click "Run"

# Option B: Via psql
psql $DATABASE_URL -f scripts/normalized-user-agents-complete.sql
```

**Expected Output:**
```
✅ All user_agents columns added successfully
✅ All constraints added successfully
✅ NORMALIZED user_agents TABLE COMPLETE!
Columns: 54 (fully normalized)
Indexes: 23 (optimized for performance)
RLS Policies: 6 (secured)
```

### Step 2: Load Test Data

```bash
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/USER_MANAGEMENT_TEST_DATA.sql
```

**Expected Output:**
```
✅ SEED DATA LOADED SUCCESSFULLY!
Created:
  • 5 test users
  • ~15-20 user-agent relationships
```

### Step 3: Verify Installation

```sql
-- Check table exists
SELECT COUNT(*) FROM user_agents;
-- Should return 15-20

-- Check test users
SELECT email, COUNT(ua.id) as agent_count
FROM user_profiles up
LEFT JOIN user_agents ua ON up.id = ua.user_id
WHERE email LIKE '%@vital.com'
GROUP BY email;
```

## Testing in Your App

### Step 1: Update Frontend Code

The React Query cache invalidation has already been added to your agent store pages:

```typescript
// This is already in your code!
const handleAddAgentToChat = async (agent: AgentsStoreAgent) => {
  // ... add agent via API ...
  
  // Invalidate cache so sidebar refreshes
  queryClient.invalidateQueries({ queryKey: ['user-agents', user.id] });
  
  // Navigate to chat
  router.push('/chat');
};
```

### Step 2: Test Adding an Agent

1. **Navigate to** `/agents` page
2. **Click** "Add to Chat" on any agent card
3. **Wait** for success message: "✅ [Agent Name] has been added to your chat list!"
4. **Automatically redirected** to `/chat` page
5. **Verify** agent appears in "My Agents" sidebar section

### Step 3: Test Features

Try these features:

#### Favorites
```typescript
// Mark as favorite
await supabase
  .from('user_agents')
  .update({ is_favorite: true })
  .eq('user_id', userId)
  .eq('agent_id', agentId);
```

#### Folders
```typescript
// Organize in folder
await supabase
  .from('user_agents')
  .update({ folder: 'Clinical Trials' })
  .eq('user_id', userId)
  .eq('agent_id', agentId);
```

#### Custom Names
```typescript
// Rename agent
await supabase
  .from('user_agents')
  .update({ custom_name: 'My FDA Expert' })
  .eq('user_id', userId)
  .eq('agent_id', agentId);
```

## Common Use Cases

### 1. Get User's Agents with Details

```typescript
const { data: agents } = await supabase
  .from('user_agents_with_details')  // Use the view!
  .select('*')
  .eq('user_id', userId)
  .order('is_pinned', { ascending: false })
  .order('sort_order');
```

### 2. Track Agent Usage

```typescript
// After agent interaction
await supabase.rpc('track_agent_usage', {
  p_user_id: userId,
  p_agent_id: agentId,
  p_success: true,
  p_tokens_used: 1500,
  p_cost_usd: 0.02,
  p_response_time_ms: 1200
});
```

### 3. Get Favorites

```typescript
const { data: favorites } = await supabase
  .from('user_favorite_agents')  // Use the view!
  .select('*')
  .eq('user_id', userId);
```

### 4. Search by Tags

```typescript
const { data: agents } = await supabase
  .from('user_agents')
  .select('*, agents(*)')
  .eq('user_id', userId)
  .overlaps('tags', ['medical', 'urgent']);
```

## API Integration

### Using React Query (Recommended)

```typescript
import { useUserAgents } from '@/lib/hooks/use-user-agents';

function MyComponent() {
  const { 
    data: userAgents,           // User's agents
    isLoading,                  // Loading state
    addAgentAsync,              // Add function
    removeAgentAsync,           // Remove function
    migrateFromLocalStorage     // Migration function
  } = useUserAgents(user?.id);
  
  // Add agent
  const handleAdd = async (agentId: string) => {
    await addAgentAsync({
      agentId,
      options: { source: 'store' }
    });
  };
  
  return (
    <div>
      {userAgents?.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

### Using Helper Functions

```typescript
// Add agent
const { data } = await supabase.rpc('add_user_agent', {
  p_user_id: userId,
  p_agent_id: agentId,
  p_source: 'store',
  p_folder: 'My Agents'
});

// Track usage
await supabase.rpc('track_agent_usage', {
  p_user_id: userId,
  p_agent_id: agentId,
  p_success: true,
  p_tokens_used: 1000
});

// Soft delete
await supabase.rpc('soft_delete_user_agent', {
  p_user_id: userId,
  p_agent_id: agentId
});
```

## Query Optimization

### Use Views for Common Queries

```typescript
// ✅ GOOD: Use pre-joined view
const { data } = await supabase
  .from('user_agents_with_details')
  .select('*')
  .eq('user_id', userId);

// ❌ BAD: Manual join
const { data } = await supabase
  .from('user_agents')
  .select('*, agents(*)')  // Slower!
  .eq('user_id', userId);
```

### Filter Early

```typescript
// ✅ GOOD: Filter on indexed columns first
const { data } = await supabase
  .from('user_agents')
  .select('*')
  .eq('user_id', userId)        // Indexed!
  .eq('is_active', true)         // Indexed!
  .is('deleted_at', null);       // Indexed!

// ❌ BAD: No user filter
const { data } = await supabase
  .from('user_agents')
  .select('*')
  .eq('folder', 'My Folder');    // Full table scan!
```

### Use Aggregations Wisely

```typescript
// ✅ GOOD: Use cached counters
const { data } = await supabase
  .from('user_agents')
  .select('usage_count, total_tokens_used')
  .eq('user_id', userId);

// ❌ BAD: Calculate on every query
const { data } = await supabase
  .from('llm_usage_logs')
  .select('tokens_used')
  .eq('user_id', userId);
// Then SUM in JavaScript - slow!
```

## Debugging

### Check If Agent Was Added

```sql
SELECT * FROM user_agents 
WHERE user_id = 'your-user-id' 
    AND agent_id = 'agent-id';
```

### Check RLS Policies

```sql
-- Should return results if logged in as user
SELECT * FROM user_agents WHERE user_id = auth.uid();

-- Should return empty if not logged in
SELECT * FROM user_agents WHERE user_id = 'someone-elses-id';
```

### Check Indexes Are Used

```sql
EXPLAIN ANALYZE
SELECT * FROM user_agents 
WHERE user_id = 'your-id' 
    AND deleted_at IS NULL;

-- Should show "Index Scan" not "Seq Scan"
```

### View Recent Changes

```sql
-- Recently added agents
SELECT * FROM user_agents 
WHERE added_at > NOW() - INTERVAL '1 hour'
ORDER BY added_at DESC;

-- Recently used agents
SELECT * FROM user_agents 
WHERE last_used_at > NOW() - INTERVAL '1 day'
ORDER BY last_used_at DESC;
```

## Next Steps

1. ✅ Schema deployed
2. ✅ Test data loaded
3. ✅ Test adding agents from UI
4. 📖 Read [Best Practices](best_practices.md)
5. 📖 Review [API Documentation](../api/user_agents_api.md)
6. 🚀 Build your features!

## Need Help?

- 📖 [User Agents Schema](../schema/USER_AGENTS_SCHEMA.md)
- 📖 [Complete User Schema](../schema/USER_DATA_SCHEMA_COMPLETE.md)
- 📖 [API Reference](../api/USER_AGENTS_API_REFERENCE.md)
- 📖 [Database Normalization](../schema/DATABASE_NORMALIZATION_GUIDE.md)

---

**Congratulations!** 🎉 Your user management system is now ready to use!

