/**
 * AgentPanel - Healthcare AI Agent Selection and Management
 * Shows available agents, their specialties, and allows multi-agent selection
 */

'use client';

import { motion } from 'framer-motion';
import {
  X,
  Users,
  Search,
  Star,
  Clock,
  Shield,
  Award,
  CheckCircle,
  Circle
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { cn } from '@/shared/services/utils';
import type { Agent, AgentType } from '@/shared/types/chat.types';

interface AgentPanelProps {
  onClose: () => void;
  onAgentSelect: (agents: AgentType[]) => void;
  selectedAgents: AgentType[];
}

// Mock healthcare agents data
const HEALTHCARE_AGENTS: Agent[] = [
  {
    id: 'fda-regulatory-001',
    type: 'fda-regulatory-strategist',
    name: 'Dr. Sarah Chen',
    icon: '🏛️',
    specialty: 'FDA Regulatory Affairs',
    description: 'Expert in FDA pathways, 510(k) submissions, and medical device regulation',
    responseTime: 90000,
    availability: 'online',
    confidence: 96,
    expertise: ['510(k) Submissions', 'De Novo Pathway', 'PMA Applications', 'QSR Compliance', 'FDA Meetings']
  },
  {
    id: 'clinical-trial-001',
    type: 'clinical-trial-designer',
    name: 'Dr. Michael Rodriguez',
    icon: '🔬',
    specialty: 'Clinical Research Design',
    description: 'Specialist in clinical study design, biostatistics, and evidence generation',
    responseTime: 150000,
    availability: 'online',
    confidence: 94,
    expertise: ['Study Design', 'Clinical Endpoints', 'Biostatistics', 'ICH-GCP', 'Real-World Evidence']
  },
  {
    id: 'digital-therapeutics-001',
    type: 'digital-therapeutics-expert',
    name: 'Dr. Emily Watson',
    icon: '💊',
    specialty: 'Digital Health & DTx',
    description: 'Expert in digital therapeutic development, validation, and commercialization',
    responseTime: 90000,
    availability: 'online',
    confidence: 93,
    expertise: ['DTx Development', 'Clinical Validation', 'Reimbursement', 'User Experience', 'Behavioral Science']
  },
  {
    id: 'ai-ml-specialist-001',
    type: 'ai-ml-clinical-specialist',
    name: 'Dr. David Kim',
    icon: '🧠',
    specialty: 'AI/ML in Healthcare',
    description: 'Expert in AI/ML algorithm validation, clinical implementation, and regulatory approval',
    responseTime: 150000,
    availability: 'online',
    confidence: 91,
    expertise: ['Algorithm Validation', 'Clinical AI', 'Machine Learning', 'Data Science', 'AI Ethics']
  },
  {
    id: 'reimbursement-001',
    type: 'health-economics-analyst',
    name: 'Dr. Jennifer Park',
    icon: '💰',
    specialty: 'Healthcare Economics',
    description: 'Expert in reimbursement strategy, health economics, and payer negotiations',
    responseTime: 150000,
    availability: 'online',
    confidence: 89,
    expertise: ['CPT Codes', 'Health Economics', 'Payer Strategy', 'HEDIS Measures', 'Value-Based Care']
  }
];

  'All Specialties',
  'FDA Regulatory Affairs',
  'Clinical Research Design',
  'Digital Health & DTx',
  'AI/ML in Healthcare',
  'Healthcare Economics',
  'Clinical Safety & Risk'
];

export const AgentPanel: React.FC<AgentPanelProps> = ({
  onClose,
  onAgentSelect,
  selectedAgents
}) => {
  const [agents, setAgents] = useState<Agent[]>(HEALTHCARE_AGENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  // Filter agents based on search and specialty

    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' ||
      agent.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgentIds(newSelected);

    // Convert to agent types for parent component

      .map(id => agents.find((a: any) => a.id === id)?.type)
      .filter(Boolean) as AgentType[];

    onAgentSelect(selectedTypes);
  };

    switch (availability) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

    switch (availability) {
      case 'online':
        return 'Available now';
      case 'busy':
        return 'Busy - may be slow to respond';
      case 'offline':
        return 'Currently offline';
      default:
        return 'Unknown status';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 380 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 380 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-card border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-semibold">Expert Agents</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="pl-9"
          />
        </div>

        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Agents Summary */}
      {selectedAgentIds.size > 0 && (
        <div className="p-4 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Selected Agents</span>
            <Badge variant="secondary">{selectedAgentIds.size} selected</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Multi-agent collaboration will provide comprehensive responses
          </div>
        </div>
      )}

      {/* Agents List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredAgents.map((agent) => {

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected && "ring-2 ring-primary/50 bg-primary/5"
                )}>
                  <CardContent
                    className="p-4"
                    onClick={() => handleAgentToggle(agent.id)}
                  >
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{agent.icon}</div>
                        <div>
                          <h3 className="font-semibold text-sm">{agent.name}</h3>
                          <p className="text-xs text-muted-foreground">{agent.specialty}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Agent Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={cn("h-2 w-2 rounded-full", getAvailabilityColor(agent.availability))} />
                        <span className="text-muted-foreground">{getAvailabilityText(agent.availability)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{agent.responseTime}</span>
                      </div>
                    </div>

                    {/* Specialty & Rating */}
                    <div className="space-y-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {agent.specialty}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{agent.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{agent.confidence}% confidence</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Expert
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {agent.description}
                    </p>

                    {/* Expertise Tags */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Expertise:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.expertise.slice(0, 3).map((exp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                        {agent.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.expertise.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">No agents found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{agents.length} total agents</span>
            <span>{agents.filter((a: any) => a.availability === 'online').length} online</span>
          </div>

          {selectedAgentIds.size > 0 && (
            <Button
              onClick={onClose}
              className="w-full"
              size="sm"
            >
              Start Collaboration ({selectedAgentIds.size} agents)
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};