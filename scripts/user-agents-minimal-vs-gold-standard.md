# User Agents Table: Minimal vs Gold Standard

## Quick Comparison

| Feature Category | Minimal (Basic) | Gold Standard (Production) |
|-----------------|-----------------|----------------------------|
| **Core Fields** | 5 fields | 60+ fields |
| **User Customization** | ❌ None | ✅ Names, avatars, prompts |
| **Usage Tracking** | ❌ Basic count | ✅ Comprehensive analytics |
| **Organization** | ❌ None | ✅ Folders, tags, favorites |
| **Performance Metrics** | ❌ None | ✅ Response times, quality scores |
| **Collaboration** | ❌ None | ✅ Sharing, teams |
| **Soft Delete** | ❌ Hard delete | ✅ Recoverable deletes |
| **Views & Helpers** | ❌ None | ✅ Multiple views & functions |

---

## Minimal Schema (Current - Quick Start)

**Use when:** You just need basic functionality to get started.

```sql
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);
```

**Pros:**
- ✅ Simple and fast to implement
- ✅ Low storage overhead
- ✅ Easy to understand
- ✅ Sufficient for MVP/prototype

**Cons:**
- ❌ No usage analytics
- ❌ No user customization
- ❌ No organizational features
- ❌ Limited future flexibility

---

## Gold Standard Schema (Production Ready)

**Use when:** Building a production app with professional features.

