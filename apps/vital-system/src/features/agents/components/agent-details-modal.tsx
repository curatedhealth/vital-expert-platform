'use client';

import {
  X,
  Brain,
  MessageSquare,
  MessageSquarePlus,
  Database,
  Star,
  Thermometer,
  Hash,
  Edit,
  Copy,
  Heart,
  Play,
  Building2,
  Briefcase,
  UserCircle,
  Network,
  Wrench,
  Lightbulb,
  CheckCircle,
  Target,
  Sparkles,
} from 'lucide-react';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { type Agent, useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';
import { KnowledgeGraphVisualization } from './knowledge-graph-view';

interface AgentDetailsModalProps {
  agent: Agent;
  onClose: () => void;
  onEdit?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onStartChat?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
}

export function AgentDetailsModal({
  agent,
  onClose,
  onEdit,
  onDuplicate,
  onStartChat,
  onAddToChat,
}: AgentDetailsModalProps) {
  const { createCustomAgent } = useChatStore();

  // Filter options for display
  const domains = [
    { value: 'digital-health', label: 'Digital Health' },
    { value: 'clinical-research', label: 'Clinical Research' },
    { value: 'market-access', label: 'Market Access' },
    { value: 'regulatory', label: 'Regulatory' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'health-economics', label: 'Health Economics' },
  ];

  const getDomainColor = (domain: string) => {
    const colors = {
      'digital-health': 'bg-trust-blue/10 text-trust-blue border-trust-blue/20',
      'clinical-research': 'bg-progress-teal/10 text-progress-teal border-progress-teal/20',
      'market-access': 'bg-market-purple/10 text-market-purple border-market-purple/20',
      'regulatory': 'bg-clinical-green/10 text-clinical-green border-clinical-green/20',
      'quality-assurance': 'bg-amber-100 text-amber-800 border-amber-200',
      'health-economics': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[domain as keyof typeof colors] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  const getProficiencyColor = (level?: string) => {
    switch (level) {
      case 'expert':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'proficient':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'familiar':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  // Get enriched data or fallback to simple arrays
  const enrichedCapabilities = (agent as any).enriched_capabilities || [];
  const enrichedSkills = (agent as any).enriched_skills || [];
  const responsibilities = (agent as any).responsibilities || [];
  const promptStarters = (agent as any).prompt_starters || [];
  const assignedTools = (agent as any).assigned_tools || [];
  const enrichedKnowledgeDomains = (agent as any).enriched_knowledge_domains || [];

  // Helper to check if we have enriched data
  const hasEnrichedData = enrichedCapabilities.length > 0 || enrichedSkills.length > 0 || responsibilities.length > 0;

  const handleDuplicate = () => {
    const duplicatedAgent: Agent = {
      ...agent,
      id: `${agent.id}-copy-${Date.now()}`,
      name: `${agent.name} (Copy)`,
      isCustom: true,
    };
    createCustomAgent(duplicatedAgent);
    if (onDuplicate) onDuplicate(duplicatedAgent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-canvas-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <AgentAvatar agent={agent} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-deep-charcoal">
                  {agent.name}
                </h2>
                {agent.isCustom && (
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                )}
              </div>
              <p className="text-sm text-medical-gray mt-1">
                {agent.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onStartChat && (
              <Button
                onClick={() => onStartChat(agent)}
                className="bg-progress-teal hover:bg-progress-teal/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="graph">
                <Network className="w-4 h-4 mr-2" />
                Knowledge Graph
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-trust-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Model</p>
                        <p className="text-xs text-medical-gray">{agent.model}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-progress-teal/10 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-progress-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Capabilities</p>
                        <p className="text-xs text-medical-gray">
                          {enrichedCapabilities.length > 0
                            ? `${enrichedCapabilities.length} assigned`
                            : agent.capabilities?.length > 0
                              ? `${agent.capabilities.length} listed`
                              : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-market-purple/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-market-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Skills</p>
                        <p className="text-xs text-medical-gray">
                          {enrichedSkills.length > 0
                            ? `${enrichedSkills.length} assigned`
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-clinical-green/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-clinical-green" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Responsibilities</p>
                        <p className="text-xs text-medical-gray">
                          {responsibilities.length > 0
                            ? `${responsibilities.length} assigned`
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-trust-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Tools</p>
                        <p className="text-xs text-medical-gray">
                          {assignedTools.length > 0
                            ? `${assignedTools.length} available`
                            : agent.tools?.length > 0
                              ? `${agent.tools.length} available`
                              : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Prompt Starters</p>
                        <p className="text-xs text-medical-gray">
                          {promptStarters.length > 0
                            ? `${promptStarters.length} available`
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-market-purple/10 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-market-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Knowledge Domains</p>
                        <p className="text-xs text-medical-gray">
                          {enrichedKnowledgeDomains.length > 0
                            ? `${enrichedKnowledgeDomains.length} domains`
                            : agent.ragEnabled
                              ? 'RAG Enabled'
                              : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organizational Structure */}
              {(agent.businessFunction || agent.department || agent.organizationalRole) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organizational Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {agent.businessFunction && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-clinical-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-5 w-5 text-clinical-green" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-medical-gray mb-1">Business Function</p>
                            <p className="text-sm text-deep-charcoal font-medium">{agent.businessFunction}</p>
                          </div>
                        </div>
                      )}
                      {agent.department && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-trust-blue" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-medical-gray mb-1">Department</p>
                            <p className="text-sm text-deep-charcoal font-medium">{agent.department}</p>
                          </div>
                        </div>
                      )}
                      {agent.organizationalRole && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-market-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-5 w-5 text-market-purple" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-medical-gray mb-1">Role</p>
                            <p className="text-sm text-deep-charcoal font-medium">{agent.organizationalRole}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Knowledge Domains */}
              {agent.knowledgeDomains && agent.knowledgeDomains.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Knowledge Domains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.knowledgeDomains.map((domain) => (
                        <Badge
                          key={domain}
                          className={cn('border', getDomainColor(domain))}
                        >
                          {domains.find((d: any) => d.value === domain)?.label || domain}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* System Prompt Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-neutral-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-deep-charcoal whitespace-pre-wrap">
                      {agent.systemPrompt || 'No system prompt configured.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              {/* Enriched Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-progress-teal" />
                    Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrichedCapabilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {enrichedCapabilities.map((ec: any) => (
                        <div
                          key={ec.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-progress-teal/10 rounded-lg flex items-center justify-center">
                              <Target className="h-4 w-4 text-progress-teal" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-deep-charcoal">
                                {ec.capability?.name || 'Unknown'}
                              </span>
                              {ec.capability?.category && (
                                <p className="text-xs text-medical-gray">{ec.capability.category}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {ec.is_primary && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                Primary
                              </Badge>
                            )}
                            {ec.proficiency_level && (
                              <Badge variant="outline" className={cn('text-xs capitalize', getProficiencyColor(ec.proficiency_level))}>
                                {ec.proficiency_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : agent.capabilities && agent.capabilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {agent.capabilities.map((capability: string) => (
                        <div
                          key={capability}
                          className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-progress-teal/10 rounded-lg flex items-center justify-center">
                            <Star className="h-4 w-4 text-progress-teal" />
                          </div>
                          <span className="text-sm font-medium text-deep-charcoal">
                            {capability}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-medical-gray">No capabilities defined.</p>
                  )}
                </CardContent>
              </Card>

              {/* Enriched Skills */}
              {enrichedSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-market-purple" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {enrichedSkills.map((es: any) => (
                        <div
                          key={es.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-market-purple/10 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-market-purple" />
                            </div>
                            <span className="text-sm font-medium text-deep-charcoal">
                              {es.skill?.name || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {es.is_primary && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                Primary
                              </Badge>
                            )}
                            {es.proficiency_level && (
                              <Badge variant="outline" className={cn('text-xs capitalize', getProficiencyColor(es.proficiency_level))}>
                                {es.proficiency_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Responsibilities */}
              {responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-clinical-green" />
                      Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {responsibilities.map((r: any) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-clinical-green/10 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-clinical-green" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-deep-charcoal">
                                {r.responsibility?.name || 'Unknown'}
                              </span>
                              {r.responsibility?.description && (
                                <p className="text-xs text-medical-gray line-clamp-1">
                                  {r.responsibility.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.is_primary && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                Primary
                              </Badge>
                            )}
                            {r.weight && (
                              <Badge variant="outline" className="text-xs">
                                Weight: {Math.round(r.weight * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tools */}
              {(assignedTools.length > 0 || (agent.tools && agent.tools.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-trust-blue" />
                      Available Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assignedTools.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignedTools.map((at: any) => (
                          <div
                            key={at.id}
                            className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-trust-blue" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-deep-charcoal">
                                  {at.tool?.name || 'Unknown'}
                                </span>
                                {at.tool?.tool_type && (
                                  <p className="text-xs text-medical-gray">{at.tool.tool_type}</p>
                                )}
                              </div>
                            </div>
                            {at.priority && (
                              <Badge variant="outline" className="text-xs">
                                Priority: {at.priority}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {agent.tools?.map((tool: string) => (
                          <Badge key={tool} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Prompt Starters */}
              {promptStarters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Prompt Starters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {promptStarters.map((ps: any) => (
                        <div
                          key={ps.id}
                          className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100"
                        >
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-lg">
                            {ps.icon || '💡'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-deep-charcoal">{ps.text}</p>
                            {ps.category && (
                              <p className="text-xs text-medical-gray mt-1">Category: {ps.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Base Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-market-purple" />
                    <span className="font-medium">
                      RAG Enabled: {agent.ragEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {agent.knowledgeUrls && agent.knowledgeUrls.length > 0 && (
                    <div>
                      <h4 className="font-medium text-deep-charcoal mb-2">Knowledge Sources</h4>
                      <div className="space-y-2">
                        {agent.knowledgeUrls.map((url: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-neutral-50 rounded-lg text-sm text-deep-charcoal"
                          >
                            {url}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enriched Knowledge Domains */}
                  {enrichedKnowledgeDomains.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-deep-charcoal mb-2">Knowledge Domains</h4>
                      <div className="space-y-2">
                        {enrichedKnowledgeDomains.map((kd: any) => (
                          <div
                            key={kd.id}
                            className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-market-purple/10 rounded-lg flex items-center justify-center">
                                <Database className="h-4 w-4 text-market-purple" />
                              </div>
                              <span className="text-sm font-medium text-deep-charcoal">
                                {kd.domain_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {kd.is_primary_domain && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                  Primary
                                </Badge>
                              )}
                              {kd.proficiency_level && (
                                <Badge variant="outline" className={cn('text-xs capitalize', getProficiencyColor(kd.proficiency_level))}>
                                  {kd.proficiency_level}
                                </Badge>
                              )}
                              {kd.expertise_level && (
                                <Badge variant="outline" className="text-xs">
                                  {kd.expertise_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : agent.knowledgeDomains && agent.knowledgeDomains.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-deep-charcoal mb-2">Accessible Domains</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.knowledgeDomains.map((domain: string) => (
                          <Badge
                            key={domain}
                            className={cn('border', getDomainColor(domain))}
                          >
                            {domains.find((d: any) => d.value === domain)?.label || domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Knowledge Graph Tab */}
            <TabsContent value="graph" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-blue-600" />
                    Knowledge Graph Visualization
                  </CardTitle>
                  <p className="text-sm text-neutral-500 mt-2">
                    Interactive visualization of this agent's knowledge graph using Neo4j, Pinecone, and Supabase.
                    Explore relationships, skills, tools, and connected knowledge domains.
                  </p>
                </CardHeader>
                <CardContent>
                  <KnowledgeGraphVisualization
                    agentId={agent.id}
                    height="700px"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Model Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-trust-blue" />
                      <div>
                        <p className="font-medium text-deep-charcoal">Model</p>
                        <p className="text-sm text-medical-gray">{agent.model}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Thermometer className="h-5 w-5 text-progress-teal" />
                      <div>
                        <p className="font-medium text-deep-charcoal">Temperature</p>
                        <p className="text-sm text-medical-gray">{agent.temperature}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-market-purple" />
                      <div>
                        <p className="font-medium text-deep-charcoal">Max Tokens</p>
                        <p className="text-sm text-medical-gray">{agent.maxTokens}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agent Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-deep-charcoal">Agent ID</p>
                      <p className="text-sm text-medical-gray font-mono">{agent.id}</p>
                    </div>

                    <div>
                      <p className="font-medium text-deep-charcoal">Type</p>
                      <p className="text-sm text-medical-gray">
                        {agent.isCustom ? 'Custom Agent' : 'Default Agent'}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-deep-charcoal">Color Theme</p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: agent.color }}
                        />
                        <span className="text-sm text-medical-gray">{agent.color}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Save to Library
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(agent)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onAddToChat && (
              <Button
                variant="outline"
                onClick={() => {
                  onAddToChat(agent);
                  onClose();
                }}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Add to Chat
              </Button>
            )}
            {onStartChat && (
              <Button
                onClick={() => onStartChat(agent)}
                className="bg-progress-teal hover:bg-progress-teal/90"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}