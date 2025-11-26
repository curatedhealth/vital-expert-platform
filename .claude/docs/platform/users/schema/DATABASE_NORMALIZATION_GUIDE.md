# Database Normalization - User Management Schema

**Version**: 3.0.0  
**Last Updated**: November 25, 2025  
**Status**: Active  
**Type**: Technical Guide

---

## Overview

The VITAL Platform user management system follows **Third Normal Form (3NF)** principles to ensure data integrity, minimize redundancy, and optimize query performance.

## Normal Forms Explained

### First Normal Form (1NF)

**Definition**: Each column contains atomic (indivisible) values, and each column contains values of a single type.

✅ **Our Implementation**:
```sql
-- GOOD: Atomic values
user_id UUID                    -- Single UUID
custom_name TEXT                -- Single text value
usage_count INTEGER             -- Single number

-- GOOD: Array type for lists
tags TEXT[]                     -- Proper array type

-- BAD (not in our schema): Multiple values in one column
-- agents_used TEXT             -- "agent1,agent2,agent3" - DON'T DO THIS
```

### Second Normal Form (2NF)

**Definition**: Meets 1NF and all non-key attributes are fully dependent on the primary key (no partial dependencies).

✅ **Our Implementation**:
```sql
-- All attributes depend on the FULL key (user_id, agent_id)
CREATE TABLE user_agents (
    id UUID PRIMARY KEY,
    user_id UUID,               -- Part of business key
    agent_id UUID,              -- Part of business key
    custom_name TEXT,           -- Depends on (user_id, agent_id) combination
    usage_count INTEGER,        -- Depends on (user_id, agent_id) combination
    UNIQUE(user_id, agent_id)
);

-- BAD EXAMPLE (not in our schema):
-- If we stored agent_name in user_agents, it would only depend on agent_id,
-- not the full (user_id, agent_id) key - this violates 2NF
```

### Third Normal Form (3NF)

