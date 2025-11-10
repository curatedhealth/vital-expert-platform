/**
 * Panel Management Types Component
 *
 * Displays different human-AI management patterns:
 * - AI Only (Fully autonomous)
 * - Human Moderated (AI experts + human moderator)
 * - Hybrid Facilitated (Mixed human-AI experts)
 * - Human Expert (Human experts + AI support)
 */

'use client';

import React, { useState } from 'react';
import {
  Bot,
  Users,
  Zap,
  Brain,
  UserCog,
  Network,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManagementTypeCard } from './ManagementTypeCard';

// ============================================================================
// TYPES
// ============================================================================

export type ManagementType = 'ai_only' | 'human_moderated' | 'hybrid_facilitated' | 'human_expert';

interface ManagementPattern {
  type: ManagementType;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Bot;
  color: string;
  gradient: string;

  configuration: {
    humanModerator: boolean;
    humanExperts: boolean;
    aiOrchestration: 'none' | 'low' | 'medium' | 'high' | 'full';
  };

  capabilities: {
    name: string;
    available: boolean;
  }[];

  advantages: string[];
  limitations: string[];
  bestUseCases: string[];
  pricing: {
    tier: string;
    description: string;
  };
}

// ============================================================================
// MANAGEMENT PATTERNS DATA
// ============================================================================

