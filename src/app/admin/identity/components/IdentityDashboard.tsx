'use client';

import { useState } from 'react';
import { 
  IdentityHardeningService, 
  SSOProvider, 
  MFAConfig, 
  AccessReview, 
  ImpersonationSession 
} from '@/services/identity-hardening.service';
import SSOManagement from './SSOManagement';
import MFAManagement from './MFAManagement';
import AccessReviewManagement from './AccessReviewManagement';
import ImpersonationManagement from './ImpersonationManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Key, 
  Users, 
  UserCheck,
  Activity
} from 'lucide-react';

interface IdentityDashboardProps {
  initialSSOProviders: SSOProvider[];
  initialMFAConfigs: MFAConfig[];
  initialAccessReviews: AccessReview[];
  initialImpersonationSessions: ImpersonationSession[];
}

export default function IdentityDashboard({
  initialSSOProviders,
  initialMFAConfigs,
  initialAccessReviews,
  initialImpersonationSessions,
}: IdentityDashboardProps) {
  const [ssoProviders, setSSOProviders] = useState(initialSSOProviders);
  const [mfaConfigs, setMFAConfigs] = useState(initialMFAConfigs);
  const [accessReviews, setAccessReviews] = useState(initialAccessReviews);
  const [impersonationSessions, setImpersonationSessions] = useState(initialImpersonationSessions);
  const [error, setError] = useState<string | null>(null);

  const identityService = new IdentityHardeningService();

  const refreshData = async () => {
    try {
      const [newSSOProviders, newMFAConfigs, newAccessReviews, newImpersonationSessions] = await Promise.all([
        identityService.getSSOProviders(),
        identityService.getMFAConfig(),
        identityService.getAccessReviews(),
        identityService.getActiveImpersonationSessions()
      ]);

      setSSOProviders(newSSOProviders);
      setMFAConfigs(newMFAConfigs);
      setAccessReviews(newAccessReviews);
      setImpersonationSessions(newImpersonationSessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh identity data');
    }
  };

  const handleSSOUpdate = (updatedProvider: SSOProvider) => {
    setSSOProviders(prev => 
      prev.map(p => p.id === updatedProvider.id ? updatedProvider : p)
    );
  };

  const handleSSOCreate = (newProvider: SSOProvider) => {
    setSSOProviders(prev => [newProvider, ...prev]);
  };

  const handleMFAUpdate = (updatedConfig: MFAConfig) => {
    setMFAConfigs(prev => 
      prev.map(c => c.id === updatedConfig.id ? updatedConfig : c)
    );
  };

  const handleMFACreate = (newConfig: MFAConfig) => {
    setMFAConfigs(prev => [newConfig, ...prev]);
  };

  const handleAccessReviewUpdate = (updatedReview: AccessReview) => {
    setAccessReviews(prev => 
      prev.map(r => r.id === updatedReview.id ? updatedReview : r)
    );
  };

  const handleAccessReviewCreate = (newReview: AccessReview) => {
    setAccessReviews(prev => [newReview, ...prev]);
  };

  const handleImpersonationUpdate = (updatedSession: ImpersonationSession) => {
    setImpersonationSessions(prev => 
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
  };

  const activeReviews = accessReviews.filter(r => r.status === 'active').length;
  const overdueReviews = accessReviews.filter(r => 
    r.status === 'active' && new Date(r.dueDate) < new Date()
  ).length;
  const activeImpersonations = impersonationSessions.length;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Alerts */}
      {overdueReviews > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overdueReviews} access review{overdueReviews > 1 ? 's' : ''} overdue. 
            Please complete these reviews to maintain security compliance.
          </AlertDescription>
        </Alert>
      )}

      {activeImpersonations > 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            {activeImpersonations} active impersonation session{activeImpersonations > 1 ? 's' : ''} in progress.
            Monitor these sessions for security compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Identity Tabs */}
      <Tabs defaultValue="sso" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sso" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            SSO
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Access Reviews
            {activeReviews > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeReviews}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="impersonation" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Impersonation
            {activeImpersonations > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeImpersonations}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sso">
          <SSOManagement
            ssoProviders={ssoProviders}
            onSSOUpdate={handleSSOUpdate}
            onSSOCreate={handleSSOCreate}
          />
        </TabsContent>

        <TabsContent value="mfa">
          <MFAManagement
            mfaConfigs={mfaConfigs}
            onMFAUpdate={handleMFAUpdate}
            onMFACreate={handleMFACreate}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <AccessReviewManagement
            accessReviews={accessReviews}
            onAccessReviewUpdate={handleAccessReviewUpdate}
            onAccessReviewCreate={handleAccessReviewCreate}
          />
        </TabsContent>

        <TabsContent value="impersonation">
          <ImpersonationManagement
            impersonationSessions={impersonationSessions}
            onImpersonationUpdate={handleImpersonationUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {ssoProviders.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active SSO Providers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mfaConfigs.filter(c => c.isEnabled).length}
              </div>
              <div className="text-sm text-muted-foreground">MFA Configs</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeReviews}</div>
              <div className="text-sm text-muted-foreground">Active Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activeImpersonations}</div>
              <div className="text-sm text-muted-foreground">Active Impersonations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
