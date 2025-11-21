/**
 * AGENT ACTIVATION SCRIPT
 *
 * Purpose: Activate high-value inactive agents in batches
 * Usage: node scripts/activate-agents-batch.js [batch-number]
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Batch 1: Clinical & Research Specialists
const BATCH_1_CLINICAL = [
  'clinical-data-manager',
  'clinical-protocol-writer',
  'medical-writer',
  'publication-planner',
  'evidence-generation-planner',
  'drug-information-specialist',
  'infectious-disease-pharmacist',
  'geriatric-medication-specialist',
  'pain-management-specialist',
  'medication-reconciliation-assistant',
  'clinical-operations-coordinator',
  'study-closeout-specialist',
  'site-selection-advisor',
  'patient-recruitment-strategist',
  'informed-consent-developer',
  'investigator-initiated-study-reviewer',
  'clinical-trial-budget-estimator',
  'needs-assessment-coordinator',
  'congress-planning-specialist',
  'medical-science-liaison-coordinator'
];

// Batch 2: Regulatory & Compliance Specialists
const BATCH_2_REGULATORY = [
  'regulatory-intelligence-analyst',
  'gmp-compliance-advisor',
  'quality-systems-auditor',
  'deviation-investigator',
  'change-control-manager',
  'document-control-specialist',
  'training-coordinator',
  'capa-coordinator',
  'validation-specialist',
  'cleaning-validation-specialist',
  'equipment-qualification-specialist',
  'batch-record-reviewer',
  'quality-metrics-analyst',
  'supplier-quality-manager',
  'hta-submission-specialist',
  'formulary-strategy-specialist',
  'formulary-advisor',
  'prior-authorization-navigator',
  'patient-access-coordinator',
  'reimbursement-analyst'
];

// Batch 3: Operations & Business Specialists
const BATCH_3_OPERATIONS = [
  'manufacturing-capacity-planner',
  'production-scheduler',
  'materials-management-coordinator',
  'technology-transfer-coordinator',
  'process-optimization-analyst',
  'scale-up-specialist',
  'manufacturing-deviation-handler',
  'health-economics-modeler',
  'value-dossier-developer',
  'payer-strategy-advisor',
  'pricing-strategy-advisor',
  'managed-care-contracting-specialist',
  'kol-engagement-coordinator',
  'medical-affairs-metrics-analyst',
  'medical-information-specialist',
  'advisory-board-organizer',
  'market-access-coordinator',
  'product-launch-coordinator',
  'lifecycle-management-advisor',
  'competitive-intelligence-analyst'
];

const BATCHES = {
  1: { name: 'Clinical & Research', agents: BATCH_1_CLINICAL },
  2: { name: 'Regulatory & Compliance', agents: BATCH_2_REGULATORY },
  3: { name: 'Operations & Business', agents: BATCH_3_OPERATIONS }
};

async function activateAgentBatch(batchNumber) {
  const batch = BATCHES[batchNumber];

  if (!batch) {
    console.error('❌ Invalid batch number. Choose 1, 2, or 3.');
    console.log('');
    console.log('Available batches:');
    Object.entries(BATCHES).forEach(([num, b]) => {
      console.log(`  ${num}. ${b.name} (${b.agents.length} agents)`);
    });
    return;
  }

  console.log(`🚀 ACTIVATING BATCH ${batchNumber}: ${batch.name}`);
  console.log('='.repeat(60));
  console.log(`Agents to activate: ${batch.agents.length}`);
  console.log('');

  let successCount = 0;
  let notFoundCount = 0;
  let alreadyActiveCount = 0;
  let errorCount = 0;

  for (const agentName of batch.agents) {
    try {
      // Check current status
      const { data: existing, error: checkError } = await supabase
        .from('agents')
        .select('id, display_name, status')
        .eq('name', agentName)
        .single();

      if (checkError || !existing) {
        console.log(`⚠️  ${agentName}: Not found in database`);
        notFoundCount++;
        continue;
      }

      if (existing.status === 'active') {
        console.log(`✓  ${existing.display_name}: Already active`);
        alreadyActiveCount++;
        continue;
      }

      // Activate agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`❌ ${existing.display_name}: ${updateError.message}`);
        errorCount++;
        continue;
      }

      console.log(`✅ ${existing.display_name}: Activated`);
      successCount++;

    } catch (error) {
      console.error(`❌ ${agentName}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('📊 ACTIVATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully activated: ${successCount}`);
  console.log(`✓  Already active: ${alreadyActiveCount}`);
  console.log(`⚠️  Not found: ${notFoundCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('');

  // Get updated active count
  const { count } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log(`📈 Total active agents: ${count}`);
  console.log('');

  if (successCount > 0) {
    console.log('✨ Activation complete! Visit http://localhost:3000/agents to see the new agents.');
  }
}

async function showBatchSummary() {
  console.log('📋 AGENT ACTIVATION BATCHES');
  console.log('='.repeat(60));
  console.log('');

  for (const [num, batch] of Object.entries(BATCHES)) {
    console.log(`Batch ${num}: ${batch.name}`);
    console.log(`  Agents: ${batch.agents.length}`);
    console.log(`  Examples: ${batch.agents.slice(0, 3).join(', ')}...`);
    console.log('');
  }

  console.log('Usage:');
  console.log('  node scripts/activate-agents-batch.js 1  # Activate Clinical & Research');
  console.log('  node scripts/activate-agents-batch.js 2  # Activate Regulatory & Compliance');
  console.log('  node scripts/activate-agents-batch.js 3  # Activate Operations & Business');
  console.log('');

  // Show current status
  const { count: totalActive } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalInactive } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'inactive');

  console.log('Current Status:');
  console.log(`  Active agents: ${totalActive}`);
  console.log(`  Inactive agents: ${totalInactive}`);
  console.log(`  Available to activate: ${BATCH_1_CLINICAL.length + BATCH_2_REGULATORY.length + BATCH_3_OPERATIONS.length}`);
}

// Main execution
const batchNumber = parseInt(process.argv[2]);

if (batchNumber) {
  activateAgentBatch(batchNumber).catch(console.error);
} else {
  showBatchSummary().catch(console.error);
}
