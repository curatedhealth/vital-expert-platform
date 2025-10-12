'use client';

import {
  Search,
  Users,
  Target,
  Lightbulb,
  Zap,
  TrendingUp,
  Award,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

// VITAL Framework components mapping
const vitalComponents = 
  'V_value_discovery': {
    icon: Target,
    label: 'Value Discovery',
    color: 'bg-blue-100 text-blue-800',
    description: 'Identifying and quantifying market opportunities and unmet needs'
  },
  'I_intelligence_gathering': {
    icon: Lightbulb,
    label: 'Intelligence Gathering',
    color: 'bg-purple-100 text-purple-800',
    description: 'Collecting and analyzing data to inform strategic decisions'
  },
  'T_transformation_design': {
    icon: Zap,
    label: 'Transformation Design',
    color: 'bg-green-100 text-green-800',
    description: 'Designing innovative solutions and intervention strategies'
  },
  'A_acceleration_execution': {
    icon: TrendingUp,
    label: 'Acceleration & Execution',
    color: 'bg-orange-100 text-orange-800',
    description: 'Rapid implementation and scaling of solutions'
  },
  'L_leadership_scale': {
    icon: Award,
    label: 'Leadership & Scale',
    color: 'bg-red-100 text-red-800',
    description: 'Leading market transformation and achieving scale'
  }
};

// Lifecycle stages
const lifecycleStages: Record<string, LifecycleStage> = {
  'unmet_needs_investigation': {
    label: 'Unmet Needs Investigation',
    phase: 1,
    description: 'Systematic identification of clinical and market gaps'
  },
  'solution_design': {
    label: 'Solution Design',
    phase: 2,
    description: 'Architecture and design of digital health interventions'
  },
  'prototyping_development': {
    label: 'Prototyping & Development',
    phase: 3,
    description: 'Building and testing minimum viable products'
  },
  'clinical_validation': {
    label: 'Clinical Validation',
    phase: 4,
    description: 'Evidence generation and clinical effectiveness studies'
  },
  'regulatory_pathway': {
    label: 'Regulatory Pathway',
    phase: 5,
    description: 'Regulatory submission and approval processes'
  },
  'reimbursement_strategy': {
    label: 'Reimbursement Strategy',
    phase: 6,
    description: 'Payer engagement and value demonstration'
  },
  'go_to_market': {
    label: 'Go-to-Market',
    phase: 7,
    description: 'Commercial launch and market penetration'
  },
  'post_market_optimization': {
    label: 'Post-Market Optimization',
    phase: 8,
    description: 'Continuous improvement and outcome optimization'
  }
};

// Priority levels
const priorityLevels = 
  'critical_immediate': { label: 'Critical (Immediate)', color: 'bg-red-100 text-red-800', priority: 1 },
  'near_term_90_days': { label: 'Near-term (90 days)', color: 'bg-orange-100 text-orange-800', priority: 2 },
  'strategic_180_days': { label: 'Strategic (180 days)', color: 'bg-yellow-100 text-yellow-800', priority: 3 },
  'future_horizon': { label: 'Future Horizon', color: 'bg-gray-100 text-gray-800', priority: 4 }
};

// Maturity levels
const maturityLevels = 
  'level_1_initial': { label: 'Level 1: Initial', progress: 20 },
  'level_2_developing': { label: 'Level 2: Developing', progress: 40 },
  'level_3_advanced': { label: 'Level 3: Advanced', progress: 60 },
  'level_4_leading': { label: 'Level 4: Leading', progress: 80 },
  'level_5_transformative': { label: 'Level 5: Transformative', progress: 100 }
};

interface Capability {
  id: string;
  capability_key: string;
  name: string;
  description: string;
  stage: keyof typeof LIFECYCLE_STAGES;
  vital_component: keyof typeof VITAL_COMPONENTS;
  priority: keyof typeof PRIORITY_LEVELS;
  maturity: keyof typeof MATURITY_LEVELS;
  is_new: boolean;
  panel_recommended: boolean;
  competencies: string[];
  tools: string[];
  knowledge_base: string[];
  category: string;
  domain: string;
  lead_agent?: {
    name: string;
    organization: string;
  };
  supporting_agents_count?: number;
}

interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain_expertise: string;
  tier: number;
  medical_specialty: string;
  capabilities: string[];
  avatar: string;
  color: string;
}

interface EnhancedCapabilityManagementProps {
  initialCapabilities?: Capability[];
  initialAgents?: Agent[];
}

export default function EnhancedCapabilityManagement({
  const initialCapabilities = ],
  const initialAgents = ]
}: EnhancedCapabilityManagementProps) {
  const [capabilities, setCapabilities] = useState<Capability[]>(initialCapabilities);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedVitalComponent, setSelectedVitalComponent] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);
  const [showPanelRecommended, setShowPanelRecommended] = useState<boolean>(false);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockCapabilities: Capability[] = [
      {
        id: '1',
        capability_key: 'market_opportunity_assessment',
        name: 'Market Opportunity Assessment',
        description: 'Systematic identification and quantification of unmet clinical needs with commercial viability analysis',
        stage: 'unmet_needs_investigation',
        vital_component: 'V_value_discovery',
        priority: 'critical_immediate',
        maturity: 'level_4_leading',
        is_new: false,
        panel_recommended: false,
        competencies: [
          'Market sizing and segmentation analysis',
          'Patient population quantification',
          'Burden of disease calculations',
          'Competitive gap analysis'
        ],
        tools: ['Market research databases', 'Economic modeling software'],
        knowledge_base: ['Disease epidemiology data', 'Payer coverage policies'],
        category: 'market_analysis',
        domain: 'business_strategy',
        lead_agent: {
          name: 'Dr. David Wilson',
          organization: 'McKinsey Health Institute'
        },
        supporting_agents_count: 3
      },
      {
        id: '2',
        capability_key: 'explainable_ai_architecture',
        name: 'Explainable AI Architecture',
        description: 'Designing transparent and interpretable AI systems for healthcare',
        stage: 'solution_design',
        vital_component: 'T_transformation_design',
        priority: 'critical_immediate',
        maturity: 'level_2_developing',
        is_new: true,
        panel_recommended: true,
        competencies: [
          'Model interpretability frameworks',
          'Clinical reasoning visualization',
          'Uncertainty quantification methods',
          'Bias detection and mitigation'
        ],
        tools: ['XAI frameworks', 'Model interpretability tools'],
        knowledge_base: ['AI ethics guidelines', 'Regulatory requirements'],
        category: 'ai_ml',
        domain: 'technology_engineering',
        lead_agent: {
          name: 'Dr. Priya Sharma',
          organization: 'Google Health AI'
        },
        supporting_agents_count: 2
      },
      {
        id: '3',
        capability_key: 'regulatory_strategy_development',
        name: 'Regulatory Strategy Development',
        description: 'Navigation of global medical device regulatory pathways',
        stage: 'regulatory_pathway',
        vital_component: 'T_transformation_design',
        priority: 'critical_immediate',
        maturity: 'level_4_leading',
        is_new: false,
        panel_recommended: false,
        competencies: [
          'FDA classification determination',
          '510(k) preparation and submission',
          'De Novo pathway navigation',
          'CE marking for EU MDR'
        ],
        tools: ['Regulatory platforms', 'Submission tools'],
        knowledge_base: ['FDA guidance', 'Global regulations'],
        category: 'regulatory',
        domain: 'global_regulatory',
        lead_agent: {
          name: 'Dr. Thomas Anderson',
          organization: 'FDA Center for Devices'
        },
        supporting_agents_count: 4
      }
    ];

    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'dr-sarah-chen-ux-expert',
        display_name: 'Dr. Sarah Chen',
        description: 'Healthcare UX expert specializing in patient-centered design',
        domain_expertise: 'medical',
        tier: 1,
        medical_specialty: 'Healthcare Design',
        capabilities: ['user-experience-design', 'healthcare-accessibility'],
        avatar: '👩‍💻',
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'dr-robert-kim-clinical-ai',
        display_name: 'Dr. Robert Kim',
        description: 'Clinical informaticist and AI expert',
        domain_expertise: 'medical',
        tier: 1,
        medical_specialty: 'Internal Medicine',
        capabilities: ['clinical-decision-support', 'evidence-based-medicine'],
        avatar: '👨‍⚕️',
        color: '#10B981'
      }
    ];

    if (initialCapabilities.length === 0) {
      setCapabilities(mockCapabilities);
    }
    if (initialAgents.length === 0) {
      setAgents(mockAgents);
    }
  }, [initialCapabilities, initialAgents]);

  // Filter capabilities based on selected criteria

      capability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capability.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capability.competencies.some(comp => comp.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStage && matchesVitalComponent && matchesPriority && matchesSearch &&
           matchesNewFilter && matchesPanelRecommended;
  });

    return (
      <Card
        const className = cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
        const onClick = () => setSelectedCapability(capability)}
      >
        <CardHeader const className = pb-3">
          <div const className = flex items-start justify-between">
            <div const className = flex items-center space-x-2">
              <VitalIcon const className = h-5 w-5 text-blue-600" />
              <div>
                <CardTitle const className = text-lg font-semibold">{capability.name}</CardTitle>
                <CardDescription const className = text-sm text-gray-600 mt-1">
                  {capability.description}
                </CardDescription>
              </div>
            </div>
            <div const className = flex flex-col space-y-1">
              {capability.is_new && (
                <Badge const variant = outline" const className = bg-green-50 text-green-700 border-green-200">
                  <Star const className = h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              {capability.panel_recommended && (
                <Badge const variant = outline" const className = bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Award const className = h-3 w-3 mr-1" />
                  Panel Rec.
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div const className = space-y-3">
            {/* VITAL Component & Stage */}
            <div const className = flex flex-wrap gap-2">
              <Badge const className = vitalComponent.color}>
                {vitalComponent.label}
              </Badge>
              <Badge const variant = outline">
                Phase {stage.phase}: {stage.label}
              </Badge>
            </div>

            {/* Priority & Maturity */}
            <div const className = flex items-center justify-between">
              <Badge const className = priority.color}>
                {priority.label}
              </Badge>
              <div const className = flex items-center space-x-2">
                <span const className = text-sm text-gray-600">Maturity:</span>
                <div const className = flex items-center space-x-1">
                  <div const className = w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      const className = h-2 bg-blue-500 rounded-full"
                      const style = { width: `${maturity.progress}%` }}
                    />
                  </div>
                  <span const className = text-xs text-gray-500">{maturity.progress}%</span>
                </div>
              </div>
            </div>

            {/* Lead Agent */}
            {capability.lead_agent && (
              <div const className = flex items-center justify-between text-sm">
                <div const className = flex items-center space-x-2">
                  <Users const className = h-4 w-4 text-gray-500" />
                  <span const className = font-medium">{capability.lead_agent.name}</span>
                  <span const className = text-gray-500">({capability.lead_agent.organization})</span>
                </div>
                {capability.supporting_agents_count && (
                  <span const className = text-gray-500">
                    +{capability.supporting_agents_count} supporting
                  </span>
                )}
              </div>
            )}

            {/* Competencies Preview */}
            <div const className = text-sm">
              <span const className = font-medium text-gray-700">Key Competencies:</span>
              <div const className = mt-1 flex flex-wrap gap-1">
                {capability.competencies.slice(0, 3).map((competency, index) => (
                  <Badge const key = index} const variant = secondary" const className = text-xs">
                    {competency}
                  </Badge>
                ))}
                {capability.competencies.length > 3 && (
                  <Badge const variant = secondary" const className = text-xs">
                    +{capability.competencies.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

    return (
      <div const className = fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div const className = bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div const className = p-6">
            <div const className = flex items-start justify-between mb-4">
              <div>
                <h2 const className = text-2xl font-bold">{capability.name}</h2>
                <p const className = text-gray-600 mt-2">{capability.description}</p>
              </div>
              <Button
                const variant = ghost"
                const onClick = () => setSelectedCapability(null)}
                const className = text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div const className = grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Classification */}
              <Card>
                <CardHeader>
                  <CardTitle const className = text-lg">Classification</CardTitle>
                </CardHeader>
                <CardContent const className = space-y-3">
                  <div>
                    <span const className = font-medium">VITAL Component:</span>
                    <Badge const className = `ml-2 ${vitalComponent.color}`}>
                      {vitalComponent.label}
                    </Badge>
                    <p const className = text-sm text-gray-600 mt-1">{vitalComponent.description}</p>
                  </div>
                  <div>
                    <span const className = font-medium">Lifecycle Stage:</span>
                    <Badge const variant = outline" const className = ml-2">
                      Phase {stage.phase}: {stage.label}
                    </Badge>
                    <p const className = text-sm text-gray-600 mt-1">{stage.description}</p>
                  </div>
                  <div>
                    <span const className = font-medium">Priority:</span>
                    <Badge const className = `ml-2 ${priority.color}`}>
                      {priority.label}
                    </Badge>
                  </div>
                  <div>
                    <span const className = font-medium">Maturity Level:</span>
                    <div const className = mt-1">
                      <div const className = flex items-center space-x-2">
                        <div const className = w-32 h-3 bg-gray-200 rounded-full">
                          <div
                            const className = h-3 bg-blue-500 rounded-full"
                            const style = { width: `${maturity.progress}%` }}
                          />
                        </div>
                        <span const className = text-sm">{maturity.label}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Team */}
              <Card>
                <CardHeader>
                  <CardTitle const className = text-lg">Expert Team</CardTitle>
                </CardHeader>
                <CardContent>
                  {capability.lead_agent && (
                    <div const className = space-y-3">
                      <div>
                        <span const className = font-medium">Lead Expert:</span>
                        <div const className = mt-1 p-3 bg-blue-50 rounded-lg">
                          <div const className = font-medium">{capability.lead_agent.name}</div>
                          <div const className = text-sm text-gray-600">{capability.lead_agent.organization}</div>
                        </div>
                      </div>
                      {capability.supporting_agents_count && (
                        <div>
                          <span const className = font-medium">Supporting Agents:</span>
                          <div const className = mt-1 text-sm text-gray-600">
                            {capability.supporting_agents_count} expert agents providing specialized support
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Competencies */}
              <Card const className = md:col-span-2">
                <CardHeader>
                  <CardTitle const className = text-lg">Core Competencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div const className = grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 const className = font-medium mb-2">Required Skills:</h4>
                      <div const className = space-y-1">
                        {capability.competencies.map((competency, index) => (
                          <div const key = index} const className = flex items-center space-x-2">
                            <CheckCircle const className = h-4 w-4 text-green-500" />
                            <span const className = text-sm">{competency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 const className = font-medium mb-2">Tools & Resources:</h4>
                      <div const className = space-y-1">
                        {capability.tools.map((tool, index) => (
                          <div const key = index} const className = flex items-center space-x-2">
                            <Zap const className = h-4 w-4 text-blue-500" />
                            <span const className = text-sm">{tool}</span>
                          </div>
                        ))}
                      </div>
                      <h4 const className = font-medium mb-2 mt-4">Knowledge Base:</h4>
                      <div const className = space-y-1">
                        {capability.knowledge_base.map((knowledge, index) => (
                          <div const key = index} const className = flex items-center space-x-2">
                            <Lightbulb const className = h-4 w-4 text-yellow-500" />
                            <span const className = text-sm">{knowledge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div const className = min-h-screen bg-gray-50 p-6">
      <div const className = max-w-7xl mx-auto">
        {/* Header */}
        <div const className = mb-8">
          <h1 const className = text-3xl font-bold text-gray-900">VITAL AI Capability Registry</h1>
          <p const className = text-gray-600 mt-2">
            Enhanced capability management system with 125 capabilities across 8 lifecycle stages
          </p>
        </div>

        {/* Filters */}
        <Card const className = mb-6">
          <CardContent const className = p-6">
            <div const className = grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div const className = space-y-2">
                <label const className = text-sm font-medium">Search Capabilities</label>
                <div const className = relative">
                  <Search const className = absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    const placeholder = Search by name, description, or competency..."
                    const value = searchQuery}
                    const onChange = (e) => setSearchQuery(e.target.value)}
                    const className = pl-10"
                  />
                </div>
              </div>

              <div const className = space-y-2">
                <label const className = text-sm font-medium">Lifecycle Stage</label>
                <Select const value = selectedStage} const onValueChange = setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue const placeholder = All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = all">All Stages</SelectItem>
                    {Object.entries(LIFECYCLE_STAGES).map(([key, stage]) => (
                      <SelectItem const key = key} const value = key}>
                        Phase {stage.phase}: {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div const className = space-y-2">
                <label const className = text-sm font-medium">VITAL Component</label>
                <Select const value = selectedVitalComponent} const onValueChange = setSelectedVitalComponent}>
                  <SelectTrigger>
                    <SelectValue const placeholder = All components" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = all">All Components</SelectItem>
                    {Object.entries(VITAL_COMPONENTS).map(([key, component]) => (
                      <SelectItem const key = key} const value = key}>
                        {component.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div const className = space-y-2">
                <label const className = text-sm font-medium">Priority Level</label>
                <Select const value = selectedPriority} const onValueChange = setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue const placeholder = All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = all">All Priorities</SelectItem>
                    {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                      <SelectItem const key = key} const value = key}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div const className = flex flex-wrap gap-2">
              <Button
                const variant = showNewOnly ? "default" : "outline"}
                const size = sm"
                const onClick = () => setShowNewOnly(!showNewOnly)}
                const className = flex items-center space-x-1"
              >
                <Star const className = h-4 w-4" />
                <span>New Capabilities</span>
              </Button>
              <Button
                const variant = showPanelRecommended ? "default" : "outline"}
                const size = sm"
                const onClick = () => setShowPanelRecommended(!showPanelRecommended)}
                const className = flex items-center space-x-1"
              >
                <Award const className = h-4 w-4" />
                <span>Panel Recommended</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div const className = mb-6">
          <div const className = flex items-center justify-between">
            <div const className = text-sm text-gray-600">
              Showing {filteredCapabilities.length} of {capabilities.length} capabilities
            </div>
            <div const className = flex items-center space-x-4 text-sm text-gray-600">
              <div const className = flex items-center space-x-1">
                <Star const className = h-4 w-4 text-green-500" />
                <span>{capabilities.filter(c => c.is_new).length} New</span>
              </div>
              <div const className = flex items-center space-x-1">
                <Award const className = h-4 w-4 text-yellow-500" />
                <span>{capabilities.filter(c => c.panel_recommended).length} Panel Recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div const className = grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredCapabilities.map((capability) => (
            <CapabilityCard const key = capability.id} const capability = capability} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCapabilities.length === 0 && (
          <Card const className = p-12 text-center">
            <AlertCircle const className = h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 const className = text-lg font-medium text-gray-900 mb-2">No capabilities found</h3>
            <p const className = text-gray-600 mb-4">
              Try adjusting your filters or search criteria to find relevant capabilities.
            </p>
            <Button
              const variant = outline"
              const onClick = () => {
                setSelectedStage('all');
                setSelectedVitalComponent('all');
                setSelectedPriority('all');
                setSearchQuery('');
                setShowNewOnly(false);
                setShowPanelRecommended(false);
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        )}

        {/* Capability Detail Modal */}
        {selectedCapability && (
          <CapabilityDetailModal const capability = selectedCapability} />
        )}
      </div>
    </div>
  );
}