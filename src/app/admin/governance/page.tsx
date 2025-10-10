import { LLMGovernanceService } from '@/services/llm-governance.service';
import GovernanceDashboard from './components/GovernanceDashboard';

export default async function GovernancePage() {
  
  const governanceService = new LLMGovernanceService();
  const [policies, promptChanges, workflows] = await Promise.all([
    governanceService.getPolicies(),
    governanceService.getPromptChanges(),
    governanceService.getApprovalWorkflows()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">LLM Governance</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage prompt policies, approval workflows, and change management for LLM operations.
        </p>
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <span className="font-medium">Super Admin:</span>
            <span className="ml-1">Full access to governance policies and workflows</span>
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
                  <span className="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Policies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {policies.filter(p => p.isActive).length}
                  </dd>
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
                  <span className="text-white text-sm font-medium">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Changes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {promptChanges.filter(c => c.status === 'pending_review').length}
                  </dd>
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
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved Today</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {promptChanges.filter(c => 
                      c.status === 'approved' && 
                      new Date(c.reviewedAt || '').toDateString() === new Date().toDateString()
                    ).length}
                  </dd>
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
                  <span className="text-white text-sm font-medium">W</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Workflows</dt>
                  <dd className="text-lg font-medium text-gray-900">{workflows.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Dashboard */}
      <GovernanceDashboard 
        initialPolicies={policies}
        initialPromptChanges={promptChanges}
        initialWorkflows={workflows}
      />
    </div>
  );
}
