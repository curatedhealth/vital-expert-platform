import { NextRequest, NextResponse } from 'next/server';
import { LLMGovernanceService } from '@/services/llm-governance.service';

export async function GET(request: NextRequest) {
  try {
    const governanceService = new LLMGovernanceService();
    const policies = await governanceService.getPolicies();
    
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, rules, isActive } = body;

    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const governanceService = new LLMGovernanceService();
    const { user } = await governanceService.getCurrentUser();
    
    const policy = await governanceService.createPolicy({
      name,
      description,
      type,
      rules: rules || [],
      isActive: isActive !== false
    }, user.id);

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
