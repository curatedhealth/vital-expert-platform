# Agent Tool UI Integration Guide
## Connecting Agent Creator/Editor to Tool Registry Database

**Date**: 2025-10-03
**Status**: Implementation Guide
**Target File**: `/src/features/chat/components/agent-creator.tsx`

---

## 🎯 Current State (Hardcoded)

**Lines 89-102** in agent-creator.tsx:
```typescript
const availableTools = [
  'Web Search',
  'Document Analysis',
  'Data Calculator',
  'Regulatory Database Search',
  'Literature Search',
  'Statistical Analysis',
  'Timeline Generator',
  'Budget Calculator',
  'Risk Assessment Matrix',
  'Compliance Checker',
  'Citation Generator',
  'Template Generator',
];
```

**Problems**:
- ❌ Hardcoded list doesn't match actual 13 expert tools
- ❌ No connection to database
- ❌ Can't enable/disable tools per agent
- ❌ No usage limits or priorities
- ❌ No analytics

---

## 🔄 New State (Database-Driven)

### Step 1: Add Tool Registry Imports

**Add to imports section** (after line 45):
```typescript
import { toolRegistryService, type Tool, type ToolCategory, type AgentToolAssignment } from '@/lib/services/tool-registry-service';
```

### Step 2: Replace Hardcoded Tools State

**Replace lines 89-102** with:
```typescript
// Remove hardcoded availableTools array

// Add new state variables for dynamic tools
const [availableTools, setAvailableTools] = useState<Tool[]>([]);
const [toolCategories, setToolCategories] = useState<ToolCategory[]>([]);
const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
const [toolSettings, setToolSettings] = useState<Map<string, {
  priority: number;
  autoUse: boolean;
  requiresConfirmation: boolean;
  maxUsesPerDay?: number;
  maxUsesPerConversation?: number;
}>>(new Map());
const [loadingTools, setLoadingTools] = useState(false);
```

### Step 3: Load Tools from Database

**Add useEffect to load tools** (after other useEffects):
```typescript
useEffect(() => {
  loadToolsFromDatabase();
}, []);

useEffect(() => {
  if (editingAgent) {
    loadAgentToolAssignments();
  }
}, [editingAgent]);

const loadToolsFromDatabase = async () => {
  setLoadingTools(true);
  try {
    // Load all available tools
    const tools = await toolRegistryService.getAllTools();
    setAvailableTools(tools);

    // Load tool categories for organization
    const categories = await toolRegistryService.getToolCategories();
    setToolCategories(categories);
  } catch (error) {
    console.error('Failed to load tools:', error);
  } finally {
    setLoadingTools(false);
  }
};

const loadAgentToolAssignments = async () => {
  if (!editingAgent?.id) return;

  try {
    // Load existing tool assignments for this agent
    const assignments = await toolRegistryService.getAgentTools(editingAgent.id, false); // Include disabled

    const selected = new Set<string>();
    const settings = new Map();

    assignments.forEach(assignment => {
      if (assignment.tool) {
        selected.add(assignment.tool.id);
        settings.set(assignment.tool.id, {
          priority: assignment.priority,
          autoUse: assignment.auto_use,
          requiresConfirmation: assignment.requires_confirmation,
          maxUsesPerDay: assignment.max_uses_per_day,
          maxUsesPerConversation: assignment.max_uses_per_conversation
        });
      }
    });

    setSelectedTools(selected);
    setToolSettings(settings);
  } catch (error) {
    console.error('Failed to load agent tool assignments:', error);
  }
};
```

### Step 4: Update Tool Selection UI

**Find the Tools section in the render** (search for "availableTools" in JSX):

