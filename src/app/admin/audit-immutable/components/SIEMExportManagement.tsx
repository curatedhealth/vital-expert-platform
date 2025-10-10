'use client';

import { useState } from 'react';
import { ImmutableAuditService, SIEMExport } from '@/services/immutable-audit.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface SIEMExportManagementProps {
  siemExports: SIEMExport[];
  onSIEMExportUpdate: (export_: SIEMExport) => void;
  onSIEMExportCreate: (export_: SIEMExport) => void;
}

export default function SIEMExportManagement({
  siemExports,
  onSIEMExportUpdate,
  onSIEMExportCreate,
}: SIEMExportManagementProps) {
  const [selectedExport, setSelectedExport] = useState<SIEMExport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditService = new ImmutableAuditService();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      processing: 'secondary',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFormatBadge = (format: string) => {
    const variants = {
      json: 'default',
      cef: 'secondary',
      leef: 'outline'
    } as const;

    return (
      <Badge variant={variants[format as keyof typeof variants] || 'outline'}>
        {format.toUpperCase()}
      </Badge>
    );
  };

  const handleCreateExport = async (exportData: Omit<SIEMExport, 'id' | 'startedAt' | 'recordCount' | 'checksum'>) => {
    try {
      setIsExporting(true);
      setError(null);
      
      const newExport = await auditService.exportToSIEM(
        exportData.blockId,
        exportData.destination,
        exportData.format
      );
      
      onSIEMExportCreate(newExport);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SIEM export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetryExport = async (exportId: string) => {
    try {
      setIsExporting(true);
      setError(null);
      
      const export_ = siemExports.find(e => e.id === exportId);
      if (!export_) {
        throw new Error('Export not found');
      }

      const newExport = await auditService.exportToSIEM(
        export_.blockId,
        export_.destination,
        export_.format
      );
      
      onSIEMExportUpdate(newExport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry export');
    } finally {
      setIsExporting(false);
    }
  };

  const completedExports = siemExports.filter(e => e.status === 'completed').length;
  const failedExports = siemExports.filter(e => e.status === 'failed').length;
  const processingExports = siemExports.filter(e => e.status === 'processing').length;

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
          <h2 className="text-lg font-medium text-gray-900">SIEM Exports</h2>
          <p className="text-sm text-muted-foreground">
            Export audit logs to external SIEM systems for security monitoring
          </p>
        </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isExporting}>
                <Upload className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Create Export'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create SIEM Export</DialogTitle>
                <DialogDescription>
                  Export audit data to an external SIEM system
                </DialogDescription>
              </DialogHeader>
              <CreateSIEMExportForm
                onSubmit={handleCreateExport}
                onCancel={() => setIsCreateDialogOpen(false)}
                isExporting={isExporting}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Export Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedExports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedExports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingExports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exports Table */}
      <Card>
        <CardContent className="p-0">
          {siemExports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No SIEM exports found. Create your first export to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Block ID</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siemExports.map((export_) => (
                    <TableRow key={export_.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {getStatusIcon(export_.status)}
                            {export_.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {export_.exportType} export
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {export_.blockId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {export_.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getFormatBadge(export_.format)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(export_.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {export_.recordCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(export_.startedAt, 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedExport(export_)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getStatusIcon(export_.status)}
                                  SIEM Export: {export_.id}
                                </DialogTitle>
                                <DialogDescription>
                                  Export details and status
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <SIEMExportDetails 
                                  export_={export_}
                                  onRetry={handleRetryExport}
                                />
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          {export_.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement download
                                console.log('Download export:', export_.id);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetryExport(export_.id)}
                              disabled={isExporting}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
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

interface SIEMExportDetailsProps {
  export_: SIEMExport;
  onRetry: (exportId: string) => void;
}

function SIEMExportDetails({ export_, onRetry }: SIEMExportDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Export ID</label>
          <p className="text-sm text-muted-foreground font-mono">{export_.id}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground capitalize">{export_.status}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Block ID</label>
          <p className="text-sm text-muted-foreground font-mono">{export_.blockId}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Destination</label>
          <p className="text-sm text-muted-foreground">{export_.destination}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Format</label>
          <p className="text-sm text-muted-foreground uppercase">{export_.format}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <p className="text-sm text-muted-foreground capitalize">{export_.exportType}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Record Count</label>
          <p className="text-sm text-muted-foreground">{export_.recordCount.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Checksum</label>
          <p className="text-sm text-muted-foreground font-mono">
            {export_.checksum || 'Not available'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Started At</label>
          <p className="text-sm text-muted-foreground">
            {format(export_.startedAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Completed At</label>
          <p className="text-sm text-muted-foreground">
            {export_.completedAt ? format(export_.completedAt, 'PPpp') : 'Not completed'}
          </p>
        </div>
      </div>

      {export_.errorMessage && (
        <div>
          <label className="text-sm font-medium">Error Message</label>
          <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{export_.errorMessage}</p>
          </div>
        </div>
      )}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => onRetry(export_.id)}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Export
          </Button>
        </div>
      )}
    </div>
  );
}

interface CreateSIEMExportFormProps {
  onSubmit: (data: Omit<SIEMExport, 'id' | 'startedAt' | 'recordCount' | 'checksum'>) => void;
  onCancel: () => void;
  isExporting: boolean;
}

function CreateSIEMExportForm({ onSubmit, onCancel, isExporting }: CreateSIEMExportFormProps) {
  const [formData, setFormData] = useState({
    blockId: '',
    destination: '',
    format: 'json' as const,
    exportType: 'full' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Block ID</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.blockId}
          onChange={(e) => setFormData(prev => ({ ...prev, blockId: e.target.value }))}
          placeholder="block-1234567890"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Destination</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.destination}
          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
          placeholder="https://siem.company.com/api/events"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.format}
            onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
          >
            <option value="json">JSON</option>
            <option value="cef">CEF</option>
            <option value="leef">LEEF</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Export Type</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.exportType}
            onChange={(e) => setFormData(prev => ({ ...prev, exportType: e.target.value as any }))}
          >
            <option value="full">Full</option>
            <option value="incremental">Incremental</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.blockId || !formData.destination || isExporting}>
          {isExporting ? 'Exporting...' : 'Create Export'}
        </Button>
      </div>
    </form>
  );
}
