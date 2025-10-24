'use client';

import { Users, Star, ArrowRight, Send, Loader2, MessageSquare, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { PanelMember } from '@/app/(app)/ask-panel/services/panel-store';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpertPanelSelector } from '@/features/chat/components/expert-panel-selector';
import { useToast } from '@/hooks/use-toast';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';


// Three-Level Hierarchy: Domain → Subdomain → Use Cases
const PANEL_DOMAINS = [
  {
    id: 'regulatory',
    name: 'Regulatory Affairs',
    icon: '⚖️',
    description: 'FDA guidance, regulatory strategy, and compliance',
    subdomains: [
      {
        id: 'reg-submissions',
        name: 'Regulatory Submissions',
        description: 'FDA, EMA, and global regulatory submissions',
        useCases: [
          { id: 'fda-510k', name: '510(k) Clearance Strategy', experts: ['regulatory', 'fda', '510k'] },
          { id: 'fda-pma', name: 'PMA Submission Support', experts: ['regulatory', 'fda', 'pma'] },
          { id: 'de-novo', name: 'De Novo Classification', experts: ['regulatory', 'fda', 'classification'] },
          { id: 'global-reg', name: 'Global Regulatory Strategy', experts: ['regulatory', 'global', 'international'] }
        ]
      },
      {
        id: 'quality-compliance',
        name: 'Quality & Compliance',
        description: 'QMS, ISO standards, and compliance audits',
        useCases: [
          { id: 'iso-13485', name: 'ISO 13485 Implementation', experts: ['quality', 'iso', 'qms'] },
          { id: 'compliance-audit', name: 'Compliance Audit Preparation', experts: ['quality', 'compliance', 'audit'] },
          { id: 'capa', name: 'CAPA System Setup', experts: ['quality', 'capa', 'corrective'] },
          { id: 'risk-mgmt', name: 'Risk Management (ISO 14971)', experts: ['quality', 'risk', 'iso14971'] }
        ]
      },
      {
        id: 'post-market',
        name: 'Post-Market Surveillance',
        description: 'Pharmacovigilance and safety monitoring',
        useCases: [
          { id: 'adverse-events', name: 'Adverse Event Reporting', experts: ['safety', 'pharmacovigilance', 'adverse'] },
          { id: 'pvg-setup', name: 'Pharmacovigilance System Setup', experts: ['safety', 'pharmacovigilance', 'system'] },
          { id: 'safety-signal', name: 'Safety Signal Detection', experts: ['safety', 'signal', 'monitoring'] }
        ]
      }
    ]
  },
  {
    id: 'clinical',
    name: 'Clinical Research',
    icon: '🔬',
    description: 'Clinical trial design, patient safety, and medical research',
    subdomains: [
      {
        id: 'trial-design',
        name: 'Clinical Trial Design',
        description: 'Protocol development and study design',
        useCases: [
          { id: 'phase-2-design', name: 'Phase II Trial Design', experts: ['clinical', 'trial', 'phase2'] },
          { id: 'phase-3-design', name: 'Phase III Trial Design', experts: ['clinical', 'trial', 'phase3'] },
          { id: 'endpoint-selection', name: 'Endpoint Selection & Validation', experts: ['clinical', 'endpoint', 'biostatistics'] },
          { id: 'sample-size', name: 'Sample Size Calculation', experts: ['biostatistics', 'clinical', 'sample'] }
        ]
      },
      {
        id: 'clinical-ops',
        name: 'Clinical Operations',
        description: 'Trial execution and site management',
        useCases: [
          { id: 'site-selection', name: 'Site Selection & Feasibility', experts: ['clinical', 'operations', 'site'] },
          { id: 'patient-recruitment', name: 'Patient Recruitment Strategy', experts: ['clinical', 'recruitment', 'engagement'] },
          { id: 'data-monitoring', name: 'Data Monitoring & Safety', experts: ['clinical', 'monitoring', 'safety'] }
        ]
      },
      {
        id: 'medical-affairs',
        name: 'Medical Affairs',
        description: 'Medical writing and publications',
        useCases: [
          { id: 'csr-writing', name: 'Clinical Study Report Writing', experts: ['medical', 'writing', 'csr'] },
          { id: 'manuscript-prep', name: 'Manuscript Preparation', experts: ['medical', 'writing', 'publication'] },
          { id: 'lit-review', name: 'Literature Review & Meta-Analysis', experts: ['medical', 'research', 'literature'] }
        ]
      }
    ]
  },
  {
    id: 'market-access',
    name: 'Market Access',
    icon: '💼',
    description: 'Pricing, reimbursement, and payer strategy',
    subdomains: [
      {
        id: 'pricing-reimb',
        name: 'Pricing & Reimbursement',
        description: 'Value-based pricing and payer negotiations',
        useCases: [
          { id: 'pricing-strategy', name: 'Pricing Strategy Development', experts: ['pricing', 'market', 'strategy'] },
          { id: 'payer-nego', name: 'Payer Negotiation Support', experts: ['payer', 'negotiation', 'access'] },
          { id: 'reimb-pathway', name: 'Reimbursement Pathway Mapping', experts: ['reimbursement', 'payer', 'pathway'] }
        ]
      },
      {
        id: 'heor',
        name: 'Health Economics',
        description: 'HEOR and outcomes research',
        useCases: [
          { id: 'cea-model', name: 'Cost-Effectiveness Analysis', experts: ['heor', 'economics', 'cea'] },
          { id: 'budget-impact', name: 'Budget Impact Modeling', experts: ['heor', 'economics', 'budget'] },
          { id: 'qaly-analysis', name: 'QALY & Outcomes Research', experts: ['heor', 'outcomes', 'qaly'] }
        ]
      },
      {
        id: 'value-evidence',
        name: 'Value & Evidence',
        description: 'Value dossiers and HTA submissions',
        useCases: [
          { id: 'value-dossier', name: 'Global Value Dossier Development', experts: ['value', 'dossier', 'evidence'] },
          { id: 'hta-submission', name: 'HTA Submission Strategy', experts: ['hta', 'value', 'submission'] },
          { id: 'evidence-synthesis', name: 'Evidence Synthesis & Review', experts: ['evidence', 'research', 'synthesis'] }
        ]
      }
    ]
  },
  {
    id: 'digital-health',
    name: 'Digital Health',
    icon: '📱',
    description: 'Digital therapeutics, SaMD, and health technology',
    subdomains: [
      {
        id: 'samd',
        name: 'SaMD (Software as Medical Device)',
        description: 'Medical device software classification',
        useCases: [
          { id: 'samd-classification', name: 'SaMD Risk Classification', experts: ['digital', 'samd', 'classification'] },
          { id: 'samd-regulatory', name: 'SaMD Regulatory Pathway', experts: ['digital', 'regulatory', 'samd'] },
          { id: 'software-validation', name: 'Software Validation & Verification', experts: ['digital', 'validation', 'software'] }
        ]
      },
      {
        id: 'dtx',
        name: 'Digital Therapeutics (DTx)',
        description: 'Evidence-based digital interventions',
        useCases: [
          { id: 'dtx-clinical', name: 'DTx Clinical Validation Design', experts: ['digital', 'therapeutic', 'clinical'] },
          { id: 'dtx-evidence', name: 'DTx Evidence Generation', experts: ['digital', 'therapeutic', 'evidence'] },
          { id: 'dtx-reimbursement', name: 'DTx Reimbursement Strategy', experts: ['digital', 'therapeutic', 'reimbursement'] }
        ]
      },
      {
        id: 'connected-devices',
        name: 'Connected Devices & IoMT',
        description: 'Internet of Medical Things',
        useCases: [
          { id: 'iomt-strategy', name: 'IoMT Device Strategy', experts: ['digital', 'iomt', 'connected'] },
          { id: 'remote-monitoring', name: 'Remote Patient Monitoring', experts: ['digital', 'monitoring', 'remote'] },
          { id: 'data-integration', name: 'Data Integration & Interoperability', experts: ['digital', 'data', 'integration'] }
        ]
      },
      {
        id: 'data-security',
        name: 'Data Security & Privacy',
        description: 'HIPAA, cybersecurity, and data protection',
        useCases: [
          { id: 'hipaa-compliance', name: 'HIPAA Compliance Assessment', experts: ['privacy', 'hipaa', 'compliance'] },
          { id: 'cybersecurity', name: 'Cybersecurity Framework', experts: ['security', 'cyber', 'framework'] },
          { id: 'data-privacy', name: 'Data Privacy by Design', experts: ['privacy', 'data', 'design'] }
        ]
      }
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial Strategy',
    icon: '📊',
    description: 'Market analysis, competitive intelligence, and go-to-market',
    subdomains: [
      {
        id: 'market-intel',
        name: 'Market Intelligence',
        description: 'Market research and competitive analysis',
        useCases: [
          { id: 'market-sizing', name: 'Market Sizing & Forecasting', experts: ['market', 'research', 'forecasting'] },
          { id: 'competitor-analysis', name: 'Competitive Landscape Analysis', experts: ['competitive', 'intelligence', 'analysis'] },
          { id: 'opportunity-assessment', name: 'Opportunity Assessment', experts: ['market', 'opportunity', 'strategy'] }
        ]
      },
      {
        id: 'launch-strategy',
        name: 'Product Launch',
        description: 'Go-to-market and launch planning',
        useCases: [
          { id: 'gtm-strategy', name: 'Go-to-Market Strategy', experts: ['launch', 'gtm', 'strategy'] },
          { id: 'brand-positioning', name: 'Brand Positioning & Messaging', experts: ['brand', 'positioning', 'marketing'] },
          { id: 'launch-execution', name: 'Launch Execution Planning', experts: ['launch', 'execution', 'commercial'] }
        ]
      }
    ]
  }
];

interface PanelResponse {
  question: string;
  recommendation: string;
  consensus: any;
  expertResponses: Array<{
    expertId: string;
    expertName: string;
    content: string;
    confidence: number;
    reasoning: string;
  }>;
  timestamp: Date;
}

type OrchestrationMode = 'parallel' | 'sequential' | 'scripted' | 'debate' | 'funnel' | 'scenario' | 'dynamic';
type BoardArchetype = 'SAB' | 'CAB' | 'Market' | 'Strategic' | 'Ethics' | 'Innovation' | 'Risk';
type FusionModel = 'human-led' | 'agent-facilitated' | 'symbiotic' | 'autonomous' | 'continuous';

const ORCHESTRATION_MODES: { value: OrchestrationMode; label: string; description: string }[] = [
  { value: 'parallel', label: 'Parallel Polling', description: 'All experts respond simultaneously' },
  { value: 'sequential', label: 'Sequential Roundtable', description: 'Experts respond in sequence, building on previous responses' },
  { value: 'scripted', label: 'Scripted Interview', description: 'Follow a structured interview guide' },
  { value: 'debate', label: 'Free Debate', description: 'Adversarial discussion with cross-talk' },
  { value: 'funnel', label: 'Funnel & Filter', description: 'Breadth → cluster → depth analysis' },
  { value: 'scenario', label: 'Scenario Simulation', description: 'Role-play future scenarios' },
  { value: 'dynamic', label: 'Dynamic', description: 'Adaptive mode switching based on context' },
];

const BOARD_ARCHETYPES: { value: BoardArchetype; label: string; description: string; icon: string }[] = [
  { value: 'SAB', label: 'Scientific Advisory Board', description: 'R&D and clinical strategy guidance', icon: '🔬' },
  { value: 'CAB', label: 'Clinical Advisory Board', description: 'Real-world clinical insights from practitioners', icon: '👨‍⚕️' },
  { value: 'Market', label: 'Market Access Board', description: 'Payer, reimbursement, and access strategy', icon: '💼' },
  { value: 'Strategic', label: 'Strategic Board', description: 'Business strategy and portfolio decisions', icon: '📊' },
  { value: 'Ethics', label: 'Ethics & Compliance Board', description: 'Ethical review and regulatory compliance', icon: '⚖️' },
  { value: 'Innovation', label: 'Innovation Board', description: 'Digital health and emerging technologies', icon: '💡' },
  { value: 'Risk', label: 'Risk Management Board', description: 'Safety, pharmacovigilance, and risk mitigation', icon: '🛡️' },
];

const FUSION_MODELS: { value: FusionModel; label: string; description: string; icon: string }[] = [
  { value: 'human-led', label: 'Human-Led', description: 'Humans chair, AI provides evidence & drafts', icon: '👤' },
  { value: 'agent-facilitated', label: 'Agent-Facilitated', description: 'AI facilitates discussion, humans make decisions', icon: '🤝' },
  { value: 'symbiotic', label: 'Symbiotic', description: 'Equal partnership between humans and AI', icon: '⚡' },
  { value: 'autonomous', label: 'Autonomous', description: 'AI-led with human approval gates', icon: '🤖' },
  { value: 'continuous', label: 'Continuous Intelligence', description: 'Always-on board monitoring signals', icon: '♾️' },
];

export default function AskPanelPage() {
  const { toast } = useToast();
  const [showExpertPanelSelector, setShowExpertPanelSelector] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<typeof PANEL_DOMAINS[0] | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState<typeof PANEL_DOMAINS[0]['subdomains'][0] | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);
  const [panelAgents, setPanelAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [panelResponse, setPanelResponse] = useState<PanelResponse | null>(null);
  const [showExpertDetails, setShowExpertDetails] = useState(false);
  const [orchestrationMode, setOrchestrationMode] = useState<OrchestrationMode>('parallel');
  const [selectedArchetype, setSelectedArchetype] = useState<BoardArchetype | null>(null);
  const [selectedFusionModel, setSelectedFusionModel] = useState<FusionModel>('symbiotic');

  const { loadAgents } = useAgentsStore();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleDomainClick = (domain: typeof PANEL_DOMAINS[0]) => {
    setSelectedDomain(domain);
    setSelectedSubdomain(null);
    setSelectedUseCase(null);
  };

  const handleSubdomainClick = (subdomain: typeof PANEL_DOMAINS[0]['subdomains'][0]) => {
    setSelectedSubdomain(subdomain);
    setSelectedUseCase(null);
  };

  const handleUseCaseClick = async (useCase: any) => {
    setSelectedUseCase(useCase);

    // If use case has pre-configured experts, create panel directly
    if (useCase.experts && useCase.experts.length > 0) {
      // Load agents from store and filter by expert tags
      const { agents } = useAgentsStore.getState();
      const matchedAgents = agents.filter(agent =>
        useCase.experts.some((expertTag: string) =>
          agent.name.toLowerCase().includes(expertTag.toLowerCase()) ||
          agent.capabilities?.some((cap: any) =>
            cap.toLowerCase().includes(expertTag.toLowerCase())
          )
        )
      );

      if (matchedAgents.length > 0) {
        handleCreateExpertPanel(matchedAgents);
        return;
      }
    }

    // Fallback to manual selection if no pre-configured experts
    setShowExpertPanelSelector(true);
  };

  const handleBackToDomains = () => {
    setSelectedDomain(null);
    setSelectedSubdomain(null);
    setSelectedUseCase(null);
  };

  const handleBackToSubdomains = () => {
    setSelectedSubdomain(null);
    setSelectedUseCase(null);
  };

  const handleCreateExpertPanel = (experts: Agent[], knowledgeConfig?: any) => {
    setPanelAgents(experts);
    setShowExpertPanelSelector(false);
    setPanelResponse(null); // Reset previous response
    console.log('✅ Expert panel created with', experts.length, 'experts');
  };

  const handleAskPanel = async () => {
    if (!query.trim() || panelAgents.length === 0) return;

    setIsLoading(true);
    setPanelResponse(null);

    try {
      // Convert agents to PanelMembers
      const panelMembers: PanelMember[] = panelAgents.map(agent => ({
        agent,
        role: 'expert' as const,
        weight: 1,
      }));

      console.log('🎭 Sending panel consultation request...');
      console.log(`📊 Mode: ${orchestrationMode}`);
      console.log(`🏛️ Archetype: ${selectedArchetype}`);
      console.log(`🤝 Fusion Model: ${selectedFusionModel}`);
      const response = await fetch('/api/panel/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          panel: {
            id: `panel_${Date.now()}`,
            members: panelMembers,
            archetype: selectedArchetype,
            fusionModel: selectedFusionModel,
          },
          mode: orchestrationMode,
          context: {
            timestamp: new Date().toISOString(),
            archetype: selectedArchetype,
            fusionModel: selectedFusionModel,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Panel consultation failed');
      }

      const data = await response.json();
      console.log('✅ Panel consultation completed:', data);

      setPanelResponse({
        question: query,
        recommendation: data.response,
        consensus: data.metadata.consensus,
        expertResponses: data.metadata.expertResponses || [],
        timestamp: new Date(),
      });

      setQuery(''); // Clear input
    } catch (error) {
      console.error('❌ Panel consultation error:', error);
      toast({
        title: 'Panel Consultation Failed',
        description: 'Failed to consult panel. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Ask Panel</h1>
              <p className="text-sm text-muted-foreground">Create virtual advisory boards with expert panels</p>
            </div>
          </div>
          <Button
            onClick={() => setShowExpertPanelSelector(true)}
            size="default"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Create Custom Panel
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Active Panel Display */}
          {panelAgents.length > 0 && (
            <div className="mb-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Panel ({panelAgents.length} Experts)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {panelAgents.map((agent: Agent) => (
                    <Card key={agent.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <AgentAvatar avatar={agent.avatar} name={agent.display_name} size="md" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{agent.display_name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Panel Consultation Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Consult Panel
                  </CardTitle>
                  <CardDescription>
                    Ask your expert panel a question and receive a consensus recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Orchestration Mode Selector */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label htmlFor="orchestration-mode" className="text-sm font-medium mb-1 block">Orchestration Mode</label>
                      <Select value={orchestrationMode} onValueChange={(value) => setOrchestrationMode(value as OrchestrationMode)}>
                        <SelectTrigger id="orchestration-mode" className="w-full bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORCHESTRATION_MODES.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{mode.label}</span>
                                <span className="text-xs text-muted-foreground">{mode.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Query Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your question for the panel..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskPanel()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAskPanel}
                      disabled={isLoading || !query.trim()}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Consulting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Ask Panel
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Panel Response */}
                  {panelResponse && (
                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-sm mb-2">Question:</h3>
                        <p className="text-sm">{panelResponse.question}</p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Panel Recommendation</h3>
                          {panelResponse.consensus && (
                            <Badge variant="outline" className="bg-white">
                              {(panelResponse.consensus.agreementLevel * 100).toFixed(0)}% agreement
                            </Badge>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{panelResponse.recommendation}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Expert Responses */}
                      {panelResponse.expertResponses && panelResponse.expertResponses.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Individual Expert Opinions</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowExpertDetails(!showExpertDetails)}
                            >
                              {showExpertDetails ? 'Hide' : 'Show'} Details
                            </Button>
                          </div>

                          {showExpertDetails && (
                            <div className="space-y-3">
                              {panelResponse.expertResponses.map((expert, idx) => (
                                <Card key={idx} className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-sm">{expert.expertName}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {(expert.confidence * 100).toFixed(0)}% confident
                                      </Badge>
                                    </div>
                                    <p className="text-sm">{expert.content}</p>
                                    {expert.reasoning && (
                                      <p className="text-xs text-muted-foreground italic">
                                        Reasoning: {expert.reasoning}
                                      </p>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Breadcrumb Navigation */}
          {(selectedDomain || selectedSubdomain) && panelAgents.length === 0 && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button onClick={handleBackToDomains} className="text-blue-600 hover:text-blue-700 hover:underline">
                All Domains
              </button>
              {selectedDomain && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={handleBackToSubdomains}
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                  >
                    <span className="text-2xl">{selectedDomain.icon}</span>
                    {selectedDomain.name}
                  </button>
                </>
              )}
              {selectedSubdomain && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-medium">{selectedSubdomain.name}</span>
                </>
              )}
            </div>
          )}

          {/* Board Archetype Selection */}
          {!selectedDomain && panelAgents.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Select Board Archetype</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Choose the type of advisory board that best fits your decision-making needs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {BOARD_ARCHETYPES.map((archetype) => (
                  <Card
                    key={archetype.value}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                      selectedArchetype === archetype.value
                        ? 'border-primary border-2 bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedArchetype(archetype.value)}
                  >
                    <CardHeader className="pb-3">
                      <div className="text-3xl mb-2">{archetype.icon}</div>
                      <CardTitle className="text-sm">{archetype.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{archetype.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Fusion Model Selection */}
          {selectedArchetype && !selectedDomain && panelAgents.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-semibold">Select Fusion Model</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Choose how humans and AI collaborate in your advisory board
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {FUSION_MODELS.map((model) => (
                  <Card
                    key={model.value}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                      selectedFusionModel === model.value
                        ? 'border-purple-500 border-2 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedFusionModel(model.value)}
                  >
                    <CardHeader className="pb-3 text-center">
                      <div className="text-3xl mb-2">{model.icon}</div>
                      <CardTitle className="text-xs">{model.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground text-center">{model.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 1: Domain Selection */}
          {selectedArchetype && !selectedDomain && panelAgents.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Select Panel Domain</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Choose your area of focus to see relevant subdomains and use cases
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PANEL_DOMAINS.map((domain) => (
                  <Card
                    key={domain.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                    onClick={() => handleDomainClick(domain)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">{domain.icon}</div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                      </div>
                      <CardDescription>{domain.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400">
                        <span>{domain.subdomains.length} subdomains</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 2: Subdomain Selection */}
          {selectedDomain && !selectedSubdomain && panelAgents.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedDomain.icon}</span>
                <h2 className="text-2xl font-semibold">{selectedDomain.name}</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Select a subdomain to see specific use cases
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDomain.subdomains.map((subdomain) => (
                  <Card
                    key={subdomain.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                    onClick={() => handleSubdomainClick(subdomain)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{subdomain.name}</CardTitle>
                          <CardDescription className="text-sm">{subdomain.description}</CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {subdomain.useCases.length} use cases available
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 3: Use Case Selection */}
          {selectedSubdomain && panelAgents.length === 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">{selectedSubdomain.name}</h2>
                <p className="text-muted-foreground">{selectedSubdomain.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedSubdomain.useCases.map((useCase) => (
                  <Card
                    key={useCase.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 group"
                    onClick={() => handleUseCaseClick(useCase)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{useCase.name}</CardTitle>
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          Create Panel
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Expert Panel Selector Modal */}
      <ExpertPanelSelector
        isOpen={showExpertPanelSelector}
        onClose={() => {
          setShowExpertPanelSelector(false);
          setSelectedUseCase(null);
        }}
        onCreatePanel={handleCreateExpertPanel}
      />
    </div>
  );
}
