/**
 * CapabilitySelector - Select capabilities from the registry
 * Shows available capabilities with rich descriptions and bullet points
 */

'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Check,
  Star
} from 'lucide-react';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  ScrollArea,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui';
import { cn } from '@/shared/services/utils';

interface AvailableCapability {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  domain: string;
  complexity_level: string;
  icon: string;
  color: string;
  bullet_points: string[];
}

interface CapabilitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (capabilities: { capabilityId: string; proficiencyLevel: string; isPrimary: boolean }[]) => void;
  selectedCapabilityIds?: string[];
  availableCapabilities?: AvailableCapability[];
  isLoading?: boolean;
}

const complexityLevelStyles: Record<string, string> = {
  basic: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200',
  expert: 'bg-red-100 text-red-800 border-red-200'
};

const proficiencyLevels = [
  { value: 'basic', label: 'Basic', description: 'Learning or limited experience' },
  { value: 'intermediate', label: 'Intermediate', description: 'Moderate proficiency' },
  { value: 'advanced', label: 'Advanced', description: 'High proficiency' },
  { value: 'expert', label: 'Expert', description: 'Master level expertise' }
];

export const CapabilitySelector: React.FC<CapabilitySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCapabilityIds = [],
  availableCapabilities = [],
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [selectedCapabilities, setSelectedCapabilities] = useState<Record<string, {
    selected: boolean;
    proficiencyLevel: string;
    isPrimary: boolean;
  }>>({ /* TODO: implement */ });

  // Filter capabilities
  const filteredCapabilities = availableCapabilities.filter(capability => {
    const matchesSearch = searchQuery === '' ||
                         capability.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capability.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capability.bullet_points.some(point => point.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === 'all' || capability.domain === selectedDomain;
    const matchesComplexity = selectedComplexity === 'all' || capability.complexity_level === selectedComplexity;

    return matchesSearch && matchesDomain && matchesComplexity;
  });

  // Group by category
  const groupedByCategory = filteredCapabilities.reduce((acc, capability) => {
    const _category = capability.category || 'general';
    // Validate key before accessing object
    if (!Object.prototype.hasOwnProperty.call(acc, _category)) {
      // eslint-disable-next-line security/detect-object-injection
      acc[_category] = [];
    }
    // eslint-disable-next-line security/detect-object-injection
    acc[_category].push(capability);
    return acc;
  }, {} as Record<string, AvailableCapability[]>);

  // Get unique domains and categories
  const uniqueDomains = Array.from(new Set(availableCapabilities.map(cap => cap.domain)));
  const uniqueComplexities = ['basic', 'intermediate', 'advanced', 'expert'];
  const selectedCount = Object.values(selectedCapabilities).filter(config => config.selected).length;

  const toggleCapability = (capabilityId: string) => {
    setSelectedCapabilities(prev => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection
      [capabilityId]: {
        // eslint-disable-next-line security/detect-object-injection
        selected: !prev[capabilityId]?.selected,
        // eslint-disable-next-line security/detect-object-injection
        proficiencyLevel: prev[capabilityId]?.proficiencyLevel || 'intermediate',
        // eslint:disable-next-line security/detect-object-injection
        isPrimary: prev[capabilityId]?.isPrimary || false
      }
    }));
  };

  const updateProficiency = (capabilityId: string, proficiencyLevel: string) => {
    setSelectedCapabilities(prev => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection
      [capabilityId]: {
        // eslint-disable-next-line security/detect-object-injection
        ...prev[capabilityId],
        proficiencyLevel
      }
    }));
  };

  const togglePrimary = (capabilityId: string) => {
    setSelectedCapabilities(prev => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection
      [capabilityId]: {
        // eslint-disable-next-line security/detect-object-injection
        ...prev[capabilityId],
        // eslint-disable-next-line security/detect-object-injection
        isPrimary: !prev[capabilityId]?.isPrimary
      }
    }));
  };

  const handleConfirm = () => {
    const selected = Object.entries(selectedCapabilities)
      .filter(([_, config]) => config.selected)
      .map(([capabilityId, config]) => ({
        capabilityId,
        proficiencyLevel: config.proficiencyLevel,
        isPrimary: config.isPrimary
      }));

    onSelect(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Select Agent Capabilities</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose capabilities from the registry to enhance your agent's functionality
          </p>
        </DialogHeader>

        <div className="flex flex-col h-[70vh]">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search capabilities..."
                  className="pl-9"
                />
              </div>

              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {uniqueDomains.map((domain: any) => (
                    <SelectItem key={domain} value={domain}>
                      {domain.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueComplexities.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {selectedCount} capability{selectedCount !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCapabilities({ /* TODO: implement */ })}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Capabilities List */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-neutral-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                Object.keys(groupedByCategory).map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-foreground mb-3 capitalize flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      {category.replace(/_/g, ' ')}
                      <Badge variant="secondary" className="text-xs">
                        {/* eslint-disable-next-line security/detect-object-injection */}
                        {groupedByCategory[category].length}
                      </Badge>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* eslint-disable-next-line security/detect-object-injection */}
                      {groupedByCategory[category].map((capability) => {
                        // eslint-disable-next-line security/detect-object-injection
                        const capConfig = selectedCapabilities[capability.id] || { selected: false, proficiencyLevel: 'intermediate', isPrimary: false };
                        // eslint-disable-next-line security/detect-object-injection
                        const isSelected = capConfig.selected;
                        // eslint-disable-next-line security/detect-object-injection
                        const isPrimary = capConfig.isPrimary;
                        // eslint-disable-next-line security/detect-object-injection
                        const proficiencyLevel = capConfig.proficiencyLevel;

                        return (
                          <motion.div
                            key={capability.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card className={cn(
                              "cursor-pointer transition-all duration-200 hover:shadow-md",
                              isSelected && "ring-2 ring-primary ring-offset-2"
                            )}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleCapability(capability.id)}
                                      className="mt-1"
                                    />

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{capability.icon || '⚡'}</span>
                                        <h4 className="font-medium text-sm text-foreground truncate">
                                          {capability.display_name}
                                        </h4>
                                      </div>

                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                          variant="outline"
                                          className={cn("text-xs", complexityLevelStyles[capability.complexity_level as keyof typeof complexityLevelStyles])}
                                        >
                                          {capability.complexity_level}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {capability.domain.replace(/_/g, ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bullet Points */}
                                  {capability.bullet_points && capability.bullet_points.length > 0 && (
                                    <div>
                                      <ul className="space-y-1">
                                        {capability.bullet_points.slice(0, 3).map((point, index) => (
                                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <div className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0"></div>
                                            <span>{point.replace(/^•\s*/, '').trim()}</span>
                                          </li>
                                        ))}
                                        {capability.bullet_points.length > 3 && (
                                          <li className="text-xs text-muted-foreground">
                                            ... and {capability.bullet_points.length - 3} more
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Configuration */}
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="border-t border-border pt-3 space-y-3"
                                    >
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground">
                                          Proficiency Level
                                        </label>
                                        <Select
                                          value={proficiencyLevel}
                                          onValueChange={(value) => updateProficiency(capability.id, value)}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {proficiencyLevels.map(level => (
                                              <SelectItem key={level.value} value={level.value}>
                                                <div>
                                                  <div className="font-medium">{level.label}</div>
                                                  <div className="text-xs text-muted-foreground">{level.description}</div>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          id={`primary-${capability.id}`}
                                          checked={isPrimary}
                                          onCheckedChange={() => togglePrimary(capability.id)}
                                        />
                                        <label
                                          htmlFor={`primary-${capability.id}`}
                                          className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                                        >
                                          <Star className="h-3 w-3" />
                                          Primary capability
                                        </label>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {filteredCapabilities.length} capabilities available
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedCount === 0}
              >
                Add {selectedCount} Capability{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};