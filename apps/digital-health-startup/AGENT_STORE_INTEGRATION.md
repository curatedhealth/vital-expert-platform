# Agent Store Integration - Ask Panel & Ask Expert

## Overview

The Agent Store has been successfully integrated with Ask Panel and Ask Expert services. This integration allows both services to use real agent configurations from the Supabase database instead of hardcoded expert types.

**Important**: This integration is **read-only** - it only fetches data from Supabase and does not modify any database tables or data.

## What Was Changed

### 1. Created Integration Modules

**Ask Panel Integration** (`src/features/ask-panel/services/agent-store-integration.ts`):
- `fetchAgentsByIds()` - Fetches agents by database IDs
- `getAllActiveAgents()` - Gets all active agents for selection
- `searchAgentsForQuery()` - Searches agents for automatic selection
- `convertAgentToPanelDefinition()` - Converts database agents to panel format

**Ask Expert Integration** (`src/features/ask-expert/services/agent-store-integration.ts`):
- `getAgentConfig()` - Fetches agent configuration by ID
- `selectBestAgentForQuery()` - Intelligent agent selection for automatic mode
- `getAllActiveAgentsForSelection()` - Gets all agents for UI selection

### 2. Updated API Routes

**Ask Panel API** (`/api/ask-panel`):
- ✅ Supports both legacy `ExpertType` enum and new `agentIds` array
- ✅ New GET endpoint: `?action=agents` to list agents from store
- ✅ Automatically uses agent store when `agentIds` provided

**Ask Expert API** (`/api/ask-expert/orchestrate`):
- ✅ Mode 1 (Manual): Fetches agent config from store when `agentId` provided
- ✅ Mode 2 (Automatic): Automatically selects best agent from store
- ✅ Uses agent configurations (system prompt, model, temperature, etc.)

### 3. Enhanced Logging

All integration points now include detailed logging:
- `📦 [Agent Store]` - Agent store operations
- `✅ [Agent Store]` - Successful operations
- `⚠️ [Agent Store]` - Warnings (agent not found, inactive, etc.)
- `❌ [Agent Store]` - Errors

## How to Verify Integration

### Method 1: API Verification Endpoint

```bash
# Check agent store status
curl http://localhost:3000/api/agent-store/verify

# Test fetching a specific agent (replace with actual agent ID)
curl "http://localhost:3000/api/agent-store/verify?action=test-fetch&agentId=YOUR_AGENT_ID"

# Test automatic selection
curl "http://localhost:3000/api/agent-store/verify?action=test-select&query=FDA%20510(k)%20submission"
```

### Method 2: Check Console Logs

When using Ask Panel or Ask Expert, look for these logs:

**Ask Panel:**
```
📦 [Panel] Using Agent Store - Fetching agents by IDs...
📦 [Agent Store] Fetching 2 agents from store...
  ✅ Loaded: FDA Regulatory Strategist (active)
  ✅ Loaded: Clinical Protocol Designer (active)
✅ [Panel] Using 2 agents from Agent Store
```

**Ask Expert Mode 1:**
```
👤 [Orchestrate] Agent ID: agent-uuid-1
📦 [Agent Store] Fetching agent config: agent-uuid-1
✅ [Agent Store] Loaded: FDA Regulatory Strategist (gpt-4o)
✅ [Orchestrate] Agent loaded: FDA Regulatory Strategist (gpt-4o)
```

**Ask Expert Mode 2:**
```
🔍 [Agent Store] Searching for best agent for query: "FDA 510(k) submission..."
🔍 [Agent Store] Found 5 candidate agents
✅ [Agent Store] Selected: FDA Regulatory Strategist (Tier 1, Priority 1)
✅ [Orchestrate] Auto-selected agent: FDA Regulatory Strategist (agent-uuid-1)
```

### Method 3: List Agents Endpoint

```bash
# Get all agents from store
curl http://localhost:3000/api/ask-panel?action=agents
```

Expected response:
```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-uuid-1",
      "name": "FDA Regulatory Strategist",
      "description": "Expert in FDA regulatory pathways",
      "expertise": ["FDA", "Regulatory Strategy"],
      "model": "gpt-4o"
    },
    ...
  ],
  "source": "agent-store"
}
```

## Usage Examples

### Ask Panel with Agent IDs

```typescript
// POST /api/ask-panel
{
  "question": "What are the regulatory requirements?",
  "mode": "collaborative",
  "agentIds": ["agent-uuid-1", "agent-uuid-2"]  // Use agent IDs from store
}
```

### Ask Expert Mode 1 (Manual)

```typescript
// POST /api/ask-expert/orchestrate
{
  "mode": "manual",
  "agentId": "agent-uuid-1",  // Agent ID from store
  "message": "What testing is required?"
}
```

### Ask Expert Mode 2 (Automatic)

```typescript
// POST /api/ask-expert/orchestrate
{
  "mode": "automatic",
  "message": "I need help with FDA 510(k) submission"
  // Agent automatically selected from store
}
```

## Backward Compatibility

The integration maintains full backward compatibility:

- **Legacy Expert Types**: Still work if no `agentIds` provided
- **Graceful Fallback**: If agents not found, falls back to legacy templates
- **No Breaking Changes**: Existing code continues to work

## Error Handling

The integration includes comprehensive error handling:

- ✅ **Agent Not Found**: Returns null, logs warning, falls back gracefully
- ✅ **Inactive Agent**: Skips inactive agents, logs warning
- ✅ **Database Errors**: Catches and logs errors, returns empty arrays
- ✅ **No Agents Available**: Falls back to legacy expert templates

## Files Modified (No Supabase Changes)

### Created Files:
- `src/features/ask-panel/services/agent-store-integration.ts`
- `src/features/ask-expert/services/agent-store-integration.ts`
- `src/features/ask-expert/utils/verify-agent-store.ts`
- `src/app/api/agent-store/verify/route.ts`

### Modified Files:
- `src/features/ask-panel/services/ask-panel-orchestrator.ts`
- `src/app/api/ask-panel/route.ts`
- `src/app/api/ask-expert/orchestrate/route.ts`

**Note**: No Supabase migrations, seed files, or database schema changes were made. The integration only reads from existing Supabase tables.

## Next Steps

1. **Verify Agents Exist**: Check Supabase to ensure agents are in the database
2. **Test Integration**: Use the verification endpoint to test
3. **Update Frontend**: Update UI components to use agent IDs instead of expert types
4. **Monitor Logs**: Watch console logs to see when agents are loaded from store

## Troubleshooting

### No Agents Found

If you see `⚠️ No active agents found`, check:
1. Agents exist in Supabase `agents` table
2. Agents have `status = 'active'` or `status = 'testing'`
3. RLS policies allow reading agents
4. API route has proper authentication

### Agent Not Loading

If agent fetch fails:
1. Check agent ID is correct (UUID format)
2. Verify agent exists in database
3. Check console logs for specific error messages
4. Verify Supabase connection is working

### Fallback to Legacy

If you see `⚠️ No agents found in store, falling back to legacy expert templates`:
- This is expected behavior - system gracefully falls back
- Check Supabase to ensure agents are seeded
- Verify agent status is 'active' or 'testing'

