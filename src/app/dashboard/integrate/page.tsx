'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MilestoneCard } from '@/components/platform/milestone-card';
import { PhaseActions } from '@/components/platform/phase-actions';
import {
  Target,
  Code,
  Database,
  Shield,
  Workflow,
  GitBranch,
  Server,
  TrendingUp,
} from 'lucide-react';

export default function IntegratePage() {
  const integrateMilestones = [
    {
      id: '1',
      title: 'System Architecture Design',
      description: 'Define technical architecture, data flows, and integration patterns',
      status: 'completed' as const,
      priority: 'critical' as const,
      dueDate: '2024-02-10',
      assignees: ['Tech Lead', 'Solutions Architect'],
      progress: 100,
      estimatedHours: 60,
      actualHours: 58,
    },
    {
      id: '2',
      title: 'API Design & Documentation',
      description: 'Create RESTful APIs and comprehensive technical documentation',
      status: 'completed' as const,
      priority: 'high' as const,
      dueDate: '2024-02-15',
      assignees: ['Backend Team', 'DevOps Engineer'],
      progress: 100,
      estimatedHours: 40,
      actualHours: 45,
    },
    {
      id: '3',
      title: 'Database Schema Implementation',
      description: 'Setup production database with proper indexing and optimization',
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: '2024-02-20',
      assignees: ['Database Admin', 'Backend Team'],
      progress: 70,
      estimatedHours: 35,
      actualHours: 28,
    },
    {
      id: '4',
      title: 'Security Framework Integration',
      description: 'Implement authentication, authorization, and data encryption',
      status: 'in_progress' as const,
      priority: 'critical' as const,
      dueDate: '2024-02-25',
      assignees: ['Security Team', 'DevOps Engineer'],
      progress: 45,
      estimatedHours: 50,
      actualHours: 20,
    },
    {
      id: '5',
      title: 'Third-party System Integration',
      description: 'Connect with EHR systems, payment processors, and external APIs',
      status: 'pending' as const,
      priority: 'high' as const,
      dueDate: '2024-03-05',
      assignees: ['Integration Team', 'QA Engineer'],
      progress: 0,
      estimatedHours: 70,
      actualHours: 0,
    },
    {
      id: '6',
      title: 'DevOps Pipeline Setup',
      description: 'Configure CI/CD, monitoring, and deployment automation',
      status: 'pending' as const,
      priority: 'medium' as const,
      dueDate: '2024-03-10',
      assignees: ['DevOps Team', 'SRE'],
      progress: 0,
      estimatedHours: 45,
      actualHours: 0,
    },
  ];

  const phaseProgress = 60;
  const completedMilestones = integrateMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = integrateMilestones.length;

  const integrateMetrics = [
    {
      title: 'API Endpoints',
      value: '24/32',
      description: 'RESTful endpoints implemented',
      trend: 'up' as const,
      change: '+8 this week',
    },
    {
      title: 'Test Coverage',
      value: '89%',
      description: 'Unit and integration tests',
      trend: 'up' as const,
      change: '+5%',
    },
    {
      title: 'Performance Score',
      value: '92/100',
      description: 'Lighthouse performance audit',
      trend: 'up' as const,
      change: '+3 points',
    },
    {
      title: 'Security Scan',
      value: 'A+',
      description: 'OWASP compliance score',
      trend: 'neutral' as const,
      change: 'Stable',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-progress-teal/10">
            <Target className="h-6 w-6 text-progress-teal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal">Intelligence Phase</h1>
            <p className="text-medical-gray">
              AI integration and intelligent system development
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-progress-teal/10 text-progress-teal">
          {phaseProgress}% Complete
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-progress-teal" />
            Intelligence Progress
          </CardTitle>
          <CardDescription>
            Track AI integration and intelligent system development milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-deep-charcoal">
                Overall Progress
              </span>
              <span className="text-sm text-medical-gray">
                {completedMilestones} of {totalMilestones} milestones complete
              </span>
            </div>
            <Progress value={phaseProgress} className="h-3" />

            {/* Technical Stack Progress */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-trust-blue/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Code className="h-6 w-6 text-trust-blue" />
                </div>
                <div className="text-sm font-medium text-deep-charcoal">Backend</div>
                <div className="text-xs text-medical-gray">75% complete</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-clinical-green/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Database className="h-6 w-6 text-clinical-green" />
                </div>
                <div className="text-sm font-medium text-deep-charcoal">Database</div>
                <div className="text-xs text-medical-gray">70% complete</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-regulatory-gold/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-regulatory-gold" />
                </div>
                <div className="text-sm font-medium text-deep-charcoal">Security</div>
                <div className="text-xs text-medical-gray">45% complete</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-market-purple/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Server className="h-6 w-6 text-market-purple" />
                </div>
                <div className="text-sm font-medium text-deep-charcoal">DevOps</div>
                <div className="text-xs text-medical-gray">0% complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-deep-charcoal">Intelligence Milestones</h2>
            <Button variant="outline" size="sm">
              Add Milestone
            </Button>
          </div>

          {integrateMilestones.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technical Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrateMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-deep-charcoal">
                      {metric.title}
                    </span>
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.trend === 'up' ? 'text-clinical-green' :
                      (metric.trend as string) === 'down' ? 'text-clinical-red' : 'text-medical-gray'
                    }`}>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {metric.change}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-deep-charcoal">{metric.value}</div>
                  <div className="text-xs text-medical-gray">{metric.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Integration Actions */}
          <PhaseActions
            phase="integrate"
            actions={[
              { id: 'architecture-review', label: 'Review Architecture', icon: 'chart' },
              { id: 'api-documentation', label: 'Generate API Docs', icon: 'document' },
              { id: 'security-audit', label: 'Run Security Audit', icon: 'help' },
              { id: 'performance-test', label: 'Performance Testing', icon: 'zap' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}