# 🔄 Supabase → Notion Agent Sync Plan

**Date:** November 6, 2025  
**Source:** Supabase `agents` table (358 agents)  
**Destination:** Notion "VITAL Expert Sync" > Agents database  
**Sync Direction:** One-way (Supabase → Notion)

---

## 📊 Current State

### **Supabase (Source)**
- **Total Agents:** 358
- **Fully categorized:** ✅ 100%
- **With colors:** ✅ 100%
- **With avatars:** ✅ 100%

### **Notion (Destination)**
- **Current Agents:** ~1 (only "Clinical Research Expert" found)
- **Database ID:** `collection://282345b0-299e-816d-aaf9-000bc99cc9cf`
- **Parent Page:** VITAL Expert Sync

---

## 🗺️ Field Mapping Strategy

### **Supabase → Notion Field Mapping**

| Supabase Field | Notion Field | Transformation |
|----------------|--------------|----------------|
| `name` | `Name` (title) | Direct |
| `title` | `Display Name` | Direct (or use `name` if null) |
| `description` | `Description` | Direct |
| `model` | `Model` | Direct |
| `system_prompt` | `System Prompt` | Direct |
| `agent_category` | `Category` | Map to Notion categories |
| `category_color` | `Color` | Map hex to Notion color names |
| `avatar_url` | `Icon` | Extract emoji or use 🤖 |
| `is_active` | `Is Active` | Direct boolean |
| `metadata->>'tier'` | `Tier` | Map to Notion tier options |
| `rating` | `Success Rate` | Convert to percentage |
| `total_consultations` | `Usage Count` | Direct |
| `created_at` | `Created Date` | Auto-set by Notion |
| `updated_at` | `Last Edited` | Auto-set by Notion |
| - | `Is Featured` | Set false by default |
| - | `Lifecycle Stage` | Set "Active" for active agents |
| `metadata->>'temperature'` | `Temperature` | Extract from metadata |
| `metadata->>'max_tokens'` | `Max Tokens` | Extract from metadata |
| `metadata->>'tools'` | `Tools` | Extract and map to multi-select |

---

## 🎨 Category Mapping

### **Supabase agent_category → Notion Category**

```typescript
const categoryMapping = {
  // Supabase → Notion
  'specialized_knowledge': 'Technical Specialist',    // Most common (266 agents)
  'deep_agent': 'Strategic Consultant',              // Strategic (14 agents)
  'universal_task_subagent': 'Data Analyst',         // Technical (25 agents)
  'multi_expert_orchestration': 'Strategic Consultant', // Orchestration (12 agents)
  'process_automation': 'Business Advisor',          // Process (28 agents)
  'autonomous_problem_solving': 'Strategic Consultant' // Autonomous (13 agents)
};
```

### **Supabase category_color → Notion Color**

```typescript
const colorMapping = {
  // Hex → Notion color name
  '#3B82F6': 'Blue',      // Specialized Knowledge
  '#F97316': 'Orange',    // Process Automation
  '#10B981': 'Green',     // Universal Task Subagents
  '#9333EA': 'Purple',    // Deep Agents
  '#EF4444': 'Red',       // Autonomous Problem-Solving
  '#06B6D4': 'Blue'       // Multi-Expert Orchestration (use Blue)
};
```

---

## 📋 Sync Strategy

### **Option 1: Batch Sync (Recommended)**
Sync agents in batches of 25 to respect Notion API limits.

**Batches:**
- Batch 1: Agents 1-25
- Batch 2: Agents 26-50
- ...
- Batch 15: Agents 351-358

### **Option 2: Category-Based Sync**
Sync by agent_category for better organization.

1. Specialized Knowledge (266 agents) - 11 batches
2. Process Automation (28 agents) - 2 batches
3. Universal Task Subagents (25 agents) - 1 batch
4. Deep Agents (14 agents) - 1 batch
5. Autonomous Problem-Solving (13 agents) - 1 batch
6. Multi-Expert Orchestration (12 agents) - 1 batch

---

## 🚀 Execution Plan

