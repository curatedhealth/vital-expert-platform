/**
 * API Route: GET /api/workflows/usecases
 * Fetches all workflow templates with stages and task statistics
 * Uses the seeded workflow_templates data
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Domain categorization based on workflow codes and names
function getDomain(code: string, name: string): string {
  // Digital Health
  if (code.startsWith('WF-DH') || name.toLowerCase().includes('dtx') ||
      name.toLowerCase().includes('samd') || name.toLowerCase().includes('ai/ml') ||
      name.toLowerCase().includes('decentralized') || name.toLowerCase().includes('digital')) {
    return 'PD'; // Product Development for Digital Health
  }

  // Medical Affairs
  if (code.startsWith('WF-MA') || code.startsWith('WF-MIT') ||
      name.toLowerCase().includes('kol') || name.toLowerCase().includes('medical affairs')) {
    return 'MA'; // Market Access
  }

  // Field Medical Education
  if (code.startsWith('WF-FME') || name.toLowerCase().includes('field medical')) {
    return 'EG'; // Engagement
  }

  // Regulatory
  if (code.startsWith('WF-RSR') || name.toLowerCase().includes('regulatory')) {
    return 'RA'; // Regulatory Affairs
  }

  // Real-World Evidence
  if (code.startsWith('WF-RWE') || name.toLowerCase().includes('real-world') ||
      name.toLowerCase().includes('evidence')) {
    return 'RWE';
  }

  // Clinical Development
  if (name.toLowerCase().includes('clinical') || name.toLowerCase().includes('trial')) {
    return 'CD'; // Clinical Development
  }

  // Default to Product Development for cross-functional
  return 'PD';
}

// Complexity mapping based on workflow complexity_level
function getComplexity(level: string): string {
  switch (level) {
    case 'very_high':
      return 'EXPERT';
    case 'high':
      return 'ADVANCED';
    case 'medium':
      return 'INTERMEDIATE';
    case 'low':
      return 'BEGINNER';
    default:
      return 'INTERMEDIATE';
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    console.log('Fetching workflow templates from Supabase...');

    // Fetch all workflow templates with summary data
    const { data: workflows, error: workflowsError } = await supabase
      .from('v_workflow_summary')
      .select('*')
      .order('workflow_name', { ascending: true });

    if (workflowsError) {
      console.error('Workflow templates fetch error:', workflowsError);
      // If view doesn't exist, try the base table
      if (workflowsError.code === '42P01' || workflowsError.message?.includes('does not exist')) {
        console.warn('v_workflow_summary view does not exist, querying base table');

        const { data: baseData, error: baseError } = await supabase
          .from('workflow_templates')
          .select('id, code, name, description, work_mode, workflow_type, complexity_level, estimated_duration_hours')
          .is('deleted_at', null)
          .order('name', { ascending: true });

        if (baseError) {
          throw baseError;
        }

        // Map to use case format
        const useCases = (baseData || []).map(wf => ({
          id: wf.id,
          code: wf.code || '',
          unique_id: wf.code || '',
          title: wf.name,
          description: wf.description || `${wf.name} workflow`,
          domain: getDomain(wf.code || '', wf.name),
          complexity: getComplexity(wf.complexity_level || 'medium'),
          estimated_duration_minutes: (wf.estimated_duration_hours || 0) * 60,
          deliverables: [],
          prerequisites: [],
          work_mode: wf.work_mode,
          workflow_type: wf.workflow_type,
          stage_count: 0,
          task_count: 0,
        }));

        return NextResponse.json({
          success: true,
          data: {
            useCases,
            stats: {
              total_workflows: useCases.length,
              total_tasks: 0,
              by_domain: useCases.reduce((acc: Record<string, number>, uc) => {
                acc[uc.domain] = (acc[uc.domain] || 0) + 1;
                return acc;
              }, {}),
              by_complexity: useCases.reduce((acc: Record<string, number>, uc) => {
                acc[uc.complexity] = (acc[uc.complexity] || 0) + 1;
                return acc;
              }, {}),
            },
          },
          timestamp: new Date().toISOString(),
        });
      }
      throw workflowsError;
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflow templates`);

    // Transform workflow data to use case format expected by the page
    const useCases = (workflows || []).map(wf => ({
      id: wf.template_id,
      code: wf.code || '',
      unique_id: wf.code || '',
      title: wf.workflow_name,
      description: `${wf.workflow_name} - ${wf.work_mode} workflow with ${wf.stage_count} stages and ${wf.task_count} tasks`,
      domain: getDomain(wf.code || '', wf.workflow_name),
      complexity: getComplexity(wf.complexity_level || 'medium'),
      estimated_duration_minutes: (wf.estimated_duration_hours || 0) * 60,
      deliverables: [`${wf.stage_count} stages completed`, `${wf.task_count} tasks executed`],
      prerequisites: [],
      work_mode: wf.work_mode,
      workflow_type: wf.workflow_type,
      stage_count: wf.stage_count || 0,
      task_count: wf.task_count || 0,
    }));

    console.log('✅ Transformed workflows to use cases:', useCases.slice(0, 2));

    // Calculate total tasks from all workflows
    const totalTasks = useCases.reduce((sum, uc) => sum + uc.task_count, 0);

    // Calculate statistics
    const stats = {
      total_workflows: useCases.length,
      total_tasks: totalTasks,
      by_domain: useCases.reduce((acc: Record<string, number>, uc) => {
        acc[uc.domain] = (acc[uc.domain] || 0) + 1;
        return acc;
      }, {}),
      by_complexity: useCases.reduce((acc: Record<string, number>, uc) => {
        acc[uc.complexity] = (acc[uc.complexity] || 0) + 1;
        return acc;
      }, {}),
    };

    console.log('✅ Stats calculated:', JSON.stringify(stats, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        useCases,
        stats,
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
