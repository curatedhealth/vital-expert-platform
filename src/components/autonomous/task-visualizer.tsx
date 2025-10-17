'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  ArrowRight,
  ArrowDown,
  Zap,
  DollarSign,
  Timer,
  Target,
  Brain,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  description: string;
  type: 'research' | 'analysis' | 'validation' | 'synthesis' | 'compliance_check' | 'web_search' | 'rag_query';
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[];
  estimatedCost: number;
  actualCost?: number;
  duration?: number;
  toolsUsed?: string[];
  confidence?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

interface TaskVisualizerProps {
  tasks: Task[];
  currentTask?: Task;
  onTaskClick?: (task: Task) => void;
  onRetryTask?: (taskId: string) => void;
  onCancelTask?: (taskId: string) => void;
  className?: string;
}

export function TaskVisualizer({
  tasks,
  currentTask,
  onTaskClick,
  onRetryTask,
  onCancelTask,
  className
}: TaskVisualizerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'type' | 'cost'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'dependency'>('list');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'cost':
          comparison = (a.actualCost || a.estimatedCost) - (b.actualCost || b.estimatedCost);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    totalCost: tasks.reduce((sum, task) => sum + (task.actualCost || task.estimatedCost), 0),
    avgConfidence: tasks
      .filter(t => t.confidence !== undefined)
      .reduce((sum, task, _, arr) => sum + (task.confidence! / arr.length), 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return <Search className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      case 'validation': return <Target className="h-4 w-4" />;
      case 'synthesis': return <Zap className="h-4 w-4" />;
      case 'compliance_check': return <CheckCircle className="h-4 w-4" />;
      case 'web_search': return <Search className="h-4 w-4" />;
      case 'rag_query': return <Brain className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'text-red-600 bg-red-100';
    if (priority >= 7) return 'text-orange-600 bg-orange-100';
    if (priority >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Task Queue ({stats.total} tasks)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}
              >
                {viewMode === 'list' ? 'Timeline' : 'List'} View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${stats.totalCost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="priority">Priority</option>
                <option value="created">Created</option>
                <option value="type">Type</option>
                <option value="cost">Cost</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No tasks found matching the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                'transition-all duration-200 hover:shadow-md',
                currentTask?.id === task.id && 'ring-2 ring-blue-500',
                task.status === 'in_progress' && 'bg-blue-50',
                task.status === 'completed' && 'bg-green-50',
                task.status === 'failed' && 'bg-red-50'
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        P{task.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getTypeIcon(task.type)}
                        <span className="text-xs">{task.type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {task.description}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${(task.actualCost || task.estimatedCost).toFixed(2)}
                      </div>
                      {task.duration && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(task.duration)}
                        </div>
                      )}
                      {task.confidence && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {(task.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.createdAt)}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTasks.has(task.id) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {task.toolsUsed && task.toolsUsed.length > 0 && (
                          <div>
                            <span className="text-xs font-medium">Tools Used:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.toolsUsed.map((tool, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.dependencies && task.dependencies.length > 0 && (
                          <div>
                            <span className="text-xs font-medium">Dependencies:</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {task.dependencies.join(', ')}
                            </div>
                          </div>
                        )}

                        {task.error && (
                          <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                            <strong>Error:</strong> {task.error}
                          </div>
                        )}

                        {task.retryCount !== undefined && task.maxRetries && (
                          <div className="text-xs text-muted-foreground">
                            Retries: {task.retryCount}/{task.maxRetries}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(task.id)}
                    >
                      {expandedTasks.has(task.id) ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>

                    {task.status === 'failed' && onRetryTask && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetryTask(task.id)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}

                    {(task.status === 'pending' || task.status === 'in_progress') && onCancelTask && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelTask(task.id)}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}

                    {onTaskClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTaskClick(task)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
