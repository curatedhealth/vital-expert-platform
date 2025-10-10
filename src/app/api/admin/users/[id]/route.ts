import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { UserManagementService } from '@/services/user-management.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const { user, isSuperAdmin } = await requireAdmin();
    const userService = new UserManagementService();

    const { id } = params;
    const body = await request.json();
    const { action, data } = body;

    if (action === 'updateRole') {
      const { role } = data;
      await userService.updateUserRole(id, role, user.id);
    } else if (action === 'toggleStatus') {
      const { isActive } = data;
      await userService.toggleUserStatus(id, isActive, user.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User update API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    await requireAdmin();
    const userService = new UserManagementService();

    const { id } = params;
    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User get API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
