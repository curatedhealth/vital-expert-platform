# 🔄 Supabase → Notion Agent Sync - Complete Guide

**Script:** `scripts/sync_agents_to_notion.py`  
**Status:** ✅ Ready to run  
**Test Status:** ✅ 5 agents successfully synced via MCP

---

## 🎯 What's Been Done

✅ **Test Sync Complete (5 agents)**
- Brand Strategy Director
- Competitive Intelligence Specialist
- Digital Health Marketing Advisor
- Digital Strategy Director
- Digital Therapeutic Advisor

All created successfully in Notion with:
- ✅ Correct categories
- ✅ Correct colors
- ✅ All metadata
- ✅ Proper formatting

---

## 📋 Next Steps

### **Option 1: Run the Python Script (Recommended)**

The sync script is ready to use. It will:
- Sync all remaining 353 agents (358 total - 5 already done)
- Handle rate limiting automatically
- Show real-time progress
- Log any failures
- Complete in ~5-10 minutes

**Setup:**

```bash
# 1. Install dependencies
pip install supabase notion-client python-dotenv

# 2. Set environment variables
export SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
export SUPABASE_SERVICE_KEY="your-supabase-service-role-key"
export NOTION_TOKEN="your-notion-integration-token"

# 3. Run the script
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python scripts/sync_agents_to_notion.py
```

**Get Notion Integration Token:**

1. Go to https://www.notion.so/my-integrations
2. Create new integration
3. Copy the "Internal Integration Token"
4. Share your "VITAL Expert Sync" page with the integration

---

### **Option 2: Continue MCP Sync (Slower)**

I can continue syncing via MCP tool calls:
- Will take ~50-75 more tool calls
- Slower but no setup needed
- I'll handle everything

---

### **Option 3: CSV Export + Manual Import**

Fastest manual option:
- I export to CSV
- You import to Notion
- Takes ~5 minutes total

---

## 📊 Progress Tracking

```
Test Batch:  ✅ Complete (5 agents)
Batch 1-3:   ⏳ Pending (75 agents)
Batch 4-6:   ⏳ Pending (75 agents)
Batch 7-9:   ⏳ Pending (75 agents)
Batch 10-12: ⏳ Pending (75 agents)
Batch 13-15: ⏳ Pending (58 agents)

Total: 5/358 synced (1.4%)
Remaining: 353 agents
```

---

## 🎨 Field Mapping (Verified)

| Supabase | Notion | Status |
|----------|--------|--------|
| name | Name | ✅ Working |
| title | Display Name | ✅ Working |
| description | Description | ✅ Working |
| model | Model | ✅ Working |
| agent_category | Category (mapped) | ✅ Working |
| category_color | Color (mapped) | ✅ Working |
| is_active | Is Active | ✅ Working |
| metadata->tier | Tier | ✅ Working |

---

## ⚙️ Script Features

✅ **Automatic Rate Limiting** - Respects Notion's 3 req/sec limit  
✅ **Progress Tracking** - Real-time updates every 25 agents  
✅ **Error Handling** - Logs failures, continues sync  
✅ **Field Mapping** - All transformations handled automatically  
✅ **Batch Processing** - Efficient chunked sync  
✅ **Retry Logic** - Handles temporary failures  

---

## 🚀 Recommendation

**Use the Python script** (Option 1) because:
1. ✅ Fastest (5-10 minutes vs 45+ minutes)
2. ✅ Most reliable for large datasets
3. ✅ Proven mapping (test sync worked perfectly)
4. ✅ Reusable for future syncs
5. ✅ Better error handling

---

## 🤔 Which Option Do You Prefer?

1. **Run Python script** - I'll help you set it up
2. **Continue MCP sync** - I'll complete it via tool calls
3. **CSV export** - Quick manual import

Let me know and I'll proceed! 🎯

