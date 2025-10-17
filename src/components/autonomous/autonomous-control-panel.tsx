'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Stop, 
  RotateCcw,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Settings,
  Target,
  BarChart3,
  Shield,
  DollarSign
} from 'lucide-react';

interface AutonomousControlPanelProps {
  onStart: (config: AutonomousConfig) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onSettingsChange: (settings: AutonomousSettings) => void;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  currentTask?: string;
  completedTasks: number;
  totalTasks: number;
  insights: string[];
  iteration: number;
  elapsedTime: number;
  totalCost: number;
  confidenceScore: number;
  error?: string;
}

interface AutonomousConfig {
  query: string;
  mode: 'manual' | 'automatic';
  selectedAgent?: any;
  maxIterations: number;
  maxCost: number;
  supervisionLevel: 'none' | 'low' | 'medium' | 'high';
  selectedTools: string[];
}

interface AutonomousSettings {
  maxIterations: number;
  maxCost: number;
  maxDuration: number;
  supervisionLevel: 'none' | 'low' | 'medium' | 'high';
  safetyEnabled: boolean;
  autoRetry: boolean;
  parallelExecution: boolean;
}

export function AutonomousControlPanel({
  onStart,
  onStop,
  onPause,
  onResume,
  onSettingsChange,
  status,
  progress,
  currentTask,
  completedTasks,
  totalTasks,
  insights,
  iteration,
  elapsedTime,
  totalCost,
  confidenceScore,
  error
}: AutonomousControlPanelProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'manual' | 'automatic'>('automatic');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [settings, setSettings] = useState<AutonomousSettings>({
    maxIterations: 50,
    maxCost: 100,
    maxDuration: 60,
    supervisionLevel: 'medium',
    safetyEnabled: true,
    autoRetry: true,
    parallelExecution: true
  });
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [availableTools, setAvailableTools] = useState<string[]>([]);

  // Mock data - in real implementation, this would come from props or API
  useEffect(() => {
    setAvailableAgents([
      { id: '1', name: 'Clinical Research Expert', domain: 'clinical' },
      { id: '2', name: 'Regulatory Affairs Specialist', domain: 'regulatory' },
      { id: '3', name: 'Medical Writer', domain: 'writing' },
      { id: '4', name: 'Data Analyst', domain: 'analytics' }
    ]);

    setAvailableTools([
      'fda_database_search',
      'clinical_trials_search',
      'pubmed_search',
      'web_search',
      'rag_query',
      'knowledge_search'
    ]);
  }, []);

  const handleStart = () => {
    if (!query.trim()) return;

    const config: AutonomousConfig = {
      query,
      mode,
      selectedAgent: mode === 'manual' ? selectedAgent : undefined,
      maxIterations: settings.maxIterations,
      maxCost: settings.maxCost,
      supervisionLevel: settings.supervisionLevel,
      selectedTools
    };

    onStart(config);
  };

  const handleSettingsChange = (newSettings: Partial<AutonomousSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Goal Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Autonomous Goal Setting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">What do you want the AI to accomplish?</Label>
            <Textarea
              id="query"
              placeholder="Describe your goal in detail...
Example: Research the latest treatments for Type 2 diabetes and create a comprehensive report comparing their effectiveness, side effects, and costs."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              disabled={status === 'running'}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Execution Mode</Label>
              <Select value={mode} onValueChange={(value: 'manual' | 'automatic') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic - AI selects best agent</SelectItem>
                  <SelectItem value="manual">Manual - You select the agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'manual' && (
              <div className="space-y-2">
                <Label htmlFor="agent">Select Agent</Label>
                <Select value={selectedAgent?.id || ''} onValueChange={(value) => {
                  const agent = availableAgents.find(a => a.id === value);
                  setSelectedAgent(agent);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {status === 'idle' && (
              <Button 
                onClick={handleStart}
                disabled={!query.trim() || (mode === 'manual' && !selectedAgent)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Autonomous Execution
              </Button>
            )}
            
            {status === 'running' && (
              <>
                <Button 
                  onClick={onPause}
                  variant="secondary"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={onStop}
                  variant="destructive"
                  className="flex-1"
                >
                  <Stop className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            
            {status === 'paused' && (
              <>
                <Button 
                  onClick={onResume}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                <Button 
                  onClick={onStop}
                  variant="destructive"
                  className="flex-1"
                >
                  <Stop className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            
            {status === 'completed' && (
              <Button 
                onClick={() => window.location.reload()}
                variant="secondary"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Autonomous Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxIterations">Max Iterations</Label>
                <Input
                  id="maxIterations"
                  type="number"
                  value={settings.maxIterations}
                  onChange={(e) => handleSettingsChange({ maxIterations: parseInt(e.target.value) || 50 })}
                  min="1"
                  max="200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCost">Max Cost ($)</Label>
                <Input
                  id="maxCost"
                  type="number"
                  value={settings.maxCost}
                  onChange={(e) => handleSettingsChange({ maxCost: parseFloat(e.target.value) || 100 })}
                  min="1"
                  max="1000"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max Duration (min)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  value={settings.maxDuration}
                  onChange={(e) => handleSettingsChange({ maxDuration: parseInt(e.target.value) || 60 })}
                  min="1"
                  max="480"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisionLevel">Supervision Level</Label>
                <Select 
                  value={settings.supervisionLevel} 
                  onValueChange={(value: 'none' | 'low' | 'medium' | 'high') => 
                    handleSettingsChange({ supervisionLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Fully Autonomous</SelectItem>
                    <SelectItem value="low">Low - Minimal Intervention</SelectItem>
                    <SelectItem value="medium">Medium - Regular Checkpoints</SelectItem>
                    <SelectItem value="high">High - Frequent Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="safetyEnabled">Safety Controls</Label>
                <Switch
                  id="safetyEnabled"
                  checked={settings.safetyEnabled}
                  onCheckedChange={(checked) => handleSettingsChange({ safetyEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoRetry">Auto Retry Failed Tasks</Label>
                <Switch
                  id="autoRetry"
                  checked={settings.autoRetry}
                  onCheckedChange={(checked) => handleSettingsChange({ autoRetry: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="parallelExecution">Parallel Task Execution</Label>
                <Switch
                  id="parallelExecution"
                  checked={settings.parallelExecution}
                  onCheckedChange={(checked) => handleSettingsChange({ parallelExecution: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Status */}
      {status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Execution Progress
              </span>
              <Badge className={getStatusColor(status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(status)}
                  {status.toUpperCase()}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{iteration}</div>
                <div className="text-xs text-muted-foreground">Iterations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTasks - completedTasks}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>

            {/* Cost and Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">Cost: ${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Confidence: {(confidenceScore * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Current Task */}
            {currentTask && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="font-medium">Current Task:</span>
                </div>
                <p className="text-sm mt-1">{currentTask}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Error:</span>
                </div>
                <p className="text-sm mt-1 text-red-700">{error}</p>
              </div>
            )}

            {/* Recent Insights */}
            {insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Latest Insights
                </h4>
                <div className="space-y-1">
                  {insights.slice(-3).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                      <span className="text-xs">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
