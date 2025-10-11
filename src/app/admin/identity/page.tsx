import { IdentityHardeningService } from '@/services/identity-hardening.service';
import IdentityDashboard from './components/IdentityDashboard';

export default async function IdentityPage() {
  
  const identityService = new IdentityHardeningService();
  const [ssoProviders, mfaConfigs, accessReviews, impersonationSessions] = await Promise.all([
    identityService.getSSOProviders(),
    identityService.getMFAConfig(),
    identityService.getAccessReviews(),
    identityService.getActiveImpersonationSessions()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Identity & Access Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure SSO, MFA, session security, and access reviews for enterprise identity management.
        </p>
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <span className="font-medium">Super Admin:</span>
            <span className="ml-1">Full access to identity configuration and impersonation</span>
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
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SSO Providers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {ssoProviders.filter(p => p.isActive).length}
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
                  <span className="text-white text-sm font-medium">M</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">MFA Methods</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mfaConfigs.reduce((sum, config) => sum + config.methods.length, 0)}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Reviews</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accessReviews.filter(r => r.status === 'active').length}
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
                  <span className="text-white text-sm font-medium">I</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Impersonations</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {impersonationSessions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Dashboard */}
      <IdentityDashboard 
        initialSSOProviders={ssoProviders}
        initialMFAConfigs={mfaConfigs}
        initialAccessReviews={accessReviews}
        initialImpersonationSessions={impersonationSessions}
      />
    </div>
  );
}
