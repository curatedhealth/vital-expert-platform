# Tool Registry System - Implementation Complete

**Date**: 2025-10-03
**Status**: ✅ Core Infrastructure Complete - Ready for Integration

---

## 🎯 What Was Built

A complete **database-driven tool management system** that eliminates hardcoded tools and enables flexible tool assignment to agents and advisory board experts.

---

## 📦 Files Created

### 1. **Database Migration**
`/supabase/migrations/20251003_tool_registry_system.sql` (650 lines)

**Tables Created**:
- `tool_categories` - Organize tools by category (Evidence Research, Regulatory, Digital Health, etc.)
- `tools` - Complete tool registry with 13 expert tools pre-seeded
- `tool_tags` - Flexible tagging system (Medical Research, Clinical Trials, Regulatory, etc.)
- `tool_tag_assignments` - Many-to-many: tools ↔ tags
- `agent_tool_assignments` - Which tools each agent can use, with priorities and usage limits
- `tool_usage_logs` - Analytics and tracking for all tool calls

**Features**:
- ✅ Row Level Security (RLS) policies
- ✅ 6 tool categories with icons and display order
- ✅ 13 tools pre-seeded with full metadata
- ✅ 8 tags for flexible categorization
- ✅ Usage tracking and analytics
- ✅ API key management
- ✅ Cost and performance metrics
- ✅ Usage limits (per conversation, per day)

---

### 2. **Tool Registry Service**
`/src/lib/services/tool-registry-service.ts` (600 lines)

**Key Methods**:

**Tool Management**:
```typescript
// Get all tools, by category, by tags
await toolRegistryService.getAllTools()
await toolRegistryService.getToolsByCategory('Evidence Research')
await toolRegistryService.getToolsByTags(['Medical Research', 'Clinical Trials'])
await toolRegistryService.getToolByKey('pubmed_search')
```

**Agent Tool Assignments**:
```typescript
// Assign tools to agents
await toolRegistryService.assignToolToAgent(agentId, toolId, {
  isEnabled: true,
  autoUse: false,
  priority: 10,
  maxUsesPerDay: 100
})

// Bulk assign by category or tags
await toolRegistryService.assignToolsByCategoryToAgent(agentId, 'Evidence Research')
await toolRegistryService.assignToolsByTagsToAgent(agentId, ['Medical Research'])

// Get agent's assigned tools
const assignments = await toolRegistryService.getAgentTools(agentId)
```

**Usage Tracking**:
```typescript
// Log tool usage
await toolRegistryService.logToolUsage({
  tool_id, agent_id, user_id, conversation_id,
  input, output, success, execution_time_ms, cost
})

// Get usage statistics
const stats = await toolRegistryService.getAgentToolUsageStats(agentId, 30) // Last 30 days
```

**Usage Limits**:
```typescript
// Check if agent can use tool (respects daily/conversation limits)
const canUse = await toolRegistryService.canAgentUseTool(agentId, toolId, conversationId)
```

---

### 3. **Dynamic Tool Loader**
`/src/lib/services/dynamic-tool-loader.ts` (300 lines)

**Purpose**: Maps database tool records to actual LangChain tool instances

**Key Methods**:
```typescript
// Load all active tools from database
const tools = await dynamicToolLoader.loadAllActiveTools()

// Load tools assigned to specific agent (respects priorities)
const agentTools = await dynamicToolLoader.loadAgentTools(agentId)

// Load tools by category or tags
const evidenceTools = await dynamicToolLoader.loadToolsByCategory('Evidence Research')
const medicalTools = await dynamicToolLoader.loadToolsByTags(['Medical Research'])

// Load single tool by key
const tool = dynamicToolLoader.loadToolByKey('pubmed_search')
```

**Features**:
- ✅ Tool instance caching for performance
- ✅ Graceful fallback to hardcoded tools if database fails
- ✅ API key validation
- ✅ Active/inactive tool filtering
- ✅ Dynamic tool factory registration

---

## 🗄️ Database Schema

### Tools Table (13 pre-seeded tools)

