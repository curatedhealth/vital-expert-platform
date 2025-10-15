'use client';

import { useState } from 'react';
import { LLMGovernanceService, ApprovalWorkflow, ApprovalStep } from '@/services/llm-governance.service';
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
  Eye, 
  Workflow, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface ApprovalWorkflowsProps {
  workflows: ApprovalWorkflow[];
  onWorkflowUpdate: (workflow: ApprovalWorkflow) => void;
  onWorkflowCreate: (workflow: ApprovalWorkflow) => void;
}

export default function ApprovalWorkflows({
  workflows,
  onWorkflowUpdate,
  onWorkflowCreate,
}: ApprovalWorkflowsProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const governanceService = new LLMGovernanceService();

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const handleCreateWorkflow = async (workflowData: Omit<ApprovalWorkflow, 'id' | 'createdAt'>) => {
    try {
      const { user } = await governanceService.getCurrentUser();
      // This would call a create method in the service
      // For now, create a mock workflow
      const newWorkflow: ApprovalWorkflow = {
        id: `workflow-${Date.now()}`,
        name: workflowData.name,
        description: workflowData.description,
        steps: workflowData.steps,
        isActive: workflowData.isActive,
        createdBy: user.id,
        createdAt: new Date()
      };
      
      onWorkflowCreate(newWorkflow);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    }
  };

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      // This would call an update method in the service
      // For now, just update the local state
      const updatedWorkflow = workflows.find(w => w.id === workflowId);
      if (updatedWorkflow) {
        updatedWorkflow.isActive = isActive;
        onWorkflowUpdate(updatedWorkflow);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle workflow');
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
          <h2 className="text-lg font-medium text-gray-900">Approval Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Configure multi-step approval processes for prompt changes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Approval Workflow</DialogTitle>
              <DialogDescription>
                Define a new approval workflow for prompt changes
              </DialogDescription>
            </DialogHeader>
            <CreateWorkflowForm
              onSubmit={handleCreateWorkflow}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardContent className="p-0">
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approval workflows found. Create your first workflow to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <Workflow className="h-4 w-4" />
                            {workflow.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {workflow.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workflow.steps.reduce((sum, step) => sum + step.requiredApprovals, 0)} total approvals
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(workflow.isActive)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleWorkflow(workflow.id, !workflow.isActive)}
                          >
                            {workflow.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(workflow.createdAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedWorkflow(workflow)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Workflow className="h-5 w-5" />
                                  {workflow.name}
                                </DialogTitle>
                                <DialogDescription>
                                  {workflow.description}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <WorkflowDetails workflow={workflow} />
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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

interface WorkflowDetailsProps {
  workflow: ApprovalWorkflow;
}

function WorkflowDetails({ workflow }: WorkflowDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {workflow.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Created By</label>
          <p className="text-sm text-muted-foreground">{workflow.createdBy}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Created At</label>
          <p className="text-sm text-muted-foreground">
            {format(workflow.createdAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Total Steps</label>
          <p className="text-sm text-muted-foreground">{workflow.steps.length}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Approval Steps</label>
        <div className="space-y-3 mt-2">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <h4 className="font-medium">{step.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {step.requiredApprovals} approval{step.requiredApprovals !== 1 ? 's' : ''}
                  </Badge>
                  {step.timeoutHours && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.timeoutHours}h timeout
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {step.description || 'No description provided'}
              </p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Approvers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.approvers.map((approver, approverIndex) => (
                      <Badge key={approverIndex} variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {approver}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {step.conditions && (
                  <div>
                    <span className="text-sm font-medium">Conditions:</span>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {step.conditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Workflow Summary</span>
        </div>
        <div className="text-sm text-muted-foreground">
          This workflow requires {workflow.steps.reduce((sum, step) => sum + step.requiredApprovals, 0)} total approvals
          across {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}.
          {workflow.steps.some(step => step.timeoutHours) && 
            ' Some steps have timeout requirements for faster processing.'
          }
        </div>
      </div>
    </div>
  );
}

interface CreateWorkflowFormProps {
  onSubmit: (data: Omit<ApprovalWorkflow, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function CreateWorkflowForm({ onSubmit, onCancel }: CreateWorkflowFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [] as ApprovalStep[],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addStep = () => {
    const newStep: ApprovalStep = {
      id: `step-${Date.now()}`,
      name: '',
      approvers: [],
      requiredApprovals: 1,
      order: formData.steps.length + 1
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Workflow Name</label>
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Approval Steps</label>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Step {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Step name"
                  className="px-2 py-1 border rounded text-sm"
                  value={step.name}
                  onChange={(e) => updateStep(step.id, { name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Required approvals"
                  className="px-2 py-1 border rounded text-sm"
                  value={step.requiredApprovals}
                  onChange={(e) => updateStep(step.id, { requiredApprovals: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Approvers (comma-separated)"
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={step.approvers.join(', ')}
                  onChange={(e) => updateStep(step.id, { 
                    approvers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          ))}
        </div>
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
        <Button type="submit" disabled={!formData.name || !formData.description || formData.steps.length === 0}>
          Create Workflow
        </Button>
      </div>
    </form>
  );
}
