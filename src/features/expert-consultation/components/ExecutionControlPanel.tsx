'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { useExecutionControl } from '../hooks/useExecutionControl';

interface ExecutionControlPanelProps {
  sessionId: string;
  isExecuting: boolean;
  onStatusChange: (status: string) => void;
}

export function ExecutionControlPanel({ sessionId, isExecuting, onStatusChange }: ExecutionControlPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    status, 
    canPause, 
    canResume, 
    canStop, 
    pause, 
    resume, 
    stop, 
    error 
  } = useExecutionControl(sessionId);

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await pause();
      onStatusChange('paused');
    } catch (err) {
      console.error('Failed to pause:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await resume();
      onStatusChange('running');
    } catch (err) {
      console.error('Failed to resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await stop();
      onStatusChange('stopped');
    } catch (err) {
      console.error('Failed to stop:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stopped': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'completed': return <Square className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Execution Control
          </div>
          <Badge className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2">
            {canPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={isLoading}
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            
            {canResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                disabled={isLoading}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            
            {canStop && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                disabled={isLoading}
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Control Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Status Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Session: {sessionId.slice(0, 8)}...</div>
              <div>Status: {status}</div>
              <div>Executing: {isExecuting ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(sessionId)}
                className="text-xs"
              >
                Copy Session ID
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
