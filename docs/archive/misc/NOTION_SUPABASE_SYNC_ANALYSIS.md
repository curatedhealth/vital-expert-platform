# 🔄 Notion ↔ Supabase Agent Sync Analysis

**Date:** November 6, 2025  
**Notion Database:** VITAL Expert Sync - Agents  
**Supabase Database:** agents table

---

## 📊 Current State

### **Supabase (Current)**
- **Total Agents:** 358
- **Categories:** 19 unique (using `category` field)
- **Agent Categories:** 6 (using `agent_category` field)
- **With Colors:** 358 (100%)

### **Notion Database Schema**
The Notion database has the following structure:

| Field | Type | Values/Options |
|-------|------|----------------|
| **Name** | Title | Text |
| **Display Name** | Text | Text |
| **Description** | Text | Text |
| **Category** | Select | Clinical Expert, Business Advisor, Technical Specialist, Regulatory Expert, Data Analyst, Strategic Consultant |
| **Color** | Select | Blue, Green, Purple, Red, Orange, Yellow, Gray, Pink, Brown |
| **Icon** | Text | Emoji/icon string |
| **Model** | Text | Model name |
| **System Prompt** | Text | Long text |
| **Role** | Text | Text description |
| **Temperature** | Number | Float |
| **Max Tokens** | Number | Integer |
| **Tier** | Select | Free, Basic, Professional, Enterprise |
| **Lifecycle Stage** | Select | Concept, Development, Testing, Active, Maintenance, Deprecated |
| **Is Active** | Checkbox | Boolean |
| **Is Featured** | Checkbox | Boolean |
| **Success Rate** | Number | Percentage |
| **Usage Count** | Number | Integer |
| **Tools** | Multi-select | web_search, calculator, file_reader, data_analyzer, email, calendar |
| **Capabilities** | Relation | Links to Capabilities database |
| **Created Date** | Created time | Auto |
| **Last Edited** | Last edited time | Auto |
| **Related to Workflows** | Relation | Links to Workflows |
| **Related to Prompts** | Relation | Links to Prompts |
| **Related to RAG Documents** | Relation | Links to RAG Documents |
| **Related to Jobs to Be Done** | Relation | Links to JTBD |

---

## 🔄 Field Mapping: Notion → Supabase

### **✅ Direct Matches (Already in Supabase)**
| Notion Field | Supabase Field | Status |
|--------------|----------------|---------|
| Name | `name` | ✅ Matched |
| Display Name | `title` | ✅ Matched |
| Description | `description` | ✅ Matched |
| System Prompt | `system_prompt` | ✅ Matched |
| Model | `model` | ✅ Matched |
| Is Active | `is_active` | ✅ Matched |
| Created Date | `created_at` | ✅ Matched |
| Last Edited | `updated_at` | ✅ Matched |

### **🟡 Partial Matches (Need Mapping)**
| Notion Field | Supabase Field | Mapping Needed |
|--------------|----------------|----------------|
| Category (6 options) | `category` (19 unique) | ✅ Map Notion → Supabase |
| Category | `agent_category` (6 types) | ✅ Better match! |
| Color (9 options) | `category_color` (6 colors) | ✅ Need mapping |
| Icon | `avatar_url` | 🔄 Different format |

### **❌ Missing in Supabase**
| Notion Field | Supabase Equivalent | Action Needed |
|--------------|---------------------|---------------|
| Display Name | `title` (exists) | ✅ Already have |
| Role | `metadata->>'role'` | ➕ Add to metadata |
| Temperature | `metadata->>'temperature'` | ➕ Add to metadata |
| Max Tokens | `metadata->>'max_tokens'` | ➕ Add to metadata |
| Tier | `metadata->>'tier'` | ✅ Already exists |
| Lifecycle Stage | Not in Supabase | ➕ Need new field |
| Is Featured | Not in Supabase | ➕ Need new field |
| Success Rate | `rating` (similar) | ✅ Can use |
| Usage Count | `total_consultations` | ✅ Can use |
| Tools | `tools` (JSONB array) | ✅ May exist |
| Capabilities | `capabilities` | ✅ Exists |

---

## 🎯 Category Mapping

### **Notion → Supabase agent_category**

| Notion Category | Supabase agent_category | Color Mapping |
|----------------|-------------------------|---------------|
| **Clinical Expert** | `specialized_knowledge` | Blue → Blue ✅ |
| **Business Advisor** | `deep_agent` | Green → Purple 🔄 |
| **Technical Specialist** | `universal_task_subagent` | Gray → Green 🔄 |
| **Regulatory Expert** | `specialized_knowledge` | Red → Blue 🔄 |
| **Data Analyst** | `universal_task_subagent` | Pink → Green 🔄 |
| **Strategic Consultant** | `deep_agent` | Purple → Purple ✅ |

