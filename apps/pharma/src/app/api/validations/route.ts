import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@vital/sdk/client';

/**
 * Medical Validation Management API
 * Handles clinical validation workflows and compliance tracking
 * Following FDA 21 CFR Part 11 audit requirements
 */

// GET /api/validations - Fetch medical validations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const validationType = searchParams.get('validationType');
    const validatorId = searchParams.get('validatorId');
    const expired = searchParams.get('expired');
    // Build query
    let query = supabase
      .from('medical_validations')
      .select('*');

    // Add filters
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    if (validationType) {
      query = query.eq('validation_type', validationType);
    }

    if (validatorId) {
      query = query.eq('validator_id', validatorId);
    }

    // Filter by expiration status
    if (expired === 'true') {
      query = query.lt('expiration_date', new Date().toISOString());
    } else if (expired === 'false') {
      query = query.or(`expiration_date.is.null,expiration_date.gt.${new Date().toISOString()}`);
    }

    // Order by validation date (newest first)
    query = query.order('validation_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error fetching validations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch validations', details: error.message },
        { status: 500 }
      );
    }
    // Calculate validation statistics
    const stats = calculateValidationStats(data || []);

    return NextResponse.json({
      validations: data || [],
      count: data?.length || 0,
      statistics: stats,
      filters: { entityType, entityId, validationType, validatorId, expired },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in validations GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/validations - Create new medical validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required fields
    const requiredFields = ['entity_type', 'entity_id', 'validation_type', 'validator_credentials'];
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

    // Validate entity exists based on type
    const entityExists = await validateEntityExists(body.entity_type, body.entity_id);
    if (!entityExists) {
      return NextResponse.json(
        { error: 'Invalid entity - entity not found', entityType: body.entity_type, entityId: body.entity_id },
        { status: 400 }
      );
    }

    // Prepare validation data with medical compliance
    const validationData = {
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      validation_type: body.validation_type,
      validation_result: body.validation_result || { /* TODO: implement */ },
      accuracy_score: body.accuracy_score || null,
      validator_id: body.validator_id || null,
      validator_credentials: body.validator_credentials,
      validation_date: new Date().toISOString(),
      expiration_date: body.expiration_date || null,
      notes: body.notes || null,
      audit_trail: {
        created_at: new Date().toISOString(),
        created_by: 'system', // TODO: Get from auth context
        validation_source: 'validation_api',
        compliance_standard: 'FDA 21 CFR Part 11',
        ip_address: 'api_server', // TODO: Get actual IP
        session_info: {
          api_version: '1.0',
          endpoint: '/api/validations',
          method: 'POST'
        }
      }
    };

    const { data, error } = await supabase
      .from('medical_validations')
      .insert([validationData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error creating validation:', error);
      return NextResponse.json(
        { error: 'Failed to create validation', details: error.message },
        { status: 500 }
      );
    }
    // Update entity validation status if applicable
    await updateEntityValidationStatus(body.entity_type, body.entity_id, body.validation_type, data.id);

    return NextResponse.json({
      validation: data,
      message: 'Validation created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ API error in validations POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/validations - Update existing validation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Validation ID is required' },
        { status: 400 }
      );
    }
    // Get existing validation for audit trail
    const { data: existingValidation, error: fetchError } = await supabase
      .from('medical_validations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingValidation) {
      return NextResponse.json(
        { error: 'Validation not found' },
        { status: 404 }
      );
    }

    // Add audit trail for the update
    const auditUpdate = {
      ...updateData,
      audit_trail: {
        ...existingValidation.audit_trail,
        last_updated: new Date().toISOString(),
        updated_by: 'system', // TODO: Get from auth context
        update_reason: updateData.update_reason || 'Medical validation update via API',
        previous_values: {
          validation_result: existingValidation.validation_result,
          accuracy_score: existingValidation.accuracy_score,
          expiration_date: existingValidation.expiration_date
        }
      }
    };

    const { data, error } = await supabase
      .from('medical_validations')
      .update(auditUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error updating validation:', error);
      return NextResponse.json(
        { error: 'Failed to update validation', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      validation: data,
      message: 'Validation updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in validations PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Validate that an entity exists based on type
 */
async function validateEntityExists(entityType: string, entityId: string): Promise<boolean> {
  try {
    let tableName: string;
    switch (entityType) {
      case 'agent':
        tableName = 'agents';
        break;
      case 'capability':
        tableName = 'capabilities';
        break;
      case 'competency':
        tableName = 'competencies';
        break;
      default:
        return false;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', entityId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('⚠️ Error validating entity existence:', error);
    return false;
  }
}

/**
 * Update entity validation status after validation is created
 */
async function updateEntityValidationStatus(
  entityType: string,
  entityId: string,
  validationType: string,
  validationId: string
) {
  try {
    let tableName: string;
    let statusField: string;

    switch (entityType) {
      case 'agent':
        tableName = 'agents';
        statusField = 'clinical_validation_status';
        break;
      case 'capability':
        tableName = 'capabilities';
        statusField = 'clinical_validation_status';
        break;
      default:
        return; // Competencies don't have validation status field
    }

    // Determine new status based on validation type
    let newStatus = 'pending';
    if (validationType === 'accuracy' || validationType === 'clinical_review') {
      newStatus = 'validated';
    }

    await supabase
      .from(tableName)
      .update({
        [statusField]: newStatus,
        last_clinical_review: new Date().toISOString(),
        audit_trail: {
          validation_updated: new Date().toISOString(),
          validation_id: validationId,
          validation_type: validationType
        }
      })
      .eq('id', entityId);

  } catch (error) {
    console.error('⚠️ Failed to update entity validation status:', error);
    // Don't throw error as this shouldn't block the main operation
  }
}

/**
 * Calculate validation statistics
 */
function calculateValidationStats(validations: unknown[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const stats = {
    total: validations.length,
    byType: { /* TODO: implement */ } as Record<string, number>,
    byEntityType: { /* TODO: implement */ } as Record<string, number>,
    recent: validations.filter((v: any) => new Date(v.validation_date) >= thirtyDaysAgo).length,
    expired: validations.filter((v: any) => v.expiration_date && new Date(v.expiration_date) < now).length,
    averageAccuracy: 0,
    validatorsCount: new Set(validations.map((v: any) => v.validator_id).filter(Boolean)).size
  };

  // Calculate by type
  validations.forEach((validation: any) => {
    stats.byType[validation.validation_type] = (stats.byType[validation.validation_type] || 0) + 1;
    stats.byEntityType[validation.entity_type] = (stats.byEntityType[validation.entity_type] || 0) + 1;
  });

  // Calculate average accuracy
  const accuracyScores = validations
    .map((v: any) => v.accuracy_score)
    .filter(score => score !== null && score !== undefined);

  if (accuracyScores.length > 0) {
    stats.averageAccuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
    stats.averageAccuracy = Math.round(stats.averageAccuracy * 100) / 100;
  }

  return stats;
}