# Database Migration: Services Registry and Libraries

## Overview
Created comprehensive database schema for services, workflows, tools, and templates to support the enhanced workflow designer and platform features.

## Migration File
- **Location**: `/database/migrations/021_create_services_and_libraries.sql`
- **Date**: 2025-11-23
- **Status**: ⚠️ Ready to apply (connection timeout, needs manual application)

## Tables Created

### 1. **services_registry** (Core Services Registry)
Central registry for all platform services (Ask Expert, Ask Panel, Workflows, Solutions Marketplace).

**Key Features**:
- Service identity and categorization
- Configuration storage (JSONB)
- Rate limits and quotas
- Pricing information
- API endpoints and webhooks
- Service dependencies
- Version tracking
- Tags for discovery

**Seed Data**: 4 core services
- Ask Expert (1:1 AI conversations)
- Ask Panel (Multi-agent panels)
- Workflows (Automated workflows)
- Solutions Marketplace (Pre-built solutions)

### 2. **tool_library** (Reusable Tools & Services)
Library of tools that can be used in workflows and by agents.

**Key Features**:
- Tool categorization (search, data, communication, analysis, integration)
- Tool type classification (api, function, webhook, external_service, builtin)
- Input/Output JSON schemas
- Example usage and documentation
- Authentication configuration
- Performance limits (timeout, retries, rate limits)
- Usage tracking
- Public/private/builtin visibility

**Seed Data**: 4 built-in tools
- Web Search (Tavily integration)
- Document Parser (PDF, DOCX, TXT, MD)
- Code Analyzer (Multi-language support)
- HTTP Request (Generic API caller)

### 3. **template_library** (Universal Template Storage)
Library for all types of templates (prompts, workflows, agents, panels).

**Key Features**:
- Template type classification (prompt, workflow, agent, panel, system_message)
- Template category (research, writing, analysis, customer_support, healthcare)
- JSONB content storage with variables
- Input/Output schemas
- Framework compatibility (langgraph, autogen, crewai, generic)
- Rating system
- Usage tracking
- Template forking (parent_template_id)
- Featured templates

**Seed Data**: 4 prompt templates
- Research Analyst Prompt
- Technical Writer Prompt
- Code Reviewer Prompt
- Customer Support Prompt

### 4. **workflow_library** (Enhanced Workflow Metadata)
Additional metadata and features for workflows (extends workflows table).

**Key Features**:
- Library categorization and difficulty levels
- Visibility control (private, organization, public)
- Featured and verified workflows
- Usage metrics (views, clones, favorites)
- Rating system
- Search keywords
- Related workflows
- Requirements tracking (tools, services, API keys)
- Documentation (setup, usage, troubleshooting)
- Video tutorials

### 5. **user_favorites** (User Bookmarks)
Track user favorites for workflows, templates, tools, and services.

**Key Features**:
- Multi-type support (workflow, template, tool, service)
- Personal notes
- Quick access for users

### 6. **user_ratings** (Ratings & Reviews)
User ratings and reviews for workflows, templates, and tools.

**Key Features**:
- 5-star rating system
- Written reviews
- Helpful vote tracking
- Automatic aggregate calculation

## Advanced Features

### Row Level Security (RLS)
All tables have comprehensive RLS policies:
- Services: Public read access
- Tools: Public/builtin + user-owned access
- Templates: Public/builtin + user-owned access
- Workflow Library: Follows workflow permissions
- User Favorites: User-owned only
- User Ratings: Public read, user-owned write

### Triggers & Functions
1. **Auto-update timestamps**: All tables have `updated_at` triggers
2. **Rating aggregates**: Automatically calculates average ratings and counts
3. **Favorite counts**: Automatically updates favorite counts on workflow_library

### Indexes
Comprehensive indexing for performance:
- Category and type indexes
- Enabled/public status indexes
- Creator and tenant indexes
- Tag indexes (GIN for array searching)
- Usage and rating indexes
- Composite indexes for common queries

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `database/migrations/021_create_services_and_libraries.sql`
4. Copy and paste the entire SQL content
5. Click **Run** to execute

