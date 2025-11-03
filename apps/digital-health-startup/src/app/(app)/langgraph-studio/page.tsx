/**
 * LangGraph Studio Page
 * 
 * A dedicated page for visualizing and exploring LangGraph workflows
 * Similar to LangGraph Studio but integrated into your app
 */

'use client';

import { useState, useEffect } from 'react';
import { LangGraphWorkflowVisualizer } from '@/components/langgraph-visualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  GitBranch,
  Play,
  RefreshCw,
  Info,
  Settings,
  Code,
  Eye,
} from 'lucide-react';

export default function LangGraphStudioPage() {
  const [sessionId, setSessionId] = useState('');
  const [mode, setMode] = useState<'manual' | 'automatic' | 'autonomous' | 'multi-expert'>('manual');
  const [message, setMessage] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowState, setWorkflowState] = useState<any>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const handleExecute = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsExecuting(true);
    setExecutionLog([]);
    
    try {
      const newSessionId = `studio-${Date.now()}`;
      setSessionId(newSessionId);
      
      addLog('🚀 Starting LangGraph workflow execution...');
      addLog(`📝 Mode: ${mode}`);
      addLog(`💬 Message: ${message}`);
      
      const response = await fetch('/api/ask-expert/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message,
          agentId: mode === 'manual' ? 'accelerated_approval_strategist' : undefined,
          useLangGraph: true, // Force LangGraph mode
          sessionId: newSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      addLog('✅ Workflow started successfully');
      addLog('📊 Processing streaming response...');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'workflow_step') {
                addLog(`🔹 Workflow Step: ${data.step}`);
                // Update workflow state with latest step
                setWorkflowState((prev: any) => ({
                  ...prev,
                  currentStep: data.step,
                  ...data.state,
                }));
              } else if (data.type === 'chunk') {
                fullContent += data.content;
              } else if (data.type === 'done') {
                addLog('✅ Workflow completed');
                setWorkflowState((prev: any) => ({
                  ...prev,
                  finalResponse: fullContent,
                  endTime: Date.now(),
                }));
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${msg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const addLog = (message: string) => {
    setExecutionLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleReset = () => {
    setSessionId('');
    setWorkflowState(null);
    setExecutionLog([]);
    setMessage('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <GitBranch className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">LangGraph Studio</h1>
            <p className="text-gray-600">
              Visualize and explore LangGraph workflow executions
            </p>
          </div>
        </div>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a LangGraph Studio-like interface for visualizing workflow executions.
          Configure your workflow below and click "Execute" to see it in action.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="execution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="execution" className="gap-2">
            <Play className="w-4 h-4" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="visualization" className="gap-2">
            <Eye className="w-4 h-4" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="state" className="gap-2">
            <Code className="w-4 h-4" />
            State
          </TabsTrigger>
        </TabsList>

        {/* Execution Tab */}
        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(value: any) => setMode(value)}
                >
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Mode 1: Manual Interactive</SelectItem>
                    <SelectItem value="automatic">Mode 2: Automatic Agent Selection</SelectItem>
                    <SelectItem value="autonomous">Mode 3: Autonomous-Automatic</SelectItem>
                    <SelectItem value="multi-expert">Mode 4: Multi-Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your question or request..."
                  disabled={isExecuting}
                />
              </div>

              {/* Session ID (read-only) */}
              {sessionId && (
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    value={sessionId}
                    readOnly
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* Execute Button */}
              <Button
                onClick={handleExecute}
                disabled={isExecuting || !message.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Workflow
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Execution Log */}
          {executionLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-xs space-y-1 max-h-[300px] overflow-y-auto">
                  {executionLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization">
          {workflowState || sessionId ? (
            <LangGraphWorkflowVisualizer
              sessionId={sessionId}
              workflowState={workflowState}
              mode="viewer"
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No workflow data available</p>
                  <p className="text-sm text-gray-500">
                    Execute a workflow to see the visualization
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* State Tab */}
        <TabsContent value="state">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workflow State (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              {workflowState ? (
                <div className="bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[600px]">
                  <pre>{JSON.stringify(workflowState, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No state data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

