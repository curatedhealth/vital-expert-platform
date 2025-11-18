import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@vital/sdk/client';

/**
 * Healthcare Business Functions Management API
 * Manages healthcare business functions and departments for medical context
 */

// GET /api/business-functions - Fetch healthcare business functions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    // Build query
    let query = supabase
      .from('suite_functions')
      .select('*');

    // Add filters
    if (department) {
      query = query.eq('department', department);
    }

    if (category) {
      query = query.eq('healthcare_category', category);
    }

    // Order by name
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error fetching business functions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch business functions', details: error.message },
        { status: 500 }
      );
    }
    // Get unique departments and categories for filtering
    const departments = [...new Set(data?.map((bf: any) => bf.department).filter(Boolean))];
    const categories = [...new Set(data?.map((bf: any) => bf.healthcare_category).filter(Boolean))];

    return NextResponse.json({
      businessFunctions: data || [],
      count: data?.length || 0,
      filters: {
        availableDepartments: departments,
        availableCategories: categories,
        applied: { department, category }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in business functions GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/business-functions - Create new business function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['name', 'department', 'healthcare_category', 'description'];
    const missingFields = requiredFields.filter(field => {
      // eslint-disable-next-line security/detect-object-injection
      return !body[field];
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const { data: existing, error: checkError } = await supabase
      .from('suite_functions')
      .select('id')
      .eq('name', body.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for duplicate business function:', checkError);
      return NextResponse.json(
        { error: 'Failed to validate business function name' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Business function with this name already exists' },
        { status: 409 }
      );
    }

    // Prepare business function data
    const businessFunctionData = {
      name: body.name,
      department: body.department,
      healthcare_category: body.healthcare_category,
      description: body.description,
      regulatory_requirements: body.regulatory_requirements || []
    };

    const { data, error } = await supabase
      .from('suite_functions')
      .insert([businessFunctionData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating business function:', error);
      return NextResponse.json(
        { error: 'Failed to create business function', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      businessFunction: data,
      message: 'Business function created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API error in business functions POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/business-functions - Update existing business function
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Business function ID is required' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('business_functions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Business function not found' },
          { status: 404 }
        );
      }
      console.error('❌ Database error updating business function:', error);
      return NextResponse.json(
        { error: 'Failed to update business function', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      businessFunction: data,
      message: 'Business function updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in business functions PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/business-functions - Delete business function
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Business function ID is required' },
        { status: 400 }
      );
    }
    // Check if business function is in use by agents
    const { data: agentUsage, error: usageError } = await supabase
      .from('agents')
      .select('id')
      .eq('business_function', id);

    if (usageError) {
      console.error('❌ Error checking business function usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to check business function usage' },
        { status: 500 }
      );
    }

    if (agentUsage && agentUsage.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete business function',
          reason: 'Business function is currently in use by agents',
          usedByAgents: agentUsage.length
        },
        { status: 409 }
      );
    }

    // Delete business function
    const { error } = await supabase
      .from('business_functions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Database error deleting business function:', error);
      return NextResponse.json(
        { error: 'Failed to delete business function', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: 'Business function deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in business functions DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}