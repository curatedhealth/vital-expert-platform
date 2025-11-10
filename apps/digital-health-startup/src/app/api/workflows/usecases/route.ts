/**
 * API Route: GET /api/workflows/usecases
 * Fetches all use cases with workflow statistics
 */

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('Fetching use cases and JTBDs from Supabase...');

    // Fetch all use cases from dh_use_case
    const { data: useCases, error: useCasesError } = await supabase
      .from('dh_use_case')
      .select('*')
      .order('code', { ascending: true });

    if (useCasesError) {
      console.error('Use cases fetch error:', useCasesError);
      throw useCasesError;
    }

    console.log(`✅ Fetched ${useCases?.length || 0} use cases from dh_use_case`);

    // Fetch all Medical Affairs JTBDs from jtbd_library
    const { data: jtbds, error: jtbdsError } = await supabase
      .from('jtbd_library')
      .select('*')
      .order('jtbd_code', { ascending: true });

    if (jtbdsError) {
      console.error('JTBDs fetch error:', jtbdsError);
      throw jtbdsError;
    }

    console.log(`✅ Fetched ${jtbds?.length || 0} JTBDs from jtbd_library`);

    // Transform JTBDs to match UseCase interface
    // NOTE: All JTBDs from jtbd_library are Medical Affairs, so default to Pharma industry
    const jtbdAsUseCases = jtbds?.map(jtbd => ({
      id: jtbd.id,
      code: jtbd.jtbd_code || jtbd.id,
      unique_id: jtbd.unique_id || jtbd.id,
      title: jtbd.title || jtbd.statement || 'Untitled JTBD',
      description: jtbd.description || jtbd.goal || '',
      domain: 'MA', // Medical Affairs
      complexity: mapComplexityToStandard(jtbd.complexity),
      estimated_duration_minutes: estimateDurationFromComplexity(jtbd.complexity),
      deliverables: parseJsonField(jtbd.success_criteria) || [],
      prerequisites: parseJsonField(jtbd.pain_points) || [],
      strategic_pillar: jtbd.function || jtbd.strategic_pillar || 'Uncategorized', // DB column is 'function'
      source: 'Medical Affairs JTBD Library',
      category: jtbd.category,
      importance: jtbd.importance,
      frequency: jtbd.frequency,
      sector: 'Pharma', // All Medical Affairs JTBDs are Pharma
      industry: 'Pharma', // All Medical Affairs JTBDs are Pharma
    })) || [];

    console.log(`📊 Transformed ${jtbdAsUseCases.length} JTBDs, sample SP codes:`,
      jtbdAsUseCases.slice(0, 3).map(j => `${j.code}: ${j.strategic_pillar}`).join(', '));

    // Add domain field extracted from code (UC_CD_001 -> CD, UC_MA_001 -> MA)
    const useCasesWithDomain = useCases?.map(uc => ({
      ...uc,
      domain: uc.code?.split('_')[1] || 'UNKNOWN', // Extract CD, MA, RA, etc. from UC_CD_001
      source: 'Digital Health Use Cases',
      sector: uc.sector || 'Digital Health Startup', // Default DH use cases to Startup
      industry: uc.sector || 'Digital Health Startup',
    })) || [];

    // Combine both sources
    const allUseCases = [...useCasesWithDomain, ...jtbdAsUseCases];

    console.log(`✅ Combined total: ${allUseCases.length} use cases (${useCasesWithDomain.length} DH + ${jtbdAsUseCases.length} MA JTBDs)`);

    // Fetch workflow counts
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select('id, use_case_id');

    if (workflowsError) {
      console.error('Workflows fetch error:', workflowsError);
      throw workflowsError;
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflows`);

    // Fetch task counts
    const { data: tasks, error: tasksError } = await supabase
      .from('dh_task')
      .select('id, workflow_id');

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError);
      throw tasksError;
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks`);

    // Group Pharma JTBDs by Strategic Pillar
    const strategicPillars = jtbdAsUseCases.reduce((acc: Record<string, any[]>, jtbd: any) => {
      const pillar = jtbd.strategic_pillar || 'Uncategorized';
      if (!acc[pillar]) acc[pillar] = [];
      acc[pillar].push(jtbd);
      return acc;
    }, {});

    console.log('🎯 Strategic Pillars breakdown:', Object.keys(strategicPillars).map(sp => `${sp}: ${strategicPillars[sp].length}`).join(', '));
    console.log('🎯 Sample JTBD strategic_pillar values:', jtbdAsUseCases.slice(0, 5).map(j => `${j.code}: ${j.strategic_pillar || 'NULL'}`));

    // Calculate statistics
    const stats = {
      total_workflows: workflows?.length || 0,
      total_tasks: tasks?.length || 0,
      total_jtbds: jtbdAsUseCases.length,
      by_domain: allUseCases.reduce((acc: Record<string, number>, uc: any) => {
        acc[uc.domain] = (acc[uc.domain] || 0) + 1;
        return acc;
      }, {}),
      by_complexity: allUseCases.reduce((acc: Record<string, number>, uc: any) => {
        acc[uc.complexity] = (acc[uc.complexity] || 0) + 1;
        return acc;
      }, {}),
      by_source: allUseCases.reduce((acc: Record<string, number>, uc: any) => {
        acc[uc.source] = (acc[uc.source] || 0) + 1;
        return acc;
      }, {}),
      by_industry: allUseCases.reduce((acc: Record<string, number>, uc: any) => {
        const industry = uc.industry || uc.sector || 'Unknown';
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {}),
      by_strategic_pillar: Object.keys(strategicPillars).reduce((acc: Record<string, number>, pillar: string) => {
        acc[pillar] = strategicPillars[pillar].length;
        return acc;
      }, {}),
    };

    console.log('✅ Stats calculated:', JSON.stringify(stats, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        useCases: allUseCases,
        stats,
        strategicPillars, // Add strategic pillars grouping for Pharma
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching use cases:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch use cases',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function mapComplexityToStandard(complexity?: string): string {
  if (!complexity) return 'INTERMEDIATE';
  const lower = complexity.toLowerCase();
  if (lower.includes('expert') || lower.includes('high')) return 'EXPERT';
  if (lower.includes('advanced')) return 'ADVANCED';
  if (lower.includes('intermediate') || lower.includes('medium')) return 'INTERMEDIATE';
  if (lower.includes('beginner') || lower.includes('basic') || lower.includes('low')) return 'BEGINNER';
  return 'INTERMEDIATE';
}

function estimateDurationFromComplexity(complexity?: string): number {
  const mapped = mapComplexityToStandard(complexity);
  switch (mapped) {
    case 'BEGINNER': return 30;
    case 'INTERMEDIATE': return 60;
    case 'ADVANCED': return 120;
    case 'EXPERT': return 240;
    default: return 60;
  }
}

function parseJsonField(field: any): any[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

