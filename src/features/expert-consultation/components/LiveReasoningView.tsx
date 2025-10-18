/**
 * Live Reasoning View Component
 * Enhanced visualization of autonomous agent reasoning process
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings, 
  Eye, 
  EyeOff,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { useReasoningStream } from '../hooks/useReasoningStream';
import { PhaseIndicator } from './PhaseIndicator';
import { ReasoningStepCard } from './ReasoningStepCard';
import type { LiveReasoningViewProps } from '@/types/reasoning';

export function LiveReasoningView({ 
  sessionId, 
  isVisible = true, 
  onComplete, 
  onError 
}: LiveReasoningViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'compact' | 'detailed'>('timeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const {
    steps,
    currentPhase,
    currentIteration,
    goalProgress,
    isStreaming,
    isConnected,
    lastUpdate,
    error,
    connect,
    disconnect,
    clearSteps,
    totalSteps,
    completedSteps,
    failedSteps,
    currentStep,
    isComplete
  } = useReasoningStream({
    sessionId,
    onStep: (step) => {
      console.log('📝 [LiveReasoningView] New step received:', step);
    },
    onPhaseChange: (phase, metadata) => {
      console.log('🔄 [LiveReasoningView] Phase changed:', phase, metadata);
    },
    onComplete: (finalState) => {
      console.log('✅ [LiveReasoningView] Execution completed:', finalState);
      onComplete?.(finalState);
    },
    onError: (error) => {
      console.error('❌ [LiveReasoningView] Stream error:', error);
      onError?.(error);
    }
  });

  // Filter and search steps
  const filteredSteps = useMemo(() => {
    let filtered = steps;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(step => step.status === filterStatus);
    }

    // Search in content
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(step => 
        step.content.description.toLowerCase().includes(query) ||
        step.content.reasoning?.toLowerCase().includes(query) ||
        step.content.insights?.some(insight => insight.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [steps, filterStatus, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCost = steps.reduce((sum, step) => sum + (step.metadata.cost || 0), 0);
    const totalTokens = steps.reduce((sum, step) => sum + (step.metadata.tokensUsed || 0), 0);
    const avgConfidence = steps.length > 0 
      ? steps.reduce((sum, step) => sum + (step.metadata.confidence || 0), 0) / steps.length 
      : 0;

    return {
      totalCost,
      totalTokens,
      avgConfidence,
      successRate: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    };
  }, [steps, totalSteps, completedSteps]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="live-reasoning-view h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Agent Reasoning Process</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time view of autonomous agent decision-making
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <Badge 
                variant={isConnected ? "default" : "destructive"}
                className="text-xs"
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>

              {/* Control Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isStreaming ? disconnect : connect}
                  disabled={!sessionId}
                >
                  {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSteps}
                  disabled={steps.length === 0}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Phase Indicator */}
          <PhaseIndicator 
            phase={currentPhase} 
            isActive={isStreaming}
            progress={goalProgress}
          />
        </CardHeader>

        {/* Statistics */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSteps}</div>
              <div className="text-xs text-gray-500">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${stats.totalCost.toFixed(4)}</div>
              <div className="text-xs text-gray-500">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgConfidence * 100)}%</div>
              <div className="text-xs text-gray-500">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="compact">Compact</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>

              {/* Filters and Search */}
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search steps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs border rounded pl-7 pr-2 py-1 w-32"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="timeline" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredSteps.map((step, idx) => (
                    <ReasoningStepCard
                      key={step.id}
                      step={step}
                      stepNumber={idx + 1}
                      isLatest={idx === filteredSteps.length - 1}
                      showDetails={viewMode === 'detailed'}
                    />
                  ))}

                  {isStreaming && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Agent is thinking...</span>
                      </div>
                    </div>
                  )}

                  {!isStreaming && steps.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No reasoning steps yet. Start a conversation to see the agent's thinking process.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="compact" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        step.status === 'completed' && "bg-green-50 border-green-200",
                        step.status === 'failed' && "bg-red-50 border-red-200",
                        step.status === 'in_progress' && "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {step.content.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.phase} • {step.status}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="detailed" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredSteps.map((step, idx) => (
                    <ReasoningStepCard
                      key={step.id}
                      step={step}
                      stepNumber={idx + 1}
                      isLatest={idx === filteredSteps.length - 1}
                      showDetails={true}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={connect}
              className="mt-2"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}