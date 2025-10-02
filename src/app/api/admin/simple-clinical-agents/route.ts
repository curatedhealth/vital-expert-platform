import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  // try {
    // Minimal clinical agents with only essential fields

      {
        name: 'clinical-trial-designer',
        display_name: 'Clinical Trial Designer',
        description: 'AI agent specialized in designing comprehensive clinical trial protocols with regulatory compliance.',
        system_prompt: 'You are a Clinical Trial Designer AI specializing in protocol development for pharmaceutical and medical device trials.',
        model: 'gpt-4',
        tier: 5,
        priority: 1,
        status: 'active'
      },
      {
        name: 'medical-literature-analyst',
        display_name: 'Medical Literature Analyst',
        description: 'Performs comprehensive medical literature analysis, systematic reviews, and meta-analyses with evidence grading.',
        system_prompt: 'You are a Medical Literature Analyst AI specializing in systematic reviews and evidence synthesis.',
        model: 'gpt-4',
        tier: 5,
        priority: 1,
        status: 'active'
      },
      {
        name: 'diagnostic-pathway-optimizer',
        display_name: 'Diagnostic Pathway Optimizer',
        description: 'Optimizes diagnostic pathways based on clinical guidelines, creating decision trees and algorithms.',
        system_prompt: 'You are a Diagnostic Pathway Optimizer AI specializing in clinical decision support.',
        model: 'gpt-4',
        tier: 4,
        priority: 2,
        status: 'active'
      },
      {
        name: 'treatment-outcome-predictor',
        display_name: 'Treatment Outcome Predictor',
        description: 'Predicts treatment outcomes based on patient characteristics, biomarkers, and historical data.',
        system_prompt: 'You are a Treatment Outcome Predictor AI specializing in predictive analytics for clinical outcomes.',
        model: 'gpt-4',
        tier: 4,
        priority: 2,
        status: 'active'
      },
      {
        name: 'patient-cohort-analyzer',
        display_name: 'Patient Cohort Analyzer',
        description: 'Analyzes patient populations for clinical trials, real-world evidence studies, and epidemiological research.',
        system_prompt: 'You are a Patient Cohort Analyzer AI specializing in population health analytics.',
        model: 'gpt-4',
        tier: 3,
        priority: 3,
        status: 'active'
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

    // return NextResponse.json({
      success: true,
      message: `Clinical intelligence agents added successfully`,
      inserted: successCount,
      total: clinicalAgents.length,
      errors: errors
    });

  } catch (error) {
    // console.error('=== SIMPLE CLINICAL AGENTS ADD ERROR ===');
    // console.error('Add agents error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add clinical intelligence agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}