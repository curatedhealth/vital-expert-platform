#!/usr/bin/env node

/**
 * CAPABILITY-BASED Agent Model Assignment
 *
 * Uses the VITAL Healthcare AI Intelligent LLM Selection Framework
 * to assign optimal models based on 6 dimensions:
 * 1. Role Match (20%)
 * 2. Capability Match (30%) - HIGHEST WEIGHT
 * 3. Performance Match (15%)
 * 4. Cost Efficiency (15%)
 * 5. Context Size Match (10%)
 * 6. Compliance Match (10%)
 *
 * This script ONLY updates models/evidence - preserves all other data
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// MODEL DATABASE (October 2025)
// ==========================================

const MODEL_DATABASE = {
  // GPT-5 Family (Featured - NEW!)
  'gpt-5': {
    provider: 'openai',
    tier: 3,
    domainStrength: { clinical: 96, regulatory: 92, research: 94, operational: 88, general: 95 },
    benchmarks: { medqa: 96.4, mmlu: 91.4, gpqa: 67.8, humaneval: 95.3, swebench: 54.6 },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 128000, inputCostPer1M: 30, outputCostPer1M: 45, avgLatency: 3500 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Best overall model for coding and agentic tasks across domains'
  },
  'gpt-5-mini': {
    provider: 'openai',
    tier: 2,
    domainStrength: { clinical: 88, regulatory: 85, research: 87, operational: 90, general: 89 },
    benchmarks: { medqa: 89, mmlu: 87, gpqa: 58, humaneval: 90, swebench: 48 },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 128000, inputCostPer1M: 5, outputCostPer1M: 8, avgLatency: 2000 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Faster, cost-efficient version of GPT-5 for well-defined tasks'
  },
  'gpt-5-nano': {
    provider: 'openai',
    tier: 1,
    domainStrength: { clinical: 75, regulatory: 72, research: 74, operational: 85, general: 78 },
    benchmarks: { medqa: 75, mmlu: 78, gpqa: 42, humaneval: 82, swebench: 38 },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 64000, inputCostPer1M: 1, outputCostPer1M: 2, avgLatency: 800 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Fastest, most cost-efficient version of GPT-5'
  },

  // GPT-4.1 Family
  'gpt-4.1': {
    provider: 'openai',
    tier: 3,
    domainStrength: { clinical: 90, regulatory: 88, research: 92, operational: 94, general: 91 },
    benchmarks: { medqa: 90, mmlu: 90.2, gpqa: 56.1, humaneval: 92, swebench: 54.6 },
    capabilities: { multimodal: false, codeExecution: false, longContext: true },
    resources: { effectiveContext: 1000000, inputCostPer1M: 15, outputCostPer1M: 25, avgLatency: 3000 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Best for coding with 1M token context, improved instruction following'
  },

  // Claude Family
  'claude-opus-4': {
    provider: 'anthropic',
    tier: 3,
    domainStrength: { clinical: 78, regulatory: 85, research: 90, operational: 82, general: 87 },
    benchmarks: { medqa: null, mmlu: 86.8, gpqa: 50.4, humaneval: 84.5, swebench: 40 },
    capabilities: { multimodal: true, codeExecution: false, longContext: true },
    resources: { effectiveContext: 128000, inputCostPer1M: 37.50, outputCostPer1M: 52.50, avgLatency: 4000 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Best-in-class reasoning and complex analysis'
  },
  'claude-sonnet-4.5': {
    provider: 'anthropic',
    tier: 2,
    domainStrength: { clinical: 75, regulatory: 82, research: 88, operational: 85, general: 84 },
    benchmarks: { medqa: null, mmlu: 88.7, gpqa: 65, humaneval: 92, swebench: 50 },
    capabilities: { multimodal: true, codeExecution: false, longContext: true },
    resources: { effectiveContext: 200000, inputCostPer1M: 6, outputCostPer1M: 12, avgLatency: 2500 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Best balance of speed, cost, and performance with 200K context'
  },

  // Gemini Family
  'gemini-2.5-pro': {
    provider: 'google',
    tier: 2,
    domainStrength: { clinical: 80, regulatory: 78, research: 85, operational: 88, general: 83 },
    benchmarks: { medqa: null, mmlu: 85.9, gpqa: 58, humaneval: 87, swebench: 45 },
    capabilities: { multimodal: true, codeExecution: true, longContext: true },
    resources: { effectiveContext: 1000000, inputCostPer1M: 2.50, outputCostPer1M: 3.75, avgLatency: 2800 },
    compliance: { hipaaCompliant: false, baaAvailable: false, zeroDataRetention: false, auditLogging: true },
    availability: 'GA',
    description: 'Excellent value with massive 1M context and multimodal capabilities'
  },
  'gemini-flash': {
    provider: 'google',
    tier: 1,
    domainStrength: { clinical: 65, regulatory: 68, research: 72, operational: 82, general: 74 },
    benchmarks: { medqa: null, mmlu: 78, gpqa: 40, humaneval: 74, swebench: 35 },
    capabilities: { multimodal: true, codeExecution: false, longContext: false },
    resources: { effectiveContext: 32000, inputCostPer1M: 0.15, outputCostPer1M: 0.20, avgLatency: 600 },
    compliance: { hipaaCompliant: false, baaAvailable: false, zeroDataRetention: false, auditLogging: true },
    availability: 'GA',
    description: 'Ultra-fast and cost-effective for high-volume tasks'
  },

  // HuggingFace CuratedHealth (Your fine-tuned models!)
  'CuratedHealth/meditron70b-qlora-1gpu': {
    provider: 'huggingface',
    tier: 3,
    domainStrength: { clinical: 92, regulatory: 75, research: 85, operational: 70, general: 72 },
    benchmarks: { medqa: 88, mmlu: 80, gpqa: null, humaneval: null, swebench: null },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 16384, inputCostPer1M: 8, outputCostPer1M: 12, avgLatency: 3500 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Medical fine-tuned 70B model for clinical decision support'
  },
  'CuratedHealth/Qwen3-8B-SFT-20250917123923': {
    provider: 'huggingface',
    tier: 2,
    domainStrength: { clinical: 85, regulatory: 72, research: 78, operational: 68, general: 70 },
    benchmarks: { medqa: 82, mmlu: 75, gpqa: null, humaneval: 65, swebench: null },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 8192, inputCostPer1M: 4, outputCostPer1M: 8, avgLatency: 2000 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Medical SFT model for clinical workflows and documentation'
  },
  'CuratedHealth/base_7b': {
    provider: 'huggingface',
    tier: 1,
    domainStrength: { clinical: 78, regulatory: 65, research: 70, operational: 72, general: 68 },
    benchmarks: { medqa: 74, mmlu: 70, gpqa: null, humaneval: 60, swebench: null },
    capabilities: { multimodal: false, codeExecution: false, longContext: false },
    resources: { effectiveContext: 4096, inputCostPer1M: 1.5, outputCostPer1M: 3, avgLatency: 1500 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Medical foundational model for triage and high-volume queries'
  },

  // Voice/Image Models
  'gpt-4o-mini-tts': {
    provider: 'openai',
    tier: 2,
    domainStrength: { clinical: 70, regulatory: 65, research: 68, operational: 85, general: 75 },
    benchmarks: { medqa: null, mmlu: 82, gpqa: null, humaneval: null, swebench: null },
    capabilities: { multimodal: false, codeExecution: false, longContext: false, voice: true },
    resources: { effectiveContext: 16000, inputCostPer1M: 5, outputCostPer1M: 8, avgLatency: 1000 },
    compliance: { hipaaCompliant: true, baaAvailable: true, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Text-to-speech with voice instructability for patient communication'
  },
  'gpt-image-1': {
    provider: 'openai',
    tier: 2,
    domainStrength: { clinical: 75, regulatory: 60, research: 80, operational: 70, general: 72 },
    benchmarks: { medqa: null, mmlu: null, gpqa: null, humaneval: null, swebench: null },
    capabilities: { multimodal: false, codeExecution: false, longContext: false, imageGeneration: true },
    resources: { effectiveContext: 4000, inputCostPer1M: 20, outputCostPer1M: 30, avgLatency: 5000 },
    compliance: { hipaaCompliant: false, baaAvailable: false, zeroDataRetention: true, auditLogging: true },
    availability: 'GA',
    description: 'Latest image generation model for medical illustrations'
  }
};

// ==========================================
// CAPABILITY DETECTION RULES
// ==========================================

const CAPABILITY_RULES = {
  // Detect if agent needs medical accuracy
  needsMedicalAccuracy: (agent) => {
    const medicalKeywords = ['clinical', 'medical', 'diagnosis', 'treatment', 'patient', 'dosing', 'drug', 'pharmacist', 'physician'];
    const name = agent.display_name.toLowerCase();
    const domain = agent.domain_expertise?.toLowerCase() || '';
    return medicalKeywords.some(kw => name.includes(kw) || domain.includes(kw));
  },

  // Detect if agent needs code generation
  needsCodeGeneration: (agent) => {
    const codeKeywords = ['developer', 'engineer', 'programmer', 'automation', 'data scientist', 'analyst', 'statistical'];
    const name = agent.display_name.toLowerCase();
    return codeKeywords.some(kw => name.includes(kw));
  },

  // Detect if agent needs long document handling
  needsLongDocument: (agent) => {
    const docKeywords = ['regulatory', 'submission', 'protocol', 'dossier', 'documentation', 'writer', 'literature'];
    const name = agent.display_name.toLowerCase();
    return docKeywords.some(kw => name.includes(kw));
  },

  // Detect if agent needs multimodal (vision)
  needsMultimodal: (agent) => {
    const visionKeywords = ['imaging', 'radiology', 'pathology', 'visual', 'image'];
    const name = agent.display_name.toLowerCase();
    return visionKeywords.some(kw => name.includes(kw));
  },

  // Detect if agent needs voice capabilities
  needsVoice: (agent) => {
    const voiceKeywords = ['patient communication', 'patient engagement', 'telehealth', 'virtual assistant'];
    const name = agent.display_name.toLowerCase();
    return voiceKeywords.some(kw => name.includes(kw));
  },

  // Detect if agent is safety-critical
  isSafetyCritical: (agent) => {
    const criticalKeywords = ['dosing', 'safety', 'adverse', 'interaction', 'clinical decision', 'diagnosis'];
    const name = agent.display_name.toLowerCase();
    return criticalKeywords.some(kw => name.includes(kw));
  }
};

// ==========================================
// SCORING ALGORITHM
// ==========================================

function calculateFitnessScore(model, agent, context) {
  const WEIGHTS = {
    roleMatch: 0.20,
    capabilityMatch: 0.30,
    performanceMatch: 0.15,
    costEfficiency: 0.15,
    contextSizeMatch: 0.10,
    complianceMatch: 0.10
  };

  const scores = {};

  // 1. ROLE MATCH (0-100)
  const category = context.category || 'general';
  scores.roleMatch = model.domainStrength[category] || 70;

  // Availability penalties
  if (model.availability === 'research') scores.roleMatch *= 0.5;
  else if (model.availability === 'beta') scores.roleMatch *= 0.9;

  // 2. CAPABILITY MATCH (0-100)
  let requiredCaps = 0;
  let matchedCaps = 0;

  if (context.needsMedicalAccuracy) {
    requiredCaps++;
    if (model.benchmarks.medqa >= 80) matchedCaps++;
    else if (model.domainStrength.clinical >= 80) matchedCaps += 0.7;
  }

  if (context.needsCodeGeneration) {
    requiredCaps++;
    if (model.capabilities.codeExecution || model.benchmarks.humaneval > 80) matchedCaps++;
  }

  if (context.needsLongDocument) {
    requiredCaps++;
    if (model.resources.effectiveContext >= 32000) matchedCaps++;
  }

  if (context.needsMultimodal) {
    requiredCaps++;
    if (model.capabilities.multimodal) matchedCaps++;
  }

  if (context.needsVoice) {
    requiredCaps++;
    if (model.capabilities.voice) matchedCaps++;
  }

  scores.capabilityMatch = requiredCaps > 0 ? (matchedCaps / requiredCaps) * 100 : 100;

  // 3. PERFORMANCE MATCH (0-100)
  const relevantBenchmarks = [];
  if (category === 'clinical') {
    if (model.benchmarks.medqa) relevantBenchmarks.push(model.benchmarks.medqa);
    if (model.benchmarks.mmlu) relevantBenchmarks.push(model.benchmarks.mmlu);
  } else if (category === 'operational') {
    if (model.benchmarks.humaneval) relevantBenchmarks.push(model.benchmarks.humaneval);
    if (model.benchmarks.swebench) relevantBenchmarks.push(model.benchmarks.swebench);
  } else {
    if (model.benchmarks.mmlu) relevantBenchmarks.push(model.benchmarks.mmlu);
  }

  scores.performanceMatch = relevantBenchmarks.length > 0
    ? relevantBenchmarks.reduce((a, b) => a + b, 0) / relevantBenchmarks.length
    : model.domainStrength[category] || 75;

  // 4. COST EFFICIENCY (0-100)
  const blendedCost = (model.resources.inputCostPer1M + model.resources.outputCostPer1M) / 2;
  const maxCost = 50;
  const costScore = Math.max(0, 100 - (blendedCost / maxCost) * 100);
  const performancePerDollar = scores.performanceMatch / Math.max(blendedCost, 0.01);
  const maxPerformancePerDollar = 1000;
  const efficiencyScore = Math.min(100, (performancePerDollar / maxPerformancePerDollar) * 100);
  scores.costEfficiency = costScore * 0.6 + efficiencyScore * 0.4;

  // 5. CONTEXT SIZE MATCH (0-100)
  scores.contextSizeMatch = context.needsLongDocument
    ? model.resources.effectiveContext >= 32000 ? 100 : (model.resources.effectiveContext / 32000) * 100
    : 100;

  // 6. COMPLIANCE MATCH (0-100)
  if (context.mustBeCompliant) {
    let complianceScore = 0;
    if (model.compliance.hipaaCompliant && model.compliance.baaAvailable) complianceScore += 33;
    if (model.compliance.zeroDataRetention) complianceScore += 33;
    if (model.compliance.auditLogging) complianceScore += 34;
    scores.complianceMatch = complianceScore;

    // Critical penalty
    if (context.isSafetyCritical && !model.compliance.hipaaCompliant) {
      scores.complianceMatch = Math.min(scores.complianceMatch, 20);
    }
  } else {
    scores.complianceMatch = 100;
  }

  // OVERALL SCORE
  const overall = Math.round(
    scores.roleMatch * WEIGHTS.roleMatch +
    scores.capabilityMatch * WEIGHTS.capabilityMatch +
    scores.performanceMatch * WEIGHTS.performanceMatch +
    scores.costEfficiency * WEIGHTS.costEfficiency +
    scores.contextSizeMatch * WEIGHTS.contextSizeMatch +
    scores.complianceMatch * WEIGHTS.complianceMatch
  );

  return { overall, dimensions: scores };
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function upgradeAgentsCapabilityBased() {
  console.log('🚀 Starting CAPABILITY-BASED model assignment...\n');
  console.log('📊 Using VITAL Healthcare AI LLM Selection Framework\n');

  // Fetch all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, model, status, metadata, domain_expertise, description');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📋 Analyzing ${agents.length} agents...\n`);

  let updatedCount = 0;

  for (const agent of agents) {
    // Build context from agent
    const context = {
      category: agent.domain_expertise || 'general',
      needsMedicalAccuracy: CAPABILITY_RULES.needsMedicalAccuracy(agent),
      needsCodeGeneration: CAPABILITY_RULES.needsCodeGeneration(agent),
      needsLongDocument: CAPABILITY_RULES.needsLongDocument(agent),
      needsMultimodal: CAPABILITY_RULES.needsMultimodal(agent),
      needsVoice: CAPABILITY_RULES.needsVoice(agent),
      isSafetyCritical: CAPABILITY_RULES.isSafetyCritical(agent),
      mustBeCompliant: CAPABILITY_RULES.needsMedicalAccuracy(agent) || CAPABILITY_RULES.isSafetyCritical(agent)
    };

    // Score all models
    const modelScores = Object.entries(MODEL_DATABASE).map(([modelId, modelData]) => {
      const score = calculateFitnessScore(modelData, agent, context);
      return { modelId, modelData, score: score.overall, dimensions: score.dimensions };
    });

    // Sort by score
    modelScores.sort((a, b) => b.score - a.score);

    // Get best model
    const bestModel = modelScores[0];

    // Check if we should update
    const currentScore = agent.model && MODEL_DATABASE[agent.model]
      ? calculateFitnessScore(MODEL_DATABASE[agent.model], agent, context).overall
      : 0;

    if (bestModel.score > currentScore + 5) {  // At least 5-point improvement
      console.log(`✨ [${agent.display_name}]`);
      console.log(`   Current: ${agent.model || 'none'} (${currentScore})`);
      console.log(`   Best: ${bestModel.modelId} (${bestModel.score})`);
      console.log(`   Capabilities: ${Object.keys(context).filter(k => context[k] === true).join(', ')}`);

      // Create evidence
      const justification = `${context.isSafetyCritical ? 'Safety-critical' : 'Specialized'} agent for ${context.category}. ${bestModel.modelData.description}. Fitness score: ${bestModel.score}/100.`;
      const citation = bestModel.modelData.provider === 'huggingface'
        ? `HuggingFace CuratedHealth. ${bestModel.modelData.description}`
        : bestModel.modelData.provider === 'openai'
        ? 'OpenAI (2025). Model Card and Benchmarks.'
        : bestModel.modelData.provider === 'anthropic'
        ? 'Anthropic (2025). Claude Model Card.'
        : 'Google (2025). Gemini Model Card.';

      // Update agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          model: bestModel.modelId,
          tier: bestModel.modelData.tier,
          temperature: bestModel.modelData.tier === 3 ? 0.2 : bestModel.modelData.tier === 2 ? 0.4 : 0.6,
          max_tokens: bestModel.modelData.tier === 3 ? 4000 : bestModel.modelData.tier === 2 ? 3000 : 2000,
          metadata: {
            ...(agent.metadata || {}),
            model_justification: justification,
            model_citation: citation,
            fitness_score: bestModel.score,
            fitness_dimensions: bestModel.dimensions
          }
        })
        .eq('id', agent.id);

      if (!updateError) {
        updatedCount++;
        console.log(`   ✅ Updated\n`);
      } else {
        console.error(`   ❌ Error:`, updateError.message, '\n');
      }
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Updated: ${updatedCount} agents`);
  console.log(`   ⏭️  Skipped: ${agents.length - updatedCount} agents (already optimal)`);
  console.log(`\n✅ Capability-based upgrade complete!`);
}

// Run
upgradeAgentsCapabilityBased().catch(console.error);
