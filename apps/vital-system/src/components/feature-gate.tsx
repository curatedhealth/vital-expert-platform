'use client';

/**
 * Feature Gate Component
 * Conditionally renders children based on feature flag status
 */

import React from 'react';
import { useFeatureFlag, useAnyFeatureEnabled, useAllFeaturesEnabled } from '@/hooks/use-feature-flag';

interface FeatureGateProps {
  feature?: string;
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  invert?: boolean;
}

/**
 * FeatureGate - Conditionally render based on feature flags
 *
 * @example Single feature
 * <FeatureGate feature="app_agents">
 *   <AgentsPage />
 * </FeatureGate>
 *
 * @example Any of multiple features (OR)
 * <FeatureGate anyOf={["app_agents", "app_knowledge"]}>
 *   <SharedComponent />
 * </FeatureGate>
 *
 * @example All of multiple features (AND)
 * <FeatureGate allOf={["compliance_hipaa", "compliance_phi_protection"]}>
 *   <PHIComponent />
 * </FeatureGate>
 *
 * @example With fallback
 * <FeatureGate feature="app_agents" fallback={<UpgradePrompt />}>
 *   <AgentsPage />
 * </FeatureGate>
 *
 * @example Inverted (show when disabled)
 * <FeatureGate feature="beta_feature" invert fallback={<BetaContent />}>
 *   <StableContent />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  anyOf,
  allOf,
  children,
  fallback = null,
  invert = false,
}: FeatureGateProps) {
  let isEnabled = false;

  // Single feature check
  if (feature) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    isEnabled = useFeatureFlag(feature);
  }
  // Any of multiple features (OR)
  else if (anyOf && anyOf.length > 0) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    isEnabled = useAnyFeatureEnabled(anyOf);
  }
  // All of multiple features (AND)
  else if (allOf && allOf.length > 0) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    isEnabled = useAllFeaturesEnabled(allOf);
  }

  // Apply invert logic
  const shouldRender = invert ? !isEnabled : isEnabled;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * App-specific gate
 */
interface AppGateProps {
  appKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AppGate({ appKey, children, fallback = null }: AppGateProps) {
  // Map app keys to their corresponding feature flags
  const featureKey = `app_${appKey.replace(/-/g, '_')}`;

  return (
    <FeatureGate feature={featureKey} fallback={fallback}>
      {children}
    </FeatureGate>
  );
}

/**
 * Agent tier gate
 */
interface AgentTierGateProps {
  tier: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AgentTierGate({ tier, children, fallback = null }: AgentTierGateProps) {
  const featureKey = `agents_tier_${tier}`;

  return (
    <FeatureGate feature={featureKey} fallback={fallback}>
      {children}
    </FeatureGate>
  );
}

/**
 * Compliance gate
 */
interface ComplianceGateProps {
  requirement: 'hipaa' | 'gdpr' | 'phi' | 'pii';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ComplianceGate({ requirement, children, fallback = null }: ComplianceGateProps) {
  const featureKey = `compliance_${requirement}`;

  return (
    <FeatureGate feature={featureKey} fallback={fallback}>
      {children}
    </FeatureGate>
  );
}
