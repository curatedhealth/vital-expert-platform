'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Wrench, Database, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Start Node
export const StartNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-green-700">Start</p>
        <p className="text-xs text-gray-500">{data.label}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
});
StartNode.displayName = 'StartNode';

// End Node
export const EndNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center justify-center mt-4">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-red-700">Complete</p>
        <p className="text-xs text-gray-500">{data.label}</p>
      </div>
    </div>
  );
});
EndNode.displayName = 'EndNode';

// Workflow Header Node
export const WorkflowHeaderNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Card className="min-w-[320px] border-2 border-purple-500 shadow-xl bg-gradient-to-r from-purple-500 to-purple-600">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Badge className="mb-2 bg-white/20 text-white border-0">
                Workflow {data.position}
              </Badge>
              <CardTitle className="text-lg text-white font-bold">
                {data.name}
              </CardTitle>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{data.position}</span>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
});
WorkflowHeaderNode.displayName = 'WorkflowHeaderNode';

// Task Node
export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const hasAgents = data.agents && data.agents.length > 0;
  const hasTools = data.tools && data.tools.length > 0;
  const hasRags = data.rags && data.rags.length > 0;
  const hasAssignments = hasAgents || hasTools || hasRags;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <Card 
        className={cn(
          "min-w-[300px] max-w-[360px] transition-all duration-200",
          selected 
            ? "border-2 border-blue-600 shadow-2xl ring-4 ring-blue-100" 
            : "border-2 border-blue-300 shadow-lg hover:shadow-xl"
        )}
      >
        {/* Header */}
        <CardHeader className="p-0">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                Task {data.position}
              </Badge>
              <span className="text-xs font-mono text-white/80">
                {data.workflowPosition}.{data.position}
              </span>
            </div>
            <CardTitle className="text-sm font-semibold text-white leading-tight">
              {data.title}
            </CardTitle>
          </div>
        </CardHeader>

        {/* Body - Assignments */}
        {hasAssignments && (
          <CardContent className="p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {/* Agents */}
            {hasAgents && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {data.agents.length} Agent{data.agents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data.agents.slice(0, 4).map((agent: any) => (
                    <div
                      key={agent.id}
                      className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 text-xs"
                    >
                      <p className="font-medium text-blue-900 truncate">
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-blue-600">
                        Order: {agent.execution_order}
                      </p>
                    </div>
                  ))}
                </div>
                {data.agents.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.agents.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {/* Tools */}
            {hasTools && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {data.tools.length} Tool{data.tools.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.tools.slice(0, 3).map((tool: any) => (
                    <Badge
                      key={tool.id}
                      variant="outline"
                      className="text-[10px] bg-green-50 border-green-300 text-green-800"
                    >
                      {tool.name}
                    </Badge>
                  ))}
                  {data.tools.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{data.tools.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* RAG Sources */}
            {hasRags && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {data.rags.length} Source{data.rags.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {data.rags.slice(0, 2).map((rag: any) => (
                    <div
                      key={rag.id}
                      className="bg-purple-50 border border-purple-200 rounded-md px-2 py-1.5"
                    >
                      <p className="text-xs font-medium text-purple-900 truncate">
                        {rag.name}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {rag.source_type}
                      </Badge>
                    </div>
                  ))}
                  {data.rags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{data.rags.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {/* Empty state */}
        {!hasAssignments && (
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No assignments</p>
          </CardContent>
        )}
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
});
TaskNode.displayName = 'TaskNode';

