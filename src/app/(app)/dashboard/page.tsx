'use client';

import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Target,
  TestTube,
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { ClientAuthWrapper } from '@/components/auth/client-auth-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VitalPageLayout, VitalCard, VitalStatsCard } from '@/components/layout/vital-page-layout';

const vitalPhases = [
  {
    name: 'Vision',
    icon: Brain,
    progress: 85,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'Strategic planning and market analysis',
  },
  {
    name: 'Intelligence',
    icon: Target,
    progress: 65,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    description: 'AI integration and smart development',
  },
  {
    name: 'Trials',
    icon: TestTube,
    progress: 40,
    color: 'text-success',
    bgColor: 'bg-success/10',
    description: 'Clinical trials and validation',
  },
  {
    name: 'Activation',
    icon: Play,
    progress: 20,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    description: 'Market deployment and launch',
  },
  {
    name: 'Learning',
    icon: BookOpen,
    progress: 10,
    color: 'text-info',
    bgColor: 'bg-info/10',
    description: 'Continuous learning and optimization',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'project',
    title: 'Digital Therapeutics Platform updated',
    description: 'Clinical trial design completed',
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: 2,
    type: 'chat',
    title: 'AI Consultation with Regulatory Expert',
    description: 'FDA pathway discussion',
    time: '4 hours ago',
    icon: MessageSquare,
    color: 'text-primary',
  },
  {
    id: 3,
    type: 'document',
    title: 'New regulatory document uploaded',
    description: '510(k) submission guidelines',
    time: '1 day ago',
    icon: FileText,
    color: 'text-muted-foreground',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Milestone deadline approaching',
    description: 'Clinical validation due in 5 days',
    time: '2 days ago',
    icon: AlertTriangle,
    color: 'text-warning',
  },
];

function DashboardPageContent() {
  return (
    <VitalPageLayout
      title="Dashboard"
      description="Your comprehensive healthcare technology development platform"
      badge="VITAL Path v3.0"
    >
      <div className="space-y-8">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Platform
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to VITAL Path
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Transform your healthcare innovation with 200+ AI agents and proven frameworks
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <VitalStatsCard
            title="Active Projects"
            value="3"
            description="Healthcare solutions in development"
            icon={<BarChart3 className="h-8 w-8" />}
            trend={{ value: 50, label: "from last month", positive: true }}
          />
          <VitalStatsCard
            title="Team Members"
            value="12"
            description="Cross-functional healthcare team"
            icon={<Users className="h-8 w-8" />}
            trend={{ value: 20, label: "active this week", positive: true }}
          />
          <VitalStatsCard
            title="AI Consultations"
            value="47"
            description="Expert AI agent interactions"
            icon={<MessageSquare className="h-8 w-8" />}
            trend={{ value: 34, label: "this week", positive: true }}
          />
          <VitalStatsCard
            title="Documents"
            value="28"
            description="Regulatory and clinical docs"
            icon={<FileText className="h-8 w-8" />}
            trend={{ value: 25, label: "approved this week", positive: true }}
          />
        </div>

        {/* VITAL Framework Progress */}
        <VitalCard
          title="VITAL Framework Progress"
          description="Track your journey through the proven VITAL methodology"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {vitalPhases.map((phase) => (
              <div key={phase.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${phase.bgColor}`}>
                      <phase.icon className={`h-4 w-4 ${phase.color}`} />
                    </div>
                    <span className="font-medium text-sm">{phase.name}</span>
                  </div>
                  <span className="text-sm font-medium">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{phase.description}</p>
              </div>
            ))}
          </div>
        </VitalCard>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <VitalCard
            title="Recent Activity"
            description="Latest updates from your healthcare projects"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </VitalCard>

          <VitalCard
            title="Quick Actions"
            description="Jumpstart your healthcare innovation"
          >
            <div className="space-y-3">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start AI Consultation
              </Button>
              <Link href="/knowledge">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </VitalCard>
        </div>
      </div>
    </VitalPageLayout>
  );
}

export default function DashboardPage() {
  return (
    <ClientAuthWrapper requireAuth={true}>
      <DashboardPageContent />
    </ClientAuthWrapper>
  );
}
