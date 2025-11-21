/**
 * Seed Knowledge Domains
 *
 * Creates and populates the knowledge_domains table with 30 healthcare domains
 * Run: NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-knowledge-domains.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const KNOWLEDGE_DOMAINS = [
  // TIER 1: CORE DOMAINS (15)
  {
    code: 'REG_AFFAIRS',
    name: 'Regulatory Affairs',
    slug: 'regulatory_affairs',
    description: 'FDA, EMA, and global regulatory submissions, approvals, and compliance',
    tier: 1,
    priority: 1,
    keywords: ['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', '510k', 'pma', 'nda', 'bla'],
    color: '#DC2626',
    icon: 'shield-check',
  },
  {
    code: 'CLIN_DEV',
    name: 'Clinical Development',
    slug: 'clinical_development',
    description: 'Clinical trial design, protocol development, and study execution',
    tier: 1,
    priority: 2,
    keywords: ['clinical trial', 'protocol', 'study design', 'phase 1', 'phase 2', 'phase 3', 'cro', 'investigator'],
    color: '#2563EB',
    icon: 'flask',
  },
  {
    code: 'PHARMACOVIG',
    name: 'Pharmacovigilance',
    slug: 'pharmacovigilance',
    description: 'Drug safety monitoring, adverse event reporting, and risk management',
    tier: 1,
    priority: 3,
    keywords: ['safety', 'adverse event', 'pharmacovigilance', 'signal detection', 'icsr', 'psur', 'pbrer'],
    color: '#DC2626',
    icon: 'alert-triangle',
  },
  {
    code: 'QUALITY_MGMT',
    name: 'Quality Assurance',
    slug: 'quality_assurance',
    description: 'GMP, quality control, validation, and manufacturing compliance',
    tier: 1,
    priority: 4,
    keywords: ['gmp', 'quality', 'validation', 'capa', 'audit', 'deviation', 'manufacturing'],
    color: '#059669',
    icon: 'check-circle',
  },
  {
    code: 'MED_AFFAIRS',
    name: 'Medical Affairs',
    slug: 'medical_affairs',
    description: 'Medical information, scientific communication, and KOL engagement',
    tier: 1,
    priority: 5,
    keywords: ['medical affairs', 'msl', 'kol', 'scientific communication', 'publication', 'congress'],
    color: '#7C3AED',
    icon: 'user-md',
  },
  {
    code: 'DRUG_SAFETY',
    name: 'Drug Safety',
    slug: 'drug_safety',
    description: 'Safety surveillance, causality assessment, and benefit-risk analysis',
    tier: 1,
    priority: 6,
    keywords: ['drug safety', 'adr', 'adverse drug reaction', 'safety surveillance', 'causality'],
    color: '#DC2626',
    icon: 'shield',
  },
  {
    code: 'CLIN_OPS',
    name: 'Clinical Operations',
    slug: 'clinical_operations',
    description: 'Site management, monitoring, and clinical data collection',
    tier: 1,
    priority: 7,
    keywords: ['clinical operations', 'site monitoring', 'data management', 'ctms', 'edc', 'recruitment'],
    color: '#0891B2',
    icon: 'briefcase',
  },
  {
    code: 'MED_WRITING',
    name: 'Medical Writing',
    slug: 'medical_writing',
    description: 'Clinical study reports, protocols, and regulatory documents',
    tier: 1,
    priority: 8,
    keywords: ['medical writing', 'csr', 'protocol', 'investigator brochure', 'regulatory document'],
    color: '#4F46E5',
    icon: 'file-text',
  },
  {
    code: 'BIOSTAT',
    name: 'Biostatistics',
    slug: 'biostatistics',
    description: 'Statistical analysis, sample size calculation, and study design',
    tier: 1,
    priority: 9,
    keywords: ['biostatistics', 'statistical analysis', 'sample size', 'sap', 'interim analysis'],
    color: '#7C3AED',
    icon: 'bar-chart',
  },
  {
    code: 'DATA_MGMT',
    name: 'Data Management',
    slug: 'data_management',
    description: 'Clinical data management, CDISC standards, and data quality',
    tier: 1,
    priority: 10,
    keywords: ['data management', 'cdm', 'cdisc', 'sdtm', 'adam', 'data cleaning'],
    color: '#0891B2',
    icon: 'database',
  },
  {
    code: 'TRANS_MED',
    name: 'Translational Medicine',
    slug: 'translational_medicine',
    description: 'Biomarkers, precision medicine, and bench-to-bedside research',
    tier: 1,
    priority: 11,
    keywords: ['translational medicine', 'biomarker', 'precision medicine', 'companion diagnostic'],
    color: '#7C3AED',
    icon: 'activity',
  },
  {
    code: 'MARKET_ACCESS',
    name: 'Market Access',
    slug: 'market_access',
    description: 'Pricing, reimbursement, and payer negotiations',
    tier: 1,
    priority: 12,
    keywords: ['market access', 'pricing', 'reimbursement', 'payer', 'hta', 'value dossier'],
    color: '#059669',
    icon: 'dollar-sign',
  },
  {
    code: 'LABELING_ADV',
    name: 'Labeling & Advertising',
    slug: 'labeling_advertising',
    description: 'Product labeling, promotional materials, and compliance',
    tier: 1,
    priority: 13,
    keywords: ['labeling', 'advertising', 'promotional', 'product label', 'package insert'],
    color: '#D97706',
    icon: 'tag',
  },
  {
    code: 'POST_MARKET',
    name: 'Post-Market Surveillance',
    slug: 'post_market_surveillance',
    description: 'Post-approval safety monitoring and lifecycle management',
    tier: 1,
    priority: 14,
    keywords: ['post-market', 'surveillance', 'rems', 'risk management', 'lifecycle'],
    color: '#DC2626',
    icon: 'eye',
  },
  {
    code: 'PATIENT_ENG',
    name: 'Patient Engagement',
    slug: 'patient_engagement',
    description: 'Patient recruitment, retention, and patient-reported outcomes',
    tier: 1,
    priority: 15,
    keywords: ['patient engagement', 'recruitment', 'retention', 'pro', 'patient-centered'],
    color: '#EC4899',
    icon: 'users',
  },

  // TIER 2: SPECIALIZED DOMAINS (10)
  {
    code: 'SCI_PUB',
    name: 'Scientific Publications',
    slug: 'scientific_publications',
    description: 'Manuscript writing, peer review, and scientific publishing',
    tier: 2,
    priority: 16,
    keywords: ['publication', 'manuscript', 'journal', 'peer review', 'abstract', 'poster'],
    color: '#4F46E5',
    icon: 'book-open',
  },
  {
    code: 'NONCLIN_SCI',
    name: 'Nonclinical Sciences',
    slug: 'nonclinical_sciences',
    description: 'Preclinical research, toxicology, and pharmacology studies',
    tier: 2,
    priority: 17,
    keywords: ['preclinical', 'toxicology', 'pharmacology', 'in vitro', 'in vivo', 'animal study'],
    color: '#7C3AED',
    icon: 'microscope',
  },
  {
    code: 'RISK_MGMT',
    name: 'Risk Management',
    slug: 'risk_management',
    description: 'Risk assessment, mitigation strategies, and risk management plans',
    tier: 2,
    priority: 18,
    keywords: ['risk management', 'risk assessment', 'rmp', 'risk mitigation', 'benefit-risk'],
    color: '#DC2626',
    icon: 'alert-octagon',
  },
  {
    code: 'SUBMISSIONS',
    name: 'Submissions & Filings',
    slug: 'submissions_and_filings',
    description: 'IND, NDA, BLA, and regulatory submission strategies',
    tier: 2,
    priority: 19,
    keywords: ['submission', 'ind', 'nda', 'bla', 'maa', 'dossier', 'ctd', 'ectd'],
    color: '#DC2626',
    icon: 'upload',
  },
  {
    code: 'HEOR',
    name: 'Health Economics',
    slug: 'health_economics',
    description: 'Health economics, outcomes research, and value assessment',
    tier: 2,
    priority: 20,
    keywords: ['heor', 'health economics', 'cost effectiveness', 'qaly', 'value dossier'],
    color: '#059669',
    icon: 'trending-up',
  },
  {
    code: 'MED_DEVICES',
    name: 'Medical Devices',
    slug: 'medical_devices',
    description: 'Medical device regulations, 510k, PMA, and device classification',
    tier: 2,
    priority: 21,
    keywords: ['medical device', 'ivd', '510k', 'pma', 'mdr', 'ivdr', 'class i', 'class ii', 'class iii'],
    color: '#D97706',
    icon: 'cpu',
  },
  {
    code: 'BIOINFORMATICS',
    name: 'Bioinformatics',
    slug: 'bioinformatics',
    description: 'Genomics, proteomics, and computational biology',
    tier: 2,
    priority: 22,
    keywords: ['bioinformatics', 'genomics', 'proteomics', 'ngs', 'biomarker', 'omics'],
    color: '#7C3AED',
    icon: 'code',
  },
  {
    code: 'COMP_DIAG',
    name: 'Companion Diagnostics',
    slug: 'companion_diagnostics',
    description: 'Companion diagnostic development and validation',
    tier: 2,
    priority: 23,
    keywords: ['companion diagnostic', 'cdx', 'biomarker testing', 'patient selection', 'precision medicine'],
    color: '#4F46E5',
    icon: 'target',
  },
  {
    code: 'REG_INTEL',
    name: 'Regulatory Intelligence',
    slug: 'regulatory_intelligence',
    description: 'Regulatory landscape monitoring and competitive intelligence',
    tier: 2,
    priority: 24,
    keywords: ['regulatory intelligence', 'competitive intelligence', 'landscape', 'guideline monitoring'],
    color: '#0891B2',
    icon: 'search',
  },
  {
    code: 'LIFECYCLE_MGMT',
    name: 'Lifecycle Management',
    slug: 'lifecycle_management',
    description: 'Product lifecycle strategies and portfolio management',
    tier: 2,
    priority: 25,
    keywords: ['lifecycle management', 'portfolio', 'strategy', 'product development'],
    color: '#059669',
    icon: 'refresh-cw',
  },

  // TIER 3: EMERGING DOMAINS (5)
  {
    code: 'DIGITAL_HEALTH',
    name: 'Digital Health',
    slug: 'digital_health',
    description: 'Digital therapeutics, mHealth, wearables, and connected devices',
    tier: 3,
    priority: 26,
    keywords: ['digital health', 'mobile health', 'mhealth', 'wearable', 'digital therapeutic', 'remote monitoring'],
    color: '#10B981',
    icon: 'smartphone',
  },
  {
    code: 'PRECISION_MED',
    name: 'Precision Medicine',
    slug: 'precision_medicine',
    description: 'Personalized therapy, genetic profiling, and targeted treatments',
    tier: 3,
    priority: 27,
    keywords: ['precision medicine', 'personalized medicine', 'genetic profiling', 'targeted therapy'],
    color: '#7C3AED',
    icon: 'crosshair',
  },
  {
    code: 'AI_ML_HEALTH',
    name: 'AI/ML in Healthcare',
    slug: 'ai_ml_healthcare',
    description: 'Artificial intelligence and machine learning in drug development',
    tier: 3,
    priority: 28,
    keywords: ['ai', 'machine learning', 'deep learning', 'predictive model', 'clinical decision support'],
    color: '#6366F1',
    icon: 'brain',
  },
  {
    code: 'TELEMEDICINE',
    name: 'Telemedicine',
    slug: 'telemedicine',
    description: 'Remote healthcare delivery and virtual consultations',
    tier: 3,
    priority: 29,
    keywords: ['telemedicine', 'telehealth', 'remote consultation', 'virtual visit', 'remote patient monitoring'],
    color: '#0891B2',
    icon: 'video',
  },
  {
    code: 'SUSTAINABILITY',
    name: 'Sustainability',
    slug: 'sustainability',
    description: 'Environmental impact, green pharma, and sustainable practices',
    tier: 3,
    priority: 30,
    keywords: ['sustainability', 'environmental', 'green pharma', 'carbon footprint', 'eco-design'],
    color: '#059669',
    icon: 'leaf',
  },
];

async function seedKnowledgeDomains() {
  console.log('🌱 Seeding knowledge domains...\n');

  // Check if table exists
  const { error: tableError } = await supabase
    .from('knowledge_domains')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('❌ Table does not exist. Please run migration 008 first:');
    console.error('   database/sql/migrations/008_seed_30_knowledge_domains.sql');
    process.exit(1);
  }

  // Check existing domains
  const { data: existing } = await supabase
    .from('knowledge_domains')
    .select('slug');

  const existingSlugs = new Set((existing || []).map((d) => d.slug));

  console.log(`📊 Found ${existingSlugs.size} existing domains`);

  // Insert domains
  let inserted = 0;
  let skipped = 0;

  for (const domain of KNOWLEDGE_DOMAINS) {
    if (existingSlugs.has(domain.slug)) {
      console.log(`⏭️  Skipping ${domain.name} (already exists)`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('knowledge_domains').insert({
      ...domain,
      is_active: true,
      recommended_models: {
        embedding: {
          primary: 'text-embedding-3-large',
          alternatives: ['text-embedding-ada-002'],
          specialized: null,
        },
        chat: {
          primary: 'gpt-4-turbo-preview',
          alternatives: ['gpt-3.5-turbo'],
          specialized: null,
        },
      },
    });

    if (error) {
      console.error(`❌ Failed to insert ${domain.name}:`, error.message);
    } else {
      console.log(`✅ Inserted ${domain.name} (Tier ${domain.tier})`);
      inserted++;
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${KNOWLEDGE_DOMAINS.length}`);

  // Verify
  const { data: final, error: verifyError } = await supabase
    .from('knowledge_domains')
    .select('tier')
    .eq('is_active', true);

  if (!verifyError && final) {
    const byTier = final.reduce((acc, d) => {
      acc[d.tier] = (acc[d.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Final counts by tier:');
    console.log(`   Tier 1 (Core): ${byTier[1] || 0}`);
    console.log(`   Tier 2 (Specialized): ${byTier[2] || 0}`);
    console.log(`   Tier 3 (Emerging): ${byTier[3] || 0}`);
    console.log(`   Total: ${final.length}`);
  }
}

seedKnowledgeDomains()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
