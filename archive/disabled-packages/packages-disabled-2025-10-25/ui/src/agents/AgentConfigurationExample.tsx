/**
 * AgentConfigurationExample - Example integration of capability registry
 * Shows how to use the new capability components in agent configuration
 */

'use client';

import { Settings, Zap, MessageSquare } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui';
import { DatabaseLibraryLoader } from '@/shared/services/utils/database-library-loader';

import { AgentCapabilitiesDisplay } from './AgentCapabilitiesDisplay';
import { CapabilitySelector } from './CapabilitySelector';

interface AgentConfigurationExampleProps {
  agentId?: string;
  agentName?: string;
  agentDisplayName?: string;
}

export const AgentConfigurationExample: React.FC<AgentConfigurationExampleProps> = ({
  agentId,
  agentName = 'fda-regulatory-strategist',
  agentDisplayName = 'FDA Regulatory Strategist'
}) => {
  const [capabilities, setCapabilities] = useState<unknown[]>([]);
  const [availableCapabilities, setAvailableCapabilities] = useState<unknown[]>([]);
  const [isLoadingCapabilities, setIsLoadingCapabilities] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [showCapabilitySelector, setShowCapabilitySelector] = useState(false);

  // Load agent's current capabilities
  useEffect(() => {
    loadAgentCapabilities();
  }, [agentName]);

    setIsLoadingCapabilities(true);
    try {

      setCapabilities(caps);
      // } catch (error) {
      // console.error('❌ Failed to load agent capabilities:', error);
    } finally {
      setIsLoadingCapabilities(false);
    }
  };

    setIsLoadingAvailable(true);
    try {

      setAvailableCapabilities(available);
      // } catch (error) {
      // console.error('❌ Failed to load available capabilities:', error);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

    await loadAvailableCapabilities();
    setShowCapabilitySelector(true);
  };

    capabilityId: string;
    proficiencyLevel: string;
    isPrimary: boolean;
  }>) => {
    // // In a real implementation, you would save these to the database
    // For now, just simulate the addition
    for (const selected of selectedCapabilities) {
      if (agentId) {
        try {
          await loader.addCapabilityToAgent(agentId, selected.capabilityId, selected.proficiencyLevel, selected.isPrimary);
        } catch (error) {
          // console.error('❌ Failed to add capability:', error);
        }
      }
    }

    // Reload capabilities to show the updates
    await loadAgentCapabilities();
  };

    // if (agentId) {
      try {
        await loader.removeCapabilityFromAgent(agentId, capabilityId);
        await loadAgentCapabilities();
      } catch (error) {
        // console.error('❌ Failed to remove capability:', error);
      }
    } else {
      // For demo purposes, just remove from local state
      setCapabilities(prev => prev.filter(cap => cap.capability_id !== capabilityId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Configuration</h1>
          <p className="text-muted-foreground">{agentDisplayName}</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Agent Settings
        </Button>
      </div>

      <Tabs defaultValue="capabilities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capabilities" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt Starters
          </TabsTrigger>
          <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities" className="space-y-6">
          {/* Capabilities Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Agent Capabilities
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Capabilities define what your agent can do. Each capability comes with detailed bullet points
                describing specific functions and expertise areas.
              </p>
            </CardHeader>
            <CardContent>
              <AgentCapabilitiesDisplay
                agentName={agentName}
                agentDisplayName={agentDisplayName}
                capabilities={capabilities}
                isLoading={isLoadingCapabilities}
                showAddCapability={true}
                onAddCapability={handleAddCapability}
                onRemoveCapability={handleRemoveCapability}
              />
            </CardContent>
          </Card>

          {/* Example Capability Detail */}
          {capabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Example: Rich Capability Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    {capabilities[0].icon} {capabilities[0].display_name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This capability provides concrete, actionable functionality:
                  </p>
                  <ul className="space-y-1">
                    {capabilities[0].bullet_points?.slice(0, 3).map((point: string, index: number) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span>{point.replace(/^•\s*/, '').trim()}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Proficiency:</strong> {capabilities[0].proficiency_level} •
                    <strong> Domain:</strong> {capabilities[0].domain} •
                    <strong> Complexity:</strong> {capabilities[0].complexity_level}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Starters</CardTitle>
              <p className="text-sm text-muted-foreground">
                Agent-specific prompt starters that fetch full prompts from the prompt library.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Prompt starters functionality is already implemented!</p>
                <p className="text-sm">See the main chat interface when an agent is selected.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-prompt">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>System prompt configuration interface would go here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Agent configuration settings would go here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capability Selector Modal */}
      <CapabilitySelector
        isOpen={showCapabilitySelector}
        onClose={() => setShowCapabilitySelector(false)}
        onSelect={handleCapabilitySelection}
        availableCapabilities={availableCapabilities}
        isLoading={isLoadingAvailable}
        selectedCapabilityIds={capabilities.map(cap => cap.capability_id)}
      />
    </div>
  );
};