import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Domain categorization based on workflow codes and names
function getDomain(code: string, name: string): string {
  // Digital Health
  if (code.startsWith('WF-DH') || name.toLowerCase().includes('dtx') ||
      name.toLowerCase().includes('samd') || name.toLowerCase().includes('ai/ml') ||
      name.toLowerCase().includes('decentralized') || name.toLowerCase().includes('digital')) {
    return 'PD';
  }

  // Medical Affairs
  if (code.startsWith('WF-MA') || code.startsWith('WF-MIT') ||
      name.toLowerCase().includes('kol') || name.toLowerCase().includes('medical affairs')) {
    return 'MA';
  }

  // Field Medical Education
  if (code.startsWith('WF-FME') || name.toLowerCase().includes('field medical')) {
    return 'EG';
  }

  // Regulatory
  if (code.startsWith('WF-RSR') || name.toLowerCase().includes('regulatory')) {
    return 'RA';
  }

  // Real-World Evidence
  if (code.startsWith('WF-RWE') || name.toLowerCase().includes('real-world') ||
      name.toLowerCase().includes('evidence')) {
    return 'RWE';
  }

  // Clinical Development
  if (name.toLowerCase().includes('clinical') || name.toLowerCase().includes('trial')) {
    return 'CD';
  }

  return 'PD';
}

// Complexity mapping
function getComplexity(level: string): string {
  switch (level) {
    case 'very_high':
      return 'Expert';
    case 'high':
      return 'Advanced';
    case 'medium':
      return 'Intermediate';
    case 'low':
      return 'Basic';
    default:
      return 'Intermediate';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    console.log('Fetching use case:', code);

    // Fetch workflow template by code
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('code', code)
      .is('deleted_at', null)
      .single();

    if (templateError) {
      console.error('Workflow template fetch error:', templateError);
      
      // Handle "no rows" error (PGRST116) or table not found errors
      if (templateError.code === 'PGRST116' || templateError.code === '42P01' || 
          templateError.code === 'PGRST204' || templateError.code === 'PGRST205') {
        return NextResponse.json(
          {
            success: false,
            error: 'Workflow not found',
            details: `No workflow with code "${code}" exists`,
          },
          { status: 404 }
        );
      }
      throw templateError;
    }

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Fetched workflow template: ${template.code}`);

    // Transform template to use case format
    const useCase = {
      id: template.id,
      code: template.code || '',
      title: template.name,
      description: template.description || `${template.name} workflow`,
      domain: getDomain(template.code || '', template.name),
      complexity: getComplexity(template.complexity_level || 'medium'),
      estimated_duration_minutes: (template.estimated_duration_hours || 0) * 60,
      deliverables: [],
      prerequisites: [],
      success_metrics: {},
    };

    // Fetch stages (workflows) for this template
    const { data: stages, error: stagesError } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('template_id', template.id)
      .order('stage_number', { ascending: true });

    if (stagesError) {
      console.error('Stages fetch error:', stagesError);
      throw stagesError;
    }

    // Transform stages to workflows format
    const workflows = (stages || []).map((stage, idx) => ({
      id: stage.id,
      use_case_id: template.id,
      name: stage.stage_name,
      unique_id: `${code}-S${stage.stage_number}`,
      description: stage.description || '',
      position: stage.stage_number || idx + 1,
      metadata: {
        estimated_duration_hours: stage.estimated_duration_hours,
        is_mandatory: stage.is_mandatory,
      },
    }));

    console.log(`✅ Fetched ${workflows.length} workflows (stages)`);

    return NextResponse.json({
      success: true,
      data: {
        useCase,
        workflows,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching use case:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch use case',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
