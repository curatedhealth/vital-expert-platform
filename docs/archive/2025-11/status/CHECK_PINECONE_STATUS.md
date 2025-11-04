# 🔍 Check if Agents are in Pinecone

## Quick Check Methods

### **Method 1: Via API (If Server Running)**

```bash
# Check stats
curl http://localhost:3000/api/agents/sync-to-pinecone
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalAgents": 327,  // Number in Pinecone
    "dimension": 3072,
    "indexFullness": 0.05
  },
  "comparison": {
    "agentsInSupabase": 327,
    "agentsInPinecone": 327,
    "synced": true,
    "syncPercentage": 100
  },
  "needsSync": false
}
```

If `totalAgents: 0` or `needsSync: true`, then sync is needed.

---

### **Method 2: Via Script (Recommended)**

```bash
npx tsx scripts/check-pinecone-agents.ts
```

This script will:
- ✅ Check Pinecone connection
- ✅ Show agent count in Pinecone
- ✅ Compare with Supabase count
- ✅ Test search functionality
- ✅ Provide sync instructions if needed

---

### **Method 3: Test Search**

```bash
curl -X POST http://localhost:3000/api/agents/search-hybrid \
  -H "Content-Type: application/json" \
  -d '{"query": "regulatory expert", "topK": 3}'
```

**If agents are in Pinecone:**
- Returns agents with similarity scores

**If NOT in Pinecone:**
- Returns empty results or error

---

## What to Do if Agents NOT in Pinecone

### **Run Initial Sync:**

```bash
# Option A: Via API
curl -X POST http://localhost:3000/api/agents/sync-to-pinecone \
  -H "Content-Type: application/json" \
  -d '{"syncAll": true}'

# Option B: Via Script (Recommended)
npx tsx scripts/sync-all-agents-to-pinecone.ts
```

**Time:** ~2-5 minutes for 300 agents  
**Cost:** ~$0.03

---

## Current Status

To check current status, run:

```bash
npx tsx scripts/check-pinecone-agents.ts
```

This will tell you:
- ✅ How many agents are in Pinecone
- ⚠️ How many agents need syncing
- 🔍 If search is working

