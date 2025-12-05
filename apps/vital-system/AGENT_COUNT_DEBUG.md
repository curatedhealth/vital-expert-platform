# Agent Count Debugging Guide

## Issue
Panel shows 0 agents after saving workflow with agent nodes.

## How It Works

### Save Flow:
1. **WorkflowDesignerEnhanced** extracts agent IDs from nodes:
   - Looks for nodes with `type === 'agent'`
   - Extracts `agentId` from `node.data.config.agentId`
   - Sends array of agent IDs in `selected_agents` field

2. **API POST** saves to database:
   - Receives `selected_agents` array from frontend
   - Stores in `metadata.selected_agents`
   - Stores `workflow_definition` in `metadata.workflow_definition`

3. **API GET** loads from database:
   - Reads `metadata.selected_agents`
   - Fetches agent details from `agents` table
   - Returns panel with `agents` array

## Debug Steps

### 1. Check Browser Console Logs

When you click Save, look for these logs:

```
[WorkflowDesigner] Extracted agent IDs: ["agent-id-1", "agent-id-2"] from X nodes
[WorkflowDesigner] Saving panel with payload: {...}
```

**If agent IDs are empty:**
- Your nodes don't have `config.agentId` set
- Check that you dragged agents onto the canvas (not just added empty nodes)

### 2. Check Network Tab

Open DevTools → Network → Find the POST request to `/api/panels/[slug]`

**Request Payload should include:**
```json
{
  "selected_agents": ["agent-id-1", "agent-id-2"],
  "workflow_definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**If `selected_agents` is empty:**
- Nodes don't have agent IDs attached
- Try re-dragging agents onto the workflow

### 3. Check Server Logs

In your terminal running `npm run dev`, look for:

```
[API] Prepared panelData: {
  selected_agents_in_metadata: ["agent-id-1", "agent-id-2"],
  selected_agents_count: 2,
  workflow_nodes_count: 5
}
```

**If count is 0:**
- Frontend didn't send agent IDs
- Go back to step 1

### 4. Check Database

After saving, check what's actually stored:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data } = await supabase
    .from('panels')
    .select('slug, name, metadata')
    .eq('slug', 'test-panel-drug-hash-jcnodk')
    .single();

  console.log('Selected Agents:', data.metadata?.selected_agents);
  console.log('Workflow Nodes:', data.metadata?.workflow_definition?.nodes?.length);
})();
"
```

**Expected output:**
```
Selected Agents: [ 'agent-id-1', 'agent-id-2' ]
Workflow Nodes: 5
```

### 5. Check Page Load

When loading the panel page, check server logs:

```
[API] Fetching panel data for: test-panel-drug-hash-jcnodk
[API] Selected agent IDs from metadata: ["agent-id-1", "agent-id-2"]
[API] ✅ Fetched panel "test-panel-drug-hash-jcnodk" with 2 agents from database in 150ms
```

**If agent IDs are empty:**
- Data wasn't saved correctly to metadata
- Go back to step 3

## Common Issues

### Issue 1: Agent nodes don't have agentId

**Symptom:** Logs show "⚠️ Node xxx is type agent but has no agentId"

**Solution:**
1. Delete the existing agent nodes
2. Drag fresh agents from the panel/palette onto the canvas
3. Make sure you see the agent's name and avatar on the node
4. Try saving again

### Issue 2: Nodes created as generic type

**Symptom:** Nodes exist but aren't recognized as agent type

**Solution:**
1. Check node type in browser console
2. Node should have `data.type === 'agent'`
3. If not, use the property panel to change type to "agent"
4. Or delete and re-add from agent palette

### Issue 3: Save succeeds but agents disappear

**Symptom:** Save shows success but refresh shows 0 agents

**Solution:**
1. Check database directly (step 4 above)
2. If metadata has agents but GET returns 0:
   - Agent IDs might be invalid (agents don't exist in database)
   - Check that agent IDs match real agents in `agents` table

### Issue 4: Can't drag agents onto canvas

**Symptom:** Nothing happens when dragging agents

**Solution:**
1. Make sure you're in the "Designer" tab
2. Try dragging onto an empty area of the canvas
3. Check browser console for errors

## Quick Fix Steps

1. **Clear and re-add agents:**
   - Open workflow designer
   - Delete all existing agent nodes
   - Drag fresh agents from the agent selector/palette
   - Each agent should show its name and avatar
   - Click Save

2. **Verify in console:**
   - Open browser DevTools
   - Check for "[WorkflowDesigner] Extracted agent IDs" log
   - Should show array with agent UUIDs

3. **Check response:**
   - Look at Network tab
   - Find POST response
   - Should have `success: true`

4. **Refresh page:**
   - Reload the panel page
   - Agent count should update in header/stats

## Still Not Working?

Share the following logs:

1. Browser console logs (look for `[WorkflowDesigner]`)
2. Network tab - POST request payload
3. Server terminal logs (look for `[API] Prepared panelData`)
4. Database check output from step 4

This will help identify exactly where the flow breaks.
