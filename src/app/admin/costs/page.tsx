import { Suspense } from 'react';

import { CostDashboard } from './components/CostDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function CostManagementPage() {

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cost Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor costs, manage budgets, and analyze usage patterns across your organization.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <CostDashboard />
      </Suspense>
    </div>
  );
}
