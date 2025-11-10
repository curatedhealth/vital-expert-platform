/**
 * API Route: GET /api/personas
 * Fetches personas with filtering by industry, tenant, function, department, and role
 */

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get('industry_id');
    const tenantId = searchParams.get('tenant_id');
    const functionId = searchParams.get('function_id');
    const departmentId = searchParams.get('department_id');
    const roleId = searchParams.get('role_id');
    const search = searchParams.get('search');
    const source = searchParams.get('source') || 'all'; // 'all', 'dh_personas', 'org_personas'

    const supabase = getServiceSupabaseClient();

    console.log('Fetching personas with filters:', {
      industryId,
      tenantId,
      functionId,
      departmentId,
      roleId,
      search,
      source,
    });

    let personas: any[] = [];

    // Fetch from dh_personas (Digital Health JTBD Persona Library)
    if (source === 'all' || source === 'dh_personas') {
      let dhQuery = supabase
        .from('dh_personas')
        .select(`
          *,
          industry:industries(id, industry_name, industry_code, unique_id),
          primary_role:org_roles(
            id,
            org_role,
            unique_id,
            department:org_departments(
              id,
              org_department,
              unique_id,
              function:org_functions(id, org_function, unique_id)
            )
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (industryId) {
        dhQuery = dhQuery.eq('industry_id', industryId);
      }
      if (roleId) {
        dhQuery = dhQuery.eq('primary_role_id', roleId);
      }
      if (search) {
        dhQuery = dhQuery.or(
          `name.ilike.%${search}%,title.ilike.%${search}%,persona_code.ilike.%${search}%`
        );
      }

      const { data: dhPersonas, error: dhError } = await dhQuery.order('priority_score', {
        ascending: false,
        nullsFirst: false,
      });

      if (dhError) {
        console.error('Error fetching dh_personas:', dhError);
      } else {
        // Fetch JTBD counts for each persona
        const dhPersonaIds = (dhPersonas || []).map(p => p.id);
        let jtbdCounts: Record<string, number> = {};

        if (dhPersonaIds.length > 0) {
          const { data: jtbdMappings } = await supabase
            .from('jtbd_org_persona_mapping')
            .select('persona_id, persona_dh_id')
            .or(dhPersonaIds.map(id => `persona_dh_id.eq.${id}`).join(','));

          jtbdMappings?.forEach((mapping: any) => {
            const personaId = mapping.persona_dh_id || mapping.persona_id;
            jtbdCounts[personaId] = (jtbdCounts[personaId] || 0) + 1;
          });
        }

        // Add source field and JTBD counts
        const dhPersonasWithSource = (dhPersonas || []).map((p) => ({
          ...p,
          source: 'dh_personas',
          source_label: 'Digital Health JTBD Library',
          jtbd_count: jtbdCounts[p.id] || 0,
        }));
        personas = [...personas, ...dhPersonasWithSource];
        console.log(`✅ Fetched ${dhPersonas?.length || 0} personas from dh_personas`);
      }
    }

    // Fetch from org_personas (Organizational Personas)
    if (source === 'all' || source === 'org_personas') {
      let orgQuery = supabase
        .from('org_personas')
        .select(`
          *,
          industry:industries(id, industry_name, industry_code),
          primary_role:org_roles(
            id,
            org_role,
            department:org_departments(
              id,
              org_department,
              function:org_functions(id, org_function)
            )
          )
        `);

      // Apply filters
      if (tenantId) {
        orgQuery = orgQuery.eq('tenant_id', tenantId);
      }
      if (industryId) {
        orgQuery = orgQuery.eq('industry_id', industryId);
      }
      if (roleId) {
        orgQuery = orgQuery.eq('primary_role_id', roleId);
      }
      if (search) {
        orgQuery = orgQuery.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
      }

      const { data: orgPersonas, error: orgError } = await orgQuery.order('name', {
        ascending: true,
      });

      if (orgError) {
        console.error('Error fetching org_personas:', orgError);
      } else {
        // Fetch JTBD counts for each persona
        const orgPersonaIds = (orgPersonas || []).map(p => p.id);
        let jtbdCounts: Record<string, number> = {};

        if (orgPersonaIds.length > 0) {
          const { data: jtbdMappings } = await supabase
            .from('jtbd_org_persona_mapping')
            .select('persona_id, persona_dh_id')
            .or(orgPersonaIds.map(id => `persona_id.eq.${id}`).join(','));

          jtbdMappings?.forEach((mapping: any) => {
            const personaId = mapping.persona_id || mapping.persona_dh_id;
            jtbdCounts[personaId] = (jtbdCounts[personaId] || 0) + 1;
          });
        }

        // Add source field and JTBD counts
        const orgPersonasWithSource = (orgPersonas || []).map((p) => ({
          ...p,
          source: 'org_personas',
          source_label: 'Organizational Personas',
          jtbd_count: jtbdCounts[p.id] || 0,
        }));
        personas = [...personas, ...orgPersonasWithSource];
        console.log(`✅ Fetched ${orgPersonas?.length || 0} personas from org_personas`);
      }
    }

    // Fetch additional metadata for statistics
    const [industriesRes, functionsRes, departmentsRes, rolesRes] = await Promise.all([
      supabase.from('industries').select('id, industry_name, industry_code').order('industry_name'),
      supabase.from('org_functions').select('id, org_function').order('org_function'),
      supabase.from('org_departments').select('id, org_department, function_id').order('org_department'),
      supabase.from('org_roles').select('id, org_role, department_id').order('org_role'),
    ]);

    // Calculate statistics
    const stats = {
      total_personas: personas.length,
      by_source: personas.reduce((acc: Record<string, number>, p: any) => {
        acc[p.source] = (acc[p.source] || 0) + 1;
        return acc;
      }, {}),
      by_industry: personas.reduce((acc: Record<string, number>, p: any) => {
        const industry = p.industry?.industry_name || 'Unknown';
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {}),
      by_function: personas.reduce((acc: Record<string, number>, p: any) => {
        const func =
          p.primary_role?.department?.function?.org_function || p.function || 'Unknown';
        acc[func] = (acc[func] || 0) + 1;
        return acc;
      }, {}),
      by_tier: personas.reduce((acc: Record<string, number>, p: any) => {
        const tier = p.tier ? `Tier ${p.tier}` : 'Unassigned';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {}),
    };

    console.log('✅ Personas fetched successfully:', {
      total: personas.length,
      stats,
    });

    return NextResponse.json({
      success: true,
      data: {
        personas,
        stats,
        filters: {
          industries: industriesRes.data || [],
          functions: functionsRes.data || [],
          departments: departmentsRes.data || [],
          roles: rolesRes.data || [],
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch personas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
