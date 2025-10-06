# Knowledge Domains Setup Guide

## 🎯 Overview

This guide will help you set up **30 knowledge domains** for your RAG system, organized in 3 tiers.

## 📋 Step 1: Create the Database Table

### Option A: Using Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the following SQL:

```sql
-- Create knowledge_domains table for RAG system
CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1, -- 1=Core, 2=Specialized, 3=Emerging
  priority INTEGER NOT NULL DEFAULT 1, -- Display/sorting priority (1-30)
  keywords TEXT[] DEFAULT '{}', -- Search keywords for matching
  sub_domains TEXT[] DEFAULT '{}', -- Sub-domain categories
  agent_count_estimate INTEGER DEFAULT 0, -- Estimated number of agents
  color TEXT DEFAULT '#3B82F6', -- UI color code
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_code ON public.knowledge_domains(code);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_keywords ON public.knowledge_domains USING GIN(keywords);

-- Enable RLS
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);
```

4. Click **Run** or press `Ctrl+Enter`
5. Verify success message

### Option B: Using Migration File

```bash
# Copy migration to your Supabase migrations folder
cat database/sql/migrations/008_create_knowledge_domains.sql | supabase db reset
```

## 📋 Step 2: Populate the 30 Domains

Run the creation script:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU \
node scripts/create-knowledge-domains.js
```

Expected output:
```
🌱 Creating 30 Knowledge Domains for RAG System...

================================================================================
📊 TIER 1: CORE DOMAINS (15 domains)
================================================================================

  ✅ Regulatory Affairs (regulatory_affairs)
     └─ Priority: 1 | Estimated Agents: 85 | Color: #3B82F6
  ✅ Clinical Development (clinical_development)
     └─ Priority: 2 | Estimated Agents: 37 | Color: #8B5CF6
  ...

================================================================================
📊 SUMMARY
================================================================================
✅ Domains Created: 30
⏭️  Domains Skipped: 0
❌ Errors: 0
📈 Total Domains: 30

🔍 Verification: 30 domains in database

Breakdown by Tier:
  Tier 1 (Core): 15 domains
  Tier 2 (Specialized): 10 domains
  Tier 3 (Emerging): 5 domains
```

## 📋 Step 3: Verify Setup

### Check Domain Count

```bash
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?select=count" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Prefer: count=exact"
```

### View All Domains

```bash
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?select=*&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

### View Domains by Tier

```bash
# Tier 1 (Core)
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?select=name,slug&tier=eq.1&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'

# Tier 2 (Specialized)
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?select=name,slug&tier=eq.2&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'

# Tier 3 (Emerging)
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?select=name,slug&tier=eq.3&order=priority" \
  -H "apikey: YOUR_ANON_KEY" | jq '.'
```

## 📊 The 30 Knowledge Domains

### 🎯 Tier 1: Core Domains (15)
*Must-have domains covering 100% of agents*

| Priority | Code | Name | Slug | Agents |
|----------|------|------|------|--------|
| 1 | REG_AFFAIRS | Regulatory Affairs | regulatory_affairs | 85 |
| 2 | CLIN_DEV | Clinical Development | clinical_development | 37 |
| 3 | PV | Pharmacovigilance | pharmacovigilance | 25 |
| 4 | QM | Quality Management | quality_management | 20 |
| 5 | MED_AFF | Medical Affairs | medical_affairs | 15 |
| 6 | COMM_STRAT | Commercial Strategy | commercial_strategy | 29 |
| 7 | DRUG_DEV | Drug Development | drug_development | 39 |
| 8 | CLIN_DATA | Clinical Data Analytics | clinical_data_analytics | 18 |
| 9 | MFG_OPS | Manufacturing Operations | manufacturing_operations | 17 |
| 10 | MED_DEV | Medical Devices | medical_devices | 12 |
| 11 | DIGITAL_HEALTH | Digital Health | digital_health | 34 |
| 12 | SUPPLY_CHAIN | Supply Chain | supply_chain | 15 |
| 13 | LEGAL_COMP | Legal & Compliance | legal_compliance | 10 |
| 14 | HEOR | Health Economics & Outcomes Research | health_economics | 12 |
| 15 | BIZ_STRAT | Business Strategy | business_strategy | 10 |

### ⭐ Tier 2: Specialized Domains (10)
*High-value domains for specialized functions*

| Priority | Code | Name | Slug | Agents |
|----------|------|------|------|--------|
| 16 | PROD_LABEL | Product Labeling | product_labeling | 8 |
| 17 | POST_MKT | Post-Market Activities | post_market_activities | 10 |
| 18 | CDX | Companion Diagnostics | companion_diagnostics | 6 |
| 19 | NONCLIN_SCI | Nonclinical Sciences | nonclinical_sciences | 12 |
| 20 | PATIENT_ENG | Patient Engagement | patient_focus | 5 |
| 21 | RISK_MGMT | Risk Management | risk_management | 8 |
| 22 | SCI_PUB | Scientific Publications | scientific_publications | 7 |
| 23 | KOL_ENG | KOL & Stakeholder Engagement | stakeholder_engagement | 6 |
| 24 | EVID_GEN | Evidence Generation | evidence_generation | 5 |
| 25 | GLOBAL_ACCESS | Global Market Access | global_access | 8 |

