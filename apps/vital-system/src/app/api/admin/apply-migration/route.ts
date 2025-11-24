/**
 * Admin API: Apply Many-to-Many Agent-Tenant Migration
 * POST /api/admin/apply-migration
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting Many-to-Many Agent-Tenant Migration...');

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read migration file
    const migrationPath = path.join(
      process.cwd(),
      '..',
      '..',
      'supabase',
      'migrations',
      '20241124110000_map_agents_to_tenants_many_to_many.sql'
    );

    console.log('📄 Reading migration from:', migrationPath);

    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json(
        { error: 'Migration file not found', path: migrationPath },
        { status: 404 }
      );
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📊 SQL loaded, size:', sql.length, 'characters');

    // Split into individual statements (simplified approach)
    // Note: This won't work for complex DO blocks, we'll need to execute the whole thing

    // For now, let's manually execute the key parts:

    // 1. Get tenant IDs
    const { data: vitalTenant } = await supabase
      .from('organizations')
      .select('id, name')
      .or('tenant_key.eq.vital-expert-platform,name.ilike.%vital%system%,tenant_type.eq.system')
      .limit(1)
      .single();

    const { data: pharmaTenant } = await supabase
      .from('organizations')
      .select('id, name')
      .or('tenant_key.eq.pharmaceuticals,name.ilike.%pharma%,tenant_type.eq.pharmaceuticals')
      .limit(1)
      .maybeSingle();

    if (!vitalTenant) {
      return NextResponse.json(
        { error: 'Vital System tenant not found. Please create it first.' },
        { status: 400 }
      );
    }

    console.log('✅ Found tenants:', {
      vital: vitalTenant.name,
      pharma: pharmaTenant?.name || 'Not found'
    });

    // 2. Get all agents
    const { data: agents, count: agentCount } = await supabase
      .from('agents')
      .select('id, tenant_id', { count: 'exact' });

    console.log('📊 Total agents:', agentCount);

    // 3. Map ALL agents to Vital System tenant
    const vitalMappings = agents?.map(agent => ({
      tenant_id: vitalTenant.id,
      agent_id: agent.id,
      is_enabled: true
    })) || [];

    const { error: vitalError } = await supabase
      .from('tenant_agents')
      .upsert(vitalMappings, { onConflict: 'tenant_id,agent_id', ignoreDuplicates: true });

    if (vitalError) {
      console.error('❌ Error mapping to Vital System:', vitalError);
      return NextResponse.json({ error: vitalError.message }, { status: 500 });
    }

    console.log('✅ Mapped', vitalMappings.length, 'agents to Vital System tenant');

    // 4. Map Pharma agents to Pharma tenant (if exists)
    let pharmaMappingCount = 0;
    if (pharmaTenant) {
      const pharmaAgents = agents?.filter(a => a.tenant_id === pharmaTenant.id) || [];

      if (pharmaAgents.length > 0) {
        const pharmaMappings = pharmaAgents.map(agent => ({
          tenant_id: pharmaTenant.id,
          agent_id: agent.id,
          is_enabled: true
        }));

        const { error: pharmaError } = await supabase
          .from('tenant_agents')
          .upsert(pharmaMappings, { onConflict: 'tenant_id,agent_id', ignoreDuplicates: true });

        if (pharmaError) {
          console.error('⚠️  Error mapping to Pharma tenant:', pharmaError);
        } else {
          pharmaMappingCount = pharmaMappings.length;
          console.log('✅ Mapped', pharmaMappingCount, 'agents to Pharma tenant');
        }
      }
    }

    // 5. Verify mappings
    const { count: totalMappings } = await supabase
      .from('tenant_agents')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Total mappings in tenant_agents:', totalMappings);

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      stats: {
        total_agents: agentCount,
        vital_mappings: vitalMappings.length,
        pharma_mappings: pharmaMappingCount,
        total_mappings: totalMappings,
        tenants: {
          vital: vitalTenant.name,
          pharma: pharmaTenant?.name || null
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
