import { ImmutableAuditService } from '@/services/immutable-audit.service';

import ImmutableAuditDashboard from './components/ImmutableAuditDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function ImmutableAuditPage() {
  
  const auditService = new ImmutableAuditService();
  const [integrityChecks, siemExports, wormConfigs] = await Promise.all([
    auditService.verifyIntegrity(),
    auditService.getSIEMExports(),
    auditService.getWORMConfig()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Immutable Audit Storage</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage hash-chained audit logs, WORM storage, and SIEM exports for compliance and security.
        </p>
        <div className="mt-2 flex items-center text-sm text-amber-600">
          <span className="font-medium">Super Admin:</span>
          <span className="ml-1">Full access to immutable audit configuration and SIEM management</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valid Blocks</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {integrityChecks.filter(c => c.isValid).length}
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
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✗</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Invalid Blocks</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {integrityChecks.filter(c => !c.isValid).length}
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
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SIEM Exports</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {siemExports.filter(e => e.status === 'completed').length}
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
                  <span className="text-white text-sm font-medium">W</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">WORM Configs</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {wormConfigs.filter(c => c.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Audit Dashboard */}
      <ImmutableAuditDashboard 
        initialIntegrityChecks={integrityChecks}
        initialSIEMExports={siemExports}
        initialWORMConfigs={wormConfigs}
      />
    </div>
  );
}
