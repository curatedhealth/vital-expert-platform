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
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';

const vitalPhases = [
  {
    name: 'Vision',
    icon: Brain,
    progress: 85,
    color: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
    description: 'Strategic planning and market analysis',
  },
  {
    name: 'Intelligence',
    icon: Target,
    progress: 65,
    color: 'text-progress-teal',
    bgColor: 'bg-progress-teal/10',
    description: 'AI integration and smart development',
  },
  {
    name: 'Trials',
    icon: TestTube,
    progress: 40,
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
    description: 'Clinical trials and validation',
  },
  {
    name: 'Activation',
    icon: Play,
    progress: 20,
    color: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
    description: 'Market deployment and launch',
  },
  {
    name: 'Learning',
    icon: BookOpen,
    progress: 10,
    color: 'text-market-purple',
    bgColor: 'bg-market-purple/10',
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
    color: 'text-clinical-green',
  },
  {
    id: 2,
    type: 'chat',
    title: 'AI Consultation with Regulatory Expert',
    description: 'FDA pathway discussion',
    time: '4 hours ago',
    icon: MessageSquare,
    color: 'text-trust-blue',
  },
  {
    id: 3,
    type: 'document',
    title: 'New regulatory document uploaded',
    description: '510(k) submission guidelines',
    time: '1 day ago',
    icon: FileText,
    color: 'text-medical-gray',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Milestone deadline approaching',
    description: 'Clinical validation due in 5 days',
    time: '2 days ago',
    icon: AlertTriangle,
    color: 'text-regulatory-gold',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-trust-blue to-progress-teal rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to VITALpath</h1>
        <p className="text-trust-blue-light text-lg">
          Your comprehensive healthcare technology development platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Active Projects</p>
                <p className="text-2xl font-bold text-deep-charcoal">3</p>
              </div>
              <div className="h-8 w-8 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-trust-blue" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-clinical-green mr-1" />
              <span className="text-clinical-green">+2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Team Members</p>
                <p className="text-2xl font-bold text-deep-charcoal">12</p>
              </div>
              <div className="h-8 w-8 bg-progress-teal/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-progress-teal" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="h-4 w-4 text-medical-gray mr-1" />
              <span className="text-medical-gray">8 active this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Documents</p>
                <p className="text-2xl font-bold text-deep-charcoal">28</p>
              </div>
              <div className="h-8 w-8 bg-clinical-green/10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-clinical-green" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-clinical-green mr-1" />
              <span className="text-clinical-green">5 approved this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">AI Consultations</p>
                <p className="text-2xl font-bold text-deep-charcoal">47</p>
              </div>
              <div className="h-8 w-8 bg-market-purple/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-market-purple" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-clinical-green mr-1" />
              <span className="text-clinical-green">+12 this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VITAL Framework Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-trust-blue" />
            VITAL Framework Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <p className="text-xs text-medical-gray">{phase.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-deep-charcoal">
                      {activity.title}
                    </p>
                    <p className="text-sm text-medical-gray">
                      {activity.description}
                    </p>
                    <p className="text-xs text-medical-gray">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-trust-blue hover:bg-trust-blue/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start AI Consultation
            </Button>
            <Link href="/dashboard/knowledge">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