### **Phase 1: Prepare Data (Complete)**
✅ All 358 agents in Supabase  
✅ All categorized and color-coded  
✅ Field mappings defined  

### **Phase 2: Test Sync (Small Batch)**
- Sync first 5 agents as test
- Verify field mapping
- Confirm data quality

### **Phase 3: Full Sync**
- Execute batches 1-15
- ~25 agents per batch
- Monitor for errors
- Log progress

### **Phase 4: Verification**
- Count total agents in Notion
- Spot-check data quality
- Verify categories and colors

---

## ⚠️ Important Considerations

### **Notion API Limitations:**
- **Rate Limits:** 3 requests/second
- **Batch Size:** Recommend 25 agents per batch
- **Timeout:** Each request should complete within 30s

### **Data Transformation:**
1. **Icon Field:** Notion expects emoji or URL, not full avatar URLs
   - Solution: Extract emoji from metadata or use default 🤖

2. **Temperature/Max Tokens:** Extract from JSONB metadata
   ```typescript
   temperature = metadata?.temperature || 0.7
   max_tokens = metadata?.max_tokens || metadata?.max_token || 4096
   ```

3. **Tools:** Parse from metadata and map to Notion multi-select
   ```typescript
   tools = metadata?.tools || []
   // Map to: ["web_search", "calculator", "file_reader", etc.]
   ```

4. **Tier:** Extract from metadata
   ```typescript
   tier = metadata?.tier || "Basic"
   // Map to: "Free", "Basic", "Professional", "Enterprise"
   ```

---

## 💻 Implementation Approach

### **Batch Creation Function:**

```typescript
async function syncBatchToNotion(agents: Agent[], batchNumber: number) {
  for (const agent of agents) {
    try {
      await mcp_Notion_notion_create_pages({
        parent: {
          database_id: "282345b0-299e-802e-a9fa-e15204f4da89"
        },
        pages: [{
          properties: {
            "Name": { title: [{ text: { content: agent.name }}]},
            "Display Name": { rich_text: [{ text: { content: agent.title || agent.name }}]},
            "Description": { rich_text: [{ text: { content: agent.description || "" }}]},
            "Model": { rich_text: [{ text: { content: agent.model || "" }}]},
            "System Prompt": { rich_text: [{ text: { content: agent.system_prompt || "" }}]},
            "Category": { select: { name: mapCategory(agent.agent_category) }},
            "Color": { select: { name: mapColor(agent.category_color) }},
            "Icon": { rich_text: [{ text: { content: "🤖" }}]}, // Default
            "Is Active": { checkbox: agent.is_active },
            "Is Featured": { checkbox: false },
            "Lifecycle Stage": { select: { name: agent.is_active ? "Active" : "Maintenance" }},
            "Success Rate": { number: agent.rating ? agent.rating / 100 : null },
            "Usage Count": { number: agent.total_consultations || 0 }
          }
        }]
      });
      
      console.log(`✅ Synced: ${agent.name}`);
    } catch (error) {
      console.error(`❌ Failed: ${agent.name}`, error);
    }
  }
}
```

---

## 📈 Progress Tracking

I'll track progress as we sync:

```
Batch 1  (1-25):    [ Pending ]
Batch 2  (26-50):   [ Pending ]
Batch 3  (51-75):   [ Pending ]
Batch 4  (76-100):  [ Pending ]
Batch 5  (101-125): [ Pending ]
Batch 6  (126-150): [ Pending ]
Batch 7  (151-175): [ Pending ]
Batch 8  (176-200): [ Pending ]
Batch 9  (201-225): [ Pending ]
Batch 10 (226-250): [ Pending ]
Batch 11 (251-275): [ Pending ]
Batch 12 (276-300): [ Pending ]
Batch 13 (301-325): [ Pending ]
Batch 14 (326-350): [ Pending ]
Batch 15 (351-358): [ Pending ]
```

---

## 🎯 Next Steps

**Ready to begin sync?**

1. **Test First (Recommended):** Sync 5 agents to verify
2. **Full Sync:** Execute all 15 batches
3. **Quick Sync:** Start immediately with batch 1

**Which approach would you like?** 🚀