**Definition**: Meets 2NF and no transitive dependencies (non-key attributes don't depend on other non-key attributes).

✅ **Our Implementation**:

**Separate tables for independent entities:**

```sql
-- user_agents: User-agent relationship
-- ✅ Only stores relationship-specific data
user_agents (
    custom_name,              -- User's custom name for THIS agent
    usage_count,              -- How many times USER used THIS agent
    is_favorite               -- USER's favorite flag for THIS agent
)

-- agents: Agent definition
-- ✅ Stores agent's inherent properties
agents (
    name,                     -- Agent's actual name
    description,              -- Agent's description
    avatar_url                -- Agent's avatar
)

-- user_profiles: User information  
-- ✅ Stores user's inherent properties
user_profiles (
    full_name,                -- User's name
    email,                    -- User's email
    preferences               -- User's preferences
)
```

## Why Separate Tables?

### ✅ Normalized Design (What We Have)

```
user_agents (relationship + user-specific data)
├── custom_name              ✅ User's override
├── usage_count              ✅ User's usage
└── is_favorite              ✅ User's preference

agents (agent definition - SEPARATE)
├── name                     ✅ Agent's actual name
├── description              ✅ Agent's description
└── system_prompt            ✅ Agent's default prompt

user_memory (AI memory - SEPARATE)
├── memory_value             ✅ Memory content
├── embedding                ✅ Vector embedding
└── importance_score         ✅ Memory weight

llm_usage_logs (detailed logs - SEPARATE)
├── tokens_used              ✅ Per-request tracking
├── cost                     ✅ Per-request cost
└── created_at               ✅ Timestamp
```

**Benefits**:
- ✅ No redundancy (agent name stored once)
- ✅ Easy updates (update agent name in one place)
- ✅ Smaller tables (faster queries)
- ✅ Better indexing
- ✅ Independent scaling

### ❌ Denormalized Design (What We AVOID)

```sql
-- BAD: Everything in one table
user_agents (
    custom_name,
    usage_count,
    agent_name,              ❌ Redundant (same for all users)
    agent_description,       ❌ Redundant
    agent_system_prompt,     ❌ Redundant
    memory_value_1,          ❌ Multiple memory columns
    memory_value_2,          ❌ Violates 1NF
    llm_log_1_tokens,        ❌ Can't grow dynamically
    llm_log_2_tokens         ❌ Fixed number of logs
)
```

**Problems**:
- ❌ Data redundancy (waste space)
- ❌ Update anomalies (change agent name everywhere)
- ❌ Insert anomalies (can't add agent without users)
- ❌ Delete anomalies (delete user = lose agent data)

## Our Normalized Schema

### Core Tables (3NF Compliant)

#### 1. user_agents (Relationship Table)
**Purpose**: Stores user-agent relationship with user-specific data

**What belongs here**:
- ✅ Relationship keys (user_id, agent_id)
- ✅ User customizations (custom_name, custom_avatar)
- ✅ User's usage stats (usage_count, message_count)
- ✅ User's ratings (user_rating)
- ✅ User's organization (folder, tags, is_favorite)

**What DOESN'T belong**:
- ❌ Agent's inherent properties → goes in `agents`
- ❌ User's inherent properties → goes in `user_profiles`
- ❌ Detailed logs → goes in `llm_usage_logs`
- ❌ AI memory → goes in `user_memory`

```sql
-- Normalized: Only relationship data
CREATE TABLE user_agents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),      -- FK to user
    agent_id UUID REFERENCES agents(id),         -- FK to agent
    custom_name TEXT,                            -- User's override
    usage_count INTEGER DEFAULT 0,               -- Aggregated counter
    is_favorite BOOLEAN DEFAULT false,           -- User's flag
    total_tokens_used BIGINT DEFAULT 0,          -- Aggregated total
    ...
);
```

#### 2. agents (Entity Table)
**Purpose**: Stores agent definitions (independent of users)

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,                          -- Agent's name
    description TEXT,                            -- Agent's description
    system_prompt TEXT,                          -- Agent's prompt
    avatar_url TEXT,                             -- Agent's avatar
    ...
);
```

#### 3. user_profiles (Entity Table)
**Purpose**: Stores user information (independent of agents)

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,                           -- User's email
    full_name TEXT,                              -- User's name
    preferences JSONB,                           -- User's preferences
    ...
);
```

#### 4. user_memory (Separate Concern)
**Purpose**: AI memory with vector embeddings

**Why separate**:
- Different data types (vector embeddings)
- Different growth patterns (many memories per user)
- Different query patterns (similarity search)
- Different retention policies

```sql
CREATE TABLE user_memory (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    memory_value JSONB,                          -- Memory content
    embedding vector,                            -- Vector embedding
    importance_score NUMERIC,                    -- 0-1 score
    ...
);
```

#### 5. llm_usage_logs (Time-Series Data)
**Purpose**: Detailed LLM usage tracking

**Why separate**:
- Time-series data (grows continuously)
- Different retention policies (archive old logs)
- Different query patterns (analytics, not transactional)

```sql
CREATE TABLE llm_usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    agent_id UUID,
    tokens_used INTEGER,                         -- Per-request
    cost NUMERIC,                                -- Per-request
    created_at TIMESTAMPTZ,                      -- Timestamp
    ...
);
```

## Denormalization Exceptions

### When We Intentionally Denormalize

Sometimes we break 3NF for performance - but we do it consciously:

#### 1. Aggregated Counters in user_agents

```sql
-- Denormalized for performance
user_agents.usage_count              -- Sum of all uses
user_agents.total_tokens_used        -- Sum from llm_usage_logs
user_agents.total_cost_usd           -- Sum of all costs

-- vs. Normalized (slow)
SELECT COUNT(*) FROM conversations WHERE user_id = ? AND agent_id = ?
SELECT SUM(tokens_used) FROM llm_usage_logs WHERE user_id = ? AND agent_id = ?
```

**Why**: Avoid expensive COUNT and SUM queries on every page load

**Trade-off**: 
- ✅ Fast reads (no aggregation)
- ❌ Must keep in sync (use triggers/functions)

#### 2. Cached Rating in user_agents

```sql
-- Denormalized for performance
user_agents.user_rating              -- Latest rating

-- vs. Normalized
SELECT rating FROM user_ratings 
WHERE user_id = ? AND item_id = ? 
ORDER BY created_at DESC LIMIT 1
```

**Why**: Avoid JOIN and subquery on every query

**Trade-off**:
- ✅ No JOIN needed
- ❌ Redundant with user_ratings table

## Relationships Diagram

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
└────────┬────────┘
         │ 1
         │
         │ N
    ┌────┴─────────────────────────────┐
    │                                   │
┌───▼──────────┐              ┌────────▼─────────┐
│user_profiles │              │   user_agents    │◄───┐
│              │              │                  │    │
│  - email     │              │  - custom_name   │    │
│  - full_name │              │  - usage_count   │    │
│  - prefs     │              │  - is_favorite   │    │
└──────┬───────┘              └─────────┬────────┘    │
       │                                │             │
       │ 1                              │ N           │ 1
       │                                │             │
       │ N                       ┌──────▼───────┐     │
  ┌────▼─────────┐              │    agents    ├─────┘
  │user_memory   │              │              │
  │              │              │  - name      │
  │  - memory    │              │  - prompt    │
  │  - embedding │              │  - avatar    │
  └──────────────┘              └──────┬───────┘
                                       │ 1
                                       │
                                       │ N
                                ┌──────▼──────────┐
                                │agent_capabilities│
                                │                 │
                                │  - capability   │
                                └─────────────────┘
```

## Query Patterns

### ✅ Efficient (Normalized)

```sql
-- Get user's agents with details (single JOIN)
SELECT 
    ua.custom_name,
    ua.usage_count,
    a.name as agent_name,
    a.description
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
WHERE ua.user_id = $1;

-- Fast: Uses index on user_id, single JOIN
```

### ❌ Inefficient (If Denormalized)

```sql
-- Get all agents (must deduplicate)
SELECT DISTINCT 
    agent_name,
    agent_description
FROM user_agents;

-- Slow: Full table scan, lots of redundant data
```

## Normalization Benefits

### Data Integrity
- ✅ No update anomalies
- ✅ No delete anomalies
- ✅ Referential integrity via foreign keys

### Performance
- ✅ Smaller tables → faster queries
- ✅ Better cache utilization
- ✅ More efficient indexes

### Maintenance
- ✅ Update agent name once, affects all users
- ✅ Add agent capability once
- ✅ Clear data ownership

### Scalability
- ✅ Can partition tables independently
- ✅ Can cache tables differently
- ✅ Can archive old logs without affecting current data

## Anti-Patterns to Avoid

### ❌ Multi-Value Columns
```sql
-- BAD
CREATE TABLE user_agents (
    agents_list TEXT  -- "agent1,agent2,agent3"
);

-- GOOD
CREATE TABLE user_agents (
    user_id UUID,
    agent_id UUID,
    PRIMARY KEY (user_id, agent_id)
);
```

### ❌ Repeated Groups
```sql
-- BAD
CREATE TABLE user_agents (
    memory_1 TEXT,
    memory_2 TEXT,
    memory_3 TEXT
);

-- GOOD
CREATE TABLE user_memory (
    user_id UUID,
    memory_value TEXT,
    ...
);
```

### ❌ Transitive Dependencies
```sql
-- BAD
CREATE TABLE user_agents (
    agent_id UUID,
    agent_name TEXT,          -- Depends on agent_id
    agent_department TEXT     -- Depends on agent_id
);

-- GOOD: Separate tables
CREATE TABLE user_agents (
    agent_id UUID REFERENCES agents(id)
);

CREATE TABLE agents (
    id UUID,
    name TEXT,
    department TEXT
);
```

## Conclusion

Our schema is:
- ✅ **1NF**: All columns atomic
- ✅ **2NF**: No partial dependencies
- ✅ **3NF**: No transitive dependencies
- ✅ **Performant**: Strategic denormalization where needed
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Scalable**: Can grow to millions of records

---

**Next**: [Table Relationships](USER_DATA_SCHEMA_COMPLETE.md#table-relationships)  
**See Also**: [User Agents Schema](USER_AGENTS_SCHEMA.md)

