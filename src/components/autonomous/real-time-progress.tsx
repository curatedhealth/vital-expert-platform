'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  FileText, 
  Database,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAutonomousStream, StreamEvent } from '@/hooks/use-autonomous-stream';
import { AutonomousStreamOptions } from '@/hooks/use-autonomous-stream';

interface RealTimeProgressProps {
  options: AutonomousStreamOptions;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function RealTimeProgress({ 
  options, 
  onComplete, 
  onError, 
  className = '' 
}: RealTimeProgressProps) {
  const {
    isConnected,
    isExecuting,
    events,
    currentGoal,
    currentTasks,
    completedTasks,
    evidence,
    memory,
    progress,
    result,
    error,
    metrics,
    connect,
    disconnect,
    clearEvents
  } = useAutonomousStream();

  const [isStarted, setIsStarted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-start execution when options change
  useEffect(() => {
    if (options.query && !isStarted && !isExecuting) {
      handleStart();
    }
  }, [options.query]);

  // Handle completion
  useEffect(() => {
    if (result && onComplete) {
      onComplete(result);
    }
  }, [result, onComplete]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleStart = async () => {
    setIsStarted(true);
    clearEvents();
    await connect(options);
  };

  const handleStop = () => {
    disconnect();
    setIsStarted(false);
  };

  const handlePause = () => {
    // Note: Pausing is not implemented in the current version
    // This would require additional API support
    console.log('Pause not implemented yet');
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal': return <Target className="h-4 w-4" />;
      case 'tasks': return <List className="h-4 w-4" />;
      case 'task_started': return <Play className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      case 'task_failed': return <XCircle className="h-4 w-4" />;
      case 'evidence': return <FileText className="h-4 w-4" />;
      case 'memory': return <Brain className="h-4 w-4" />;
      case 'progress': return <Activity className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'complete': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'goal': return 'bg-blue-100 text-blue-800';
      case 'tasks': return 'bg-green-100 text-green-800';
      case 'task_completed': return 'bg-green-100 text-green-800';
      case 'task_failed': return 'bg-red-100 text-red-800';
      case 'evidence': return 'bg-purple-100 text-purple-800';
      case 'memory': return 'bg-orange-100 text-orange-800';
      case 'progress': return 'bg-cyan-100 text-cyan-800';
      case 'safety': return 'bg-yellow-100 text-yellow-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!currentGoal || !currentTasks.length) return 0;
    const totalTasks = currentTasks.length;
    const completedCount = completedTasks.length;
    return Math.round((completedCount / totalTasks) * 100);
  };

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Real-time Autonomous Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge variant={isExecuting ? 'default' : 'outline'}>
                {isExecuting ? 'Executing' : 'Idle'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {!isStarted ? (
              <Button onClick={handleStart} disabled={!options.query}>
                <Play className="h-4 w-4 mr-2" />
                Start Execution
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} disabled={!isExecuting} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={handleStop} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="outline"
              size="sm"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {/* Progress Bar */}
          {isExecuting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      {currentGoal && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {currentGoal.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{currentGoal.domain}</Badge>
              <Badge variant="outline">{currentGoal.priority}</Badge>
              <Badge variant="outline">{currentGoal.estimatedDuration}min</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Execution Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.tasksCompleted}</div>
              <div className="text-xs text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.tasksFailed}</div>
              <div className="text-xs text-muted-foreground">Tasks Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.evidenceCollected}</div>
              <div className="text-xs text-muted-foreground">Evidence Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.memoryUpdates}</div>
              <div className="text-xs text-muted-foreground">Memory Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Detailed Events */}
      {showDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={getEventColor(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.message && (
                      <p className="text-sm mt-1">{event.message}</p>
                    )}
                    {event.data && typeof event.data === 'object' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(event.data, null, 2).substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Progress */}
      {currentTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentTasks.map((task, index) => {
                const isCompleted = completedTasks.some(ct => ct.id === task.id);
                return (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.description}</p>
                      <p className="text-xs text-muted-foreground">{task.type}</p>
                    </div>
                    <Badge variant={isCompleted ? 'default' : 'outline'}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
