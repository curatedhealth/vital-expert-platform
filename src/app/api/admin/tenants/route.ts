import { NextRequest, NextResponse } from 'next/server';
import { TenantManagementService } from '@/services/tenant-management.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || undefined;
    const subscriptionTier = searchParams.get('subscriptionTier') || undefined;
    const subscriptionStatus = searchParams.get('subscriptionStatus') || undefined;
    const isActive = searchParams.get('isActive') ? 
      searchParams.get('isActive') === 'true' : undefined;

    const tenantService = new TenantManagementService();
    const response = await tenantService.getOrganizations(
      { search, subscriptionTier, subscriptionStatus, isActive },
      { page, limit }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, subscription_tier, max_users, max_projects, settings, metadata } = body;

    if (!name || !slug || !subscription_tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tenantService = new TenantManagementService();
    const { user } = await tenantService.getCurrentUser();
    
    const organization = await tenantService.createOrganization({
      name,
      slug,
      subscription_tier,
      subscription_status: 'active',
      trial_ends_at: null,
      max_users: max_users || 5,
      max_projects: max_projects || 3,
      settings: settings || {},
      metadata: metadata || {}
    }, user.id);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}
