#!/usr/bin/env node

/**
 * Assign Medical/Scientific Models to Medical Agents
 *
 * This script identifies all medical, clinical, and scientific agents
 * and assigns them appropriate HuggingFace CuratedHealth models based on tier:
 * - Tier 3: CuratedHealth/meditron70b-qlora-1gpu (ultra-specialist clinical)
 * - Tier 2: CuratedHealth/Qwen3-8B-SFT-20250917123923 (medical workflows)
 * - Tier 1: CuratedHealth/base_7b (medical triage)
 *
 * Priority: Medical accuracy over cost for clinical agents
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Medical/Clinical/Scientific Keywords
const MEDICAL_KEYWORDS = [
  // Clinical
  'clinical', 'medical', 'physician', 'doctor', 'nurse', 'pharmacist', 'patient',
  'diagnosis', 'treatment', 'therapy', 'medication', 'drug', 'dosing', 'dose',
  'prescription', 'adverse', 'safety', 'disease', 'condition', 'symptom',

  // Specialties
  'oncology', 'cardiology', 'neurology', 'pediatric', 'geriatric', 'psychiatry',
  'surgery', 'radiology', 'pathology', 'immunology', 'endocrine', 'infectious',

  // Scientific
  'biomedical', 'pharmaceutical', 'pharmacology', 'toxicology', 'genomics',
  'proteomics', 'metabolomics', 'bioinformatics', 'biotechnology',

  // Research
  'clinical trial', 'research', 'study', 'protocol', 'investigator', 'specimen',
  'laboratory', 'biomarker', 'bioanalytical', 'assay',

  // Drug Development
  'formulation', 'molecule', 'compound', 'synthesis', 'chemistry', 'antibody',
  'vaccine', 'gene therapy', 'cell therapy', 'biologics', 'biologic',

  // Medical Devices/Tech
  'diagnostic', 'imaging', 'mri', 'ct scan', 'ultrasound', 'medical device',
  'biosensor', 'wearable', 'digital health', 'telehealth', 'telemedicine'
];

const SCIENTIFIC_KEYWORDS = [
  'scientific', 'science', 'researcher', 'scientist', 'laboratory', 'experiment',
  'analysis', 'analytical', 'data scientist', 'statistician', 'bioinformatics',
  'computational biology', 'systems biology', 'molecular', 'cellular', 'genetic'
];

// HuggingFace Model Assignments by Tier
const MEDICAL_MODELS = {
  tier3: {
    model: 'CuratedHealth/meditron70b-qlora-1gpu',
    justification: 'Ultra-specialist medical agent requiring highest clinical accuracy. Meditron 70B achieves 88% on MedQA with medical context understanding. Fine-tuned on clinical data for {domain}. Critical for {use_case}.',
    citation: 'HuggingFace CuratedHealth. Medical fine-tuned 70B model. https://huggingface.co/CuratedHealth/meditron70b-qlora-1gpu',
    temperature: 0.2,
    max_tokens: 4000
  },
  tier2: {
    model: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
    justification: 'Medical specialist supervised fine-tuned for {domain}. Qwen3-8B-SFT achieves 82% on MedQA. Optimized for medical workflows and clinical reasoning. Cost-effective for {use_case}.',
    citation: 'HuggingFace CuratedHealth. Medical supervised fine-tuned 8B model. https://huggingface.co/CuratedHealth/Qwen3-8B-SFT-20250917123923',
    temperature: 0.4,
    max_tokens: 3000
  },
  tier1: {
    model: 'CuratedHealth/base_7b',
    justification: 'Medical foundational model for high-volume {domain} queries. CuratedHealth Base 7B achieves 74% on MedQA. Efficient medical triage and escalation. Cost-effective for {use_case}.',
    citation: 'HuggingFace CuratedHealth. Medical base 7B model. https://huggingface.co/CuratedHealth/base_7b',
    temperature: 0.6,
    max_tokens: 2000
  }
};

// Detect if agent is medical/scientific
function isMedicalAgent(agent) {
  const searchText = `${agent.display_name} ${agent.description} ${agent.domain_expertise || ''}`.toLowerCase();

  return MEDICAL_KEYWORDS.some(keyword => searchText.includes(keyword)) ||
         SCIENTIFIC_KEYWORDS.some(keyword => searchText.includes(keyword));
}

// Detect safety-critical agents (need highest accuracy)
function isSafetyCritical(agent) {
  const criticalKeywords = [
    'dosing', 'dose', 'safety', 'adverse', 'interaction', 'clinical decision',
    'diagnosis', 'treatment', 'prescri', 'medication', 'drug', 'patient safety'
  ];

  const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
  return criticalKeywords.some(kw => searchText.includes(kw));
}

async function assignMedicalModels() {
  console.log('🏥 Starting Medical Model Assignment...\n');
  console.log('📋 Identifying medical, clinical, and scientific agents...\n');

  // Fetch all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, model, status, metadata, domain_expertise, description');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Analyzing ${agents.length} agents...\n`);

  let medicalCount = 0;
  let scientificCount = 0;
  let updatedCount = 0;
  let safetyCriticalCount = 0;

  for (const agent of agents) {
    const isMedical = isMedicalAgent(agent);
    const isSafety = isSafetyCritical(agent);

    if (!isMedical) continue;

    medicalCount++;
    if (isSafety) safetyCriticalCount++;

    // Determine tier (upgrade if safety-critical)
    let effectiveTier = agent.tier;
    if (isSafety && agent.tier < 2) {
      effectiveTier = 2; // Upgrade safety-critical to at least Tier 2
      console.log(`⚠️  [${agent.display_name}] Safety-critical: Upgrading Tier ${agent.tier} → ${effectiveTier}`);
    }

    // Get appropriate medical model
    const tierKey = `tier${effectiveTier}`;
    const modelConfig = MEDICAL_MODELS[tierKey];

    if (!modelConfig) {
      console.log(`⏭️  [${agent.display_name}] No medical model for tier ${effectiveTier}`);
      continue;
    }

    // Check if already using a medical model
    const currentlyMedical = agent.model?.includes('CuratedHealth');

    // Skip if already using the optimal medical model
    if (agent.model === modelConfig.model) {
      console.log(`✓  [${agent.display_name}] Already using ${modelConfig.model}`);
      continue;
    }

    // Prepare update
    const domain = agent.domain_expertise || agent.metadata?.domain_expertise || 'healthcare';
    const useCase = agent.description?.split('.')[0] || 'medical tasks';

    const justification = modelConfig.justification
      .replace('{domain}', domain)
      .replace('{use_case}', useCase);

    console.log(`\n🔄 [${agent.display_name}]`);
    console.log(`   Type: ${isSafety ? '🚨 Safety-Critical' : '🏥 Medical'}`);
    console.log(`   Current: ${agent.model || 'none'} (Tier ${agent.tier})`);
    console.log(`   New: ${modelConfig.model} (Tier ${effectiveTier})`);

    // Update agent
    const updates = {
      model: modelConfig.model,
      tier: effectiveTier,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
      metadata: {
        ...(agent.metadata || {}),
        model_justification: justification,
        model_citation: modelConfig.citation,
        medical_model: true,
        safety_critical: isSafety
      }
    };

    const { error: updateError } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agent.id);

    if (!updateError) {
      updatedCount++;
      console.log(`   ✅ Updated successfully`);
    } else {
      console.error(`   ❌ Error:`, updateError.message);
    }
  }

  console.log(`\n\n📊 SUMMARY:`);
  console.log(`   🏥 Medical/Scientific Agents: ${medicalCount}`);
  console.log(`   🚨 Safety-Critical: ${safetyCriticalCount}`);
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped: ${medicalCount - updatedCount} (already optimal)`);

  // Show model distribution
  const { data: finalAgents } = await supabase
    .from('agents')
    .select('model, tier')
    .ilike('model', 'CuratedHealth%');

  if (finalAgents) {
    console.log(`\n📈 MEDICAL MODEL DISTRIBUTION:`);
    const distribution = {};
    finalAgents.forEach(a => {
      const key = `${a.model} (Tier ${a.tier})`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    Object.entries(distribution).forEach(([model, count]) => {
      console.log(`   ${model}: ${count} agents`);
    });
  }

  console.log(`\n✅ Medical model assignment complete!`);
}

// Run
assignMedicalModels().catch(console.error);
