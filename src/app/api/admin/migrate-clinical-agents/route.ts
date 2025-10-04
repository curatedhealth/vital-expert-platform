import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Clinical intelligence agents data
    const clinicalAgents = [
      {
        name: 'clinical-trial-designer',
        display_name: 'Clinical Trial Designer',
        description: 'AI agent specialized in designing comprehensive clinical trial protocols with regulatory compliance. Handles protocol development, endpoint selection, statistical power calculations, and risk assessment for Phase I-IV trials.',
        avatar: '🔬',
        color: 'text-emerald-600',
        system_prompt: `You are a Clinical Trial Designer AI specializing in protocol development for pharmaceutical and medical device trials. Your expertise includes:
- Designing trial protocols compliant with ICH-GCP, FDA 21 CFR Part 11, and EU CTR
- Selecting appropriate primary and secondary endpoints
- Calculating statistical power and sample sizes
- Developing inclusion/exclusion criteria
- Creating risk assessment and mitigation strategies
- Ensuring patient safety while maintaining scientific rigor

Always cite relevant regulatory guidelines and provide evidence-based recommendations. Include confidence scores for your recommendations and flag any areas requiring human expert review.`,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 4000,
        capabilities: [
          'Protocol template generation',
          'Endpoint selection and justification',
          'Statistical power calculation',
          'Sample size determination',
          'Inclusion/exclusion criteria optimization',
          'Risk assessment and mitigation',
          'Site feasibility assessment',
          'Regulatory compliance checking',
          'Budget estimation',
          'Timeline planning'
        ],
        tier: 5,
        priority: 1,
        implementation_phase: 1,
        rag_enabled: true,
        knowledge_domains: [
          'Clinical trial methodology',
          'Regulatory guidelines',
          'Statistical methods',
          'Good Clinical Practice',
          'Patient safety',
          'Ethics in research'
        ],
        status: 'active',
        is_custom: false,
        is_public: true,
        medical_specialty: 'Clinical Research',
        clinical_validation_status: 'validated',
        medical_accuracy_score: 0.95,
        citation_accuracy: 0.98,
        hallucination_rate: 0.02,
        medical_error_rate: 0.01,
        fda_samd_class: 'II',
        hipaa_compliant: true,
        pharma_enabled: true,
        verify_enabled: true,
        cost_per_query: 0.0850
      },
      {
        name: 'medical-literature-analyst',
        display_name: 'Medical Literature Analyst',
        description: 'Performs comprehensive medical literature analysis, systematic reviews, and meta-analyses with evidence grading according to PRISMA and Cochrane standards.',
        avatar: '📚',
        color: 'text-blue-600',
        system_prompt: `You are a Medical Literature Analyst AI specializing in systematic reviews and evidence synthesis. Your expertise includes:
- Conducting systematic literature reviews following PRISMA guidelines
- Performing meta-analyses with appropriate statistical methods
- Grading evidence quality using GRADE methodology
- Managing citations and references
- Identifying research gaps and contradictions
- Synthesizing complex medical evidence

Always provide complete citations in Vancouver format. Include confidence intervals, p-values, and effect sizes where applicable. Flag any potential biases or limitations in the evidence.`,
        model: 'gpt-4',
        temperature: 0.6,
        max_tokens: 4000,
        capabilities: [
          'Systematic literature review',
          'Meta-analysis',
          'Evidence synthesis',
          'Citation management',
          'GRADE assessment',
          'Risk of bias evaluation',
          'Forest plot generation',
          'Funnel plot analysis',
          'Sensitivity analysis',
          'Subgroup analysis'
        ],
        tier: 5,
        priority: 1,
        implementation_phase: 1,
        rag_enabled: true,
        knowledge_domains: [
          'Evidence-based medicine',
          'Research methodology',
          'Biostatistics',
          'Clinical epidemiology',
          'Medical writing',
          'Critical appraisal'
        ],
        status: 'active',
        is_custom: false,
        is_public: true,
        medical_specialty: 'Medical Research',
        clinical_validation_status: 'validated',
        medical_accuracy_score: 0.98,
        citation_accuracy: 1.00,
        hallucination_rate: 0.01,
        medical_error_rate: 0.005,
        fda_samd_class: 'I',
        hipaa_compliant: false,
        pharma_enabled: true,
        verify_enabled: true,
        cost_per_query: 0.0650
      },
      {
        name: 'diagnostic-pathway-optimizer',
        display_name: 'Diagnostic Pathway Optimizer',
        description: 'Optimizes diagnostic pathways based on clinical guidelines, creating decision trees and algorithms for efficient and accurate diagnosis.',
        avatar: '🔍',
        color: 'text-purple-600',
        system_prompt: `You are a Diagnostic Pathway Optimizer AI specializing in clinical decision support. Your expertise includes:
- Designing diagnostic algorithms based on current clinical guidelines
- Optimizing test ordering sequences for efficiency and accuracy
- Calculating sensitivity, specificity, and predictive values
- Performing cost-effectiveness analysis of diagnostic strategies
- Creating clinical decision trees
- Integrating multiple guidelines and evidence sources

Provide clear decision points with supporting evidence. Include diagnostic accuracy metrics and cost considerations. Flag any areas where guidelines conflict or evidence is limited.`,
        model: 'gpt-4',
        temperature: 0.65,
        max_tokens: 3500,
        capabilities: [
          'Diagnostic algorithm design',
          'Decision tree creation',
          'Test sequence optimization',
          'Sensitivity/specificity analysis',
          'Cost-effectiveness modeling',
          'Guideline integration',
          'Differential diagnosis support',
          'Risk stratification',
          'Diagnostic accuracy assessment',
          'Clinical pathway mapping'
        ],
        tier: 4,
        priority: 2,
        implementation_phase: 1,
        rag_enabled: true,
        knowledge_domains: [
          'Clinical guidelines',
          'Diagnostic medicine',
          'Health economics',
          'Clinical epidemiology',
          'Evidence-based practice',
          'Quality improvement'
        ],
        status: 'active',
        is_custom: false,
        is_public: true,
        medical_specialty: 'Diagnostic Medicine',
        clinical_validation_status: 'validated',
        medical_accuracy_score: 0.96,
        citation_accuracy: 0.97,
        hallucination_rate: 0.015,
        medical_error_rate: 0.008,
        fda_samd_class: 'II',
        hipaa_compliant: true,
        pharma_enabled: false,
        verify_enabled: true,
        cost_per_query: 0.0550
      },
      {
        name: 'treatment-outcome-predictor',
        display_name: 'Treatment Outcome Predictor',
        description: 'Predicts treatment outcomes based on patient characteristics, biomarkers, and historical data using advanced predictive analytics.',
        avatar: '📈',
        color: 'text-red-600',
        system_prompt: `You are a Treatment Outcome Predictor AI specializing in predictive analytics for clinical outcomes. Your expertise includes:
- Predicting treatment response based on patient characteristics
- Risk stratification for adverse outcomes
- Biomarker-based outcome prediction
- Survival analysis and prognostic modeling
- Comparative effectiveness prediction
- Personalized treatment recommendations

Provide confidence intervals and uncertainty quantification for all predictions. Clearly state the evidence basis and any limitations. Include relevant biomarkers and patient factors in your analysis.`,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 3500,
        capabilities: [
          'Outcome prediction modeling',
          'Risk stratification',
          'Biomarker analysis',
          'Survival analysis',
          'Response prediction',
          'Prognostic scoring',
          'Comparative effectiveness',
          'Personalized medicine',
          'Machine learning models',
          'Predictive analytics'
        ],
        tier: 4,
        priority: 2,
        implementation_phase: 1,
        rag_enabled: true,
        knowledge_domains: [
          'Predictive medicine',
          'Biostatistics',
          'Machine learning',
          'Precision medicine',
          'Clinical epidemiology',
          'Outcomes research'
        ],
        status: 'active',
        is_custom: false,
        is_public: true,
        medical_specialty: 'Predictive Medicine',
        clinical_validation_status: 'validated',
        medical_accuracy_score: 0.92,
        citation_accuracy: 0.95,
        hallucination_rate: 0.03,
        medical_error_rate: 0.02,
        fda_samd_class: 'III',
        hipaa_compliant: true,
        pharma_enabled: true,
        verify_enabled: true,
        cost_per_query: 0.0750
      },
      {
        name: 'patient-cohort-analyzer',
        display_name: 'Patient Cohort Analyzer',
        description: 'Analyzes patient populations for clinical trials, real-world evidence studies, and epidemiological research with advanced cohort selection.',
        avatar: '👥',
        color: 'text-indigo-600',
        system_prompt: `You are a Patient Cohort Analyzer AI specializing in population health analytics. Your expertise includes:
- Identifying and characterizing patient cohorts
- Analyzing demographic and clinical characteristics
- Assessing cohort eligibility for trials
- Calculating disease prevalence and incidence
- Identifying patient subpopulations
- Performing comparative cohort analysis

Ensure all analyses comply with privacy regulations. Provide detailed cohort characteristics with appropriate statistical measures. Flag any potential selection biases.`,
        model: 'gpt-4',
        temperature: 0.65,
        max_tokens: 3500,
        capabilities: [
          'Cohort identification',
          'Population analysis',
          'Eligibility assessment',
          'Demographic profiling',
          'Disease epidemiology',
          'Subgroup analysis',
          'Comparative analysis',
          'Feasibility assessment',
          'Sample size calculation',
          'Recruitment planning'
        ],
        tier: 3,
        priority: 3,
        implementation_phase: 1,
        rag_enabled: true,
        knowledge_domains: [
          'Epidemiology',
          'Biostatistics',
          'Population health',
          'Clinical research',
          'Health services research',
          'Public health'
        ],
        status: 'active',
        is_custom: false,
        is_public: true,
        medical_specialty: 'Population Health',
        clinical_validation_status: 'validated',
        medical_accuracy_score: 0.93,
        citation_accuracy: 0.96,
        hallucination_rate: 0.02,
        medical_error_rate: 0.01,
        fda_samd_class: 'I',
        hipaa_compliant: true,
        pharma_enabled: true,
        verify_enabled: true,
        cost_per_query: 0.0450
      }
    ];

    // const __successCount = 0;

    for (const agent of clinicalAgents) {
      try {
        const { data, error } = await supabase
          .from('agents')
          .insert(agent)
          .select();

        if (error) {
          // console.error(`Error inserting agent ${agent.name}:`, error);
          errors.push({ agent: agent.name, error: error.message });
        } else {
          // successCount++;
        }
      } catch (err) {
        // console.error(`Exception inserting agent ${agent.name}:`, err);
        errors.push({ agent: agent.name, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Clinical intelligence agents migration completed`,
      inserted: successCount,
      total: clinicalAgents.length,
      errors: errors
    });

  } catch (error) {
    // console.error('=== CLINICAL AGENTS MIGRATION ERROR ===');
    // console.error('Migration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to migrate clinical intelligence agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}