'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Zap,
  Shield,
  Activity,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  goal?: {
    id: string;
    description: string;
    successCriteria: Array<{
      id: string;
      description: string;
      achieved: boolean;
    }>;
  };
  completedTasks: number;
  totalTasks: number;
  progress: number;
  iteration: number;
  elapsedTime: number;
  totalCost: number;
  confidenceScore: number;
  insights: string[];
  evidence: Array<{
    id: string;
    type: string;
    confidence: number;
    source: string;
  }>;
  verificationProofs: Array<{
    id: string;
    type: string;
    verified: boolean;
  }>;
  metrics: {
    taskSuccessRate: number;
    goalAchievementRate: number;
    avgTaskDuration: number;
    costEfficiency: number;
  };
  className?: string;
}

export function ProgressDashboard({
  goal,
  completedTasks,
  totalTasks,
  progress,
  iteration,
  elapsedTime,
  totalCost,
  confidenceScore,
  insights,
  evidence,
  verificationProofs,
  metrics,
  className
}: ProgressDashboardProps) {
  const [timeElapsed, setTimeElapsed] = useState(elapsedTime);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProgressColor = (value: number): string => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Goal Overview */}
      {goal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Goal Description</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Success Criteria</h3>
              <div className="space-y-2">
                {goal.successCriteria.map((criteria) => (
                  <div key={criteria.id} className="flex items-center gap-2">
                    {criteria.achieved ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className={cn(
                      'text-sm',
                      criteria.achieved ? 'text-green-700' : 'text-muted-foreground'
                    )}>
                      {criteria.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className={getProgressColor(progress)}>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Elapsed Time</p>
                <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Iteration #{iteration}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Avg: ${(totalCost / Math.max(completedTasks, 1)).toFixed(2)}/task
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{(confidenceScore * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge className={getConfidenceColor(confidenceScore)}>
                {confidenceScore >= 0.8 ? 'High' : confidenceScore >= 0.6 ? 'Medium' : 'Low'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {(metrics.taskSuccessRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Task Success Rate</div>
              <div className="mt-2">
                <Progress value={metrics.taskSuccessRate * 100} className="h-2" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(metrics.goalAchievementRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Goal Achievement</div>
              <div className="mt-2">
                <Progress value={metrics.goalAchievementRate * 100} className="h-2" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatTime(metrics.avgTaskDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Task Duration</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {metrics.costEfficiency.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Cost Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence and Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Evidence Chain ({evidence.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evidence.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <Badge className={getConfidenceColor(item.confidence)}>
                    {(item.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
              {evidence.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{evidence.length - 5} more evidence items
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verification Proofs ({verificationProofs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationProofs.slice(0, 5).map((proof) => (
                <div key={proof.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {proof.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm font-medium">{proof.type}</span>
                  </div>
                  <Badge className={proof.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {proof.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))}
              {verificationProofs.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{verificationProofs.length - 5} more proofs
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recent Insights ({insights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.slice(-5).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Goal extracted and tasks generated</div>
                <div className="text-xs text-muted-foreground">Started autonomous execution</div>
              </div>
              <div className="text-xs text-muted-foreground">0:00</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">First task completed</div>
                <div className="text-xs text-muted-foreground">Research phase initiated</div>
              </div>
              <div className="text-xs text-muted-foreground">2:15</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-purple-600 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Evidence collection phase</div>
                <div className="text-xs text-muted-foreground">Gathering supporting data</div>
              </div>
              <div className="text-xs text-muted-foreground">5:42</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-yellow-600 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Synthesis and analysis</div>
                <div className="text-xs text-muted-foreground">Processing collected information</div>
              </div>
              <div className="text-xs text-muted-foreground">8:30</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">Final verification</div>
                <div className="text-xs text-muted-foreground">Validating results and generating proofs</div>
              </div>
              <div className="text-xs text-muted-foreground">In progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
