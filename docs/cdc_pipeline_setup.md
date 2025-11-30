# VITAL Platform - CDC Pipeline Setup Guide

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Supabase           │     │  CDC Pipeline        │     │  Neo4j Aura     │
│  PostgreSQL         │ ──► │  (Edge Function)     │ ──► │  Knowledge      │
│                     │     │                      │     │  Graph          │
│  • org_functions    │     │  Webhook Handler     │     │                 │
│  • org_departments  │     │  Cypher Mutations    │     │  • Function     │
│  • org_roles        │     │                      │     │  • Department   │
│  • personas         │     │                      │     │  • Role         │
│  • agents           │     │                      │     │  • Persona      │
└─────────────────────┘     └──────────────────────┘     │  • Agent        │
                                                         └─────────────────┘
```

## Components

### 1. Edge Function (`supabase/functions/cdc-neo4j/`)
- Deno-based serverless function
- Receives webhook payloads from database triggers
- Applies Cypher mutations to Neo4j

### 2. Database Triggers (`database/migrations/004_cdc_triggers.sql`)
- AFTER triggers on ontology tables
- Uses `pg_net` extension for async HTTP calls
- Non-blocking (doesn't slow transactions)

### 3. Python CDC Client (`src/integrations/cdc_pipeline.py`)
- Alternative for local development
- Supports Realtime WebSocket and polling modes
- Includes full-sync capability for initial load

---

## Setup Steps

### Step 1: Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy function
supabase functions deploy cdc-neo4j --project-ref bomltkhixeatxuoxmolq
```

### Step 2: Set Neo4j Secrets

```bash
# Set environment variables for the Edge Function
supabase secrets set NEO4J_URI="neo4j+s://13067bdb.databases.neo4j.io"
supabase secrets set NEO4J_USER="neo4j"
supabase secrets set NEO4J_PASSWORD="kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"
```

### Step 3: Enable pg_net Extension (Supabase Dashboard)

1. Go to **Database → Extensions**
2. Enable `pg_net` extension
3. Allows async HTTP calls from triggers

### Step 4: Apply Triggers

Run in **Supabase Dashboard → SQL Editor**:

```sql
-- Paste contents of database/migrations/004_cdc_triggers.sql
```

### Step 5: Verify Setup

```sql
-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE 'cdc_%';
```

---

## Alternative: Python CDC Client

For local development or when Edge Functions aren't available:

### Initial Full Sync
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL
python3 src/integrations/cdc_pipeline.py full-sync
```

### Real-time Mode (WebSocket)
```bash
python3 src/integrations/cdc_pipeline.py realtime
```

### Polling Mode (every 60s)
```bash
python3 src/integrations/cdc_pipeline.py polling
```

---

## Table → Node Mapping

| Supabase Table    | Neo4j Label | Relationships                     |
|-------------------|-------------|-----------------------------------|
| org_functions     | Function    | -                                 |
| org_departments   | Department  | BELONGS_TO → Function             |
| org_roles         | Role        | IN_DEPARTMENT, IN_FUNCTION        |
| personas          | Persona     | BASED_ON_ROLE → Role              |
| agents            | Agent       | SERVES_ROLE, IN_FUNCTION, IN_DEPT |

---

## Monitoring

### Check Edge Function Logs
```bash
supabase functions logs cdc-neo4j --project-ref bomltkhixeatxuoxmolq
```

### Neo4j Verification
```cypher
// Count nodes by label
MATCH (n) RETURN labels(n)[0] as label, count(*) as count ORDER BY count DESC

// Check recent updates
MATCH (n) WHERE n.updated_at > datetime() - duration('PT1H')
RETURN labels(n)[0], n.name, n.updated_at
ORDER BY n.updated_at DESC LIMIT 20
```

---

## Troubleshooting

### Edge Function Not Receiving Webhooks
1. Check if `pg_net` extension is enabled
2. Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'cdc_agents'`
3. Check function deployment: `supabase functions list`

### Neo4j Connection Fails
1. Verify IP whitelist in Neo4j Aura Console
2. Edge Functions have dynamic IPs - consider using Neo4j AuraDB Dedicated with VPC peering

### Missing Relationships
1. Ensure parent nodes exist before children (sync order matters)
2. Run `full-sync` to rebuild graph from scratch
