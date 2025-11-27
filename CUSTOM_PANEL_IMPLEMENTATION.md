# Custom Panel Creation Implementation Guide

## Summary
Enable users to create custom panels in the Workflow Designer, save them to Supabase, and test them in the Ask Panel feature.

## ✅ Completed Steps

### 1. Database Schema
- Created migration: `supabase/migrations/20251127000001_add_workflow_definition_to_user_panels.sql`
- Added `workflow_definition` JSONB field to `user_panels` table
- **Action needed**: Apply migration via Supabase dashboard or CLI

### 2. API Endpoint
- Updated `/api/user-panels/route.ts`
- Added `workflow_definition` parameter to POST endpoint
- Implemented `extractExpertAgentsFromWorkflow()` helper function
- Endpoint automatically extracts expert agents from workflow nodes

## 🔄 Remaining Implementation Steps

### 3. Add Save as Panel Dialog

**File**: `/Users/amine/Desktop/vital/apps/vital-system/src/features/workflow-designer/components/designer/WorkflowDesignerEnhanced.tsx`

Add state for the dialog:
```typescript
const [showSavePanelDialog, setShowSavePanelDialog] = useState(false);
const [panelName, setPanelName] = useState('');
const [panelDescription, setPanelDescription] = useState('');
const [savingPanel, setSavingPanel] = useState(false);
```

Modify `handleSaveWorkflow` to detect panel workflows:
```typescript
const handleSaveWorkflow = useCallback(async () => {
  // Detect if this is a panel workflow (has expertAgent nodes)
  const hasExpertAgents = nodes.some(n => n.data?.type === 'expertAgent' || n.type === 'expertAgent');

  if (hasExpertAgents) {
    // Show dialog to save as custom panel
    setShowSavePanelDialog(true);
    return;
  }

  // Normal workflow save logic...
}, [nodes, edges]);
```

Add save panel handler:
```typescript
const handleSaveAsPanel = useCallback(async () => {
  if (!panelName.trim()) {
    alert('Please enter a panel name');
    return;
  }

  setSavingPanel(true);

  try {
    const workflowDef = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: n.position,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
      })),
    };

    const response = await fetch('/api/user-panels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: panelName,
        description: panelDescription,
        category: 'custom_panel',
        base_panel_slug: currentPanelType, // If based on a template
        mode: 'sequential', // or detect from workflow
        framework: 'langgraph',
        workflow_definition: workflowDef,
        icon: '🎨',
        tags: ['custom', 'designer'],
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(`Panel "${panelName}" saved successfully!`);
      setShowSavePanelDialog(false);
      setPanelName('');
      setPanelDescription('');

      // Open Ask Panel page to test
      window.open(`/ask-panel?panel_id=${data.panel.id}`, '_blank');
    } else {
      alert(`Failed to save panel: ${data.error}`);
    }
  } catch (error) {
    console.error('Error saving panel:', error);
    alert('Failed to save panel');
  } finally {
    setSavingPanel(false);
  }
}, [nodes, edges, panelName, panelDescription, currentPanelType]);
```

