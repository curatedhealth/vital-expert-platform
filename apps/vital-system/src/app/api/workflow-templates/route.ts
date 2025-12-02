/**
 * Workflow Templates API - List seeded workflow templates
 * GET /api/workflow-templates - List workflow templates with industry categorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  description: string | null;
  work_mode: 'routine' | 'project' | 'adhoc';
  workflow_type: 'standard' | 'conditional' | 'parallel' | 'sequential';
  complexity_level: 'low' | 'medium' | 'high' | 'very_high';
  estimated_duration_hours: number | null;
  stage_count: number;
  task_count: number;
  industry_category: 'Digital Health' | 'Pharmaceuticals' | 'VITAL System';
}

// Industry categorization based on workflow naming patterns
function categorizeWorkflow(name: string, code: string): WorkflowTemplate['industry_category'] {
  // Digital Health indicators
  if (
    name.toLowerCase().includes('digital') ||
    name.toLowerCase().includes('dtx') ||
    name.toLowerCase().includes('samd') ||
    name.toLowerCase().includes('ai/ml') ||
    name.toLowerCase().includes('decentralized') ||
    code.startsWith('WF-DH')
  ) {
    return 'Digital Health';
  }

  // Pharmaceuticals indicators
  if (
    name.toLowerCase().includes('medical') ||
    name.toLowerCase().includes('clinical') ||
    name.toLowerCase().includes('kol') ||
    name.toLowerCase().includes('regulatory') ||
    name.toLowerCase().includes('pharma') ||
    name.toLowerCase().includes('field') ||
    code.startsWith('WF-MA') ||
    code.startsWith('WF-FME') ||
    code.startsWith('WF-MIT') ||
    code.startsWith('WF-RSR')
  ) {
    return 'Pharmaceuticals';
  }

  return 'VITAL System';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry'); // 'Digital Health', 'Pharmaceuticals', 'VITAL System', or 'all'
    const workMode = searchParams.get('work_mode'); // 'routine', 'project', 'adhoc'
    const search = searchParams.get('search');

    // Query workflow summary view for complete data
    const { data: workflows, error } = await supabase
      .from('v_workflow_summary')
      .select('*')
      .order('workflow_name', { ascending: true });

    if (error) {
      console.error('Error fetching workflow templates:', error);
      // If view doesn't exist, try the base table
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Workflow Templates API] v_workflow_summary view does not exist, querying base table');

        const { data: baseData, error: baseError } = await supabase
          .from('workflow_templates')
          .select('id, code, name, description, work_mode, workflow_type, complexity_level, estimated_duration_hours')
          .is('deleted_at', null)
          .order('name', { ascending: true });

        if (baseError) {
          return NextResponse.json({ error: 'Failed to fetch workflow templates', details: baseError.message }, { status: 500 });
        }

        // Map base data with industry categorization
        const mappedWorkflows: WorkflowTemplate[] = (baseData || []).map(wf => ({
          id: wf.id,
          code: wf.code || '',
          name: wf.name,
          description: wf.description,
          work_mode: wf.work_mode || 'project',
          workflow_type: wf.workflow_type || 'sequential',
          complexity_level: wf.complexity_level || 'medium',
          estimated_duration_hours: wf.estimated_duration_hours,
          stage_count: 0,
          task_count: 0,
          industry_category: categorizeWorkflow(wf.name, wf.code || ''),
        }));

        return NextResponse.json({ workflows: mappedWorkflows });
      }
      return NextResponse.json({ error: 'Failed to fetch workflow templates', details: error.message }, { status: 500 });
    }

    // Map and categorize workflows
    let mappedWorkflows: WorkflowTemplate[] = (workflows || []).map(wf => ({
      id: wf.template_id,
      code: wf.code || '',
      name: wf.workflow_name,
      description: null,
      work_mode: wf.work_mode || 'project',
      workflow_type: wf.workflow_type || 'sequential',
      complexity_level: wf.complexity_level || 'medium',
      estimated_duration_hours: wf.estimated_duration_hours,
      stage_count: wf.stage_count || 0,
      task_count: wf.task_count || 0,
      industry_category: categorizeWorkflow(wf.workflow_name, wf.code || ''),
    }));

    // Apply filters
    if (industry && industry !== 'all') {
      mappedWorkflows = mappedWorkflows.filter(wf => wf.industry_category === industry);
    }

    if (workMode) {
      mappedWorkflows = mappedWorkflows.filter(wf => wf.work_mode === workMode);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      mappedWorkflows = mappedWorkflows.filter(wf =>
        wf.name.toLowerCase().includes(searchLower) ||
        wf.code.toLowerCase().includes(searchLower)
      );
    }

    // Group by industry for summary
    const summary = {
      total: mappedWorkflows.length,
      byIndustry: {
        'Digital Health': mappedWorkflows.filter(wf => wf.industry_category === 'Digital Health').length,
        'Pharmaceuticals': mappedWorkflows.filter(wf => wf.industry_category === 'Pharmaceuticals').length,
        'VITAL System': mappedWorkflows.filter(wf => wf.industry_category === 'VITAL System').length,
      },
      byWorkMode: {
        project: mappedWorkflows.filter(wf => wf.work_mode === 'project').length,
        routine: mappedWorkflows.filter(wf => wf.work_mode === 'routine').length,
        adhoc: mappedWorkflows.filter(wf => wf.work_mode === 'adhoc').length,
      },
    };

    return NextResponse.json({
      workflows: mappedWorkflows,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/workflow-templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
