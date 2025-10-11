import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/services/user-management.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      
      const filters = {
        search: searchParams.get('search') || undefined,
        role: searchParams.get('role') || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
        organization: searchParams.get('organization') || undefined,
        department: searchParams.get('department') || undefined,
      };

      const userService = new UserManagementService();
      const response = await userService.getUsers(filters, { page, limit });
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Users API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  });
}
