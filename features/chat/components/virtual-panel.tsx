'use client';

import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Brain,
  Lightbulb,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/shared/services/utils';

interface PanelAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  expertise: string[];
  status: 'thinking' | 'ready' | 'responding' | 'complete';
  response?: string;
  confidence?: number;
  reasoning?: string;
}

interface VirtualPanelProps {
  question: string;
  panelType: 'medical-board' | 'regulatory-panel' | 'clinical-experts' | 'custom';
  onComplete?: (consensus: PanelConsensus) => void;
  className?: string;
}

interface PanelConsensus {
  primaryRecommendation: string;
  confidence: number;
  dissenting: string[];
  nextSteps: string[];
  evidence: string[];
}

  'medical-board': {
    title: 'Medical Advisory Board',
    description: 'Expert medical professionals providing clinical guidance',
    agents: [
      {
        id: 'chief-medical-officer',
        name: 'Dr. Sarah Chen',
        role: 'Chief Medical Officer',
        avatar: '👩‍⚕️',
        color: 'bg-blue-500',
        expertise: ['Clinical Strategy', 'Patient Safety', 'Quality Assurance'],
        status: 'thinking' as const
      },
      {
        id: 'clinical-researcher',
        name: 'Dr. Michael Torres',
        role: 'Clinical Research Director',
        avatar: '👨‍🔬',
        color: 'bg-green-500',
        expertise: ['Clinical Trials', 'Evidence-Based Medicine', 'Biostatistics'],
        status: 'thinking' as const
      },
      {
        id: 'regulatory-expert',
        name: 'Dr. Jennifer Walsh',
        role: 'Regulatory Affairs Expert',
        avatar: '⚖️',
        color: 'bg-purple-500',
        expertise: ['FDA Compliance', 'Medical Device Regulation', 'Quality Systems'],
        status: 'thinking' as const
      }
    ]
  },
  'regulatory-panel': {
    title: 'Regulatory Expert Panel',
    description: 'Compliance and regulatory specialists',
    agents: [
      {
        id: 'fda-specialist',
        name: 'Alex Richardson',
        role: 'FDA Regulatory Specialist',
        avatar: '🏛️',
        color: 'bg-red-500',
        expertise: ['510(k) Submissions', 'Pre-Market Approval', 'FDA Guidance'],
        status: 'thinking' as const
      },
      {
        id: 'quality-expert',
        name: 'Maria Santos',
        role: 'Quality Systems Expert',
        avatar: '✅',
        color: 'bg-indigo-500',
        expertise: ['ISO 13485', 'Risk Management', 'Design Controls'],
        status: 'thinking' as const
      },
      {
        id: 'compliance-officer',
        name: 'David Kim',
        role: 'Compliance Officer',
        avatar: '🛡️',
        color: 'bg-yellow-600',
        expertise: ['HIPAA', 'Data Privacy', 'Audit Management'],
        status: 'thinking' as const
      }
    ]
  },
  'clinical-experts': {
    title: 'Clinical Expert Panel',
    description: 'Clinical specialists and practitioners',
    agents: [
      {
        id: 'clinical-trialist',
        name: 'Dr. Lisa Park',
        role: 'Clinical Trial Designer',
        avatar: '🧪',
        color: 'bg-teal-500',
        expertise: ['Protocol Design', 'Endpoint Selection', 'Patient Recruitment'],
        status: 'thinking' as const
      },
      {
        id: 'biostatistician',
        name: 'Dr. Robert Johnson',
        role: 'Principal Biostatistician',
        avatar: '📊',
        color: 'bg-orange-500',
        expertise: ['Statistical Analysis', 'Sample Size', 'Data Analysis Plans'],
        status: 'thinking' as const
      },
      {
        id: 'clinical-operations',
        name: 'Amanda Foster',
        role: 'Clinical Operations Lead',
        avatar: '⚙️',
        color: 'bg-pink-500',
        expertise: ['Site Management', 'Monitoring', 'Data Quality'],
        status: 'thinking' as const
      }
    ]
  },
  'custom': {
    title: 'Custom Expert Panel',
    description: 'Tailored expert panel for specific needs',
    agents: []
  }
};

