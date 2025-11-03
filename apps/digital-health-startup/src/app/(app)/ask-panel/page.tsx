'use client';

import { Users, Star, ArrowRight, Send, Loader2, MessageSquare, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

import { PanelMember } from '@/app/(app)/ask-panel/services/panel-store';
import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { useToast } from '@/hooks/use-toast';
import { ExpertPanelSelector } from '@/features/chat/components/expert-panel-selector';
import { useAgentsStore, Agent } from '@/lib/stores/agents-store';
import { 
  useCreatePanel, 
  useExecutePanel,
  type PanelType as APIPanelType,
  type OrchestrationMode as APIOrchestrationMode,
  type Panel as APIPanel,
  type ExecutePanelResponse
} from '@/hooks/usePanelAPI';


// Three-Level Hierarchy: Domain → Subdomain → Use Cases
const PANEL_DOMAINS = [
  {
    id: 'regulatory',
    name: 'Regulatory Affairs',
    icon: '/icons/png/general/AI Ethics.png',
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
    icon: '/icons/png/general/Data Analysis.png',
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
    icon: '/icons/png/general/Decision Making.png',
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
    icon: '/icons/png/general/AI Chip.png',
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
    icon: '/icons/png/general/Predictive Analytics.png',
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
  panelId: string;
  question: string;
  recommendation: string;
  consensus: {
    consensus_level: number;
    agreement_points: string[];
    disagreement_points: string[];
    key_themes: string[];
    dissenting_opinions: any[];
  };
  expertResponses: Array<{
    id: string;
    agent_id: string;
    agent_name: string;
    content: string;
    confidence_score: number;
    metadata?: any;
  }>;
  timestamp: Date;
  execution_time_ms?: number;
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
  { value: 'SAB', label: 'Scientific Advisory Board', description: 'R&D and clinical strategy guidance', icon: '/icons/png/general/Data Analysis.png' },
  { value: 'CAB', label: 'Clinical Advisory Board', description: 'Real-world clinical insights from practitioners', icon: '/icons/png/general/Cognitive Computing.png' },
  { value: 'Market', label: 'Market Access Board', description: 'Payer, reimbursement, and access strategy', icon: '/icons/png/general/Decision Making.png' },
  { value: 'Strategic', label: 'Strategic Board', description: 'Business strategy and portfolio decisions', icon: '/icons/png/general/Predictive Analytics.png' },
  { value: 'Ethics', label: 'Ethics & Compliance Board', description: 'Ethical review and regulatory compliance', icon: '/icons/png/general/AI Ethics.png' },
  { value: 'Innovation', label: 'Innovation Board', description: 'Digital health and emerging technologies', icon: '/icons/png/general/AI Chip.png' },
  { value: 'Risk', label: 'Risk Management Board', description: 'Safety, pharmacovigilance, and risk mitigation', icon: '/icons/png/general/Algorithm.png' },
];

const FUSION_MODELS: { value: FusionModel; label: string; description: string; icon: string }[] = [
  { value: 'human-led', label: 'Human-Led', description: 'Humans chair, AI provides evidence & drafts', icon: '/icons/png/general/Virtual Assistant.png' },
  { value: 'agent-facilitated', label: 'Agent-Facilitated', description: 'AI facilitates discussion, humans make decisions', icon: '/icons/png/general/Smart Chatbot.png' },
  { value: 'symbiotic', label: 'Symbiotic', description: 'Equal partnership between humans and AI', icon: '/icons/png/general/Cognitive Computing.png' },
  { value: 'autonomous', label: 'Autonomous', description: 'AI-led with human approval gates', icon: '/icons/png/general/AI Brain.png' },
  { value: 'continuous', label: 'Continuous Intelligence', description: 'Always-on board monitoring signals', icon: '/icons/png/general/Machine Learning.png' },
];

export default function AskPanelPage() {
  // UI State
  const [showExpertPanelSelector, setShowExpertPanelSelector] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<typeof PANEL_DOMAINS[0] | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState<typeof PANEL_DOMAINS[0]['subdomains'][0] | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);
  const [showExpertDetails, setShowExpertDetails] = useState(false);
  
  // Panel State
  const [panelAgents, setPanelAgents] = useState<Agent[]>([]);
  const [currentPanelId, setCurrentPanelId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [panelResponse, setPanelResponse] = useState<PanelResponse | null>(null);
  
  // Configuration State
  const [orchestrationMode, setOrchestrationMode] = useState<OrchestrationMode>('parallel');
  const [selectedArchetype, setSelectedArchetype] = useState<BoardArchetype | null>(null);
  const [selectedFusionModel, setSelectedFusionModel] = useState<FusionModel>('symbiotic');

  // Hooks
  const { loadAgents } = useAgentsStore();
  const { toast } = useToast();
  
  // API Hooks
  const createPanelMutation = useCreatePanel({
    onSuccess: (data) => {
      setCurrentPanelId(data.id);
      toast({
        title: 'Panel Created',
        description: `Expert panel with ${panelAgents.length} experts is ready`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Panel',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const executePanelMutation = useExecutePanel(currentPanelId || '', {
    onSuccess: (data) => {
      // Convert API response to local format
      setPanelResponse({
        panelId: data.panel_id,
        question: data.query,
        recommendation: data.recommendation,
        consensus: {
          consensus_level: data.consensus.consensus_level,
          agreement_points: data.consensus.agreement_points,
          disagreement_points: data.consensus.disagreement_points,
          key_themes: data.consensus.key_themes,
          dissenting_opinions: data.consensus.dissenting_opinions,
        },
        expertResponses: data.expert_responses.map(response => ({
          id: response.id,
          agent_id: response.agent_id,
          agent_name: response.agent_name,
          content: response.content,
          confidence_score: response.confidence_score,
          metadata: response.metadata,
        })),
        timestamp: new Date(),
        execution_time_ms: data.execution_time_ms,
      });
      
      setQuery(''); // Clear input
      
      toast({
        title: 'Consultation Complete',
        description: `Panel reached ${(data.consensus.consensus_level * 100).toFixed(0)}% consensus`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Consultation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isLoading = createPanelMutation.isPending || executePanelMutation.isPending;

  // Helper function to render icon (PNG or emoji)
  const renderIcon = (icon: string, size: number = 32) => {
    if (icon.startsWith('/')) {
      return (
        <Image
          src={icon}
          alt=""
          width={size}
          height={size}
          className="object-contain"
        />
      );
    }
    return <span style={{ fontSize: `${size}px` }}>{icon}</span>;
  };

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
      const matchedAgents = agents.filter((agent: any) =>
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

  const handleCreateExpertPanel = async (experts: Agent[], knowledgeConfig?: any) => {
    setPanelAgents(experts);
    setShowExpertPanelSelector(false);
    setPanelResponse(null); // Reset previous response
    
    // Create panel in backend
    try {
      await createPanelMutation.mutateAsync({
        query: '', // Empty initially, user will add query later
        panel_type: 'structured' as APIPanelType,
        configuration: {
          orchestration_mode: orchestrationMode as APIOrchestrationMode,
          consensus_threshold: 0.7,
          archetype: selectedArchetype || undefined,
          fusion_model: selectedFusionModel,
          domain: selectedDomain?.id,
          subdomain: selectedSubdomain?.id,
          use_case: selectedUseCase?.id,
          custom_selection: !selectedUseCase,
        },
        agents: experts.map(agent => ({
          id: agent.id,
          name: agent.display_name,
          role: 'expert' as const,
          weight: 1,
        })),
      });
      
      console.log('✅ Expert panel created with', experts.length, 'experts');
    } catch (error) {
      console.error('❌ Failed to create panel:', error);
      // Toast already shown by mutation hook
    }
  };

  const handleAskPanel = async () => {
    if (!query.trim() || panelAgents.length === 0 || !currentPanelId) {
      if (!currentPanelId) {
        toast({
          title: 'No Active Panel',
          description: 'Please create a panel first',
          variant: 'destructive',
        });
      }
      return;
    }

    console.log('🎭 Sending panel consultation request...');
    console.log(`📊 Mode: ${orchestrationMode}`);
    console.log(`🏛️ Archetype: ${selectedArchetype}`);
    console.log(`🤝 Fusion Model: ${selectedFusionModel}`);
    
    try {
      await executePanelMutation.mutateAsync({
        query: query,
        stream: false, // TODO: Implement streaming in future
      });
      
      console.log('✅ Panel consultation completed');
    } catch (error) {
      console.error('❌ Panel consultation error:', error);
      // Toast already shown by mutation hook
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
      {/* Enhanced Page Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Users className="h-9 w-9 text-white" />
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-sm opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">Ask Panel</h1>
              <p className="text-base text-gray-600">Create virtual advisory boards with expert panels</p>
            </div>
          </div>
          <Button
            onClick={() => setShowExpertPanelSelector(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 gap-2.5 px-6 py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
          >
            <Users className="h-5 w-5" />
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
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Active Panel</h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {panelAgents.length} experts ready to consult
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {panelAgents.map((agent: Agent) => (
                    <Card key={agent.id} className="group border-2 border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-green-300 hover:-translate-y-0.5 transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <AgentAvatar avatar={agent.avatar} name={agent.display_name} size="md" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-base">{agent.display_name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{agent.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Panel Consultation Interface */}
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-b-2 border-gray-200 py-5">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Consult Panel
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-2">
                    Ask your expert panel a question and receive a consensus recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Orchestration Mode Selector */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Settings2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold mb-1.5 block text-gray-900">Orchestration Mode</label>
                      <Select value={orchestrationMode} onValueChange={(value) => setOrchestrationMode(value as OrchestrationMode)}>
                        <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors">
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
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter your question for the panel..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskPanel()}
                      disabled={isLoading}
                      className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 transition-colors"
                    />
                    <Button
                      onClick={handleAskPanel}
                      disabled={isLoading || !query.trim()}
                      className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 gap-2.5 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Consulting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Ask Panel
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Panel Response */}
                  {panelResponse && (
                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-vital-primary-100 dark:bg-vital-primary-500/20 rounded-lg border border-vital-slate-200 dark:border-vital-primary-600/30">
                        <h3 className="font-semibold text-sm mb-2">Question:</h3>
                        <p className="text-sm">{panelResponse.question}</p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Panel Recommendation</h3>
                          {panelResponse.consensus && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-white">
                                {(panelResponse.consensus.consensus_level * 100).toFixed(0)}% consensus
                              </Badge>
                              {panelResponse.execution_time_ms && (
                                <Badge variant="secondary" className="text-xs">
                                  {(panelResponse.execution_time_ms / 1000).toFixed(1)}s
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{panelResponse.recommendation}</ReactMarkdown>
                        </div>
                        
                        {/* Consensus Details */}
                        {panelResponse.consensus && (
                          <div className="mt-4 space-y-3">
                            {panelResponse.consensus.agreement_points.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <h4 className="text-sm font-medium">Points of Agreement</h4>
                                </div>
                                <ul className="text-sm space-y-1 ml-6">
                                  {panelResponse.consensus.agreement_points.map((point, idx) => (
                                    <li key={idx} className="text-muted-foreground">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {panelResponse.consensus.disagreement_points.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                  <h4 className="text-sm font-medium">Points of Disagreement</h4>
                                </div>
                                <ul className="text-sm space-y-1 ml-6">
                                  {panelResponse.consensus.disagreement_points.map((point, idx) => (
                                    <li key={idx} className="text-muted-foreground">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {panelResponse.consensus.key_themes.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Key Themes</h4>
                                <div className="flex flex-wrap gap-2">
                                  {panelResponse.consensus.key_themes.map((theme, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                              {panelResponse.expertResponses.map((expert) => (
                                <Card key={expert.id} className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-sm">{expert.agent_name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {(expert.confidence_score * 100).toFixed(0)}% confident
                                      </Badge>
                                    </div>
                                    <p className="text-sm">{expert.content}</p>
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

          {/* Panel Creation Status */}
          {panelAgents.length > 0 && !currentPanelId && createPanelMutation.isPending && (
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Creating Panel...</p>
                    <p className="text-sm text-muted-foreground">
                      Setting up your expert panel in the backend
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breadcrumb Navigation */}
          {(selectedDomain || selectedSubdomain) && panelAgents.length === 0 && (
            <div className="mb-6 flex items-center gap-2 text-sm bg-white rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm">
              <button 
                onClick={handleBackToDomains} 
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                All Domains
              </button>
              {selectedDomain && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={handleBackToSubdomains}
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 font-medium transition-colors"
                  >
                    <div className="w-6 h-6">{renderIcon(selectedDomain.icon, 24)}</div>
                    {selectedDomain.name}
                  </button>
                </>
              )}
              {selectedSubdomain && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-semibold text-gray-900">{selectedSubdomain.name}</span>
                </>
              )}
            </div>
          )}

          {/* Board Archetype Selection */}
          {!selectedDomain && panelAgents.length === 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Select Board Archetype</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Choose the type of advisory board that best fits your decision-making needs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                {BOARD_ARCHETYPES.map((archetype) => (
                  <Card
                    key={archetype.value}
                    className={`group cursor-pointer transition-all duration-300 border-2 ${
                      selectedArchetype === archetype.value
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-xl shadow-purple-500/20 scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1'
                    }`}
                    onClick={() => setSelectedArchetype(archetype.value)}
                  >
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex justify-center mb-4">
                        <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          selectedArchetype === archetype.value
                            ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 shadow-lg shadow-purple-500/40 scale-110'
                            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 group-hover:from-purple-100 group-hover:to-blue-100 group-hover:shadow-md'
                        }`}>
                          {renderIcon(archetype.icon, 44)}
                          {selectedArchetype === archetype.value && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base font-semibold text-center text-gray-900 leading-tight px-2">
                        {archetype.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <p className="text-sm text-gray-600 text-center leading-relaxed px-2">
                        {archetype.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Fusion Model Selection */}
          {selectedArchetype && !selectedDomain && panelAgents.length === 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Settings2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Select Fusion Model</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Choose how humans and AI collaborate in your advisory board
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                {FUSION_MODELS.map((model) => (
                  <Card
                    key={model.value}
                    className={`group cursor-pointer transition-all duration-300 border-2 ${
                      selectedFusionModel === model.value
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1'
                    }`}
                    onClick={() => setSelectedFusionModel(model.value)}
                  >
                    <CardHeader className="pb-3 pt-5 text-center">
                      <div className="flex justify-center mb-3">
                        <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedFusionModel === model.value
                            ? 'bg-gradient-to-br from-indigo-600 via-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/40 scale-110'
                            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:shadow-md'
                        }`}>
                          {renderIcon(model.icon, 36)}
                          {selectedFusionModel === model.value && (
                            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-semibold text-gray-900 leading-tight px-1">
                        {model.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <p className="text-xs text-gray-600 text-center leading-relaxed px-1">
                        {model.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 1: Domain Selection */}
          {selectedArchetype && !selectedDomain && panelAgents.length === 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Select Panel Domain</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Choose your area of focus to see relevant subdomains and use cases
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                {PANEL_DOMAINS.map((domain) => (
                  <Card
                    key={domain.id}
                    className="group cursor-pointer transition-all duration-300 border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1"
                    onClick={() => handleDomainClick(domain)}
                  >
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-cyan-100 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                          {renderIcon(domain.icon, 40)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                            {domain.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {domain.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-blue-600 font-medium px-1">
                        <span>{domain.subdomains.length} subdomains</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 2: Subdomain Selection */}
          {selectedDomain && !selectedSubdomain && panelAgents.length === 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center shadow-md">
                  {renderIcon(selectedDomain.icon, 36)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedDomain.name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Select a subdomain to see specific use cases
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                {selectedDomain.subdomains.map((subdomain) => (
                  <Card
                    key={subdomain.id}
                    className="group cursor-pointer transition-all duration-300 border-2 border-gray-200 bg-white hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1"
                    onClick={() => handleSubdomainClick(subdomain)}
                  >
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-700 transition-colors">
                            {subdomain.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {subdomain.description}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-purple-600 font-medium px-1">
                        <Users className="h-4 w-4" />
                        <span>{subdomain.useCases.length} use cases available</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Level 3: Use Case Selection */}
          {selectedSubdomain && panelAgents.length === 0 && (
            <div className="mb-12">
              <div className="mb-5">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{selectedSubdomain.name}</h2>
                <p className="text-base text-gray-600 leading-relaxed">{selectedSubdomain.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-8">
                {selectedSubdomain.useCases.map((useCase) => (
                  <Card
                    key={useCase.id}
                    className="group cursor-pointer transition-all duration-300 border-2 border-gray-200 bg-white hover:border-green-400 hover:shadow-xl hover:shadow-green-100/50 hover:-translate-y-0.5"
                    onClick={() => handleUseCaseClick(useCase)}
                  >
                    <CardHeader className="pb-4 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                            {useCase.name}
                          </CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/30 group-hover:shadow-lg group-hover:shadow-green-500/40 transition-all duration-300 rounded-lg px-4 py-2"
                        >
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
