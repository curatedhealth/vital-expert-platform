# 🚀 Phase 0: Pre-Implementation Setup
## Ask Panel Multi-Tenant Architecture

**Duration**: 1 day  
**Complexity**: Easy  
**Prerequisites**: None  
**Next Phase**: Phase 1 - Multi-Tenant Foundation

---

## 📋 Overview

This phase sets up your development environment, creates the project structure, and configures all necessary services before beginning implementation. Think of this as laying the foundation before building the house.

### What You'll Accomplish

- ✅ Configure all external services (Supabase, Modal, Pinecone, Redis)
- ✅ Set up environment variables
- ✅ Create project directory structure
- ✅ Initialize database schema with multi-tenant support
- ✅ Verify all services are working

---

## 📦 Required Accounts & Services

### 1. Supabase (Database + Auth)

**Purpose**: PostgreSQL database with built-in authentication and Row-Level Security (RLS)

**Setup Steps**:
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Choose region closest to your users
# 4. Save these credentials:
#    - Project URL: https://your-project.supabase.co
#    - Anon/Public Key: eyJhbGc...
#    - Service Role Key: eyJhbGc... (keep secret!)
```

**Cost**: Free tier (50,000 monthly active users)

---

### 2. Modal.com (Serverless Python)

**Purpose**: Deploy Python FastAPI backend for panel orchestration

**Setup Steps**:
```bash
# 1. Go to https://modal.com
# 2. Sign up for account
# 3. Install CLI
pip install modal

# 4. Authenticate
modal setup

# 5. Create token
modal token new

# 6. Save credentials:
#    - Token ID: tok_...
#    - Token Secret: secret_...
```

**Cost**: Free tier ($30/month credits)

---

### 3. OpenAI API

**Purpose**: GPT-4 for expert agents

**Setup Steps**:
```bash
# 1. Go to https://platform.openai.com
# 2. Create API key
# 3. Save: sk-proj-...
```

**Cost**: Pay-as-you-go (~$0.01-0.03 per panel discussion)

---

### 4. Anthropic API

**Purpose**: Claude 3.5 Sonnet for expert agents

**Setup Steps**:
```bash
# 1. Go to https://console.anthropic.com
# 2. Create API key
# 3. Save: sk-ant-...
```

**Cost**: Pay-as-you-go (~$0.015-0.075 per panel discussion)

---

### 5. Pinecone (Vector Database)

**Purpose**: Agent embeddings and RAG for expert knowledge

**Setup Steps**:
```bash
# 1. Go to https://www.pinecone.io
# 2. Create free account
# 3. Create index:
#    - Name: vital-agents
#    - Dimensions: 1536 (OpenAI ada-002)
#    - Metric: cosine
#    - Pod: Starter (free)
# 4. Save credentials:
#    - API Key: ...
#    - Environment: us-east-1-aws
```

**Cost**: Free tier (1 index, 100k vectors)

---

### 6. Upstash Redis (Cache)

**Purpose**: Session state, rate limiting, cache

**Setup Steps**:
```bash
# 1. Go to https://upstash.com
# 2. Create Redis database
# 3. Copy connection URL
# 4. Save: redis://default:...@...
```

**Cost**: Free tier (10,000 commands/day)

---

### 7. LangFuse (Monitoring)

**Purpose**: LLM observability and tracing

**Setup Steps**:
```bash
# 1. Go to https://langfuse.com
# 2. Create account
# 3. Create project
# 4. Save credentials:
#    - Public Key: pk-lf-...
#    - Secret Key: sk-lf-...
```

**Cost**: Free tier (50k observations/month)

---

## 🔐 Environment Variables Setup

Create `.env.local` in your project root:

```bash
# =============================================================================
# SUPABASE (Database + Auth)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SECRET!

# =============================================================================
# AI PROVIDERS
# =============================================================================
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# =============================================================================
# VECTOR DATABASE (Pinecone)
# =============================================================================
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=vital-agents

# =============================================================================
# CACHE (Upstash Redis)
# =============================================================================
REDIS_URL=redis://default:your-password@your-instance.upstash.io:6379

# =============================================================================
# MULTI-TENANT CONFIGURATION
# =============================================================================
# Platform admin tenant (never changes)
NEXT_PUBLIC_PLATFORM_TENANT_ID=00000000-0000-0000-0000-000000000001

