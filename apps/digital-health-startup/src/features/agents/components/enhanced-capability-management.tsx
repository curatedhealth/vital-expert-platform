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

  'critical_immediate': { label: 'Critical (Immediate)', color: 'bg-red-100 text-red-800', priority: 1 },
  'near_term_90_days': { label: 'Near-term (90 days)', color: 'bg-orange-100 text-orange-800', priority: 2 },
  'strategic_180_days': { label: 'Strategic (180 days)', color: 'bg-yellow-100 text-yellow-800', priority: 3 },
  'future_horizon': { label: 'Future Horizon', color: 'bg-gray-100 text-gray-800', priority: 4 }
};

// Maturity levels

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
  initialCapabilities = [],
  initialAgents = []
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
        className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
        onClick={() => setSelectedCapability(capability)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <VitalIcon className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg font-semibold">{capability.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {capability.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              {capability.is_new && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Star className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              {capability.panel_recommended && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Award className="h-3 w-3 mr-1" />
                  Panel Rec.
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* VITAL Component & Stage */}
            <div className="flex flex-wrap gap-2">
              <Badge className={vitalComponent.color}>
                {vitalComponent.label}
              </Badge>
              <Badge variant="outline">
                Phase {stage.phase}: {stage.label}
              </Badge>
            </div>

            {/* Priority & Maturity */}
            <div className="flex items-center justify-between">
              <Badge className={priority.color}>
                {priority.label}
              </Badge>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Maturity:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${maturity.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{maturity.progress}%</span>
                </div>
              </div>
            </div>

            {/* Lead Agent */}
            {capability.lead_agent && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{capability.lead_agent.name}</span>
                  <span className="text-gray-500">({capability.lead_agent.organization})</span>
                </div>
                {capability.supporting_agents_count && (
                  <span className="text-gray-500">
                    +{capability.supporting_agents_count} supporting
                  </span>
                )}
              </div>
            )}

            {/* Competencies Preview */}
            <div className="text-sm">
              <span className="font-medium text-gray-700">Key Competencies:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {capability.competencies.slice(0, 3).map((competency, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {competency}
                  </Badge>
                ))}
                {capability.competencies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{capability.name}</h2>
                <p className="text-gray-600 mt-2">{capability.description}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedCapability(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">VITAL Component:</span>
                    <Badge className={`ml-2 ${vitalComponent.color}`}>
                      {vitalComponent.label}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{vitalComponent.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Lifecycle Stage:</span>
                    <Badge variant="outline" className="ml-2">
                      Phase {stage.phase}: {stage.label}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>
                    <Badge className={`ml-2 ${priority.color}`}>
                      {priority.label}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Maturity Level:</span>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-3 bg-gray-200 rounded-full">
                          <div
                            className="h-3 bg-blue-500 rounded-full"
                            style={{ width: `${maturity.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{maturity.label}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expert Team</CardTitle>
                </CardHeader>
                <CardContent>
                  {capability.lead_agent && (
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Lead Expert:</span>
                        <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium">{capability.lead_agent.name}</div>
                          <div className="text-sm text-gray-600">{capability.lead_agent.organization}</div>
                        </div>
                      </div>
                      {capability.supporting_agents_count && (
                        <div>
                          <span className="font-medium">Supporting Agents:</span>
                          <div className="mt-1 text-sm text-gray-600">
                            {capability.supporting_agents_count} expert agents providing specialized support
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Competencies */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Core Competencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Required Skills:</h4>
                      <div className="space-y-1">
                        {capability.competencies.map((competency, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{competency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Tools & Resources:</h4>
                      <div className="space-y-1">
                        {capability.tools.map((tool, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{tool}</span>
                          </div>
                        ))}
                      </div>
                      <h4 className="font-medium mb-2 mt-4">Knowledge Base:</h4>
                      <div className="space-y-1">
                        {capability.knowledge_base.map((knowledge, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{knowledge}</span>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VITAL AI Capability Registry</h1>
          <p className="text-gray-600 mt-2">
            Enhanced capability management system with 125 capabilities across 8 lifecycle stages
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Capabilities</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, description, or competency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lifecycle Stage</label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {Object.entries(LIFECYCLE_STAGES).map(([key, stage]) => (
                      <SelectItem key={key} value={key}>
                        Phase {stage.phase}: {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">VITAL Component</label>
                <Select value={selectedVitalComponent} onValueChange={setSelectedVitalComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All components" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Components</SelectItem>
                    {Object.entries(VITAL_COMPONENTS).map(([key, component]) => (
                      <SelectItem key={key} value={key}>
                        {component.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority Level</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                      <SelectItem key={key} value={key}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={showNewOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNewOnly(!showNewOnly)}
                className="flex items-center space-x-1"
              >
                <Star className="h-4 w-4" />
                <span>New Capabilities</span>
              </Button>
              <Button
                variant={showPanelRecommended ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPanelRecommended(!showPanelRecommended)}
                className="flex items-center space-x-1"
              >
                <Award className="h-4 w-4" />
                <span>Panel Recommended</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredCapabilities.length} of {capabilities.length} capabilities
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-green-500" />
                <span>{capabilities.filter((c: any) => c.is_new).length} New</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>{capabilities.filter((c: any) => c.panel_recommended).length} Panel Recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredCapabilities.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCapabilities.length === 0 && (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No capabilities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria to find relevant capabilities.
            </p>
            <Button
              variant="outline"
              onClick={() => {
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
          <CapabilityDetailModal capability={selectedCapability} />
        )}
      </div>
    </div>
  );
}