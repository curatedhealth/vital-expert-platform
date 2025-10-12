import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock organizational structure data for now
    const organizationalData = {
      functions: [
        {
          id: 'clinical-research',
          name: 'Clinical Research',
          department_name: 'Clinical Research',
          created_at: new Date().toISOString()
        },
        {
          id: 'regulatory-affairs',
          name: 'Regulatory Affairs',
          department_name: 'Regulatory Affairs',
          created_at: new Date().toISOString()
        },
        {
          id: 'medical-affairs',
          name: 'Medical Affairs',
          department_name: 'Medical Affairs',
          created_at: new Date().toISOString()
        },
        {
          id: 'data-science',
          name: 'Data Science',
          department_name: 'Data Science',
          created_at: new Date().toISOString()
        },
        {
          id: 'quality-assurance',
          name: 'Quality Assurance',
          department_name: 'Quality Assurance',
          created_at: new Date().toISOString()
        }
      ],
      departments: [
        {
          id: 'clinical-operations',
          name: 'Clinical Operations',
          business_function_id: 'clinical-research',
          created_at: new Date().toISOString()
        },
        {
          id: 'biostatistics',
          name: 'Biostatistics',
          business_function_id: 'data-science',
          created_at: new Date().toISOString()
        },
        {
          id: 'regulatory-submissions',
          name: 'Regulatory Submissions',
          business_function_id: 'regulatory-affairs',
          created_at: new Date().toISOString()
        }
      ],
      roles: [
        {
          id: 'clinical-research-manager',
          name: 'Clinical Research Manager',
          department_id: 'clinical-operations',
          created_at: new Date().toISOString()
        },
        {
          id: 'biostatistician',
          name: 'Biostatistician',
          department_id: 'biostatistics',
          created_at: new Date().toISOString()
        },
        {
          id: 'regulatory-specialist',
          name: 'Regulatory Specialist',
          department_id: 'regulatory-submissions',
          created_at: new Date().toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: organizationalData
    });

  } catch (error) {
    console.error('Error fetching organizational structure:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch organizational structure' 
      },
      { status: 500 }
    );
  }
}
