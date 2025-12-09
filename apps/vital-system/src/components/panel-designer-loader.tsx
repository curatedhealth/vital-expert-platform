'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Dynamically import WorkflowDesignerEnhanced to avoid SSR issues
const WorkflowDesignerEnhanced = dynamic(
  () => import('@/features/workflow-designer/components/designer/WorkflowDesignerEnhanced').then(
    mod => ({ default: mod.WorkflowDesignerEnhanced })
  ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Panel Designer...</p>
        </div>
      </div>
    ),
  }
);

interface PanelDesignerLoaderProps {
  panel: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    mode: string;
    framework: string;
    metadata?: Record<string, any>;
  };
  onSave: (updatedPanel: any) => Promise<void>;
  onExecute: (workflow: any) => void;
}

export function PanelDesignerLoader({ panel, onSave, onExecute }: PanelDesignerLoaderProps) {
  const [initialWorkflow, setInitialWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customPanelName, setCustomPanelName] = useState(panel.name);
  const [customPanelDescription, setCustomPanelDescription] = useState(panel.description);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingWorkflow, setPendingWorkflow] = useState<any>(null);

  // Auto-load structured panel workflow when component mounts
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setIsLoading(true);
        
        // If workflow already exists in metadata, use it
        if (panel.metadata?.workflow_definition) {
          setInitialWorkflow(panel.metadata.workflow_definition);
          setIsLoading(false);
          return;
        }

        // Otherwise, load the default structured panel workflow
        if (panel.slug === 'structured_panel') {
          const { createDefaultPanelWorkflow } = await import('@/components/langgraph-gui/panel-workflows');
          const panelWorkflow = createDefaultPanelWorkflow('structured_panel');
          
          // Convert to WorkflowDefinition format for initialWorkflow
          const workflowDef = {
            id: `panel-${panel.slug}`,
            name: panel.name,
            description: panel.description,
            framework: panel.framework as 'langgraph' | 'autogen' | 'crewai',
            nodes: panelWorkflow.nodes.map((node: any) => {
              let nodeType: string = 'agent';
              if (node.type === 'input') nodeType = 'start';
              else if (node.type === 'output') nodeType = 'end';
              else if (node.data?.task) nodeType = 'task';
              else if (node.data?._original_type) nodeType = node.data._original_type;
              else if (node.type === 'task') nodeType = 'task';
              
              return {
                id: node.id,
                type: nodeType as any,
                label: node.data?.label || node.data?.task?.name || node.id,
                position: node.position || { x: 0, y: 0 }, // Default position if undefined
                config: {
                  ...node.data,
                  task: node.data?.task,
                  expertType: node.data?.expertType,
                  context: node.data?.context,
                  parameters: node.data?.parameters,
                },
                data: node.data || {},
              };
            }),
            edges: panelWorkflow.edges.map((edge: any, idx: number) => ({
              id: edge.id || `edge-${idx}`,
              source: edge.source,
              target: edge.target,
              type: (edge.type || 'default') as any,
              label: edge.label,
            })),
            config: {},
            metadata: {
              panel_type: 'structured_panel',
              name: panel.name,
              phases: panelWorkflow.phases,
              workflowName: panelWorkflow.workflowName,
            },
          };
          
          setInitialWorkflow(workflowDef);
        }
      } catch (err) {
        console.error('Failed to load panel workflow:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [panel.slug, panel.metadata, panel.name, panel.description, panel.framework]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[800px] border rounded-lg">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading panel workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[800px] border rounded-lg overflow-hidden bg-white">
      <WorkflowDesignerEnhanced
        mode="editor"
        onSave={async (workflow: any) => {
          try {
            console.log('💾 Save button clicked, opening save dialog...', workflow);
            
            // Extract agent IDs from workflow nodes
            const agentIds: string[] = [];
            if (workflow.nodes && Array.isArray(workflow.nodes)) {
              workflow.nodes.forEach((node: any) => {
                const nodeType = node.type;
                console.log(`Checking node ${node.id}: type=${nodeType}, config=`, node.config);
                
                if (nodeType === 'agent' || nodeType === 'expertAgent') {
                  const agentId = node.config?.agentId || 
                                  node.expertConfig?.id ||
                                  node.agentId;
                  if (agentId && typeof agentId === 'string' && agentId.trim() && !agentIds.includes(agentId)) {
                    agentIds.push(agentId);
                    console.log(`✅ Found agent ID: ${agentId} in node ${node.id}`);
                  } else {
                    console.log(`⚠️ Node ${node.id} is agent type but has no agentId`);
                  }
                }
              });
            }
            
            console.log(`💾 Found ${agentIds.length} agents:`, agentIds);
            
            // Store workflow and open dialog for custom name
            setPendingWorkflow({ workflow, agentIds });
            setCustomPanelName(panel.name);
            setCustomPanelDescription(panel.description);
            setShowSaveDialog(true);
          } catch (error) {
            console.error('❌ Failed to prepare save:', error);
          }
        }}
        onExecute={onExecute}
        className="h-full"
        apiBaseUrl={process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}
        initialWorkflow={initialWorkflow}
        embedded={true}
      />
      
      {/* Save Dialog with Custom Name */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Panel</DialogTitle>
            <DialogDescription>
              Save this panel with a custom name so you can access it later. The panel will be saved to Supabase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-panel-name">Panel Name *</Label>
              <Input
                id="custom-panel-name"
                value={customPanelName}
                onChange={(e) => setCustomPanelName(e.target.value)}
                placeholder="e.g., My Test Panel"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-panel-description">Description (Optional)</Label>
              <Textarea
                id="custom-panel-description"
                value={customPanelDescription}
                onChange={(e) => setCustomPanelDescription(e.target.value)}
                placeholder="Describe your panel..."
                rows={3}
              />
            </div>

            {pendingWorkflow && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <p className="font-medium mb-1">Panel Summary:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{pendingWorkflow.workflow.nodes?.length || 0} node{pendingWorkflow.workflow.nodes?.length !== 1 ? 's' : ''}</li>
                  <li>{pendingWorkflow.workflow.edges?.length || 0} connection{pendingWorkflow.workflow.edges?.length !== 1 ? 's' : ''}</li>
                  <li>{pendingWorkflow.agentIds.length} expert agent{pendingWorkflow.agentIds.length !== 1 ? 's' : ''}</li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setPendingWorkflow(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!customPanelName.trim()) {
                  alert('Please enter a panel name');
                  return;
                }
                
                if (!pendingWorkflow) {
                  alert('No workflow to save');
                  return;
                }
                
                // Validate that we have real agent IDs from the workflow
                if (!Array.isArray(pendingWorkflow.agentIds)) {
                  alert('Invalid agent data. Please try refreshing the page.');
                  return;
                }
                
                if (pendingWorkflow.agentIds.length === 0) {
                  const confirmSave = confirm('No agents found in workflow. The database requires at least one agent. Do you want to save anyway? (This will fail if the constraint is enforced)');
                  if (!confirmSave) {
                    return;
                  }
                }
                
                setIsSaving(true);
                try {
                  console.log(`💾 Saving panel "${customPanelName}" with ${pendingWorkflow.agentIds.length} agents from database`);
                  
                  // Only send real data from database - no defaults
                  await onSave({
                    name: customPanelName.trim(),
                    description: customPanelDescription.trim() || null,
                    category: panel.category,
                    mode: panel.mode,
                    framework: panel.framework,
                    selected_agents: pendingWorkflow.agentIds, // Real agent IDs from workflow nodes
                    workflow_definition: pendingWorkflow.workflow, // Real workflow from designer
                  });
                  
                  console.log('✅ Panel saved successfully to database');
                  setShowSaveDialog(false);
                  setPendingWorkflow(null);
                  alert(`Panel "${customPanelName}" saved successfully!`);
                } catch (error) {
                  console.error('❌ Failed to save panel:', error);
                  alert('Failed to save panel. Please try again.');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving || !customPanelName.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Panel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

