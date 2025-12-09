/**
 * AgentInstantiationModal - Modal for instantiating an agent with context
 * 
 * Shown before starting a chat session. Allows user to:
 * 1. Select context (region, domain, TA, phase)
 * 2. Optionally override personality type
 * 3. Preview the configuration
 * 4. Start the session
 * 
 * Calls: POST /api/agents/sessions/instantiate
 * 
 * Reference: AGENT_VIEW_PRD_v4.md, AGENT_BACKEND_INTEGRATION_SPEC.md
 */

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  MessageSquare,
  Globe,
  Folder,
  Activity,
  Calendar,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Settings,
  Play,
  ChevronRight,
} from 'lucide-react';
import { LevelBadge } from './level-badge';
import {
  VitalAgentContextSelector,
  VitalPersonalityBadge,
  type SelectedContext,
  type PersonalitySlug,
} from '@/components/vital-ai-ui/agents';
import {
  useAgentContext,
  type InstantiatedAgent,
} from '@/components/vital-ai-ui/agents/useAgentContext';
import type { Agent } from '../types/agent.types';

// ============================================================================
// TYPES
// ============================================================================

interface AgentInstantiationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
  userId: string;
  tenantId: string;
  onStartChat: (instantiatedAgent: InstantiatedAgent) => void;
  onCancel?: () => void;
}

// ============================================================================
// CONTEXT PREVIEW
// ============================================================================

const ContextPreview: React.FC<{
  context: SelectedContext;
  regions: Array<{ id: string; code: string; name: string }>;
  domains: Array<{ id: string; code: string; name: string }>;
  therapeuticAreas: Array<{ id: string; code: string; name: string }>;
  phases: Array<{ id: string; code: string; name: string }>;
}> = ({ context, regions, domains, therapeuticAreas, phases }) => {
  const region = regions.find((r) => r.id === context.regionId);
  const domain = domains.find((d) => d.id === context.domainId);
  const ta = therapeuticAreas.find((t) => t.id === context.therapeuticAreaId);
  const phase = phases.find((p) => p.id === context.phaseId);

  const hasContext = region || domain || ta || phase;

  if (!hasContext) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No context selected - using defaults</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {region && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Region:</span>
          <Badge variant="outline">{region.name}</Badge>
        </div>
      )}
      {domain && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Folder className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Domain:</span>
          <Badge variant="outline">{domain.name}</Badge>
        </div>
      )}
      {ta && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Activity className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">Therapeutic Area:</span>
          <Badge variant="outline">{ta.name}</Badge>
        </div>
      )}
      {phase && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">Phase:</span>
          <Badge variant="outline">{phase.name}</Badge>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AgentInstantiationModal: React.FC<AgentInstantiationModalProps> = ({
  open,
  onOpenChange,
  agent,
  userId,
  tenantId,
  onStartChat,
  onCancel,
}) => {
  const {
    personalityTypes,
    regions,
    domains,
    therapeuticAreas,
    phases,
    isLoading: isLoadingContext,
    instantiateAgent,
  } = useAgentContext();

  const [selectedContext, setSelectedContext] = React.useState<SelectedContext>({});
  const [selectedPersonalityId, setSelectedPersonalityId] = React.useState<string | null>(
    (agent as any).personality_type_id || null
  );
  const [isInstantiating, setIsInstantiating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get current personality
  const currentPersonality = personalityTypes.find(
    (p) => p.id === (selectedPersonalityId || (agent as any).personality_type_id)
  );

  // Check if agent level supports conversation
  const isConversational = agent.agent_levels?.level_number 
    ? agent.agent_levels.level_number <= 3 
    : true;

  const handleStartChat = async () => {
    if (!isConversational) return;

    setIsInstantiating(true);
    setError(null);

    try {
      const instantiated = await instantiateAgent({
        agentId: agent.id,
        userId,
        tenantId,
        regionId: selectedContext.regionId,
        domainId: selectedContext.domainId,
        therapeuticAreaId: selectedContext.therapeuticAreaId,
        phaseId: selectedContext.phaseId,
        personalityTypeId: selectedPersonalityId || undefined,
        sessionMode: 'interactive',
      });

      onStartChat(instantiated);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
    } finally {
      setIsInstantiating(false);
    }
  };

  const handleClose = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            Start Chat Session
          </DialogTitle>
          <DialogDescription>
            Configure your session with{' '}
            <span className="font-medium">{agent.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agent Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{agent.name}</h3>
                    {agent.agent_levels && (
                      <LevelBadge
                        level={agent.agent_levels.level_number}
                        size="sm"
                        showLabel
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Non-conversational warning */}
          {!isConversational && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Available for Chat</AlertTitle>
              <AlertDescription>
                L4 Workers and L5 Tools are stateless utilities and cannot be
                used for interactive conversations. They are invoked automatically
                by higher-level agents.
              </AlertDescription>
            </Alert>
          )}

          {/* Context Configuration */}
          {isConversational && (
            <Accordion type="single" collapsible defaultValue="context">
              {/* Context Selection */}
              <AccordionItem value="context">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Session Context
                    {(selectedContext.regionId ||
                      selectedContext.domainId ||
                      selectedContext.therapeuticAreaId ||
                      selectedContext.phaseId) && (
                      <Badge variant="secondary" className="ml-2">
                        Configured
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Select context to personalize the agent's responses.
                      The agent's system prompt will be enhanced with this context.
                    </p>

                    <VitalAgentContextSelector
                      regions={regions}
                      domains={domains}
                      therapeuticAreas={therapeuticAreas}
                      phases={phases}
                      selectedContext={selectedContext}
                      onContextChange={setSelectedContext}
                      isLoading={isLoadingContext}
                      layout="grid"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Personality Override */}
              <AccordionItem value="personality">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Personality Type
                    {currentPersonality && (
                      <VitalPersonalityBadge
                        personality={currentPersonality.slug as PersonalitySlug}
                        variant="compact"
                        showTooltip={false}
                        className="ml-2"
                      />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Optionally override the agent's default personality for this session.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {personalityTypes
                        .filter((p) => p.is_active)
                        .slice(0, 6)
                        .map((personality) => (
                          <div
                            key={personality.id}
                            className={`
                              p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${
                                selectedPersonalityId === personality.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-transparent bg-muted/50 hover:bg-muted'
                              }
                            `}
                            onClick={() =>
                              setSelectedPersonalityId(
                                selectedPersonalityId === personality.id
                                  ? null
                                  : personality.id
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              <VitalPersonalityBadge
                                personality={personality.slug as PersonalitySlug}
                                variant="icon-only"
                                showTooltip={false}
                              />
                              <span className="text-sm font-medium">
                                {personality.display_name}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              T: {personality.temperature}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Preview */}
          {isConversational && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Session Configuration Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContextPreview
                  context={selectedContext}
                  regions={regions}
                  domains={domains}
                  therapeuticAreas={therapeuticAreas}
                  phases={phases}
                />

                {currentPersonality && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Personality:</span>
                      <VitalPersonalityBadge
                        personality={currentPersonality.slug as PersonalitySlug}
                        showTemperature
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartChat}
            disabled={!isConversational || isInstantiating}
          >
            {isInstantiating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Chat
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

AgentInstantiationModal.displayName = 'AgentInstantiationModal';

export default AgentInstantiationModal;