# Test tenants (for development)
NEXT_PUBLIC_STARTUP_TENANT_ID=11111111-1111-1111-1111-111111111111
NEXT_PUBLIC_ACME_TENANT_ID=22222222-2222-2222-2222-222222222222

# =============================================================================
# MONITORING (LangFuse)
# =============================================================================
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com

# =============================================================================
# MODAL.COM (Serverless Python Deployment)
# =============================================================================
MODAL_TOKEN_ID=tok_your-token-id
MODAL_TOKEN_SECRET=secret_your-token-secret

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STREAMING=true
```

**Security Checklist**:
- ✅ Never commit `.env.local` to git
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys every 90 days

---

## 📁 Project Structure Setup

Run these commands to create the complete directory structure:

```bash
#!/bin/bash
# Create this as setup-structure.sh and run: chmod +x setup-structure.sh && ./setup-structure.sh

echo "🏗️  Creating Ask Panel Multi-Tenant Project Structure..."

# Root project directory (assumes you're in VITAL/)
PROJECT_ROOT=$(pwd)

# =============================================================================
# SHARED KERNEL (Multi-Tenant Core)
# =============================================================================
echo "📦 Creating shared kernel..."
mkdir -p services/shared-kernel/src/vital_shared_kernel/multi_tenant
mkdir -p services/shared-kernel/tests

# =============================================================================
# ASK PANEL SERVICE (Backend)
# =============================================================================
echo "🎭 Creating Ask Panel service..."
mkdir -p services/ask-panel-service/src/domain/models
mkdir -p services/ask-panel-service/src/domain/services
mkdir -p services/ask-panel-service/src/domain/strategies
mkdir -p services/ask-panel-service/src/domain/repositories

mkdir -p services/ask-panel-service/src/application/use_cases
mkdir -p services/ask-panel-service/src/application/workflows

mkdir -p services/ask-panel-service/src/api/routes/v1
mkdir -p services/ask-panel-service/src/api/middleware

mkdir -p services/ask-panel-service/src/infrastructure/database
mkdir -p services/ask-panel-service/src/infrastructure/cache
mkdir -p services/ask-panel-service/src/infrastructure/streaming
mkdir -p services/ask-panel-service/src/infrastructure/ai

mkdir -p services/ask-panel-service/tests/unit
mkdir -p services/ask-panel-service/tests/integration
mkdir -p services/ask-panel-service/tests/e2e

# =============================================================================
# FRONTEND APPLICATIONS
# =============================================================================
echo "🎨 Creating frontend structure..."

# Shared components (used by all tenants)
mkdir -p apps/tenant-shared-components/src/components/panels
mkdir -p apps/tenant-shared-components/src/components/experts
mkdir -p apps/tenant-shared-components/src/components/streaming
mkdir -p apps/tenant-shared-components/src/hooks
mkdir -p apps/tenant-shared-components/src/api
mkdir -p apps/tenant-shared-components/src/types

# Tenant-specific frontends
mkdir -p apps/tenant-acme/src/app/panel
mkdir -p apps/tenant-acme/src/components
mkdir -p apps/tenant-acme/src/config
mkdir -p apps/tenant-acme/public

mkdir -p apps/tenant-medtech/src/app/panel
mkdir -p apps/tenant-medtech/src/components
mkdir -p apps/tenant-medtech/src/config
mkdir -p apps/tenant-medtech/public

mkdir -p apps/tenant-healthco/src/app/panel
mkdir -p apps/tenant-healthco/src/components
mkdir -p apps/tenant-healthco/src/config
mkdir -p apps/tenant-healthco/public

# =============================================================================
# INFRASTRUCTURE & CONFIGURATION
# =============================================================================
echo "⚙️  Creating infrastructure..."
mkdir -p infrastructure/terraform
mkdir -p infrastructure/docker
mkdir -p infrastructure/monitoring

# =============================================================================
# DOCUMENTATION
# =============================================================================
echo "📚 Creating documentation..."
mkdir -p docs/architecture
mkdir -p docs/api
mkdir -p docs/guides
mkdir -p docs/examples

# =============================================================================
# SCRIPTS
# =============================================================================
echo "🔧 Creating scripts..."
mkdir -p scripts/database
mkdir -p scripts/deployment
mkdir -p scripts/testing

