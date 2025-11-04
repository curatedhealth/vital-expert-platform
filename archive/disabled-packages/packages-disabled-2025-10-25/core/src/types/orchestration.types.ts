/**
 * Shared Orchestration Types for VITAL AI System
 * Ensures consistent type definitions across all orchestration components
 */

import { ComplianceLevel } from '@/types/digital-health-agent.types';

export interface IntentResult {
  primaryDomain: string;
  domains: string[];
  confidence: number;
  keywords: string[];
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  requiresMultiAgent: boolean;
  intent: string;
  subintents: string[];
}

export interface QueryContext {
  user_id: string;
  session_id: string;
  timestamp: string;
  compliance_level: ComplianceLevel | 'standard' | 'high' | 'critical';
  audit_required: boolean;
  previousMessages?: string[];
  skipCache?: boolean;
  skipDigitalHealth?: boolean;
}

export interface OrchestrationResult {
  success: boolean;
  agent?: string;
  response: string;
  confidence: number;
  responseTime?: number;
  orchestration: {
    type: 'single_agent' | 'multi_agent' | 'digital_health_priority' | 'no_match' | 'all_failed' | 'system_error';
    agents?: string[];
    intent?: IntentResult;
    digitalHealthPriority?: boolean;
    individualConfidences?: Array<{
      agent: string;
      confidence: number;
    }>;
    suggestion?: string;
    errors?: string;
    error?: string;
  };
  metadata?: {
    version?: string;
    domain?: string;
    rag_used?: boolean;
    model?: string;
    agentCount?: number;
    successCount?: number;
    digitalHealthPriority?: boolean;
  };
}