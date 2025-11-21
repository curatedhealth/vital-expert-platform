'use client';

/**
 * Tenant Configuration Hooks
 * Convenient hooks for accessing tenant configuration
 */

import { useTenant } from '@/contexts/tenant-context';
import { useMemo } from 'react';
import type { TenantApp } from '@/types/multitenancy.types';

/**
 * Hook to get tenant configuration
 */
export function useTenantConfig() {
  const { configuration, isLoading } = useTenant();
  return { configuration, isLoading };
}

/**
 * Hook to get UI configuration
 */
export function useTenantUI() {
  const { configuration } = useTenant();
  return configuration?.ui_config || null;
}

/**
 * Hook to get compliance settings
 */
export function useTenantCompliance() {
  const { configuration } = useTenant();
  return configuration?.compliance_settings || null;
}

/**
 * Hook to get resource limits
 */
export function useTenantLimits() {
  const { configuration } = useTenant();
  return configuration?.limits || null;
}

/**
 * Hook to check HIPAA compliance
 */
export function useIsHipaaEnabled(): boolean {
  const { configuration } = useTenant();
  return configuration?.compliance_settings?.hipaa_enabled ?? false;
}

/**
 * Hook to check GDPR compliance
 */
export function useIsGdprEnabled(): boolean {
  const { configuration } = useTenant();
  return configuration?.compliance_settings?.gdpr_enabled ?? false;
}

/**
 * Hook to check if PHI is allowed
 */
export function useIsPhiAllowed(): boolean {
  const { configuration } = useTenant();
  return configuration?.compliance_settings?.phi_allowed ?? false;
}

/**
 * Hook to check if PII is allowed
 */
export function useIsPiiAllowed(): boolean {
  const { configuration } = useTenant();
  return configuration?.compliance_settings?.pii_allowed ?? false;
}

/**
 * Hook to get enabled agent tiers
 */
export function useEnabledAgentTiers(): number[] {
  const { configuration } = useTenant();
  return configuration?.enabled_agent_tiers || [3];
}

/**
 * Hook to check if an agent tier is enabled
 */
export function useIsAgentTierEnabled(tier: number): boolean {
  const enabledTiers = useEnabledAgentTiers();
  return enabledTiers.includes(tier);
}

/**
 * Hook to get enabled knowledge domains
 */
export function useEnabledKnowledgeDomains(): string[] {
  const { configuration } = useTenant();
  return configuration?.enabled_knowledge_domains || [];
}

/**
 * Hook to check if a knowledge domain is enabled
 */
export function useIsKnowledgeDomainEnabled(domain: string): boolean {
  const enabledDomains = useEnabledKnowledgeDomains();
  return enabledDomains.includes(domain);
}

/**
 * Hook to get tenant apps
 */
export function useTenantApps(): TenantApp[] {
  const { apps } = useTenant();
  return apps;
}

/**
 * Hook to get visible apps (sorted by display order)
 */
export function useVisibleApps(): TenantApp[] {
  const { getVisibleApps } = useTenant();
  return useMemo(() => getVisibleApps(), [getVisibleApps]);
}

/**
 * Hook to check if an app is enabled
 */
export function useIsAppEnabled(appKey: string): boolean {
  const { isAppEnabled } = useTenant();
  return isAppEnabled(appKey);
}

/**
 * Hook to get a specific app
 */
export function useTenantApp(appKey: string): TenantApp | undefined {
  const { getApp } = useTenant();
  return useMemo(() => getApp(appKey), [getApp, appKey]);
}

/**
 * Hook to get tenant theme color
 */
export function useTenantThemeColor(): string {
  const uiConfig = useTenantUI();
  return uiConfig?.primary_color || '#4F46E5';
}

/**
 * Hook to check if tenant switcher should be shown
 */
export function useShowTenantSwitcher(): boolean {
  const uiConfig = useTenantUI();
  const { tenant } = useTenant();

  // Only system tenant can see tenant switcher
  return (
    (uiConfig?.show_tenant_switcher ?? false) && tenant?.tenant_type === 'system'
  );
}

/**
 * Hook to check if user is on system tenant
 */
export function useIsSystemTenant(): boolean {
  const { tenant } = useTenant();
  return tenant?.tenant_type === 'system';
}

/**
 * Hook to get tenant logo URL
 */
export function useTenantLogo(): string | null {
  const uiConfig = useTenantUI();
  return uiConfig?.logo_url || null;
}

/**
 * Hook to get tenant branding (logo + color)
 */
export function useTenantBranding() {
  const uiConfig = useTenantUI();
  return {
    logoUrl: uiConfig?.logo_url || null,
    primaryColor: uiConfig?.primary_color || '#4F46E5',
    theme: uiConfig?.theme || 'default',
  };
}
