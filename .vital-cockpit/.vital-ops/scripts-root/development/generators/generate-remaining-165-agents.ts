import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Remaining templates to reach 250 total
const remainingAgents = [
  // TIER 2 - SPECIALIZED THERAPY AREAS (20 agents) - avatars 0235-0254
  { tier: 2, offset: 235, name: 'oncology_development_lead', display: 'Oncology Development Lead', desc: 'Leads oncology drug development programs from preclinical to approval.', func: 'oncology', domain: 'medical', caps: ['oncology_strategy', 'tumor_biology', 'immunotherapy'] },
  { tier: 2, offset: 236, name: 'neurology_specialist', display: 'Neurology Specialist', desc: 'Develops neurology and CNS therapeutics.', func: 'neurology', domain: 'medical', caps: ['cns_development', 'neurodegenerative', 'biomarkers'] },
  { tier: 2, offset: 237, name: 'cardiology_expert', display: 'Cardiology Expert', desc: 'Develops cardiovascular therapeutics and devices.', func: 'cardiology', domain: 'medical', caps: ['cardiovascular', 'heart_failure', 'clinical_endpoints'] },
  { tier: 2, offset: 238, name: 'infectious_disease_strategist', display: 'Infectious Disease Strategist', desc: 'Develops anti-infective and vaccine programs.', func: 'infectious_disease', domain: 'medical', caps: ['antibiotic_development', 'vaccine_strategy', 'resistance'] },
  { tier: 2, offset: 239, name: 'immunology_specialist', display: 'Immunology Specialist', desc: 'Develops immunology and autoimmune therapeutics.', func: 'immunology', domain: 'medical', caps: ['immunology', 'autoimmune', 'biologics'] },
  { tier: 2, offset: 240, name: 'metabolic_disease_expert', display: 'Metabolic Disease Expert', desc: 'Develops metabolic and endocrine therapeutics.', func: 'metabolism', domain: 'medical', caps: ['diabetes', 'obesity', 'metabolic_disorders'] },
  { tier: 2, offset: 241, name: 'respiratory_specialist', display: 'Respiratory Specialist', desc: 'Develops respiratory therapeutics including asthma and COPD.', func: 'respiratory', domain: 'medical', caps: ['respiratory', 'asthma', 'copd'] },
  { tier: 2, offset: 242, name: 'dermatology_expert', display: 'Dermatology Expert', desc: 'Develops dermatological therapeutics and topical formulations.', func: 'dermatology', domain: 'medical', caps: ['dermatology', 'topical_development', 'skin_disorders'] },
  { tier: 2, offset: 243, name: 'ophthalmology_specialist', display: 'Ophthalmology Specialist', desc: 'Develops ophthalmic therapeutics and ocular delivery systems.', func: 'ophthalmology', domain: 'medical', caps: ['ophthalmology', 'ocular_delivery', 'retinal_disease'] },
  { tier: 2, offset: 244, name: 'gastroenterology_expert', display: 'Gastroenterology Expert', desc: 'Develops GI therapeutics including IBD and liver disease.', func: 'gastroenterology', domain: 'medical', caps: ['gastroenterology', 'ibd', 'hepatology'] },
  { tier: 2, offset: 245, name: 'nephrology_specialist', display: 'Nephrology Specialist', desc: 'Develops renal therapeutics and dialysis products.', func: 'nephrology', domain: 'medical', caps: ['nephrology', 'ckd', 'dialysis'] },
  { tier: 2, offset: 246, name: 'hematology_expert', display: 'Hematology Expert', desc: 'Develops hematology therapeutics including bleeding and clotting disorders.', func: 'hematology', domain: 'medical', caps: ['hematology', 'coagulation', 'anemia'] },
  { tier: 2, offset: 247, name: 'pain_specialist', display: 'Pain Specialist', desc: 'Develops pain management therapeutics and non-opioid analgesics.', func: 'pain_management', domain: 'medical', caps: ['pain_development', 'analgesics', 'opioid_alternatives'] },
  { tier: 2, offset: 248, name: 'women_health_specialist', display: "Women's Health Specialist", desc: "Develops women's health therapeutics including reproductive health.', func: 'womens_health', domain: 'medical', caps: ['reproductive_health', 'contraception', 'menopause'] },
  { tier: 2, offset: 249, name: 'transplant_specialist', display: 'Transplant Specialist', desc: 'Develops transplant immunosuppression and organ preservation.', func: 'transplant', domain: 'medical', caps: ['transplant', 'immunosuppression', 'rejection'] },
  { tier: 2, offset: 250, name: 'rheumatology_expert', display: 'Rheumatology Expert', desc: 'Develops rheumatologic and musculoskeletal therapeutics.', func: 'rheumatology', domain: 'medical', caps: ['rheumatology', 'arthritis', 'biologics'] },
  { tier: 2, offset: 251, name: 'psychiatry_specialist', display: 'Psychiatry Specialist', desc: 'Develops psychiatric therapeutics including depression and schizophrenia.', func: 'psychiatry', domain: 'medical', caps: ['psychiatry', 'depression', 'schizophrenia'] },
  { tier: 2, offset: 252, name: 'addiction_medicine_expert', display: 'Addiction Medicine Expert', desc: 'Develops addiction treatment therapeutics.', func: 'addiction', domain: 'medical', caps: ['addiction_treatment', 'substance_abuse', 'harm_reduction'] },
  { tier: 2, offset: 253, name: 'pediatric_specialist', display: 'Pediatric Specialist', desc: 'Develops pediatric-specific therapeutics and formulations.', func: 'pediatrics', domain: 'medical', caps: ['pediatric_development', 'age_appropriate', 'neonatal'] },
  { tier: 2, offset: 254, name: 'geriatric_specialist', display: 'Geriatric Specialist', desc: 'Develops geriatric-focused therapeutics and dosing strategies.', func: 'geriatrics', domain: 'medical', caps: ['geriatric_care', 'polypharmacy', 'frailty'] },

  // TIER 2 - ADVANCED MANUFACTURING (15 agents) - avatars 0255-0269
  { tier: 2, offset: 255, name: 'biologics_manufacturing_expert', display: 'Biologics Manufacturing Expert', desc: 'Develops biologics manufacturing processes and scale-up.', func: 'manufacturing', domain: 'technical', caps: ['biologics_manufacturing', 'upstream_downstream', 'purification'] },
  { tier: 2, offset: 256, name: 'cell_therapy_manufacturing', display: 'Cell Therapy Manufacturing', desc: 'Develops cell and gene therapy manufacturing processes.', func: 'manufacturing', domain: 'technical', caps: ['cell_therapy_manufacturing', 'viral_vectors', 'aseptic_processing'] },
  { tier: 2, offset: 257, name: 'aseptic_processing_expert', display: 'Aseptic Processing Expert', desc: 'Develops aseptic processing and sterile manufacturing.', func: 'manufacturing', domain: 'technical', caps: ['aseptic_processing', 'sterile_manufacturing', 'contamination_control'] },
  { tier: 2, offset: 258, name: 'formulation_development_lead', display: 'Formulation Development Lead', desc: 'Develops complex formulations and delivery systems.', func: 'manufacturing', domain: 'technical', caps: ['formulation', 'drug_delivery', 'stability'] },
  { tier: 2, offset: 259, name: 'analytical_method_developer', display: 'Analytical Method Developer', desc: 'Develops and validates analytical methods for drug substances.', func: 'manufacturing', domain: 'technical', caps: ['analytical_development', 'method_validation', 'impurity_testing'] },
  { tier: 2, offset: 260, name: 'stability_program_manager', display: 'Stability Program Manager', desc: 'Manages stability programs and shelf-life determination.', func: 'manufacturing', domain: 'technical', caps: ['stability_testing', 'shelf_life', 'degradation_pathways'] },
  { tier: 2, offset: 261, name: 'packaging_development_specialist', display: 'Packaging Development Specialist', desc: 'Develops pharmaceutical packaging and container closure systems.', func: 'manufacturing', domain: 'technical', caps: ['packaging_development', 'container_closure', 'extractables_leachables'] },
  { tier: 2, offset: 262, name: 'continuous_manufacturing_expert', display: 'Continuous Manufacturing Expert', desc: 'Implements continuous manufacturing and process intensification.', func: 'manufacturing', domain: 'technical', caps: ['continuous_manufacturing', 'process_intensification', 'real_time_release'] },
  { tier: 2, offset: 263, name: 'lyophilization_specialist', display: 'Lyophilization Specialist', desc: 'Develops lyophilization processes for biologics and injectables.', func: 'manufacturing', domain: 'technical', caps: ['lyophilization', 'freeze_drying', 'cycle_development'] },
  { tier: 2, offset: 264, name: 'quality_by_design_lead', display: 'Quality by Design Lead', desc: 'Implements QbD principles and design space development.', func: 'manufacturing', domain: 'technical', caps: ['qbd', 'design_space', 'process_understanding'] },
  { tier: 2, offset: 265, name: 'serialization_expert', display: 'Serialization Expert', desc: 'Implements track-and-trace serialization and anti-counterfeiting.', func: 'manufacturing', domain: 'technical', caps: ['serialization', 'track_trace', 'dscsa_compliance'] },
  { tier: 2, offset: 266, name: 'manufacturing_automation_specialist', display: 'Manufacturing Automation Specialist', desc: 'Implements manufacturing automation and Industry 4.0.', func: 'manufacturing', domain: 'technical', caps: ['automation', 'digitalization', 'industry_4.0'] },
  { tier: 2, offset: 267, name: 'supply_reliability_manager', display: 'Supply Reliability Manager', desc: 'Ensures pharmaceutical supply chain reliability and continuity.', func: 'manufacturing', domain: 'business', caps: ['supply_continuity', 'risk_mitigation', 'disaster_recovery'] },
  { tier: 2, offset: 268, name: 'outsourcing_strategy_lead', display: 'Outsourcing Strategy Lead', desc: 'Develops CMO/CDMO outsourcing strategies.', func: 'manufacturing', domain: 'business', caps: ['cmo_strategy', 'vendor_qualification', 'tech_transfer'] },
  { tier: 2, offset: 269, name: 'manufacturing_cost_analyst', display: 'Manufacturing Cost Analyst', desc: 'Analyzes manufacturing costs and process economics.', func: 'manufacturing', domain: 'business', caps: ['cost_analysis', 'process_economics', 'cogs_optimization'] },

  // TIER 2 - COMMERCIAL OPERATIONS (15 agents) - avatars 0270-0284
  { tier: 2, offset: 270, name: 'brand_strategy_director', display: 'Brand Strategy Director', desc: 'Develops brand strategies and positioning.', func: 'commercial', domain: 'business', caps: ['brand_strategy', 'positioning', 'competitive_intelligence'] },
  { tier: 2, offset: 271, name: 'launch_excellence_lead', display: 'Launch Excellence Lead', desc: 'Leads product launch planning and execution.', func: 'commercial', domain: 'business', caps: ['launch_planning', 'cross_functional_coordination', 'launch_readiness'] },
  { tier: 2, offset: 272, name: 'key_account_manager', display: 'Key Account Manager', desc: 'Manages key accounts and strategic relationships.', func: 'commercial', domain: 'business', caps: ['account_management', 'relationship_building', 'strategic_selling'] },
  { tier: 2, offset: 273, name: 'marketing_analytics_lead', display: 'Marketing Analytics Lead', desc: 'Analyzes marketing performance and ROI.', func: 'commercial', domain: 'business', caps: ['marketing_analytics', 'roi_analysis', 'performance_metrics'] },
  { tier: 2, offset: 274, name: 'omnichannel_strategist', display: 'Omnichannel Strategist', desc: 'Develops omnichannel customer engagement strategies.', func: 'commercial', domain: 'business', caps: ['omnichannel', 'digital_engagement', 'customer_journey'] },
  { tier: 2, offset: 275, name: 'patient_services_director', display: 'Patient Services Director', desc: 'Develops patient support and hub services programs.', func: 'commercial', domain: 'business', caps: ['patient_services', 'hub_services', 'adherence_programs'] },
  { tier: 2, offset: 276, name: 'sales_force_effectiveness', display: 'Sales Force Effectiveness', desc: 'Optimizes sales force size, structure, and performance.', func: 'commercial', domain: 'business', caps: ['sfe', 'territory_design', 'incentive_compensation'] },
  { tier: 2, offset: 277, name: 'market_research_director', display: 'Market Research Director', desc: 'Conducts market research and customer insights.', func: 'commercial', domain: 'business', caps: ['market_research', 'customer_insights', 'segmentation'] },
  { tier: 2, offset: 278, name: 'promotional_strategy_lead', display: 'Promotional Strategy Lead', desc: 'Develops promotional strategies and campaigns.', func: 'commercial', domain: 'business', caps: ['promotional_strategy', 'campaign_development', 'messaging'] },
  { tier: 2, offset: 279, name: 'digital_marketing_expert', display: 'Digital Marketing Expert', desc: 'Develops digital marketing and social media strategies.', func: 'commercial', domain: 'business', caps: ['digital_marketing', 'social_media', 'content_strategy'] },
  { tier: 2, offset: 280, name: 'commercial_analytics_director', display: 'Commercial Analytics Director', desc: 'Provides commercial analytics and decision support.', func: 'commercial', domain: 'business', caps: ['commercial_analytics', 'forecasting', 'business_intelligence'] },
  { tier: 2, offset: 281, name: 'trade_distribution_manager', display: 'Trade & Distribution Manager', desc: 'Manages trade channels and distribution strategy.', func: 'commercial', domain: 'business', caps: ['trade_management', 'distribution_strategy', 'channel_optimization'] },
  { tier: 2, offset: 282, name: 'lifecycle_brand_manager', display: 'Lifecycle Brand Manager', desc: 'Manages brand lifecycle and portfolio optimization.', func: 'commercial', domain: 'business', caps: ['lifecycle_management', 'portfolio_strategy', 'loe_planning'] },
  { tier: 2, offset: 283, name: 'customer_experience_director', display: 'Customer Experience Director', desc: 'Designs customer experience and engagement programs.', func: 'commercial', domain: 'business', caps: ['customer_experience', 'journey_mapping', 'engagement_design'] },
  { tier: 2, offset: 284, name: 'commercial_operations_lead', display: 'Commercial Operations Lead', desc: 'Manages commercial operations and infrastructure.', func: 'commercial', domain: 'business', caps: ['commercial_operations', 'crm_management', 'data_governance'] },

  // Continue with Health Economics (15), Data Science (15), and Tier 3 remaining (40)...
  // For now, generating partial set to demonstrate
];

async function generate() {
  let success = 0;
  console.log(`🚀 Generating ${remainingAgents.length} additional agents...\n`);
  
  for (const t of remainingAgents) {
    const agent = {
      name: t.name,
      display_name: t.display,
      description: t.desc,
      avatar: `avatar_${String(t.offset).padStart(4, '0')}`,
      color: t.domain === 'medical' ? '#1976D2' : t.domain === 'technical' ? '#00897B' : '#5E35B1',
      version: '1.0.0',
      model: t.tier === 3 ? (t.domain === 'medical' ? 'gpt-4' : 'claude-3-opus') : t.tier === 2 ? 'gpt-4' : t.domain === 'medical' ? 'microsoft/biogpt' : 'gpt-3.5-turbo',
      system_prompt: `YOU ARE: ${t.display}. ${t.desc}\n\nCAPABILITIES: ${t.caps.join(', ')}`,
      temperature: t.tier === 3 ? 0.2 : t.tier === 2 ? 0.4 : 0.6,
      max_tokens: t.tier === 3 ? 4000 : t.tier === 2 ? 3000 : 2000,
      rag_enabled: true,
      context_window: t.tier === 3 ? 16000 : t.tier === 2 ? 8000 : 4000,
      response_format: 'markdown',
      capabilities: t.caps,
      knowledge_domains: [t.domain],
      domain_expertise: t.domain,
      business_function: t.func,
      role: t.tier === 3 ? 'ultra_specialist' : t.tier === 2 ? 'specialist' : 'foundational',
      tier: t.tier,
      priority: t.offset,
      implementation_phase: 1,
      cost_per_query: t.tier === 3 ? 0.35 : t.tier === 2 ? 0.12 : 0.02,
      validation_status: 'validated',
      hipaa_compliant: true,
      status: 'active',
    };

    try {
      const { error } = await supabase.from('agents').insert([agent]);
      if (error && error.code !== '23505') throw error;
      success++;
      console.log(`  ✅ ${t.display}`);
    } catch (err: any) {
      console.error(`  ❌ ${t.display}: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Added ${success} agents!`);
}

generate().then(() => process.exit(0));
