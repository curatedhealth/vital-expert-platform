'use client';

import { useState } from 'react';
import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Settings } from 'lucide-react';
import { WorkflowProperties } from './WorkflowProperties';
import { NodeProperties } from './NodeProperties';

export function PropertiesPanel() {
  const {
    nodes,
    selectedNodes,
    updateNodeData,
    workflowTitle,
    workflowDescription,
    setWorkflowTitle,
    setWorkflowDescription,
  } = useWorkflowEditorStore();

  const [activeTab, setActiveTab] = useState<'workflow' | 'node'>('workflow');

  const selectedNode = selectedNodes.length === 1 
    ? nodes.find((n) => n.id === selectedNodes[0])
    : null;

  const handleNodeUpdate = (key: string, value: any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { [key]: value });
    }
  };

  const agentCount = nodes.filter((n) => n.type === 'agent').length;

  return (
    <div className="w-96 border-l bg-muted/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Properties</h2>
        <p className="text-xs text-muted-foreground">
          {selectedNode ? 'Node settings' : 'Workflow settings'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full grid grid-cols-2 m-4 mb-0">
          <TabsTrigger value="workflow">
            <FileText className="w-4 h-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="node" disabled={!selectedNode}>
            <Settings className="w-4 h-4 mr-2" />
            Node
          </TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <WorkflowProperties
              title={workflowTitle}
              description={workflowDescription}
              nodeCount={nodes.length}
              agentCount={agentCount}
              onTitleChange={setWorkflowTitle}
              onDescriptionChange={setWorkflowDescription}
            />
          </ScrollArea>
        </TabsContent>

        {/* Node Tab */}
        <TabsContent value="node" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <NodeProperties node={selectedNode} onUpdate={handleNodeUpdate} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

