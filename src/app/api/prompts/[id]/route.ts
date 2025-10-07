import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      // console.error('Error fetching prompt:', error);
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Enrich with derived fields

    if (acronym) {
      if (['DRAFT', 'RADAR', 'REPLY', 'GUIDE'].includes(acronym)) suite = 'RULES™';
      else if (['DESIGN', 'QUALIFY', 'MONITOR', 'ENROLL'].includes(acronym)) suite = 'TRIALS™';
      else if (['DETECT', 'ASSESS', 'REPORT', 'SIGNAL'].includes(acronym)) suite = 'GUARD™';
      else if (['WORTH', 'PITCH', 'JUSTIFY', 'BUDGET'].includes(acronym)) suite = 'VALUE™';
      else if (['CONNECT', 'RESPOND', 'EDUCATE', 'ALIGN'].includes(acronym)) suite = 'BRIDGE™';
      else if (['STUDY', 'COMPARE', 'ANALYZE', 'PUBLISH'].includes(acronym)) suite = 'PROOF™';
      else if (['WRITE', 'PLAN', 'REVIEW', 'STYLE'].includes(acronym)) suite = 'CRAFT™';
      else if (['WATCH', 'TRACK', 'ASSESS', 'BRIEF'].includes(acronym)) suite = 'SCOUT™';
    }

    const enrichedPrompt = {
      ...prompt,
      acronym,
      suite,
      is_user_created: prompt.created_by !== null
    };

    return NextResponse.json(enrichedPrompt);
  } catch (error) {
    // console.error('Error in GET /api/prompts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);



    const {
      name,
      display_name,
      description,
      domain,
      system_prompt,
      user_prompt_template,
      updated_by
    } = body;

    // Validate required fields
    if (!name || !display_name || !description || !domain || !system_prompt || !user_prompt_template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update({
        name,
        display_name,
        description,
        domain,
        system_prompt,
        user_prompt_template,
        updated_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      // console.error('Error updating prompt:', error);
      return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    // console.error('Error in PUT /api/prompts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', params.id);

    if (error) {
      // console.error('Error deleting prompt:', error);
      return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error in DELETE /api/prompts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}