Add dialog UI (before closing `</>`):
```typescript
{/* Save as Panel Dialog */}
{showSavePanelDialog && (
  <Dialog open={showSavePanelDialog} onOpenChange={setShowSavePanelDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save as Custom Panel</DialogTitle>
        <DialogDescription>
          Save this workflow as a custom panel that you can use in Ask Panel
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="panel-name">Panel Name *</Label>
          <Input
            id="panel-name"
            value={panelName}
            onChange={(e) => setPanelName(e.target.value)}
            placeholder="e.g., My Custom FDA Panel"
          />
        </div>

        <div>
          <Label htmlFor="panel-description">Description (optional)</Label>
          <Textarea
            id="panel-description"
            value={panelDescription}
            onChange={(e) => setPanelDescription(e.target.value)}
            placeholder="Describe what this panel does..."
            rows={3}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>✓ {nodes.filter(n => n.data?.type === 'expertAgent').length} expert agents detected</p>
          <p>✓ {nodes.length} total nodes, {edges.length} connections</p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setShowSavePanelDialog(false)}
          disabled={savingPanel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveAsPanel}
          disabled={savingPanel || !panelName.trim()}
        >
          {savingPanel ? 'Saving...' : 'Save & Test in Ask Panel'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

### 4. Update Ask Panel to Load Custom Panels

**File**: `/Users/amine/Desktop/vital/apps/vital-system/src/features/ask-panel/...` (find the main Ask Panel component)

Update panel loading logic:
```typescript
// Fetch both template and custom panels
const loadPanels = async () => {
  const [templatesRes, customRes] = await Promise.all([
    fetch('/api/panels'),
    fetch('/api/user-panels')
  ]);

  const templates = await templatesRes.json();
  const custom = await customRes.json();

  setPanels([
    ...templates.panels,
    ...custom.panels.map(p => ({
      ...p,
      slug: `custom-${p.id}`,
      isCustom: true,
    }))
  ]);
};
```

Update panel execution logic:
```typescript
const handleExecutePanel = async (panelId: string) => {
  // Check if it's a custom panel
  if (panelId.startsWith('custom-')) {
    const customPanel = panels.find(p => p.id === panelId.replace('custom-', ''));

    if (customPanel?.workflow_definition) {
      // Execute custom panel using its workflow_definition
      await executeCustomPanelWorkflow(customPanel.workflow_definition, query);
      return;
    }
  }

  // Otherwise use template panel logic
  await executeTemplatePanelWorkflow(panelId, query);
};
```

### 5. Backend Workflow Execution

**File**: Create `/Users/amine/Desktop/vital/services/ai-engine/src/routes/execute_custom_panel.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any

router = APIRouter()

class CustomPanelRequest(BaseModel):
    workflow_definition: Dict[str, Any]
    query: str
    user_id: str

@router.post("/execute-custom-panel")
async def execute_custom_panel(request: CustomPanelRequest):
    """
    Execute a custom panel workflow
    """
    workflow_def = request.workflow_definition

    # Extract nodes and edges
    nodes = workflow_def.get('nodes', [])
    edges = workflow_def.get('edges', [])

    # Build LangGraph workflow from definition
    from langgraph.graph import StateGraph

    # ... implement workflow execution logic
    # Similar to existing panel execution but using workflow_definition

    return {
        "success": True,
        "result": "Panel execution result"
    }
```

## Testing Steps

1. **Create a Custom Panel**:
   - Open Workflow Designer
   - Load a panel template (e.g., Structured Panel)
   - Modify it (add/remove experts, change workflow)
   - Click "Save"
   - Enter panel name in dialog
   - Click "Save & Test in Ask Panel"

2. **Verify in Ask Panel**:
   - Should open Ask Panel in new tab
   - Custom panel should appear in panel list
   - Select custom panel
   - Enter a query
   - Execute and verify it uses the custom workflow

3. **Database Verification**:
   - Check `user_panels` table
   - Verify `workflow_definition` is saved correctly
   - Verify `selected_agents` contains expert agent IDs

## Migration Application

Apply the database migration:

### Option 1: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Paste contents of `supabase/migrations/20251127000001_add_workflow_definition_to_user_panels.sql`
5. Run the migration

### Option 2: Direct SQL (if you have database access)
```sql
ALTER TABLE public.user_panels
ADD COLUMN IF NOT EXISTS workflow_definition JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_panels.workflow_definition IS 'Complete workflow definition including nodes, edges, and phases from the designer';

CREATE INDEX IF NOT EXISTS idx_user_panels_workflow_definition
ON public.user_panels USING GIN (workflow_definition);
```

## Files Modified/Created

- ✅ `supabase/migrations/20251127000001_add_workflow_definition_to_user_panels.sql` (created)
- ✅ `/app/api/user-panels/route.ts` (modified - added workflow_definition support)
- 🔄 `WorkflowDesignerEnhanced.tsx` (needs modification - add save dialog)
- 🔄 Ask Panel component (needs modification - load/execute custom panels)
- 🔄 Backend execution endpoint (needs creation - execute custom workflows)

## Next Actions

1. Apply the database migration
2. Add the Save as Panel dialog to WorkflowDesignerEnhanced
3. Update Ask Panel to load and display custom panels
4. Implement custom panel execution in backend
5. Test end-to-end flow
