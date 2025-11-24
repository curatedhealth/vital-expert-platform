# Agent Data Architecture - Quick Reference Card

**Last Updated:** 2025-11-23

---

## The Golden Rule

> **Metadata lives in JSONB, not direct columns.**
> `display_name`, `tier`, `tags` are in `agents.metadata`, not separate columns.

---

## What EXISTS vs. What DOESN'T

### ✅ EXISTS as Direct Columns

```typescript
id                  // UUID primary key
name                // Internal identifier
slug                // URL-safe identifier
description         // Agent description
system_prompt       // AI system prompt
base_model          // AI model name (gpt-4, etc.)
temperature         // AI temperature
max_tokens          // AI max tokens
status              // development | testing | active
metadata            // JSONB (contains everything below ⬇️)
```

### ❌ DOES NOT EXIST (stored in metadata)

```typescript
display_name        // metadata.displayName
tier                // metadata.tier
tags                // metadata.tags
color               // metadata.color
model_justification // metadata.modelJustification
model_citation      // metadata.modelCitation
```

---

## Quick Query Patterns

### Query Agents (Correct Way)

```typescript
// ❌ WRONG - queries non-existent columns
const { data } = await supabase
  .from('agents')
  .select('*, display_name, tier');  // ❌ FAILS!

// ✅ CORRECT - use enriched view
const { data } = await supabase
  .from('v_agents_enriched')
  .select('*')
  .eq('tier', 3)
  .eq('status', 'active');

// ✅ OR - query metadata with JSONB operators
const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('metadata->tier', 3);  // JSONB operator
```

### Transform to Application Model

```typescript
import { transformAgentRow } from '@/lib/agents/agent-data-transformer';

// Raw database row
const { data: rows } = await supabase.from('agents').select('*');

// Transform to app model (adds computed fields)
const agents = rows.map(transformAgentRow);

// Now you can use:
agents[0].display_name  // ✅ Works
agents[0].tier          // ✅ Works
agents[0].tags          // ✅ Works
```

---

## Common JSONB Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `->` | Get JSON object | `metadata->'tags'` |
| `->>` | Get text value | `metadata->>'displayName'` |
| `@>` | Contains (JSON) | `metadata->'tags' @> '["clinical"]'` |
| `?` | Has key | `metadata ? 'tier'` |
| `?|` | Has any key | `metadata ?| array['tier', 'color']` |

**Example:**
```sql
-- Find Tier-3 HIPAA-compliant agents
SELECT * FROM agents
WHERE metadata->>'tier' = '3'
  AND (metadata->>'hipaaCompliant')::BOOLEAN = TRUE;
```

---

## Metadata Schema Cheatsheet

```typescript
interface AgentMetadata {
  // Required
  schemaVersion: string;      // "1.0"

  // Display
  displayName?: string;       // "Clinical Operations Specialist"
  tier?: number;              // 1 | 2 | 3
  color?: string;             // "#3B82F6"
  tags?: string[];            // ["clinical", "safety-critical"]

  // Evidence (required for Tier 2+)
  modelJustification?: string;
  modelCitation?: string;
  benchmarkScores?: { [key: string]: number };

  // Compliance
  hipaaCompliant?: boolean;
  dataClassification?: "public" | "internal" | "confidential" | "restricted";

  // Features
  ragEnabled?: boolean;
  verifyEnabled?: boolean;
  pharmaEnabled?: boolean;
}
```

---

## Tier Guidelines

| Tier | Model | Temp | Tokens | Cost | Use Case |
|------|-------|------|--------|------|----------|
| 1 | gpt-3.5-turbo | 0.6 | 2000 | $0.015 | Foundational, high-volume |
| 2 | gpt-4 | 0.4 | 3000 | $0.12 | Specialist, domain-specific |
| 3 | gpt-4 | 0.2 | 4000 | $0.35 | Ultra-specialist, safety-critical |

---

## File Locations

```
.vital-docs/vital-expert-docs/11-data-schema/agents/
├── AGENT_DATA_ARCHITECTURE.md       ← Main documentation
├── MIGRATION_GUIDE.md               ← Step-by-step migration
├── QUICK_REFERENCE.md               ← This file
├── migrations/
│   ├── 001_create_metadata_indexes.sql
│   └── 002_backfill_agent_metadata.sql
├── views/
│   └── v_agents_enriched.sql
└── utils/
    ├── agent-metadata.schema.ts
    └── agent-data-transformer.ts
```

---

## Common Mistakes to Avoid

### ❌ DON'T

```typescript
// Don't select non-existent columns
.select('display_name, tier')

// Don't bypass transformation
const agents = rawData;  // Missing computed fields!

// Don't hardcode metadata structure
agent.metadata.random_field = 'value';  // Not validated!
```

### ✅ DO

```typescript
// Use enriched view or transform
const { data } = await supabase.from('v_agents_enriched').select('*');

// Always transform raw rows
const agents = rawData.map(transformAgentRow);

// Use typed metadata
import { AgentMetadata } from '@/lib/agents/agent-metadata.schema';
const metadata: AgentMetadata = { displayName: 'Agent' };
```

---

## Troubleshooting

### "Column display_name does not exist"
→ You're querying the wrong table. Use `v_agents_enriched` or transform raw rows.

### "Metadata is NULL"
→ Run migration: `002_backfill_agent_metadata.sql`

### "JSONB query is slow"
→ Check indexes exist: `\di agents`

### "Tier is undefined"
→ Ensure you're using transformed data: `transformAgentRow()`

---

## Quick Commands

```bash
# Apply migrations
psql $DATABASE_URL -f migrations/001_create_metadata_indexes.sql
psql $DATABASE_URL -f migrations/002_backfill_agent_metadata.sql
psql $DATABASE_URL -f views/v_agents_enriched.sql

# Refresh materialized view
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;"

# Check metadata status
psql $DATABASE_URL -c "
SELECT
  COUNT(*) as total,
  COUNT(metadata->>'displayName') as has_display_name,
  COUNT(metadata->>'tier') as has_tier
FROM agents WHERE deleted_at IS NULL;
"
```

---

## Getting Help

1. Read `AGENT_DATA_ARCHITECTURE.md` for full details
2. Follow `MIGRATION_GUIDE.md` for step-by-step instructions
3. Check `utils/` for TypeScript helpers
4. Contact VITAL Data Strategist Agent for questions

---

**Quick Reference Version:** 1.0
**Supports:** Agent Data Architecture v1.0
