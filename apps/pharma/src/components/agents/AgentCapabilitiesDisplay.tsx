/**
 * AgentCapabilitiesDisplay - Rich display of agent capabilities from registry
 * Shows detailed capabilities with bullet points and descriptions
 */

'use client';

import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  Plus,
  X
} from 'lucide-react';
import React, { useState } from 'react';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui';
import { cn } from '@/shared/services/utils';

interface Capability {
  capability_id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  domain: string;
  complexity_level: string;
  proficiency_level: string;
  is_primary: boolean;
  icon: string;
  color: string;
  bullet_points: string[];
}

interface AgentCapabilitiesDisplayProps {
  agentName: string;
  agentDisplayName?: string;
  capabilities?: Capability[];
  isLoading?: boolean;
  showAddCapability?: boolean;
  onAddCapability?: () => void;
  onRemoveCapability?: (capabilityId: string) => void;
  className?: string;
}

const complexityLevelStyles: Record<string, string> = {
  basic: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200',
  expert: 'bg-red-100 text-red-800 border-red-200'
};

const proficiencyLevelStyles: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-emerald-100 text-emerald-800'
};

export const AgentCapabilitiesDisplay: React.FC<AgentCapabilitiesDisplayProps> = ({
  agentName,
  agentDisplayName,
  capabilities = [],
  isLoading = false,
  showAddCapability = false,
  onAddCapability,
  onRemoveCapability,
  className
}) => {
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());

  // Group capabilities by category using Map for safer access
  const capabilitiesByCategoryMap = new Map<string, Capability[]>();
  
  capabilities.forEach(capability => {
    const category = capability.category || 'general';
    // Validate category to prevent object injection
    if (typeof category !== 'string' || category.length === 0) {
      return;
    }
    
    if (!capabilitiesByCategoryMap.has(category)) {
      capabilitiesByCategoryMap.set(category, []);
    }
    capabilitiesByCategoryMap.get(category)!.push(capability);
  });
  
  // Convert to object for compatibility

  // Sort categories with primary capabilities first
  const sortedCategories = Array.from(capabilitiesByCategoryMap.keys()).sort((a, b) => {
    // Validate category names to prevent object injection
    if (typeof a !== 'string' || typeof b !== 'string') {
      return 0;
    }

    // Use Map for safe access
    const aCategory = capabilitiesByCategoryMap.get(a) || [];
    const bCategory = capabilitiesByCategoryMap.get(b) || [];
    const aHasPrimary = aCategory.some((c: any) => c.is_primary);
    const bHasPrimary = bCategory.some((c: any) => c.is_primary);

    if (aHasPrimary && !bHasPrimary) return -1;
    if (!aHasPrimary && bHasPrimary) return 1;
    return a.localeCompare(b);
  });

  const toggleCapability = (capabilityId: string) => {
    setExpandedCapabilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(capabilityId)) {
        newSet.delete(capabilityId);
      } else {
        newSet.add(capabilityId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Agent Capabilities
          </h3>
          <p className="text-sm text-muted-foreground">
            {agentDisplayName || agentName} • {capabilities.length} capabilities
          </p>
        </div>

        {showAddCapability && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCapability}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Capability
          </Button>
        )}
      </div>

      {/* Capabilities by Category */}
      {sortedCategories.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground mb-2">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No capabilities configured</p>
            <p className="text-sm">Add capabilities to enhance this agent's functionality</p>
          </div>
          {showAddCapability && (
            <Button
              variant="default"
              onClick={onAddCapability}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Capability
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  {category.replace(/_/g, ' ')}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {capabilitiesByCategoryMap.get(category)?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {(capabilitiesByCategoryMap.get(category) || []).map((capability) => {
                    const isExpanded = expandedCapabilities.has(capability.capability_id);

                    return (
                      <motion.div
                        key={capability.capability_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <Collapsible>
                          <CollapsibleTrigger
                            className="w-full p-4 hover:bg-muted/50 transition-colors"
                            onClick={() => toggleCapability(capability.capability_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-left">
                                <div className="text-xl">
                                  {capability.icon || '⚡'}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm text-foreground truncate">
                                      {capability.display_name}
                                    </h4>
                                    {capability.is_primary && (
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs", complexityLevelStyles[capability.complexity_level as keyof typeof complexityLevelStyles])}
                                    >
                                      {capability.complexity_level}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className={cn("text-xs", proficiencyLevelStyles[capability.proficiency_level as keyof typeof proficiencyLevelStyles])}
                                    >
                                      {capability.proficiency_level} proficiency
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {onRemoveCapability && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveCapability(capability.capability_id);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove capability</TooltipContent>
                                  </Tooltip>
                                )}

                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="px-4 pb-4 border-t border-border bg-muted/20">
                              <div className="pt-3 space-y-3">
                                {/* Bullet Points */}
                                {capability.bullet_points && capability.bullet_points.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                      Key Capabilities
                                    </p>
                                    <ul className="space-y-1">
                                      {capability.bullet_points.map((point, index) => (
                                        <li key={index} className="text-sm text-foreground flex items-start gap-2">
                                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                          <span>{point.replace(/^•\s*/, '').trim()}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Full Description */}
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                    Description
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {capability.description}
                                  </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                  <span>Domain: {capability.domain}</span>
                                  <span>•</span>
                                  <span>Category: {capability.category}</span>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};