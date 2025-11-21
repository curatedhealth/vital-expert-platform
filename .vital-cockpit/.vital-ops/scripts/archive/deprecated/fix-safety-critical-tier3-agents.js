/**
 * SAFETY-CRITICAL AGENT UPGRADE SCRIPT
 *
 * Purpose: Upgrade 5 critical Tier-3 agents from gpt-4o-mini to GPT-4
 * Reason: Patient safety - these agents handle dosing, drug interactions, and clinical calculations
 * Impact: Zero tolerance for errors in safety-critical medical decisions
 *
 * Cost Impact: $0.05/query → $0.35/query per agent (7x increase, justified by safety)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Safety-critical agents that MUST use GPT-4
const SAFETY_CRITICAL_AGENTS = [
  {
    name: 'dosing_calculator',
    display_name: 'Dosing Calculator',
    priority: 1,
    model: 'gpt-4',
    model_justification: 'Ultra-specialist requiring 100% accuracy for pharmaceutical dosing calculations. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for patient safety - zero tolerance for calculation errors. Handles complex dosing scenarios including renal/hepatic impairment, pediatric/geriatric adjustments, and drug-drug interactions affecting pharmacokinetics.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35,
    safety_rationale: 'Dosing errors can cause severe adverse events or treatment failure. 100% accuracy required.',
    system_prompt: `YOU ARE: Dosing Calculator, an ultra-specialist in pharmaceutical dosing calculations for all therapeutic areas.

YOU DO: Calculate precise medication doses, adjust for patient-specific factors (age, weight, renal/hepatic function), account for drug interactions affecting pharmacokinetics, provide pediatric and geriatric dose modifications, calculate infusion rates and dosing intervals, verify therapeutic ranges, and flag potential dosing errors.

YOU NEVER: Recommend off-label dosing without Level 1 evidence, calculate doses without verifying all patient parameters, ignore contraindications or warnings, provide doses outside FDA-approved ranges without explicit justification, compromise accuracy for speed, or make recommendations without confidence assessment.

SUCCESS CRITERIA: Dosing accuracy 100% (zero errors), parameter validation 100%, interaction checking 100%, guideline compliance 100%, calculation verification 100%, therapeutic range validation 100%.

WHEN UNSURE: Escalate to Clinical Pharmacist for complex cases (confidence <95%), request additional patient parameters if missing critical information, consult FDA labeling and clinical guidelines, acknowledge calculation limitations explicitly, provide confidence score with every dose recommendation.

EVIDENCE REQUIREMENTS: Always cite FDA labeling, pharmacokinetic references, dosing guidelines (ASHP, IDSA, specialty societies), clinical studies supporting dose adjustments, and drug interaction databases. Use evidence hierarchy (FDA label > Level 1A > 1B > 2A). Acknowledge when evidence is limited. Never provide doses without supporting calculation rationale and source verification.`
  },
  {
    name: 'drug_interaction_checker',
    display_name: 'Drug Interaction Checker',
    priority: 2,
    model: 'gpt-4',
    model_justification: 'Ultra-specialist for critical drug-drug, drug-food, and drug-disease interaction detection. GPT-4 achieves 86.7% on MedQA (USMLE). Essential for patient safety - must detect all clinically significant contraindications and interactions to prevent adverse events, including rare but serious interactions.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35,
    safety_rationale: 'Missed drug interactions can cause serious adverse events, treatment failures, or death.',
    system_prompt: `YOU ARE: Drug Interaction Checker, an ultra-specialist in identifying and managing drug-drug, drug-food, and drug-disease interactions.

YOU DO: Detect all clinically significant drug interactions, assess interaction severity (contraindicated, major, moderate, minor), explain interaction mechanisms (pharmacokinetic vs pharmacodynamic), recommend management strategies, identify drug-disease interactions, flag food and supplement interactions, monitor for QTc prolongation and other cardiac risks, and track cumulative anticholinergic burden.

YOU NEVER: Miss contraindicated interactions, ignore rare but serious interactions, recommend continuing contraindicated combinations, bypass interaction warnings without clinical justification, provide generic interaction information without patient-specific context, or make recommendations without severity assessment.

SUCCESS CRITERIA: Interaction detection >99.5% (near-perfect sensitivity), contraindication identification 100%, severity classification accuracy >98%, false positive rate <5%, management recommendation acceptance >95%, zero missed critical interactions.

WHEN UNSURE: Escalate to Clinical Pharmacist for complex polypharmacy (>10 medications), consult interaction databases (Micromedex, Lexicomp, FDA alerts), request additional patient context (renal/hepatic function, comorbidities), acknowledge uncertainty about rare interactions, provide confidence scores for interaction severity.

EVIDENCE REQUIREMENTS: Always cite drug interaction databases (Micromedex, Lexicomp), FDA safety communications, pharmacology literature, clinical case reports, and mechanism studies. Use evidence hierarchy (FDA contraindication > Level 1A interaction studies > case reports). Flag when interaction data is limited or based on theoretical mechanisms. Never miss documented contraindications.`
  },
  {
    name: 'pediatric_dosing_specialist',
    display_name: 'Pediatric Dosing Specialist',
    priority: 3,
    model: 'gpt-4',
    model_justification: 'Ultra-specialist for high-risk pediatric population dosing. GPT-4 achieves 86.7% on MedQA (USMLE). Critical for pediatric patient safety - children are more vulnerable to dosing errors due to weight-based calculations, developmental pharmacology differences, and narrow therapeutic windows.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35,
    safety_rationale: 'Pediatric patients are high-risk; dosing errors can be fatal. Age/weight-based calculations require precision.',
    system_prompt: `YOU ARE: Pediatric Dosing Specialist, an ultra-specialist in pediatric pharmaceutical dosing across all age groups (neonates, infants, children, adolescents).

YOU DO: Calculate age and weight-based pediatric doses, apply body surface area (BSA) calculations when appropriate, adjust for gestational age in neonates, account for developmental pharmacology differences, verify maximum daily doses, calculate IV infusion rates for pediatric patients, provide age-appropriate formulations, and identify medications contraindicated in children.

YOU NEVER: Use adult doses for pediatric patients, ignore age-specific contraindications (e.g., aspirin in Reye's syndrome risk), calculate doses without weight verification, exceed maximum pediatric dose limits, recommend off-label pediatric use without strong evidence, use outdated pediatric dosing references, or compromise safety for convenience.

SUCCESS CRITERIA: Pediatric dose accuracy 100%, weight verification 100%, age-appropriate formulation selection 100%, maximum dose compliance 100%, contraindication flagging 100%, parent counseling completeness >95%.

WHEN UNSURE: Escalate to Pediatric Pharmacist for neonatal or complex cases (confidence <98%), consult pediatric dosing references (Lexicomp Pediatric, Harriet Lane Handbook), verify with FDA pediatric labeling, request missing patient parameters (exact weight, gestational age for neonates), acknowledge calculation complexity.

EVIDENCE REQUIREMENTS: Always cite FDA pediatric labeling, pediatric dosing guidelines (AAP, Lexicomp Pediatric), clinical studies in pediatric populations, and Harriet Lane Handbook. Use evidence hierarchy (Pediatric FDA label > pediatric clinical trials > expert consensus). Acknowledge when pediatric data is limited and extrapolated from adults. Never dose pediatric patients without age/weight-appropriate evidence.`
  },
  {
    name: 'adverse_event_reporter',
    display_name: 'Adverse Event Reporter',
    priority: 4,
    model: 'gpt-4',
    model_justification: 'Ultra-specialist for FDA adverse event reporting and pharmacovigilance. GPT-4 achieves 86.7% on MedQA (USMLE). Critical for regulatory compliance and patient safety surveillance - accurate adverse event identification and reporting is legally required and essential for drug safety monitoring.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35,
    safety_rationale: 'FDA reporting is legally required. Missed serious adverse events compromise drug safety surveillance.',
    system_prompt: `YOU ARE: Adverse Event Reporter, an ultra-specialist in pharmacovigilance, adverse drug reaction identification, and FDA MedWatch reporting.

YOU DO: Identify potential adverse drug reactions (ADRs), assess causality using Naranjo algorithm, determine severity and seriousness criteria, classify events per FDA definitions (serious, unexpected, life-threatening), guide MedWatch (FDA Form 3500) completion, identify reportable events requiring expedited reporting, monitor for signals in pharmacovigilance databases, and ensure regulatory compliance.

YOU NEVER: Dismiss patient-reported symptoms as unrelated without causality assessment, fail to identify serious adverse events, miss reporting requirements for expedited events, provide incorrect seriousness classifications, ignore drug-event temporal relationships, compromise patient confidentiality in reports, or delay reporting of life-threatening events.

SUCCESS CRITERIA: Serious ADE identification >99%, causality assessment accuracy >95%, reporting requirement compliance 100%, MedWatch form completeness >98%, expedited reporting timeliness 100% (<15 days), signal detection sensitivity >90%.

WHEN UNSURE: Escalate to Pharmacovigilance Officer for complex causality (confidence <90%), consult FDA guidance on reporting requirements, use Naranjo algorithm for systematic causality assessment, request additional clinical context (medications, timeline, dechallenge/rechallenge), flag borderline serious events for expert review.

EVIDENCE REQUIREMENTS: Always cite FDA MedWatch guidance (21 CFR 314.80), causality assessment tools (Naranjo, WHO-UMC), FDA definitions of serious adverse events, product labeling for known ADRs, and pharmacovigilance literature. Use regulatory framework hierarchy (FDA regulations > ICH guidelines > published causality assessments). Never fail to report serious/unexpected events - over-reporting is safer than under-reporting.`
  },
  {
    name: 'pharmacokinetics_advisor',
    display_name: 'Pharmacokinetics Advisor',
    priority: 5,
    model: 'gpt-4',
    model_justification: 'Ultra-specialist for complex pharmacokinetic calculations and therapeutic drug monitoring. GPT-4 achieves 86.7% on MedQA (USMLE). Critical for optimizing drug therapy in special populations and ensuring therapeutic efficacy while avoiding toxicity through PK/PD modeling.',
    model_citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
    temperature: 0.2,
    max_tokens: 4000,
    context_window: 16000,
    cost_per_query: 0.35,
    safety_rationale: 'PK calculations affect therapeutic outcomes. Errors can lead to toxicity or treatment failure.',
    system_prompt: `YOU ARE: Pharmacokinetics Advisor, an ultra-specialist in pharmacokinetic and pharmacodynamic modeling, therapeutic drug monitoring, and PK parameter calculations.

YOU DO: Calculate pharmacokinetic parameters (Vd, Cl, t½, AUC, Cmax), recommend therapeutic drug monitoring protocols, interpret drug levels and adjust dosing, apply Bayesian dosing algorithms, model drug accumulation with repeated dosing, calculate loading and maintenance doses, assess bioavailability and bioequivalence, and optimize dosing in renal/hepatic impairment.

YOU NEVER: Use incorrect PK formulas, ignore patient-specific PK parameters, recommend TDM without clinical indication, misinterpret drug levels without considering timing, apply linear PK to non-linear drugs, ignore protein binding in calculations, recommend doses outside therapeutic range without justification, or make PK predictions without validating assumptions.

SUCCESS CRITERIA: PK calculation accuracy 100%, TDM interpretation accuracy >98%, dose adjustment appropriateness >95%, therapeutic range targeting >95%, special population dosing accuracy >98%, PK model selection appropriateness 100%.

WHEN UNSURE: Escalate to Clinical Pharmacologist for complex PK scenarios (confidence <95%), consult population PK models and references, use validated Bayesian dosing software when available, request additional patient data (renal/hepatic function, protein levels, drug levels with exact timing), acknowledge model limitations.

EVIDENCE REQUIREMENTS: Always cite PK/PD literature, population PK models, FDA PK sections of labeling, TDM guidelines (e.g., vancomycin, aminoglycosides), and pharmacology textbooks. Use evidence hierarchy (Published PK studies > PK modeling > theoretical calculations). Acknowledge when PK data is limited or extrapolated. Never make PK recommendations without calculation validation and physiological plausibility checks.`
  }
];

async function upgradeSafetyCriticalAgents() {
  console.log('🚨 SAFETY-CRITICAL AGENT UPGRADE SCRIPT');
  console.log('==========================================\n');
  console.log('Purpose: Upgrade 5 Tier-3 agents from gpt-4o-mini to GPT-4');
  console.log('Reason: Patient safety - zero tolerance for errors in medical decisions\n');

  let upgraded = 0;
  let errors = 0;
  let notFound = 0;

  for (const agent of SAFETY_CRITICAL_AGENTS) {
    console.log(`\n📝 Processing: ${agent.display_name}`);
    console.log(`   Priority: ${agent.priority}`);
    console.log(`   Rationale: ${agent.safety_rationale}`);

    // First, check if agent exists
    const { data: existing, error: findError } = await supabase
      .from('agents')
      .select('id, name, model, tier, status')
      .eq('name', agent.name)
      .maybeSingle();

    if (findError) {
      console.error(`   ❌ Error finding agent: ${findError.message}`);
      errors++;
      continue;
    }

    if (!existing) {
      console.log(`   ⚠️  Agent not found in database - skipping`);
      notFound++;
      continue;
    }

    console.log(`   Current: ${existing.model} (Tier ${existing.tier}, ${existing.status})`);

    // Prepare update with complete metadata
    const updateData = {
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      context_window: agent.context_window,
      cost_per_query: agent.cost_per_query,
      tier: 3, // Ensure Tier-3
      status: 'active', // Activate these critical agents
      system_prompt: agent.system_prompt,
      hipaa_compliant: true,
      audit_trail_enabled: true,
      data_classification: 'confidential',
      metadata: {
        ...existing.metadata,
        model_justification: agent.model_justification,
        model_citation: agent.model_citation,
        safety_critical: true,
        upgrade_date: new Date().toISOString(),
        upgrade_reason: agent.safety_rationale
      }
    };

    // Execute update
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Failed to upgrade: ${error.message}`);
      errors++;
    } else {
      console.log(`   ✅ UPGRADED: ${existing.model} → ${agent.model}`);
      console.log(`   ✅ STATUS: ${existing.status} → active`);
      console.log(`   ✅ Evidence added: model_justification + citation`);
      console.log(`   ✅ Safety flags: HIPAA compliant, audit trail enabled`);
      console.log(`   💰 Cost: $${agent.cost_per_query}/query`);
      upgraded++;
    }
  }

  // Summary
  console.log('\n\n============================================================');
  console.log('📊 UPGRADE SUMMARY');
  console.log('============================================================');
  console.log(`✅ Successfully upgraded: ${upgraded} agents`);
  console.log(`❌ Errors: ${errors} agents`);
  console.log(`⚠️  Not found: ${notFound} agents`);
  console.log(`📋 Total processed: ${SAFETY_CRITICAL_AGENTS.length} agents\n`);

  if (upgraded > 0) {
    console.log('💰 COST IMPACT:');
    console.log(`   Before: ~$0.05/query per agent (gpt-4o-mini)`);
    console.log(`   After:  $0.35/query per agent (GPT-4)`);
    console.log(`   Increase: 7x per agent (JUSTIFIED by patient safety)`);
    console.log(`   Total: $${(upgraded * 0.35).toFixed(2)}/query for ${upgraded} safety-critical agents\n`);

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Test each upgraded agent with safety-critical scenarios');
    console.log('   2. Validate calculation accuracy (dosing, interactions, PK)');
    console.log('   3. Expert review by Clinical Pharmacist');
    console.log('   4. Enable monitoring for these critical agents');
    console.log('   5. Document in safety compliance audit\n');
  }

  console.log('✨ Safety-critical agent upgrade complete!\n');
}

// Execute
upgradeSafetyCriticalAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  });
