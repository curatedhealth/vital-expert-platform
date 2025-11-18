import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@vital/sdk/client';

/**
 * Healthcare Roles Management API
 * Manages healthcare roles and clinical titles for medical context
 */

// GET /api/roles - Fetch healthcare roles
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock roles');
      return NextResponse.json({
        roles: [
          {
            id: 'mock-role-1',
            name: 'Senior Regulatory Specialist',
            department: 'Compliance',
            seniority_level: 'Senior',
            requires_medical_license: false,
            description: 'Expert in FDA regulations and compliance'
          },
          {
            id: 'mock-role-2',
            name: 'Clinical Research Director',
            department: 'Research',
            seniority_level: 'Director',
            requires_medical_license: true,
            description: 'Oversees clinical trial design and execution'
          }
        ],
        count: 2,
        filters: {
          availableDepartments: ['Compliance', 'Research'],
          availableSeniorityLevels: ['Senior', 'Director'],
          applied: { department: null, seniorityLevel: null, requiresMedicalLicense: null }
        },
        timestamp: new Date().toISOString()
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const seniorityLevel = searchParams.get('seniorityLevel');
    const requiresMedicalLicense = searchParams.get('requiresMedicalLicense');
    // Build query
    let query = supabase
      .from('roles')
      .select('*');

    // Add filters
    if (department) {
      query = query.eq('department', department);
    }

    if (seniorityLevel) {
      query = query.eq('seniority_level', seniorityLevel);
    }

    if (requiresMedicalLicense !== null) {
      query = query.eq('requires_medical_license', requiresMedicalLicense === 'true');
    }

    // Order by seniority level and name
    query = query.order('seniority_level', { ascending: true })
                  .order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error fetching roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles', details: error.message },
        { status: 500 }
      );
    }
    // Get unique departments and seniority levels for filtering
    const departments = [...new Set(data?.map((role: any) => role.department).filter(Boolean))];
    const seniorityLevels = [...new Set(data?.map((role: any) => role.seniority_level).filter(Boolean))];

    return NextResponse.json({
      roles: data || [],
      count: data?.length || 0,
      filters: {
        availableDepartments: departments,
        availableSeniorityLevels: seniorityLevels,
        applied: { department, seniorityLevel, requiresMedicalLicense }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in roles GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create new healthcare role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['name', 'clinical_title', 'seniority_level', 'department'];
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
      .from('roles')
      .select('id')
      .eq('name', body.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for duplicate role:', checkError);
      return NextResponse.json(
        { error: 'Failed to validate role name' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    // Prepare role data
    const roleData = {
      name: body.name,
      clinical_title: body.clinical_title,
      seniority_level: body.seniority_level,
      department: body.department,
      requires_medical_license: body.requires_medical_license || false,
      default_capabilities: body.default_capabilities || [],
      compliance_requirements: body.compliance_requirements || []
    };

    const { data, error } = await supabase
      .from('roles')
      .insert([roleData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating role:', error);
      return NextResponse.json(
        { error: 'Failed to create role', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      role: data,
      message: 'Role created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API error in roles POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/roles - Update existing role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }
      console.error('❌ Database error updating role:', error);
      return NextResponse.json(
        { error: 'Failed to update role', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      role: data,
      message: 'Role updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in roles PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles - Delete role
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }
    // Check if role is in use by agents
    const { data: agentUsage, error: usageError } = await supabase
      .from('agents')
      .select('id')
      .eq('role', id);

    if (usageError) {
      console.error('❌ Error checking role usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to check role usage' },
        { status: 500 }
      );
    }

    if (agentUsage && agentUsage.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete role',
          reason: 'Role is currently in use by agents',
          usedByAgents: agentUsage.length
        },
        { status: 409 }
      );
    }

    // Delete role
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Database error deleting role:', error);
      return NextResponse.json(
        { error: 'Failed to delete role', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: 'Role deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in roles DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}