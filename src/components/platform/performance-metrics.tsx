'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Zap,
  Shield,
  Users,
} from 'lucide-react';

const performanceMetrics = [
  {
    id: 'development_time',
    title: 'Development Time Reduction',
    current: 42,
    target: 40,
    unit: '%',
    trend: 'up' as const,
    change: '+2%',
    description: 'Compared to traditional development cycles',
    icon: Clock,
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
  },
  {
    id: 'regulatory_approval',
    title: 'Regulatory Approval Acceleration',
    current: 7.2,
    target: 8,
    unit: 'months',
    trend: 'up' as const,
    change: '+1.2 months',
    description: 'Faster pathway to FDA/EMA approval',
    icon: Shield,
    color: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
  },
  {
    id: 'team_productivity',
    title: 'Team Productivity',
    current: 89,
    target: 85,
    unit: '%',
    trend: 'up' as const,
    change: '+4%',
    description: 'Based on milestone completion rates',
    icon: Users,
    color: 'text-progress-teal',
    bgColor: 'bg-progress-teal/10',
  },
  {
    id: 'compliance_score',
    title: 'Compliance Score',
    current: 96,
    target: 95,
    unit: '%',
    trend: 'up' as const,
    change: '+1%',
    description: 'HIPAA, FDA, and EMA compliance metrics',
    icon: Target,
    color: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
  },
];

const phaseEfficiencyMetrics = [
  {
    phase: 'Vision',
    avgTime: '12 days',
    efficiency: 94,
    color: 'bg-trust-blue',
    projects: 8,
  },
  {
    phase: 'Integrate',
    avgTime: '28 days',
    efficiency: 87,
    color: 'bg-progress-teal',
    projects: 5,
  },
  {
    phase: 'Test',
    avgTime: '45 days',
    efficiency: 82,
    color: 'bg-clinical-green',
    projects: 3,
  },
  {
    phase: 'Activate',
    avgTime: '35 days',
    efficiency: 78,
    color: 'bg-regulatory-gold',
    projects: 2,
  },
  {
    phase: 'Learn',
    avgTime: '21 days',
    efficiency: 91,
    color: 'bg-market-purple',
    projects: 1,
  },
];

export function PerformanceMetrics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Performance Indicators */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-trust-blue" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Track key performance indicators for your digital health transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric) => {
                const MetricIcon = metric.icon;
                const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
                const trendColor = metric.trend === 'up' ? 'text-clinical-green' : 'text-clinical-red';
                const progressValue = (metric.current / metric.target) * 100;

                return (
                  <div key={metric.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                          <MetricIcon className={`h-4 w-4 ${metric.color}`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-deep-charcoal">
                            {metric.title}
                          </h3>
                          <p className="text-xs text-medical-gray">
                            {metric.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-deep-charcoal">
                          {metric.current}{metric.unit}
                        </span>
                        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                          <TrendIcon className="h-3 w-3" />
                          {metric.change}
                        </div>
                      </div>
                      <Progress value={Math.min(progressValue, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-medical-gray">
                        <span>Current</span>
                        <span>Target: {metric.target}{metric.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-regulatory-gold" />
            Phase Efficiency
          </CardTitle>
          <CardDescription>
            VITAL Framework phase completion metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phaseEfficiencyMetrics.map((phase) => (
              <div key={phase.phase} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                    <span className="font-medium text-sm text-deep-charcoal">
                      {phase.phase}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {phase.projects} projects
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-medical-gray">
                  <span>Avg: {phase.avgTime}</span>
                  <span>{phase.efficiency}% efficient</span>
                </div>

                <Progress value={phase.efficiency} className="h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-background-gray rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-clinical-green" />
              <span className="font-medium text-sm text-deep-charcoal">
                Overall Efficiency
              </span>
            </div>
            <div className="text-lg font-bold text-clinical-green">87.4%</div>
            <div className="text-xs text-medical-gray">
              +5.2% improvement this quarter
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}