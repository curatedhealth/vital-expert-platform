/**
 * Enhanced Workflow Toolbar Component
 * 
 * Integrates legacy WorkflowBuilder features into modern designer toolbar
 * Now includes v0 AI-powered component generation
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
  Wand2,
  Users,
  Workflow as WorkflowIcon,
  Layers,
  MoreVertical,
  Settings,
  FileCode,
  TestTube,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';

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
  onTestWorkflow?: () => void;
  onSettings: () => void;

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
  
  // Export/Import/Code
  onExportWorkflow?: () => void;
  onImportWorkflow?: () => void;
  onViewCode?: () => void;
  panelType?: string | null;
  
  // v0 AI Generation
  onOpenV0Generator?: () => void;
  v0Enabled?: boolean;
}

export function EnhancedWorkflowToolbar({
  onUndo,
  onRedo,
  onAutoLayout,
  onSave,
  onExecute,
  onTestWorkflow,
  onSettings,
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
  onOpenV0Generator,
  v0Enabled = true,
}: EnhancedWorkflowToolbarProps) {
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [showTaskFlow, setShowTaskFlow] = useState(false);
  const [showPhaseEditor, setShowPhaseEditor] = useState(false);
  const [showWorkflowCode, setShowWorkflowCode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

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
        {/* Left Section - History & Layout */}
        <div className="flex items-center gap-2">
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
          
          <div className="h-4 w-px bg-border" />
          
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
          
          {/* Panel Workflows Dropdown */}
          {onLoadPanelWorkflow && availablePanelTypes.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Panel Workflows
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Load Panel Workflow</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availablePanelTypes.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => onLoadPanelWorkflow(type)}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* v0 AI Generator Button */}
          {v0Enabled && onOpenV0Generator && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenV0Generator}
                    className="gap-2 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200 text-violet-700"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate with AI</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-violet-100 text-violet-700 hidden md:inline-flex">
                      v0
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">AI Component Generator</p>
                  <p className="text-xs text-muted-foreground">Generate custom nodes, panels, and solutions with v0</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Advanced Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowWorkflowCode(true)}>
                <FileCode className="h-4 w-4 mr-2" />
                View Code
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
            <Settings className="h-4 w-4" />
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
          {onTestWorkflow && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTestWorkflow}
              disabled={!hasNodes}
              title="Test workflow with custom inputs"
            >
              <TestTube className="h-4 w-4 mr-1" />
              Test
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={onExecute}
            disabled={isExecuting || !hasNodes}
            title="Run workflow"
          >
            <Play className="h-4 w-4 mr-1" />
            {isExecuting ? 'Running...' : 'Run'}
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
    </>
  );
}

