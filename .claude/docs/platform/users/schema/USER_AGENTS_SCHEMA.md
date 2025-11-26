# user_agents Table - Complete Schema Documentation

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: Schema Reference

---

## Overview

The `user_agents` table is the core of the user-agent relationship system. It stores how users interact with AI agents, including customizations, usage statistics, quality metrics, and organizational preferences.

## Table Structure

### Basic Information

```sql
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    UNIQUE(user_id, agent_id)
);
```

### Complete Column List

| # | Column | Type | Default | Nullable | Category | Description |
|---|--------|------|---------|----------|----------|-------------|
| 1 | `id` | UUID | gen_random_uuid() | NO | Core | Primary key |
| 2 | `user_id` | UUID | - | NO | Core | Foreign key to auth.users |
| 3 | `agent_id` | UUID | - | NO | Core | Foreign key to agents |
| 4 | `original_agent_id` | UUID | NULL | YES | Core | Original agent if this is a copy |
| 5 | `is_user_copy` | BOOLEAN | false | YES | Core | Whether this is a user's copy |
| 6 | `custom_name` | TEXT | NULL | YES | Customization | User's custom name for agent |
| 7 | `custom_description` | TEXT | NULL | YES | Customization | User's custom description |
| 8 | `custom_avatar` | TEXT | NULL | YES | Customization | Custom avatar URL/emoji |
| 9 | `custom_color` | TEXT | NULL | YES | Customization | Custom UI color |
| 10 | `custom_system_prompt` | TEXT | NULL | YES | Customization | Custom system prompt |
| 11 | `custom_temperature` | NUMERIC | NULL | YES | Customization | Custom AI temperature |
| 12 | `custom_max_tokens` | INTEGER | NULL | YES | Customization | Custom max tokens |
| 13 | `is_favorite` | BOOLEAN | false | YES | Organization | Star/favorite status |
| 14 | `is_pinned` | BOOLEAN | false | YES | Organization | Pinned to top |
| 15 | `folder` | TEXT | NULL | YES | Organization | Folder/category name |
| 16 | `tags` | TEXT[] | NULL | YES | Organization | User-defined tags |
| 17 | `sort_order` | INTEGER | 0 | YES | Organization | Custom sort order |
| 18 | `display_position` | TEXT | NULL | YES | Organization | Where to display (sidebar/dashboard/hidden) |
| 19 | `usage_count` | INTEGER | 0 | YES | Usage | Total number of uses |
| 20 | `message_count` | INTEGER | 0 | YES | Usage | Total messages sent |
| 21 | `conversation_count` | INTEGER | 0 | YES | Usage | Number of conversations |
| 22 | `success_count` | INTEGER | 0 | YES | Usage | Successful interactions |
| 23 | `error_count` | INTEGER | 0 | YES | Usage | Failed interactions |
| 24 | `user_rating` | NUMERIC(3,2) | NULL | YES | Quality | User's 1-5 star rating |
| 25 | `quality_score` | NUMERIC(3,2) | NULL | YES | Quality | Calculated quality score |
| 26 | `last_rating_at` | TIMESTAMPTZ | NULL | YES | Quality | When last rated |
| 27 | `avg_response_time_ms` | INTEGER | NULL | YES | Performance | Average response time |
| 28 | `total_tokens_used` | BIGINT | 0 | YES | Performance | Total tokens consumed |
| 29 | `total_cost_usd` | NUMERIC(10,2) | 0 | YES | Performance | Total cost in USD |
| 30 | `added_at` | TIMESTAMPTZ | NOW() | YES | Timestamps | When user added agent |
| 31 | `first_used_at` | TIMESTAMPTZ | NULL | YES | Timestamps | First interaction |
| 32 | `last_used_at` | TIMESTAMPTZ | NULL | YES | Timestamps | Last interaction |
| 33 | `created_at` | TIMESTAMPTZ | NOW() | NO | Timestamps | Record created |
| 34 | `updated_at` | TIMESTAMPTZ | NOW() | NO | Timestamps | Record updated |
| 35 | `archived_at` | TIMESTAMPTZ | NULL | YES | Timestamps | When archived |
| 36 | `deleted_at` | TIMESTAMPTZ | NULL | YES | Timestamps | Soft delete timestamp |
| 37 | `is_active` | BOOLEAN | true | YES | State | Active/inactive |
| 38 | `is_enabled` | BOOLEAN | true | YES | State | Enabled/disabled |
| 39 | `is_visible` | BOOLEAN | true | YES | State | Visible in UI |
| 40 | `status` | TEXT | 'active' | YES | State | Status: active/paused/archived/disabled |
| 41 | `settings` | JSONB | '{}' | YES | Config | Agent-specific settings |
| 42 | `preferences` | JSONB | '{}' | YES | Config | User preferences |
| 43 | `ui_config` | JSONB | '{}' | YES | Config | UI configuration |
| 44 | `notifications_enabled` | BOOLEAN | true | YES | Notifications | Enable notifications |
| 45 | `notification_settings` | JSONB | '{"email":true,"in_app":true}' | YES | Notifications | Notification config |
| 46 | `last_conversation_id` | UUID | NULL | YES | Context | Last conversation reference |
| 47 | `notes` | TEXT | NULL | YES | Context | User's private notes |
| 48 | `quick_notes` | TEXT | NULL | YES | Context | Quick notes/reminders |
| 49 | `metadata` | JSONB | '{}' | YES | Metadata | Additional metadata |
| 50 | `source` | TEXT | NULL | YES | Metadata | How added: store/custom/imported |
| 51 | `source_details` | JSONB | '{}' | YES | Metadata | Source details |
| 52 | `is_shared` | BOOLEAN | false | YES | Collaboration | Shared with others |
| 53 | `shared_with` | UUID[] | NULL | YES | Collaboration | Array of user IDs |
| 54 | `team_id` | UUID | NULL | YES | Collaboration | Team/org ID |
| 55 | `share_settings` | JSONB | '{}' | YES | Collaboration | Sharing configuration |