echo "✅ Project structure created successfully!"
tree -L 3 services/
```

**Expected Structure**:
```
VITAL/
├── services/
│   ├── shared-kernel/              # Multi-tenant core
│   │   ├── src/vital_shared_kernel/
│   │   │   └── multi_tenant/
│   │   └── tests/
│   │
│   ├── ask-panel-service/          # Backend (Python)
│   │   ├── src/
│   │   │   ├── domain/             # Business logic
│   │   │   ├── application/        # Use cases
│   │   │   ├── api/                # FastAPI routes
│   │   │   └── infrastructure/     # DB, cache, streaming
│   │   └── tests/
│   │
├── apps/
│   ├── tenant-shared-components/   # Shared React components
│   ├── tenant-acme/                # Acme Corp frontend
│   ├── tenant-medtech/             # MedTech frontend
│   └── tenant-healthco/            # HealthCo frontend
│
├── infrastructure/
│   ├── terraform/
│   ├── docker/
│   └── monitoring/
│
└── docs/
```

---

## 🗄️ Database Schema Setup

### Step 1: Create Base Schema

Open Supabase SQL Editor and run this script:

**File**: `scripts/database/00_create_base_schema.sql`

```sql
-- =============================================================================
-- VITAL ASK PANEL - MULTI-TENANT DATABASE SCHEMA
-- Version: 1.0
-- Created: 2025-11-01
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TENANTS TABLE
-- Core table that defines each tenant (customer organization)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  
  -- Subscription & Status
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  subscription_tier TEXT NOT NULL DEFAULT 'professional' 
    CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  
  -- Configuration
  settings JSONB DEFAULT '{
    "max_panels_per_month": 100,
    "max_experts_per_panel": 12,
    "enable_streaming": true,
    "enable_consensus": true
  }'::jsonb,
  
  -- Branding
  branding JSONB DEFAULT '{
    "primary_color": "#3B82F6",
    "logo_url": null,
    "font_family": "Inter"
  }'::jsonb,
  
  -- Feature flags
  features JSONB DEFAULT '{
    "structured_panel": true,
    "open_panel": true,
    "socratic_panel": true,
    "adversarial_panel": true,
    "delphi_panel": true,
    "hybrid_panel": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- =============================================================================
-- TENANT USERS JUNCTION TABLE
-- Maps users to tenants with roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role within tenant
  role TEXT NOT NULL DEFAULT 'member' 
    CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'invited')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  -- Ensure one user can't be in same tenant twice
  UNIQUE(tenant_id, user_id)
);

-- Create indexes for tenant_users
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);

-- =============================================================================
-- PANELS TABLE
-- Core table for panel discussions
-- =============================================================================
CREATE TABLE IF NOT EXISTS panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Panel Configuration
  title TEXT NOT NULL,
  query TEXT NOT NULL,
  panel_type TEXT NOT NULL 
    CHECK (panel_type IN ('structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid')),
  
  -- Execution Status
  status TEXT NOT NULL DEFAULT 'created' 
    CHECK (status IN ('created', 'queued', 'executing', 'completed', 'failed', 'cancelled')),
  
  -- Configuration
  configuration JSONB DEFAULT '{
    "max_rounds": 3,
    "min_consensus": 0.70,
    "enable_dissent": true,
    "streaming_enabled": true
  }'::jsonb,
  
  -- Selected Agents
  agents JSONB DEFAULT '[]'::jsonb,
  
  -- Timing
  estimated_duration INTEGER, -- seconds
  actual_duration INTEGER,    -- seconds
  
  -- Results
  consensus_level NUMERIC(5,2), -- 0.00 to 1.00
  final_recommendation TEXT,
  dissenting_opinions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for panels
CREATE INDEX idx_panels_tenant_id ON panels(tenant_id);
CREATE INDEX idx_panels_user_id ON panels(user_id);
CREATE INDEX idx_panels_status ON panels(status);
CREATE INDEX idx_panels_panel_type ON panels(panel_type);
CREATE INDEX idx_panels_created_at ON panels(created_at DESC);
CREATE INDEX idx_panels_completed_at ON panels(completed_at DESC);

