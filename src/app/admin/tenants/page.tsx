import { TenantManagementService } from '@/services/tenant-management.service';
import TenantManagementViewer from './components/TenantManagementViewer';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function TenantsPage() {
  
  const tenantService = new TenantManagementService();
  const stats = await tenantService.getTenantStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage organizations, departments, and user invitations across the platform.
        </p>
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <span className="font-medium">Super Admin:</span>
            <span className="ml-1">Full access to all tenant management features</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">O</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Organizations</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOrganizations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Organizations</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeOrganizations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">D</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalDepartments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Subscription Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.subscriptionBreakdown).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900 capitalize">{tier}</span>
                <span className="text-lg font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tenant Management Viewer */}
      <TenantManagementViewer 
        initialStats={stats}
      />
    </div>
  );
}
