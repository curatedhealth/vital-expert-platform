import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // First check if business_functions table exists by trying to query it
    const { data: testData, error: testError } = await supabase
      .from('business_functions')
      .select('*')
      .limit(1);

    if (testError) {
      // Table doesn't exist or has issues
      return NextResponse.json({
        error: 'business_functions table not found',
        message: 'Please run the migration: 20250120000000_healthcare_compliance_enhancement.sql',
        testError: testError.message
      }, { status: 400 });
    }

    // Check if the table has data
    if (!testData || testData.length === 0) {
      // Table exists but no data, let's add some basic business functions
      const businessFunctions = [
        {
          name: 'regulatory_affairs',
          department: 'Regulatory Affairs',
          healthcare_category: 'Compliance',
          description: 'FDA, EMA, and global regulatory guidance and submissions'
        },
        {
          name: 'clinical_development',
          department: 'Clinical Affairs',
          healthcare_category: 'Research',
          description: 'Clinical trial design, execution, and management'
        },
        {
          name: 'market_access',
          department: 'Commercial',
          healthcare_category: 'Business',
          description: 'Reimbursement strategy and payer engagement'
        },
        {
          name: 'medical_writing',
          department: 'Medical Affairs',
          healthcare_category: 'Documentation',
          description: 'Clinical and regulatory document preparation'
        },
        {
          name: 'safety_pharmacovigilance',
          department: 'Safety',
          healthcare_category: 'Patient Safety',
          description: 'Adverse event monitoring and safety reporting'
        },
        {
          name: 'quality_assurance',
          department: 'Quality',
          healthcare_category: 'Compliance',
          description: 'GMP, quality systems, and compliance monitoring'
        }
      ];

      const { data: insertData, error: insertError } = await supabase
        .from('business_functions')
        .insert(businessFunctions);

      if (insertError) {
        console.error('Error inserting business functions:', insertError);
        return NextResponse.json({
          error: 'Failed to insert business functions',
          details: insertError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Business functions added successfully',
        count: businessFunctions.length,
        data: insertData
      });
    }

    return NextResponse.json({
      message: 'Business functions table exists and has data',
      count: testData.length
    });

  } catch (error) {
    console.error('Setup business functions error:', error);
    return NextResponse.json(
      { error: 'Failed to setup business functions', details: String(error) },
      { status: 500 }
    );
  }
}