export function VirtualPanel({ question, panelType, onComplete, className }: VirtualPanelProps) {
  // Validate panelType to prevent object injection
  const validPanelTypes = ['clinical', 'regulatory', 'market', 'technical'] as const;
  if (!validPanelTypes.includes(panelType as unknown)) {
    return <div className="text-red-500">Invalid panel type</div>;
  }
  
  const [agents, setAgents] = useState<PanelAgent[]>(PANEL_CONFIGURATIONS[panelType as keyof typeof PANEL_CONFIGURATIONS].agents);
  const [currentPhase, setCurrentPhase] = useState<'briefing' | 'deliberation' | 'consensus' | 'complete'>('briefing');
  const [consensus, setConsensus] = useState<PanelConsensus | null>(null);

  const config = PANEL_CONFIGURATIONS[panelType as keyof typeof PANEL_CONFIGURATIONS];

  useEffect(() => {
    if (question && agents.length > 0) {
      startDeliberation();
    }
  }, [question, agents.length]);

    setCurrentPhase('deliberation');

    // Simulate agents thinking and responding
    for (let __i = 0; i < agents.length; i++) {
      setTimeout(() => {
        setAgents(prev => prev.map((agent, index) =>
          index === i
            ? { ...agent, status: 'responding' }
            : agent
        ));

        // Simulate agent response
        setTimeout(() => {
          setAgents(prev => prev.map((agent, index) =>
            index === i
              ? {
                  ...agent,
                  status: 'complete',
                  response: generateAgentResponse(agent, question),
                  confidence: Math.floor(Math.random() * 30) + 70,
                  reasoning: generateReasoning(agent)
                }
              : agent
          ));
        }, 2000 + Math.random() * 3000);
      }, i * 1000);
    }

    // Check for completion
    setTimeout(() => {
      buildConsensus();
    }, agents.length * 3000 + 5000);
  };

      'chief-medical-officer': `From a clinical perspective, this requires careful consideration of patient safety and therapeutic efficacy. Based on current evidence and best practices...`,
      'clinical-researcher': `The research data supports a structured approach. Looking at the latest clinical trials and meta-analyses...`,
      'regulatory-expert': `From a regulatory standpoint, we need to ensure full compliance with FDA guidelines and quality standards...`,
      'fda-specialist': `The FDA pathway for this would typically involve a 510(k) submission with substantial equivalence demonstration...`,
      'quality-expert': `Quality systems perspective suggests implementing risk-based controls and validation protocols...`,
      'compliance-officer': `Privacy and security considerations are paramount. We need robust data protection measures...`,
      'clinical-trialist': `The trial design should incorporate adaptive elements and patient-reported outcomes...`,
      'biostatistician': `Statistical considerations include power analysis, interim monitoring, and multiplicity adjustments...`,
      'clinical-operations': `Operational feasibility requires site capability assessment and monitoring strategies...`
    };

    return responses[agent.id as keyof typeof responses] || `Based on my expertise in ${agent.expertise.join(', ')}, I recommend...`;
  };

    return `Analysis based on ${agent.expertise.join(', ')} expertise and current industry standards.`;
  };

    setCurrentPhase('consensus');

      "Conduct detailed feasibility assessment",
      "Prepare regulatory submission package",
      "Establish quality management system",
      "Implement risk mitigation strategies"
    ];

    const consensusResult: PanelConsensus = {
      primaryRecommendation,
      confidence,
      dissenting: [],
      nextSteps,
      evidence: ["Clinical evidence from peer-reviewed studies", "Regulatory precedent analysis", "Risk-benefit assessment"]
    };

    setConsensus(consensusResult);
    setCurrentPhase('complete');

    if (onComplete) {
      onComplete(consensusResult);
    }
  };

    switch (currentPhase) {
      case 'briefing': return 0;
      case 'deliberation': return 33;
      case 'consensus': return 66;
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{config.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge variant={currentPhase === 'complete' ? 'default' : 'secondary'}>
            {currentPhase === 'briefing' && 'Initializing'}
            {currentPhase === 'deliberation' && 'In Session'}
            {currentPhase === 'consensus' && 'Building Consensus'}
            {currentPhase === 'complete' && 'Complete'}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Panel Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Display */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm mb-1">Question for the Panel:</h4>
                <p className="text-sm">{question}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel Members */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Panel Members
          </h4>
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className={cn(
                "transition-all duration-200",
                agent.status === 'responding' && "ring-2 ring-blue-200",
                agent.status === 'complete' && "ring-1 ring-green-200"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <AgentAvatar avatar={agent.avatar} name={agent.name} size="sm" />
                        {agent.status === 'complete' && (
                          <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        )}
                        {agent.status === 'responding' && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium">{agent.name}</h5>
                          <Badge variant="outline" className="text-xs">{agent.role}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.expertise.map((exp, i) => (
                            <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.status === 'thinking' && <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />}
                      {agent.status === 'responding' && <Brain className="h-4 w-4 text-blue-500 animate-pulse" />}
                      {agent.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {agent.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {agent.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                  {agent.response && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{agent.response}</p>
                      {agent.reasoning && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{agent.reasoning}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Consensus Results */}
        {consensus && currentPhase === 'complete' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Lightbulb className="h-5 w-5 mr-2" />
                Panel Consensus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium text-sm mb-2">Primary Recommendation:</h5>
                <p className="text-sm">{consensus.primaryRecommendation}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Confidence: {consensus.confidence}%</span>
                </div>
                <Progress value={consensus.confidence} className="flex-1 h-2" />
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Next Steps:
                </h5>
                <ul className="text-sm space-y-1">
                  {consensus.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}