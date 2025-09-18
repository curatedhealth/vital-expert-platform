'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MilestoneCard } from '@/components/platform/milestone-card';
import { PhaseActions } from '@/components/platform/phase-actions';
import {
  Brain,
  Target,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function VisionPage() {
  const visionMilestones = [
    {
      id: '1',
      title: 'Market Research & Analysis',
      description: 'Comprehensive analysis of target market, competitors, and opportunities',
      status: 'completed' as const,
      priority: 'critical' as const,
      dueDate: '2024-01-15',
      assignees: ['John Smith', 'Sarah Johnson'],
      progress: 100,
      estimatedHours: 40,
      actualHours: 38,
    },
    {
      id: '2',
      title: 'Regulatory Pathway Assessment',
      description: 'FDA/EMA pathway identification and regulatory strategy development',
      status: 'completed' as const,
      priority: 'critical' as const,
      dueDate: '2024-01-20',
      assignees: ['Dr. Michael Chen', 'Regulatory Team'],
      progress: 100,
      estimatedHours: 60,
      actualHours: 65,
    },
    {
      id: '3',
      title: 'Technical Feasibility Study',
      description: 'Assessment of technical requirements and implementation complexity',
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: '2024-01-25',
      assignees: ['Tech Lead', 'Architecture Team'],
      progress: 75,
      estimatedHours: 50,
      actualHours: 35,
    },
    {
      id: '4',
      title: 'Business Model Validation',
      description: 'Revenue model, pricing strategy, and financial projections',
      status: 'pending' as const,
      priority: 'high' as const,
      dueDate: '2024-01-30',
      assignees: ['Business Analyst', 'Finance Team'],
      progress: 0,
      estimatedHours: 30,
      actualHours: 0,
    },
    {
      id: '5',
      title: 'Stakeholder Alignment',
      description: 'Executive buy-in and resource allocation confirmation',
      status: 'pending' as const,
      priority: 'medium' as const,
      dueDate: '2024-02-05',
      assignees: ['Project Manager', 'Executive Team'],
      progress: 0,
      estimatedHours: 20,
      actualHours: 0,
    },
  ];

  const phaseProgress = 85;
  const completedMilestones = visionMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = visionMilestones.length;

  const visionMetrics = [
    {
      title: 'Market Size',
      value: '$2.4B',
      description: 'Total addressable market',
      trend: 'up' as const,
      change: '+15%',
    },
    {
      title: 'Regulatory Risk',
      value: 'Medium',
      description: '510(k) pathway identified',
      trend: 'neutral' as const,
      change: 'Stable',
    },
    {
      title: 'Technical Complexity',
      value: 'High',
      description: 'AI/ML components require validation',
      trend: 'down' as const,
      change: 'Mitigated',
    },
    {
      title: 'Timeline to Market',
      value: '18 months',
      description: 'Estimated development timeline',
      trend: 'up' as const,
      change: '+2 months',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-trust-blue/10">
            <Brain className="h-6 w-6 text-trust-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal">Vision Phase</h1>
            <p className="text-medical-gray">
              Define the product vision, market opportunity, and strategic approach
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-trust-blue/10 text-trust-blue">
          {phaseProgress}% Complete
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-trust-blue" />
            Phase Progress
          </CardTitle>
          <CardDescription>
            Track milestone completion and overall phase progress
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
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-clinical-green">{completedMilestones}</div>
                <div className="text-xs text-medical-gray">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-regulatory-gold">1</div>
                <div className="text-xs text-medical-gray">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-medical-gray">2</div>
                <div className="text-xs text-medical-gray">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-deep-charcoal">Milestones</h2>
            <Button variant="outline" size="sm">
              Add Milestone
            </Button>
          </div>

          {visionMilestones.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visionMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-deep-charcoal">
                      {metric.title}
                    </span>
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.trend === 'up' ? 'text-clinical-green' :
                      metric.trend === 'down' ? 'text-clinical-red' : 'text-medical-gray'
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

          {/* Phase Actions */}
          <PhaseActions
            phase="vision"
            actions={[
              { id: 'market-analysis', label: 'Run Market Analysis', icon: 'chart' },
              { id: 'regulatory-query', label: 'Ask Regulatory Expert', icon: 'help' },
              { id: 'feasibility-report', label: 'Generate Feasibility Report', icon: 'document' },
              { id: 'stakeholder-update', label: 'Send Stakeholder Update', icon: 'users' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}