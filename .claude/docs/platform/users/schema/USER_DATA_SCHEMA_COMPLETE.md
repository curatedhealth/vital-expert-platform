# Complete User Data Schema

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: Schema Reference

---

## Overview

This document provides a comprehensive overview of all user-related tables in the VITAL Platform database, including user profiles, authentication, agent relationships, memory, sessions, ratings, roles, and usage tracking.

---

## Table of Contents

1. [Core User Tables](#core-user-tables)
2. [User-Agent Relationships](#user-agent-relationships)
3. [User Memory & Personalization](#user-memory--personalization)
4. [User Activity & Analytics](#user-activity--analytics)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Usage Tracking & Limits](#usage-tracking--limits)
7. [Table Relationships](#table-relationships)
8. [Data Flow Diagrams](#data-flow-diagrams)

---

## Core User Tables

### 1. auth.users (Supabase Auth)
**Purpose**: Core authentication table managed by Supabase

```sql
-- Managed by Supabase Auth
-- Contains: email, encrypted_password, email_confirmed_at, etc.
```

**Key Fields**:
- `id` (UUID) - Primary key, referenced by all user tables
- `email` (TEXT) - User's email address
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `last_sign_in_at` (TIMESTAMPTZ) - Last login

**Relationships**:
- ← Referenced by `user_profiles.id`
- ← Referenced by `user_agents.user_id`
- ← Referenced by `user_roles.user_id`

---

### 2. user_profiles
**Purpose**: Extended user information and profile data

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  organization TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{"email": true, "in_app": true, "weekly_digest": true}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

**Key Fields**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | FK to auth.users, primary key |
| `email` | TEXT | Cached from auth.users |
| `full_name` | TEXT | User's display name |
| `avatar_url` | TEXT | Profile picture URL |
| `job_title` | TEXT | Professional title |
| `department` | TEXT | Department/division |
| `organization` | TEXT | Company/organization |
| `preferences` | JSONB | UI preferences (theme, language) |
| `notification_settings` | JSONB | Notification preferences |
| `is_active` | BOOLEAN | Account active status |
| `last_seen_at` | TIMESTAMPTZ | Last activity timestamp |
| `onboarding_completed` | BOOLEAN | Onboarding wizard status |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |

**Preferences JSONB Structure**:
```json
{
  "theme": "dark" | "light",
  "language": "en",
  "timezone": "America/New_York",
  "sidebar_collapsed": false,
  "default_view": "grid" | "list",
  "animations_enabled": true
}
```

**Notification Settings JSONB Structure**:
```json
{
  "email": true,
  "in_app": true,
  "weekly_digest": true,
  "agent_updates": false,
  "new_features": true
}
```

**Relationships**:
- → References `auth.users(id)`
- ← Referenced by `user_memory`
- ← Referenced by `user_sessions`
- ← Referenced by `user_role_assignments`
- ← Referenced by `rate_limit_config`

---

### 3. users (Legacy/Alternative)
**Purpose**: Alternative user table (may be deprecated)

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  organization_id UUID,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role = ANY (ARRAY['admin', 'clinician', 'researcher', 'member'])),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

**Note**: This table may overlap with `user_profiles`. Check your application to see which is actively used.

---

## User-Agent Relationships

### 4. user_agents ⭐ (Primary Focus)
**Purpose**: Manages user-agent relationships with full customization and tracking

**Full Schema**: See [user_agents.md](user_agents.md) for complete 54-column documentation

**Summary**:
```sql
CREATE TABLE public.user_agents (
  -- Core
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id UUID NOT NULL REFERENCES agents(id),
  original_agent_id UUID REFERENCES agents(id),
  is_user_copy BOOLEAN DEFAULT false,
  
  -- Customization (7 columns)
  custom_name TEXT,
  custom_description TEXT,
  custom_avatar TEXT,
  custom_color TEXT,
  custom_system_prompt TEXT,
  custom_temperature NUMERIC,
  custom_max_tokens INTEGER,
  
  -- Organization (6 columns)
  is_favorite BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  folder TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  display_position TEXT,
  
  -- Usage Tracking (5 columns)
  usage_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Quality (3 columns)
  user_rating NUMERIC(3,2),
  quality_score NUMERIC(3,2),
  last_rating_at TIMESTAMPTZ,
  
  -- Performance (3 columns)
  avg_response_time_ms INTEGER,
  total_tokens_used BIGINT DEFAULT 0,
  total_cost_usd NUMERIC(10,2) DEFAULT 0,
  
  -- Timestamps (9 columns)
  added_at TIMESTAMPTZ DEFAULT NOW(),
  first_used_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  -- State (5 columns)
  is_active BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  
  -- Config (7 JSONB columns)
  settings JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  ui_config JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "in_app": true}',
  metadata JSONB DEFAULT '{}',
  source_details JSONB DEFAULT '{}',
  share_settings JSONB DEFAULT '{}',
  
  -- Notifications (1 column)
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Context (3 columns)
  last_conversation_id UUID,
  notes TEXT,
  quick_notes TEXT,
  
  -- Metadata (1 column)
  source TEXT,
  
  -- Collaboration (3 columns)
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[],
  team_id UUID,
  
  UNIQUE(user_id, agent_id)
);
```

**Key Features**:
- ✅ 54 total columns
- ✅ 23 performance indexes
- ✅ 6 RLS policies
- ✅ 5 helper functions
- ✅ 4 pre-built views
- ✅ Full normalization (3NF)

**See Also**: [USER_AGENTS_SCHEMA.md](USER_AGENTS_SCHEMA.md) for complete 54-column documentation

---

### 5. user_favorites
**Purpose**: Generic favorites system for any item type

```sql
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `item_type` - Type of favorited item: 'agent', 'workflow', 'template', 'document'
- `item_id` - UUID of the favorited item
- `notes` - User's private notes
- `metadata` - Additional data

**Example Usage**:
```sql
-- Favorite an agent
INSERT INTO user_favorites (user_id, item_type, item_id, notes)
VALUES ('user-uuid', 'agent', 'agent-uuid', 'My go-to FDA expert');

-- Get user's favorite agents
SELECT uf.*, a.name
FROM user_favorites uf
JOIN agents a ON uf.item_id = a.id
WHERE uf.user_id = 'user-uuid' AND uf.item_type = 'agent';
```

---

### 6. user_ratings
**Purpose**: Generic rating/review system

```sql
CREATE TABLE public.user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  helpful_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `rating` - 1-5 stars (validated)
- `review` - Optional text review
- `helpful_count` - How many found this helpful
- `metadata` - Additional rating context

**Example Usage**:
```sql
-- Rate an agent
INSERT INTO user_ratings (user_id, item_type, item_id, rating, review)
VALUES ('user-uuid', 'agent', 'agent-uuid', 5, 'Excellent FDA guidance!');

-- Get average rating for an agent
SELECT 
  item_id,
  AVG(rating) as avg_rating,
  COUNT(*) as review_count
FROM user_ratings
WHERE item_type = 'agent' AND item_id = 'agent-uuid'
GROUP BY item_id;
```

---

## User Memory & Personalization

### 7. user_memory
**Purpose**: AI memory system with vector embeddings for personalization

```sql
CREATE TABLE public.user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  memory_type TEXT,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  importance_score NUMERIC CHECK (importance_score >= 0 AND importance_score <= 1),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  embedding VECTOR,  -- pgvector extension
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Key Fields**:
| Column | Type | Description |
|--------|------|-------------|
| `memory_type` | TEXT | Type: 'preference', 'context', 'fact', 'instruction' |
| `memory_key` | TEXT | Unique key for retrieval |
| `memory_value` | JSONB | The actual memory content |
| `importance_score` | NUMERIC | 0-1, used for memory pruning |
| `embedding` | VECTOR | Vector embedding for semantic search |
| `access_count` | INTEGER | How often this memory is accessed |
| `expires_at` | TIMESTAMPTZ | Optional expiration |

**Memory Types**:
- `preference` - User preferences (e.g., "prefers bullet points")
- `context` - Contextual information (e.g., "working on Phase III trial")
- `fact` - User-specific facts (e.g., "works at Pfizer")
- `instruction` - Custom instructions (e.g., "always cite FDA guidelines")

**Memory Value JSONB Structure**:
```json
{
  "content": "User prefers concise bullet-point summaries",
  "source": "conversation_123",
  "confidence": 0.95,
  "tags": ["style", "format"],
  "context": {
    "conversation_id": "uuid",
    "timestamp": "2025-11-25T10:30:00Z"
  }
}
```

**Example Usage**:
```sql
-- Store a memory
INSERT INTO user_memory (user_id, memory_type, memory_key, memory_value, importance_score, embedding)
VALUES (
  'user-uuid',
  'preference',
  'communication_style',
  '{"content": "Prefers concise bullet points", "confidence": 0.95}'::jsonb,
  0.8,
  '[0.1, 0.2, 0.3, ...]'::vector  -- Generated by embedding model
);

-- Semantic search for relevant memories
SELECT memory_value, importance_score
FROM user_memory
WHERE user_id = 'user-uuid'
ORDER BY embedding <-> '[query_embedding]'::vector
LIMIT 5;

-- Get high-importance memories
SELECT * FROM user_memory
WHERE user_id = 'user-uuid' 
  AND importance_score > 0.7
ORDER BY importance_score DESC;
```

---

## User Activity & Analytics

### 8. user_sessions
**Purpose**: Track user sessions and analytics

```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Key Fields**:
| Column | Type | Description |
|--------|------|-------------|
| `session_start` | TIMESTAMPTZ | When session began |
| `session_end` | TIMESTAMPTZ | When session ended (NULL if active) |
| `duration_seconds` | INTEGER | Calculated duration |
| `page_views` | INTEGER | Pages viewed in session |
| `events_count` | INTEGER | User interactions |
| `device_type` | TEXT | 'desktop', 'mobile', 'tablet' |
| `browser` | TEXT | Browser name and version |
| `os` | TEXT | Operating system |
| `ip_address` | INET | IP address (for security) |
| `utm_*` | TEXT | Marketing campaign tracking |

**Example Usage**:
```sql
-- Active sessions
SELECT COUNT(*) as active_users
FROM user_sessions
WHERE session_end IS NULL;

-- User's session history
SELECT 
  session_start,
  session_end,
  duration_seconds / 60 as duration_minutes,
  page_views,
  device_type
FROM user_sessions
WHERE user_id = 'user-uuid'
ORDER BY session_start DESC
LIMIT 10;

-- Average session duration
SELECT 
  AVG(duration_seconds) / 60 as avg_duration_minutes,
  AVG(page_views) as avg_page_views
FROM user_sessions
WHERE user_id = 'user-uuid' AND session_end IS NOT NULL;
```

---

## User Roles & Permissions

### 9. user_roles
**Purpose**: Basic role assignment (admin/user/superadmin)

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin')),
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles**:
- `user` - Standard user
- `admin` - Administrator with elevated permissions
- `superadmin` - Platform-wide administrator

---

### 10. user_role_assignments
**Purpose**: Advanced role assignments with temporal validity

```sql
CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  role_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  is_acting BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `is_acting` - Temporary acting role
- `is_primary` - Primary role for user
- `effective_from` - Role starts on this date
- `effective_to` - Role ends on this date (NULL = indefinite)
- `created_by` - Who assigned this role

**Example Usage**:
```sql
-- Get user's current roles
SELECT *
FROM user_role_assignments
WHERE user_id = 'user-uuid'
  AND effective_from <= CURRENT_DATE
  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE);

-- Assign temporary role
INSERT INTO user_role_assignments (user_id, role_id, tenant_id, is_acting, effective_from, effective_to)
VALUES ('user-uuid', 'role-uuid', 'tenant-uuid', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');
```

---

## Usage Tracking & Limits

### 11. llm_usage_logs
**Purpose**: Detailed LLM usage tracking for billing and analytics

```sql
CREATE TABLE public.llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES llm_providers(id),
  model TEXT,
  tokens_used INTEGER,
  cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `provider_id` - Which LLM provider (OpenAI, Anthropic, etc.)
- `model` - Specific model used (gpt-4, claude-3, etc.)
- `tokens_used` - Token count
- `cost` - Calculated cost in USD

**Example Usage**:
```sql
-- User's monthly usage
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost
FROM llm_usage_logs
WHERE user_id = 'user-uuid'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY month;

-- Most expensive models
SELECT 
  model,
  COUNT(*) as usage_count,
  SUM(tokens_used) as total_tokens,
  SUM(cost) as total_cost
FROM llm_usage_logs
WHERE user_id = 'user-uuid'
GROUP BY model
ORDER BY total_cost DESC;
```

---

### 12. quota_tracking
**Purpose**: Track and enforce usage quotas per tenant

```sql
CREATE TABLE public.quota_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quota_type TEXT NOT NULL,
  quota_limit BIGINT NOT NULL,
  current_usage BIGINT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  alert_threshold_percentage NUMERIC DEFAULT 80,
  is_exceeded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Quota Types**:
- `tokens` - Token usage limit
- `api_calls` - API request limit
- `storage_gb` - Storage limit
- `users` - User count limit

**Example Usage**:
```sql
-- Check current quota status
SELECT 
  quota_type,
  quota_limit,
  current_usage,
  ROUND((current_usage::NUMERIC / quota_limit) * 100, 2) as usage_percentage,
  is_exceeded
FROM quota_tracking
WHERE tenant_id = 'tenant-uuid'
  AND period_end >= CURRENT_DATE;

-- Update usage (typically done by trigger)
UPDATE quota_tracking
SET 
  current_usage = current_usage + 1000,
  is_exceeded = (current_usage + 1000) > quota_limit,
  updated_at = NOW()
WHERE tenant_id = 'tenant-uuid' 
  AND quota_type = 'tokens';
```

---

### 13. rate_limit_config
**Purpose**: Configure rate limits for users/agents

```sql
CREATE TABLE public.rate_limit_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  limit_type TEXT NOT NULL,
  limit_scope TEXT NOT NULL,
  limit_value INTEGER NOT NULL,
  user_id UUID REFERENCES user_profiles(id),
  agent_id UUID REFERENCES agents(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Limit Types**:
- `requests_per_minute`
- `requests_per_hour`
- `requests_per_day`
- `concurrent_requests`

**Limit Scopes**:
- `global` - Platform-wide
- `tenant` - Per tenant
- `user` - Per user
- `agent` - Per agent

---

### 14. rate_limit_usage
**Purpose**: Track rate limit usage and violations

```sql
CREATE TABLE public.rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES rate_limit_config(id),
  usage_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  is_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Example Usage**:
```sql
-- Check if rate limit exceeded
SELECT 
  rlc.limit_type,
  rlu.usage_count,
  rlc.limit_value,
  rlu.is_exceeded
FROM rate_limit_usage rlu
JOIN rate_limit_config rlc ON rlu.config_id = rlc.id
WHERE rlc.user_id = 'user-uuid'
  AND rlu.window_end > NOW()
  AND rlu.is_exceeded = true;
```

---

## Table Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│  auth.users     │ (Supabase)
│  (Supabase)     │
└────────┬────────┘
         │ 1
         │
         ├────────────────────────────┐
         │                            │
         │ N                          │ 1
    ┌────▼──────────┐        ┌───────▼─────────┐
    │ user_profiles │        │   user_roles    │
    │               │        │                 │
    └────┬─────┬────┘        └─────────────────┘
         │ 1   │ 1
         │     │
         │ N   │ N
    ┌────▼─────▼──────────┐
    │   user_agents       │◄──────┐
    │   (54 columns)      │       │
    └──────┬──────────────┘       │
           │ N                    │ 1
           │                 ┌────┴────────┐
           │                 │   agents    │
    ┌──────▼──────────┐      │             │
    │ user_memory     │      └─────────────┘
    │                 │
    └─────────────────┘
    
    ┌─────────────────┐
    │ user_sessions   │
    │                 │
    └─────────────────┘
    
    ┌─────────────────┐       ┌─────────────────┐
    │ user_favorites  │       │  user_ratings   │
    │                 │       │                 │
    └─────────────────┘       └─────────────────┘
    
    ┌─────────────────┐       ┌─────────────────┐
    │llm_usage_logs   │       │ quota_tracking  │
    │                 │       │                 │
    └─────────────────┘       └─────────────────┘
```

### Key Relationships

1. **auth.users → user_profiles** (1:1)
   - Every auth user has one profile
   - Profile.id = auth.users.id

2. **user_profiles → user_agents** (1:N)
   - User can have many agents
   - Each user_agent belongs to one user

3. **agents → user_agents** (1:N)
   - Agent can be added by many users
   - Each user_agent references one agent

4. **user_profiles → user_memory** (1:N)
   - User can have many memories
   - Used for AI personalization

5. **user_profiles → user_sessions** (1:N)
   - Track all user sessions
   - Analytics and monitoring

6. **auth.users → user_favorites** (1:N)
   - User can favorite many items
   - Generic favorites system

7. **auth.users → user_ratings** (1:N)
   - User can rate many items
   - Reviews and feedback

---

## Data Flow Diagrams

### User Agent Addition Flow

```
User clicks "Add Agent"
        ↓
POST /api/user-agents
        ↓
Insert into user_agents
        ↓
    ┌───────────────┐
    │  user_agents  │
    │  - user_id    │
    │  - agent_id   │
    │  - added_at   │
    │  - source     │
    └───────┬───────┘
            ↓
    React Query invalidates cache
            ↓
    Sidebar refreshes with new agent
```

### Agent Usage Tracking Flow

```
User interacts with agent
        ↓
track_agent_usage(user_id, agent_id, success, tokens, cost)
        ↓
    ┌──────────────────────────────────┐
    │ UPDATE user_agents               │
    │ - usage_count++                  │
    │ - message_count += messages      │
    │ - success_count++ / error_count++│
    │ - total_tokens_used += tokens    │
    │ - total_cost_usd += cost         │
    │ - last_used_at = NOW()           │
    │ - quality_score recalculated     │
    └──────────────┬───────────────────┘
                   ↓
    ┌──────────────────────────────────┐
    │ INSERT INTO llm_usage_logs       │
    │ - user_id                        │
    │ - model                          │
    │ - tokens_used                    │
    │ - cost                           │
    └──────────────┬───────────────────┘
                   ↓
    ┌──────────────────────────────────┐
    │ UPDATE quota_tracking            │
    │ - current_usage += tokens        │
    │ - is_exceeded check              │
    └──────────────────────────────────┘
```

### Memory Retrieval Flow

```
User starts conversation
        ↓
Fetch relevant memories
        ↓
SELECT * FROM user_memory
WHERE user_id = ?
ORDER BY embedding <-> query_embedding
LIMIT 5
        ↓
    ┌───────────────────┐
    │ Relevant memories │
    │ - context         │
    │ - preferences     │
    │ - facts           │
    └─────────┬─────────┘
              ↓
    Injected into AI prompt
              ↓
    Personalized response
              ↓
    UPDATE user_memory
    - last_accessed_at = NOW()
    - access_count++
```

---

## Storage Estimates

### Per-User Storage

| Table | Rows/User | Size/Row | Total/User |
|-------|-----------|----------|------------|
| user_profiles | 1 | ~2 KB | 2 KB |
| user_agents | 10 | ~2 KB | 20 KB |
| user_memory | 100 | ~1 KB | 100 KB |
| user_sessions | 30 | ~500 B | 15 KB |
| user_ratings | 5 | ~500 B | 2.5 KB |
| llm_usage_logs | 1000 | ~200 B | 200 KB |
| **TOTAL** | - | - | **~340 KB** |

### Scaling Estimates

| Users | Total Storage | Notes |
|-------|--------------|-------|
| 1,000 | ~340 MB | Small deployment |
| 10,000 | ~3.4 GB | Medium deployment |
| 100,000 | ~34 GB | Large deployment |
| 1,000,000 | ~340 GB | Enterprise scale |

**Note**: Actual storage is typically 20-30% less due to compression and NULL values.

---

## Best Practices

### Do's ✅
1. Always filter by `user_id` first (indexed)
2. Use `deleted_at IS NULL` for active records
3. Leverage views for complex queries
4. Use helper functions for common operations
5. Implement soft delete, not hard delete
6. Cache frequently accessed data (React Query)
7. Use JSONB for flexible schema
8. Paginate large result sets

### Don'ts ❌
1. Don't scan entire tables without user filter
2. Don't ignore RLS policies
3. Don't update timestamps manually (use triggers)
4. Don't forget to invalidate caches
5. Don't skip indexes on frequently queried columns
6. Don't store large files in JSONB (use storage bucket)
7. Don't expose PII without proper permissions

---

## Related Documentation

- **[USER_AGENTS_SCHEMA.md](USER_AGENTS_SCHEMA.md)** - Complete user_agents table documentation
- **[DATABASE_NORMALIZATION_GUIDE.md](DATABASE_NORMALIZATION_GUIDE.md)** - Database normalization principles
- **[../api/USER_AGENTS_API_REFERENCE.md](../api/USER_AGENTS_API_REFERENCE.md)** - API documentation
- **[../guides/GETTING_STARTED_GUIDE.md](../guides/GETTING_STARTED_GUIDE.md)** - Quick start guide
- **[../migrations/MIGRATION_HISTORY.md](../migrations/MIGRATION_HISTORY.md)** - Migration history

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2025-11-25 | Complete user_agents schema (54 columns) |
| 2.0.0 | 2025-11-24 | Basic user_agents table |
| 1.0.0 | 2025-11-20 | Initial user profiles system |

---

**Status**: Production Ready ✅  
**Last Updated**: 2025-11-25  
**Maintained By**: VITAL Platform Team

