'use client';

import { useState } from 'react';
import { LLMGovernanceService, GovernancePolicy, PromptChange, ApprovalWorkflow } from '@/services/llm-governance.service';
import PolicyManager from './PolicyManager';
import ChangeManagement from './ChangeManagement';
import ApprovalWorkflows from './ApprovalWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, FileText, Workflow } from 'lucide-react';

interface GovernanceDashboardProps {
  initialPolicies: GovernancePolicy[];
  initialPromptChanges: PromptChange[];
  initialWorkflows: ApprovalWorkflow[];
  isSuperAdmin: boolean;
}

export default function GovernanceDashboard({
  initialPolicies,
  initialPromptChanges,
  initialWorkflows,
  isSuperAdmin
}: GovernanceDashboardProps) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [promptChanges, setPromptChanges] = useState(initialPromptChanges);
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [error, setError] = useState<string | null>(null);

  const governanceService = new LLMGovernanceService();

  const refreshData = async () => {
    try {
      const [newPolicies, newChanges, newWorkflows] = await Promise.all([
        governanceService.getPolicies(),
        governanceService.getPromptChanges(),
        governanceService.getApprovalWorkflows()
      ]);

      setPolicies(newPolicies);
      setPromptChanges(newChanges);
      setWorkflows(newWorkflows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh governance data');
    }
  };

  const handlePolicyUpdate = (updatedPolicy: GovernancePolicy) => {
    setPolicies(prev => 
      prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p)
    );
  };

  const handlePolicyCreate = (newPolicy: GovernancePolicy) => {
    setPolicies(prev => [newPolicy, ...prev]);
  };

  const handleChangeUpdate = (updatedChange: PromptChange) => {
    setPromptChanges(prev => 
      prev.map(c => c.id === updatedChange.id ? updatedChange : c)
    );
  };

  const handleChangeCreate = (newChange: PromptChange) => {
    setPromptChanges(prev => [newChange, ...prev]);
  };

  const handleWorkflowUpdate = (updatedWorkflow: ApprovalWorkflow) => {
    setWorkflows(prev => 
      prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
    );
  };

  const handleWorkflowCreate = (newWorkflow: ApprovalWorkflow) => {
    setWorkflows(prev => [newWorkflow, ...prev]);
  };

  const pendingChanges = promptChanges.filter(c => c.status === 'pending_review').length;
  const highRiskChanges = promptChanges.filter(c => 
    c.impactAnalysis && c.impactAnalysis.riskScore > 7
  ).length;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Risk Alerts */}
      {highRiskChanges > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {highRiskChanges} high-risk prompt change{highRiskChanges > 1 ? 's' : ''} pending review.
            Please review these changes carefully before approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Governance Tabs */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="changes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Changes
            {pendingChanges > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingChanges}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <PolicyManager
            policies={policies}
            onPolicyUpdate={handlePolicyUpdate}
            onPolicyCreate={handlePolicyCreate}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>

        <TabsContent value="changes">
          <ChangeManagement
            promptChanges={promptChanges}
            onChangeUpdate={handleChangeUpdate}
            onChangeCreate={handleChangeCreate}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>

        <TabsContent value="workflows">
          <ApprovalWorkflows
            workflows={workflows}
            onWorkflowUpdate={handleWorkflowUpdate}
            onWorkflowCreate={handleWorkflowCreate}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>
      </Tabs>

      {/* Governance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {policies.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Policies</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingChanges}</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{highRiskChanges}</div>
              <div className="text-sm text-muted-foreground">High Risk Changes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {promptChanges.filter(c => c.status === 'deployed').length}
              </div>
              <div className="text-sm text-muted-foreground">Deployed Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
