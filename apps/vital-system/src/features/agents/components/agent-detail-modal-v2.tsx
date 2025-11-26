/**
 * Agent Detail Modal V2
 * Phase 1/2 aligned modal with AI enhancement features
 *
 * Features:
 * - Tabbed interface (Overview, Configuration, Spawning, AI Enhancement)
 * - Real-time AI suggestions for prompts, descriptions
 * - Spawning relationship visualization
 * - Edit capabilities
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { LevelBadge } from './level-badge';
import { useAgentStore, useSelectedAgent } from '../stores/agent-store';
import { agentApi } from '../services/agent-api';
import type { Agent, AgentWithRelationships } from '../types/agent.types';
import { getAgentLevelColor } from '../constants/design-tokens';
import {
  Sparkles,
  Zap,
  Building2,
  Briefcase,
  User,
  GitBranch,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
  Settings2,
  FileText,
  Brain,
  Bookmark,
  MessageSquarePlus,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AgentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onBookmark?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
}

interface AIEnhancement {
  type: 'description' | 'system_prompt' | 'capabilities';
  original: string;
  enhanced: string;
  reasoning: string;
  confidence: number;
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

const OverviewTab: React.FC<{ agent: Agent }> = ({ agent }) => {
  const levelConfig = agent.agent_levels?.level_number
    ? getAgentLevelColor(agent.agent_levels.level_number)
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: levelConfig?.base || 'transparent' }}
          >
            {agent.avatar_url ? (
              <Image
                src={agent.avatar_url}
                alt={agent.avatar_description || agent.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: levelConfig?.base }}
              >
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {agent.agent_levels && (
                <LevelBadge
                  level={agent.agent_levels.level_number}
                  showLabel
                  size="md"
                />
              )}
              <Badge
                variant={agent.status === 'active' ? 'default' : 'secondary'}
              >
                {agent.status}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
            {agent.tagline && (
              <p className="text-muted-foreground">{agent.tagline}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(agent.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {agent.description}
            </p>
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agent.function_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Function:</span>
                <span className="text-sm text-muted-foreground">
                  {agent.function_name}
                </span>
              </div>
            )}
            {agent.department_name && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Department:</span>
                <span className="text-sm text-muted-foreground">
                  {agent.department_name}
                </span>
              </div>
            )}
            {agent.role_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Role:</span>
                <span className="text-sm text-muted-foreground">
                  {agent.role_name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Base Model:</span>
                <p className="font-medium">{agent.base_model}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Temperature:</span>
                <p className="font-medium">{agent.temperature}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Tokens:</span>
                <p className="font-medium">{agent.max_tokens}</p>
              </div>
              {agent.communication_style && (
                <div>
                  <span className="text-muted-foreground">Style:</span>
                  <p className="font-medium">{agent.communication_style}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expertise Level */}
        {agent.expertise_level && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm">
                {agent.expertise_level}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// CONFIGURATION TAB
// ============================================================================

const ConfigurationTab: React.FC<{ agent: Agent }> = ({ agent }) => {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* System Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              System Prompt
            </CardTitle>
            <CardDescription>
              Core instructions that define agent behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            {agent.system_prompt ? (
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono">
                {agent.system_prompt}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No system prompt configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        {agent.metadata && Object.keys(agent.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(agent.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">
                {new Date(agent.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <p className="font-medium">
                {new Date(agent.updated_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// SPAWNING TAB
// ============================================================================

const SpawningTab: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [agentWithRelationships, setAgentWithRelationships] =
    React.useState<AgentWithRelationships | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const data = await agentApi.getAgentById(agent.id);
        setAgentWithRelationships(data);
      } catch (error) {
        console.error('Failed to fetch spawning relationships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, [agent.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canSpawn = agent.agent_levels?.can_spawn_lower_levels;
  const parentRelationships =
    agentWithRelationships?.spawning_relationships_parent || [];
  const childRelationships =
    agentWithRelationships?.spawning_relationships_child || [];

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Spawning Capability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Spawning Capability
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canSpawn ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  This agent can spawn lower-level agents
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This agent cannot spawn other agents
              </p>
            )}
          </CardContent>
        </Card>

        {/* Parent Agents */}
        {parentRelationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Agents</CardTitle>
              <CardDescription>
                Agents that can spawn this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {parentRelationships.length} parent agent(s)
              </p>
              {/* TODO: Display parent agent cards */}
            </CardContent>
          </Card>
        )}

        {/* Child Agents */}
        {childRelationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Child Agents</CardTitle>
              <CardDescription>
                Agents this agent can spawn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {childRelationships.length} child agent(s)
              </p>
              {/* TODO: Display child agent cards */}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {parentRelationships.length === 0 &&
          childRelationships.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No spawning relationships configured
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// AI ENHANCEMENT TAB
// ============================================================================

const AIEnhancementTab: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [enhancing, setEnhancing] = React.useState(false);
  const [enhancements, setEnhancements] = React.useState<AIEnhancement[]>([]);
  const [selectedType, setSelectedType] = React.useState<
    'description' | 'system_prompt' | 'capabilities'
  >('description');

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      // TODO: Integrate with AI enhancement API
      // For now, simulate AI enhancement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockEnhancement: AIEnhancement = {
        type: selectedType,
        original:
          selectedType === 'description'
            ? agent.description
            : agent.system_prompt || '',
        enhanced:
          selectedType === 'description'
            ? `${agent.description} [AI Enhanced: Added clarity and impact]`
            : `${agent.system_prompt} [AI Enhanced: Improved structure and precision]`,
        reasoning:
          'Enhanced clarity, added professional tone, improved structure',
        confidence: 0.89,
      };

      setEnhancements([mockEnhancement, ...enhancements]);
    } catch (error) {
      console.error('AI enhancement failed:', error);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Enhancement Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI Enhancement
            </CardTitle>
            <CardDescription>
              Use AI to improve agent descriptions, prompts, and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type Selector */}
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'description' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('description')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Description
              </Button>
              <Button
                variant={
                  selectedType === 'system_prompt' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedType('system_prompt')}
              >
                <Brain className="h-4 w-4 mr-2" />
                System Prompt
              </Button>
              <Button
                variant={
                  selectedType === 'capabilities' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedType('capabilities')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Capabilities
              </Button>
            </div>

            {/* Current Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current {selectedType.replace('_', ' ')}:
              </label>
              <Textarea
                value={
                  selectedType === 'description'
                    ? agent.description
                    : selectedType === 'system_prompt'
                    ? agent.system_prompt || 'No system prompt'
                    : 'No capabilities defined'
                }
                readOnly
                className="min-h-[100px] font-mono text-sm"
              />
            </div>

            {/* Enhance Button */}
            <Button
              onClick={handleEnhance}
              disabled={enhancing}
              className="w-full"
            >
              {enhancing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Enhancement Results */}
        {enhancements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enhancement Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enhancements.map((enhancement, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {enhancement.type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {Math.round(enhancement.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Enhanced Version:
                    </label>
                    <p className="text-sm mt-1 bg-background p-3 rounded border">
                      {enhancement.enhanced}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      AI Reasoning:
                    </label>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {enhancement.reasoning}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      Apply Enhancement
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  AI Enhancement Tips
                </p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Review AI suggestions carefully before applying</li>
                  <li>• Descriptions should be concise yet comprehensive</li>
                  <li>
                    • System prompts should be clear and unambiguous
                  </li>
                  <li>• Always maintain your agent's unique voice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onBookmark,
  onAddToChat,
}) => {
  const selectedAgent = useSelectedAgent();
  const selectAgent = useAgentStore((state) => state.selectAgent);

  const handleClose = () => {
    selectAgent(null);
    onOpenChange(false);
  };

  if (!selectedAgent) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Agent Details</DialogTitle>
          <DialogDescription>
            View and manage agent configuration
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="spawning">Spawning</TabsTrigger>
            <TabsTrigger value="ai-enhancement">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Enhancement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab agent={selectedAgent} />
          </TabsContent>

          <TabsContent value="configuration" className="mt-6">
            <ConfigurationTab agent={selectedAgent} />
          </TabsContent>

          <TabsContent value="spawning" className="mt-6">
            <SpawningTab agent={selectedAgent} />
          </TabsContent>

          <TabsContent value="ai-enhancement" className="mt-6">
            <AIEnhancementTab agent={selectedAgent} />
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex justify-between items-center">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(selectedAgent)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            {onBookmark && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBookmark(selectedAgent)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </Button>
            )}
            {onAddToChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddToChat(selectedAgent)}
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Add to Chat
              </Button>
            )}
            {onEdit && (
              <Button onClick={() => onEdit(selectedAgent)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Agent
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

AgentDetailModal.displayName = 'AgentDetailModal';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentDetailModal;
