'use client';

import {
  X,
  Brain,
  MessageSquare,
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
} from 'lucide-react';

import { AgentAvatar } from '@vital/ui/components/agent-avatar';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui/components/tabs';
import { type Agent, useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

interface AgentDetailsModalProps {
  agent: Agent;
  onClose: () => void;
  onEdit?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onStartChat?: (agent: Agent) => void;
}

export function AgentDetailsModal({
  agent,
  onClose,
  onEdit,
  onDuplicate,
  onStartChat,
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
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Star className="h-5 w-5 text-progress-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-deep-charcoal">Capabilities</p>
                        <p className="text-xs text-medical-gray">{agent.capabilities.length} skills</p>
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
                        <p className="text-sm font-medium text-deep-charcoal">Knowledge</p>
                        <p className="text-xs text-medical-gray">
                          {agent.ragEnabled ? 'Enabled' : 'Disabled'}
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
                          {domains.find(d => d.value === domain)?.label || domain}
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
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-deep-charcoal whitespace-pre-wrap">
                      {agent.systemPrompt || 'No system prompt configured.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills & Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.capabilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {agent.capabilities.map((capability) => (
                        <div
                          key={capability}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
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
                    <p className="text-sm text-medical-gray">
                      No specific capabilities defined.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tools */}
              {agent.tools && agent.tools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.tools.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
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
                        {agent.knowledgeUrls.map((url, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg text-sm text-deep-charcoal"
                          >
                            {url}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.knowledgeDomains && agent.knowledgeDomains.length > 0 && (
                    <div>
                      <h4 className="font-medium text-deep-charcoal mb-2">Accessible Domains</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.knowledgeDomains.map((domain) => (
                          <Badge
                            key={domain}
                            className={cn('border', getDomainColor(domain))}
                          >
                            {domains.find(d => d.value === domain)?.label || domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
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