-- =============================================================================
-- PANEL RESPONSES TABLE
-- Individual expert responses within a panel
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Agent Information
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_role TEXT,
  
  -- Response Details
  round_number INTEGER NOT NULL DEFAULT 1,
  response_text TEXT NOT NULL,
  
  -- Confidence & Reasoning
  confidence_score NUMERIC(5,2), -- 0.00 to 1.00
  reasoning JSONB DEFAULT '{
    "evidence": [],
    "assumptions": [],
    "caveats": []
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "tokens_used": 0,
    "latency_ms": 0,
    "model": null
  }'::jsonb
);

-- Create indexes for panel_responses
CREATE INDEX idx_panel_responses_panel_id ON panel_responses(panel_id);
CREATE INDEX idx_panel_responses_tenant_id ON panel_responses(tenant_id);
CREATE INDEX idx_panel_responses_round ON panel_responses(panel_id, round_number);

-- =============================================================================
-- PANEL CONSENSUS TABLE
-- Tracks consensus evolution across rounds
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_consensus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Round Information
  round_number INTEGER NOT NULL,
  
  -- Consensus Metrics
  consensus_level NUMERIC(5,2) NOT NULL, -- 0.00 to 1.00
  
  -- Multi-dimensional Analysis
  dimensions JSONB NOT NULL DEFAULT '{
    "technical": 0.0,
    "regulatory": 0.0,
    "clinical": 0.0,
    "commercial": 0.0
  }'::jsonb,
  
  -- Agreement Analysis
  converging_points JSONB DEFAULT '[]'::jsonb,
  diverging_points JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one consensus record per round per panel
  UNIQUE(panel_id, round_number)
);

-- Create indexes for panel_consensus
CREATE INDEX idx_panel_consensus_panel_id ON panel_consensus(panel_id);
CREATE INDEX idx_panel_consensus_tenant_id ON panel_consensus(tenant_id);

-- =============================================================================
-- AGENT USAGE TABLE
-- Track agent usage for billing and analytics
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Usage Details
  agent_id TEXT NOT NULL,
  panel_id UUID REFERENCES panels(id) ON DELETE SET NULL,
  
  -- Metrics
  tokens_used INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER,
  cost_usd NUMERIC(10,4),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for agent_usage
CREATE INDEX idx_agent_usage_tenant_id ON agent_usage(tenant_id);
CREATE INDEX idx_agent_usage_user_id ON agent_usage(user_id);
CREATE INDEX idx_agent_usage_agent_id ON agent_usage(agent_id);
CREATE INDEX idx_agent_usage_created_at ON agent_usage(created_at DESC);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panels_updated_at 
  BEFORE UPDATE ON panels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INSERT TEST TENANTS
-- =============================================================================
INSERT INTO tenants (id, name, slug, subdomain, subscription_tier, status) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Platform Admin',
    'platform',
    'platform',
    'enterprise',
    'active'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Acme Healthcare',
    'acme',
    'acme',
    'professional',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'MedTech Innovations',
    'medtech',
    'medtech',
    'professional',
    'trial'
  )
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as tenant_count FROM tenants;
```

### Step 2: Enable Row-Level Security (RLS)

**File**: `scripts/database/01_enable_rls.sql`

```sql
-- =============================================================================
-- ENABLE ROW-LEVEL SECURITY ON ALL TABLES
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR TENANTS
-- =============================================================================

-- Users can only see tenants they belong to
CREATE POLICY "Users can view their own tenants"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only owners can update tenant settings
CREATE POLICY "Owners can update their tenants"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- =============================================================================
-- RLS POLICIES FOR PANELS
-- =============================================================================

-- Users can view panels in their tenant
CREATE POLICY "Users can view panels in their tenant"
  ON panels FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create panels in their tenant
CREATE POLICY "Users can create panels in their tenant"
  ON panels FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can update their own panels
