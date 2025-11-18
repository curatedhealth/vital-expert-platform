const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 30 Knowledge Domains organized by tier
const knowledgeDomains = {
  // TIER 1: CORE DOMAINS (15) - Must Have
  tier1: [
    {
      code: 'REG_AFFAIRS',
      name: 'Regulatory Affairs',
      slug: 'regulatory_affairs',
      description: 'FDA, EMA, ICH guidelines, regulatory strategy, submissions, and compliance',
      tier: 1,
      priority: 1,
      keywords: ['fda', 'ema', 'ich', 'regulatory', 'compliance', 'submissions', 'guidance'],
      sub_domains: ['fda_regulations', 'ema_regulations', 'ich_guidelines', 'regulatory_strategy', 'submission_management'],
      agent_count_estimate: 85,
      color: '#3B82F6' // blue
    },
    {
      code: 'CLIN_DEV',
      name: 'Clinical Development',
      slug: 'clinical_development',
      description: 'Clinical trial design, protocol development, study management, and clinical operations',
      tier: 1,
      priority: 2,
      keywords: ['clinical trials', 'protocols', 'study design', 'endpoints', 'site management'],
      sub_domains: ['protocol_design', 'clinical_operations', 'study_management', 'endpoint_selection', 'site_management'],
      agent_count_estimate: 37,
      color: '#8B5CF6' // purple
    },
    {
      code: 'PV',
      name: 'Pharmacovigilance',
      slug: 'pharmacovigilance',
      description: 'Drug safety monitoring, adverse event reporting, signal detection, and risk management',
      tier: 1,
      priority: 3,
      keywords: ['safety', 'adverse events', 'signal detection', 'pvg', 'safety surveillance'],
      sub_domains: ['adverse_event_reporting', 'signal_detection', 'risk_management', 'safety_surveillance', 'benefit_risk_assessment'],
      agent_count_estimate: 25,
      color: '#EF4444' // red
    },
    {
      code: 'QM',
      name: 'Quality Management',
      slug: 'quality_management',
      description: 'Quality assurance, quality control, GMP compliance, validation, and auditing',
      tier: 1,
      priority: 4,
      keywords: ['quality', 'qa', 'qc', 'gmp', 'validation', 'audit'],
      sub_domains: ['quality_assurance', 'quality_control', 'gmp_compliance', 'validation', 'audit_management'],
      agent_count_estimate: 20,
      color: '#10B981' // green
    },
    {
      code: 'MED_AFF',
      name: 'Medical Affairs',
      slug: 'medical_affairs',
      description: 'Medical science liaisons, medical writing, scientific communication, and publication planning',
      tier: 1,
      priority: 5,
      keywords: ['msl', 'medical writing', 'scientific communication', 'publications', 'medical information'],
      sub_domains: ['medical_information', 'scientific_communication', 'medical_writing', 'msl_activities', 'publication_planning'],
      agent_count_estimate: 15,
      color: '#06B6D4' // cyan
    },
    {
      code: 'COMM_STRAT',
      name: 'Commercial Strategy',
      slug: 'commercial_strategy',
      description: 'Market access, reimbursement, pricing strategy, brand management, and launch planning',
      tier: 1,
      priority: 6,
      keywords: ['market access', 'reimbursement', 'pricing', 'brand', 'commercial', 'launch'],
      sub_domains: ['market_access', 'reimbursement', 'pricing_strategy', 'brand_management', 'launch_planning'],
      agent_count_estimate: 29,
      color: '#F59E0B' // amber
    },
    {
      code: 'DRUG_DEV',
      name: 'Drug Development',
      slug: 'drug_development',
      description: 'Drug discovery, preclinical development, translational medicine, and formulation',
      tier: 1,
      priority: 7,
      keywords: ['discovery', 'preclinical', 'translational', 'r&d', 'research', 'development'],
      sub_domains: ['drug_discovery', 'preclinical_development', 'translational_medicine', 'biomarker_research', 'formulation_development'],
      agent_count_estimate: 39,
      color: '#8B5CF6' // purple
    },
    {
      code: 'CLIN_DATA',
      name: 'Clinical Data Analytics',
      slug: 'clinical_data_analytics',
      description: 'Biostatistics, data management, statistical analysis, and clinical programming',
      tier: 1,
      priority: 8,
      keywords: ['biostatistics', 'data management', 'statistics', 'sas', 'clinical data'],
      sub_domains: ['biostatistics', 'data_management', 'statistical_analysis', 'clinical_programming', 'data_visualization'],
      agent_count_estimate: 18,
      color: '#6366F1' // indigo
    },
    {
      code: 'MFG_OPS',
      name: 'Manufacturing Operations',
      slug: 'manufacturing_operations',
      description: 'Drug product/substance manufacturing, process development, scale-up, and tech transfer',
      tier: 1,
      priority: 9,
      keywords: ['manufacturing', 'cmc', 'process', 'production', 'scale-up'],
      sub_domains: ['drug_product_manufacturing', 'drug_substance_manufacturing', 'process_development', 'scale_up', 'tech_transfer'],
      agent_count_estimate: 17,
      color: '#78716C' // stone
    },
    {
      code: 'MED_DEV',
      name: 'Medical Devices',
      slug: 'medical_devices',
      description: 'Device classification, 510(k) pathway, PMA submissions, design controls, and device regulation',
      tier: 1,
      priority: 10,
      keywords: ['medical devices', '510k', 'pma', 'device', 'classification'],
      sub_domains: ['device_classification', '510k_pathway', 'pma_submissions', 'design_controls', 'post_market_surveillance'],
      agent_count_estimate: 12,
      color: '#EC4899' // pink
    },
    {
      code: 'DIGITAL_HEALTH',
      name: 'Digital Health',
      slug: 'digital_health',
      description: 'Health technology, AI/ML applications, SaMD regulation, connected health, and digital therapeutics',
      tier: 1,
      priority: 11,
      keywords: ['digital health', 'ai', 'ml', 'samd', 'software', 'health tech'],
      sub_domains: ['health_technology', 'ai_ml_applications', 'samd_regulation', 'connected_health', 'digital_therapeutics'],
      agent_count_estimate: 34,
      color: '#14B8A6' // teal
    },
    {
      code: 'SUPPLY_CHAIN',
      name: 'Supply Chain',
      slug: 'supply_chain',
      description: 'Supply planning, distribution, cold chain logistics, inventory optimization, and vendor management',
      tier: 1,
      priority: 12,
      keywords: ['supply chain', 'logistics', 'distribution', 'inventory', 'cold chain'],
      sub_domains: ['supply_planning', 'distribution_management', 'cold_chain_logistics', 'inventory_optimization', 'vendor_management'],
      agent_count_estimate: 15,
      color: '#84CC16' // lime
    },
    {
      code: 'LEGAL_COMP',
      name: 'Legal & Compliance',
      slug: 'legal_compliance',
      description: 'Healthcare law, HIPAA compliance, intellectual property, contract management, and data privacy',
      tier: 1,
      priority: 13,
      keywords: ['legal', 'compliance', 'hipaa', 'privacy', 'contracts', 'ip'],
      sub_domains: ['healthcare_law', 'hipaa_compliance', 'intellectual_property', 'contract_management', 'data_privacy'],
      agent_count_estimate: 10,
      color: '#64748B' // slate
    },
    {
      code: 'HEOR',
      name: 'Health Economics & Outcomes Research',
      slug: 'health_economics',
      description: 'Health outcomes research, economic modeling, cost-effectiveness, value demonstration',
      tier: 1,
      priority: 14,
      keywords: ['heor', 'health economics', 'outcomes', 'cost-effectiveness', 'value'],
      sub_domains: ['health_outcomes_research', 'economic_modeling', 'cost_effectiveness_analysis', 'value_demonstration', 'comparative_effectiveness'],
      agent_count_estimate: 12,
      color: '#22C55E' // green
    },
    {
      code: 'BIZ_STRAT',
      name: 'Business Strategy',
      slug: 'business_strategy',
      description: 'Strategic planning, licensing, partnerships, competitive intelligence, and portfolio management',
      tier: 1,
      priority: 15,
      keywords: ['business development', 'strategy', 'licensing', 'partnerships', 'bd'],
      sub_domains: ['strategic_planning', 'licensing', 'partnerships', 'competitive_intelligence', 'portfolio_management'],
      agent_count_estimate: 10,
      color: '#F97316' // orange
    }
  ],

  // TIER 2: SPECIALIZED DOMAINS (10) - High Value
  tier2: [
    {
      code: 'PROD_LABEL',
      name: 'Product Labeling',
      slug: 'product_labeling',
      description: 'Labeling requirements, prescribing information, patient information, and IFU',
      tier: 2,
      priority: 16,
      keywords: ['labeling', 'prescribing information', 'package insert', 'patient information'],
      sub_domains: ['prescribing_information', 'patient_labeling', 'ifu', 'labeling_changes'],
      agent_count_estimate: 8,
      color: '#A855F7' // purple
    },
    {
      code: 'POST_MKT',
      name: 'Post-Market Activities',
      slug: 'post_market_activities',
      description: 'Real-world evidence, post-market surveillance, periodic safety reports, and PMCF',
      tier: 2,
      priority: 17,
      keywords: ['post-market', 'rwe', 'real-world', 'surveillance', 'psur'],
      sub_domains: ['real_world_evidence', 'surveillance', 'periodic_safety_reports', 'pmcf'],
      agent_count_estimate: 10,
      color: '#FB923C' // orange
    },
    {
      code: 'CDX',
      name: 'Companion Diagnostics',
      slug: 'companion_diagnostics',
      description: 'Biomarkers, diagnostic development, personalized medicine, and companion diagnostic tests',
      tier: 2,
      priority: 18,
      keywords: ['companion diagnostics', 'biomarkers', 'personalized medicine', 'cdx'],
      sub_domains: ['biomarker_discovery', 'diagnostic_development', 'personalized_medicine', 'cdx_regulation'],
      agent_count_estimate: 6,
      color: '#EC4899' // pink
    },
    {
      code: 'NONCLIN_SCI',
      name: 'Nonclinical Sciences',
      slug: 'nonclinical_sciences',
      description: 'Pharmacology, toxicology, pharmacokinetics, and safety assessment',
      tier: 2,
      priority: 19,
      keywords: ['pharmacology', 'toxicology', 'pk', 'pd', 'safety assessment'],
      sub_domains: ['pharmacology', 'toxicology', 'pharmacokinetics', 'safety_assessment'],
      agent_count_estimate: 12,
      color: '#7C3AED' // violet
    },
    {
      code: 'PATIENT_ENG',
      name: 'Patient Engagement',
      slug: 'patient_focus',
      description: 'Patient engagement, patient centricity, patient education, and advocacy',
      tier: 2,
      priority: 20,
      keywords: ['patient engagement', 'patient centricity', 'patient education', 'advocacy'],
      sub_domains: ['patient_engagement', 'patient_education', 'advocacy', 'patient_reported_outcomes'],
      agent_count_estimate: 5,
      color: '#F472B6' // pink
    },
    {
      code: 'RISK_MGMT',
      name: 'Risk Management',
      slug: 'risk_management',
      description: 'Risk assessment, REMS, risk mitigation strategies, and benefit-risk evaluation',
      tier: 2,
      priority: 21,
      keywords: ['risk management', 'rems', 'risk assessment', 'benefit-risk'],
      sub_domains: ['risk_assessment', 'rems', 'risk_mitigation', 'benefit_risk_evaluation'],
      agent_count_estimate: 8,
      color: '#DC2626' // red
    },
    {
      code: 'SCI_PUB',
      name: 'Scientific Publications',
      slug: 'scientific_publications',
      description: 'Publications, abstracts, presentations, scientific writing, and peer review',
      tier: 2,
      priority: 22,
      keywords: ['publications', 'abstracts', 'presentations', 'scientific writing', 'peer review'],
      sub_domains: ['manuscript_writing', 'abstracts', 'presentations', 'peer_review', 'publication_planning'],
      agent_count_estimate: 7,
      color: '#0EA5E9' // sky
    },
    {
      code: 'KOL_ENG',
      name: 'KOL & Stakeholder Engagement',
      slug: 'stakeholder_engagement',
      description: 'KOL management, advisory boards, medical education, and thought leader engagement',
      tier: 2,
      priority: 23,
      keywords: ['kol', 'advisory board', 'medical education', 'thought leaders', 'stakeholders'],
      sub_domains: ['kol_management', 'advisory_boards', 'medical_education', 'thought_leadership'],
      agent_count_estimate: 6,
      color: '#8B5CF6' // purple
    },
    {
      code: 'EVID_GEN',
      name: 'Evidence Generation',
      slug: 'evidence_generation',
      description: 'Comparative effectiveness, indirect comparisons, network meta-analysis, and systematic reviews',
      tier: 2,
      priority: 24,
      keywords: ['comparative effectiveness', 'indirect comparison', 'network meta-analysis', 'systematic review'],
      sub_domains: ['comparative_studies', 'indirect_comparisons', 'network_meta_analysis', 'systematic_reviews'],
      agent_count_estimate: 5,
      color: '#059669' // emerald
    },
    {
      code: 'GLOBAL_ACCESS',
      name: 'Global Market Access',
      slug: 'global_access',
      description: 'International pricing, HTA submissions, payer negotiations, and global reimbursement',
      tier: 2,
      priority: 25,
      keywords: ['hta', 'international pricing', 'payer', 'global access', 'reimbursement'],
      sub_domains: ['international_pricing', 'hta_submissions', 'payer_negotiations', 'global_reimbursement'],
      agent_count_estimate: 8,
      color: '#D97706' // amber
    }
  ],

  // TIER 3: EMERGING DOMAINS (5) - Future Focus
  tier3: [
    {
      code: 'RWD',
      name: 'Real-World Data & Evidence',
      slug: 'real_world_data',
      description: 'Real-world data, real-world evidence, observational studies, and claims data analysis',
      tier: 3,
      priority: 26,
      keywords: ['rwd', 'rwe', 'real-world', 'observational', 'claims data'],
      sub_domains: ['rwd_sources', 'rwe_generation', 'observational_studies', 'claims_analysis'],
      agent_count_estimate: 8,
      color: '#0891B2' // cyan
    },
    {
      code: 'PRECISION_MED',
      name: 'Precision Medicine',
      slug: 'precision_medicine',
      description: 'Genomics, biomarkers, targeted therapies, and personalized treatment approaches',
      tier: 3,
      priority: 27,
      keywords: ['precision medicine', 'genomics', 'targeted therapy', 'personalized treatment'],
      sub_domains: ['genomics', 'biomarker_guided_therapy', 'targeted_therapies', 'pharmacogenomics'],
      agent_count_estimate: 6,
      color: '#9333EA' // purple
    },
    {
      code: 'TELEMEDICINE',
      name: 'Telemedicine & Remote Care',
      slug: 'telemedicine',
      description: 'Remote monitoring, telehealth, virtual care, and decentralized clinical trials',
      tier: 3,
      priority: 28,
      keywords: ['telemedicine', 'telehealth', 'remote monitoring', 'virtual care', 'dct'],
      sub_domains: ['remote_monitoring', 'telehealth', 'virtual_care', 'decentralized_trials'],
      agent_count_estimate: 5,
      color: '#10B981' // green
    },
    {
      code: 'SUSTAINABILITY',
      name: 'Sustainability & ESG',
      slug: 'sustainability',
      description: 'Environmental impact, green chemistry, sustainable packaging, and corporate responsibility',
      tier: 3,
      priority: 29,
      keywords: ['sustainability', 'esg', 'green chemistry', 'environmental', 'carbon footprint'],
      sub_domains: ['environmental_impact', 'green_chemistry', 'sustainable_packaging', 'esg_reporting'],
      agent_count_estimate: 3,
      color: '#16A34A' // green
    },
    {
      code: 'RARE_DISEASES',
      name: 'Rare Diseases & Orphan Drugs',
      slug: 'rare_diseases',
      description: 'Orphan designation, ultra-rare diseases, small population studies, and accelerated pathways',
      tier: 3,
      priority: 30,
      keywords: ['rare diseases', 'orphan drugs', 'ultra-rare', 'small populations'],
      sub_domains: ['orphan_designation', 'ultra_rare', 'small_populations', 'accelerated_pathways'],
      agent_count_estimate: 4,
      color: '#BE185D' // rose
    }
  ]
};

