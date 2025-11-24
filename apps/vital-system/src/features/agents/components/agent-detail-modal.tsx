'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  Settings2,
  BarChart3,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import type { ClientAgent } from '../types/agent-schema';

// ============================================================================
// Types
// ============================================================================

interface AgentDetailModalProps {
  agent: ClientAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (agent: ClientAgent) => void;
}

// ============================================================================
// Constants
// ============================================================================

const TIER_ICONS = {
  '1': Brain,
  '2': Sparkles,
  '3': Zap,
} as const;

const TIER_COLORS = {
  '1': 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-purple-50 text-purple-700 border-purple-200',
  '3': 'bg-amber-50 text-amber-700 border-amber-200',
} as const;

const STATUS_ICONS = {
  active: CheckCircle2,
  testing: AlertCircle,
  inactive: Clock,
} as const;

const STATUS_COLORS = {
  active: 'bg-green-50 text-green-700 border-green-200',
  testing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentDetailModal({
  agent,
  open,
  onOpenChange,
  onEdit,
}: AgentDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!agent) return null;

  const TierIcon = agent.tier ? TIER_ICONS[agent.tier] : Brain;
  const StatusIcon = STATUS_ICONS[agent.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2">
                {agent.avatar?.startsWith('/') ? (
                  <AvatarImage src={agent.avatar} alt={agent.display_name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {agent.avatar || getInitials(agent.display_name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 space-y-2">
                <DialogTitle className="text-2xl font-bold">
                  {agent.display_name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {agent.tagline}
                </DialogDescription>

                <div className="flex flex-wrap gap-2">
                  {agent.tier && (
                    <Badge
                      variant="outline"
                      className={TIER_COLORS[agent.tier]}
                    >
                      <TierIcon className="h-3 w-3 mr-1" />
                      {agent.tier_label}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={STATUS_COLORS[agent.status]}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </Badge>

                  <Badge variant="secondary" className="font-mono text-xs">
                    {agent.model}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(agent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Target className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="capabilities">
                <BookOpen className="h-4 w-4 mr-2" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="configuration">
                <Settings2 className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="px-6 py-4">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Knowledge Domains
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {agent.knowledge_domains && agent.knowledge_domains.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {agent.knowledge_domains.map((domain) => (
                            <Badge key={domain} variant="secondary">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No knowledge domains specified
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Domain Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {agent.domain_expertise && agent.domain_expertise.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(agent.domain_expertise) ? (
                            agent.domain_expertise.map((expertise) => (
                              <Badge key={expertise} variant="outline">
                                {expertise}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">{agent.domain_expertise}</Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No domain expertise specified
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Agent ID:</span>
                        <p className="font-mono text-xs mt-1">{agent.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Slug:</span>
                        <p className="font-mono text-xs mt-1">{agent.slug}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="mt-1">{formatDate(agent.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>
                        <p className="mt-1">{formatDate(agent.updated_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Capabilities Tab */}
              <TabsContent value="capabilities" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Core Capabilities</CardTitle>
                    <CardDescription>
                      What this agent can help you accomplish
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agent.capabilities && agent.capabilities.length > 0 ? (
                      <div className="space-y-3">
                        {agent.capabilities.map((capability, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{capability}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No capabilities specified
                      </p>
                    )}
                  </CardContent>
                </Card>

                {agent.system_prompt && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Prompt</CardTitle>
                      <CardDescription>
                        The instructions that guide this agent's behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                          {agent.system_prompt}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuration" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Model Configuration</CardTitle>
                    <CardDescription>
                      AI model settings and parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Model</label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {agent.model}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Temperature</label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {agent.temperature ?? 0.7}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Controls randomness
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Tokens</label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {agent.max_tokens ?? 2000}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Response length limit
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Context Window</label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {agent.context_window ?? 4000}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Input length limit
                          </span>
                        </div>
                      </div>
                    </div>

                    {agent.cost_per_query && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cost per Query</span>
                          <Badge variant="secondary" className="text-base">
                            ${agent.cost_per_query.toFixed(3)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(agent.model_justification || agent.model_citation) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Model Evidence</CardTitle>
                      <CardDescription>
                        Research-backed model selection
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {agent.model_justification && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Justification</label>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {agent.model_justification}
                          </p>
                        </div>
                      )}

                      {agent.model_citation && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Citation</label>
                          <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/50">
                            <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-mono leading-relaxed">
                              {agent.model_citation}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Analytics</CardTitle>
                    <CardDescription>
                      Performance metrics and usage statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
                        <p className="text-sm">Analytics coming soon</p>
                        <p className="text-xs">
                          Track queries, response times, and user satisfaction
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
