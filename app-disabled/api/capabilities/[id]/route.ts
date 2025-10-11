import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

/**
 * Individual Medical Capability Management API
 * Handles detailed operations for specific medical capabilities
 */

// GET /api/capabilities/[id] - Fetch specific capability with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeCompetencies = searchParams.get('includeCompetencies') !== 'false';
    const includeTools = searchParams.get('includeTools') === 'true';
    const includeValidations = searchParams.get('includeValidations') === 'true';
    // Build comprehensive query
    let selectQuery = `
      *,
      ${includeCompetencies ? 'competencies:competencies(*),' : ''}
      ${includeTools ? 'capability_tools:capability_tools(tools(*)),' : ''}
      ${includeValidations ? 'medical_validations:medical_validations(*)' : ''}
    `;

    // Remove trailing comma
    selectQuery = selectQuery.replace(/,$/, '');

    const { data, error } = await supabase
      .from('capabilities')
      .select(selectQuery)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Capability not found' },
          { status: 404 }
        );
      }
      console.error('❌ Database error fetching capability:', error);
      return NextResponse.json(
        { error: 'Failed to fetch capability', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Capability not found' },
        { status: 404 }
      );
    }

    console.log('✅ Capability found:', data?.name || 'Unknown');

    // Calculate capability metrics
    const metrics = await calculateCapabilityMetrics(id);

    return NextResponse.json({
      capability: data,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capability GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/capabilities/[id] - Update specific capability
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();
    // Validate capability exists
    const { data: existingCapability, error: fetchError } = await supabase
      .from('capabilities')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingCapability) {
      return NextResponse.json(
        { error: 'Capability not found' },
        { status: 404 }
      );
    }

    // Add audit trail for compliance
    const auditUpdate = {
      ...updateData,
      audit_trail: {
        ...existingCapability.audit_trail,
        last_updated: new Date().toISOString(),
        updated_by: 'system', // TODO: Get from auth context
        update_reason: updateData.update_reason || 'Capability update via API',
        previous_values: {
          medical_domain: existingCapability.medical_domain,
          accuracy_threshold: existingCapability.accuracy_threshold,
          clinical_validation_status: existingCapability.clinical_validation_status
        }
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
    // Create medical validation entry if validation status changed
    if (updateData.clinical_validation_status &&
        updateData.clinical_validation_status !== existingCapability.clinical_validation_status) {
      await createValidationEntry(id, updateData.clinical_validation_status);
    }

    return NextResponse.json({
      capability: data,
      message: 'Capability updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capability PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/capabilities/[id] - Deactivate specific capability
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || 'Deactivated via API';
    // Check if capability is in use by agents
    const { data: agentCapabilities, error: usageError } = await supabase
      .from('agent_capabilities')
      .select('agent_id')
      .eq('capability_id', id);

    if (usageError) {
      console.error('❌ Error checking capability usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to check capability usage' },
        { status: 500 }
      );
    }

    if (agentCapabilities && agentCapabilities.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot deactivate capability',
          reason: 'Capability is currently in use by agents',
          usedByAgents: agentCapabilities.length
        },
        { status: 409 }
      );
    }

    // Soft delete capability
    const { data, error } = await supabase
      .from('capabilities')
      .update({
        status: 'inactive',
        audit_trail: {
          deactivated_at: new Date().toISOString(),
          deactivated_by: 'system', // TODO: Get from auth context
          deactivation_reason: reason
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error deactivating capability:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate capability', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: 'Capability deactivated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API error in capability DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate performance metrics for a capability
 */
async function calculateCapabilityMetrics(capabilityId: string) {
  try {
    // Get usage statistics
    const { data: agentUsage, error: usageError } = await supabase
      .from('agent_capabilities')
      .select('agent_id, usage_count, success_rate, last_used_at')
      .eq('capability_id', capabilityId);

    if (usageError) {
      console.error('⚠️ Error fetching capability metrics:', usageError);
      return { /* TODO: implement */ };
    }

    const totalUsage = agentUsage?.reduce((sum, usage) => sum + (usage.usage_count || 0), 0) || 0;
    const averageSuccessRate = agentUsage?.length > 0
      ? agentUsage.reduce((sum, usage) => sum + (usage.success_rate || 0), 0) / agentUsage.length
      : 0;

    const lastUsed = agentUsage?.reduce((latest, usage) => {
      const usageDate = new Date(usage.last_used_at || 0);
      const latestDate = new Date(latest || 0);
      return usageDate > latestDate ? usage.last_used_at : latest;
    }, null);

    return {
      totalUsage,
      averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
      agentsUsingCapability: agentUsage?.length || 0,
      lastUsed,
      calculatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('⚠️ Error calculating capability metrics:', error);
    return { /* TODO: implement */ };
  }
}

/**
 * Create medical validation entry for compliance tracking
 */
async function createValidationEntry(capabilityId: string, validationStatus: string) {
  try {
    await supabase
      .from('medical_validations')
      .insert({
        entity_type: 'capability',
        entity_id: capabilityId,
        validation_type: 'clinical_status_change',
        validation_result: {
          new_status: validationStatus,
          timestamp: new Date().toISOString(),
          source: 'capability_management_api'
        },
        validator_credentials: 'System API',
        validation_date: new Date().toISOString(),
        audit_trail: {
          api_version: '1.0',
          compliance_standard: 'FDA 21 CFR Part 11',
          change_type: 'status_update'
        }
      });
  } catch (error) {
    console.error('⚠️ Failed to create validation entry:', error);
  }
}