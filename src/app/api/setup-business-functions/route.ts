import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create business_functions table if it doesn't exist
    const createBusinessFunctionsTable = `
      CREATE TABLE IF NOT EXISTS public.business_functions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const createDepartmentsTable = `
      CREATE TABLE IF NOT EXISTS public.departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        business_function_id UUID REFERENCES public.business_functions(id) ON DELETE SET NULL,
        parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
        hipaa_required BOOLEAN DEFAULT false,
        gdpr_required BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS public.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
        business_function_id UUID REFERENCES public.business_functions(id) ON DELETE SET NULL,
        level VARCHAR(50),
        responsibilities TEXT[],
        required_capabilities TEXT[],
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Execute table creation
    await supabase.rpc('exec_sql', { sql: createBusinessFunctionsTable });
    await supabase.rpc('exec_sql', { sql: createDepartmentsTable });
    await supabase.rpc('exec_sql', { sql: createRolesTable });

    // Insert sample data
    const sampleBusinessFunctions = [
      {
        code: 'REG',
        name: 'Regulatory Affairs',
        description: 'FDA compliance and regulatory strategy',
        icon: 'shield-check',
        color: 'blue',
        sort_order: 1
      },
      {
        code: 'CLIN',
        name: 'Clinical Development',
        description: 'Clinical trial design and execution',
        icon: 'flask',
        color: 'green',
        sort_order: 2
      },
      {
        code: 'QUAL',
        name: 'Quality Assurance',
        description: 'Quality management and compliance',
        icon: 'check-circle',
        color: 'purple',
        sort_order: 3
      },
      {
        code: 'MKT',
        name: 'Market Access',
        description: 'Reimbursement and market strategy',
        icon: 'trending-up',
        color: 'orange',
        sort_order: 4
      }
    ];

    // Insert business functions
    for (const func of sampleBusinessFunctions) {
      const { error } = await supabase
        .from('business_functions')
        .upsert(func, { onConflict: 'code' });
      
      if (error) {
        console.error('Error inserting business function:', error);
      }
    }

    // Get the inserted business functions to create departments
    const { data: functions } = await supabase
      .from('business_functions')
      .select('id, code');

    if (functions && functions.length > 0) {
      const regFunction = functions.find(f => f.code === 'REG');
      const clinFunction = functions.find(f => f.code === 'CLIN');
      const qualFunction = functions.find(f => f.code === 'QUAL');
      const mktFunction = functions.find(f => f.code === 'MKT');

      const sampleDepartments = [
        {
          name: 'FDA Compliance',
          description: 'FDA regulatory compliance and submissions',
          business_function_id: regFunction?.id,
          hipaa_required: true,
          sort_order: 1
        },
        {
          name: 'Clinical Operations',
          description: 'Clinical trial management and operations',
          business_function_id: clinFunction?.id,
          hipaa_required: true,
          sort_order: 1
        },
        {
          name: 'Quality Control',
          description: 'Quality control and testing',
          business_function_id: qualFunction?.id,
          hipaa_required: false,
          sort_order: 1
        },
        {
          name: 'Reimbursement Strategy',
          description: 'Payer relations and reimbursement',
          business_function_id: mktFunction?.id,
          hipaa_required: false,
          sort_order: 1
        }
      ];

      // Insert departments
      for (const dept of sampleDepartments) {
        const { error } = await supabase
          .from('departments')
          .upsert(dept, { onConflict: 'name' });
        
        if (error) {
          console.error('Error inserting department:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Business functions, departments, and roles tables created successfully'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to setup business functions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}