### Option 2: Supabase CLI
```bash
# From project root
supabase db push database/migrations/021_create_services_and_libraries.sql
```

### Option 3: psql (Direct PostgreSQL)
```bash
psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/migrations/021_create_services_and_libraries.sql
```

## Verification Queries

After applying the migration, verify with these queries:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'services_registry', 
    'tool_library', 
    'template_library', 
    'workflow_library',
    'user_favorites',
    'user_ratings'
  );

-- Check seed data
SELECT COUNT(*) as service_count FROM services_registry;
SELECT COUNT(*) as tool_count FROM tool_library;
SELECT COUNT(*) as template_count FROM template_library;

-- View services
SELECT service_name, display_name, service_category, is_enabled 
FROM services_registry 
ORDER BY service_name;

-- View tools
SELECT tool_name, display_name, tool_category, tool_type 
FROM tool_library 
WHERE is_builtin = TRUE
ORDER BY tool_name;

-- View templates
SELECT template_name, display_name, template_type, template_category 
FROM template_library 
WHERE is_builtin = TRUE
ORDER BY template_name;
```

Expected results:
- **6 tables created**
- **4 services** in services_registry
- **4 tools** in tool_library
- **4 templates** in template_library

## Integration Points

### Frontend Components
These tables support:
1. **Service Registry UI**: Display available services
2. **Tool Picker**: Browse and select tools for workflows
3. **Template Gallery**: Browse and use templates
4. **Workflow Marketplace**: Discover and clone workflows
5. **User Profiles**: Show favorites and ratings
6. **Admin Dashboard**: Manage services, tools, and templates

### API Endpoints Needed
```typescript
// Services
GET  /api/services
GET  /api/services/:slug

// Tools
GET  /api/tools
GET  /api/tools/:slug
POST /api/tools (create custom tool)

// Templates
GET  /api/templates
GET  /api/templates/:slug
POST /api/templates (create custom template)
GET  /api/templates/categories

// Workflow Library
GET  /api/workflows/library
GET  /api/workflows/library/:id
POST /api/workflows/:id/favorite
POST /api/workflows/:id/rate
GET  /api/workflows/featured

// User
GET  /api/user/favorites
GET  /api/user/ratings
```

## Next Steps

1. **Apply Migration**: Use one of the methods above to apply the migration
2. **Verify Tables**: Run verification queries to confirm success
3. **Create API Routes**: Implement the API endpoints listed above
4. **Update Frontend**: 
   - Add service registry display
   - Create tool library browser
   - Create template gallery
   - Add workflow marketplace
   - Implement favorites and ratings UI
5. **Seed Additional Data**: Add more templates, tools, and workflows as needed

## Schema Relationships

```
auth.users
  ↓
  ├─→ tool_library (created_by)
  ├─→ template_library (created_by)
  ├─→ user_favorites (user_id)
  └─→ user_ratings (user_id)

workflows
  ↓
  └─→ workflow_library (workflow_id) [1:1 relationship]

template_library
  ↓
  └─→ template_library (parent_template_id) [self-referencing for forks]
```

## Benefits

1. **Centralized Service Management**: All services in one place
2. **Reusable Components**: Tools and templates can be shared across workflows
3. **Discovery**: Tags, categories, and search keywords enable easy discovery
4. **Community**: Ratings, reviews, and favorites create community engagement
5. **Extensibility**: Easy to add new services, tools, and templates
6. **Analytics**: Usage tracking enables insights into popular features
7. **Governance**: Built-in verification and featured flags for quality control

## Migration Safety

- ✅ Uses `IF NOT EXISTS` for idempotent execution
- ✅ Uses `ON CONFLICT DO NOTHING` for seed data
- ✅ Comprehensive RLS policies for security
- ✅ Proper foreign key constraints
- ✅ Extensive indexing for performance
- ✅ Soft deletes (deleted_at) for data recovery

---

**Migration Ready**: This migration is production-ready and can be applied safely to your Supabase database.