### **Color Mapping: Notion → Supabase**

| Notion Color | Hex (Notion) | Supabase agent_category Color | Hex (Supabase) |
|--------------|--------------|-------------------------------|----------------|
| Blue | #3B82F6 | Specialized Knowledge | #3B82F6 ✅ |
| Green | #10B981 | Universal Task Subagent | #10B981 ✅ |
| Purple | #9333EA | Deep Agent | #9333EA ✅ |
| Red | #EF4444 | Autonomous Problem-Solving | #EF4444 ✅ |
| Orange | #F97316 | Process Automation | #F97316 ✅ |
| Yellow | #F59E0B | (Not mapped) | - |
| Gray | #6B7280 | (Default) | - |
| Pink | #EC4899 | (Not mapped) | - |
| Brown | #92400E | (Not mapped) | - |

---

## 🔄 Sync Strategy Options

### **Option 1: One-Way Sync (Notion → Supabase)**
**Best for:** Using Notion as master data source

```typescript
// Fetch from Notion
const notionAgents = await fetchNotionAgents();

// Sync to Supabase
for (const agent of notionAgents) {
  await supabase.from('agents').upsert({
    name: agent.Name,
    title: agent['Display Name'],
    description: agent.Description,
    system_prompt: agent['System Prompt'],
    model: agent.Model,
    is_active: agent['Is Active'] === '__YES__',
    agent_category: mapNotionToSupabaseCategory(agent.Category),
    category_color: mapNotionColor(agent.Color),
    metadata: {
      role: agent.Role,
      temperature: agent.Temperature,
      max_tokens: agent['Max Tokens'],
      tier: agent.Tier,
      tools: agent.Tools
    }
  });
}
```

### **Option 2: Two-Way Sync (Bidirectional)**
**Best for:** Keeping both databases in sync

```typescript
// Listen to changes in Notion
notion.on('update', async (agent) => {
  await updateSupabase(agent);
});

// Listen to changes in Supabase
supabase.on('postgres_changes', async (change) => {
  await updateNotion(change);
});
```

### **Option 3: Supabase as Source of Truth**
**Best for:** Your current setup

```typescript
// Export from Supabase to Notion
const supabaseAgents = await getAllSupabaseAgents();

for (const agent of supabaseAgents) {
  await notion.pages.create({
    parent: { database_id: NOTION_DB_ID },
    properties: {
      Name: { title: [{ text: { content: agent.name }}]},
      'Display Name': { rich_text: [{ text: { content: agent.title }}]},
      Category: { select: { name: mapSupabaseToNotionCategory(agent.agent_category) }},
      Color: { select: { name: mapSupabaseToNotionColor(agent.category_color) }},
      'Is Active': { checkbox: agent.is_active }
      // ... map all fields
    }
  });
}
```

---

## 📋 Action Items

### **To Sync FROM Notion TO Supabase:**

1. ✅ **Add missing fields to Supabase:**
   - `lifecycle_stage` VARCHAR(50)
   - `is_featured` BOOLEAN
   - Update `metadata` to include: role, temperature, max_tokens, tools

2. ✅ **Create mapping functions:**
   - Notion Category → Supabase agent_category
   - Notion Color → Supabase category_color
   - Notion Icon → Supabase avatar_url

3. ✅ **Build sync script:**
   - Query Notion database for all agents
   - Transform data using mappings
   - Upsert to Supabase (match by name)

### **To Sync FROM Supabase TO Notion:**

1. ✅ **Query all 358 Supabase agents**
2. ✅ **Transform to Notion format**
3. ✅ **Batch create/update in Notion**

---

## 🎯 Recommended Approach

Given your setup:

### **Phase 1: Assess Current State**
- ✅ Connected to Notion ✓
- ✅ Supabase has 358 agents ✓
- 🔍 Check how many agents exist in Notion

### **Phase 2: Choose Sync Direction**
**Question:** Which should be the source of truth?
- **Supabase** (you have 358 well-structured agents with categories & colors)
- **Notion** (collaborative editing, easier for team updates)

### **Phase 3: Execute Sync**
- Export from source → Import to destination
- Set up ongoing sync mechanism

---

## 🤔 Next Steps

**What would you like to do?**

1. **Check Notion agent count** - See how many agents currently in Notion
2. **Sync Supabase → Notion** - Push all 358 agents to Notion
3. **Sync Notion → Supabase** - Pull Notion agents to Supabase
4. **Two-way sync** - Keep both in sync automatically
5. **Field mapping only** - Just show me how to map fields

Let me know which direction you want to go! 🚀

