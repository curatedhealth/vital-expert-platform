'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileText, ChevronDown, User, Users, AlertCircle } from 'lucide-react';
import { AIChatbot, ChatMessage } from '@/components/langgraph-gui/AIChatbot';
import type { Node, Edge } from 'reactflow';

interface WorkflowTestModalProps {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  apiKeys: {
    openai: string;
    pinecone?: string;
    provider?: 'openai' | 'ollama';
    ollama_base_url?: string;
    ollama_model?: string;
  };
  apiBaseUrl?: string;
  panelType?: string | null;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'log';
  content: string;
  timestamp: string;
  level?: 'info' | 'success' | 'error';
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  title?: string;
  expertise_level?: string;
  avatar_url?: string;
  status?: string;
  role_name?: string;
  function_name?: string;
  department_name?: string;
  metadata?: any;
}

export function WorkflowTestModal({
  open,
  onClose,
  nodes,
  edges,
  apiKeys,
  apiBaseUrl = '/api/langgraph-gui',
  panelType = null,
}: WorkflowTestModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Agent selection state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // Mode detection state (from backend LangGraph inspection)
  const [detectedMode, setDetectedMode] = useState<string | null>(null);
  const [modeMetadata, setModeMetadata] = useState<any>(null);
  const [modeConfidence, setModeConfidence] = useState<number>(0);
  const [detectingMode, setDetectingMode] = useState(false);
  
  // Inspect workflow to detect mode from LangGraph backend
  useEffect(() => {
    if (open && nodes.length > 0) {
      inspectWorkflow();
    }
  }, [open, nodes, edges]);
  
  const inspectWorkflow = async () => {
    setDetectingMode(true);
    try {
      const response = await fetch('/api/langgraph-gui/workflow/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDetectedMode(data.detected_mode);
        setModeMetadata(data.mode_metadata);
        setModeConfidence(data.confidence);
        
        console.log('[WorkflowTestModal] Workflow inspection:', {
          detectedMode: data.detected_mode,
          confidence: data.confidence,
          reasoning: data.reasoning,
          requiresAgentSelection: data.mode_metadata?.requires_agent_selection,
        });
      }
    } catch (error) {
      console.error('[WorkflowTestModal] Failed to inspect workflow:', error);
    } finally {
      setDetectingMode(false);
    }
  };
  
  // Check if agent selection is required
  const requiresAgentSelection = modeMetadata?.requires_agent_selection ?? false;
  const isMode1 = detectedMode === 'mode1';
  
  // Debug logging
  useEffect(() => {
    if (open) {
      console.log('[WorkflowTestModal] Mode detection:', {
        panelType: panelType,
        detectedMode: detectedMode,
        isMode1: isMode1,
        requiresAgentSelection: requiresAgentSelection,
        confidence: modeConfidence,
        nodeCount: nodes.length,
        agentNodeCount: nodes.filter(n => n.data?.type === 'agent').length,
        open: open
      });
      console.log('[WorkflowTestModal] Agent selector should show:', requiresAgentSelection ? 'YES ✅' : 'NO ❌');
    }
  }, [panelType, detectedMode, isMode1, requiresAgentSelection, open, nodes]);
  
  // Fetch agents when agent selection is required
  useEffect(() => {
    if (open && requiresAgentSelection) {
      fetchAgents();
    }
  }, [open, requiresAgentSelection]);
  
  const fetchAgents = async () => {
    setLoadingAgents(true);
    setAgentError(null);
    
    try {
      console.log('[WorkflowTestModal] Fetching agents from /api/agents...');
      
      // Fetch all agents from the agents table (not user_agents)
      const response = await fetch('/api/agents?status=active');
      
      console.log('[WorkflowTestModal] Agents API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WorkflowTestModal] Agents API error:', errorText);
        throw new Error(`Failed to fetch agents (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[WorkflowTestModal] Agents API data:', data);
      
      // data.agents is an array of agents from the agents table
      if (data.agents && Array.isArray(data.agents)) {
        console.log('[WorkflowTestModal] Loaded agents:', data.agents.length);
        setAgents(data.agents);
        
        // Auto-select first agent if available
        if (data.agents.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.agents[0].id);
          console.log('[WorkflowTestModal] Auto-selected first agent:', data.agents[0].name);
        }
      } else {
        console.warn('[WorkflowTestModal] No agents in response');
        setAgentError('No agents available. Please add agents to the agent store.');
      }
    } catch (error: any) {
      console.error('[WorkflowTestModal] Failed to fetch agents:', error);
      setAgentError(error.message || 'Failed to load agents from agent store');
    } finally {
      setLoadingAgents(false);
    }
  };

  // Convert Message to ChatMessage for AIChatbot
  const messageToChatMessage = (msg: Message): ChatMessage => ({
    id: msg.id,
    role: msg.type === 'user' ? 'user' : msg.type === 'assistant' ? 'ai' : 'log',
    content: msg.content,
    timestamp: msg.timestamp,
    level: msg.level,
  });

  // Get enabled tasks (nodes connected to workflow)
  const getEnabledTasks = useCallback(() => {
    // Find agent/task nodes that have edges
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target),
    ]);
    
    return nodes
      .filter(n => {
        const nodeType = n.data?.type;
        return (
          (nodeType === 'agent' || nodeType === 'task' || nodeType === 'tool') &&
          connectedNodeIds.has(n.id)
        );
      })
      .map(n => n.data?.label || n.id);
  }, [nodes, edges]);

  // Handle workflow execution
  const handleExecute = useCallback(async () => {
    if (!userQuery.trim() || isExecuting) return;
    
    // Validate agent selection if required by detected mode
    if (requiresAgentSelection && !selectedAgentId) {
      setMessages((prev) => [...prev, {
        id: `msg-error-${Date.now()}`,
        type: 'log',
        content: `⚠️ ${modeMetadata?.name || 'This workflow'} requires agent selection. Please select an agent.`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      }]);
      return;
    }

    setIsExecuting(true);
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMsgId = `msg-user-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    }]);

    // Add loading message with mode and agent info
    const loadingMsgId = `msg-loading-${Date.now()}`;
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    
    let loadingText = '🔄 Executing workflow...';
    if (modeMetadata) {
      loadingText = `🔄 Executing ${modeMetadata.name}`;
      if (selectedAgent) {
        loadingText += ` with ${selectedAgent.name}`;
      }
      loadingText += '...';
    }
    
    setMessages((prev) => [...prev, {
      id: loadingMsgId,
      type: 'assistant',
      content: loadingText,
      timestamp: new Date().toLocaleTimeString(),
    }]);

    try {
      const isPanelWorkflow = panelType !== null;
      
      // Build workflow definition
      const workflowDefinition = {
        id: `workflow-${Date.now()}`,
        name: 'Test Workflow',
        description: 'Workflow test execution',
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data?.type || n.type,
          label: n.data?.label || n.id,
          position: n.position,
          config: n.data?.config || {},
          data: n.data || {},
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || 'default',
          label: e.label,
        })),
        metadata: isPanelWorkflow ? {
          panel_type: panelType,
          rounds: 3,
          consensus_threshold: 0.75,
          time_budget: 600,
        } : {},
      };

      let response;

      if (isPanelWorkflow) {
        // Execute as panel workflow
        const panelExecuteUrl = `${apiBaseUrl}/panels/execute`;
        console.log('[WorkflowTestModal] Executing panel workflow:', panelExecuteUrl);

        response = await fetch(panelExecuteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userQuery,
            openai_api_key: apiKeys.openai,
            pinecone_api_key: apiKeys.pinecone || '',
            provider: apiKeys.provider || 'openai',
            ollama_base_url: apiKeys.ollama_base_url || 'http://localhost:11434',
            ollama_model: apiKeys.ollama_model || 'qwen3:4b',
            workflow: workflowDefinition,
            panel_type: panelType,
            user_id: 'user',
            // Include selected agent for Mode 1
            ...(isMode1 && selectedAgentId ? { selected_agent_ids: [selectedAgentId] } : {}),
          }),
          signal: abortControllerRef.current.signal,
        });
      } else {
        // Execute as regular workflow
        const executeUrl = `${apiBaseUrl}/execute`;
        console.log('[WorkflowTestModal] Executing regular workflow:', executeUrl);

        response = await fetch(executeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow: workflowDefinition,
            openai_api_key: apiKeys.openai,
            pinecone_api_key: apiKeys.pinecone || '',
            provider: apiKeys.provider || 'openai',
            ollama_base_url: apiKeys.ollama_base_url || 'http://localhost:11434',
            ollama_model: apiKeys.ollama_model || 'qwen3:4b',
            user_id: 'user',
            // Include selected agent for Mode 1
            ...(isMode1 && selectedAgentId ? { selected_agent_ids: [selectedAgentId] } : {}),
          }),
          signal: abortControllerRef.current.signal,
        });
      }

      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== loadingMsgId));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Workflow execution failed');
      }

      const result = await response.json();
      
      // Add success message with result
      setMessages((prev) => [...prev, {
        id: `msg-result-${Date.now()}`,
        type: 'assistant',
        content: result.answer || result.message || JSON.stringify(result, null, 2),
        timestamp: new Date().toLocaleTimeString(),
      }]);

      // Clear input
      setUserQuery('');
    } catch (error: any) {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => msg.id !== loadingMsgId));
      
      if (error.name === 'AbortError') {
        setMessages((prev) => [...prev, {
          id: `msg-abort-${Date.now()}`,
          type: 'log',
          content: '⚠️ Workflow execution cancelled',
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: `msg-error-${Date.now()}`,
          type: 'log',
          content: `❌ Execution failed: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
        }]);
      }
    } finally {
      setIsExecuting(false);
      abortControllerRef.current = null;
    }
  }, [userQuery, isExecuting, nodes, edges, apiKeys, panelType, apiBaseUrl, isMode1, selectedAgentId, agents]);

  // Export report handlers
  const handleExportReport = useCallback((format: 'markdown' | 'pdf') => {
    const content = messages
      .map(msg => `[${msg.timestamp}] ${msg.type.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    if (format === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-test-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we'd need a library like jsPDF
      // For now, just export as text
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-test-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [messages]);

  const handleClose = useCallback(() => {
    // Cancel any ongoing execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Test Your Workflow</DialogTitle>
              <DialogDescription>
                {modeMetadata 
                  ? `${modeMetadata.name}: ${modeMetadata.description}`
                  : 'Ask a research question to test your workflow'}
              </DialogDescription>
              {/* Debug info - shows detected mode from LangGraph backend */}
              {detectedMode && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-mono bg-muted px-1 py-0.5 rounded">
                    {detectedMode}
                  </span>
                  {modeConfidence > 0 && (
                    <span>
                      • Confidence: {(modeConfidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {detectingMode && <span>• Detecting...</span>}
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileDown size={16} className="mr-2" />
                    Export
                    <ChevronDown size={16} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportReport('markdown')}>
                    <FileText size={16} className="mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                    <FileDown size={16} className="mr-2" />
                    Export as Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Agent Selector - shown when backend indicates agent selection is required */}
          {requiresAgentSelection && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">
                  Select Expert Agent {modeMetadata?.selection === 'manual' && '(Required)'}:
                </label>
                {agents.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {agents.length} agents available
                  </Badge>
                )}
              </div>
              
              {loadingAgents ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading agents from store...
                </div>
              ) : agentError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {agentError}
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={fetchAgents}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : agents.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No agents found in the agent store. Please add agents first.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an expert agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{agent.name}</span>
                            {(agent.description || agent.tagline) && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {agent.description || agent.tagline}
                              </span>
                            )}
                          </div>
                          {(agent.expertise_level || agent.department_name) && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {agent.expertise_level || agent.department_name}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <AIChatbot
            messages={messages.map(messageToChatMessage)}
            input={userQuery}
            isLoading={isExecuting}
            onInputChange={setUserQuery}
            onSubmit={(e) => {
              e.preventDefault();
              handleExecute();
            }}
            placeholder="Ask a research question..."
            showHeader={true}
            emptyState={
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2 font-medium">Ask a research question to test your workflow</p>
                <p className="text-sm">
                  Connected tasks: {getEnabledTasks().length > 0 ? getEnabledTasks().join(', ') : 'None'}
                </p>
              </div>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

