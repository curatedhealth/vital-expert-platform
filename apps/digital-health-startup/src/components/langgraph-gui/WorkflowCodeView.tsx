/**
 * WorkflowCodeView Component
 * Displays the Python code representation of the workflow
 */

import React, { useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowCodeViewProps {
  nodes: Node[];
  edges: Edge[];
  workflowName?: string;
  workflowPhaseNodes?: any[];
  workflowPhaseEdges?: any[];
  className?: string;
}

export const WorkflowCodeView: React.FC<WorkflowCodeViewProps> = ({
  nodes,
  edges,
  workflowName = 'Workflow',
  workflowPhaseNodes,
  workflowPhaseEdges,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const pythonCode = useMemo(() => {
    return generatePythonCode(
      nodes, 
      edges, 
      workflowName,
      workflowPhaseNodes,
      workflowPhaseEdges
    );
  }, [nodes, edges, workflowName, workflowPhaseNodes, workflowPhaseEdges]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-900 text-gray-100", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Python Code</h3>
          <p className="text-sm text-gray-400 mt-1">Generated workflow code</p>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-6">
        <pre className="text-sm font-mono leading-relaxed">
          <code className="text-gray-100">{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
};

function generatePythonCode(
  nodes: Node[], 
  edges: Edge[], 
  workflowName: string,
  workflowPhaseNodes?: any[],
  workflowPhaseEdges?: any[]
): string {
  const lines: string[] = [];
  
  lines.push('"""');
  lines.push(`${workflowName} - Generated Workflow Code`);
  lines.push('This code represents the workflow structure as a LangGraph StateGraph');
  lines.push('"""');
  lines.push('');
  lines.push('from langgraph.graph import StateGraph, END');
  lines.push('from typing import Dict, Any, List, AsyncGenerator');
  lines.push('from backend.panels.base import PanelState');
  lines.push('from backend.integration.panel_nodes import create_panel_node, NODE_REGISTRY');
  lines.push('from backend.integration.panel_tasks import PanelTaskExecutor');
  lines.push('');
  lines.push('');
  lines.push('def create_workflow(task_executor: PanelTaskExecutor, log_callback=None):');
  lines.push('    """Create and configure the workflow graph"""');
  lines.push('    workflow = StateGraph(PanelState)');
  lines.push('    node_instances = {}');
  lines.push('');
  
  // Use workflow phase nodes if available (for panel workflows), otherwise use regular nodes
  const nodesToUse = (workflowPhaseNodes && workflowPhaseNodes.length > 0) 
    ? workflowPhaseNodes.map((n: any) => ({ 
        id: n.id, 
        type: n.type, 
        data: n.data || n.config || {},
        label: n.label || n.id
      }))
    : nodes;
  const edgesToUse = (workflowPhaseEdges && workflowPhaseEdges.length > 0)
    ? workflowPhaseEdges.map((e: any) => ({
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target
      }))
    : edges;
  
  // Add nodes
  if (nodesToUse.length > 0) {
    lines.push('    # Add nodes');
    nodesToUse.forEach((node: any) => {
      const nodeData = node.data || {};
      const task = nodeData?.task;
      const nodeType = node.type || nodeData?.type;
      const nodeLabel = nodeData?.label || node.label || node.id;
      
      if (task) {
        // Panel workflow node
        const taskId = task.id;
        const taskName = task.name || taskId;
        const config = task.config || {};
        
        lines.push(`    # Node: ${nodeLabel} (${taskId})`);
        
        // Check if it's a registered panel node type
        const isPanelNode = ['initialize', 'opening_statements', 'discussion_round', 
                            'consensus_building', 'consensus_assessment', 'qna', 'documentation', 
                            'opening_round', 'free_dialogue', 'theme_clustering', 
                            'final_perspectives', 'synthesis'].includes(taskId);
        
        if (isPanelNode) {
          lines.push(`    node_${node.id.replace(/-/g, '_')} = create_panel_node(`);
          lines.push(`        "${taskId}",`);
          lines.push(`        "${node.id}",`);
          lines.push(`        {`);
          if (config.model) {
            lines.push(`            "model": "${config.model}",`);
          }
          if (config.temperature !== undefined) {
            lines.push(`            "temperature": ${config.temperature},`);
          }
          if (config.tools && Array.isArray(config.tools) && config.tools.length > 0) {
            lines.push(`            "tools": ${JSON.stringify(config.tools)},`);
          }
          if (config.systemPrompt) {
            const escapedPrompt = JSON.stringify(config.systemPrompt);
            lines.push(`            "systemPrompt": ${escapedPrompt},`);
          }
          lines.push(`        },`);
          lines.push(`        task_executor,`);
          lines.push(`        log_callback`);
          lines.push(`    )`);
          lines.push(`    workflow.add_node("${node.id}", node_${node.id.replace(/-/g, '_')}.execute)`);
          lines.push(`    node_instances["${node.id}"] = node_${node.id.replace(/-/g, '_')}`);
        } else {
          // Custom task node
          lines.push(`    # Custom task: ${taskName}`);
          lines.push(`    def ${node.id.replace(/-/g, '_')}(state: PanelState) -> PanelState:`);
          lines.push(`        """${taskName} node"""`);
          if (config.systemPrompt) {
            lines.push(`        # System prompt: ${config.systemPrompt.substring(0, 60)}${config.systemPrompt.length > 60 ? '...' : ''}`);
          }
          if (config.model) {
            lines.push(`        # Model: ${config.model}`);
          }
          if (config.tools && Array.isArray(config.tools) && config.tools.length > 0) {
            lines.push(`        # Tools: ${config.tools.join(', ')}`);
          }
          lines.push(`        # TODO: Implement ${taskId} logic`);
          lines.push(`        return state`);
          lines.push(`    workflow.add_node("${node.id}", ${node.id.replace(/-/g, '_')})`);
        }
      } else if (nodeType && ['initialize', 'opening_statements', 'discussion_round', 
                              'consensus_building', 'qna', 'documentation', 'opening_round',
                              'free_dialogue', 'theme_clustering', 'final_perspectives', 'synthesis'].includes(nodeType)) {
        // Workflow phase node (from workflowPhaseNodes)
        lines.push(`    # Node: ${nodeLabel} (${nodeType})`);
        lines.push(`    node_${node.id.replace(/-/g, '_')} = create_panel_node(`);
        lines.push(`        "${nodeType}",`);
        lines.push(`        "${node.id}",`);
        lines.push(`        ${JSON.stringify(nodeData.config || {}, null, 12).replace(/\n/g, '\n        ')},`);
        lines.push(`        task_executor,`);
        lines.push(`        log_callback`);
        lines.push(`    )`);
        lines.push(`    workflow.add_node("${node.id}", node_${node.id.replace(/-/g, '_')}.execute)`);
        lines.push(`    node_instances["${node.id}"] = node_${node.id.replace(/-/g, '_')}`);
      } else {
        // Regular node (orchestrator, etc.)
        const finalNodeType = nodeType || 'unknown';
        lines.push(`    # Node: ${nodeLabel} (${finalNodeType})`);
        lines.push(`    def ${node.id.replace(/-/g, '_')}(state: PanelState) -> PanelState:`);
        lines.push(`        """${nodeLabel} node"""`);
        lines.push(`        # TODO: Implement ${finalNodeType} logic`);
        lines.push(`        return state`);
        lines.push(`    workflow.add_node("${node.id}", ${node.id.replace(/-/g, '_')})`);
      }
      lines.push('');
    });
  }
  
  // Set entry point
  if (nodesToUse.length > 0) {
    const entryNode = nodesToUse.find((n: any) => {
      const data = n.data || {};
      return data?.task?.id === 'initialize' || n.id === 'initialize' || n.type === 'initialize';
    }) || nodesToUse[0];
    
    lines.push(`    # Set entry point`);
    lines.push(`    workflow.set_entry_point("${entryNode.id}")`);
    lines.push('');
  }
  
  // Add edges
  if (edgesToUse.length > 0) {
    lines.push('    # Add edges');
    edgesToUse.forEach((edge: any) => {
      if (edge.target === 'END' || edge.target?.toLowerCase() === 'end') {
        lines.push(`    workflow.add_edge("${edge.source}", END)`);
      } else {
        lines.push(`    workflow.add_edge("${edge.source}", "${edge.target}")`);
      }
    });
    lines.push('');
  }
  
  // Compile and return
  lines.push('    # Compile workflow');
  lines.push('    app = workflow.compile()');
  lines.push('    return app, node_instances');
  lines.push('');
  lines.push('');
  lines.push('async def execute_workflow(');
  lines.push('    query: str,');
  lines.push('    openai_api_key: str,');
  lines.push('    provider: str = "openai",');
  lines.push('    ollama_base_url: str = "http://localhost:11434",');
  lines.push('    ollama_model: str = "qwen3:4b"');
  lines.push(') -> AsyncGenerator[Dict[str, Any], None]:');
  lines.push('    """Execute the workflow"""');
  lines.push('    # Initialize task executor');
  lines.push('    selected_model = ollama_model if provider == "ollama" else "gpt-4o"');
  lines.push('    task_executor = PanelTaskExecutor(');
  lines.push('        openai_api_key=openai_api_key if provider == "openai" else None,');
  lines.push('        provider=provider,');
  lines.push('        ollama_base_url=ollama_base_url,');
  lines.push('        default_model=selected_model');
  lines.push('    )');
  lines.push('');
  lines.push('    # Create workflow');
  lines.push('    app, node_instances = create_workflow(task_executor)');
  lines.push('');
  lines.push('    # Prepare initial state');
  lines.push('    initial_state: PanelState = {');
  lines.push('        "panel_id": "workflow-1",');
  lines.push('        "user_id": "user",');
  lines.push('        "query": query,');
  lines.push('        "panel_type": "structured",  # or "open"');
  lines.push('        "status": "executing",');
  lines.push('        "current_round": 0,');
  lines.push('        "rounds_completed": 0,');
  lines.push('        "tasks": [],');
  lines.push('        "expert_tasks": [],');
  lines.push('        "discussions": [],');
  lines.push('        "opening_statements": [],');
  lines.push('        "dialogue_turns": [],');
  lines.push('    }');
  lines.push('');
  lines.push('    # Execute workflow');
  lines.push('    async for event in app.astream(initial_state):');
  lines.push('        yield event');
  lines.push('');
  lines.push('');
  lines.push('if __name__ == "__main__":');
  lines.push('    import asyncio');
  lines.push('    ');
  lines.push('    async def main():');
  lines.push('        async for event in execute_workflow(');
  lines.push('            query="Your question here",');
  lines.push('            openai_api_key="sk-your-key-here"');
  lines.push('        ):');
  lines.push('            print(event)');
  lines.push('    ');
  lines.push('    asyncio.run(main())');
  
  return lines.join('\n');
}

export default WorkflowCodeView;

