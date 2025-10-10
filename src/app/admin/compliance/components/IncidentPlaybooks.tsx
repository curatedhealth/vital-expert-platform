'use client';

import { useState } from 'react';
import { ComplianceReportingService, IncidentPlaybook, PlaybookExecution } from '@/services/compliance-reporting.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Shield,
  Zap
} from 'lucide-react';

interface IncidentPlaybooksProps {
  playbooks: IncidentPlaybook[];
  isSuperAdmin: boolean;
}

export default function IncidentPlaybooks({ playbooks, isSuperAdmin }: IncidentPlaybooksProps) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<IncidentPlaybook | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<PlaybookExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const complianceService = new ComplianceReportingService();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'default'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const executePlaybook = async (playbook: IncidentPlaybook) => {
    if (!isSuperAdmin) {
      setError('Super admin privileges required to execute playbooks');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setSelectedPlaybook(playbook);

    try {
      const result = await complianceService.executePlaybook(
        playbook.id,
        'current-user', // In real implementation, get actual user ID
        { triggeredBy: 'admin-dashboard' }
      );
      setExecutionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute playbook');
    } finally {
      setIsExecuting(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'api_call':
        return <Zap className="h-4 w-4" />;
      case 'database_query':
        return <Activity className="h-4 w-4" />;
      case 'notification':
        return <AlertTriangle className="h-4 w-4" />;
      case 'manual':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
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

      {/* Playbooks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playbooks.map((playbook) => (
          <Card key={playbook.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getSeverityIcon(playbook.severity)}
                  {playbook.name}
                </CardTitle>
                {getSeverityBadge(playbook.severity)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {playbook.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actions:</span>
                  <span className="font-medium">{playbook.actions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{playbook.estimatedDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approval:</span>
                  <span className="font-medium">
                    {playbook.requiresApproval ? 'Required' : 'Not Required'}
                  </span>
                </div>
              </div>

              {playbook.triggers.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Triggers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {playbook.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getSeverityIcon(playbook.severity)}
                        {playbook.name}
                      </DialogTitle>
                      <DialogDescription>
                        {playbook.description}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[600px]">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Severity</label>
                            <p className="text-sm text-muted-foreground">
                              {getSeverityBadge(playbook.severity)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Estimated Duration</label>
                            <p className="text-sm text-muted-foreground">
                              {playbook.estimatedDuration} minutes
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Requires Approval</label>
                            <p className="text-sm text-muted-foreground">
                              {playbook.requiresApproval ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <p className="text-sm text-muted-foreground">
                              {playbook.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>

                        {playbook.triggers.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Triggers</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {playbook.triggers.map((trigger, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Actions</label>
                          <div className="space-y-2 mt-2">
                            {playbook.actions.map((action, index) => (
                              <div key={action.id} className="border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  {getActionIcon(action.type)}
                                  <span className="font-medium">{action.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {action.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {action.description}
                                </p>
                                {action.isReversible && (
                                  <Badge variant="secondary" className="text-xs">
                                    Reversible
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  onClick={() => executePlaybook(playbook)}
                  disabled={!isSuperAdmin || isExecuting}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution Result Dialog */}
      {executionResult && (
        <Dialog open={!!executionResult} onOpenChange={() => setExecutionResult(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Playbook Execution Result
              </DialogTitle>
              <DialogDescription>
                Execution of {selectedPlaybook?.name} has been initiated
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Execution ID</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {executionResult.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant={
                        executionResult.status === 'completed' ? 'default' :
                        executionResult.status === 'failed' ? 'destructive' :
                        executionResult.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {executionResult.status.charAt(0).toUpperCase() + executionResult.status.slice(1)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Started At</label>
                    <p className="text-sm text-muted-foreground">
                      {executionResult.startedAt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Triggered By</label>
                    <p className="text-sm text-muted-foreground">
                      {executionResult.triggeredBy}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Actions</label>
                  <div className="space-y-2 mt-2">
                    {executionResult.actions.map((action, index) => (
                      <div key={action.actionId} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Action {index + 1}</span>
                          <Badge variant={
                            action.status === 'completed' ? 'default' :
                            action.status === 'failed' ? 'destructive' :
                            action.status === 'running' ? 'secondary' : 'outline'
                          }>
                            {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started: {action.startedAt.toLocaleString()}
                        </div>
                        {action.completedAt && (
                          <div className="text-sm text-muted-foreground">
                            Completed: {action.completedAt.toLocaleString()}
                          </div>
                        )}
                        {action.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {action.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {playbooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Playbooks Available</h3>
            <p className="text-muted-foreground">
              No incident response playbooks are currently configured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
