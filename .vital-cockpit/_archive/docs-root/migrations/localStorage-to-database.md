# localStorage to Database Migration Guide

## Overview

This guide documents the migration from localStorage-based persistence to database-backed storage for user conversations and agent relationships.

**Migration Date:** January 2025  
**Status:** ✅ Complete

---

## What Was Migrated

### 1. User Conversations

**Before:**
- Stored in `localStorage` under key `vital-conversations`
- Lost when user clears browser data
- Not synced across devices

**After:**
- Stored in `user_conversations` table in Supabase
- Persistent across devices
- Automatic sync

### 2. User Agents

**Before:**
- Stored in `localStorage` under key `user-chat-agents`
- Lost when user clears browser data
- Not synced across devices

**After:**
- Stored in `user_agents` table in Supabase
- Persistent across devices
- Automatic sync

---

## Migration Process

### Automatic Migration

The migration happens automatically on first user login:

1. **User logs in** → User ID available
2. **Check localStorage** → If data exists, trigger migration
3. **Migrate data** → Batch insert into database
4. **Clear localStorage** → Remove old data (on success)
5. **Verify** → Check migration result

### Code Example

```typescript
// In ask-expert/page.tsx or chat/page.tsx
useEffect(() => {
  if (user?.id && typeof window !== 'undefined' && !migrationCompleted.current) {
    const hasLocalStorage = localStorage.getItem('vital-conversations');
    if (hasLocalStorage && !migrationCompleted.current) {
      migrateMutation.mutate(undefined, {
        onSuccess: () => {
          migrationCompleted.current = true;
          console.log('✅ Migration complete');
        },
        onError: (error) => {
          console.error('❌ Migration failed:', error);
        },
      });
    }
  }
}, [user?.id, migrateMutation]);
```

---

## Database Schema

### `user_conversations` Table

```sql
CREATE TABLE user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  mode TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `user_agents` Table

```sql
CREATE TABLE user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  original_agent_id UUID REFERENCES agents(id),
  is_user_copy BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Data Transformation

### Conversations Migration

**localStorage Format:**
```json
[
  {
    "id": "conv-1",
    "title": "My Conversation",
    "messages": [...],
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

**Database Format:**
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "title": "My Conversation",
  "messages": [...],
  "created_at": "2025-01-29T00:00:00Z",
  "updated_at": "2025-01-29T00:00:00Z"
}
```

**Transformation Rules:**
1. `id` → Generate new UUID
2. `createdAt` → Convert to ISO string → `created_at`
3. `updatedAt` → Convert to ISO string → `updated_at`
4. Add `user_id` from authenticated user
5. Preserve all other fields

### User Agents Migration

**localStorage Format:**
```json
[
  {
    "id": "agent-1",
    "name": "Agent Name",
    ...
  }
]
```

**Database Format:**
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "agent_id": "agent-1",
  "original_agent_id": null,
  "is_user_copy": true,
  "added_at": "2025-01-29T00:00:00Z"
}
```

**Transformation Rules:**
1. Extract `agent.id` → `agent_id`
2. Set `is_user_copy: true` (from localStorage = copy)
3. Generate new UUID for relationship record
4. Add `user_id` from authenticated user
5. Preserve agent metadata in `metadata` JSONB field

---

## Verification

### Check Migration Status

```typescript
// After migration
const conversations = await conversationsService.getUserConversations(userId);
const userAgents = await userAgentsService.getUserAgents(userId);

console.log(`Migrated ${conversations.length} conversations`);
console.log(`Migrated ${userAgents.length} agents`);
```

### Database Queries

```sql
-- Check conversations
SELECT COUNT(*) FROM user_conversations WHERE user_id = 'user-uuid';

-- Check user agents
SELECT COUNT(*) FROM user_agents WHERE user_id = 'user-uuid';

-- Check recent migrations
SELECT * FROM user_conversations 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

---

## Rollback Procedures

### If Migration Fails

1. **Data is preserved** in localStorage (not deleted on failure)
2. **User can retry** migration manually
3. **Check logs** for error details

### Manual Rollback

If needed, you can restore from localStorage:

```typescript
// NOT RECOMMENDED - Only for emergency rollback
const localStorageData = localStorage.getItem('vital-conversations-backup');
if (localStorageData) {
  // Restore logic here
}
```

---

## Testing Checklist

- [x] Migration runs automatically on login
- [x] Data correctly transformed
- [x] localStorage cleared on success
- [x] Migration idempotent (can run multiple times safely)
- [x] Error handling works
- [x] Large datasets handled (100+ conversations)
- [x] Concurrent migrations prevented
- [x] Migration status tracked

---

## Troubleshooting

### Migration Not Running

**Symptoms:** localStorage still has data, no database records

**Solutions:**
1. Check browser console for errors
2. Verify user is authenticated
3. Check network tab for API calls
4. Verify database tables exist

### Partial Migration

**Symptoms:** Some data migrated, some not

**Solutions:**
1. Check migration result for errors
2. Review `errorDetails` in result
3. Retry migration manually
4. Check database constraints

### Performance Issues

**Symptoms:** Migration takes too long

**Solutions:**
1. Use batch operations (already implemented)
2. Increase batch size if needed
3. Process in background
4. Show progress to user

---

## Best Practices

1. **Always backup** localStorage before migration
2. **Test migration** with sample data first
3. **Monitor success rate** in production
4. **Handle edge cases** (malformed data, large datasets)
5. **Provide user feedback** during migration
6. **Log everything** for debugging

---

## Changelog

### v1.0.0 (2025-01-29)
- Initial migration implementation
- Automatic migration on login
- Batch operations support
- Error handling and logging
- Verification procedures