### 1. Core Fields (5 fields)
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
agent_id UUID NOT NULL
original_agent_id UUID
is_user_copy BOOLEAN
```

### 2. User Customization (6 fields)
```sql
custom_name TEXT                    -- "My Personal Assistant"
custom_description TEXT             -- User's notes
custom_avatar TEXT                  -- Custom emoji/image
custom_color TEXT                   -- UI color preference
custom_system_prompt TEXT           -- Override default prompt
```

**Example Use Case:** User renames "FDA Regulatory Strategist" to "My FDA Guy" with a custom prompt for their specific use case.

### 3. Organization & Favorites (6 fields)
```sql
is_favorite BOOLEAN                 -- ⭐ Quick access
is_pinned BOOLEAN                   -- 📌 Pin to top
folder TEXT                         -- 📁 "Work", "Personal"
tags TEXT[]                         -- ["medical", "urgent"]
sort_order INTEGER                  -- Custom ordering
```

**Example Use Case:** User organizes agents into "Clinical Trials" and "Regulatory" folders, pins top 3 agents.

### 4. Usage Tracking (8 fields)
```sql
added_at TIMESTAMPTZ                -- When added
last_used_at TIMESTAMPTZ            -- Last interaction
first_used_at TIMESTAMPTZ           -- First use
usage_count INTEGER                 -- Total uses
message_count INTEGER               -- Total messages
success_count INTEGER               -- Successful interactions
error_count INTEGER                 -- Failed interactions
conversation_count INTEGER          -- Number of conversations
```

**Example Use Case:** Analytics dashboard showing "You've used this agent 47 times this month with 95% success rate."

### 5. Performance & Quality (6 fields)
```sql
avg_response_time_ms INTEGER        -- Performance tracking
total_tokens_used INTEGER           -- Cost tracking
user_rating DECIMAL(3,2)            -- User's 1-5 star rating
user_feedback TEXT                  -- Written feedback
quality_score DECIMAL(3,2)          -- Calculated score
```

**Example Use Case:** Show "This agent typically responds in 1.2s" and "4.8⭐ based on your usage."

### 6. Configuration & Settings (4 fields)
```sql
settings JSONB                      -- {"temperature": 0.7, "max_tokens": 2000}
preferences JSONB                   -- User preferences
notifications_enabled BOOLEAN       -- Email/push notifications
auto_suggestions_enabled BOOLEAN    -- Show suggestions
```

**Example Use Case:** User sets agent to always use temperature=0.3 for consistent responses.

### 7. State Management (4 fields)
```sql
is_active BOOLEAN                   -- Active/archived
is_enabled BOOLEAN                  -- Enabled/disabled
is_visible BOOLEAN                  -- Show in UI
status TEXT                         -- 'active', 'paused', 'archived'
```

**Example Use Case:** Temporarily disable an agent without deleting it.

### 8. Context & Memory (4 fields)
```sql
last_conversation_id UUID           -- Quick resume
shared_context JSONB                -- Shared data
memory JSONB                        -- Agent learning
```

**Example Use Case:** Agent remembers user's company name and project details across sessions.

### 9. Collaboration & Sharing (4 fields)
```sql
is_shared BOOLEAN                   -- Shared with team
shared_with UUID[]                  -- Array of user IDs
share_settings JSONB                -- Permissions
team_id UUID                        -- Team/org reference
```

**Example Use Case:** Share customized agent with team members.

### 10. Billing & Limits (4 fields)
```sql
usage_quota INTEGER                 -- Monthly limit
usage_this_month INTEGER            -- Current usage
last_quota_reset TIMESTAMPTZ        -- Reset date
cost_this_month DECIMAL(10,2)       -- Monthly cost
```

**Example Use Case:** "You've used 450/1000 queries this month ($12.50)."

### 11. Metadata & Audit (4 fields)
```sql
metadata JSONB                      -- Extra data
notes TEXT                          -- Private notes
source TEXT                         -- 'store', 'custom', 'import'
source_details JSONB                -- Source info
```

**Example Use Case:** Track which agents were imported vs. created vs. added from store.

### 12. Timestamps (4 fields)
```sql
created_at TIMESTAMPTZ              -- Creation time
updated_at TIMESTAMPTZ              -- Last update
archived_at TIMESTAMPTZ             -- Archive time
deleted_at TIMESTAMPTZ              -- Soft delete
```

**Example Use Case:** Recover accidentally deleted agents, show "Added 3 months ago."

---

## Progressive Implementation Path

### Phase 1: MVP (Start Here)
```sql
-- Minimal fields to get running
id, user_id, agent_id, created_at, updated_at
```
**Time to implement:** 5 minutes  
**Good for:** Testing, prototype, demo

### Phase 2: Basic Features
```sql
-- Add basic tracking
+ usage_count, last_used_at, is_favorite
```
**Time to implement:** 10 minutes  
**Good for:** Beta, early users

### Phase 3: User Experience
```sql
-- Add customization
+ custom_name, custom_avatar, folder, tags, sort_order
```
**Time to implement:** 30 minutes  
**Good for:** Production MVP

### Phase 4: Analytics & Quality
```sql
-- Add comprehensive tracking
+ success_count, error_count, user_rating, quality_score
+ avg_response_time_ms, total_tokens_used
```
**Time to implement:** 1 hour  
**Good for:** Growth stage

### Phase 5: Advanced Features
```sql
-- Add collaboration & limits
+ is_shared, shared_with, team_id
+ usage_quota, cost_this_month
+ memory, preferences
```
**Time to implement:** 2 hours  
**Good for:** Enterprise features

---

## Recommendation for Your Project

### For NOW (Immediate Fix):
Use the **minimal schema** from `quick-fix-user-agents.md` to unblock development.

### For NEXT SPRINT:
Upgrade to **Phase 3** (User Experience) to add:
- Favorites ⭐
- Custom names
- Usage tracking
- Basic organization

### For PRODUCTION:
Implement the **full gold standard** schema for:
- Professional analytics dashboard
- Team collaboration
- Cost tracking
- Quality metrics
- Enterprise features

---

## Implementation

### Option 1: Start Minimal (Recommended for Quick Fix)
```bash
# Run the quick fix
Run SQL from: scripts/quick-fix-user-agents.md
```

### Option 2: Go Full Gold Standard
```bash
# Run the comprehensive schema
psql $DATABASE_URL -f scripts/user-agents-gold-standard-schema.sql
```

### Option 3: Progressive Migration
```bash
# Start minimal, add features over time
1. Run quick-fix (5 min)
2. Test and verify
3. Run ALTER TABLE statements to add columns as needed
```

---

## Storage Considerations

| Schema | Storage per Row | 1K Users | 10K Users | 100K Users |
|--------|----------------|----------|-----------|------------|
| Minimal | ~200 bytes | 200 KB | 2 MB | 20 MB |
| Gold Standard | ~2 KB | 2 MB | 20 MB | 200 MB |

**Note:** Gold standard includes JSONB fields which compress well. Real-world overhead is typically 20-30% of maximum.

---

## Which Should You Use?

### Use Minimal If:
- ✅ Just need to store the relationship
- ✅ Building an MVP/prototype
- ✅ Need to ship quickly
- ✅ Limited backend resources
- ✅ Simple use case

### Use Gold Standard If:
- ✅ Building production SaaS
- ✅ Need analytics/insights
- ✅ Want user customization
- ✅ Planning team features
- ✅ Need cost tracking
- ✅ Want professional polish

### Our Recommendation for VITAL:
Start with **Phase 2** (Basic Features) right now:
- Gets you unblocked ✅
- Adds favorites and usage tracking ⭐
- Easy to upgrade later 🚀
- Still simple to maintain 🎯

Then upgrade to **Phase 3** (User Experience) before launch 🎉





