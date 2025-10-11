'use client';

import { RefreshCw, Download, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComplianceReport } from '@/services/compliance-reporting.service';

interface FDAReportProps {
  report: ComplianceReport;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function FDAReport({ report, onRefresh, isLoading }: FDAReportProps) {
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
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      false_positive: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const exportReport = () => {
    const reportData = {
      reportId: report.id,
      type: report.type,
      status: report.status,
      score: report.score,
      generatedAt: report.generatedAt,
      validUntil: report.validUntil,
      findings: report.findings,
      recommendations: report.recommendations,
      metadata: report.metadata
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fda-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                FDA Compliance Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generated on {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{report.score}%</div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{report.findings.length}</div>
              <div className="text-sm text-muted-foreground">Total Findings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {report.findings.filter(f => f.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {report.findings.filter(f => f.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {report.status !== 'compliant' && (
        <Alert variant={report.status === 'non_compliant' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {report.status === 'non_compliant' 
              ? 'FDA compliance is not met. Critical issues require immediate attention.'
              : 'FDA compliance is partially met. Some issues need to be addressed.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Findings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {report.findings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No compliance findings. All FDA requirements are met.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Finding</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.findings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{finding.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {finding.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{finding.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(finding.severity)}
                          {getSeverityBadge(finding.severity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(finding.status)}
                      </TableCell>
                      <TableCell>
                        {finding.dueDate ? 
                          new Date(finding.dueDate).toLocaleDateString() : 
                          'No due date'
                        }
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Report Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Validation Records:</span>
              <span className="ml-2 font-medium">{report.metadata.validationRecords || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Failed Validations:</span>
              <span className="ml-2 font-medium">{report.metadata.failedValidations || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Traceability Logs:</span>
              <span className="ml-2 font-medium">{report.metadata.traceabilityLogs || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valid Until:</span>
              <span className="ml-2 font-medium">
                {new Date(report.validUntil).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
