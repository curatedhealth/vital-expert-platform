'use client';

import { useState } from 'react';
import { LLMGovernanceService, GovernancePolicy, PolicyRule } from '@/services/llm-governance.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface PolicyManagerProps {
  policies: GovernancePolicy[];
  onPolicyUpdate: (policy: GovernancePolicy) => void;
  onPolicyCreate: (policy: GovernancePolicy) => void;
}

export default function PolicyManager({
  policies,
  onPolicyUpdate,
  onPolicyCreate,
}: PolicyManagerProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<GovernancePolicy | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const governanceService = new LLMGovernanceService();

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'safety':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'performance':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cost':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPolicyTypeBadge = (type: string) => {
    const variants = {
      safety: 'destructive',
      compliance: 'default',
      performance: 'secondary',
      cost: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const handleCreatePolicy = async (policyData: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      const { user } = await governanceService.getCurrentUser();
      const newPolicy = await governanceService.createPolicy(policyData, user.id);
      onPolicyCreate(newPolicy);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
    }
  };

  const handleTogglePolicy = async (policyId: string, isActive: boolean) => {
    try {
      // This would call an update method in the service
      // For now, just update the local state
      const updatedPolicy = policies.find(p => p.id === policyId);
      if (updatedPolicy) {
        updatedPolicy.isActive = isActive;
        onPolicyUpdate(updatedPolicy);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle policy');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Governance Policies</h2>
          <p className="text-sm text-muted-foreground">
            Manage safety, compliance, performance, and cost policies for LLM operations
          </p>
        </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Governance Policy</DialogTitle>
                <DialogDescription>
                  Define a new policy to govern LLM operations and prompt changes
                </DialogDescription>
              </DialogHeader>
              <CreatePolicyForm
                onSubmit={handleCreatePolicy}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          {policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No governance policies found. Create your first policy to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {getPolicyTypeIcon(policy.type)}
                            {policy.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {policy.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPolicyTypeBadge(policy.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(policy.isActive)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePolicy(policy.id, !policy.isActive)}
                            >
                              {policy.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{policy.version}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(policy.updatedAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPolicy(policy)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getPolicyTypeIcon(policy.type)}
                                  {policy.name}
                                </DialogTitle>
                                <DialogDescription>
                                  {policy.description}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <PolicyDetails policy={policy} />
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement delete
                                  console.log('Delete policy:', policy.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface PolicyDetailsProps {
  policy: GovernancePolicy;
}

function PolicyDetails({ policy }: PolicyDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <p className="text-sm text-muted-foreground capitalize">{policy.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {policy.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Version</label>
          <p className="text-sm text-muted-foreground">v{policy.version}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Created By</label>
          <p className="text-sm text-muted-foreground">{policy.createdBy}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Created At</label>
          <p className="text-sm text-muted-foreground">
            {format(policy.createdAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Updated At</label>
          <p className="text-sm text-muted-foreground">
            {format(policy.updatedAt, 'PPpp')}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Rules</label>
        <div className="space-y-3 mt-2">
          {policy.rules.map((rule, index) => (
            <div key={rule.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{rule.name}</h4>
                <Badge variant="outline">Priority {rule.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {rule.condition}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={
                  rule.action === 'allow' ? 'default' :
                  rule.action === 'deny' ? 'destructive' :
                  rule.action === 'require_approval' ? 'secondary' : 'outline'
                }>
                  {rule.action.replace('_', ' ').toUpperCase()}
                </Badge>
                {Object.keys(rule.parameters).length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(rule.parameters).length} parameters
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CreatePolicyFormProps {
  onSubmit: (data: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  onCancel: () => void;
}

function CreatePolicyForm({ onSubmit, onCancel }: CreatePolicyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'safety' as const,
    rules: [] as PolicyRule[],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Policy Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
        >
          <option value="safety">Safety</option>
          <option value="compliance">Compliance</option>
          <option value="performance">Performance</option>
          <option value="cost">Cost</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || !formData.description}>
          Create Policy
        </Button>
      </div>
    </form>
  );
}
