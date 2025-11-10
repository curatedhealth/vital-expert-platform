/**
 * API Route: GET /api/personas/verify
 * Verifies data completeness and mapping correctness for personas and JTBDs
 */

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('🔍 Starting persona data verification...');

    // ========================================
    // 1. Check dh_personas data completeness
    // ========================================
    const { data: dhPersonas, error: dhError } = await supabase
      .from('dh_personas')
      .select('id, name, persona_code, pain_points, responsibilities, goals, priority_score')
      .eq('is_active', true);

    if (dhError) {
      console.error('Error fetching dh_personas:', dhError);
    }

    const dhPersonasStats = {
      total: dhPersonas?.length || 0,
      with_pain_points: 0,
      without_pain_points: 0,
      with_responsibilities: 0,
      without_responsibilities: 0,
      with_goals: 0,
      without_goals: 0,
      with_all_attributes: 0,
      missing_attributes: [] as any[],
    };

    dhPersonas?.forEach((persona) => {
      const hasPainPoints = Array.isArray(persona.pain_points) && persona.pain_points.length > 0;
      const hasResponsibilities = Array.isArray(persona.responsibilities) && persona.responsibilities.length > 0;
      const hasGoals = Array.isArray(persona.goals) && persona.goals.length > 0;

      if (hasPainPoints) dhPersonasStats.with_pain_points++;
      else dhPersonasStats.without_pain_points++;

      if (hasResponsibilities) dhPersonasStats.with_responsibilities++;
      else dhPersonasStats.without_responsibilities++;

      if (hasGoals) dhPersonasStats.with_goals++;
      else dhPersonasStats.without_goals++;

      if (hasPainPoints && hasResponsibilities && hasGoals) {
        dhPersonasStats.with_all_attributes++;
      } else {
        dhPersonasStats.missing_attributes.push({
          id: persona.id,
          name: persona.name,
          code: persona.persona_code,
          missing: {
            pain_points: !hasPainPoints,
            responsibilities: !hasResponsibilities,
            goals: !hasGoals,
          },
        });
      }
    });

    // ========================================
    // 2. Check org_personas data completeness
    // ========================================
    const { data: orgPersonas, error: orgError } = await supabase
      .from('org_personas')
      .select('id, name, code, pain_points, responsibilities, goals');

    if (orgError) {
      console.error('Error fetching org_personas:', orgError);
    }

    const orgPersonasStats = {
      total: orgPersonas?.length || 0,
      with_pain_points: 0,
      without_pain_points: 0,
      with_responsibilities: 0,
      without_responsibilities: 0,
      with_goals: 0,
      without_goals: 0,
      with_all_attributes: 0,
      missing_attributes: [] as any[],
    };

    orgPersonas?.forEach((persona) => {
      const hasPainPoints = Array.isArray(persona.pain_points) && persona.pain_points.length > 0;
      const hasResponsibilities = Array.isArray(persona.responsibilities) && persona.responsibilities.length > 0;
      const hasGoals = Array.isArray(persona.goals) && persona.goals.length > 0;

      if (hasPainPoints) orgPersonasStats.with_pain_points++;
      else orgPersonasStats.without_pain_points++;

      if (hasResponsibilities) orgPersonasStats.with_responsibilities++;
      else orgPersonasStats.without_responsibilities++;

      if (hasGoals) orgPersonasStats.with_goals++;
      else orgPersonasStats.without_goals++;

      if (hasPainPoints && hasResponsibilities && hasGoals) {
        orgPersonasStats.with_all_attributes++;
      } else {
        orgPersonasStats.missing_attributes.push({
          id: persona.id,
          name: persona.name,
          code: persona.code,
          missing: {
            pain_points: !hasPainPoints,
            responsibilities: !hasResponsibilities,
            goals: !hasGoals,
          },
        });
      }
    });

    // ========================================
    // 3. Check JTBD mapping completeness
    // ========================================
    const { data: allMappings, error: mappingError } = await supabase
      .from('jtbd_org_persona_mapping')
      .select('id, persona_id, persona_dh_id, jtbd_id, relevance_score');

    if (mappingError) {
      console.error('Error fetching JTBD mappings:', mappingError);
    }

    const mappingStats = {
      total_mappings: allMappings?.length || 0,
      with_org_persona: 0,
      with_dh_persona: 0,
      with_both: 0,
      with_neither: 0,
      invalid_mappings: [] as any[],
    };

    allMappings?.forEach((mapping) => {
      const hasOrgPersona = mapping.persona_id !== null;
      const hasDhPersona = mapping.persona_dh_id !== null;

      if (hasOrgPersona && hasDhPersona) {
        mappingStats.with_both++;
      } else if (hasOrgPersona) {
        mappingStats.with_org_persona++;
      } else if (hasDhPersona) {
        mappingStats.with_dh_persona++;
      } else {
        mappingStats.with_neither++;
        mappingStats.invalid_mappings.push({
          id: mapping.id,
          jtbd_id: mapping.jtbd_id,
        });
      }
    });

    // ========================================
    // 4. Check JTBD counts per persona
    // ========================================
    const dhPersonaIds = dhPersonas?.map((p) => p.id) || [];
    const orgPersonaIds = orgPersonas?.map((p) => p.id) || [];

    const dhPersonasWithoutJTBD: any[] = [];
    const orgPersonasWithoutJTBD: any[] = [];

    // Check dh_personas
    for (const persona of dhPersonas || []) {
      const { data: mappings } = await supabase
        .from('jtbd_org_persona_mapping')
        .select('id')
        .eq('persona_dh_id', persona.id);

      if (!mappings || mappings.length === 0) {
        dhPersonasWithoutJTBD.push({
          id: persona.id,
          name: persona.name,
          code: persona.persona_code,
        });
      }
    }

    // Check org_personas
    for (const persona of orgPersonas || []) {
      const { data: mappings } = await supabase
        .from('jtbd_org_persona_mapping')
        .select('id')
        .eq('persona_id', persona.id);

      if (!mappings || mappings.length === 0) {
        orgPersonasWithoutJTBD.push({
          id: persona.id,
          name: persona.name,
          code: persona.code,
        });
      }
    }

    // ========================================
    // 5. Check JTBD library completeness
    // ========================================
    const { data: jtbds, error: jtbdsError } = await supabase
      .from('jtbd_library')
      .select('id, jtbd_code, title, opportunity_score, importance, satisfaction');

    if (jtbdsError) {
      console.error('Error fetching JTBDs:', jtbdsError);
    }

    const jtbdStats = {
      total: jtbds?.length || 0,
      with_opportunity_score: 0,
      without_opportunity_score: 0,
      high_opportunity: 0,
      with_mappings: 0,
      without_mappings: 0,
    };

    for (const jtbd of jtbds || []) {
      if (jtbd.opportunity_score && jtbd.opportunity_score > 0) {
        jtbdStats.with_opportunity_score++;
        if (jtbd.opportunity_score >= 15) {
          jtbdStats.high_opportunity++;
        }
      } else {
        jtbdStats.without_opportunity_score++;
      }

      const { data: mappings } = await supabase
        .from('jtbd_org_persona_mapping')
        .select('id')
        .eq('jtbd_id', jtbd.id);

      if (mappings && mappings.length > 0) {
        jtbdStats.with_mappings++;
      } else {
        jtbdStats.without_mappings++;
      }
    }

    // ========================================
    // 6. Summary and Recommendations
    // ========================================
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for missing attributes
    if (dhPersonasStats.without_pain_points > 0) {
      issues.push(
        `${dhPersonasStats.without_pain_points} dh_personas missing pain_points`
      );
      recommendations.push(
        'Populate pain_points for all dh_personas to improve persona detail pages'
      );
    }

    if (dhPersonasStats.without_responsibilities > 0) {
      issues.push(
        `${dhPersonasStats.without_responsibilities} dh_personas missing responsibilities`
      );
      recommendations.push(
        'Populate responsibilities for all dh_personas for complete profiles'
      );
    }

    if (dhPersonasStats.without_goals > 0) {
      issues.push(`${dhPersonasStats.without_goals} dh_personas missing goals`);
      recommendations.push(
        'Populate goals for all dh_personas to show complete persona profiles'
      );
    }

    // Check for personas without JTBD mappings
    if (dhPersonasWithoutJTBD.length > 0) {
      issues.push(
        `${dhPersonasWithoutJTBD.length} dh_personas have no JTBD mappings`
      );
      recommendations.push(
        'Create JTBD mappings for all dh_personas to show relevant jobs-to-be-done'
      );
    }

    if (orgPersonasWithoutJTBD.length > 0) {
      issues.push(
        `${orgPersonasWithoutJTBD.length} org_personas have no JTBD mappings`
      );
      recommendations.push(
        'Create JTBD mappings for all org_personas to show relevant jobs-to-be-done'
      );
    }

    // Check for invalid mappings
    if (mappingStats.with_neither > 0) {
      issues.push(
        `${mappingStats.with_neither} JTBD mappings have neither persona_id nor persona_dh_id`
      );
      recommendations.push(
        'Clean up invalid JTBD mappings that have no persona reference'
      );
    }

    // Check for JTBDs without mappings
    if (jtbdStats.without_mappings > 0) {
      issues.push(
        `${jtbdStats.without_mappings} JTBDs have no persona mappings`
      );
      recommendations.push(
        'Map JTBDs to relevant personas to ensure they appear in persona profiles'
      );
    }

    const dataQuality = {
      overall_health:
        issues.length === 0
          ? 'Excellent'
          : issues.length <= 3
            ? 'Good'
            : issues.length <= 6
              ? 'Fair'
              : 'Needs Attention',
      issues_found: issues.length,
      completeness_score: Math.round(
        ((dhPersonasStats.with_all_attributes +
          orgPersonasStats.with_all_attributes) /
          (dhPersonasStats.total + orgPersonasStats.total)) *
          100
      ),
    };

    console.log('✅ Verification complete');

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_dh_personas: dhPersonasStats.total,
          total_org_personas: orgPersonasStats.total,
          total_jtbds: jtbdStats.total,
          total_mappings: mappingStats.total_mappings,
          data_quality: dataQuality,
        },
        dh_personas: dhPersonasStats,
        org_personas: orgPersonasStats,
        jtbd_mappings: mappingStats,
        jtbd_library: jtbdStats,
        personas_without_jtbds: {
          dh_personas: dhPersonasWithoutJTBD,
          org_personas: orgPersonasWithoutJTBD,
        },
        issues,
        recommendations,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error verifying persona data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify persona data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
