/**
 * Service Template System Types
 * Defines reusable service configurations that follow the Ask Expert design pattern
 */

import { LucideIcon } from 'lucide-react';

/**
 * Service Template Category
 */
export type ServiceTemplateCategory =
  | 'advisory'
  | 'workflow'
  | 'analysis'
  | 'research'
  | 'compliance'
  | 'innovation';

/**
 * Service Template Tier
 */
export type ServiceTemplateTier = 'expert' | 'advanced' | 'standard';

/**
 * Service Template Configuration
 */
export interface ServiceTemplateConfig {
  id: string;
  name: string;
  description: string;
  category: ServiceTemplateCategory;
  tier: ServiceTemplateTier;
  icon: LucideIcon;

  /** Visual metadata */
  visual: {
    color: string;
    gradient: string;
    badge?: string;
    badgeColor?: string;
  };

  /** Capabilities and features */
  capabilities: string[];

  /** Use case examples */
  useCases: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;

  /** Estimated time to value */
  timeToValue: string;

  /** Complexity level */
  complexity: 'low' | 'medium' | 'high';

  /** Configuration for the service */
  config: {
    /** Agents/experts required */
    requiredAgents?: string[];

    /** Workflow type (if applicable) */
    workflowType?: string;

    /** Default parameters */
    defaultParams?: Record<string, any>;

    /** Integration requirements */
    integrations?: string[];
  };

  /** Route to navigate to when template is selected */
  route?: string;

  /** Custom component to render (if not using default route) */
  component?: React.ComponentType<any>;
}

/**
 * Service Template Instance
 * An instantiated service from a template
 */
export interface ServiceTemplateInstance {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  /** Custom configuration overrides */
  config: Record<string, any>;

  /** Service state */
  state: 'draft' | 'active' | 'paused' | 'archived';

  /** Usage statistics */
  stats?: {
    totalRuns: number;
    successfulRuns: number;
    lastRun?: Date;
    avgDuration?: number;
  };
}
