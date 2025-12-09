/**
 * Status Indicators Component - Phase 4
 * Displays agent tier, patterns applied, and safety validation status
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

// ========== TIER BADGE ==========

interface TierBadgeProps {
  tier: 'tier_1' | 'tier_2' | 'tier_3';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const getTierConfig = () => {
    switch (tier) {
      case 'tier_1':
        return { label: 'Tier 1: Rapid', color: 'bg-blue-100 text-blue-800', icon: Zap };
      case 'tier_2':
        return { label: 'Tier 2: Expert', color: 'bg-green-100 text-green-800', icon: Brain };
      case 'tier_3':
        return { label: 'Tier 3: Deep Reasoning', color: 'bg-purple-100 text-purple-800', icon: Shield };
      default:
        return { label: 'Unknown', color: 'bg-neutral-100 text-neutral-800', icon: Zap };
    }
  };

  const config = getTierConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.color}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// ========== PATTERN INDICATOR ==========

interface PatternIndicatorProps {
  patterns: string[];
}

export const PatternIndicator: React.FC<PatternIndicatorProps> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'react':
        return 'ReAct';
      case 'tree_of_thoughts':
        return 'Tree-of-Thoughts';
      case 'constitutional_ai':
        return 'Constitutional AI';
      case 'react_constitutional':
        return 'ReAct + Constitutional AI';
      default:
        return pattern;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Brain className="h-4 w-4 text-purple-500" />
      <div className="flex flex-wrap gap-1">
        {patterns.map((pattern, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {getPatternLabel(pattern)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ========== SAFETY INDICATOR ==========

interface SafetyIndicatorProps {
  humanOversightRequired: boolean;
  hitlApprovals?: Array<{ checkpoint: string; approved: boolean }>;
}

export const SafetyIndicator: React.FC<SafetyIndicatorProps> = ({
  humanOversightRequired,
  hitlApprovals = []
}) => {
  if (!humanOversightRequired && hitlApprovals.length === 0) return null;

  const allApproved = hitlApprovals.every(approval => approval.approved);
  const Icon = allApproved ? CheckCircle : AlertTriangle;
  const color = allApproved ? 'text-green-500' : 'text-orange-500';

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm text-muted-foreground">
        {humanOversightRequired ? 'Human Oversight Required' : 'Safety Validated'}
      </span>
      {hitlApprovals.length > 0 && (
        <Badge variant="outline" className="text-xs">
          {hitlApprovals.filter(a => a.approved).length}/{hitlApprovals.length} Approved
        </Badge>
      )}
    </div>
  );
};














