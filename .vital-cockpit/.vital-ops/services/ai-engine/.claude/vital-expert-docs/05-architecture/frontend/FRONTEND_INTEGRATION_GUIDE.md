# VITAL Frontend Integration Guide

**Complete guide for connecting frontend applications to the enhanced VITAL backend**

**Date:** November 17, 2025
**Version:** 1.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Agent Selection & Display](#agent-selection--display)
4. [Prompt Starters Integration](#prompt-starters-integration)
5. [Workflow Execution](#workflow-execution)
6. [Compliance & Safety UI](#compliance--safety-ui)
7. [TypeScript Types](#typescript-types)
8. [React Components](#react-components)
9. [API Client Setup](#api-client-setup)
10. [Example Implementations](#example-implementations)

---

## Architecture Overview

### Backend Components (All Enhanced ✅)

```
┌─────────────────────────────────────────────────────────────┐
│                    VITAL FRONTEND APPS                      │
│  (Next.js/React - Multiple industry-specific apps)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE (Database)                        │
│  • 319 Enhanced Agents with gold-standard prompts          │
│  • 1,276 Prompt Starters (4 per agent)                     │
│  • Agent metadata, capabilities, tools                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                AI-ENGINE SERVICE (Python/FastAPI)           │
│  • 4 LangGraph Workflow Modes                              │
│  • HIPAA/GDPR Compliance Service                           │
│  • Human-in-Loop Validation                                │
│  • Deep Agent Architecture (5 levels)                       │
│  • Tool Execution via ToolRegistry                         │
└─────────────────────────────────────────────────────────────┘
```

### What's New (After Enhancement)

| Feature | Before | After Enhancement |
|---------|--------|-------------------|
| Agents | 319 basic agents | 319 with industry-leading prompts |
| Prompt Starters | None | 1,276 (4 per agent) with titles |
| Workflows | Basic | HIPAA/GDPR compliant with human validation |
| Deep Agents | Conceptual | 5-level hierarchy with sub-agent spawning |
| Compliance | None | Full PHI protection & audit trails |
| Safety | Manual | Automated human-in-loop validation |

---

## API Endpoints

### Base Configuration

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  supabaseURL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  aiEngineURL: process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8001'
};
```

### 1. Agent Management Endpoints

#### Get All Agents (Enhanced)

```typescript
// GET /api/agents
// Response includes enhanced system prompts and prompt starters

interface GetAgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  per_page: number;
}

interface Agent {
  id: string;
  name: string;
  system_prompt: string;  // ✨ ENHANCED: Gold-standard 2025 prompt
  description: string;
  tier: 'MASTER' | 'EXPERT' | 'SPECIALIST' | 'WORKER' | 'TOOL';
  category: string;
  department: string;
  prompt_starters: PromptStarter[];  // ✨ NEW: 4 starters per agent
  tools: string[];
  capabilities: string[];
  skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromptStarter {
  number: number;      // 1-4
  title: string;       // "Calculate BMI for patient assessment"
  prompt_id: string;   // UUID to fetch full prompt content
}
```

#### Get Single Agent with Full Details

```typescript
// GET /api/agents/:agent_id

interface GetAgentResponse {
  agent: Agent;
  full_prompt_starters: PromptStarterFull[];  // ✨ Full content included
}

interface PromptStarterFull {
  number: number;
  title: string;
  content: string;  // Full prompt text
  prompt_id: string;
}
```

#### Filter Agents by Category/Tier

```typescript
// GET /api/agents?category=regulatory&tier=EXPERT

// Query Parameters:
// - category: string (e.g., 'regulatory', 'clinical', 'market_access')
// - tier: string (e.g., 'EXPERT', 'SPECIALIST')
// - department: string
// - search: string (searches name, description)
// - page: number
// - per_page: number (default: 50, max: 100)
```

---

### 2. Workflow Execution Endpoints

#### Execute Workflow (All 4 Modes)

```typescript
// POST /api/workflows/execute

interface WorkflowExecuteRequest {
  mode: 'mode1' | 'mode2' | 'mode3' | 'mode4';
  query: string;
  selected_agent_id?: string;  // Required for mode1 & mode3
  session_id?: string;  // Required for mode3 & mode4 (multi-turn)
  tenant_id: string;
  user_id: string;
  enable_rag?: boolean;  // Default: true
  enable_tools?: boolean;  // Default: true
  compliance_regime?: 'HIPAA' | 'GDPR' | 'BOTH';  // ✨ NEW
}

interface WorkflowExecuteResponse {
  session_id: string;
  response: {
    agent_response: string;
    response_confidence: number;
    selected_agents?: AgentInfo[];  // For mode2 & mode4
    tool_results?: ToolResult[];  // ✨ NEW: Tool execution results
    sub_agents_used?: SubAgentInfo[];  // ✨ NEW: Deep agent details
    artifacts?: Artifact[];
    sources?: Source[];

    // ✨ COMPLIANCE & SAFETY
    compliance_audit_id?: string;  // HIPAA/GDPR audit trail
    requires_human_review: boolean;  // Human-in-loop flag
    human_review_decision?: HumanReviewDecision;
    data_protected: boolean;
  };
  metadata: {
    mode: string;
    execution_time: number;
    tokens_used: number;
    workflow_state: string;
  };
}

// ✨ NEW: Human Review Decision
interface HumanReviewDecision {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  recommendation: string;
  confidence_threshold: number;
  actual_confidence: number;
}

// ✨ NEW: Tool Results
interface ToolResult {
  tool_name: string;
  result: any;
  timestamp: string;
  execution_time: number;
}

// ✨ NEW: Sub-Agent Info (Deep Agent Architecture)
interface SubAgentInfo {
  sub_agent_id: string;
  parent_agent_id: string;
  specialty: string;
  task: string;
  level: number;  // 1-5 (hierarchy level)
  result: string;
}
```

#### Stream Workflow Execution (Server-Sent Events)

```typescript
// POST /api/workflows/execute/stream
// Content-Type: text/event-stream

// Event types:
// - thinking: Agent reasoning process
// - tool_execution: Tool being executed
// - sub_agent_spawn: Sub-agent created
// - response_chunk: Response content
// - compliance_check: HIPAA/GDPR validation
// - human_review_needed: Safety validation triggered
// - complete: Workflow finished

interface StreamEvent {
  event: EventType;
  data: any;
  timestamp: string;
}
```

---

### 3. Prompt Starters Endpoints

#### Get Prompt Starter Full Content

```typescript
// GET /api/prompts/:prompt_id

interface GetPromptResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;  // Full prompt text
  role_type: 'user' | 'system';
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  is_active: boolean;
  tags: string[];
}
```

#### Get All Prompt Starters for Agent

```typescript
// GET /api/agents/:agent_id/prompt-starters

interface GetAgentPromptStartersResponse {
  agent_id: string;
  agent_name: string;
  prompt_starters: PromptStarterFull[];
}
```

---

### 4. Compliance & Audit Endpoints

#### Check Data Compliance

```typescript
// POST /api/compliance/check

interface ComplianceCheckRequest {
  text: string;
  regime: 'HIPAA' | 'GDPR' | 'BOTH';
  tenant_id: string;
  user_id: string;
}

interface ComplianceCheckResponse {
  contains_phi: boolean;
  phi_detected: string[];  // Types of PHI found
  protected_text: string;  // De-identified version
  audit_id: string;
  regime: string;
}
```

#### Get Compliance Audit Trail

```typescript
// GET /api/compliance/audit?tenant_id=xxx&user_id=xxx&start_date=xxx

interface ComplianceAuditResponse {
  audits: AuditEntry[];
  total: number;
}

interface AuditEntry {
  id: string;
  tenant_id: string;
  user_id: string;
  regime: string;
  purpose: string;
  timestamp: string;
  data_accessed: boolean;
}
```

---

## Agent Selection & Display

### Agent Grid Component

```typescript
// components/agents/AgentGrid.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const tierBadgeColor = {
    MASTER: 'bg-purple-600',
    EXPERT: 'bg-blue-600',
    SPECIALIST: 'bg-green-600',
    WORKER: 'bg-yellow-600',
    TOOL: 'bg-gray-600'
  };

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
      onClick={() => onSelect(agent)}
    >
      {/* Tier Badge */}
      <div className={`inline-block px-2 py-1 rounded text-white text-xs ${tierBadgeColor[agent.tier]}`}>
        {agent.tier}
      </div>

      {/* Agent Name */}
      <h3 className="font-bold mt-2">{agent.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {agent.description}
      </p>

      {/* Prompt Starters Preview */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-1">Quick Starts:</p>
        {agent.prompt_starters.slice(0, 2).map((starter) => (
          <div key={starter.number} className="text-xs text-blue-600 truncate">
            • {starter.title}
          </div>
        ))}
      </div>

      {/* Category & Department */}
      <div className="flex gap-2 mt-3">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{agent.category}</span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{agent.department}</span>
      </div>
    </div>
  );
}

export function AgentGrid() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    tier: '',
    search: ''
  });

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  async function fetchAgents() {
    setLoading(true);

    let query = supabase
      .from('agents')
      .select('*')
      .eq('is_active', true);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.tier) {
      query = query.eq('tier', filters.tier);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAgents(data);
    }

    setLoading(false);
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search agents..."
          className="border px-4 py-2 rounded flex-1"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />

        <select
          className="border px-4 py-2 rounded"
          value={filters.tier}
          onChange={(e) => setFilters({...filters, tier: e.target.value})}
        >
          <option value="">All Tiers</option>
          <option value="EXPERT">Expert</option>
          <option value="SPECIALIST">Specialist</option>
          <option value="WORKER">Worker</option>
        </select>

        <select
          className="border px-4 py-2 rounded"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="regulatory">Regulatory</option>
          <option value="clinical">Clinical</option>
          <option value="market_access">Market Access</option>
        </select>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={(agent) => {
                // Handle agent selection
                console.log('Selected:', agent);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Prompt Starters Integration

### Prompt Starters Display Component

```typescript
// components/prompts/PromptStarters.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PromptStartersProps {
  agent: Agent;
  onStarterClick: (content: string) => void;
}

export function PromptStarters({ agent, onStarterClick }: PromptStartersProps) {
  const [loadingStarter, setLoadingStarter] = useState<string | null>(null);

  async function handleStarterClick(starter: PromptStarter) {
    setLoadingStarter(starter.prompt_id);

    // Fetch full prompt content
    const { data, error } = await supabase
      .from('prompts')
      .select('content')
      .eq('id', starter.prompt_id)
      .single();

    setLoadingStarter(null);

    if (!error && data) {
      onStarterClick(data.content);
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="font-semibold text-lg mb-4">Quick Starts for {agent.name}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agent.prompt_starters.map((starter) => (
          <button
            key={starter.number}
            onClick={() => handleStarterClick(starter)}
            disabled={loadingStarter === starter.prompt_id}
            className="text-left p-4 border rounded hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                {starter.number}
              </span>
              <p className="text-sm">{starter.title}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Workflow Execution

### Workflow Execution Hook

```typescript
// hooks/useWorkflowExecution.ts
import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

export function useWorkflowExecution() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<WorkflowExecuteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeWorkflow(request: WorkflowExecuteRequest) {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<WorkflowExecuteResponse>(
        `${API_CONFIG.aiEngineURL}/api/workflows/execute`,
        request
      );

      setResponse(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Workflow execution failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    executeWorkflow,
    loading,
    response,
    error
  };
}
```

### Chat Interface with Workflow Integration

```typescript
// components/chat/ChatInterface.tsx
import { useState } from 'react';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  requires_human_review?: boolean;
  compliance_protected?: boolean;
  tool_results?: ToolResult[];
}

export function ChatInterface({ agent, mode }: { agent: Agent; mode: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const { executeWorkflow, loading } = useWorkflowExecution();

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    const response = await executeWorkflow({
      mode: mode as any,
      query: input,
      selected_agent_id: agent.id,
      session_id: sessionId,
      tenant_id: 'tenant-123',
      user_id: 'user-456',
      enable_rag: true,
      enable_tools: true,
      compliance_regime: 'BOTH'
    });

    const assistantMessage: Message = {
      role: 'assistant',
      content: response.response.agent_response,
      requires_human_review: response.response.requires_human_review,
      compliance_protected: response.response.data_protected,
      tool_results: response.response.tool_results
    };

    setMessages(prev => [...prev, assistantMessage]);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {/* Message Content */}
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Human Review Warning */}
              {msg.requires_human_review && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  ⚠️ This response requires human review by a qualified professional
                </div>
              )}

              {/* Compliance Badge */}
              {msg.compliance_protected && (
                <div className="mt-2 text-xs opacity-75">
                  🔒 HIPAA/GDPR Protected
                </div>
              )}

              {/* Tool Results */}
              {msg.tool_results && msg.tool_results.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold mb-1">Tools Used:</p>
                  {msg.tool_results.map((tool, i) => (
                    <div key={i} className="text-xs bg-white/20 px-2 py-1 rounded mt-1">
                      🔧 {tool.tool_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your question..."
            className="flex-1 border rounded px-4 py-2"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Compliance & Safety UI

### Human Review Alert Component

```typescript
// components/compliance/HumanReviewAlert.tsx

interface HumanReviewAlertProps {
  decision: HumanReviewDecision;
}

export function HumanReviewAlert({ decision }: HumanReviewAlertProps) {
  const riskColors = {
    LOW: 'bg-blue-50 border-blue-200 text-blue-800',
    MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    HIGH: 'bg-orange-50 border-orange-200 text-orange-800',
    CRITICAL: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`border-l-4 p-4 ${riskColors[decision.risk_level]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          ⚠️
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            Human Review Required - {decision.risk_level} Risk
          </h3>
          <div className="mt-2 text-sm">
            <p><strong>Confidence:</strong> {(decision.actual_confidence * 100).toFixed(1)}% (threshold: {(decision.confidence_threshold * 100).toFixed(0)}%)</p>
            <p className="mt-2"><strong>Reasons:</strong></p>
            <ul className="list-disc list-inside mt-1">
              {decision.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <p className="mt-2"><strong>Recommendation:</strong> {decision.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## TypeScript Types

```typescript
// types/vital.ts

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  description: string;
  tier: 'MASTER' | 'EXPERT' | 'SPECIALIST' | 'WORKER' | 'TOOL';
  category: string;
  department: string;
  prompt_starters: PromptStarter[];
  tools: string[];
  capabilities: string[];
  skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptStarter {
  number: number;
  title: string;
  prompt_id: string;
}

export interface WorkflowExecuteRequest {
  mode: 'mode1' | 'mode2' | 'mode3' | 'mode4';
  query: string;
  selected_agent_id?: string;
  session_id?: string;
  tenant_id: string;
  user_id: string;
  enable_rag?: boolean;
  enable_tools?: boolean;
  compliance_regime?: 'HIPAA' | 'GDPR' | 'BOTH';
}

export interface WorkflowExecuteResponse {
  session_id: string;
  response: {
    agent_response: string;
    response_confidence: number;
    selected_agents?: AgentInfo[];
    tool_results?: ToolResult[];
    sub_agents_used?: SubAgentInfo[];
    artifacts?: Artifact[];
    sources?: Source[];
    compliance_audit_id?: string;
    requires_human_review: boolean;
    human_review_decision?: HumanReviewDecision;
    data_protected: boolean;
  };
  metadata: {
    mode: string;
    execution_time: number;
    tokens_used: number;
    workflow_state: string;
  };
}

export interface HumanReviewDecision {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  recommendation: string;
  confidence_threshold: number;
  actual_confidence: number;
}

export interface ToolResult {
  tool_name: string;
  result: any;
  timestamp: string;
  execution_time: number;
}

export interface SubAgentInfo {
  sub_agent_id: string;
  parent_agent_id: string;
  specialty: string;
  task: string;
  level: number;
  result: string;
}
```

---

## API Client Setup

```typescript
// lib/api-client.ts
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Create API client instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.aiEngineURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Example Implementations

### Complete Ask Expert Page

```typescript
// pages/ask-expert.tsx
import { useState } from 'react';
import { AgentGrid } from '@/components/agents/AgentGrid';
import { PromptStarters } from '@/components/prompts/PromptStarters';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function AskExpertPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [mode, setMode] = useState<'mode1' | 'mode2' | 'mode3' | 'mode4'>('mode1');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ask an Expert</h1>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setMode('mode1')}
          className={`px-4 py-2 rounded ${mode === 'mode1' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Mode 1: Manual Query
        </button>
        <button
          onClick={() => setMode('mode2')}
          className={`px-4 py-2 rounded ${mode === 'mode2' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Mode 2: Auto Query
        </button>
        <button
          onClick={() => setMode('mode3')}
          className={`px-4 py-2 rounded ${mode === 'mode3' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Mode 3: Manual Chat
        </button>
        <button
          onClick={() => setMode('mode4')}
          className={`px-4 py-2 rounded ${mode === 'mode4' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Mode 4: Auto Chat
        </button>
      </div>

      {!selectedAgent ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select an Expert Agent</h2>
          <AgentGrid onSelect={setSelectedAgent} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="sticky top-6">
              <PromptStarters
                agent={selectedAgent}
                onStarterClick={(content) => {
                  // Auto-fill chat input
                  console.log('Starter clicked:', content);
                }}
              />
              <button
                onClick={() => setSelectedAgent(null)}
                className="mt-4 w-full border px-4 py-2 rounded hover:bg-gray-50"
              >
                ← Change Agent
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ChatInterface agent={selectedAgent} mode={mode} />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js axios
   ```

2. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8001
   ```

3. **Initialize Supabase Client**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

4. **Test API Connectivity**
   - Verify agents endpoint: `/api/agents`
   - Test workflow execution: `/api/workflows/execute`
   - Check compliance: `/api/compliance/check`

5. **Implement Features Progressively**
   - Phase 1: Agent selection and display
   - Phase 2: Basic chat with Mode 1
   - Phase 3: All 4 modes
   - Phase 4: Compliance UI
   - Phase 5: Advanced features (tool results, sub-agents)

---

## Support & Documentation

- **Backend API Docs:** `services/ai-engine/README.md`
- **Workflow Guide:** `WORKFLOW_ENHANCEMENT_IMPLEMENTATION_GUIDE.md`
- **Execution Plan:** `EXECUTION_PLAN_STATUS.md`
- **Test Suite:** `services/ai-engine/tests/`

---

**All 319 enhanced agents, 1,276 prompt starters, and 4 compliant workflows are ready for frontend integration!** 🚀