## Constraints

### Primary Key
```sql
PRIMARY KEY (id)
```

### Foreign Keys
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
FOREIGN KEY (original_agent_id) REFERENCES agents(id) ON DELETE SET NULL
```

### Unique Constraints
```sql
UNIQUE(user_id, agent_id) -- User can only add each agent once
```

### Check Constraints
```sql
CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 5))
CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5))
CHECK (status IN ('active', 'paused', 'archived', 'disabled'))
CHECK (display_position IN ('sidebar', 'dashboard', 'hidden'))
CHECK (source IN ('store', 'custom', 'imported', 'template', 'recommended'))
```

## Indexes (23 Total)

### Core Indexes
```sql
-- Basic lookups
idx_user_agents_user_id ON (user_id) WHERE deleted_at IS NULL
idx_user_agents_agent_id ON (agent_id) WHERE deleted_at IS NULL
idx_user_agents_original_agent_id ON (original_agent_id) WHERE original_agent_id IS NOT NULL

-- Active agents
idx_user_agents_user_active ON (user_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL
```

### Organization Indexes
```sql
-- Favorites and pinned
idx_user_agents_favorites ON (user_id, is_favorite, sort_order) WHERE is_favorite = TRUE AND deleted_at IS NULL
idx_user_agents_pinned ON (user_id, is_pinned, sort_order) WHERE is_pinned = TRUE AND deleted_at IS NULL

-- Folders and tags
idx_user_agents_folder ON (user_id, folder) WHERE folder IS NOT NULL AND deleted_at IS NULL
idx_user_agents_tags ON (tags) USING GIN WHERE deleted_at IS NULL

-- Status
idx_user_agents_status ON (user_id, status) WHERE deleted_at IS NULL
```

### Usage Tracking Indexes
```sql
-- Recently used
idx_user_agents_last_used ON (user_id, last_used_at DESC) WHERE deleted_at IS NULL

-- Most used
idx_user_agents_usage_count ON (user_id, usage_count DESC) WHERE deleted_at IS NULL

-- Recently added
idx_user_agents_added_at ON (user_id, added_at DESC) WHERE deleted_at IS NULL
```

### Quality Indexes
```sql
-- Ratings
idx_user_agents_rating ON (user_id, user_rating DESC) WHERE user_rating IS NOT NULL AND deleted_at IS NULL

-- Quality scores
idx_user_agents_quality ON (user_id, quality_score DESC) WHERE quality_score IS NOT NULL AND deleted_at IS NULL
```

### Collaboration Indexes
```sql
-- Team agents
idx_user_agents_team ON (team_id, user_id) WHERE team_id IS NOT NULL AND deleted_at IS NULL

-- Shared agents
idx_user_agents_shared ON (user_id, is_shared) WHERE is_shared = TRUE AND deleted_at IS NULL
```

### JSONB Indexes
```sql
-- Fast JSONB queries
idx_user_agents_settings ON (settings) USING GIN
idx_user_agents_preferences ON (preferences) USING GIN
idx_user_agents_metadata ON (metadata) USING GIN
```

### Soft Delete Indexes
```sql
-- Archived/deleted
idx_user_agents_archived ON (archived_at) WHERE archived_at IS NOT NULL
idx_user_agents_deleted ON (deleted_at) WHERE deleted_at IS NOT NULL
```

### Composite Indexes
```sql
-- Common query patterns
idx_user_agents_user_folder_order ON (user_id, folder, sort_order) WHERE deleted_at IS NULL
idx_user_agents_user_status_last_used ON (user_id, status, last_used_at DESC) WHERE deleted_at IS NULL
```

## Row Level Security (RLS)

### Policies

```sql
-- Users can view their own agents
CREATE POLICY "Users can view their own agent relationships" 
    ON user_agents FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert their own agents
CREATE POLICY "Users can insert their own agent relationships" 
    ON user_agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own agents
CREATE POLICY "Users can update their own agent relationships" 
    ON user_agents FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own agents
CREATE POLICY "Users can delete their own agent relationships" 
    ON user_agents FOR DELETE 
    USING (auth.uid() = user_id);

-- Team members can view shared agents
CREATE POLICY "Team members can view shared agents" 
    ON user_agents FOR SELECT 
    USING (
        is_shared = TRUE 
        AND (
            auth.uid() = ANY(shared_with)
            OR team_id IN (
                SELECT team_id 
                FROM user_role_assignments 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access to user_agents" 
    ON user_agents FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
```

## Triggers

### Auto-Update Timestamp
```sql
CREATE TRIGGER user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_agents_updated_at();
```

### Auto-Calculate Quality Score
```sql
CREATE TRIGGER user_agents_auto_quality
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_quality_score();
```

## Helper Functions

### 1. add_user_agent()
```sql
SELECT add_user_agent(
    'user-uuid'::uuid,
    'agent-uuid'::uuid,
    'store',           -- source
    'My Agents'        -- folder
);
```

### 2. track_agent_usage()
```sql
SELECT track_agent_usage(
    'user-uuid'::uuid,
    'agent-uuid'::uuid,
    true,              -- success
    1500,              -- tokens
    0.02,              -- cost
    1200               -- response_time_ms
);
```

### 3. soft_delete_user_agent()
```sql
SELECT soft_delete_user_agent(
    'user-uuid'::uuid,
    'agent-uuid'::uuid
);
```

### 4. restore_user_agent()
```sql
SELECT restore_user_agent(
    'user-uuid'::uuid,
    'agent-uuid'::uuid
);
```

### 5. calculate_agent_quality_score()
```sql
SELECT calculate_agent_quality_score(
    4.5,               -- user_rating
    100,               -- usage_count
    95,                -- success_count
    5                  -- error_count
);
```

## Views

### 1. user_agents_with_details
Complete agent information with calculated metrics
```sql
SELECT * FROM user_agents_with_details 
WHERE user_id = 'your-user-id';
```

### 2. user_favorite_agents
Quick access to favorited agents
```sql
SELECT * FROM user_favorite_agents 
WHERE user_id = 'your-user-id';
```

### 3. user_popular_agents
Most used agents
```sql
SELECT * FROM user_popular_agents 
WHERE user_id = 'your-user-id'
LIMIT 10;
```

### 4. user_recent_agents
Recently used agents
```sql
SELECT * FROM user_recent_agents 
WHERE user_id = 'your-user-id'
LIMIT 10;
```

## Common Query Patterns

### Get User's Agents
```sql
SELECT * FROM user_agents 
WHERE user_id = $1 
    AND deleted_at IS NULL
ORDER BY is_pinned DESC, sort_order, last_used_at DESC;
```

### Get Favorite Agents
```sql
SELECT * FROM user_agents 
WHERE user_id = $1 
    AND is_favorite = TRUE 
    AND deleted_at IS NULL
ORDER BY sort_order;
```

### Get Agents by Folder
```sql
SELECT * FROM user_agents 
WHERE user_id = $1 
    AND folder = $2 
    AND deleted_at IS NULL
ORDER BY sort_order;
```

### Search by Tags
```sql
SELECT * FROM user_agents 
WHERE user_id = $1 
    AND tags && ARRAY['medical', 'urgent']
    AND deleted_at IS NULL;
```

### Get Usage Statistics
```sql
SELECT 
    COUNT(*) as total_agents,
    SUM(usage_count) as total_uses,
    AVG(user_rating) as avg_rating,
    SUM(total_tokens_used) as total_tokens,
    SUM(total_cost_usd) as total_cost
FROM user_agents
WHERE user_id = $1 AND deleted_at IS NULL;
```

## Storage Estimates

| Users | Agents per User | Storage per Row | Total Storage |
|-------|-----------------|-----------------|---------------|
| 1,000 | 10 | ~2 KB | 20 MB |
| 10,000 | 10 | ~2 KB | 200 MB |
| 100,000 | 10 | ~2 KB | 2 GB |
| 1,000,000 | 10 | ~2 KB | 20 GB |

**Note**: JSONB fields compress well; actual storage is typically 20-30% less.

## Performance Considerations

### Fast Queries (< 10ms)
- ✅ Single user's agents
- ✅ Favorites/pinned agents
- ✅ Folder-based queries
- ✅ Status filtering

### Medium Queries (10-50ms)
- ⚠️ Tag searches (GIN index)
- ⚠️ JSONB queries
- ⚠️ Complex joins with agents table

### Slow Queries (> 50ms)
- ❌ Full table scans (don't do this)
- ❌ Unindexed JSONB queries
- ❌ Multiple aggregations without indexes

## Best Practices

### Do's ✅
- Always filter by `user_id` first
- Use `deleted_at IS NULL` for active records
- Leverage indexes (check with EXPLAIN)
- Use views for complex queries
- Update counters via `track_agent_usage()`
- Use soft delete, not hard delete

### Don'ts ❌
- Don't scan entire table
- Don't ignore RLS policies
- Don't update `updated_at` manually (trigger handles it)
- Don't forget to invalidate caches
- Don't skip indexes on JSONB queries

## Migration Path

From basic table to full schema:
1. **Phase 1**: Core fields (id, user_id, agent_id)
2. **Phase 2**: Customization (custom_name, etc.)
3. **Phase 3**: Organization (folders, tags)
4. **Phase 4**: Analytics (usage tracking)
5. **Phase 5**: Full feature set (collaboration, etc.)

## Related Tables

- **agents**: Agent definitions
- **user_profiles**: User information
- **user_ratings**: Detailed ratings
- **user_memory**: AI memory
- **llm_usage_logs**: Detailed usage logs
- **quota_tracking**: Usage limits

---

**Next**: [API Documentation](../api/USER_AGENTS_API_REFERENCE.md)  
**See Also**: [Complete User Schema](USER_DATA_SCHEMA_COMPLETE.md) | [Normalization Guide](DATABASE_NORMALIZATION_GUIDE.md)