**Replace with**:
```tsx
{/* Tools Section - Database-Driven */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label className="flex items-center gap-2">
      <Wrench className="h-4 w-4" />
      Available Tools ({availableTools.length})
    </Label>
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          // Select all tools
          const allToolIds = new Set(availableTools.map(t => t.id));
          setSelectedTools(allToolIds);
        }}
      >
        Select All
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          // Assign tools by category
          setShowCategoryAssignment(true);
        }}
      >
        Assign by Category
      </Button>
    </div>
  </div>

  {loadingTools ? (
    <div className="text-center py-8 text-muted-foreground">
      Loading tools from database...
    </div>
  ) : (
    <>
      {/* Group tools by category */}
      {toolCategories.map(category => {
        const categoryTools = availableTools.filter(t => t.category_id === category.id);
        if (categoryTools.length === 0) return null;

        return (
          <Card key={category.id} className="p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.name}
              <Badge variant="outline" className="ml-auto">
                {categoryTools.filter(t => selectedTools.has(t.id)).length}/{categoryTools.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categoryTools.map(tool => {
                const isSelected = selectedTools.has(tool.id);
                const settings = toolSettings.get(tool.id) || {
                  priority: 0,
                  autoUse: false,
                  requiresConfirmation: false
                };

                return (
                  <Card
                    key={tool.id}
                    className={cn(
                      'p-3 cursor-pointer transition-all border-2',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-primary/30'
                    )}
                    onClick={() => {
                      const newSelected = new Set(selectedTools);
                      if (isSelected) {
                        newSelected.delete(tool.id);
                        toolSettings.delete(tool.id);
                      } else {
                        newSelected.add(tool.id);
                        toolSettings.set(tool.id, {
                          priority: 5,
                          autoUse: false,
                          requiresConfirmation: false
                        });
                      }
                      setSelectedTools(newSelected);
                      setToolSettings(new Map(toolSettings));
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        {isSelected ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {tool.description}
                        </div>

                        {/* Tool tags */}
                        {tool.tags && tool.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Tool metadata badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tool.requires_api_key && (
                            <Badge variant="secondary" className="text-xs">
                              API Key Required
                            </Badge>
                          )}
                          {tool.is_premium && (
                            <Badge variant="default" className="text-xs bg-amber-500">
                              Premium
                            </Badge>
                          )}
                          {tool.estimated_cost_per_call && (
                            <Badge variant="outline" className="text-xs">
                              ${tool.estimated_cost_per_call.toFixed(4)}/call
                            </Badge>
                          )}
                        </div>

                        {/* Tool settings (shown when selected) */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`priority-${tool.id}`} className="text-xs">
                                Priority (0-10)
                              </Label>
                              <Input
                                id={`priority-${tool.id}`}
                                type="number"
                                min="0"
                                max="10"
                                className="w-16 h-7 text-xs"
                                value={settings.priority}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const newSettings = new Map(toolSettings);
                                  newSettings.set(tool.id, {
                                    ...settings,
                                    priority: parseInt(e.target.value) || 0
                                  });
                                  setToolSettings(newSettings);
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`auto-${tool.id}`}
                                checked={settings.autoUse}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const newSettings = new Map(toolSettings);
                                  newSettings.set(tool.id, {
                                    ...settings,
                                    autoUse: e.target.checked
                                  });
                                  setToolSettings(newSettings);
                                }}
                              />
                              <Label htmlFor={`auto-${tool.id}`} className="text-xs cursor-pointer">
                                Auto-use when relevant
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`confirm-${tool.id}`}
                                checked={settings.requiresConfirmation}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const newSettings = new Map(toolSettings);
                                  newSettings.set(tool.id, {
                                    ...settings,
                                    requiresConfirmation: e.target.checked
                                  });
                                  setToolSettings(newSettings);
                                }}
                              />
                              <Label htmlFor={`confirm-${tool.id}`} className="text-xs cursor-pointer">
                                Ask before using
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Uncategorized tools */}
      {(() => {
        const uncategorizedTools = availableTools.filter(t => !t.category_id);
        if (uncategorizedTools.length === 0) return null;

        return (
          <Card key="uncategorized" className="p-4">
            <h4 className="font-semibold text-sm mb-3">
              Other Tools
              <Badge variant="outline" className="ml-2">
                {uncategorizedTools.filter(t => selectedTools.has(t.id)).length}/{uncategorizedTools.length}
              </Badge>
            </h4>
            {/* Same grid as above for uncategorized tools */}
          </Card>
        );
      })()}
    </>
  )}
</div>
```

### Step 5: Update Save Handler

**Find the handleSave function** and update the tool assignment logic:

