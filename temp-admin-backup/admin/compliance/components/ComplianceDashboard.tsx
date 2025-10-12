'use client';

import { AlertTriangle, Shield, FileText, Activity } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceReportingService, ComplianceReport, IncidentPlaybook } from '@/services/compliance-reporting.service';

import ComplianceOverview from './ComplianceOverview';
import FDAReport from './FDAReport';
import HIPAAReport from './HIPAAReport';
import IncidentPlaybooks from './IncidentPlaybooks';
import SOC2Report from './SOC2Report';

interface ComplianceDashboardProps {
  initialHIPAAReport: ComplianceReport;
  initialSOC2Report: ComplianceReport;
  initialFDAReport: ComplianceReport;
  initialPlaybooks: IncidentPlaybook[];
}

export default function ComplianceDashboard({
  initialHIPAAReport,
  initialSOC2Report,
  initialFDAReport,
  initialPlaybooks,
}: ComplianceDashboardProps) {
  const [hipaaReport, setHIPAAReport] = useState(initialHIPAAReport);
  const [soc2Report, setSOC2Report] = useState(initialSOC2Report);
  const [fdaReport, setFDAReport] = useState(initialFDAReport);
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complianceService = new ComplianceReportingService();

  const refreshReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [newHIPAA, newSOC2, newFDA] = await Promise.all([
        complianceService.generateHIPAAReport(),
        complianceService.generateSOC2Report(),
        complianceService.generateFDAReport()
      ]);

      setHIPAAReport(newHIPAA);
      setSOC2Report(newSOC2);
      setFDAReport(newFDA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh compliance reports');
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallComplianceStatus = () => {
    const reports = [hipaaReport, soc2Report, fdaReport];
    const avgScore = reports.reduce((sum, report) => sum + report.score, 0) / reports.length;
    
    if (avgScore >= 90) return 'compliant';
    if (avgScore >= 70) return 'partial';
    return 'non_compliant';
  };

  const getOverallScore = () => {
    const reports = [hipaaReport, soc2Report, fdaReport];
    return Math.round(reports.reduce((sum, report) => sum + report.score, 0) / reports.length);
  };

  const overallStatus = getOverallComplianceStatus();
  const overallScore = getOverallScore();

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Compliance Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Overall Compliance Status
            </CardTitle>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              overallStatus === 'compliant' ? 'bg-green-100 text-green-800' :
              overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1).replace('_', ' ')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">
                Average compliance score across all frameworks
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-sm font-medium">
                {hipaaReport.generatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hipaa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            HIPAA
          </TabsTrigger>
          <TabsTrigger value="soc2" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SOC2
          </TabsTrigger>
          <TabsTrigger value="fda" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            FDA
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Playbooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ComplianceOverview
            hipaaReport={hipaaReport}
            soc2Report={soc2Report}
            fdaReport={fdaReport}
            onRefresh={refreshReports}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="hipaa">
          <HIPAAReport
            report={hipaaReport}
            onRefresh={refreshReports}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="soc2">
          <SOC2Report
            report={soc2Report}
            onRefresh={refreshReports}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="fda">
          <FDAReport
            report={fdaReport}
            onRefresh={refreshReports}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="playbooks">
          <IncidentPlaybooks
            playbooks={playbooks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
