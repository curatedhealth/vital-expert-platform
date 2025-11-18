import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@vital/sdk/client';

/**
 * Medical Competencies Management API
 * Handles CRUD operations for medical competencies within capabilities
 * Following FDA 21 CFR Part 11 audit requirements
 */

// GET /api/competencies - Fetch medical competencies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const capabilityId = searchParams.get('capabilityId');
    const evidenceLevel = searchParams.get('evidenceLevel');
    const requiresMedicalReview = searchParams.get('requiresMedicalReview');
    // Build query
    let query = supabase
      .from('competencies')
      .select(`
        *,
        capabilities:capabilities(name, display_name, medical_domain)
      `);

    // Add filters
    if (capabilityId) {
      query = query.eq('capability_id', capabilityId);
    }

    if (evidenceLevel) {
      query = query.eq('evidence_level', evidenceLevel);
    }

    if (requiresMedicalReview !== null) {
      query = query.eq('requires_medical_review', requiresMedicalReview === 'true');
    }

    // Order by priority and name
    query = query.order('order_priority', { ascending: true })
                  .order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error fetching competencies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch competencies', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      competencies: data || [],
      count: data?.length || 0,
      filters: { capabilityId, evidenceLevel, requiresMedicalReview },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in competencies GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/competencies - Create new medical competency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['capability_id', 'name', 'description', 'prompt_snippet'];
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

    // Validate capability exists
    const { data: capability, error: capError } = await supabase
      .from('capabilities')
      .select('id, name')
      .eq('id', body.capability_id)
      .single();

    if (capError || !capability) {
      return NextResponse.json(
        { error: 'Invalid capability_id - capability not found' },
        { status: 400 }
      );
    }

    // Prepare competency data with medical compliance
    const competencyData = {
      capability_id: body.capability_id,
      name: body.name,
      description: body.description,
      prompt_snippet: body.prompt_snippet,
      medical_accuracy_requirement: body.medical_accuracy_requirement || 0.95,
      evidence_level: body.evidence_level || 'Expert Opinion',
      clinical_guidelines_reference: body.clinical_guidelines_reference || [],
      required_knowledge: body.required_knowledge || { /* TODO: implement */ },
      quality_metrics: body.quality_metrics || { /* TODO: implement */ },
      icd_codes: body.icd_codes || [],
      snomed_codes: body.snomed_codes || [],
      order_priority: body.order_priority || 0,
      is_required: body.is_required || false,
      requires_medical_review: body.requires_medical_review || false,
      audit_log: {
        created_at: new Date().toISOString(),
        created_by: 'system', // TODO: Get from auth context
        initial_evidence_level: body.evidence_level || 'Expert Opinion',
        creation_reason: 'Medical competency creation via API'
      }
    };

    const { data, error } = await supabase
      .from('competencies')
      .insert([competencyData])
      .select(`
        *,
        capabilities:capabilities(name, display_name, medical_domain)
      `)
      .single();

    if (error) {
      console.error('❌ Database error creating competency:', error);
      return NextResponse.json(
        { error: 'Failed to create competency', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createCompetencyAuditEntry('competency_created', data.id, competencyData);

    return NextResponse.json({
      competency: data,
      message: 'Competency created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API error in competencies POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/competencies - Update existing competency
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Competency ID is required' },
        { status: 400 }
      );
    }
    // Get existing competency for audit trail
    const { data: existingCompetency, error: fetchError } = await supabase
      .from('competencies')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingCompetency) {
      return NextResponse.json(
        { error: 'Competency not found' },
        { status: 404 }
      );
    }

    // Add audit trail for the update
    const auditUpdate = {
      ...updateData,
      audit_log: {
        ...existingCompetency.audit_log,
        last_updated: new Date().toISOString(),
        updated_by: 'system', // TODO: Get from auth context
        update_reason: updateData.update_reason || 'Medical competency update via API',
        previous_values: {
          medical_accuracy_requirement: existingCompetency.medical_accuracy_requirement,
          evidence_level: existingCompetency.evidence_level,
          requires_medical_review: existingCompetency.requires_medical_review
        }
      }
    };

    const { data, error } = await supabase
      .from('competencies')
      .update(auditUpdate)
      .eq('id', id)
      .select(`
        *,
        capabilities:capabilities(name, display_name, medical_domain)
      `)
      .single();

    if (error) {
      console.error('❌ Database error updating competency:', error);
      return NextResponse.json(
        { error: 'Failed to update competency', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createCompetencyAuditEntry('competency_updated', id, updateData);

    return NextResponse.json({
      competency: data,
      message: 'Competency updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in competencies PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/competencies - Delete competency
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Competency ID is required' },
        { status: 400 }
      );
    }
    // Check if competency is in use by agents
    const { data: agentCompetencies, error: usageError } = await supabase
      .from('agent_capabilities')
      .select('agent_id, competency_ids')
      .contains('competency_ids', [id]);

    if (usageError) {
      console.error('❌ Error checking competency usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to check competency usage' },
        { status: 500 }
      );
    }

    if (agentCompetencies && agentCompetencies.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete competency',
          reason: 'Competency is currently in use by agents',
          usedByAgents: agentCompetencies.length
        },
        { status: 409 }
      );
    }

    // Delete competency
    const { error } = await supabase
      .from('competencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Database error deleting competency:', error);
      return NextResponse.json(
        { error: 'Failed to delete competency', details: error.message },
        { status: 500 }
      );
    }
    // Create audit log entry
    await createCompetencyAuditEntry('competency_deleted', id, { deletion_reason: 'Deleted via API' });

    return NextResponse.json({
      message: 'Competency deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in competencies DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Create audit log entry for competency operations
 */
async function createCompetencyAuditEntry(action: string, entityId: string, data: unknown) {
  try {
    await supabase
      .from('medical_validations')
      .insert({
        entity_type: 'competency',
        entity_id: entityId,
        validation_type: 'audit',
        validation_result: {
          action,
          data,
          timestamp: new Date().toISOString(),
          ip_address: 'api_server', // TODO: Get actual IP
          user_agent: 'competency_management_api'
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
    console.error('⚠️ Failed to create competency audit log entry:', error);
    // Don't throw error as this shouldn't block the main operation
  }
}