const MANAGEMENT_PATTERNS: ManagementPattern[] = [
  {
    type: 'ai_only',
    name: 'Fully AI-Orchestrated',
    tagline: 'Autonomous AI panel with AI moderator and AI experts',
    description: 'Complete AI orchestration with AI-generated insights, AI moderation, and autonomous decision-making. Ideal for high-volume, standard scenarios.',
    icon: Bot,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    configuration: {
      humanModerator: false,
      humanExperts: false,
      aiOrchestration: 'full',
    },
    capabilities: [
      { name: 'Autonomous Operation', available: true },
      { name: '24/7 Availability', available: true },
      { name: 'Infinite Scalability', available: true },
      { name: 'Consistent Output', available: true },
      { name: 'Human Judgment', available: false },
      { name: 'Creative Ideation', available: false },
    ],
    advantages: [
      'Instant availability',
      'Consistent quality',
      'Cost-effective at scale',
      'No scheduling required',
      'Parallel processing',
    ],
    limitations: [
      'Limited creative thinking',
      'No human intuition',
      'May miss nuanced context',
      'Requires clear problem definitions',
    ],
    bestUseCases: [
      'High-volume queries',
      'Standard decision scenarios',
      'Quick consultations',
      'Routine assessments',
      'Pattern recognition tasks',
    ],
    pricing: {
      tier: 'Standard',
      description: '$500/month - Unlimited AI panels',
    },
  },
  {
    type: 'human_moderated',
    name: 'Human-Moderated AI Panel',
    tagline: 'AI experts with human moderator guiding discussion',
    description: 'AI experts provide analysis while a human moderator guides the discussion, ensures context is preserved, and makes final judgments.',
    icon: UserCog,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    configuration: {
      humanModerator: true,
      humanExperts: false,
      aiOrchestration: 'high',
    },
    capabilities: [
      { name: 'Human Judgment', available: true },
      { name: 'AI Analysis Speed', available: true },
      { name: 'Guided Discussion', available: true },
      { name: 'Context Preservation', available: true },
      { name: '24/7 Availability', available: false },
      { name: 'Infinite Scalability', available: false },
    ],
    advantages: [
      'Human oversight and judgment',
      'AI speed and analysis',
      'Contextual understanding',
      'Quality control',
      'Adaptable to nuances',
    ],
    limitations: [
      'Requires human availability',
      'Limited by moderator capacity',
      'Higher cost per session',
      'Scheduling complexity',
    ],
    bestUseCases: [
      'Complex strategic decisions',
      'Risk assessment',
      'Regulatory submissions',
      'High-stakes evaluations',
      'Ambiguous situations',
    ],
    pricing: {
      tier: 'Professional',
      description: '$2,000/month - Includes moderator hours',
    },
  },
  {
    type: 'hybrid_facilitated',
    name: 'Hybrid Facilitated Panel',
    tagline: 'Mixed human and AI experts with AI facilitation',
    description: 'Combines human domain experts with AI specialists, facilitated by AI orchestration. Best balance of human creativity and AI analytical power.',
    icon: Network,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    configuration: {
      humanModerator: false,
      humanExperts: true,
      aiOrchestration: 'medium',
    },
    capabilities: [
      { name: 'Human Creativity', available: true },
      { name: 'AI Data Processing', available: true },
      { name: 'Balanced Perspectives', available: true },
      { name: 'AI Facilitation', available: true },
      { name: 'Full Human Control', available: false },
      { name: 'Full AI Control', available: false },
    ],
    advantages: [
      'Human creativity and intuition',
      'AI analytical capabilities',
      'Diverse perspectives',
      'Balanced decision-making',
      'Innovation-friendly',
    ],
    limitations: [
      'Coordination complexity',
      'Mixed availability',
      'Potential communication gaps',
      'Moderate cost',
    ],
    bestUseCases: [
      'Innovation sessions',
      'Research planning',
      'Multi-stakeholder decisions',
      'Product development',
      'Market strategy',
    ],
    pricing: {
      tier: 'Professional',
      description: '$2,000/month - Limited human expert hours',
    },
  },
  {
    type: 'human_expert',
    name: 'Human Expert Panel',
    tagline: 'Human experts with AI analytical support',
    description: 'Human domain experts lead the discussion with AI providing data analysis, precedent research, and evidence synthesis. Maximum human judgment.',
    icon: Users,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    configuration: {
      humanModerator: true,
      humanExperts: true,
      aiOrchestration: 'low',
    },
    capabilities: [
      { name: 'Expert Human Judgment', available: true },
      { name: 'Deep Domain Knowledge', available: true },
      { name: 'Strategic Thinking', available: true },
      { name: 'AI Data Support', available: true },
      { name: 'Rapid Scaling', available: false },
      { name: 'Cost Efficiency', available: false },
    ],
    advantages: [
      'Maximum human judgment',
      'Deep expertise',
      'Strategic insight',
      'AI-enhanced research',
      'Trust and credibility',
    ],
    limitations: [
      'Highest cost',
      'Limited availability',
      'Scheduling challenges',
      'Lower throughput',
    ],
    bestUseCases: [
      'Board-level decisions',
      'Clinical trial design',
      'Regulatory submissions',
      'M&A due diligence',
      'Strategic partnerships',
    ],
    pricing: {
      tier: 'Enterprise',
      description: '$10,000/month - Dedicated expert network',
    },
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface ManagementPatternCardProps {
  pattern: ManagementPattern;
  onSelect: (type: ManagementType) => void;
  onLearnMore: (pattern: ManagementPattern) => void;
}

function ManagementPatternCard({ pattern, onSelect, onLearnMore }: ManagementPatternCardProps) {
  const Icon = pattern.icon;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pattern.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {pattern.pricing.tier}
          </Badge>
        </div>

        <CardTitle className="text-lg group-hover:text-${pattern.color}-600 transition-colors">
          {pattern.name}
        </CardTitle>
        <CardDescription className="text-sm font-medium text-${pattern.color}-600">
          {pattern.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {pattern.description}
        </p>

        {/* Configuration */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Configuration
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {pattern.configuration.humanModerator ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>Human Moderator</span>
            </div>
            <div className="flex items-center gap-1.5">
              {pattern.configuration.humanExperts ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>Human Experts</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted">
            <Zap className="w-3.5 h-3.5 text-${pattern.color}-500" />
            <span>AI Orchestration: <strong className="capitalize">{pattern.configuration.aiOrchestration}</strong></span>
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Key Capabilities
          </h4>
          <div className="space-y-1">
            {pattern.capabilities.slice(0, 4).map((cap, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                {cap.available ? (
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
                <span className={cap.available ? 'text-foreground' : 'text-muted-foreground'}>
                  {cap.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-${pattern.color}-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {pattern.pricing.tier} Tier
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{pattern.pricing.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onLearnMore(pattern)}
          >
            <Info className="w-3 h-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            className={`flex-1 bg-gradient-to-r ${pattern.gradient} hover:opacity-90`}
            onClick={() => onSelect(pattern.type)}
          >
            Select
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Management Pattern Details Dialog
interface ManagementPatternDetailsDialogProps {
  pattern: ManagementPattern | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ManagementType) => void;
}

function ManagementPatternDetailsDialog({
  pattern,
  open,
  onOpenChange,
  onSelect,
}: ManagementPatternDetailsDialogProps) {
  if (!pattern) return null;

  const Icon = pattern.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pattern.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{pattern.name}</DialogTitle>
              <DialogDescription className="text-base font-medium text-${pattern.color}-600">
                {pattern.tagline}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{pattern.description}</p>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-${pattern.color}-500" />
              Configuration
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3">
                <div className="text-center">
                  {pattern.configuration.humanModerator ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  )}
                  <div className="text-xs font-medium">Human Moderator</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  {pattern.configuration.humanExperts ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  )}
                  <div className="text-xs font-medium">Human Experts</div>
                </div>
              </Card>
              <Card className="p-3 bg-${pattern.color}-50">
                <div className="text-center">
                  <Brain className="w-6 h-6 text-${pattern.color}-500 mx-auto mb-2" />
                  <div className="text-xs font-medium capitalize">
                    {pattern.configuration.aiOrchestration} AI
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-${pattern.color}-500" />
              Capabilities
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {pattern.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg ${cap.available ? 'bg-green-50' : 'bg-gray-50'}`}
                >
                  {cap.available ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${cap.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {cap.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advantages & Limitations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Advantages
              </h3>
              <ul className="space-y-2">
                {pattern.advantages.map((adv, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    {adv}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
                <Info className="w-5 h-5" />
                Limitations
              </h3>
              <ul className="space-y-2">
                {pattern.limitations.map((lim, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best Use Cases */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-${pattern.color}-500" />
              Best Use Cases
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {pattern.bestUseCases.map((useCase, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                  <CheckCircle className="w-4 h-4 text-${pattern.color}-500 flex-shrink-0" />
                  {useCase}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <Card className="bg-gradient-to-r ${pattern.gradient} text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">{pattern.pricing.tier} Tier</div>
                  <div className="text-lg font-bold">{pattern.pricing.description}</div>
                </div>
                <TrendingUp className="w-8 h-8 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className={`bg-gradient-to-r ${pattern.gradient}`}
            onClick={() => {
              onSelect(pattern.type);
              onOpenChange(false);
            }}
          >
            Select This Pattern
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PanelManagementTypesProps {
  onSelectType: (type: ManagementType) => void;
  selectedType?: ManagementType;
}

export function PanelManagementTypes({ onSelectType, selectedType }: PanelManagementTypesProps) {
  const [selectedPattern, setSelectedPattern] = useState<ManagementPattern | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLearnMore = (pattern: ManagementPattern) => {
    setSelectedPattern(pattern);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Management Patterns
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how your panel will be managed, from fully autonomous AI to human expert-led panels.
        </p>
      </div>

      {/* Management Patterns Grid - Clean Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MANAGEMENT_PATTERNS.map((pattern) => (
          <ManagementTypeCard
            key={pattern.type}
            pattern={pattern}
            onSelect={() => onSelectType(pattern.type)}
            onLearnMore={() => handleLearnMore(pattern)}
          />
        ))}
      </div>

      {/* Details Dialog */}
      <ManagementPatternDetailsDialog
        pattern={selectedPattern}
        open={showDetails}
        onOpenChange={setShowDetails}
        onSelect={onSelectType}
      />
    </div>
  );
}

export { MANAGEMENT_PATTERNS };
export type { ManagementPattern };
