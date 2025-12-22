'use client';

/**
 * VITAL Platform - Ask Panel Test Page
 *
 * Test interface for the Unified Panel API with all 6 panel types:
 * - Structured, Open, Socratic, Adversarial, Delphi, Hybrid
 *
 * Features:
 * - Real-time streaming with SSE
 * - Runner integration with auto-selection
 * - Consensus analysis visualization
 * - Comparison matrix display
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  MessageSquare,
  Swords,
  Target,
  Vote,
  Brain,
  Sparkles,
  Play,
  Square,
  Loader2,
  Copy,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bot,
  Zap,
  BarChart3,
  FileText,
  RefreshCw,
  Settings,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
interface Agent {
  id: string;
  name: string;
  model: string;
  system_prompt: string;
  role: string;
}

interface StreamEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

interface ConsensusResult {
  consensus_score: number;
  consensus_level: string;
  agreement_points: string[];
  divergent_points: string[];
  recommendation: string;
}

interface RunnerInfo {
  runner_id: string;
  runner_type: string;
  category: string;
  ai_intervention: string;
  service_layer: string;
  auto_selected: boolean;
  detected_complexity?: string;
}

interface RunnerOption {
  runner_id: string;
  runner_type: string;
  category: string;
  description?: string;
  ai_intervention: string;
  service_layer?: string;
  service_layers?: string[];
  use_streaming?: boolean;
  name?: string;
  family?: string;
}

interface PanelRunners {
  panel_type: string;
  runners: {
    primary?: RunnerOption;
    advanced?: RunnerOption;
    family?: RunnerOption;
  };
}

interface AllRunnersResponse {
  total: number;
  runners: RunnerOption[];
  source: string;
  categories: string[];
}

interface PanelResult {
  panel_id: string;
  panel_type: string;
  question: string;
  status: string;
  consensus?: ConsensusResult;
  expert_responses: Array<{
    agent_id: string;
    agent_name: string;
    content: string;
    confidence: number;
  }>;
  execution_time_ms: number;
  runner_info?: RunnerInfo;
}

// Panel type configuration
const PANEL_TYPES = [
  { id: 'structured', name: 'Structured', icon: Users, color: 'purple', description: 'Sequential moderated discussion' },
  { id: 'open', name: 'Open', icon: Sparkles, color: 'violet', description: 'Free-form brainstorming' },
  { id: 'socratic', name: 'Socratic', icon: Brain, color: 'fuchsia', description: 'Dialectical questioning' },
  { id: 'adversarial', name: 'Adversarial', icon: Swords, color: 'pink', description: 'Pro/con debate format' },
  { id: 'delphi', name: 'Delphi', icon: Vote, color: 'indigo', description: 'Iterative consensus building' },
  { id: 'hybrid', name: 'Hybrid', icon: Target, color: 'cyan', description: 'Human-AI collaborative' },
];

// Default test agents
const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'expert-1',
    name: 'Regulatory Expert',
    model: 'gpt-4-turbo',
    system_prompt: 'You are a senior regulatory affairs expert with 15+ years of experience in FDA, EMA, and ICH guidelines. Provide detailed, evidence-based analysis.',
    role: 'expert',
  },
  {
    id: 'expert-2',
    name: 'Clinical Expert',
    model: 'gpt-4-turbo',
    system_prompt: 'You are a clinical development expert specializing in trial design, endpoints, and patient safety. Focus on scientific rigor and patient outcomes.',
    role: 'expert',
  },
  {
    id: 'expert-3',
    name: 'Commercial Expert',
    model: 'gpt-4-turbo',
    system_prompt: 'You are a commercial strategy expert focusing on market access, pricing, and competitive positioning. Provide business-oriented insights.',
    role: 'expert',
  },
];

// Sample questions for testing
const SAMPLE_QUESTIONS = [
  'What are the key regulatory considerations for a Phase 3 trial in oncology?',
  'How should we approach the market access strategy for a rare disease treatment?',
  'What are the pros and cons of accelerated approval vs standard approval pathway?',
  'How can we optimize the clinical trial design to reduce time to market?',
  'What are the critical success factors for a successful FDA pre-submission meeting?',
];

// Runner config options
const COMPLEXITY_OPTIONS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'simple', label: 'Simple (L2 Primary)' },
  { value: 'moderate', label: 'Moderate (L2 Advanced)' },
  { value: 'complex', label: 'Complex (L2 Advanced)' },
  { value: 'strategic', label: 'Strategic (L3 Family)' },
];

const JTBD_LEVELS = [
  { value: 'auto', label: 'Auto' },
  { value: 'task', label: 'Task (Quick)' },
  { value: 'workflow', label: 'Workflow (Multi-step)' },
  { value: 'solution', label: 'Solution (Design)' },
  { value: 'strategic', label: 'Strategic (Planning)' },
];

export default function AskPanelTestPage() {
  // State
  const [selectedPanelType, setSelectedPanelType] = useState('structured');
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [result, setResult] = useState<PanelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('config');

  // Runner config state
  const [complexity, setComplexity] = useState('auto');
  const [jtbdLevel, setJtbdLevel] = useState('auto');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [preferStreaming, setPreferStreaming] = useState(false);
  const [selectedRunnerId, setSelectedRunnerId] = useState<string>('auto');
  const [availableRunners, setAvailableRunners] = useState<Record<string, PanelRunners>>({});
  const [allRunners, setAllRunners] = useState<RunnerOption[]>([]);
  const [runnerCategories, setRunnerCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadingRunners, setLoadingRunners] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch all available runners on mount
  useEffect(() => {
    const fetchRunners = async () => {
      setLoadingRunners(true);
      try {
        // Fetch all runners from unified registry
        const allResponse = await fetch('/api/v1/unified-panel/runners/all');
        if (allResponse.ok) {
          const data: AllRunnersResponse = await allResponse.json();
          setAllRunners(data.runners || []);
          setRunnerCategories(data.categories || []);
        }

        // Also fetch panel-specific runners for backwards compatibility
        const panelResponse = await fetch('/api/v1/unified-panel/runners');
        if (panelResponse.ok) {
          const data = await panelResponse.json();
          setAvailableRunners(data.panels || {});
        }
      } catch (err) {
        console.error('Failed to fetch runners:', err);
      } finally {
        setLoadingRunners(false);
      }
    };
    fetchRunners();
  }, []);

  // Reset selected runner when panel type changes
  useEffect(() => {
    setSelectedRunnerId('auto');
    setSelectedCategory('all');
  }, [selectedPanelType]);

  // Filter runners by category
  const filteredRunners = selectedCategory === 'all'
    ? allRunners
    : allRunners.filter(r => r.category?.toUpperCase() === selectedCategory.toUpperCase());

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [streamEvents]);

  // Stream panel execution
  const executeStreamingPanel = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamEvents([]);
    setResult(null);
    setActiveTab('stream');

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/v1/unified-panel/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          panel_type: selectedPanelType,
          agents: agents.map(a => ({
            id: a.id,
            name: a.name,
            model: a.model,
            system_prompt: a.system_prompt,
            role: a.role,
          })),
          context: null,
          tenant_id: 'test-tenant',
          user_id: 'test-user',
          runner_config: {
            auto_select: selectedRunnerId === 'auto' && complexity === 'auto' && jtbdLevel === 'auto',
            runner_id: selectedRunnerId === 'auto' ? undefined : selectedRunnerId,
            complexity: complexity === 'auto' ? undefined : complexity,
            jtbd_level: jtbdLevel === 'auto' ? undefined : jtbdLevel,
            use_advanced: useAdvanced,
            prefer_streaming: preferStreaming,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = 'unknown';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // Capture the event type for the next data line
            currentEventType = line.slice(7).trim();
            continue;
          }
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                const eventType = currentEventType || parsed.type || 'unknown';
                const event: StreamEvent = {
                  type: eventType,
                  data: parsed,
                  timestamp: new Date().toISOString(),
                };
                setStreamEvents(prev => [...prev, event]);

                // Reset for next event
                currentEventType = 'unknown';

                // Handle completion
                if (eventType === 'panel_complete') {
                  setResult({
                    panel_id: parsed.panel_id || parsed.data?.panel_id,
                    panel_type: selectedPanelType,
                    question,
                    status: 'completed',
                    consensus: parsed.consensus || parsed.data?.consensus,
                    expert_responses: parsed.expert_responses || [],
                    execution_time_ms: parsed.execution_time_ms || parsed.data?.execution_time_ms || 0,
                    runner_info: parsed.runner_info || parsed.data?.runner_info,
                  });
                }
              } catch (e) {
                console.error('Failed to parse SSE event:', e, data);
              }
            }
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      }
      setIsStreaming(false);
    }
  }, [question, selectedPanelType, agents, selectedRunnerId, complexity, jtbdLevel, useAdvanced, preferStreaming]);

  // Synchronous panel execution
  const executeSyncPanel = useCallback(async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);
    setActiveTab('result');

    try {
      const response = await fetch('/api/v1/unified-panel/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          panel_type: selectedPanelType,
          agents: agents.map(a => ({
            id: a.id,
            name: a.name,
            model: a.model,
            system_prompt: a.system_prompt,
            role: a.role,
          })),
          context: null,
          tenant_id: 'test-tenant',
          user_id: 'test-user',
          save_to_db: false,
          generate_matrix: true,
          runner_config: {
            auto_select: selectedRunnerId === 'auto' && complexity === 'auto' && jtbdLevel === 'auto',
            runner_id: selectedRunnerId === 'auto' ? undefined : selectedRunnerId,
            complexity: complexity === 'auto' ? undefined : complexity,
            jtbd_level: jtbdLevel === 'auto' ? undefined : jtbdLevel,
            use_advanced: useAdvanced,
            prefer_streaming: preferStreaming,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsExecuting(false);
    }
  }, [question, selectedPanelType, agents, selectedRunnerId, complexity, jtbdLevel, useAdvanced, preferStreaming]);

  // Stop streaming
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Copy results
  const copyResults = () => {
    const text = JSON.stringify(result || streamEvents, null, 2);
    navigator.clipboard.writeText(text);
  };

  // Export results
  const exportResults = () => {
    const data = result || { events: streamEvents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `panel-test-${selectedPanelType}-${Date.now()}.json`;
    link.click();
  };

  // Get event icon and human-readable label
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'panel_started': return <Play className="w-4 h-4 text-green-500" />;
      case 'orchestrator_thinking':
      case 'orchestrator_message':
      case 'orchestrator_decision': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'topic_analysis': return <Target className="w-4 h-4 text-cyan-500" />;
      case 'experts_loaded': return <Users className="w-4 h-4 text-blue-500" />;
      case 'expert_thinking':
      case 'expert_generating': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'expert_response':
      case 'expert_complete': return <Bot className="w-4 h-4 text-blue-500" />;
      case 'round_complete': return <RefreshCw className="w-4 h-4 text-purple-500" />;
      case 'calculating_consensus':
      case 'consensus_started': return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />;
      case 'consensus_complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'building_matrix':
      case 'matrix_started': return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
      case 'matrix_complete': return <BarChart3 className="w-4 h-4 text-indigo-500" />;
      case 'panel_complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'runner_selected': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get human-readable event label
  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      'panel_started': 'Panel Started',
      'orchestrator_thinking': 'Orchestrator Thinking',
      'orchestrator_message': 'Orchestrator',
      'orchestrator_decision': 'Decision Made',
      'topic_analysis': 'Topic Analysis',
      'experts_loaded': 'Experts Loaded',
      'expert_thinking': 'Expert Thinking',
      'expert_generating': 'Generating Response',
      'expert_response': 'Expert Response',
      'expert_complete': 'Expert Complete',
      'round_complete': 'Round Complete',
      'calculating_consensus': 'Calculating Consensus',
      'consensus_started': 'Consensus Started',
      'consensus_complete': 'Consensus Complete',
      'building_matrix': 'Building Matrix',
      'matrix_started': 'Matrix Started',
      'matrix_complete': 'Matrix Complete',
      'panel_complete': 'Panel Complete',
      'runner_selected': 'Runner Selected',
      'error': 'Error',
    };
    return labels[type] || type;
  };

  // Get consensus color
  const getConsensusColor = (score: number) => {
    if (score >= 0.75) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedPanelConfig = PANEL_TYPES.find(p => p.id === selectedPanelType);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ask Panel Test</h1>
          <p className="text-muted-foreground mt-1">
            Test the Unified Panel API with all 6 panel types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyResults} disabled={!result && streamEvents.length === 0}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={exportResults} disabled={!result && streamEvents.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Panel Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Panel Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {PANEL_TYPES.map((panel) => {
                  const Icon = panel.icon;
                  const isSelected = selectedPanelType === panel.id;
                  return (
                    <Button
                      key={panel.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto flex-col py-3 ${isSelected ? '' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedPanelType(panel.id)}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{panel.name}</span>
                    </Button>
                  );
                })}
              </div>
              {selectedPanelConfig && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {selectedPanelConfig.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Question Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question for the panel..."
                className="min-h-[100px]"
              />
              <Select value={question} onValueChange={setQuestion}>
                <SelectTrigger>
                  <SelectValue placeholder="Or select a sample question" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_QUESTIONS.map((q, i) => (
                    <SelectItem key={i} value={q}>
                      {q.slice(0, 60)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Agents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Experts ({agents.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAgents(DEFAULT_AGENTS)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <Bot className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.model}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Runner Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Runner Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Customize how runners are selected and executed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Complexity Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Complexity Level</Label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLEXITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* JTBD Level Selection */}
              <div className="space-y-2">
                <Label className="text-sm">JTBD Level</Label>
                <Select value={jtbdLevel} onValueChange={setJtbdLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select JTBD level" />
                  </SelectTrigger>
                  <SelectContent>
                    {JTBD_LEVELS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Runner Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Runner Category ({runnerCategories.length} categories)</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        All Categories ({allRunners.length} runners)
                      </span>
                    </SelectItem>
                    {runnerCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1">{cat}</Badge>
                          ({allRunners.filter(r => r.category?.toUpperCase() === cat.toUpperCase()).length})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Runner Selection */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Specific Runner
                  {loadingRunners ? ' (Loading...)' : ` (${filteredRunners.length} available)`}
                </Label>
                <Select value={selectedRunnerId} onValueChange={setSelectedRunnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingRunners ? "Loading runners..." : "Select runner"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="auto">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Auto-select (recommended)
                      </span>
                    </SelectItem>

                    {/* Panel-recommended runners (if available) */}
                    {availableRunners[selectedPanelType]?.runners && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Recommended for {selectedPanelType}
                        </div>
                        {availableRunners[selectedPanelType].runners.primary && (
                          <SelectItem value={availableRunners[selectedPanelType].runners.primary!.runner_id}>
                            <span className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1">L2</Badge>
                              {availableRunners[selectedPanelType].runners.primary!.runner_id}
                            </span>
                          </SelectItem>
                        )}
                        {availableRunners[selectedPanelType].runners.advanced && (
                          <SelectItem value={availableRunners[selectedPanelType].runners.advanced!.runner_id}>
                            <span className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1">L2+</Badge>
                              {availableRunners[selectedPanelType].runners.advanced!.runner_id}
                            </span>
                          </SelectItem>
                        )}
                        {availableRunners[selectedPanelType].runners.family && (
                          <SelectItem value={availableRunners[selectedPanelType].runners.family!.runner_id}>
                            <span className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] px-1">L3</Badge>
                              {availableRunners[selectedPanelType].runners.family!.runner_id}
                            </span>
                          </SelectItem>
                        )}
                      </>
                    )}

                    {/* All runners (filtered by category) */}
                    {filteredRunners.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {selectedCategory === 'all' ? 'All Runners' : `${selectedCategory} Runners`} ({filteredRunners.length})
                        </div>
                        {filteredRunners.slice(0, 50).map((runner) => (
                          <SelectItem key={runner.runner_id} value={runner.runner_id}>
                            <span className="flex items-center gap-2">
                              <Badge
                                variant={runner.runner_type === 'family' ? 'secondary' : 'outline'}
                                className="text-[10px] px-1"
                              >
                                {runner.runner_type === 'family' ? 'FAM' : runner.category?.slice(0, 4)}
                              </Badge>
                              <span className="truncate max-w-[200px]">
                                {runner.name || runner.runner_id}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                        {filteredRunners.length > 50 && (
                          <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                            +{filteredRunners.length - 50} more (use category filter)
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {selectedRunnerId !== 'auto' && (
                  <p className="text-xs text-muted-foreground">
                    {allRunners.find(r => r.runner_id === selectedRunnerId)?.description ||
                     Object.values(availableRunners[selectedPanelType]?.runners || {}).find(
                       r => r?.runner_id === selectedRunnerId
                     )?.description ||
                     'No description available'}
                  </p>
                )}
              </div>

              {/* Toggle Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Use Advanced Runners</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable L3 Family runners for complex tasks
                    </p>
                  </div>
                  <Switch
                    checked={useAdvanced}
                    onCheckedChange={setUseAdvanced}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Prefer Streaming</Label>
                    <p className="text-xs text-muted-foreground">
                      Use streaming-optimized execution
                    </p>
                  </div>
                  <Switch
                    checked={preferStreaming}
                    onCheckedChange={setPreferStreaming}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execute Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={executeStreamingPanel}
              disabled={isStreaming || isExecuting || !question.trim()}
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Streaming...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Stream
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={executeSyncPanel}
              disabled={isStreaming || isExecuting || !question.trim()}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
            {isStreaming && (
              <Button variant="destructive" size="icon" onClick={stopStreaming}>
                <Square className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="config">Config</TabsTrigger>
                  <TabsTrigger value="stream">
                    Stream
                    {streamEvents.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {streamEvents.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="result">Result</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <TabsContent value="config" className="mt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">API Endpoint</h3>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      POST /api/v1/unified-panel/execute
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      For streaming: POST /api/v1/unified-panel/stream
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Request Body Preview</h3>
                    <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-background rounded">
                      {JSON.stringify({
                        question,
                        panel_type: selectedPanelType,
                        agents: agents.map(a => ({ id: a.id, name: a.name, model: a.model, role: a.role })),
                        save_to_db: false,
                        generate_matrix: true,
                        runner_config: {
                          auto_select: selectedRunnerId === 'auto' && complexity === 'auto' && jtbdLevel === 'auto',
                          runner_id: selectedRunnerId === 'auto' ? null : selectedRunnerId,
                          complexity: complexity === 'auto' ? null : complexity,
                          jtbd_level: jtbdLevel === 'auto' ? null : jtbdLevel,
                          use_advanced: useAdvanced,
                          prefer_streaming: preferStreaming,
                        },
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stream" className="mt-0">
                <ScrollArea ref={scrollAreaRef} className="h-[500px] w-full rounded-md border p-4">
                  {streamEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
                      <p>No stream events yet</p>
                      <p className="text-xs">Click "Stream" to start</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {streamEvents.map((event, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {getEventLabel(event.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {event.data.message && (
                              <p className="text-sm">{event.data.message}</p>
                            )}
                            {event.data.content && (
                              <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                  {event.data.content.length > 500
                                    ? `${event.data.content.slice(0, 500)}...`
                                    : event.data.content}
                                </ReactMarkdown>
                              </div>
                            )}
                            {event.data.expert_name && (
                              <p className="text-xs text-muted-foreground">
                                Expert: {event.data.expert_name}
                              </p>
                            )}
                            {event.data.consensus_score !== undefined && (
                              <p className={`text-sm font-medium ${getConsensusColor(event.data.consensus_score)}`}>
                                Consensus: {Math.round(event.data.consensus_score * 100)}%
                              </p>
                            )}
                            {event.data.runner_info && (
                              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs">
                                <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                                  <Zap className="w-3 h-3" />
                                  <span className="font-medium">Runner:</span>
                                  <span>{event.data.runner_info.runner_id}</span>
                                  <Badge variant="outline" className="ml-2 text-[10px]">
                                    {event.data.runner_info.service_layer}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="result" className="mt-0">
                {!result ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                    <FileText className="w-8 h-8 mb-4 opacity-50" />
                    <p>No results yet</p>
                    <p className="text-xs">Execute a panel to see results</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4 pr-4">
                      {/* Status */}
                      <div className="flex items-center gap-4">
                        <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.execution_time_ms}ms
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Panel ID: {result.panel_id?.slice(0, 8)}...
                        </span>
                      </div>

                      {/* Runner Info */}
                      {result.runner_info && (
                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Runner Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Runner:</span>{' '}
                              {result.runner_info.runner_id}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>{' '}
                              {result.runner_info.runner_type}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>{' '}
                              {result.runner_info.category}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Layer:</span>{' '}
                              {result.runner_info.service_layer}
                            </div>
                            {result.runner_info.detected_complexity && (
                              <div>
                                <span className="text-muted-foreground">Complexity:</span>{' '}
                                {result.runner_info.detected_complexity}
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Auto-selected:</span>{' '}
                              {result.runner_info.auto_selected ? 'Yes' : 'No'}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Consensus */}
                      {result.consensus && (
                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Consensus Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Consensus Score</span>
                                  <span className={`font-medium ${getConsensusColor(result.consensus.consensus_score)}`}>
                                    {Math.round(result.consensus.consensus_score * 100)}%
                                  </span>
                                </div>
                                <Progress value={result.consensus.consensus_score * 100} />
                              </div>
                              <Badge variant="outline">
                                {result.consensus.consensus_level}
                              </Badge>
                            </div>

                            {result.consensus.agreement_points?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-green-600 mb-1">Agreement Points:</p>
                                <ul className="text-sm space-y-1">
                                  {result.consensus.agreement_points.slice(0, 3).map((point, i) => (
                                    <li key={i} className="flex gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {result.consensus.divergent_points?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-yellow-600 mb-1">Divergent Points:</p>
                                <ul className="text-sm space-y-1">
                                  {result.consensus.divergent_points.slice(0, 3).map((point, i) => (
                                    <li key={i} className="flex gap-2">
                                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {result.consensus.recommendation && (
                              <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-1">Recommendation:</p>
                                <p className="text-sm text-muted-foreground">
                                  {result.consensus.recommendation}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Expert Responses */}
                      {result.expert_responses?.length > 0 && (
                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Expert Responses ({result.expert_responses.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {result.expert_responses.map((response, index) => (
                              <div key={index} className="p-3 bg-background rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-sm">{response.agent_name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(response.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown>
                                    {response.content.length > 500
                                      ? `${response.content.slice(0, 500)}...`
                                      : response.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
