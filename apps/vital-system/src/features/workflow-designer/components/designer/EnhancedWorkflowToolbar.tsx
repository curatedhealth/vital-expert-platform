/**
 * Enhanced Workflow Toolbar Component
 * 
 * Integrates legacy WorkflowBuilder features into modern designer toolbar
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Save,
  Play,
  Undo,
  Redo,
  Layout as LayoutIcon,
  Sparkles,
  Users,
  Workflow as WorkflowIcon,
  Layers,
  MoreVertical,
  Settings,
  FileCode,
  Download,
  Upload,
  FileJson,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { PANEL_CONFIGS } from '@/components/langgraph-gui/panel-workflows/panel-definitions';

// Dynamically import modals to avoid SSR issues
const AgentConfigModal = dynamic(
  () => import('@/components/langgraph-gui/AgentConfigModal').then(mod => ({ default: mod.AgentConfigModal })),
  { ssr: false }
);

const TaskFlowModal = dynamic(
  () => import('@/components/langgraph-gui/TaskFlowModal').then(mod => ({ default: mod.TaskFlowModal })),
  { ssr: false }
);

const WorkflowPhaseEditor = dynamic(
  () => import('@/components/langgraph-gui/WorkflowPhaseEditor').then(mod => ({ default: mod.WorkflowPhaseEditor })),
  { ssr: false }
);

interface EnhancedWorkflowToolbarProps {
  // Basic actions
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onSave: () => void;
  onExecute: () => void;
  onSettings: () => void;
  onTestWorkflow?: () => void; // New prop for test modal
  
  // State
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isExecuting: boolean;
  hasNodes: boolean;
  
  // Panel workflows
  onLoadPanelWorkflow?: (type: string) => void;
  availablePanelTypes?: string[];
  
  // Advanced features
  nodes?: any[];
  edges?: any[];
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  
  // Workflow management
  onExportWorkflow?: () => void;
  onImportWorkflow?: () => void;
  onViewCode?: () => void;
  panelType?: string | null;
}

export function EnhancedWorkflowToolbar({
  onUndo,
  onRedo,
  onAutoLayout,
  onSave,
  onExecute,
  onSettings,
  onTestWorkflow, // New prop
  canUndo,
  canRedo,
  isDirty,
  isExecuting,
  hasNodes,
  onLoadPanelWorkflow,
  availablePanelTypes = [],
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onExportWorkflow,
  onImportWorkflow,
  onViewCode,
  panelType,
}: EnhancedWorkflowToolbarProps) {
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [showTaskFlow, setShowTaskFlow] = useState(false);
  const [showPhaseEditor, setShowPhaseEditor] = useState(false);
  const [showWorkflowCode, setShowWorkflowCode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Use legacy PANEL_CONFIGS directly for exact fidelity
  const templates = Object.values(PANEL_CONFIGS);

  const handleAgentConfig = () => {
    // Find all agent nodes
    const agentNodes = nodes.filter(n => 
      n.data?.type === 'agent' || n.data?.type === 'orchestrator'
    );
    
    if (agentNodes.length > 0) {
      setSelectedAgent(agentNodes[0].data);
      setShowAgentConfig(true);
    } else {
      alert('No agent nodes found. Please add an agent node first.');
    }
  };

  const handleSaveAgent = (agentData: any) => {
    if (selectedAgent && onNodesChange) {
      const updatedNodes = nodes.map(n => {
        if (n.id === selectedAgent.id) {
          return {
            ...n,
            data: {
              ...n.data,
              config: {
                ...n.data.config,
                ...agentData,
              },
            },
          };
        }
        return n;
      });
      onNodesChange(updatedNodes);
    }
    setShowAgentConfig(false);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b p-2 bg-muted/50">
        {/* Left Section - Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Templates Button */}
          {onLoadPanelWorkflow && availablePanelTypes.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Templates
            </Button>
          )}
          
          <div className="h-4 w-px bg-border" />
          
          {/* Code View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewCode}
            disabled={!hasNodes}
            title="View generated code"
          >
            <FileCode className="h-4 w-4 mr-1" />
            Code View
          </Button>
          
          {/* Test Workflow Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTestWorkflow || onExecute}
            disabled={isExecuting || !hasNodes}
            title="Test workflow execution"
          >
            <Play className="h-4 w-4 mr-1" />
            Test Workflow
          </Button>
          
          {/* Auto Layout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoLayout}
            disabled={!hasNodes}
            title="Auto-arrange nodes"
          >
            <LayoutIcon className="h-4 w-4 mr-1" />
            Auto Layout
          </Button>
          
          {/* Export Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportWorkflow}
            disabled={!hasNodes}
            title="Export workflow as JSON"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          {/* Import Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onImportWorkflow}
            title="Import workflow from JSON"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          
          <div className="h-4 w-px bg-border" />
          
          {/* History Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          {/* Advanced Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Advanced Features</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAgentConfig}>
                <Users className="h-4 w-4 mr-2" />
                Configure Agents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTaskFlow(true)}>
                <WorkflowIcon className="h-4 w-4 mr-2" />
                Task Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPhaseEditor(true)}>
                <Layers className="h-4 w-4 mr-2" />
                Workflow Phases
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Right Section - Status & Actions */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            title="Settings"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!isDirty}
            title="Save workflow (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Advanced Feature Modals */}
      {showAgentConfig && selectedAgent && (
        <AgentConfigModal
          open={showAgentConfig}
          onClose={() => setShowAgentConfig(false)}
          agentData={selectedAgent}
          onSave={handleSaveAgent}
        />
      )}
      
      {showTaskFlow && (
        <TaskFlowModal
          open={showTaskFlow}
          onClose={() => setShowTaskFlow(false)}
          nodes={nodes}
          edges={edges}
          onUpdate={(updatedNodes, updatedEdges) => {
            if (onNodesChange) onNodesChange(updatedNodes);
            if (onEdgesChange) onEdgesChange(updatedEdges);
            setShowTaskFlow(false);
          }}
        />
      )}
      
      {showPhaseEditor && (
        <WorkflowPhaseEditor
          open={showPhaseEditor}
          onClose={() => setShowPhaseEditor(false)}
          nodes={nodes}
          edges={edges}
          onUpdate={(updatedNodes, updatedEdges) => {
            if (onNodesChange) onNodesChange(updatedNodes);
            if (onEdgesChange) onEdgesChange(updatedEdges);
            setShowPhaseEditor(false);
          }}
        />
      )}
      
      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Workflow Template</DialogTitle>
            <DialogDescription>
              Choose a pre-built workflow template to get started. Includes Ask Expert modes, panel workflows, and more.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] pr-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground mb-2">No templates available yet</p>
                <p className="text-xs text-muted-foreground">Templates will appear here once they're created</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ask Expert Modes from Legacy PANEL_CONFIGS */}
                {templates.filter(t => t.id.includes('mode')).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Ask Expert Modes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates
                        .filter(t => t.id.includes('mode'))
                        .map((template: any) => {
                          const IconComp = template.icon || Sparkles;
                          return (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                              onClick={() => {
                                if (onLoadPanelWorkflow) {
                                  onLoadPanelWorkflow(template.id);
                                }
                                setShowTemplateSelector(false);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="text-primary mt-1">
                                    <IconComp size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {template.description}
                                    </p>
                                    <div className="mt-2 flex gap-1">
                                      <Badge variant="secondary" className="text-xs">Legacy Exact</Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
                
                {/* Panel Workflows from Legacy PANEL_CONFIGS */}
                {templates.filter(t => !t.id.includes('mode')).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Panel Workflows
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates
                        .filter(t => !t.id.includes('mode'))
                        .map((template: any) => {
                          const IconComp = template.icon || Users;
                          return (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                              onClick={() => {
                                if (onLoadPanelWorkflow) {
                                  onLoadPanelWorkflow(template.id);
                                }
                                setShowTemplateSelector(false);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="text-primary mt-1">
                                    <IconComp size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {template.description}
                                    </p>
                                    <div className="mt-2 flex gap-1">
                                      <Badge variant="secondary" className="text-xs">Legacy Exact</Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

