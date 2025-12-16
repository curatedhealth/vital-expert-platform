/**
 * Agents CRUD API Route
 *
 * GET /api/agents-crud - List agents with optional status filter
 * POST /api/agents-crud - Create new agent
 *
 * Query params (GET):
 *   - showAll=true to disable status filter
 *   - status=active|testing|development|inactive (default active/testing)
 *   - limit (default 10000, capped at 10000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase credentials missing' },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10000', 10), 10000);

    let query = supabase.from('agents').select('*');

    if (!showAll) {
      const statuses = statusParam ? [statusParam] : ['active', 'testing'];
      query = query.in('status', statuses);
    }

    query = query.order('name', { ascending: true }).limit(limit);

    const { data: agents, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agents: agents || [],
      count: agents?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

// Validation schema for creating agents
const createAgentSchema = z.object({
  agentData: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    slug: z.string().optional(),
    display_name: z.string().optional(),
    description: z.string().optional(),
    system_prompt: z.string().optional(),
    base_model: z.string().optional().default('gpt-4'),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    max_tokens: z.number().optional().default(4000),
    status: z.enum(['development', 'testing', 'active', 'deprecated']).optional().default('development'),
    is_custom: z.boolean().optional().default(false),
    metadata: z.record(z.unknown()).optional(),
  }).passthrough(),
  categoryIds: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/agents-crud - Create a new agent
 */
export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase credentials missing' },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    // Validate input
    const validation = createAgentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { agentData, categoryIds } = validation.data;

    // Generate slug if not provided
    const slug = agentData.slug || agentData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Prepare agent data for insertion
    const insertData = {
      name: agentData.name,
      slug,
      description: agentData.description || null,
      system_prompt: agentData.system_prompt || null,
      base_model: agentData.base_model || 'gpt-4',
      temperature: agentData.temperature ?? 0.7,
      max_tokens: agentData.max_tokens ?? 4000,
      status: agentData.status || 'development',
      metadata: {
        ...(agentData.metadata || {}),
        display_name: agentData.display_name || agentData.name,
        is_custom: agentData.is_custom ?? true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the agent
    const { data: agent, error: insertError } = await supabase
      .from('agents')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating agent:', insertError);

      // Handle unique constraint violations
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'An agent with this name or slug already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // If category IDs provided, create agent_categories relationships
    if (categoryIds.length > 0 && agent) {
      const categoryInserts = categoryIds.map((categoryId, index) => ({
        agent_id: agent.id,
        category_id: categoryId,
        is_primary: index === 0,
      }));

      const { error: categoryError } = await supabase
        .from('agent_categories')
        .insert(categoryInserts);

      if (categoryError) {
        console.warn('Warning: Failed to add agent categories:', categoryError.message);
        // Don't fail the request, just log the warning
      }
    }

    return NextResponse.json({
      success: true,
      agent: {
        ...agent,
        display_name: agent.metadata?.display_name || agent.name,
        categories: [],
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/agents-crud:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}

