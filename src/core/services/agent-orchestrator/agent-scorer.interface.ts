/**
 * Agent Scorer Interface - Contract for agent scoring and ranking
 * 
 * This interface defines the contract for scoring and ranking agents
 * based on their suitability for a specific query and context.
 */

import { Agent, QueryIntent } from '@/core/domain/entities';
import { AgentScoringResult, AgentSelectionContext } from './agent-orchestrator.service';

export interface ScoringFactors {
  capabilityMatch: number;
  domainExpertise: number;
  performanceScore: number;
  userPreference: number;
  availability: number;
  recentPerformance?: number;
  costEfficiency?: number;
}

export interface IAgentScorer {
  /**
   * Score all agents based on query intent and context
   */
  scoreAgents(
    agents: Agent[],
    intent: QueryIntent,
    context?: AgentSelectionContext
  ): Promise<AgentScoringResult[]>;

  /**
   * Score a single agent
   */
  scoreAgent(
    agent: Agent,
    intent: QueryIntent,
    context?: AgentSelectionContext
  ): Promise<AgentScoringResult>;

  /**
   * Calculate capability match score
   */
  calculateCapabilityMatch(
    agent: Agent,
    requiredCapabilities: string[]
  ): number;

  /**
   * Calculate domain expertise score
   */
  calculateDomainExpertise(
    agent: Agent,
    domain: string
  ): number;

  /**
   * Calculate user preference score
   */
  calculateUserPreference(
    agent: Agent,
    context?: AgentSelectionContext
  ): number;

  /**
   * Calculate performance score based on historical data
   */
  calculatePerformanceScore(
    agent: Agent,
    context?: AgentSelectionContext
  ): number;

  /**
   * Calculate availability score
   */
  calculateAvailability(
    agent: Agent,
    context?: AgentSelectionContext
  ): number;

  /**
   * Get scoring explanation for transparency
   */
  getScoringExplanation(
    agent: Agent,
    intent: QueryIntent,
    context?: AgentSelectionContext
  ): Promise<string>;
}
