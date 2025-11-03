# Frontend Tool Registry - Quick Fix Required

Due to search/replace failures, here's a manual fix guide for `tool-registry-service.ts`:

## Changes Required

### 1. Replace Line 274: `.from('tools')` → `.from('dh_tool')`
### 2. Replace Line 295-320: Simplify getToolsByTags

```typescript
async getToolsByCategory(categoryName: string): Promise<Tool[]> {
  const allTools = await this.getAllTools(false);
  return allTools.filter(t => t.category?.toLowerCase() === categoryName.toLowerCase());
}

async getToolsByTags(tagNames: string[]): Promise<Tool[]> {
  const allTools = await this.getAllTools(false);
  return allTools.filter(t => 
    t.tags?.some(tag => tagNames.includes(tag.name))
  );
}
```

### 3. Update getAgentTools (around line 360):
Change `.from('agent_tools')` references to use proper joins with `dh_tool`.

### 4. Update assignToolToAgent:
Ensure it uses `dh_tool.id` for tool_id FK.

## Alternative: Use Backend Fix First

Since frontend changes are complex, let's fix the backend Python first which is simpler!

