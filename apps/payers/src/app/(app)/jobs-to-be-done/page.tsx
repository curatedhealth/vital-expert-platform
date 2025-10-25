'use client';

import { Workflow, Star, CheckCircle, ArrowRight, GitBranch, Zap } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui/components/card';

// JTBD Workflow Templates - Building blocks for solutions
const JTBD_WORKFLOWS = [
  {
    id: 'regulatory-submission',
    name: 'FDA Submission Workflow',
    description: 'Complete regulatory pathway from strategy to submission',
    category: 'Regulatory',
    icon: '📋',
    complexity: 'high' as const,
    duration: '8-12 weeks',
    agents: ['FDA Regulatory Strategist', 'Medical Writer', 'Quality Specialist'],
    steps: [
      'Regulatory strategy assessment',
      'Documentation preparation',
      'Quality review & validation',
      'Submission compilation',
      'FDA filing'
    ],
    outputs: ['510(k) package', 'Technical documentation', 'Quality records'],
    useCases: [
      'Medical device approval',
      'Digital therapeutic submission',
      'Combination product filing'
    ]
  },
  {
    id: 'clinical-trial-design',
    name: 'Clinical Trial Design Workflow',
    description: 'End-to-end clinical study planning and execution',
    category: 'Clinical',
    icon: '🔬',
    complexity: 'high' as const,
    duration: '6-10 weeks',
    agents: ['Clinical Trial Designer', 'Biostatistician', 'Protocol Writer'],
    steps: [
      'Study objectives definition',
      'Statistical analysis plan',
      'Protocol development',
      'Site selection',
      'Regulatory approval'
    ],
    outputs: ['Clinical protocol', 'Statistical plan', 'Site qualification report'],
    useCases: [
      'Phase II/III trial design',
      'Real-world evidence studies',
      'Registry development'
    ]
  },
  {
    id: 'market-access',
    name: 'Market Access Strategy Workflow',
    description: 'Comprehensive market access and reimbursement planning',
    category: 'Commercial',
    icon: '💼',
    complexity: 'medium' as const,
    duration: '4-8 weeks',
    agents: ['Reimbursement Strategist', 'Health Economist', 'Payer Analyst'],
    steps: [
      'Payer landscape analysis',
      'Value proposition development',
      'Health economics modeling',
      'Pricing strategy',
      'Access roadmap'
    ],
    outputs: ['Payer dossier', 'HEOR model', 'Launch strategy'],
    useCases: [
      'Product launch planning',
      'Payer negotiation prep',
      'Value demonstration'
    ]
  },
  {
    id: 'quality-system',
    name: 'Quality Management System Setup',
    description: 'Establish compliant quality management infrastructure',
    category: 'Quality',
    icon: '✓',
    complexity: 'medium' as const,
    duration: '6-10 weeks',
    agents: ['QMS Architect', 'Compliance Specialist', 'Process Engineer'],
    steps: [
      'Gap analysis',
      'QMS framework design',
      'Process documentation',
      'Training program',
      'Audit readiness'
    ],
    outputs: ['QMS manual', 'SOPs', 'Training materials'],
    useCases: [
      'ISO 13485 certification',
      '21 CFR Part 820 compliance',
      'MDSAP preparation'
    ]
  },
  {
    id: 'evidence-generation',
    name: 'Clinical Evidence Generation',
    description: 'Build clinical and real-world evidence portfolio',
    category: 'Clinical',
    icon: '📊',
    complexity: 'high' as const,
    duration: '10-16 weeks',
    agents: ['Clinical Evidence Lead', 'Data Scientist', 'Medical Affairs'],
    steps: [
      'Evidence gap analysis',
      'Study design',
      'Data collection',
      'Analysis & reporting',
      'Publication strategy'
    ],
    outputs: ['Clinical evidence report', 'Publications', 'Scientific presentations'],
    useCases: [
      'Label expansion support',
      'Health economics evidence',
      'Comparative effectiveness'
    ]
  },
  {
    id: 'risk-management',
    name: 'Risk Management Workflow',
    description: 'Comprehensive risk assessment and mitigation planning',
    category: 'Quality',
    icon: '⚠️',
    complexity: 'medium' as const,
    duration: '3-6 weeks',
    agents: ['Risk Manager', 'Safety Officer', 'Clinical Specialist'],
    steps: [
      'Hazard identification',
      'Risk analysis',
      'Risk evaluation',
      'Control measures',
      'Residual risk assessment'
    ],
    outputs: ['Risk management file', 'Risk-benefit analysis', 'Mitigation plan'],
    useCases: [
      'ISO 14971 compliance',
      'Safety surveillance',
      'Post-market monitoring'
    ]
  }
];

export default function JobsToBeDonePage() {
  const [selectedJob, setSelectedJob] = useState<typeof JTBD_WORKFLOWS[0] | null>(null);

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
            <Workflow className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Jobs-to-be-Done</h1>
              <p className="text-sm text-muted-foreground">Orchestrated agent workflows - building blocks for end-to-end solutions</p>
            </div>
          </div>
          <Button
            size="default"
            className="flex items-center gap-2"
            onClick={() => window.alert('Custom workflow builder coming soon!')}
          >
            <GitBranch className="h-4 w-4" />
            Build Custom Workflow
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Building Blocks for Solutions:</strong> Each workflow represents a specific job-to-be-done with orchestrated agents.
              Combine multiple workflows in the Solution Builder to create complete end-to-end solutions.
            </div>
          </div>

          {/* Workflow Templates Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Workflow Templates</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Pre-built agent workflows for common pharmaceutical and healthcare tasks
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {JTBD_WORKFLOWS.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{job.icon}</div>
                        <div>
                          <CardTitle className="text-base leading-tight">{job.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {job.category}
                            </Badge>
                            <Badge className={`text-xs border ${getComplexityColor(job.complexity)}`}>
                              {job.complexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {job.description}
                    </CardDescription>

                    {/* Duration & Agents */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {job.duration}
                      </span>
                      <span>{job.agents.length} agents</span>
                    </div>

                    {/* Steps Preview */}
                    <div>
                      <h4 className="font-semibold text-xs mb-2">Key Steps</h4>
                      <div className="space-y-1">
                        {job.steps.slice(0, 2).map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                        {job.steps.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{job.steps.length - 2} more steps</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {!selectedJob && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Workflow className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a Workflow to Get Started</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Choose a pre-built workflow template or build a custom workflow with your own agent orchestration
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/solution-builder';
                  }
                }}>
                  View Solution Builder
                </Button>
                <Button size="sm">
                  Run Workflow
                </Button>
              </div>
            </div>
          )}

          {/* Selected Workflow Detail View */}
          {selectedJob && (
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedJob.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedJob.name}</h2>
                    <p className="text-muted-foreground">{selectedJob.description}</p>
                  </div>
                </div>
                <Button onClick={() => setSelectedJob(null)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Workflow Steps */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Workflow Steps</h3>
                  <div className="space-y-3">
                    {selectedJob.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agents & Outputs */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Orchestrated Agents</h3>
                    <div className="space-y-2">
                      {selectedJob.agents.map((agent, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Workflow className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{agent}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Deliverables</h3>
                    <div className="space-y-2">
                      {selectedJob.outputs.map((output, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button className="flex-1" onClick={() => window.alert('Running workflow...')}>
                  Run Workflow
                </Button>
                <Button variant="outline" onClick={() => window.alert('Customization coming soon!')}>
                  Customize
                </Button>
                <Button variant="outline" onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/solution-builder';
                  }
                }}>
                  Add to Solution
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