| tool_key | name | category | requires_api_key | is_active | is_premium |
|----------|------|----------|------------------|-----------|------------|
| web_search | Web Search | General Research | ✅ (TAVILY_API_KEY) | ✅ | ❌ |
| pubmed_search | PubMed Search | Evidence Research | ❌ | ✅ | ❌ |
| search_clinical_trials | ClinicalTrials.gov Search | Evidence Research | ❌ | ✅ | ❌ |
| search_fda_approvals | FDA OpenFDA Search | Evidence Research | ❌ | ✅ | ❌ |
| search_ema_authorizations | EMA Authorization Search | Regulatory & Standards | ❌ | ✅ | ❌ |
| search_who_essential_medicines | WHO Essential Medicines | Regulatory & Standards | ❌ | ✅ | ❌ |
| search_multi_region_regulatory | Multi-Region Regulatory | Regulatory & Standards | ❌ | ✅ | ❌ |
| search_ich_guidelines | ICH Guidelines Search | Regulatory & Standards | ❌ | ✅ | ❌ |
| search_iso_standards | ISO Standards Search | Regulatory & Standards | ❌ | ✅ | ❌ |
| search_dime_resources | DiMe Digital Health | Digital Health | ❌ | ✅ | ❌ |
| search_ichom_standard_sets | ICHOM Standard Sets | Digital Health | ❌ | ✅ | ❌ |
| knowledge_base | Knowledge Base Search | Knowledge Management | ❌ | ✅ | ❌ |
| calculator | Calculator | Computation | ❌ | ✅ | ❌ |

---

## 🔌 Integration Points

### For Advisory Board Experts

**Current (Hardcoded)**:
```typescript
// In langgraph-orchestrator.ts line 14
import { getAllExpertTools } from './expert-tools';

// Line 858
const tools = getAllExpertTools(); // Returns all 13 tools
```

**New (Database-Driven)**:
```typescript
import { dynamicToolLoader } from './dynamic-tool-loader';

// Load all active tools from database
const tools = await dynamicToolLoader.loadAllActiveTools();

// OR load tools by category for specific expert personas
if (persona.includes('Regulatory')) {
  const tools = await dynamicToolLoader.loadToolsByCategory('Regulatory & Standards');
} else if (persona.includes('Clinical')) {
  const tools = await dynamicToolLoader.loadToolsByTags(['Medical Research', 'Clinical Trials']);
}
```

---

### For Individual Agents

**Update Required**: `/src/features/chat/services/expert-orchestrator.ts`

```typescript
import { dynamicToolLoader } from '@/lib/services/dynamic-tool-loader';
import { toolRegistryService } from '@/lib/services/tool-registry-service';

class AgentChat {
  async chat(agentId: string, message: string) {
    // Load tools assigned to this specific agent
    const tools = await dynamicToolLoader.loadAgentTools(agentId);

    // Create agent with tools
    const agentExecutor = new AgentExecutor({
      agent,
      tools, // Dynamic tools from database
      maxIterations: 5
    });

    // Execute with usage tracking
    const result = await agentExecutor.invoke({ input: message });

    // Log tool usage
    for (const toolCall of result.intermediateSteps) {
      const toolMeta = await toolRegistryService.getToolMetadata(toolCall.action.tool);
      await toolRegistryService.logToolUsage({
        tool_id: toolMeta.id,
        agent_id: agentId,
        input: toolCall.action.toolInput,
        output: toolCall.observation,
        success: true,
        execution_time_ms: Date.now() - startTime
      });
    }
  }
}
```

---

## 🎛️ Admin Features

### Tool Management UI (To Build)

**Assign Tools to Agent**:
```typescript
// Simple: Assign all Evidence Research tools
await toolRegistryService.assignToolsByCategoryToAgent(
  agentId,
  'Evidence Research'
)

// Advanced: Fine-grained control
await toolRegistryService.assignToolToAgent(agentId, toolId, {
  isEnabled: true,
  autoUse: false,           // Don't use automatically
  requiresConfirmation: true, // Ask user first
  priority: 10,              // Higher = used first
  maxUsesPerDay: 50,
  maxUsesPerConversation: 5
})
```

