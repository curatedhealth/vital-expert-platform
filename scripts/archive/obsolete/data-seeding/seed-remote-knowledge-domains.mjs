#!/usr/bin/env node
/**
 * Seed Knowledge Domains to REMOTE Supabase
 *
 * This script loads all 30 knowledge domains into the remote Supabase database
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hardcoded from .env.local for remote Supabase
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

// 30 Knowledge Domains Data
const domains = [
  // TIER 1: CORE DOMAINS (15)
  { code: 'REG_AFFAIRS', name: 'Regulatory Affairs', slug: 'regulatory_affairs', description: 'FDA, EMA, and global regulatory submissions, approvals, and compliance', tier: 1, priority: 1, keywords: ['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', '510k', 'pma', 'nda', 'bla'], color: '#DC2626', icon: 'shield-check' },
  { code: 'CLIN_DEV', name: 'Clinical Development', slug: 'clinical_development', description: 'Clinical trial design, protocol development, and study execution', tier: 1, priority: 2, keywords: ['clinical trial', 'protocol', 'study design', 'phase 1', 'phase 2', 'phase 3', 'cro', 'investigator'], color: '#2563EB', icon: 'flask' },
  { code: 'PHARMACOVIG', name: 'Pharmacovigilance', slug: 'pharmacovigilance', description: 'Drug safety monitoring, adverse event reporting, and risk management', tier: 1, priority: 3, keywords: ['safety', 'adverse event', 'pharmacovigilance', 'signal detection', 'icsr', 'psur', 'pbrer'], color: '#DC2626', icon: 'alert-triangle' },
  { code: 'QUALITY_MGMT', name: 'Quality Assurance', slug: 'quality_assurance', description: 'GMP, quality control, validation, and manufacturing compliance', tier: 1, priority: 4, keywords: ['gmp', 'quality', 'validation', 'capa', 'audit', 'deviation', 'manufacturing'], color: '#059669', icon: 'check-circle' },
  { code: 'MED_AFFAIRS', name: 'Medical Affairs', slug: 'medical_affairs', description: 'Medical strategy, scientific communications, and KOL engagement', tier: 1, priority: 5, keywords: ['medical affairs', 'kol', 'scientific communication', 'medical strategy', 'congress', 'advisory board'], color: '#7C3AED', icon: 'users' },
  { code: 'DRUG_SAFETY', name: 'Drug Safety', slug: 'drug_safety', description: 'Safety surveillance, risk assessment, and benefit-risk evaluation', tier: 1, priority: 6, keywords: ['drug safety', 'risk assessment', 'benefit-risk', 'safety surveillance', 'dsur', 'safety data'], color: '#DC2626', icon: 'shield' },
  { code: 'CLIN_OPS', name: 'Clinical Operations', slug: 'clinical_operations', description: 'Site management, patient recruitment, and trial logistics', tier: 1, priority: 7, keywords: ['clinical operations', 'site management', 'patient recruitment', 'monitoring', 'source data verification'], color: '#0891B2', icon: 'activity' },
  { code: 'MED_WRITING', name: 'Medical Writing', slug: 'medical_writing', description: 'Clinical study reports, regulatory documents, and scientific publications', tier: 1, priority: 8, keywords: ['medical writing', 'csr', 'regulatory writing', 'manuscript', 'clinical document'], color: '#4F46E5', icon: 'file-text' },
  { code: 'BIOSTATISTICS', name: 'Biostatistics', slug: 'biostatistics', description: 'Statistical analysis plans, data analysis, and statistical reporting', tier: 1, priority: 9, keywords: ['biostatistics', 'statistical analysis', 'sap', 'data analysis', 'power calculation'], color: '#059669', icon: 'bar-chart' },
  { code: 'DATA_MGMT', name: 'Data Management', slug: 'data_management', description: 'Clinical data collection, cleaning, and database management', tier: 1, priority: 10, keywords: ['data management', 'edc', 'data cleaning', 'database lock', 'crf design'], color: '#0891B2', icon: 'database' },
  { code: 'TRANSLATIONAL', name: 'Translational Medicine', slug: 'translational_medicine', description: 'Biomarker discovery, precision medicine, and translational research', tier: 1, priority: 11, keywords: ['translational medicine', 'biomarker', 'precision medicine', 'companion diagnostics'], color: '#7C3AED', icon: 'microscope' },
  { code: 'MARKET_ACCESS', name: 'Market Access', slug: 'market_access', description: 'Reimbursement, health technology assessment, and pricing strategy', tier: 1, priority: 12, keywords: ['market access', 'reimbursement', 'hta', 'pricing', 'payer', 'access strategy'], color: '#059669', icon: 'trending-up' },
  { code: 'LABELING', name: 'Labeling & Advertising', slug: 'labeling_advertising', description: 'Product labeling, promotional materials, and advertising compliance', tier: 1, priority: 13, keywords: ['labeling', 'advertising', 'promotional review', 'package insert', 'pi', 'ifu'], color: '#4F46E5', icon: 'tag' },
  { code: 'POST_MARKET', name: 'Post-Market Surveillance', slug: 'post_market_surveillance', description: 'Phase 4 studies, real-world evidence, and post-approval monitoring', tier: 1, priority: 14, keywords: ['post-market', 'phase 4', 'real-world evidence', 'rwe', 'post-approval', 'surveillance'], color: '#DC2626', icon: 'eye' },
  { code: 'PATIENT_ENG', name: 'Patient Engagement', slug: 'patient_engagement', description: 'Patient advocacy, patient-reported outcomes, and patient centricity', tier: 1, priority: 15, keywords: ['patient engagement', 'patient advocacy', 'pro', 'patient-reported outcomes', 'patient centricity'], color: '#DB2777', icon: 'heart' },

  // TIER 2: SPECIALIZED DOMAINS (10)
  { code: 'SCI_PUB', name: 'Scientific Publications', slug: 'scientific_publications', description: 'Publication planning, manuscript development, and journal submissions', tier: 2, priority: 16, keywords: ['publications', 'manuscript', 'journal', 'congress', 'abstract', 'publication plan'], color: '#4F46E5', icon: 'book-open' },
  { code: 'NONCLINICAL', name: 'Nonclinical Sciences', slug: 'nonclinical_sciences', description: 'Preclinical studies, toxicology, and nonclinical safety assessment', tier: 2, priority: 17, keywords: ['nonclinical', 'preclinical', 'toxicology', 'safety pharmacology', 'animal studies'], color: '#7C3AED', icon: 'beaker' },
  { code: 'RISK_MGMT', name: 'Risk Management', slug: 'risk_management', description: 'Risk management plans, risk minimization, and REMS programs', tier: 2, priority: 18, keywords: ['risk management', 'rmp', 'rems', 'risk minimization', 'risk evaluation'], color: '#DC2626', icon: 'alert-octagon' },
  { code: 'SUBMISSIONS', name: 'Submissions & Filings', slug: 'submissions_filings', description: 'Regulatory submissions, dossier compilation, and filing strategy', tier: 2, priority: 19, keywords: ['submissions', 'filing', 'dossier', 'ctd', 'ectd', 'regulatory filing'], color: '#2563EB', icon: 'upload' },
  { code: 'HEALTH_ECON', name: 'Health Economics', slug: 'health_economics', description: 'Cost-effectiveness analysis, budget impact models, and HEOR', tier: 2, priority: 20, keywords: ['health economics', 'heor', 'cost-effectiveness', 'budget impact', 'pharmacoeconomics'], color: '#059669', icon: 'dollar-sign' },
  { code: 'MED_DEVICES', name: 'Medical Devices', slug: 'medical_devices', description: 'Device regulation, clinical evaluation, and device lifecycle management', tier: 2, priority: 21, keywords: ['medical device', 'device regulation', 'clinical evaluation', 'mdr', 'ivdr', '510k'], color: '#0891B2', icon: 'cpu' },
  { code: 'BIOINFORMATICS', name: 'Bioinformatics', slug: 'bioinformatics', description: 'Genomics, computational biology, and bioinformatics analysis', tier: 2, priority: 22, keywords: ['bioinformatics', 'genomics', 'computational biology', 'ngs', 'sequencing'], color: '#7C3AED', icon: 'code' },
  { code: 'COMPANION_DX', name: 'Companion Diagnostics', slug: 'companion_diagnostics', description: 'Diagnostic development, biomarker validation, and CDx strategy', tier: 2, priority: 23, keywords: ['companion diagnostics', 'cdx', 'diagnostic', 'biomarker validation', 'personalized medicine'], color: '#4F46E5', icon: 'target' },
  { code: 'REG_INTEL', name: 'Regulatory Intelligence', slug: 'regulatory_intelligence', description: 'Regulatory landscape monitoring, competitive intelligence, and policy analysis', tier: 2, priority: 24, keywords: ['regulatory intelligence', 'competitive intelligence', 'policy', 'regulatory landscape'], color: '#2563EB', icon: 'search' },
  { code: 'LIFECYCLE', name: 'Lifecycle Management', slug: 'lifecycle_management', description: 'Product lifecycle strategy, variations, and line extensions', tier: 2, priority: 25, keywords: ['lifecycle management', 'variations', 'line extensions', 'product strategy', 'lifecycle'], color: '#059669', icon: 'refresh-cw' },

  // TIER 3: EMERGING DOMAINS (5)
  { code: 'DIGITAL_HEALTH', name: 'Digital Health', slug: 'digital_health', description: 'Digital therapeutics, mobile health, and digital biomarkers', tier: 3, priority: 26, keywords: ['digital health', 'digital therapeutics', 'mhealth', 'wearables', 'digital biomarkers'], color: '#0891B2', icon: 'smartphone' },
  { code: 'PRECISION_MED', name: 'Precision Medicine', slug: 'precision_medicine', description: 'Personalized therapy, pharmacogenomics, and targeted treatments', tier: 3, priority: 27, keywords: ['precision medicine', 'personalized medicine', 'pharmacogenomics', 'targeted therapy'], color: '#7C3AED', icon: 'crosshair' },
  { code: 'AI_ML', name: 'AI/ML in Healthcare', slug: 'ai_ml_healthcare', description: 'Artificial intelligence, machine learning, and predictive analytics in healthcare', tier: 3, priority: 28, keywords: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'predictive analytics'], color: '#4F46E5', icon: 'brain' },
  { code: 'TELEMEDICINE', name: 'Telemedicine', slug: 'telemedicine', description: 'Remote care delivery, virtual trials, and telehealth platforms', tier: 3, priority: 29, keywords: ['telemedicine', 'telehealth', 'remote care', 'virtual trials', 'decentralized trials'], color: '#0891B2', icon: 'video' },
  { code: 'SUSTAINABILITY', name: 'Sustainability', slug: 'sustainability', description: 'Environmental sustainability, green manufacturing, and ESG in healthcare', tier: 3, priority: 30, keywords: ['sustainability', 'esg', 'green manufacturing', 'environmental', 'carbon footprint'], color: '#059669', icon: 'leaf' },
];

const defaultRecommendedModels = {
  embedding: {
    primary: 'text-embedding-3-large',
    alternatives: ['text-embedding-ada-002'],
    specialized: null
  },
  chat: {
    primary: 'gpt-4-turbo-preview',
    alternatives: ['gpt-3.5-turbo'],
    specialized: null
  }
};

async function seedRemoteKnowledgeDomains() {
  try {
    console.log('🌍 Seeding knowledge domains to REMOTE Supabase...');
    console.log('📍 URL:', SUPABASE_URL);
    console.log('');

    // Check if table exists and has data
    console.log('1️⃣ Checking existing domains...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_domains?select=count`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    const existingCount = checkResponse.headers.get('content-range')?.split('/')[1] || '0';
    console.log(`   Current count: ${existingCount} domains`);

    if (parseInt(existingCount) >= 30) {
      console.log('   ℹ️  30+ domains already exist. Skipping insert.');
      console.log('   💡 If you want to re-seed, delete existing domains first.');

      // Show existing domains
      const listResponse = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_domains?select=code,name,tier&order=priority`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      if (listResponse.ok) {
        const existing = await listResponse.json();
        console.log('\n📋 Existing Knowledge Domains:');
        console.log('═══════════════════════════════════════════════════════════════');
        existing.forEach((d, idx) => {
          const tierName = d.tier === 1 ? 'Core' : d.tier === 2 ? 'Specialized' : 'Emerging';
          console.log(`${(idx + 1).toString().padStart(2)}. [Tier ${d.tier} - ${tierName.padEnd(11)}] ${d.name} (${d.code})`);
        });
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Total: ${existing.length} domains already loaded in remote Supabase\n`);
      }

      return;
    }

    // Insert domains one by one
    console.log('\n2️⃣ Inserting 30 knowledge domains...');
    let successCount = 0;
    let errorCount = 0;

    for (const domain of domains) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_domains`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            ...domain,
            recommended_models: defaultRecommendedModels,
            is_active: true,
            metadata: {}
          })
        });

        if (response.ok) {
          successCount++;
          const tierName = domain.tier === 1 ? 'Core' : domain.tier === 2 ? 'Specialized' : 'Emerging';
          console.log(`   ✅ [Tier ${domain.tier} - ${tierName.padEnd(11)}] ${domain.name}`);
        } else {
          const error = await response.text();
          console.error(`   ❌ Failed: ${domain.name} - ${error}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error inserting ${domain.name}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n3️⃣ Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   ✅ Successfully inserted: ${successCount} domains`);
    console.log(`   ❌ Failed: ${errorCount} domains`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (successCount === 30) {
      console.log('🎉 All 30 knowledge domains successfully loaded to remote Supabase!');
      console.log('🔗 View in Supabase Studio: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/editor/knowledge_domains');
    } else if (successCount > 0) {
      console.log(`⚠️  Partial success: ${successCount}/30 domains loaded`);
    } else {
      console.log('❌ Failed to load any domains');
    }

  } catch (error) {
    console.error('❌ Error seeding knowledge domains:', error);
    process.exit(1);
  }
}

seedRemoteKnowledgeDomains();