### 🚀 Tier 3: Emerging Domains (5)
*Future-focused domains for innovation*

| Priority | Code | Name | Slug | Agents |
|----------|------|------|------|--------|
| 26 | RWD | Real-World Data & Evidence | real_world_data | 8 |
| 27 | PRECISION_MED | Precision Medicine | precision_medicine | 6 |
| 28 | TELEMEDICINE | Telemedicine & Remote Care | telemedicine | 5 |
| 29 | SUSTAINABILITY | Sustainability & ESG | sustainability | 3 |
| 30 | RARE_DISEASES | Rare Diseases & Orphan Drugs | rare_diseases | 4 |

## 🔧 Integration with Agents

### Update Agent Schema

Ensure your `agents` table has a `knowledge_domains` column:

```sql
-- Add column if it doesn't exist
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS knowledge_domains TEXT[] DEFAULT '{}';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains
ON public.agents USING GIN(knowledge_domains);
```

### Assign Domains to Agents

```javascript
// Example: Update agent with knowledge domains
const { data, error } = await supabase
  .from('agents')
  .update({
    knowledge_domains: [
      'regulatory_affairs',
      'clinical_development',
      'pharmacovigilance'
    ]
  })
  .eq('id', agentId);
```

### Filter Agents by Domain

```javascript
// Example: Get all regulatory agents
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .contains('knowledge_domains', ['regulatory_affairs']);
```

## 🎨 UI Integration

### Display Domains with Colors

```typescript
const domainColors: Record<string, string> = {
  'regulatory_affairs': '#3B82F6',
  'clinical_development': '#8B5CF6',
  'pharmacovigilance': '#EF4444',
  // ... etc
};

<Badge style={{ backgroundColor: domainColors[domain] }}>
  {domain}
</Badge>
```

### Filter by Tier

```typescript
// Component example
<Select>
  <option value="all">All Tiers</option>
  <option value="1">Tier 1 - Core Domains</option>
  <option value="2">Tier 2 - Specialized</option>
  <option value="3">Tier 3 - Emerging</option>
</Select>
```

## 📈 Usage Analytics

### Track Domain Usage

```sql
-- Count agents per domain
SELECT
  unnest(knowledge_domains) as domain,
  COUNT(*) as agent_count
FROM agents
WHERE status = 'active'
GROUP BY domain
ORDER BY agent_count DESC;
```

### Most Popular Domains

```sql
-- Top 10 most used domains
SELECT
  kd.name,
  kd.slug,
  COUNT(a.id) as usage_count
FROM knowledge_domains kd
LEFT JOIN agents a ON kd.slug = ANY(a.knowledge_domains)
WHERE a.status = 'active'
GROUP BY kd.id, kd.name, kd.slug
ORDER BY usage_count DESC
LIMIT 10;
```

## 🔄 Maintenance

### Update Domain Metadata

```javascript
// Update agent count estimates
const { data: agents } = await supabase
  .from('agents')
  .select('knowledge_domains')
  .eq('status', 'active');

// Count usage per domain
const domainCounts = {};
agents.forEach(agent => {
  agent.knowledge_domains?.forEach(domain => {
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });
});

// Update each domain
for (const [slug, count] of Object.entries(domainCounts)) {
  await supabase
    .from('knowledge_domains')
    .update({ agent_count_estimate: count })
    .eq('slug', slug);
}
```

## 🐛 Troubleshooting

### Table doesn't exist

**Error**: `Could not find the table 'public.knowledge_domains'`

**Solution**: Run Step 1 to create the table

### Permission denied

**Error**: `permission denied for table knowledge_domains`

**Solution**: Ensure RLS policies are created (see Step 1)

### Duplicate key error

**Error**: `duplicate key value violates unique constraint`

**Solution**: Domain already exists, check with:

```bash
curl -s "http://127.0.0.1:54321/rest/v1/knowledge_domains?slug=eq.regulatory_affairs" \
  -H "apikey: YOUR_ANON_KEY"
```

## ✅ Success Criteria

- [x] `knowledge_domains` table created with 11 columns
- [x] 6 indexes created for performance
- [x] RLS enabled with read policy
- [x] 30 domains inserted (15 Tier 1, 10 Tier 2, 5 Tier 3)
- [x] All domains have unique slugs, codes, and names
- [x] Each domain has color, keywords, and sub_domains

## 📚 Next Steps

1. **Populate Knowledge Bases**: Create RAG knowledge bases for top 10 domains
2. **Assign to Agents**: Map existing agents to appropriate domains
3. **Upload Documents**: Add FDA guidelines, ICH docs, etc.
4. **Test Retrieval**: Query RAG system with domain-specific questions
5. **Monitor Usage**: Track which domains are most queried

---

**For detailed domain descriptions and mappings, see:**
- `RECOMMENDED_KNOWLEDGE_DOMAINS.md` - Full domain specifications
- `scripts/create-knowledge-domains.js` - Creation script
- `database/sql/migrations/008_create_knowledge_domains.sql` - Migration file
