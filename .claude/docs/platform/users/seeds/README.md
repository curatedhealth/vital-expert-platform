# Seed Data - User Management System

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: Reference

---

## Overview

This directory contains seed data for testing and development of the user management system. Seed files populate the database with realistic test data.

## Files

| File | Description | Dependencies |
|------|-------------|--------------|
| `USER_MANAGEMENT_TEST_DATA.sql` | Complete test dataset | users, agents |
| `README.md` | This file | None |

## Quick Start

### Load All Seed Data
```bash
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/USER_MANAGEMENT_TEST_DATA.sql
```

### Load Individual Files
```bash
# 1. Users first
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/users.sql

# 2. Then relationships
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/user_agents.sql

# 3. Optional: Memory and ratings
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/user_memory.sql
psql $DATABASE_URL -f .claude/docs/platform/users/seeds/user_ratings.sql
```

## Test Users

The seed data includes 5 test users with different profiles:

| Email | Role | Agents | Description |
|-------|------|--------|-------------|
| alice@vital.com | Clinical Researcher | 8 | Heavy user, all features |
| bob@vital.com | Regulatory Specialist | 5 | Moderate user, FDA focused |
| carol@vital.com | Medical Writer | 3 | Light user, writing tools |
| david@vital.com | New User | 1 | First-time user |
| emma@vital.com | Admin | 12 | Power user, all agents |

## User-Agent Relationships

### Alice (Heavy User)
- **8 agents** with various customizations
- **Folders**: "Clinical Trials", "Regulatory"
- **Tags**: ["urgent", "medical", "fda"]
- **Favorites**: 3 agents pinned
- **Usage**: 150+ interactions

### Bob (Moderate User)
- **5 agents** focused on FDA
- **Folders**: "FDA Projects"
- **High usage** on 2 agents
- **Ratings**: 4.5 star average

### Carol (Light User)
- **3 writing agents**
- **Simple organization**
- **Regular usage pattern**

### David (New User)
- **1 agent** just added
- **No customizations** yet
- **Zero usage**

### Emma (Power User)
- **12 agents** across all categories
- **Complex organization**: 4 folders
- **Shared agents**: Team collaboration
- **High engagement**

## Data Characteristics

### Realistic Patterns
- ✅ Variety of usage levels (0 to 150+ uses)
- ✅ Different folder structures
- ✅ Mix of favorites and regular agents
- ✅ Various rating scores (3.0 to 5.0)
- ✅ Different customization levels

### Edge Cases
- ✅ Brand new user (David)
- ✅ Deleted/archived agents
- ✅ Shared agents
- ✅ Agents with zero usage
- ✅ Agents with custom prompts

## Verification Queries

### Check Users Loaded
```sql
SELECT 
    email,
    full_name,
    COUNT(ua.id) as agent_count
FROM user_profiles up
LEFT JOIN user_agents ua ON up.id = ua.user_id
GROUP BY up.id, email, full_name
ORDER BY agent_count DESC;
```

### Check Agent Distribution
```sql
SELECT 
    folder,
    COUNT(*) as agent_count,
    AVG(usage_count) as avg_usage
FROM user_agents
WHERE deleted_at IS NULL
GROUP BY folder
ORDER BY agent_count DESC;
```

### Check Usage Statistics
```sql
SELECT 
    up.email,
    COUNT(ua.id) as total_agents,
    SUM(ua.usage_count) as total_uses,
    AVG(ua.user_rating) as avg_rating,
    SUM(ua.total_tokens_used) as total_tokens
FROM user_profiles up
LEFT JOIN user_agents ua ON up.id = ua.user_id
GROUP BY up.id, up.email
ORDER BY total_uses DESC;
```

## Cleanup

### Remove All Seed Data
```sql
-- Remove user-agent relationships
DELETE FROM user_agents WHERE user_id IN (
    SELECT id FROM user_profiles WHERE email LIKE '%@vital.com'
);

-- Remove test users
DELETE FROM user_profiles WHERE email LIKE '%@vital.com';
```

### Reset to Fresh State
```bash
# Drop and recreate
psql $DATABASE_URL -c "TRUNCATE user_agents CASCADE;"
psql $DATABASE_URL -c "TRUNCATE user_profiles CASCADE;"

# Reload seed data
psql $DATABASE_URL -f complete_test_data.sql
```

## Customization

### Add Your Own Test User
```sql
-- 1. Create user profile
INSERT INTO user_profiles (id, email, full_name, job_title, department, organization)
VALUES (
    'your-uuid-here',
    'test@company.com',
    'Test User',
    'Researcher',
    'Clinical',
    'ACME Corp'
);

-- 2. Add some agents
SELECT add_user_agent(
    'your-uuid-here'::uuid,
    'agent-uuid'::uuid,
    'store',
    'My Agents'
);
```

### Modify Existing Data
```sql
-- Update usage counts
UPDATE user_agents 
SET usage_count = 50,
    message_count = 150,
    success_count = 48,
    error_count = 2
WHERE user_id = 'alice-uuid';

-- Add more favorites
UPDATE user_agents
SET is_favorite = TRUE
WHERE user_id = 'bob-uuid'
    AND agent_id IN (SELECT id FROM agents WHERE name LIKE '%FDA%');
```

## Data Integrity

The seed data maintains referential integrity:

- ✅ All `user_id` references exist in `user_profiles`
- ✅ All `agent_id` references exist in `agents`
- ✅ All `original_agent_id` references are valid
- ✅ Check constraints are satisfied
- ✅ Unique constraints are respected

## Performance Testing

Use seed data to test query performance:

```sql
-- Test index usage
EXPLAIN ANALYZE
SELECT * FROM user_agents
WHERE user_id = 'alice-uuid'
    AND deleted_at IS NULL
ORDER BY is_pinned DESC, sort_order;

-- Test JOIN performance
EXPLAIN ANALYZE
SELECT * FROM user_agents_with_details
WHERE user_id = 'emma-uuid';

-- Test aggregations
EXPLAIN ANALYZE
SELECT 
    folder,
    COUNT(*),
    AVG(usage_count)
FROM user_agents
WHERE user_id = 'emma-uuid'
GROUP BY folder;
```

## Next Steps

After loading seed data:
1. Verify data loaded correctly
2. Test API endpoints
3. Test UI components
4. Run integration tests
5. Check performance

---

**See Also**:
- [Complete Test Data](USER_MANAGEMENT_TEST_DATA.sql) - Full dataset
- [Getting Started](../guides/GETTING_STARTED_GUIDE.md) - Development guide

