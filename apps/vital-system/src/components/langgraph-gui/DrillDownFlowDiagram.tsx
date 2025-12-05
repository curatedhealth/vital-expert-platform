import React from 'react';
import { Node, Edge } from 'reactflow';
import { ChevronRight, Edit2, ChevronLeft, Workflow } from 'lucide-react';
import { getNodesAtLevel, getBreadcrumbPath, hasNestedTasks, getNestedTaskCount } from '../utils/taskHierarchy';
import { TaskDefinition } from './TaskLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DrillDownFlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
  onNodeEdit: (nodeId: string) => void;
  onNavigateUp: () => void;
  onNavigateToLevel?: (targetLevel: number) => void;
  currentPath: string[]; // Array of node IDs representing current drill-down path
}

export const DrillDownFlowDiagram: React.FC<DrillDownFlowDiagramProps> = ({
  nodes,
  edges,
  onNodeClick,
  onNodeEdit,
  onNavigateUp,
  onNavigateToLevel,
  currentPath,
}) => {
  // Get nodes at current level
  const currentLevelNodes = getNodesAtLevel(nodes, edges, currentPath);
  const breadcrumbs = getBreadcrumbPath(nodes, currentPath);

  const handleTaskClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && hasNestedTasks(node)) {
      // Drill down into this task
      onNodeClick(nodeId);
    }
  };

  const handleBreadcrumbClick = (index: number, _nodeId: string) => {
    if (index === 0) {
      // Navigate to root
      if (onNavigateToLevel) {
        onNavigateToLevel(0);
      } else {
        // Fallback: navigate up until root
        while (currentPath.length > 0) {
          onNavigateUp();
        }
      }
    } else {
      // Navigate to specific level (index - 1 because index 0 is root)
      const targetLevel = index - 1;
      if (onNavigateToLevel) {
        onNavigateToLevel(targetLevel);
      } else {
        // Fallback: navigate up until target level
        const stepsUp = currentPath.length - targetLevel;
        for (let i = 0; i < stepsUp; i++) {
          onNavigateUp();
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 p-4 border-b border-neutral-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateUp}
          disabled={currentPath.length === 0}
          title="Go back to previous level"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <span className="text-neutral-400">›</span>}
              <Button
                variant={index === breadcrumbs.length - 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => handleBreadcrumbClick(index, crumb.id)}
                disabled={index === breadcrumbs.length - 1}
                className="whitespace-nowrap"
              >
                {crumb.name}
              </Button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Level Tasks */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentLevelNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
            <Workflow size={48} className="mb-4 text-neutral-400" />
            <p className="font-medium">No tasks at this level</p>
            {currentPath.length > 0 && (
              <p className="text-sm mt-2 text-neutral-400">This task doesn't have any sub-tasks yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentLevelNodes.map((node) => {
              const task: TaskDefinition = node.data?.task;
              const hasNested = hasNestedTasks(node);
              const nestedCount = getNestedTaskCount(node);
              const taskName = task?.name || node.data?.label || node.id;
              const taskDescription = task?.description || node.data?.description || '';
              const taskIcon = task?.icon || '📋';
              const taskCategory = task?.category || '';

              return (
                <Card
                  key={node.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                    hasNested && "border-l-4 border-l-primary",
                    node.selected && "ring-2 ring-primary"
                  )}
                  onClick={() => handleTaskClick(node.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl flex-shrink-0">{taskIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base mb-1">{taskName}</div>
                        {taskCategory && (
                          <Badge variant="outline" className="text-xs">{taskCategory}</Badge>
                        )}
                      </div>
                      {hasNested && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs" title={`${nestedCount} sub-task${nestedCount !== 1 ? 's' : ''}`}>
                          <Workflow size={12} />
                          {nestedCount}
                        </Badge>
                      )}
                    </div>

                    {taskDescription && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{taskDescription}</p>
                    )}
                    {task?.config?.model && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className="text-xs">{task.config.model}</Badge>
                        {task.config.tools && task.config.tools.length > 0 && (
                          <Badge variant="default" className="text-xs">
                            {task.config.tools.length} tool{task.config.tools.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeEdit(node.id);
                        }}
                        title="Edit task configuration"
                        className="flex-1"
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                      {hasNested && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(node.id);
                          }}
                          title="View sub-tasks"
                          className="flex-1"
                        >
                          View Sub-tasks
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      )}
                    </div>

                    {hasNested && (
                      <div className="mt-3 text-xs text-neutral-500 italic text-center pt-2 border-t border-neutral-100">
                        Click to drill down into {nestedCount} sub-task{nestedCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

