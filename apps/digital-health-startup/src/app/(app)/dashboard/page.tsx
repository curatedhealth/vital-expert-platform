/**
 * Dashboard Page
 * Central hub for all 4 services with strategic and operational views
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@vital/ui';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import {
  MessageSquare,
  Users,
  GitBranch,
  Box,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Service Overview - 4 Main Services */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ask Expert Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
                  onClick={() => router.push('/ask-expert')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-10 h-10 text-blue-600" />
                  <Badge variant="secondary">Active</Badge>
                </div>
                <CardTitle className="mt-4">Ask Expert</CardTitle>
                <CardDescription>1:1 Expert Consultation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Chats</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Now</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-semibold">+12</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <Button className="w-full" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ask-expert');
                    }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ask Panel Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-500"
                  onClick={() => router.push('/ask-panel')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="w-10 h-10 text-purple-600" />
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    2 Running
                  </Badge>
                </div>
                <CardTitle className="mt-4">Ask Panel</CardTitle>
                <CardDescription>Multi-Expert Advisory Board</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Panels</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Running</span>
                    <span className="font-semibold text-amber-600">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Consensus</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <Button className="w-full" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push('/ask-panel');
                    }}>
                      <Users className="w-4 h-4 mr-2" />
                      New Panel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflows Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
                  onClick={() => router.push('/workflows')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <GitBranch className="w-10 h-10 text-green-600" />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    3 In Progress
                  </Badge>
                </div>
                <CardTitle className="mt-4">Workflows</CardTitle>
                <CardDescription>Guided Multi-Step Processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Workflows</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-blue-600">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Complete</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <Button className="w-full" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push('/workflows');
                    }}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Workflow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solution Builder Service */}
            <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-500"
                  onClick={() => router.push('/solution-builder')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Box className="w-10 h-10 text-orange-600" />
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    1 Draft
                  </Badge>
                </div>
                <CardTitle className="mt-4">Solution Builder</CardTitle>
                <CardDescription>Build Custom Solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Solutions</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">In Draft</span>
                    <span className="font-semibold text-purple-600">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-semibold">2</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <Button className="w-full" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      router.push('/solution-builder');
                    }}>
                      <Box className="w-4 h-4 mr-2" />
                      Build Solution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs for different views */}
        <section>
          <div className="border-b">
            <nav className="flex gap-4">
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
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Attention Required */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Needs Your Attention</h3>
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
                  <h3 className="text-xl font-semibold mb-4">Popular Workflows</h3>
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
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Expert Chat: FDA 510k pathway</h4>
                          <span className="text-sm text-muted-foreground">2 min ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Regulatory Expert responded
                        </p>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                          View Chat
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Panel Discussion: Primary endpoint</h4>
                            <span className="text-sm text-muted-foreground">15 min ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dr. Sarah Chen added response
                          </p>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            Join Discussion
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Workflow Completed: Competitive Analysis</h4>
                            <span className="text-sm text-muted-foreground">1 hour ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Report generated • 12 pages
                          </p>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Solution Published: Phase 2 Trial Design</h4>
                            <span className="text-sm text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ready to use
                          </p>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            View Solution
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/ask-expert')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
            <Button variant="outline" onClick={() => router.push('/ask-panel')}>
              <Users className="w-4 h-4 mr-2" />
              Start Panel
            </Button>
            <Button variant="outline" onClick={() => router.push('/workflows')}>
              <Play className="w-4 h-4 mr-2" />
              Run Workflow
            </Button>
            <Button variant="outline" onClick={() => router.push('/solution-builder')}>
              <Box className="w-4 h-4 mr-2" />
              Build Solution
            </Button>
            <Button variant="outline" onClick={() => router.push('/knowledge')}>
              <FileText className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