CREATE POLICY "Users can update their own panels"
  ON panels FOR UPDATE
  USING (
    user_id = auth.uid()
    AND tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own panels
CREATE POLICY "Users can delete their own panels"
  ON panels FOR DELETE
  USING (
    user_id = auth.uid()
    AND tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- RLS POLICIES FOR PANEL RESPONSES
-- =============================================================================

CREATE POLICY "Users can view panel responses in their tenant"
  ON panel_responses FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert panel responses"
  ON panel_responses FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- =============================================================================
-- RLS POLICIES FOR PANEL CONSENSUS
-- =============================================================================

CREATE POLICY "Users can view consensus in their tenant"
  ON panel_consensus FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert consensus"
  ON panel_consensus FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- RLS POLICIES FOR AGENT USAGE
-- =============================================================================

CREATE POLICY "Users can view their agent usage"
  ON agent_usage FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role can track agent usage"
  ON agent_usage FOR INSERT
  WITH CHECK (true);

-- Success message
SELECT 'Row-Level Security enabled successfully!' as status;
```

### Step 3: Verify Database Setup

**File**: `scripts/database/02_verify_setup.sql`

```sql
-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'tenants', 
    'tenant_users', 
    'panels', 
    'panel_responses',
    'panel_consensus',
    'agent_usage'
  )
ORDER BY table_name;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tenants', 
    'tenant_users', 
    'panels', 
    'panel_responses',
    'panel_consensus',
    'agent_usage'
  );

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check test tenants
SELECT 
  id,
  name,
  slug,
  subdomain,
  subscription_tier,
  status
FROM tenants
ORDER BY created_at;

-- Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'panels', 'panel_responses')
ORDER BY tablename, indexname;

-- Success message
SELECT 
  '✅ Database setup verified!' as status,
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policy_count;
```

---

## ✅ Validation Checklist

Before proceeding to Phase 1, verify all items:

### Services Configured
- [ ] Supabase project created and credentials saved
- [ ] Modal.com authenticated (`modal setup` completed)
- [ ] OpenAI API key obtained and tested
- [ ] Anthropic API key obtained and tested
- [ ] Pinecone index created (vital-agents, 1536 dimensions)
- [ ] Upstash Redis database created
- [ ] LangFuse project created

### Environment Setup
- [ ] `.env.local` file created with all variables
- [ ] `.env.local` added to `.gitignore`
- [ ] All API keys validated (run test queries)

### Project Structure
- [ ] Directory structure created (`tree services/` shows correct layout)
- [ ] All required folders exist

### Database
- [ ] Base schema created (run `00_create_base_schema.sql`)
- [ ] 3 test tenants inserted
- [ ] RLS enabled on all tables (run `01_enable_rls.sql`)
- [ ] Policies created and verified (run `02_verify_setup.sql`)

### Verification Commands

```bash
# Test Supabase connection
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/tenants?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Test Modal authentication
modal token verify

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# Test Redis connection
redis-cli -u $REDIS_URL PING
# Expected output: PONG

# Test Pinecone connection
curl https://api.pinecone.io/indexes \
  -H "Api-Key: $PINECONE_API_KEY"
```

---

## 🎉 Phase 0 Complete!

You've successfully set up:
- ✅ All external service accounts
- ✅ Environment variables configured
- ✅ Project directory structure
- ✅ Multi-tenant database schema with RLS
- ✅ Test tenants inserted

### Estimated Cost (Monthly)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Supabase | 500MB | Light dev | $0 |
| Modal.com | $30 credits | ~10 panels/day | $0 |
| OpenAI | Pay-as-you-go | ~100 panels/month | ~$3 |
| Anthropic | Pay-as-you-go | ~100 panels/month | ~$7.50 |
| Pinecone | 100k vectors | 136 agents | $0 |
| Upstash Redis | 10k commands/day | Dev usage | $0 |
| LangFuse | 50k observations | Light monitoring | $0 |
| **TOTAL** | | | **~$10.50/month** |

### Next Steps

**Proceed to Phase 1**: Multi-Tenant Foundation

In Phase 1, you'll build:
- Tenant Context Management (TenantId value object, context variables)
- Tenant-Aware Database Clients (Supabase + Redis with automatic filtering)
- Tenant Middleware (X-Tenant-ID header validation)
- 4-Layer Security Architecture

**Time Estimate**: 2-3 days

---

## 📞 Troubleshooting

### Issue: Supabase connection fails

```bash
# Check project URL and keys
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### Issue: Modal authentication fails

```bash
# Re-authenticate
modal setup

# Check token
modal token verify

# If still failing, create new token
modal token new --name "vital-dev"
```

### Issue: Database schema creation fails

```bash
# Check if tables already exist
psql $DATABASE_URL -c "\dt"

# Drop all tables and start fresh (⚠️  CAUTION: Destroys data)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run schema creation
psql $DATABASE_URL -f scripts/database/00_create_base_schema.sql
```

---

**Phase 0 Complete** ✅ | **Next**: [Phase 1 - Multi-Tenant Foundation](PHASE_1_MULTI_TENANT_FOUNDATION.md)
