/**
 * Dashboard Page
 * Central hub for all 4 services with strategic and operational views
 *
 * Brand: "Human Genius, Amplified"
 * Design System: VITAL Brand Guidelines v6.0
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@vital/ui';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { PageHeader } from '@/components/page-header';
import {
  MessageSquare,
  Users,
  GitBranch,
  Box,
  Play,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  BarChart3,
  ArrowRight,
  Brain,
  Network,
  Cog,
} from 'lucide-react';
import { BRAND_MESSAGING, VALUE_CYCLE } from '@/lib/brand/brand-tokens';

// Map icon names to Lucide components for VALUE_CYCLE
const VALUE_ICONS: Record<string, typeof Brain> = {
  Brain,
  Network,
  Cog,
  TrendingUp,
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAF9]">
      {/* Hero Section - Brand Messaging */}
      <section className="border-b border-stone-200 bg-gradient-to-r from-vital-primary-50 to-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-stone-800 mb-2">
                {BRAND_MESSAGING.tagline}
              </h1>
              <p className="text-stone-600 max-w-xl">
                {BRAND_MESSAGING.philosophy}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              {VALUE_CYCLE.map((item) => {
                const Icon = VALUE_ICONS[item.icon] || Brain;
                return (
                  <div key={item.id} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-vital-primary-100 flex items-center justify-center mb-2">
                      <Icon size={20} className="text-vital-primary-600" />
                    </div>
                    <span className="text-xs font-semibold text-vital-primary-600">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title="Dashboard"
        description="Overview of your services and recent activity"
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Service Overview - 4 Main Services */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ask Expert Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push('/ask-expert')}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Ask Expert</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm mb-4">
                  1:1 Expert Consultation
                </CardDescription>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                  <Badge variant="outline" className="text-xs">47 chats</Badge>
                  <Badge variant="outline" className="text-xs text-green-600">3 active</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    +12 this week
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ask-expert');
                    }}
                  >
                    Start Chat
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ask Panel Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push('/ask-panel')}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Ask Panel</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm mb-4">
                  Multi-Expert Advisory Board
                </CardDescription>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                    2 Running
                  </Badge>
                  <Badge variant="outline" className="text-xs">12 panels</Badge>
                  <Badge variant="outline" className="text-xs">87% consensus</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    Click to view all
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ask-panel');
                    }}
                  >
                    New Panel
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Workflows Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push('/workflows')}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Workflows</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm mb-4">
                  Guided Multi-Step Processes
                </CardDescription>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    3 In Progress
                  </Badge>
                  <Badge variant="outline" className="text-xs">8 workflows</Badge>
                  <Badge variant="outline" className="text-xs">85% complete</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    Click to view all
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/workflows');
                    }}
                  >
                    Start
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Solution Builder Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push('/solution-builder')}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Box className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Solution Builder</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm mb-4">
                  Build Custom Solutions
                </CardDescription>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    1 Draft
                  </Badge>
                  <Badge variant="outline" className="text-xs">3 solutions</Badge>
                  <Badge variant="outline" className="text-xs">2 published</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    Click to view all
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/solution-builder');
                    }}
                  >
                    Build
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs for different views */}
        <section>
          <Card>
            <CardHeader className="pb-0">
              <nav className="flex gap-4 border-b -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Recent Activity
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'insights'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Insights
                </button>
              </nav>
            </CardHeader>

          {/* Tab Content */}
          <CardContent className="pt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Attention Required */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Needs Your Attention</h3>
                  <div className="space-y-3">
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">Panel: Biomarker Selection</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  4 of 5 experts responded • Consensus: 78%
                                </p>
                              </div>
                              <Badge variant="outline">High Priority</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3"
                                    onClick={() => router.push('/ask-panel')}>
                              View Discussion
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">Workflow: Target Product Profile</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Step 5 of 7 paused • Awaiting your input
                                </p>
                              </div>
                              <Badge variant="outline">Action Required</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3"
                                    onClick={() => router.push('/workflows')}>
                              Continue Workflow
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">Expert Chat: Regulatory Strategy</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Waiting for expert response • 15 minutes ago
                                </p>
                              </div>
                              <Badge variant="outline">Medium Priority</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3"
                                    onClick={() => router.push('/ask-expert')}>
                              View Chat
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Start */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Popular Workflows</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Target Product Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          7 steps • 2 hours average • Used 24 times
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Start Workflow
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          Endpoint Selection
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          5 steps • 1.5 hours average • Used 18 times
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Start Workflow
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          Protocol Design
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          9 steps • 3 hours average • Used 15 times
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Start Workflow
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm mb-4">Your recent activity across all services</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Expert Chat: FDA 510k pathway</h4>
                        <span className="text-xs text-muted-foreground">2 min ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Regulatory Expert responded
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        View Chat
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Panel Discussion: Primary endpoint</h4>
                        <span className="text-xs text-muted-foreground">15 min ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dr. Sarah Chen added response
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        Join Discussion
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Workflow Completed: Competitive Analysis</h4>
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Report generated • 12 pages
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        Download Report
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Solution Published: Phase 2 Trial Design</h4>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ready to use
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        View Solution
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Expert Consultations</span>
                        <span className="font-semibold">+12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Panels Created</span>
                        <span className="font-semibold">+5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Workflows Completed</span>
                        <span className="font-semibold">+3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Time Saved</span>
                        <span className="font-semibold text-green-600">24 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Service Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Ask Expert</span>
                          <span className="text-sm font-semibold">47 chats</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full">
                          <div className="h-2 bg-blue-600 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Ask Panel</span>
                          <span className="text-sm font-semibold">12 panels</span>
                        </div>
                        <div className="h-2 bg-purple-100 rounded-full">
                          <div className="h-2 bg-purple-600 rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Workflows</span>
                          <span className="text-sm font-semibold">8 workflows</span>
                        </div>
                        <div className="h-2 bg-green-100 rounded-full">
                          <div className="h-2 bg-green-600 rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Solutions</span>
                          <span className="text-sm font-semibold">3 solutions</span>
                        </div>
                        <div className="h-2 bg-orange-100 rounded-full">
                          <div className="h-2 bg-orange-600 rounded-full" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
          </Card>
        </section>
        </div>
      </div>
    </div>
  );
}
