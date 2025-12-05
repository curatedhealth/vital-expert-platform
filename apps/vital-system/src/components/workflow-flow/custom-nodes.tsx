'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Wrench, Database, Play, CheckCircle2, AlertCircle, Clock, Layers, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Start Node
export const StartNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-emerald-500/20 rounded-full animate-pulse" />
          <div className="absolute w-20 h-20 bg-emerald-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-emerald-200">
            <Play className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-4 text-center max-w-[200px]">
        <p className="text-sm font-bold text-emerald-700">Start Workflow</p>
        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{data.label}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
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
        className="!bg-rose-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
      />
      <div className="flex items-center justify-center mt-4">
        <div className="relative">
          <div className="absolute w-20 h-20 bg-rose-500/20 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="relative w-16 h-16 bg-gradient-to-br from-rose-400 to-red-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-rose-200">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-bold text-rose-700">Complete</p>
        <p className="text-xs text-neutral-600 mt-1">{data.label}</p>
      </div>
    </div>
  );
});
EndNode.displayName = 'EndNode';

// Stage Node (replaces WorkflowHeaderNode with more detail)
export const StageNode = memo(({ data, selected }: NodeProps) => {
  const taskCount = data.taskCount || 0;
  const estimatedHours = data.estimatedHours || 0;
  const isMandatory = data.isMandatory ?? true;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-violet-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
      />
      <Card className={cn(
        "min-w-[340px] max-w-[400px] transition-all duration-300",
        selected 
          ? "border-2 border-violet-600 shadow-2xl ring-4 ring-violet-100 scale-105" 
          : "border-2 border-violet-400 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
      )}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-4 rounded-t-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
              Stage {data.position}
            </Badge>
            <div className="flex items-center gap-2">
              {isMandatory && (
                <Badge className="bg-amber-400/90 text-amber-900 border-0 text-[10px]">
                  Required
                </Badge>
              )}
              {data.unique_id && (
                <span className="text-xs font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded">
                  {data.unique_id}
                </span>
              )}
            </div>
          </div>
          <CardTitle className="text-lg text-white font-bold leading-tight">
            {data.name}
          </CardTitle>
          {data.description && (
            <p className="text-xs text-white/80 mt-2 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>

        {/* Stats footer */}
        <CardContent className="p-4 bg-gradient-to-b from-violet-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-violet-100 px-3 py-1.5 rounded-lg">
                <Layers className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">{taskCount}</span>
                <span className="text-xs text-violet-600">tasks</span>
              </div>
              {estimatedHours > 0 && (
                <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">{estimatedHours}h</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-violet-400" />
          </div>
        </CardContent>
      </Card>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-violet-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});
StageNode.displayName = 'StageNode';

// Workflow Header Node (legacy, keeping for compatibility)
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

// Task Node with agents, tools, and RAG sources
export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const hasAgents = data.agents && data.agents.length > 0;
  const hasTools = data.tools && data.tools.length > 0;
  const hasRags = data.rags && data.rags.length > 0;
  const hasAssignments = hasAgents || hasTools || hasRags;
  
  const taskType = data.extra?.task_type || 'manual';
  const durationMinutes = data.extra?.estimated_duration_minutes || 0;
  
  // Format duration: <1h = minutes, 1-24h = hours, >24h = days
  const formatDuration = (minutes: number): string | null => {
    if (minutes <= 0) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  };
  const formattedDuration = formatDuration(durationMinutes);

  // Task type colors
  const taskTypeColors: Record<string, { bg: string; text: string; border: string }> = {
    manual: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-400' },
    automated: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-400' },
    decision: { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-400' },
    review: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-400' },
    approval: { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-400' },
  };
  
  const typeColor = taskTypeColors[taskType] || taskTypeColors.manual;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
      />
      
      <Card 
        className={cn(
          "min-w-[320px] max-w-[380px] transition-all duration-200",
          selected 
            ? `border-2 ${typeColor.border} shadow-2xl ring-4 ring-blue-100 scale-105` 
            : `border-2 ${typeColor.border} shadow-lg hover:shadow-xl hover:scale-[1.02]`
        )}
      >
        {/* Header */}
        <CardHeader className="p-0">
          <div className={`${typeColor.bg} px-4 py-3 rounded-t-lg`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  Task {data.position}
                </Badge>
                <Badge className="bg-white/30 text-white border-0 text-[10px] capitalize">
                  {taskType}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {formattedDuration && (
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                    <Clock className="w-3 h-3" />
                    {formattedDuration}
                  </div>
                )}
                {data.code && (
                  <span className="text-[10px] font-mono text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                    {data.code}
                  </span>
                )}
              </div>
            </div>
            <CardTitle className="text-sm font-semibold text-white leading-tight">
              {data.title}
            </CardTitle>
            {data.objective && (
              <p className="text-xs text-white/80 mt-1.5 line-clamp-2">
                {data.objective}
              </p>
            )}
          </div>
        </CardHeader>

        {/* Body - Assignments */}
        {hasAssignments && (
          <CardContent className="p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {/* Agents */}
            {hasAgents && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700">
                    {data.agents.length} Agent{data.agents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data.agents.slice(0, 4).map((agent: any, idx: number) => (
                    <div
                      key={agent.id || idx}
                      className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2 hover:bg-blue-100 transition-colors"
                    >
                      <p className="font-medium text-blue-900 text-xs truncate">
                        {agent.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-white">
                          {agent.assignment_type}
                        </Badge>
                        {agent.execution_order > 1 && (
                          <span className="text-[9px] text-blue-600">
                            #{agent.execution_order}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {data.agents.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.agents.length - 4} more agents
                  </Badge>
                )}
              </div>
            )}

            {/* Tools */}
            {hasTools && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                    <Wrench className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700">
                    {data.tools.length} Tool{data.tools.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.tools.slice(0, 5).map((tool: any, idx: number) => (
                    <Badge
                      key={tool.id || idx}
                      variant="outline"
                      className={cn(
                        "text-[10px] bg-emerald-50 border-emerald-300 text-emerald-800",
                        !tool.is_required && "opacity-70"
                      )}
                    >
                      {tool.name}
                    </Badge>
                  ))}
                  {data.tools.length > 5 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{data.tools.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* RAG Sources */}
            {hasRags && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-sm">
                    <Database className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700">
                    {data.rags.length} Knowledge Source{data.rags.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {data.rags.slice(0, 2).map((rag: any, idx: number) => (
                    <div
                      key={rag.id || idx}
                      className="bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-2"
                    >
                      <p className="text-xs font-medium text-purple-900 truncate">
                        {rag.name}
                      </p>
                      <Badge variant="outline" className="text-[9px] mt-1 bg-white">
                        {rag.source_type}
                      </Badge>
                    </div>
                  ))}
                  {data.rags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{data.rags.length - 2} more sources
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {/* Empty state */}
        {!hasAssignments && (
          <CardContent className="p-4 text-center bg-neutral-50">
            <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">No resources assigned</p>
          </CardContent>
        )}
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-4 !h-4 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});
TaskNode.displayName = 'TaskNode';
