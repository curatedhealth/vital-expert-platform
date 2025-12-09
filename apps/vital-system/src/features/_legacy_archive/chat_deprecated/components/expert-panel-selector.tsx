'use client';

import { useState, useEffect } from 'react';

import { AgentAvatar } from '@vital/ui';
import { useAgentsStore, type Agent as AgentsStoreAgent } from '@/lib/stores/agents-store';
import { ragService } from '@/shared/services/rag/rag-service';

interface ExpertPanelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePanel: (experts: AgentsStoreAgent[], knowledgeConfig?: KnowledgeConfig) => void;
}

interface KnowledgeConfig {
  domain?: string;
  prismSuite?: string;
  includeKnowledgeBase: boolean;
  knowledgeSourcesCount: number;
}

interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  expertiseAreas: string[];
  recommendedExperts: string[];
  domain?: string;
  prismSuite?: string;
}

interface PanelDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  useCases: PanelTemplate[];
}

const PANEL_DOMAINS: PanelDomain[] = [
  {
    id: 'regulatory',
    name: 'Regulatory Affairs',
    icon: '⚖️',
    description: 'FDA guidance, regulatory strategy, and compliance',
    useCases: [
      {
        id: 'fda-submission',
        name: 'FDA Submission Strategy',
        description: '510(k), PMA, and De Novo pathway selection and submission support',
        expertiseAreas: ['FDA Regulations', 'Regulatory Strategy', 'Submission Documentation'],
        recommendedExperts: ['regulatory', 'fda', 'submission'],
        domain: 'regulatory_compliance',
        prismSuite: 'RULES'
      },
      {
        id: 'global-regulatory',
        name: 'Global Regulatory Strategy',
        description: 'Multi-market regulatory planning (FDA, EMA, PMDA, Health Canada)',
        expertiseAreas: ['Global Regulations', 'International Compliance', 'Multi-Market Strategy'],
        recommendedExperts: ['regulatory', 'global', 'international'],
        domain: 'regulatory_compliance',
        prismSuite: 'RULES'
      },
      {
        id: 'quality-compliance',
        name: 'Quality & Compliance Review',
        description: 'QMS implementation, ISO 13485, and compliance audits',
        expertiseAreas: ['Quality Management', 'ISO Standards', 'Compliance Auditing'],
        recommendedExperts: ['quality', 'compliance', 'audit'],
        domain: 'regulatory_compliance',
        prismSuite: 'RULES'
      },
      {
        id: 'post-market-surveillance',
        name: 'Post-Market Surveillance',
        description: 'Pharmacovigilance, adverse event monitoring, and safety reporting',
        expertiseAreas: ['Pharmacovigilance', 'Safety Monitoring', 'Adverse Events'],
        recommendedExperts: ['safety', 'pharmacovigilance', 'surveillance'],
        domain: 'regulatory_compliance',
        prismSuite: 'RULES'
      }
    ]
  },
  {
    id: 'clinical',
    name: 'Clinical Research',
    icon: '🔬',
    description: 'Clinical trial design, patient safety, and medical research',
    useCases: [
      {
        id: 'trial-design',
        name: 'Clinical Trial Design',
        description: 'Protocol development, endpoint selection, and statistical planning',
        expertiseAreas: ['Clinical Protocol', 'Trial Design', 'Biostatistics'],
        recommendedExperts: ['clinical', 'trial', 'biostatistics'],
        domain: 'clinical_research',
        prismSuite: 'TRIALS'
      },
      {
        id: 'patient-safety',
        name: 'Patient Safety & Ethics',
        description: 'IRB submissions, informed consent, and patient safety protocols',
        expertiseAreas: ['Patient Safety', 'Ethics', 'IRB Compliance'],
        recommendedExperts: ['safety', 'ethics', 'patient'],
        domain: 'clinical_research',
        prismSuite: 'TRIALS'
      },
      {
        id: 'evidence-generation',
        name: 'Clinical Evidence Generation',
        description: 'Real-world evidence, observational studies, and data collection',
        expertiseAreas: ['Real-World Evidence', 'Data Collection', 'Clinical Outcomes'],
        recommendedExperts: ['clinical', 'evidence', 'outcomes'],
        domain: 'clinical_research',
        prismSuite: 'TRIALS'
      },
      {
        id: 'medical-writing',
        name: 'Medical Writing & Publications',
        description: 'Clinical study reports, manuscripts, and scientific communications',
        expertiseAreas: ['Medical Writing', 'Scientific Publications', 'Clinical Reporting'],
        recommendedExperts: ['medical', 'writing', 'publications'],
        domain: 'clinical_research',
        prismSuite: 'TRIALS'
      }
    ]
  },
  {
    id: 'market-access',
    name: 'Market Access',
    icon: '💼',
    description: 'Pricing, reimbursement, and payer strategy',
    useCases: [
      {
        id: 'pricing-strategy',
        name: 'Pricing & Reimbursement',
        description: 'Value-based pricing, payer negotiations, and reimbursement strategy',
        expertiseAreas: ['Pricing Strategy', 'Reimbursement', 'Payer Relations'],
        recommendedExperts: ['pricing', 'reimbursement', 'payer'],
        domain: 'market_access',
        prismSuite: 'VALUE'
      },
      {
        id: 'heor',
        name: 'Health Economics & Outcomes Research',
        description: 'Cost-effectiveness analysis, budget impact models, and HEOR studies',
        expertiseAreas: ['Health Economics', 'Outcomes Research', 'Cost-Effectiveness'],
        recommendedExperts: ['heor', 'economics', 'outcomes'],
        domain: 'market_access',
        prismSuite: 'VALUE'
      },
      {
        id: 'value-dossier',
        name: 'Value Dossier Development',
        description: 'HTA submissions, value propositions, and evidence synthesis',
        expertiseAreas: ['Value Dossier', 'HTA', 'Evidence Synthesis'],
        recommendedExperts: ['value', 'hta', 'dossier'],
        domain: 'market_access',
        prismSuite: 'VALUE'
      },
      {
        id: 'payer-engagement',
        name: 'Payer Engagement Strategy',
        description: 'Stakeholder mapping, payer outreach, and partnership development',
        expertiseAreas: ['Payer Engagement', 'Stakeholder Management', 'Partnerships'],
        recommendedExperts: ['payer', 'engagement', 'stakeholder'],
        domain: 'market_access',
        prismSuite: 'VALUE'
      }
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial Strategy',
    icon: '📊',
    description: 'Market analysis, competitive intelligence, and go-to-market',
    useCases: [
      {
        id: 'market-analysis',
        name: 'Market Analysis & Sizing',
        description: 'Market research, competitive landscape, and opportunity assessment',
        expertiseAreas: ['Market Research', 'Competitive Analysis', 'Market Sizing'],
        recommendedExperts: ['market', 'competitive', 'research'],
        domain: 'commercial_strategy',
        prismSuite: 'SCOUT'
      },
      {
        id: 'launch-strategy',
        name: 'Product Launch Strategy',
        description: 'Go-to-market planning, positioning, and launch execution',
        expertiseAreas: ['Product Launch', 'Go-to-Market', 'Brand Positioning'],
        recommendedExperts: ['launch', 'marketing', 'brand'],
        domain: 'commercial_strategy',
        prismSuite: 'SCOUT'
      },
      {
        id: 'sales-strategy',
        name: 'Sales & Distribution Strategy',
        description: 'Channel strategy, sales force design, and distribution planning',
        expertiseAreas: ['Sales Strategy', 'Distribution', 'Channel Management'],
        recommendedExperts: ['sales', 'distribution', 'channel'],
        domain: 'commercial_strategy',
        prismSuite: 'SCOUT'
      }
    ]
  },
  {
    id: 'digital-health',
    name: 'Digital Health',
    icon: '📱',
    description: 'Digital therapeutics, SaMD, and health technology',
    useCases: [
      {
        id: 'samd-classification',
        name: 'SaMD Classification & Regulatory',
        description: 'Software as Medical Device classification and regulatory pathway',
        expertiseAreas: ['SaMD', 'Digital Health Regulatory', 'Software Classification'],
        recommendedExperts: ['digital', 'samd', 'software'],
        domain: 'digital_health',
        prismSuite: 'DIGITAL'
      },
      {
        id: 'dtx-validation',
        name: 'Digital Therapeutics Validation',
        description: 'Clinical validation, evidence generation, and efficacy studies',
        expertiseAreas: ['Digital Therapeutics', 'Clinical Validation', 'Efficacy Studies'],
        recommendedExperts: ['digital', 'therapeutics', 'validation'],
        domain: 'digital_health',
        prismSuite: 'DIGITAL'
      },
      {
        id: 'data-privacy',
        name: 'Data Privacy & Cybersecurity',
        description: 'HIPAA compliance, data security, and privacy by design',
        expertiseAreas: ['Data Privacy', 'Cybersecurity', 'HIPAA Compliance'],
        recommendedExperts: ['privacy', 'security', 'hipaa'],
        domain: 'digital_health',
        prismSuite: 'DIGITAL'
      }
    ]
  }
];

const CUSTOM_PANEL: PanelTemplate = {
  id: 'custom-panel',
  name: 'Custom Expert Panel',
  description: 'Build your own panel by selecting specific experts',
  expertiseAreas: [],
  recommendedExperts: []
};

export function ExpertPanelSelector({ isOpen, onClose, onCreatePanel }: ExpertPanelSelectorProps) {
  const { agents, loadAgents } = useAgentsStore();
  const [selectedDomain, setSelectedDomain] = useState<PanelDomain | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PanelTemplate | null>(null);
  const [selectedExperts, setSelectedExperts] = useState<AgentsStoreAgent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgents, setFilteredAgents] = useState<AgentsStoreAgent[]>([]);
  const [knowledgeConfig, setKnowledgeConfig] = useState<KnowledgeConfig>({
    includeKnowledgeBase: true,
    knowledgeSourcesCount: 0
  });
  const [loadingKnowledgeSources, setLoadingKnowledgeSources] = useState(false);

  useEffect(() => {
    if (isOpen && agents.length === 0) {
      loadAgents();
    }
  }, [isOpen, agents.length, loadAgents]);

  useEffect(() => {
    let filtered = agents;

    // First filter by template domain/expertise if a template is selected
    if (selectedTemplate && selectedTemplate.id !== 'custom-panel') {
      filtered = agents.filter((agent: any) => {
        // Match by knowledge domains
        const domainMatch = (agent.knowledge_domains || []).some(domain =>
          selectedTemplate.recommendedExperts.some(expertise =>
            domain.toLowerCase().includes(expertise.toLowerCase()) ||
            expertise.toLowerCase().includes(domain.toLowerCase())
          ) ||
          (selectedTemplate.domain && domain.toLowerCase().includes(selectedTemplate.domain.replace('_', ' ').toLowerCase()))
        );

        // Match by description or name
        const nameMatch = selectedTemplate.recommendedExperts.some(expertise =>
          agent.display_name.toLowerCase().includes(expertise.toLowerCase()) ||
          agent.description.toLowerCase().includes(expertise.toLowerCase())
        );

        // Match by expertise areas
        const expertiseMatch = selectedTemplate.expertiseAreas.some(area =>
          agent.description.toLowerCase().includes(area.toLowerCase()) ||
          (agent.knowledge_domains || []).some(domain =>
            domain.toLowerCase().includes(area.toLowerCase())
          )
        );

        return domainMatch || nameMatch || expertiseMatch;
      });
    }

    // Then apply search filter on top
    if (searchTerm) {
      filtered = filtered.filter((agent: any) =>
        agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.knowledge_domains || []).some(domain =>
          domain.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredAgents(filtered);
  }, [searchTerm, agents, selectedTemplate]);

  const loadKnowledgeSources = async (template: PanelTemplate) => {
    if (!template.domain && !template.prismSuite) {
      setKnowledgeConfig(prev => ({ ...prev, knowledgeSourcesCount: 0 }));
      return;
    }

    setLoadingKnowledgeSources(true);
    try {
      const sources = await ragService.getKnowledgeSources({
        domain: template.domain,
        prism_suite: template.prismSuite,
        processing_status: 'completed',
        limit: 100
      });

      setKnowledgeConfig(prev => ({
        ...prev,
        domain: template.domain,
        prismSuite: template.prismSuite,
        knowledgeSourcesCount: sources.length
      }));
    } catch (error) {
      // console.error('Failed to load knowledge sources:', error);
      setKnowledgeConfig(prev => ({ ...prev, knowledgeSourcesCount: 0 }));
    } finally {
      setLoadingKnowledgeSources(false);
    }
  };

  const handleTemplateSelect = (template: PanelTemplate) => {
    setSelectedTemplate(template);

    // Load knowledge sources for this template
    loadKnowledgeSources(template);

    if (template.id !== 'custom-panel') {
      // Auto-select recommended experts based on template
      const recommendedAgents = agents.filter((agent: any) =>
        template.recommendedExperts.some(expertise =>
          agent.display_name.toLowerCase().includes(expertise) ||
          agent.description.toLowerCase().includes(expertise) ||
          (agent.knowledge_domains || []).some(domain =>
            domain.toLowerCase().includes(expertise)
          )
        )
      ).slice(0, 5); // Limit to 5 experts

      setSelectedExperts(recommendedAgents);
    } else {
      setSelectedExperts([]);
    }
  };

  const handleExpertToggle = (agent: AgentsStoreAgent) => {
    setSelectedExperts(prev => {
      const exists = prev.find((expert: any) => expert.id === agent.id);
      if (exists) {
        return prev.filter((expert: any) => expert.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

  const handleCreatePanel = () => {
    if (selectedExperts.length > 0) {
      onCreatePanel(selectedExperts, knowledgeConfig);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas-surface dark:bg-neutral-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Create Expert Panel</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              ✕
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Select a template or build a custom panel of experts for your consultation
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Breadcrumb navigation */}
          {selectedDomain && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <button
                onClick={() => {
                  setSelectedDomain(null);
                  setSelectedTemplate(null);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Domains
              </button>
              <span className="text-neutral-400">/</span>
              <span className="font-medium">{selectedDomain.name}</span>
            </div>
          )}

          {/* Show Domain Categories if no domain selected */}
          {!selectedDomain && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Select Panel Domain</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PANEL_DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain)}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{domain.icon}</span>
                      <h4 className="font-semibold text-foreground">{domain.name}</h4>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {domain.description}
                    </p>
                    <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                      {domain.useCases.length} use cases →
                    </div>
                  </button>
                ))}
                {/* Custom Panel Option */}
                <button
                  onClick={() => handleTemplateSelect(CUSTOM_PANEL)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTemplate?.id === 'custom-panel'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🎯</span>
                    <h4 className="font-semibold text-foreground">Custom Expert Panel</h4>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Build your own panel by selecting specific experts
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Show Use Cases when domain is selected */}
          {selectedDomain && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {selectedDomain.name} - Select Use Case
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedDomain.useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => handleTemplateSelect(useCase)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedTemplate?.id === useCase.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{useCase.name}</h4>
                      {selectedTemplate?.id === useCase.id && (
                        <span className="text-green-500">✓ Selected</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {useCase.description}
                    </p>
                    {useCase.expertiseAreas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {useCase.expertiseAreas.slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs rounded"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expert Selection */}
          {selectedTemplate && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Select Experts ({selectedExperts.length} selected)
                </h3>
                <input
                  type="text"
                  placeholder="Search experts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedExperts.find((expert: any) => expert.id === agent.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    }`}
                    onClick={() => handleExpertToggle(agent)}
                  >
                    <div className="flex items-center gap-2">
                      <AgentAvatar avatar={agent.avatar} name={agent.display_name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {agent.display_name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {agent.description}
                        </p>
                        {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {agent.knowledge_domains.slice(0, 2).map((domain) => (
                              <span
                                key={domain}
                                className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs rounded"
                              >
                                {domain}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedExperts.find((expert: any) => expert.id === agent.id) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base Configuration */}
          {selectedTemplate && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Knowledge Base Integration</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeKnowledgeBase"
                      checked={knowledgeConfig.includeKnowledgeBase}
                      onChange={(e) => setKnowledgeConfig(prev => ({ ...prev, includeKnowledgeBase: e.target.checked }))}
                      className="rounded border-neutral-300"
                    />
                    <label htmlFor="includeKnowledgeBase" className="font-medium text-sm">
                      Include Knowledge Base
                    </label>
                  </div>
                  {loadingKnowledgeSources ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {knowledgeConfig.knowledgeSourcesCount} sources available
                    </span>
                  )}
                </div>

                {knowledgeConfig.includeKnowledgeBase && knowledgeConfig.knowledgeSourcesCount > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Expert panel will have access to {knowledgeConfig.knowledgeSourcesCount} knowledge sources
                      {knowledgeConfig.domain && ` in ${knowledgeConfig.domain.replace('_', ' ')}`}
                      {knowledgeConfig.prismSuite && ` using the ${knowledgeConfig.prismSuite}™ framework`}.
                    </p>
                    <div className="flex gap-2 text-xs">
                      {knowledgeConfig.domain && (
                        <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
                          Domain: {knowledgeConfig.domain.replace('_', ' ')}
                        </span>
                      )}
                      {knowledgeConfig.prismSuite && (
                        <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded">
                          PRISM: {knowledgeConfig.prismSuite}™
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {knowledgeConfig.includeKnowledgeBase && knowledgeConfig.knowledgeSourcesCount === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    No knowledge sources found for this template. The panel will operate without RAG enhancement.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {selectedExperts.length > 0 && (
              <span>
                {selectedExperts.length} expert{selectedExperts.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePanel}
              disabled={selectedExperts.length === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedExperts.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Create Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}