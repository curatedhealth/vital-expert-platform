/**
 * API Route: Fetch Detailed Prompt
 * Retrieves the full prompt template from the prompts table
 * This is called when a user clicks on a prompt starter
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@vital/sdk/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { promptId } = await request.json();

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    // Fetch the full prompt details from the prompts table
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select(`
        id,
        name,
        display_name,
        description,
        user_prompt_template,
        system_prompt_template,
        domain,
        complexity_level,
        category,
        tags,
        metadata,
        variables,
        examples,
        status,
        version
      `)
      .eq('id', promptId)
      .single();

    if (promptError) {
      console.error('Error fetching prompt detail:', promptError);
      return NextResponse.json(
        { error: 'Failed to fetch prompt details' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Return the full prompt with all details
    return NextResponse.json({
      prompt: {
        id: prompt.id,
        name: prompt.name,
        display_name: prompt.display_name,
        description: prompt.description,
        user_prompt: prompt.user_prompt_template,
        system_prompt: prompt.system_prompt_template,
        domain: prompt.domain,
        complexity_level: prompt.complexity_level,
        category: prompt.category,
        tags: prompt.tags || [],
        metadata: prompt.metadata || {},
        variables: prompt.variables || [],
        examples: prompt.examples || [],
        version: prompt.version,
        status: prompt.status
      }
    });

  } catch (error) {
    console.error('Error in prompt-detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET request with query parameters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    // Fetch the full prompt details from the prompts table
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select(`
        id,
        name,
        display_name,
        description,
        user_prompt_template,
        system_prompt_template,
        domain,
        complexity_level,
        category,
        tags,
        metadata,
        variables,
        examples,
        status,
        version
      `)
      .eq('id', promptId)
      .single();

    if (promptError) {
      console.error('Error fetching prompt detail:', promptError);
      return NextResponse.json(
        { error: 'Failed to fetch prompt details' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Return the full prompt with all details
    return NextResponse.json({
      prompt: {
        id: prompt.id,
        name: prompt.name,
        display_name: prompt.display_name,
        description: prompt.description,
        user_prompt: prompt.user_prompt_template,
        system_prompt: prompt.system_prompt_template,
        domain: prompt.domain,
        complexity_level: prompt.complexity_level,
        category: prompt.category,
        tags: prompt.tags || [],
        metadata: prompt.metadata || {},
        variables: prompt.variables || [],
        examples: prompt.examples || [],
        version: prompt.version,
        status: prompt.status
      }
    });

  } catch (error) {
    console.error('Error in prompt-detail API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

