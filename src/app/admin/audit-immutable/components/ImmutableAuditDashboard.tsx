'use client';

import { useState } from 'react';
import { 
  ImmutableAuditService, 
  IntegrityCheck, 
  SIEMExport, 
  WORMConfig 
} from '@/services/immutable-audit.service';
import IntegrityManagement from './IntegrityManagement';
import SIEMExportManagement from './SIEMExportManagement';
import WORMConfigManagement from './WORMConfigManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Upload, 
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ImmutableAuditDashboardProps {
  initialIntegrityChecks: IntegrityCheck[];
  initialSIEMExports: SIEMExport[];
  initialWORMConfigs: WORMConfig[];
}

export default function ImmutableAuditDashboard({
  initialIntegrityChecks,
  initialSIEMExports,
  initialWORMConfigs,
}: ImmutableAuditDashboardProps) {
  const [integrityChecks, setIntegrityChecks] = useState(initialIntegrityChecks);
  const [siemExports, setSIEMExports] = useState(initialSIEMExports);
  const [wormConfigs, setWORMConfigs] = useState(initialWORMConfigs);
  const [error, setError] = useState<string | null>(null);

  const auditService = new ImmutableAuditService();

  const refreshData = async () => {
    try {
      const [newIntegrityChecks, newSIEMExports, newWORMConfigs] = await Promise.all([
        auditService.verifyIntegrity(),
        auditService.getSIEMExports(),
        auditService.getWORMConfig()
      ]);

      setIntegrityChecks(newIntegrityChecks);
      setSIEMExports(newSIEMExports);
      setWORMConfigs(newWORMConfigs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh audit data');
    }
  };

  const handleIntegrityUpdate = (updatedChecks: IntegrityCheck[]) => {
    setIntegrityChecks(updatedChecks);
  };

  const handleSIEMExportUpdate = (updatedExport: SIEMExport) => {
    setSIEMExports(prev => 
      prev.map(e => e.id === updatedExport.id ? updatedExport : e)
    );
  };

  const handleSIEMExportCreate = (newExport: SIEMExport) => {
    setSIEMExports(prev => [newExport, ...prev]);
  };

  const handleWORMConfigUpdate = (updatedConfig: WORMConfig) => {
    setWORMConfigs(prev => 
      prev.map(c => c.id === updatedConfig.id ? updatedConfig : c)
    );
  };

  const handleWORMConfigCreate = (newConfig: WORMConfig) => {
    setWORMConfigs(prev => [newConfig, ...prev]);
  };

  const invalidBlocks = integrityChecks.filter(c => !c.isValid).length;
  const criticalIssues = integrityChecks.reduce((sum, check) => 
    sum + check.issues.filter(issue => issue.severity === 'critical').length, 0
  );
  const failedExports = siemExports.filter(e => e.status === 'failed').length;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Critical Alerts */}
      {criticalIssues > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalIssues} critical integrity issue{criticalIssues > 1 ? 's' : ''} detected. 
            Immediate attention required to maintain audit chain integrity.
          </AlertDescription>
        </Alert>
      )}

      {invalidBlocks > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {invalidBlocks} invalid audit block{invalidBlocks > 1 ? 's' : ''} detected. 
            Review integrity checks for details.
          </AlertDescription>
        </Alert>
      )}

      {failedExports > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {failedExports} SIEM export{failedExports > 1 ? 's' : ''} failed. 
            Check export configuration and retry if necessary.
          </AlertDescription>
        </Alert>
      )}

      {/* Audit Tabs */}
      <Tabs defaultValue="integrity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrity" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Integrity
            {invalidBlocks > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {invalidBlocks}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="siem" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            SIEM Export
            {failedExports > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {failedExports}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="worm" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            WORM Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrity">
          <IntegrityManagement
            integrityChecks={integrityChecks}
            onIntegrityUpdate={handleIntegrityUpdate}
          />
        </TabsContent>

        <TabsContent value="siem">
          <SIEMExportManagement
            siemExports={siemExports}
            onSIEMExportUpdate={handleSIEMExportUpdate}
            onSIEMExportCreate={handleSIEMExportCreate}
          />
        </TabsContent>

        <TabsContent value="worm">
          <WORMConfigManagement
            wormConfigs={wormConfigs}
            onWORMConfigUpdate={handleWORMConfigUpdate}
            onWORMConfigCreate={handleWORMConfigCreate}
          />
        </TabsContent>
      </Tabs>

      {/* Audit Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Chain Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {integrityChecks.filter(c => c.isValid).length}
              </div>
              <div className="text-sm text-muted-foreground">Valid Blocks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{invalidBlocks}</div>
              <div className="text-sm text-muted-foreground">Invalid Blocks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {siemExports.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Exports</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {wormConfigs.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active WORM Configs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
