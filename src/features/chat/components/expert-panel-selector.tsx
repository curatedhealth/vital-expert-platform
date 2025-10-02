'use client';

import { useState, useEffect } from 'react';

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

const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'regulatory-advisory',
    name: 'Regulatory Advisory Board',
    description: 'FDA guidance, regulatory strategy, and compliance review',
    expertiseAreas: ['Regulatory Affairs', 'FDA Compliance', 'Quality Assurance'],
    recommendedExperts: ['regulatory', 'compliance', 'quality'],
    domain: 'regulatory_compliance',
    prismSuite: 'RULES'
  },
  {
    id: 'clinical-experts',
    name: 'Clinical Expert Panel',
    description: 'Clinical strategy, patient safety, and medical guidance',
    expertiseAreas: ['Clinical Medicine', 'Patient Safety', 'Medical Research'],
    recommendedExperts: ['clinical', 'medical', 'safety'],
    domain: 'clinical_research',
    prismSuite: 'TRIALS'
  },
  {
    id: 'market-access',
    name: 'Market Access Panel',
    description: 'Market access strategy, health economics, and value demonstration',
    expertiseAreas: ['Market Access', 'Health Economics', 'Payer Relations'],
    recommendedExperts: ['market', 'economics', 'payer'],
    domain: 'market_access',
    prismSuite: 'VALUE'
  },
  {
    id: 'strategic-advisory',
    name: 'Strategic Advisory Board',
    description: 'Business strategy, market analysis, and strategic planning',
    expertiseAreas: ['Business Strategy', 'Market Analysis', 'Strategic Planning'],
    recommendedExperts: ['strategy', 'market', 'business'],
    domain: 'commercial_strategy',
    prismSuite: 'SCOUT'
  },
  {
    id: 'custom-panel',
    name: 'Custom Expert Panel',
    description: 'Build your own panel by selecting specific experts',
    expertiseAreas: [],
    recommendedExperts: []
  }
];

export function ExpertPanelSelector({ isOpen, onClose, onCreatePanel }: ExpertPanelSelectorProps) {
  const { agents, loadAgents } = useAgentsStore();
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
    if (searchTerm) {

        agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.knowledge_domains || []).some(domain =>
          domain.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchTerm, agents]);

    if (!template.domain && !template.prismSuite) {
      setKnowledgeConfig(prev => ({ ...prev, knowledgeSourcesCount: 0 }));
      return;
    }

    setLoadingKnowledgeSources(true);
    try {

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

    setSelectedTemplate(template);

    // Load knowledge sources for this template
    loadKnowledgeSources(template);

    if (template.id !== 'custom-panel') {
      // Auto-select recommended experts based on template

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

    setSelectedExperts(prev => {

      if (exists) {
        return prev.filter(expert => expert.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

    if (selectedExperts.length > 0) {
      onCreatePanel(selectedExperts, knowledgeConfig);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Create Expert Panel</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select a template or build a custom panel of experts for your consultation
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Panel Templates */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Panel Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PANEL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-foreground">{template.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  {template.expertiseAreas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.expertiseAreas.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                  {(template.domain || template.prismSuite) && (
                    <div className="mt-2 flex gap-1">
                      {template.domain && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-medium">
                          {template.domain.replace('_', ' ')}
                        </span>
                      )}
                      {template.prismSuite && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded font-medium">
                          {template.prismSuite}™
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedExperts.find(expert => expert.id === agent.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleExpertToggle(agent)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.avatar || '🤖'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {agent.display_name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {agent.description}
                        </p>
                        {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {agent.knowledge_domains.slice(0, 2).map((domain) => (
                              <span
                                key={domain}
                                className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded"
                              >
                                {domain}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedExperts.find(expert => expert.id === agent.id) && (
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
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="includeKnowledgeBase" className="font-medium text-sm">
                      Include Knowledge Base
                    </label>
                  </div>
                  {loadingKnowledgeSources ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {knowledgeConfig.knowledgeSourcesCount} sources available
                    </span>
                  )}
                </div>

                {knowledgeConfig.includeKnowledgeBase && knowledgeConfig.knowledgeSourcesCount > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedExperts.length > 0 && (
              <span>
                {selectedExperts.length} expert{selectedExperts.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePanel}
              disabled={selectedExperts.length === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedExperts.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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