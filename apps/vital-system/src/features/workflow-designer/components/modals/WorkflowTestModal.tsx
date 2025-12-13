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
import { FileDown, FileText, ChevronDown, User, Users, AlertCircle, Sparkles, X, Check } from 'lucide-react';
import { AIChatbot, ChatMessage } from '@/components/langgraph-gui/AIChatbot';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  agentName?: string;
  agentId?: string;
  metadata?: {
    confidence?: number;
    model_used?: string;
    tokens_used?: number;
    error?: boolean;
  };
  isConsensus?: boolean;
  isSummary?: boolean;
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
  
  // Question suggestions state - questions for experts to discuss
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState<number>(2); // Show only 2 initially
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [selectionOrder, setSelectionOrder] = useState<number[]>([]); // Track order of selection
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  
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
  const messageToChatMessage = (msg: Message): ChatMessage => {
    const chatMsg: ChatMessage = {
    id: msg.id,
      role: msg.type === 'user' ? 'user' : msg.type === 'assistant' ? 'assistant' : 'log',
    content: msg.content,
    timestamp: msg.timestamp,
    level: msg.level,
    };
    
    // Add agent/expert information if available
    if (msg.agentName) {
      chatMsg.name = msg.agentName;
      chatMsg.agentId = msg.agentId;
      chatMsg.expertId = msg.agentId; // Deprecated - for backwards compat
    }
    
    // Mark consensus/summary messages
    if (msg.isConsensus || msg.isSummary) {
      chatMsg.name = msg.agentName || (msg.isConsensus ? 'Panel Consensus' : 'Workflow Summary');
    }
    
    return chatMsg;
  };

  // Generate question suggestions
  const generateQuestions = useCallback(async () => {
    if (!apiKeys.openai || loadingQuestions) return;
    
    setLoadingQuestions(true);
    setQuestionError(null);
    
    try {
      const response = await fetch('/api/workflow-test/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          panelType,
          openai_api_key: apiKeys.openai,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.questions && Array.isArray(data.questions)) {
        // Append new questions to existing ones (avoid duplicates)
        setSuggestedQuestions((prev) => {
          const combined = [...prev, ...data.questions];
          // Remove duplicates using normalized comparison (case-insensitive, trimmed)
          const seen = new Set<string>();
          const unique: string[] = [];
          for (const q of combined) {
            const normalized = q.trim().toLowerCase();
            if (normalized && !seen.has(normalized)) {
              unique.push(q.trim());
              seen.add(normalized);
            }
          }
          // Increase visible count if we have more questions than currently visible
          setVisibleQuestionsCount((prevCount) => {
            if (unique.length > prevCount) {
              return Math.max(prevCount, 2);
            }
            return prevCount;
          });
          return unique;
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('[WorkflowTestModal] Failed to generate questions:', error);
      setQuestionError(error.message || 'Failed to generate questions');
    } finally {
      setLoadingQuestions(false);
    }
  }, [nodes, edges, panelType, apiKeys.openai, loadingQuestions]);

  // Auto-generate questions when modal opens
  useEffect(() => {
    if (open && nodes.length > 0 && suggestedQuestions.length === 0 && apiKeys.openai && !loadingQuestions) {
      generateQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only generate once when modal opens

  // Clear selection when questions change
  useEffect(() => {
    setSelectedQuestions(new Set());
    setSelectionOrder([]);
    // Reset visible count to 2 when new questions are generated
    if (suggestedQuestions.length > 0) {
      setVisibleQuestionsCount(2);
    }
  }, [suggestedQuestions.length]); // Only reset when count changes, not content

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
            query: userQuery || 'Workflow test execution',
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
        let errorMessage = 'Workflow execution failed';
        try {
        const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          // Add hint if Python AI Engine is not available
          if (response.status === 503 && errorData.hint) {
            errorMessage += `\n\n💡 ${errorData.hint}`;
          }
        } catch (e) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Helper function to wait for a delay
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Parse result to show individual expert/agent responses in separate bubbles with sequential delays
      if (result.expert_responses && Array.isArray(result.expert_responses)) {
        // Panel workflow - show each expert in their own bubble with 2s delay between each
        const baseTime = Date.now();
        const seenAgentIds = new Set<string>();
        
        // Filter out duplicates based on agent_id
        const uniqueExperts = result.expert_responses.filter((expert: any) => {
          const agentId = expert.agent_id || expert.id;
          if (seenAgentIds.has(agentId)) {
            return false; // Skip duplicate
          }
          seenAgentIds.add(agentId);
          return true;
        });
        
        for (let index = 0; index < uniqueExperts.length; index++) {
          const expert = uniqueExperts[index];
          const message: Message = {
            id: `msg-expert-${expert.agent_id || expert.id}-${baseTime}-${index}`,
            type: 'assistant',
            content: expert.response || expert.message || 'No response',
            timestamp: new Date().toLocaleTimeString(),
            agentName: expert.agent_name || expert.agent_id || `Expert ${index + 1}`,
            agentId: expert.agent_id || expert.id,
            metadata: {
              confidence: expert.confidence,
              model_used: expert.model_used,
              tokens_used: expert.tokens_used,
              error: expert.error,
            },
          };
          
          // Add message immediately for first one, then wait 2s before next
          setMessages((prev) => {
            // Additional deduplication check - ensure message ID doesn't already exist
            const existingIds = new Set(prev.map(m => m.id));
            if (existingIds.has(message.id)) {
              return prev; // Don't add duplicate
            }
            return [...prev, message];
          });
          
          // Wait 2 seconds before adding next message (except for the last one)
          if (index < uniqueExperts.length - 1) {
            await wait(2000);
          }
        }
        
        // Add consensus summary after all expert responses (2s after last one)
        if (result.consensus_summary) {
          await wait(2000);
          setMessages((prev) => [...prev, {
            id: `msg-consensus-${baseTime}`,
            type: 'assistant',
            content: result.consensus_summary,
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'Panel Consensus',
            isConsensus: true,
          }]);
        }
      } else if (result.agent_results && Array.isArray(result.agent_results)) {
        // Regular workflow - show each agent in their own bubble with 2s delay between each
        const baseTime = Date.now();
        const seenAgentIds = new Set<string>();
        
        // Filter out duplicates based on agent_id
        const uniqueAgents = result.agent_results.filter((agent: any) => {
          const agentId = agent.agent_id || agent.id;
          if (seenAgentIds.has(agentId)) {
            return false; // Skip duplicate
          }
          seenAgentIds.add(agentId);
          return true;
        });
        
        for (let index = 0; index < uniqueAgents.length; index++) {
          const agent = uniqueAgents[index];
          const message: Message = {
            id: `msg-agent-${agent.agent_id || agent.id}-${baseTime}-${index}`,
            type: 'assistant',
            content: agent.response || agent.message || 'No response',
            timestamp: new Date().toLocaleTimeString(),
            agentName: agent.agent_name || agent.agent_id || `Agent ${index + 1}`,
            agentId: agent.agent_id || agent.id,
            metadata: {
              confidence: agent.confidence,
              model_used: agent.model_used,
              tokens_used: agent.tokens_used,
              error: agent.error,
            },
          };
          
          // Add message immediately for first one, then wait 2s before next
          setMessages((prev) => {
            // Additional deduplication check - ensure message ID doesn't already exist
            const existingIds = new Set(prev.map(m => m.id));
            if (existingIds.has(message.id)) {
              return prev; // Don't add duplicate
            }
            return [...prev, message];
          });
          
          // Wait 2 seconds before adding next message (except for the last one)
          if (index < uniqueAgents.length - 1) {
            await wait(2000);
          }
        }
        
        // Add aggregated response after all agent responses (2s after last one)
        if (result.aggregated_response) {
          await wait(2000);
          setMessages((prev) => [...prev, {
            id: `msg-aggregated-${baseTime}`,
            type: 'assistant',
            content: result.aggregated_response,
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'Workflow Summary',
            isSummary: true,
          }]);
        }
      } else {
        // Fallback: single message for other result types
      setMessages((prev) => [...prev, {
        id: `msg-result-${Date.now()}`,
        type: 'assistant',
        content: result.answer || result.message || JSON.stringify(result, null, 2),
        timestamp: new Date().toLocaleTimeString(),
      }]);
      }

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
        // Handle network errors (Failed to fetch)
        let errorMessage = error.message || 'Unknown error occurred';
        
        // Check if it's a network/fetch error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
          errorMessage = `Cannot connect to the workflow execution service. Please ensure the Python AI Engine is running.`;
        }
        
        setMessages((prev) => [...prev, {
          id: `msg-error-${Date.now()}`,
          type: 'log',
          content: `❌ Execution failed: ${errorMessage}`,
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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
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

        {/* Question Suggestions - Compact and Collapsible */}
        {suggestedQuestions.length > 0 && (
          <div className="px-6 py-3 border-b bg-muted/30 flex-shrink-0 max-h-[200px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <Label className="text-xs font-medium">
                  Questions ({suggestedQuestions.length})
                </Label>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={generateQuestions}
                  disabled={loadingQuestions || !apiKeys.openai}
                  className="h-7 text-xs"
                >
                  {loadingQuestions ? (
                    <>
                      <div className="h-2.5 w-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      More
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSuggestedQuestions([]);
                    setVisibleQuestionsCount(2);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {questionError && (
              <Alert variant="destructive" className="mb-2 py-1">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{questionError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              {suggestedQuestions.slice(0, visibleQuestionsCount).map((question, index) => {
                const isSelected = selectedQuestions.has(index);
                return (
                  <div
                    key={`question-${index}-${question.slice(0, 20)}`}
                    className="flex items-start gap-2 p-2 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mt-0.5 flex-shrink-0">
                      <Checkbox
                        id={`question-${index}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setSelectedQuestions((prev) => {
                            const newSet = new Set(prev);
                            if (checked) {
                              newSet.add(index);
                              setSelectionOrder((prevOrder) => [...prevOrder, index]);
                            } else {
                              newSet.delete(index);
                              setSelectionOrder((prevOrder) => prevOrder.filter(i => i !== index));
                            }
                            return newSet;
                          });
                        }}
                        className="h-4 w-4"
                      />
                      {isSelected && (
                        <Badge variant="default" className="h-4 w-4 p-0 flex items-center justify-center text-[10px] min-w-[16px]">
                          {selectionOrder.indexOf(index) + 1}
                        </Badge>
                      )}
                    </div>
                    <label
                      htmlFor={`question-${index}`}
                      className="flex-1 text-xs cursor-pointer leading-relaxed"
                    >
                      {question}
                    </label>
                  </div>
                );
              })}
            </div>
            {suggestedQuestions.length > visibleQuestionsCount && (
              <div className="mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleQuestionsCount(prev => Math.min(prev + 2, suggestedQuestions.length))}
                  className="w-full h-7 text-xs"
                >
                  Show More ({suggestedQuestions.length - visibleQuestionsCount} remaining)
                </Button>
              </div>
            )}
            {selectedQuestions.size > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1.5">
                  {selectedQuestions.size} selected
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      // Use selected questions in workflow execution (in selection order)
                      // Remove duplicates by using a Set with normalized questions
                      const selectedQuestionsList = selectionOrder
                        .map(idx => suggestedQuestions[idx])
                        .filter(q => q && q.trim().length > 0);
                      
                      // Deduplicate questions (case-insensitive, normalized)
                      const uniqueQuestions: string[] = [];
                      const seen = new Set<string>();
                      for (const q of selectedQuestionsList) {
                        const normalized = q.trim().toLowerCase();
                        if (!seen.has(normalized)) {
                          uniqueQuestions.push(q.trim());
                          seen.add(normalized);
                        }
                      }
                      
                      const questionsToUse = uniqueQuestions.join('\n\n');
                      setUserQuery(questionsToUse);
                      handleExecute();
                    }}
                    disabled={isExecuting}
                    className="h-7 text-xs flex-1"
                  >
                    Execute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuestions(new Set());
                      setSelectionOrder([]);
                    }}
                    className="h-7 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
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

