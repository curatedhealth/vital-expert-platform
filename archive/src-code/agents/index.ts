/**
 * VITAL Path Digital Health AI Platform - Agents Index
 * Complete agent system across all tiers
 */

// Tier 1 Agents - Essential (5 agents)
export * from './tier1/FDARegulatoryStrategist';
export * from './tier1/ClinicalTrialDesigner';
export * from './tier1/HIPAAComplianceOfficer';
export * from './tier1/ReimbursementStrategist';
export * from './tier1/QMSArchitect';

// Tier 2 Agents - Operational (9 agents implemented)
export * from './tier2/MedicalWriter';
export * from './tier2/ClinicalEvidenceAnalyst';
export * from './tier2/HCPMarketingStrategist';
export * from './tier2/HealthEconomicsAnalyst';
export * from './tier2/PatientEngagementSpecialist';
export * from './tier2/MedicalAffairsManager';
export * from './tier2/PostMarketSurveillanceManager';
export * from './tier2/CompetitiveIntelligenceAnalyst';
export * from './tier2/MedicalLiteratureAnalyst';

// Tier 3 Agents - Specialized (7 agents implemented)
export * from './tier3/OncologyDigitalHealthSpecialist';
export * from './tier3/CardiovascularDigitalHealthSpecialist';
export * from './tier3/EUMDRSpecialist';
export * from './tier3/AIMLTechnologySpecialist';
export * from './tier3/DiagnosticPathwayOptimizer';
export * from './tier3/TreatmentOutcomePredictor';
export * from './tier3/PatientCohortAnalyzer';

// Core System
export * from './core/AgentOrchestrator';
export * from './core/DigitalHealthAgent';
export * from './core/ComplianceAwareOrchestrator';

/**
 * AGENT DEPLOYMENT SUMMARY
 *
 * Total Agents: 21 (INCLUDING ALL DATABASE AGENTS)
 * - Tier 1 (Essential): 5 agents - Critical for regulatory compliance and platform viability
 * - Tier 2 (Operational): 9 agents - Core operational capabilities for revenue generation
 * - Tier 3 (Specialized): 7 agents - Competitive differentiation and market expansion
 *
 * DATABASE COVERAGE: COMPLETE ✅
 * - All 5 Supabase database agents now implemented
 * - Clinical Trial Designer ✅ (Tier 1)
 * - Medical Literature Analyst ✅ (Tier 2)
 * - Diagnostic Pathway Optimizer ✅ (Tier 3)
 * - Treatment Outcome Predictor ✅ (Tier 3)
 * - Patient Cohort Analyzer ✅ (Tier 3)
 *
 * Implementation Status: COMPLETE
 * - All agents follow consistent inheritance patterns
 * - Comprehensive system prompts and capabilities defined
 * - Orchestrator updated with all agents and new workflows
 * - Ready for production deployment
 */