# Frontend Agents Not Showing - Troubleshooting Guide

## Status: ✅ All 82 Agents Are in Database and API

The API is correctly returning all 82 agents. The issue is likely browser caching.

### Quick Fix: Clear Browser Cache

**Option 1: Hard Refresh (Recommended)**
1. Open `http://localhost:3000/agents` in your browser
2. Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows/Linux)
3. This will force reload and clear cached data

**Option 2: Clear Application Storage**
1. Open `http://localhost:3000/agents`
2. Press **F12** to open DevTools
3. Go to **Application** tab
4. Under **Storage** → **Local Storage**
5. Find `http://localhost:3000`
6. Delete the key `vitalpath-agents-store`
7. Refresh the page (**F5**)

**Option 3: Clear All Site Data**
1. Open DevTools (**F12**)
2. Go to **Application** tab
3. Click **Clear site data** button
4. Refresh the page (**F5**)

### Verify Agents Are Loading

**Check Browser Console:**
1. Open `http://localhost:3000/agents`
2. Press **F12** → **Console** tab
3. Type: `localStorage.getItem('vitalpath-agents-store')`
4. Look for `"agents":[...` in the output
5. Count the agents (should be 82)

**Check Network Tab:**
1. Open `http://localhost:3000/agents`
2. Press **F12** → **Network** tab
3. Refresh page (**F5**)
4. Look for request to `/api/agents-crud`
5. Click on it and check **Preview** tab
6. You should see `agents: Array(82)`

### Current Agent Count: 82

**Tier 1: 78 agents**
- BioGPT: 23 agents (pharmaceutical/medical)
- GPT-4: 18 agents (high-accuracy tasks)
- GPT-4 (legacy): 25 agents
- GPT-3.5-turbo: 12 agents (clinical support)

**Tier 2: 4 agents**
- GPT-4: 4 agents (pre-existing)

### Test API Directly

```bash
# Check total count
curl -s http://localhost:3000/api/agents-crud | jq '.agents | length'
# Should return: 82

# Check first 5 agent names
curl -s http://localhost:3000/api/agents-crud | jq '.agents[0:5] | .[].display_name'

# Check by tier
curl -s http://localhost:3000/api/agents-crud | jq '[.agents | group_by(.tier) | .[] | {tier: .[0].tier, count: length}]'
```

### Still Not Seeing All Agents?

If after clearing cache you still don't see all 82 agents, check:

1. **Filter Settings**: Make sure no filters are applied
   - Search box should be empty
   - Business Function filter: "All"
   - Tier filter: "All"
   - Domain filter: "All"

2. **Scroll Down**: The page may be showing them all, but you need to scroll

3. **View Mode**: Try switching between Grid/List view

4. **Console Errors**: Check browser console for any errors

### Force Reload Agents in Code

If you want to force reload programmatically:

1. Open browser console (**F12** → **Console**)
2. Paste this code:
```javascript
// Clear the store
localStorage.removeItem('vitalpath-agents-store');

// Force reload page
window.location.reload();
```

### Expected Result

After clearing cache, you should see:
- **82 agents** total on the `/agents` page
- Agents organized by tier with badges
- Search and filter functionality
- Each agent showing:
  - Avatar
  - Display name
  - Tier badge (1 or 2)
  - Model name
  - Business function
  - Capabilities
  - Actions (View Details, Add to Chat, etc.)

### Verification

Once you see all agents, you can verify by:
1. Searching for "Drug Information Specialist" - should appear
2. Filtering by Tier 1 - should show 78 agents
3. Filtering by Tier 2 - should show 4 agents
4. Searching for "BioGPT" - should show 23 agents