**Tool Analytics Dashboard**:
```typescript
const stats = await toolRegistryService.getAgentToolUsageStats(agentId, 30);
// Returns:
// [
//   {
//     toolName: 'PubMed Search',
//     totalCalls: 150,
//     successRate: 95.3,
//     avgExecutionTime: 1250ms,
//     avgCost: 0.002
//   },
//   ...
// ]
```

---

## 🚀 Next Steps

### 1. Run Migration
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
npx supabase db push
```

### 2. Update Advisory Board Orchestrator
**File**: `/src/lib/services/langgraph-orchestrator.ts`

**Change Line 14**:
```typescript
// OLD
import { getAllExpertTools } from './expert-tools';

// NEW
import { dynamicToolLoader } from './dynamic-tool-loader';
```

**Change Line 858** (inside `runExpert` method):
```typescript
// OLD
const tools = getAllExpertTools();

// NEW
const tools = await dynamicToolLoader.loadAllActiveTools();
// OR for persona-specific tools:
// const tools = await dynamicToolLoader.loadToolsByCategory('Evidence Research');
```

### 3. Update Individual Agent Chat
**File**: `/src/features/chat/services/expert-orchestrator.ts`

Add tool loading at the beginning of chat method:
```typescript
async chat(agentId: string, message: string) {
  // Load agent-specific tools from database
  const tools = await dynamicToolLoader.loadAgentTools(agentId);

  // ... rest of chat logic with these tools
}
```

### 4. Create Admin UI for Tool Assignment

**Page**: `/src/app/(app)/admin/tools/page.tsx`

Features needed:
- List all tools with categories
- Assign/unassign tools to agents
- Set tool priorities and usage limits
- View tool usage statistics
- Enable/disable tools globally

### 5. Create Default Tool Assignments

Run this after migration to assign default tools:
```typescript
// Assign all tools to existing agents
const agents = await getAll Agents();
for (const agent of agents) {
  // Give all agents basic tools
  await toolRegistryService.assignToolsByTagsToAgent(
    agent.id,
    ['Medical Research', 'Regulatory'],
    { isEnabled: true, priority: 5 }
  );
}
```

---

## 📊 Benefits

### Before (Hardcoded)
- ❌ All agents get all 13 tools (no customization)
- ❌ Can't control which tools an agent uses
- ❌ No usage limits or tracking
- ❌ Adding new tools requires code changes
- ❌ No analytics on tool performance

### After (Database-Driven)
- ✅ Each agent gets custom tool suite
- ✅ Fine-grained control (enable/disable, priorities)
- ✅ Usage limits (per day, per conversation)
- ✅ Complete analytics and tracking
- ✅ Add new tools via database (no code changes)
- ✅ Premium tools with access control
- ✅ Tool performance metrics
- ✅ Cost tracking per tool call

---

## 🔐 Security Features

- **RLS Policies**: Users can only see/manage tools for their agents
- **API Key Management**: Securely stored in env vars, validated before use
- **Usage Limits**: Prevent abuse with per-day and per-conversation limits
- **Approval Required**: Tools can require admin approval before use
- **Premium Tools**: Restrict expensive/advanced tools to premium users

---

## 💡 Future Enhancements

1. **Tool Marketplace**: Users can browse and enable tools
2. **Custom Tools**: Users can create their own tools via UI
3. **Tool Recommendations**: Suggest tools based on agent role
4. **A/B Testing**: Test different tool combinations
5. **Cost Optimization**: Recommend cheaper alternatives
6. **Tool Chaining**: Automatically chain tools for complex queries
7. **Tool Learning**: ML-based tool selection based on past success

---

## 📝 Summary

✅ **Database schema** created with 6 tables for complete tool management
✅ **13 expert tools** pre-seeded in database
✅ **Tool Registry Service** with 20+ methods for tool management
✅ **Dynamic Tool Loader** that maps database → LangChain instances
✅ **Usage tracking** and analytics built-in
✅ **Security** with RLS policies
✅ **Flexible assignment** by agent, category, or tags

**Ready for**: Integration into advisory board and agent chat orchestrators

**Migration Status**: Ready to run (`npx supabase db push`)
