/**
 * Panel Types Showcase
 *
 * Beautiful display of 6 panel orchestration types with:
 * - Visual cards for each type
 * - Use cases and examples
 * - Configuration details
 * - Interactive selection
 */

'use client';

import React, { useState } from 'react';
import {
  Users,
  Network,
  MessageCircle,
  Scale,
  Target,
  Zap,
  Clock,
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles,
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

// ============================================================================
// TYPES
// ============================================================================

export type PanelType = 'structured' | 'open' | 'socratic' | 'adversarial' | 'delphi' | 'hybrid';

interface PanelTypeInfo {
  type: PanelType;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Users;
  color: string;
  gradient: string;
  characteristics: string[];
  useCases: string[];
  examples: {
    scenario: string;
    context: string;
    outcome: string;
  }[];
  configuration: {
    duration: string;
    experts: string;
    rounds: string;
    style: string;
  };
  bestFor: string[];
}

// ============================================================================
// PANEL TYPE DEFINITIONS
// ============================================================================

const PANEL_TYPES: PanelTypeInfo[] = [
  {
    type: 'structured',
    name: 'Structured Panel',
    tagline: 'Sequential, Moderated Discussion',
    description: 'Formal, Robert\'s Rules-based sequential discussion with strict moderation. Perfect for regulatory decisions and compliance verification.',
    icon: Users,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    characteristics: [
      'Sequential turn-taking',
      'Formal moderation',
      'Documented decisions',
      'Traceable reasoning',
    ],
    useCases: [
      'Regulatory strategy decisions',
      'FDA submission pathways',
      'Compliance verification',
      'Formal governance decisions',
    ],
    examples: [
      {
        scenario: 'FDA 510(k) vs PMA Pathway Selection',
        context: 'Novel cardiac monitoring device with AI algorithms',
        outcome: 'Clear recommendation with regulatory precedents and risk assessment',
      },
      {
        scenario: 'Phase 3 Trial Protocol Review',
        context: 'Pivotal trial for novel oncology therapeutic',
        outcome: 'Protocol optimization recommendations with FDA alignment',
      },
    ],
    configuration: {
      duration: '10-30 minutes',
      experts: '3-7 experts',
      rounds: '3 rounds',
      style: 'Sequential',
    },
    bestFor: ['Regulatory submissions', 'Clinical protocols', 'Compliance reviews'],
  },
  {
    type: 'open',
    name: 'Open Panel',
    tagline: 'Parallel Exploration',
    description: 'Free-flowing multi-directional dialogue for brainstorming and innovation. Enables emergent insights and creative problem-solving.',
    icon: Network,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    characteristics: [
      'Parallel contributions',
      'Creative freedom',
      'No fixed structure',
      'Emergent insights',
    ],
    useCases: [
      'Innovation ideation',
      'Creative problem-solving',
      'Exploratory discussions',
      'Multi-perspective analysis',
    ],
    examples: [
      {
        scenario: 'Patient Support Program Innovation',
        context: 'Designing next-generation digital patient engagement',
        outcome: 'Multiple innovative program concepts and features',
      },
      {
        scenario: 'Digital Biomarker Development',
        context: 'Wearable-based endpoints for neurological conditions',
        outcome: 'Innovative biomarker concepts and validation strategies',
      },
    ],
    configuration: {
      duration: '5-20 minutes',
      experts: '5-8 experts',
      rounds: 'Continuous',
      style: 'Parallel',
    },
    bestFor: ['Innovation sessions', 'Research planning', 'Creative ideation'],
  },
  {
    type: 'socratic',
    name: 'Socratic Panel',
    tagline: 'Iterative Questioning',
    description: 'Deep analysis through systematic questioning and assumption testing. Uncovers root causes and validates hypotheses.',
    icon: MessageCircle,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    characteristics: [
      'Deep questioning',
      'Assumption testing',
      'Root cause analysis',
      'Iterative refinement',
    ],
    useCases: [
      'Complex problem analysis',
      'Root cause investigation',
      'Assumption validation',
      'Deep understanding development',
    ],
    examples: [
      {
        scenario: 'Clinical Trial Failure Analysis',
        context: 'Phase 3 trial missed primary endpoint',
        outcome: 'Root causes identified with remediation strategies',
      },
      {
        scenario: 'Market Access Barrier Analysis',
        context: 'Limited payer coverage despite clinical superiority',
        outcome: 'Deep understanding of payer resistance points',
      },
    ],
    configuration: {
      duration: '15-30 minutes',
      experts: '3-4 experts',
      rounds: '5 rounds',
      style: 'Question-driven',
    },
    bestFor: ['Failure analysis', 'Barrier investigation', 'Deep dives'],
  },
  {
    type: 'adversarial',
    name: 'Adversarial Panel',
    tagline: 'Structured Debate',
    description: 'Formal debate format with pro/con sides for critical evaluation. Stress tests strategies and reveals blind spots.',
    icon: Scale,
    color: 'red',
    gradient: 'from-red-500 to-rose-500',
    characteristics: [
      'Pro/con structure',
      'Devil\'s advocate',
      'Risk revelation',
      'Balanced evaluation',
    ],
    useCases: [
      'Risk assessment',
      'Investment decisions',
      'Go/No-go decisions',
      'Strategy stress testing',
    ],
    examples: [
      {
        scenario: 'Expanded Access Program Decision',
        context: 'Pre-approval access request for terminal patient',
        outcome: 'Balanced risk-benefit assessment with clear recommendation',
      },
      {
        scenario: 'Label Expansion Strategy',
        context: 'Pursuing new indication with limited data',
        outcome: 'Comprehensive pro/con analysis with risk mitigation',
      },
    ],
    configuration: {
      duration: '10-30 minutes',
      experts: '4-8 experts',
      rounds: '4 rounds',
      style: 'Debate',
    },
    bestFor: ['Go/No-go decisions', 'Risk assessment', 'Critical evaluation'],
  },
  {
    type: 'delphi',
    name: 'Delphi Panel',
    tagline: 'Anonymous Iterative Rounds',
    description: 'Anonymous multi-round consensus building with statistical convergence. Eliminates groupthink and anchoring bias.',
    icon: Target,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    characteristics: [
      'Anonymous responses',
      'Statistical convergence',
      'Multiple rounds',
      'Consensus-driven',
    ],
    useCases: [
      'Expert forecasting',
      'Consensus guidelines',
      'Trend prediction',
      'Unbiased assessment',
    ],
    examples: [
      {
        scenario: 'Treatment Guideline Consensus',
        context: 'Developing expert consensus for rare disease management',
        outcome: 'Consensus treatment recommendations with confidence intervals',
      },
      {
        scenario: 'Market Adoption Forecast',
        context: 'Predicting 5-year uptake of novel gene therapy',
        outcome: 'Adoption curve with confidence bands',
      },
    ],
    configuration: {
      duration: '15-25 minutes',
      experts: '5-12 experts',
      rounds: '3 rounds',
      style: 'Anonymous',
    },
    bestFor: ['Forecasting', 'Guidelines', 'Consensus building'],
  },
  {
    type: 'hybrid',
    name: 'Hybrid Panel',
    tagline: 'Combined Human-AI',
    description: 'Integration of human expertise with AI analysis for critical decisions. Combines human judgment with computational power.',
    icon: Zap,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    characteristics: [
      'Human + AI synergy',
      'Data-driven insights',
      'Expert judgment',
      'Comprehensive analysis',
    ],
    useCases: [
      'Board-level decisions',
      'High-stakes evaluation',
      'Complex multi-factorial decisions',
      'Regulatory submissions',
    ],
    examples: [
      {
        scenario: 'M&A Due Diligence - Clinical Assets',
        context: 'Evaluating pipeline acquisition target',
        outcome: 'Comprehensive asset valuation with risk assessment',
      },
      {
        scenario: 'Breakthrough Therapy Designation Strategy',
        context: 'BTD submission for first-in-class therapy',
        outcome: 'BTD submission strategy with supporting evidence',
      },
    ],
    configuration: {
      duration: '20-60 minutes',
      experts: '3-8 (mixed)',
      rounds: '4 rounds',
      style: 'Collaborative',
    },
    bestFor: ['M&A', 'Strategic decisions', 'Complex evaluations'],
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface PanelTypeCardProps {
  panelType: PanelTypeInfo;
  onSelect: (type: PanelType) => void;
  onLearnMore: (panelType: PanelTypeInfo) => void;
}

function PanelTypeCard({ panelType, onSelect, onLearnMore }: PanelTypeCardProps) {
  const Icon = panelType.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${panelType.gradient} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {panelType.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {panelType.tagline}
        </p>

        {/* Characteristics */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {panelType.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {panelType.configuration.experts}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {panelType.configuration.duration}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLearnMore(panelType);
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Click to view details
          </button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(panelType.type);
            }}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Select
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Panel Type Details Dialog
interface PanelTypeDetailsDialogProps {
  panelType: PanelTypeInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: PanelType) => void;
}

function PanelTypeDetailsDialog({
  panelType,
  open,
  onOpenChange,
  onSelect,
}: PanelTypeDetailsDialogProps) {
  if (!panelType) return null;

  const Icon = panelType.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${panelType.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{panelType.name}</DialogTitle>
              <DialogDescription className="text-base font-medium text-${panelType.color}-600">
                {panelType.tagline}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{panelType.description}</p>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-${panelType.color}-500" />
              Key Characteristics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {panelType.characteristics.map((char, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <div className={`w-2 h-2 rounded-full bg-${panelType.color}-500`} />
                  <span className="text-sm">{char}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-${panelType.color}-500" />
              Core Use Cases
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {panelType.useCases.map((useCase, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-${panelType.color}-500 flex-shrink-0" />
                  {useCase}
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-${panelType.color}-500" />
              Real-World Examples
            </h3>
            <div className="space-y-3">
              {panelType.examples.map((example, idx) => (
                <Card key={idx} className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">{example.scenario}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Context:</span>{' '}
                        <span>{example.context}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Outcome:</span>{' '}
                        <span>{example.outcome}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-${panelType.color}-500" />
              Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="font-medium">{panelType.configuration.duration}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Experts</div>
                <div className="font-medium">{panelType.configuration.experts}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Rounds</div>
                <div className="font-medium">{panelType.configuration.rounds}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Style</div>
                <div className="font-medium">{panelType.configuration.style}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className={`bg-gradient-to-r ${panelType.gradient}`}
            onClick={() => {
              onSelect(panelType.type);
              onOpenChange(false);
            }}
          >
            Select This Panel Type
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

interface PanelTypesShowcaseProps {
  onSelectType: (type: PanelType) => void;
}

export function PanelTypesShowcase({ onSelectType }: PanelTypesShowcaseProps) {
  const [selectedPanel, setSelectedPanel] = useState<PanelTypeInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleLearnMore = (panelType: PanelTypeInfo) => {
    setSelectedPanel(panelType);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Choose Your Panel Type</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select the orchestration pattern that best fits your decision-making needs.
          Each panel type uses different facilitation strategies and expert configurations.
        </p>
      </div>

      {/* Panel Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PANEL_TYPES.map((panelType) => (
          <PanelTypeCard
            key={panelType.type}
            panelType={panelType}
            onSelect={onSelectType}
            onLearnMore={handleLearnMore}
          />
        ))}
      </div>

      {/* Details Dialog */}
      <PanelTypeDetailsDialog
        panelType={selectedPanel}
        open={showDetails}
        onOpenChange={setShowDetails}
        onSelect={onSelectType}
      />
    </div>
  );
}

export { PANEL_TYPES };
export type { PanelTypeInfo };