**Add after agent is created/updated**:
```typescript
const handleSave = async () => {
  try {
    // ... existing agent creation/update code ...

    // Save tool assignments to database
    if (agent.id && selectedTools.size > 0) {
      await saveToolAssignments(agent.id);
    }

    onSave();
    onClose();
  } catch (error) {
    console.error('Failed to save agent:', error);
    alert('Failed to save agent. Please try again.');
  }
};

const saveToolAssignments = async (agentId: string) => {
  try {
    // Clear existing assignments
    const existing = await toolRegistryService.getAgentTools(agentId, false);
    for (const assignment of existing) {
      await toolRegistryService.removeToolFromAgent(agentId, assignment.tool_id);
    }

    // Add new assignments
    for (const toolId of selectedTools) {
      const settings = toolSettings.get(toolId) || {
        priority: 5,
        autoUse: false,
        requiresConfirmation: false
      };

      await toolRegistryService.assignToolToAgent(agentId, toolId, {
        isEnabled: true,
        autoUse: settings.autoUse,
        requiresConfirmation: settings.requiresConfirmation,
        priority: settings.priority,
        maxUsesPerDay: settings.maxUsesPerDay,
        maxUsesPerConversation: settings.maxUsesPerConversation
      });
    }

    console.log(`✅ Saved ${selectedTools.size} tool assignments for agent ${agentId}`);
  } catch (error) {
    console.error('Failed to save tool assignments:', error);
    throw error;
  }
};
```

### Step 6: Add Quick Assignment Modals

**Add state for category assignment modal**:
```typescript
const [showCategoryAssignment, setShowCategoryAssignment] = useState(false);
```

**Add modal component** (before main return):
```tsx
{/* Category Assignment Modal */}
{showCategoryAssignment && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>Assign Tools by Category</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quickly assign all tools from specific categories
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {toolCategories.map(category => {
          const categoryTools = availableTools.filter(t => t.category_id === category.id);
          const allSelected = categoryTools.every(t => selectedTools.has(t.id));

          return (
            <Card
              key={category.id}
              className={cn(
                'p-4 cursor-pointer transition-all border-2',
                allSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
              )}
              onClick={() => {
                const newSelected = new Set(selectedTools);
                if (allSelected) {
                  // Deselect all in category
                  categoryTools.forEach(t => newSelected.delete(t.id));
                } else {
                  // Select all in category
                  categoryTools.forEach(t => {
                    newSelected.add(t.id);
                    if (!toolSettings.has(t.id)) {
                      toolSettings.set(t.id, {
                        priority: 5,
                        autoUse: false,
                        requiresConfirmation: false
                      });
                    }
                  });
                }
                setSelectedTools(newSelected);
                setToolSettings(new Map(toolSettings));
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Badge variant={allSelected ? 'default' : 'outline'}>
                  {categoryTools.filter(t => selectedTools.has(t.id)).length}/{categoryTools.length}
                </Badge>
              </div>
            </Card>
          );
        })}

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => setShowCategoryAssignment(false)}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

---

## 🚀 Benefits of This Integration

### Before (Hardcoded)
- ❌ 12 fake tool names that don't exist
- ❌ No connection to actual tool implementation
- ❌ Can't control tool behavior
- ❌ No analytics

### After (Database-Driven)
- ✅ 13 real expert tools from database
- ✅ Full tool metadata (description, tags, cost, API keys)
- ✅ Per-tool settings (priority, auto-use, confirmation)
- ✅ Category-based bulk assignment
- ✅ Usage limits (per day, per conversation)
- ✅ Premium tool access control
- ✅ Full analytics and tracking
- ✅ No code changes needed to add new tools

---

## 📊 Visual Improvements

**Tool cards show**:
- ✅ Tool name and description
- ✅ Category icon and color
- ✅ Tags with custom colors
- ✅ "API Key Required" badge
- ✅ "Premium" badge
- ✅ Cost per call
- ✅ Priority slider (0-10)
- ✅ "Auto-use" checkbox
- ✅ "Ask before using" checkbox

**Quick assignment**:
- ✅ "Assign by Category" modal
- ✅ One-click to assign all Evidence Research tools
- ✅ One-click to assign all Regulatory tools
- ✅ Visual feedback showing X/Y tools assigned per category

---

## 🎯 Summary

This integration:
1. **Removes hardcoded tools** (lines 89-102)
2. **Loads tools from database** via `toolRegistryService`
3. **Displays tools grouped by category** with full metadata
4. **Allows per-tool configuration** (priority, auto-use, confirmation)
5. **Saves assignments to database** via `agent_tool_assignments` table
6. **Enables quick bulk assignment** via category modal

**Files to modify**: Just `/src/features/chat/components/agent-creator.tsx`

**Dependencies**: Tool registry system must be migrated first (`npx supabase db push`)
