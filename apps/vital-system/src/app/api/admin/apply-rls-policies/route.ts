/**
 * Admin API: Apply RLS Policies for Many-to-Many Agent-Tenant
 * POST /api/admin/apply-rls-policies
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    console.log('🚀 Applying RLS Policies for Many-to-Many Agent-Tenant...');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Array of SQL commands to execute
    const sqlCommands = [
      // Drop old single-tenant policies
      `DROP POLICY IF EXISTS "platform_agents_readable" ON public.agents`,
      `DROP POLICY IF EXISTS "tenant_agents_writable" ON public.agents`,
      `DROP POLICY IF EXISTS "tenant_agents_updatable" ON public.agents`,
      `DROP POLICY IF EXISTS "tenant_agents_deletable" ON public.agents`,
      `DROP POLICY IF EXISTS "authenticated_users_read_agents" ON public.agents`,
      `DROP POLICY IF EXISTS "tenant_agents_insertable" ON public.agents`,

      // NEW SELECT POLICY: Super Admin sees ALL agents
      `CREATE POLICY "super_admin_sees_all_agents"
       ON public.agents FOR SELECT
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM public.profiles p
           WHERE p.id = auth.uid() AND p.role = 'super_admin'
         )
         OR
         EXISTS (
           SELECT 1 FROM public.tenant_agents ta
           JOIN public.profiles p ON p.id = auth.uid()
           WHERE ta.agent_id = agents.id
             AND ta.tenant_id = p.tenant_id
             AND ta.is_enabled = true
         )
       )`,

      // INSERT POLICY
      `CREATE POLICY "users_can_create_agents"
       ON public.agents FOR INSERT
       TO authenticated
       WITH CHECK (true)`,

      // UPDATE POLICY
      `CREATE POLICY "users_can_update_accessible_agents"
       ON public.agents FOR UPDATE
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'super_admin'
         )
         OR created_by = auth.uid()
         OR EXISTS (
           SELECT 1 FROM public.tenant_agents ta
           JOIN public.profiles p ON p.id = auth.uid()
           WHERE ta.agent_id = agents.id
             AND ta.tenant_id = p.tenant_id
             AND p.role IN ('admin', 'tenant_admin')
         )
       )
       WITH CHECK (true)`,

      // DELETE POLICY
      `CREATE POLICY "users_can_delete_owned_agents"
       ON public.agents FOR DELETE
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'super_admin'
         )
         OR created_by = auth.uid()
       )`,

      // Enable RLS on tenant_agents
      `ALTER TABLE public.tenant_agents ENABLE ROW LEVEL SECURITY`,

      // tenant_agents SELECT policy
      `CREATE POLICY "super_admin_sees_all_mappings"
       ON public.tenant_agents FOR SELECT
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'super_admin'
         )
         OR EXISTS (
           SELECT 1 FROM public.profiles p
           WHERE p.id = auth.uid() AND p.tenant_id = tenant_agents.tenant_id
         )
       )`,

      // tenant_agents WRITE policy
      `CREATE POLICY "admins_manage_tenant_mappings"
       ON public.tenant_agents FOR ALL
       TO authenticated
       USING (
         EXISTS (
           SELECT 1 FROM public.profiles p
           WHERE p.id = auth.uid()
             AND p.tenant_id = tenant_agents.tenant_id
             AND p.role IN ('admin', 'tenant_admin', 'super_admin')
         )
       )
       WITH CHECK (
         EXISTS (
           SELECT 1 FROM public.profiles p
           WHERE p.id = auth.uid()
             AND p.tenant_id = tenant_agents.tenant_id
             AND p.role IN ('admin', 'tenant_admin', 'super_admin')
         )
       )`
    ];

    const results = [];

    for (const sql of sqlCommands) {
      try {
        console.log('Executing:', sql.substring(0, 100) + '...');

        // Use the raw SQL query method
        const { error } = await supabase.rpc('exec', { sql });

        if (error) {
          console.warn('⚠️  Error executing SQL:', error.message);
          results.push({ sql: sql.substring(0, 100), error: error.message });
        } else {
          console.log('✅ Success');
          results.push({ sql: sql.substring(0, 100), success: true });
        }
      } catch (err: any) {
        console.warn('⚠️  Exception:', err.message);
        results.push({ sql: sql.substring(0, 100), error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies applied (check results for any errors)',
      results
    });

  } catch (error: any) {
    console.error('❌ RLS policy application error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
