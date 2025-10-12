import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock incident playbooks data
    const playbooks = [
      {
        id: '1',
        title: 'Data Breach Response',
        category: 'Security',
        severity: 'Critical',
        description: 'Step-by-step procedures for responding to data breaches',
        steps: [
          'Immediately isolate affected systems',
          'Notify security team and legal counsel',
          'Assess scope and impact of breach',
          'Notify affected users within 72 hours',
          'Document all actions taken',
          'Conduct post-incident review'
        ],
        lastUpdated: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '2',
        title: 'System Outage Response',
        category: 'Infrastructure',
        severity: 'High',
        description: 'Procedures for handling system outages and service disruptions',
        steps: [
          'Assess outage scope and impact',
          'Activate incident response team',
          'Implement workaround solutions',
          'Communicate with affected users',
          'Monitor system recovery',
          'Conduct root cause analysis'
        ],
        lastUpdated: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '3',
        title: 'HIPAA Violation Response',
        category: 'Compliance',
        severity: 'Critical',
        description: 'Response procedures for potential HIPAA violations',
        steps: [
          'Immediately secure affected PHI',
          'Notify compliance officer',
          'Assess violation scope',
          'Document incident details',
          'Notify HHS if required',
          'Implement corrective actions'
        ],
        lastUpdated: new Date().toISOString(),
        status: 'active'
      }
    ];

    return NextResponse.json(playbooks);
  } catch (error) {
    console.error('Error fetching incident playbooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident playbooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock creating a new playbook
    const newPlaybook = {
      id: Date.now().toString(),
      ...body,
      lastUpdated: new Date().toISOString(),
      status: 'active'
    };

    return NextResponse.json(newPlaybook, { status: 201 });
  } catch (error) {
    console.error('Error creating incident playbook:', error);
    return NextResponse.json(
      { error: 'Failed to create incident playbook' },
      { status: 500 }
    );
  }
}
