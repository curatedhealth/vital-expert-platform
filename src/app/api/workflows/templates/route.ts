import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  WorkflowTemplate,
  TemplateFilters,
  TemplateListResponse
} from '@/types/workflow-enhanced';
import {
  pharmaceuticalTemplates,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  searchTemplates,
  getPopularTemplates,
  getRecentTemplates
} from '@/lib/templates/pharmaceutical-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/workflows/templates - Get workflow templates with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: TemplateFilters = {
      category: searchParams.get('category') || undefined,
      complexity: searchParams.get('complexity') as 'Low' | 'Medium' | 'High' || undefined,
      search: searchParams.get('search') || undefined,
      min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined,
      industry_tags: searchParams.get('tags')?.split(',') || undefined
    };

    const view = searchParams.get('view') || 'all'; // all, popular, recent
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeBuiltIn = searchParams.get('include_builtin') !== 'false';

    let templates: WorkflowTemplate[] = [];

    // Start with built-in templates if requested
    if (includeBuiltIn) {
      templates = [...pharmaceuticalTemplates];
    }

    // Fetch custom templates from database
    let query = supabase
      .from('workflow_templates')
      .select('*');

    // Apply database filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.complexity) {
      query = query.eq('complexity_level', filters.complexity);
    }

    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    if (filters.industry_tags && filters.industry_tags.length > 0) {
      query = query.overlaps('industry_tags', filters.industry_tags);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Only public templates for now (could be extended to include user's private templates)
    query = query.eq('is_public', true);

    const { data: dbTemplates, error } = await query;

    if (error) {
      console.error('Error fetching templates from database:', error);
    } else if (dbTemplates) {
      templates.push(...dbTemplates);
    }

    // Apply additional filtering
    let filteredTemplates = templates;

    if (filters.search) {
      filteredTemplates = searchTemplates(filters.search);
    }

    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filters.category);
    }

    if (filters.complexity) {
      filteredTemplates = filteredTemplates.filter(t => t.complexity_level === filters.complexity);
    }

    if (filters.min_rating) {
      filteredTemplates = filteredTemplates.filter(t => t.rating >= filters.min_rating!);
    }

    if (filters.industry_tags && filters.industry_tags.length > 0) {
      filteredTemplates = filteredTemplates.filter(t =>
        filters.industry_tags!.some(tag => t.industry_tags.includes(tag))
      );
    }

    // Apply view-specific sorting
    switch (view) {
      case 'popular':
        filteredTemplates = filteredTemplates
          .sort((a, b) => b.usage_count - a.usage_count)
          .slice(0, 20);
        break;

      case 'recent':
        filteredTemplates = filteredTemplates
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20);
        break;

      default:
        // Sort by rating, then usage count
        filteredTemplates = filteredTemplates.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.usage_count - a.usage_count;
        });
    }

    // Apply pagination
    const total = filteredTemplates.length;
    const offset = (page - 1) * limit;
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);

    // Get unique categories for filtering
    const categories = Array.from(new Set(templates.map(t => t.category)));

    const response: TemplateListResponse = {
      templates: paginatedTemplates,
      total,
      categories
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/workflows/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/templates - Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const template: Partial<WorkflowTemplate> = body;

    // Validate required fields
    if (!template.name || !template.description || !template.template_data) {
      return NextResponse.json({
        error: 'Missing required fields: name, description, template_data'
      }, { status: 400 });
    }

    // Set default values
    const newTemplate: Partial<WorkflowTemplate> = {
      ...template,
      created_by: userId,
      is_public: template.is_public || false,
      version: template.version || '1.0',
      usage_count: 0,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Calculate estimated duration from steps
    if (newTemplate.template_data?.steps) {
      newTemplate.estimated_duration = newTemplate.template_data.steps.reduce(
        (sum, step) => sum + (step.estimated_duration || 0),
        0
      );
    }

    // Determine complexity level if not provided
    if (!newTemplate.complexity_level && newTemplate.template_data?.steps) {
      const stepCount = newTemplate.template_data.steps.length;
      const hasConditionalLogic = newTemplate.template_data.steps.some(step =>
        step.conditional_next && step.conditional_next.length > 0
      );
      const hasParallelExecution = newTemplate.template_data.steps.some(step => step.is_parallel);

      if (stepCount <= 3 && !hasConditionalLogic && !hasParallelExecution) {
        newTemplate.complexity_level = 'Low';
      } else if (stepCount <= 6 && (!hasConditionalLogic || !hasParallelExecution)) {
        newTemplate.complexity_level = 'Medium';
      } else {
        newTemplate.complexity_level = 'High';
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('workflow_templates')
      .insert([newTemplate])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({
        error: 'Failed to create template',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      template: data,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('POST /api/workflows/templates error:', error);
    return NextResponse.json({
      error: 'Failed to create template',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}