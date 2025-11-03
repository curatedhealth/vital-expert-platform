/**
 * Comprehensive State Inspector
 * 
 * Displays workflow execution state with:
 * - JSON viewer for current state
 * - Message history timeline
 * - Checkpoint browser
 * - Variable inspector
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Database,
  MessageSquare,
  GitBranch,
  Eye,
  Copy,
  Check,
  Download,
  RefreshCw,
} from 'lucide-react';

interface ExecutionState {
  nodeStates: Record<string, NodeExecutionState>;
  variables?: Record<string, any>;
  messages?: Array<{ role: string; content: string; timestamp: string }>;
  checkpoints?: Array<{
    id: string;
    nodeId: string;
    state: any;
    timestamp: string;
  }>;
  metadata?: Record<string, any>;
}

interface NodeExecutionState {
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  metadata?: Record<string, any>;
}

interface StateInspectorProps {
  executionState: ExecutionState | null;
  onRestore?: (checkpointId: string) => void;
  onRefresh?: () => void;
}

export function StateInspector({
  executionState,
  onRestore,
  onRefresh,
}: StateInspectorProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'messages' | 'checkpoints' | 'variables'>('current');
  const [copied, setCopied] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    if (!executionState) return;
    
    const dataStr = JSON.stringify(executionState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  if (!executionState) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No execution state available</p>
            <p className="text-xs mt-1">Start a workflow execution to see state updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-base">State Inspector</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(JSON.stringify(executionState, null, 2))}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
          <div className="px-4 pt-4 border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="current" className="gap-2">
                <Eye className="w-4 h-4" />
                Current
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="checkpoints" className="gap-2">
                <GitBranch className="w-4 h-4" />
                Checkpoints
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Database className="w-4 h-4" />
                Variables
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Current State Tab */}
            <TabsContent value="current" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm mb-3">Node States</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {Object.entries(executionState.nodeStates).map(([nodeId, nodeState]) => (
                      <AccordionItem key={nodeId} value={nodeId} className="border rounded-lg">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge
                              variant={
                                nodeState.status === 'completed'
                                  ? 'default'
                                  : nodeState.status === 'error'
                                  ? 'destructive'
                                  : nodeState.status === 'running'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {nodeState.status}
                            </Badge>
                            <span className="font-mono text-xs text-gray-700">{nodeId}</span>
                            {nodeState.duration && (
                              <span className="text-xs text-gray-500 ml-auto">
                                {nodeState.duration}ms
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-xs">
                            {nodeState.startTime && (
                              <div>
                                <span className="font-semibold text-gray-600">Start:</span>{' '}
                                <span className="font-mono">{new Date(nodeState.startTime).toLocaleTimeString()}</span>
                              </div>
                            )}
                            {nodeState.endTime && (
                              <div>
                                <span className="font-semibold text-gray-600">End:</span>{' '}
                                <span className="font-mono">{new Date(nodeState.endTime).toLocaleTimeString()}</span>
                              </div>
                            )}
                            {nodeState.input && (
                              <div>
                                <span className="font-semibold text-gray-600">Input:</span>
                                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(nodeState.input, null, 2)}
                                </pre>
                              </div>
                            )}
                            {nodeState.output && (
                              <div>
                                <span className="font-semibold text-gray-600">Output:</span>
                                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(nodeState.output, null, 2)}
                                </pre>
                              </div>
                            )}
                            {nodeState.error && (
                              <div>
                                <span className="font-semibold text-red-600">Error:</span>
                                <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-x-auto">
                                  {nodeState.error}
                                </pre>
                              </div>
                            )}
                            {nodeState.metadata && Object.keys(nodeState.metadata).length > 0 && (
                              <div>
                                <span className="font-semibold text-gray-600">Metadata:</span>
                                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(nodeState.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {executionState.messages && executionState.messages.length > 0 ? (
                    executionState.messages.map((message, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                            {message.role}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Checkpoints Tab */}
            <TabsContent value="checkpoints" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {executionState.checkpoints && executionState.checkpoints.length > 0 ? (
                    executionState.checkpoints.map((checkpoint, idx) => (
                      <div key={checkpoint.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-purple-600" />
                            <span className="font-mono text-xs">{checkpoint.id.slice(0, 8)}</span>
                            <Badge variant="outline">{checkpoint.nodeId}</Badge>
                          </div>
                          {onRestore && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestore(checkpoint.id)}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(checkpoint.timestamp).toLocaleString()}
                        </p>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            View State
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(checkpoint.state, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <GitBranch className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No checkpoints saved</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {executionState.variables && Object.keys(executionState.variables).length > 0 ? (
                    Object.entries(executionState.variables).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-gray-700">{key}</span>
                          <Badge variant="outline">{typeof value}</Badge>
                        </div>
                        <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No variables defined</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