async function createKnowledgeDomains() {
  console.log('🌱 Creating 30 Knowledge Domains for RAG System...\n');

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Process all tiers
  for (const [tierKey, domains] of Object.entries(knowledgeDomains)) {
    const tierNum = tierKey.replace('tier', '');
    const tierName = tierNum === '1' ? 'Core' : tierNum === '2' ? 'Specialized' : 'Emerging';

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 TIER ${tierNum}: ${tierName.toUpperCase()} DOMAINS (${domains.length} domains)`);
    console.log(`${'='.repeat(80)}\n`);

    for (const domain of domains) {
      try {
        // Check if domain already exists
        const { data: existing, error: checkError } = await supabase
          .from('knowledge_domains')
          .select('id, slug')
          .eq('slug', domain.slug)
          .single();

        if (existing) {
          console.log(`  ⏭️  ${domain.name} (${domain.slug}) - Already exists, skipping`);
          totalSkipped++;
          continue;
        }

        // Create domain
        const { data, error } = await supabase
          .from('knowledge_domains')
          .insert({
            code: domain.code,
            name: domain.name,
            slug: domain.slug,
            description: domain.description,
            tier: domain.tier,
            priority: domain.priority,
            keywords: domain.keywords,
            sub_domains: domain.sub_domains,
            agent_count_estimate: domain.agent_count_estimate,
            color: domain.color,
            is_active: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error(`  ❌ Error creating ${domain.name}:`, error.message);
          totalErrors++;
        } else {
          console.log(`  ✅ ${domain.name} (${domain.slug})`);
          console.log(`     └─ Priority: ${domain.priority} | Estimated Agents: ${domain.agent_count_estimate} | Color: ${domain.color}`);
          totalCreated++;
        }

      } catch (error) {
        console.error(`  ❌ Exception creating ${domain.name}:`, error.message);
        totalErrors++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Domains Created: ${totalCreated}`);
  console.log(`⏭️  Domains Skipped: ${totalSkipped}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📈 Total Domains: ${totalCreated + totalSkipped}`);

  // Verify total
  const { data: allDomains, error: countError } = await supabase
    .from('knowledge_domains')
    .select('id, name, tier')
    .order('priority');

  if (!countError && allDomains) {
    console.log(`\n🔍 Verification: ${allDomains.length} domains in database`);
    console.log('\nBreakdown by Tier:');
    const tier1 = allDomains.filter(d => d.tier === 1).length;
    const tier2 = allDomains.filter(d => d.tier === 2).length;
    const tier3 = allDomains.filter(d => d.tier === 3).length;
    console.log(`  Tier 1 (Core): ${tier1} domains`);
    console.log(`  Tier 2 (Specialized): ${tier2} domains`);
    console.log(`  Tier 3 (Emerging): ${tier3} domains`);
  }

  console.log('\n✨ Knowledge domains creation complete!\n');
}

// Run the script
createKnowledgeDomains().catch(console.error);
