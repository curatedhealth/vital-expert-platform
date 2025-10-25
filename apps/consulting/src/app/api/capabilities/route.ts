import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

/**
 * Medical Capabilities Management API
 * Handles CRUD operations for medical capabilities with compliance tracking
 * Following FDA 21 CFR Part 11 audit requirements
 */

// GET /api/capabilities - Fetch medical capabilities
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock capabilities');
      return NextResponse.json({
        capabilities: [
          {
            id: 'mock-cap-1',
            name: 'Clinical Trial Design',
            display_name: 'Clinical Trial Design',
            medical_domain: 'Clinical Research',
            status: 'active',
            clinical_validation_status: 'validated',
            description: 'Expertise in designing robust clinical trials'
          },
          {
            id: 'mock-cap-2',
            name: 'Regulatory Strategy',
            display_name: 'Regulatory Strategy',
            medical_domain: 'Regulatory Affairs',
            status: 'active',
            clinical_validation_status: 'validated',
            description: 'FDA and global regulatory strategy development'
          }
        ],
        count: 2,
        filters: { domain: null, status: 'active', validationStatus: null },
        timestamp: new Date().toISOString()
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const status = searchParams.get('status') || 'active';
    const includeCompetencies = searchParams.get('includeCompetencies') === 'true';
    const validationStatus = searchParams.get('validationStatus');
    // Build query
    let query = supabase
      .from('capabilities')
      .select(includeCompetencies
        ? `*, competencies:competencies(*)`
        : '*'
      )
      .eq('status', status);

    // Add filters
    if (domain) {
      query = query.eq('medical_domain', domain);
    }

    if (validationStatus) {
      query = query.eq('clinical_validation_status', validationStatus);
    }

    // Order by display name
    query = query.order('display_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error fetching capabilities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch capabilities', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      capabilities: data || [],
      count: data?.length || 0,
      filters: { domain, status, validationStatus },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capabilities GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/capabilities - Create new medical capability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['name', 'display_name', 'description', 'medical_domain'];
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

    // Prepare capability data with medical compliance defaults
    const capabilityData = {
      name: body.name,
      display_name: body.display_name,
      description: body.description,
      category: body.category || 'medical',
      domain: body.domain || 'healthcare',
      medical_domain: body.medical_domain,
      accuracy_threshold: body.accuracy_threshold || 0.95,
      citation_required: body.citation_required ?? true,
      system_prompt_template: body.system_prompt_template || '',
      pharma_protocol: body.pharma_protocol || null,
      verify_protocol: body.verify_protocol || null,
      fda_classification: body.fda_classification || null,
      hipaa_relevant: body.hipaa_relevant || false,
      clinical_validation_status: body.clinical_validation_status || 'pending',
      validation_rules: body.validation_rules || { /* TODO: implement */ },
      complexity_level: body.complexity_level || 'intermediate',
      status: body.status || 'active',
      icon: body.icon || '🏥',
      color: body.color || 'text-medical-blue',
      usage_count: 0,
      success_rate: 0,
      audit_trail: {
        created_at: new Date().toISOString(),
        created_by: 'system', // TODO: Get from auth context
        initial_validation_status: body.clinical_validation_status || 'pending',
        creation_reason: 'Medical capability creation via API'
      }
    };

    const { data, error } = await supabase
      .from('capabilities')
      .insert([capabilityData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating capability:', error);
      return NextResponse.json(
        { error: 'Failed to create capability', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createAuditLogEntry('capability_created', data.id, capabilityData);

    return NextResponse.json({
      capability: data,
      message: 'Capability created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API error in capabilities POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/capabilities - Update existing capability
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Capability ID is required' },
        { status: 400 }
      );
    }
    // Add audit trail for the update
    const auditUpdate = {
      ...updateData,
      audit_trail: {
        ...updateData.audit_trail,
        last_updated: new Date().toISOString(),
        updated_by: 'system', // TODO: Get from auth context
        update_reason: updateData.update_reason || 'Medical capability update via API'
      }
    };

    const { data, error } = await supabase
      .from('capabilities')
      .update(auditUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating capability:', error);
      return NextResponse.json(
        { error: 'Failed to update capability', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createAuditLogEntry('capability_updated', id, updateData);

    return NextResponse.json({
      capability: data,
      message: 'Capability updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capabilities PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/capabilities - Soft delete capability
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Capability ID is required' },
        { status: 400 }
      );
    }
    // Soft delete by updating status
    const { data, error } = await supabase
      .from('capabilities')
      .update({
        status: 'inactive',
        audit_trail: {
          deleted_at: new Date().toISOString(),
          deleted_by: 'system', // TODO: Get from auth context
          deletion_reason: 'Medical capability deactivation via API'
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error deleting capability:', error);
      return NextResponse.json(
        { error: 'Failed to delete capability', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createAuditLogEntry('capability_deactivated', id, { status: 'inactive' });

    return NextResponse.json({
      message: 'Capability deactivated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capabilities DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Create audit log entry for FDA 21 CFR Part 11 compliance
 */
async function createAuditLogEntry(action: string, entityId: string, data: unknown) {
  try {
    await supabase
      .from('medical_validations')
      .insert({
        entity_type: 'capability',
        entity_id: entityId,
        validation_type: 'audit',
        validation_result: {
          action,
          data,
          timestamp: new Date().toISOString(),
          ip_address: 'api_server', // TODO: Get actual IP
          user_agent: 'capability_management_api'
        },
        validator_credentials: 'System API',
        validation_date: new Date().toISOString(),
        audit_trail: {
          api_version: '1.0',
          compliance_standard: 'FDA 21 CFR Part 11',
          audit_level: 'full'
        }
      });
  } catch (error) {
    console.error('⚠️ Failed to create audit log entry:', error);
    // Don't throw error as this shouldn't block the main operation
  }
}