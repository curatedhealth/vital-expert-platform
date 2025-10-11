'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ComplianceReport } from '@/services/compliance-reporting.service';

interface ComplianceOverviewProps {
  hipaaReport: ComplianceReport;
  soc2Report: ComplianceReport;
  fdaReport: ComplianceReport;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ComplianceOverview({
  hipaaReport,
  soc2Report,
  fdaReport,
  onRefresh,
  isLoading
}: ComplianceOverviewProps) {
  const reports = [
    { name: 'HIPAA', report: hipaaReport, color: 'blue' },
    { name: 'SOC2', report: soc2Report, color: 'green' },
    { name: 'FDA', report: fdaReport, color: 'purple' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'non_compliant':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: 'default',
      partial: 'secondary',
      non_compliant: 'destructive',
      unknown: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const criticalFindings = reports.reduce((total, { report }) => 
    total + report.findings.filter(f => f.severity === 'critical').length, 0
  );

  const highFindings = reports.reduce((total, { report }) => 
    total + report.findings.filter(f => f.severity === 'high').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map(({ name, report, color }) => (
          <Card key={name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  {name}
                </CardTitle>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className={`font-medium ${getScoreColor(report.score)}`}>
                    {report.score}%
                  </span>
                </div>
                <Progress 
                  value={report.score} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Findings:</span>
                  <div className="font-medium">{report.findings.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>
                  <div className="font-medium">
                    {new Date(report.validUntil).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {report.findings.filter(f => f.severity === 'critical').length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {report.findings.filter(f => f.severity === 'critical').length} critical findings
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compliance Summary</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum, { report }) => sum + report.score, 0) / reports.length}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalFindings}</div>
              <div className="text-sm text-muted-foreground">Critical Findings</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{highFindings}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum, { report }) => sum + report.findings.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Findings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Critical Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalFindings === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No critical findings across all compliance frameworks.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(({ name, report }) => 
                report.findings
                  .filter(f => f.severity === 'critical')
                  .map((finding) => (
                    <div key={finding.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{finding.title}</h3>
                          <Badge variant="destructive" className="text-xs">
                            {finding.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {finding.dueDate ? 
                            `Due: ${new Date(finding.dueDate).toLocaleDateString()}` :
                            'No due date'
                          }
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {finding.description}
                      </p>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Remediation: </span>
                        <span className="font-medium">{finding.remediation}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
