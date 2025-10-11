'use client';

import { useState } from 'react';
import { ImmutableAuditService, IntegrityCheck, IntegrityIssue } from '@/services/immutable-audit.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface IntegrityManagementProps {
  integrityChecks: IntegrityCheck[];
  onIntegrityUpdate: (checks: IntegrityCheck[]) => void;
}

export default function IntegrityManagement({
  integrityChecks,
  onIntegrityUpdate,
}: IntegrityManagementProps) {
  const [selectedCheck, setSelectedCheck] = useState<IntegrityCheck | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditService = new ImmutableAuditService();

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isValid: boolean) => {
    return (
      <Badge variant={isValid ? 'default' : 'destructive'}>
        {isValid ? 'Valid' : 'Invalid'}
      </Badge>
    );
  };

  const getIssueSeverityBadge = (severity: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const handleVerifyIntegrity = async () => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const newChecks = await auditService.verifyIntegrity();
      onIntegrityUpdate(newChecks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify integrity');
    } finally {
      setIsVerifying(false);
    }
  };

  const getTotalIssues = (check: IntegrityCheck) => {
    return check.issues.length;
  };

  const getCriticalIssues = (check: IntegrityCheck) => {
    return check.issues.filter(issue => issue.severity === 'critical').length;
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
          <h2 className="text-lg font-medium text-gray-900">Audit Chain Integrity</h2>
          <p className="text-sm text-muted-foreground">
            Verify hash chain integrity and detect tampering in audit logs
          </p>
        </div>
        <Button
          onClick={handleVerifyIntegrity}
          disabled={isVerifying}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verifying...' : 'Verify Integrity'}
        </Button>
      </div>

      {/* Integrity Checks Table */}
      <Card>
        <CardContent className="p-0">
          {integrityChecks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No integrity checks available. Run verification to check audit chain integrity.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Critical</TableHead>
                    <TableHead>Checked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrityChecks.map((check) => (
                    <TableRow key={check.blockId}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {getStatusIcon(check.isValid)}
                            {check.blockId}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            Hash: {check.verificationHash.slice(0, 16)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(check.isValid)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getTotalIssues(check)} issue{getTotalIssues(check) !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCriticalIssues(check) > 0 ? (
                          <Badge variant="destructive">
                            {getCriticalIssues(check)} Critical
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(check.checkedAt, 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCheck(check)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getStatusIcon(check.isValid)}
                                Integrity Check: {check.blockId}
                              </DialogTitle>
                              <DialogDescription>
                                Detailed integrity verification results
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[600px]">
                              <IntegrityCheckDetails check={check} />
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
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

interface IntegrityCheckDetailsProps {
  check: IntegrityCheck;
}

function IntegrityCheckDetails({ check }: IntegrityCheckDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Block ID</label>
          <p className="text-sm text-muted-foreground font-mono">{check.blockId}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {check.isValid ? 'Valid' : 'Invalid'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Checked At</label>
          <p className="text-sm text-muted-foreground">
            {format(check.checkedAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Verification Hash</label>
          <p className="text-sm text-muted-foreground font-mono">
            {check.verificationHash}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Total Issues</label>
          <p className="text-sm text-muted-foreground">
            {check.issues.length} issue{check.issues.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Critical Issues</label>
          <p className="text-sm text-muted-foreground">
            {check.issues.filter(i => i.severity === 'critical').length} critical
          </p>
        </div>
      </div>

      {check.issues.length > 0 && (
        <div>
          <label className="text-sm font-medium">Issues Found</label>
          <div className="space-y-3 mt-2">
            {check.issues.map((issue, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{issue.type.replace('_', ' ').toUpperCase()}</h4>
                  {getIssueSeverityBadge(issue.severity)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {issue.description}
                </p>
                {Object.keys(issue.details).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(issue.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {check.issues.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium">No Issues Found</p>
          <p className="text-sm">This audit block passed all integrity checks.</p>
        </div>
      )}
    </div>
  );
}

function getIssueSeverityBadge(severity: string) {
  const variants = {
    low: 'outline',
    medium: 'secondary',
    high: 'destructive',
    critical: 'destructive'
  } as const;

  return (
    <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
      {severity.toUpperCase()}
    </Badge>
  );
}
