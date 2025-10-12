'use client';

import { format } from 'date-fns';
import { Eye, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuditLogEntry, AuditLogPagination } from '@/services/audit.service';

interface AuditLogTableProps {
  data: AuditLogEntry[];
  pagination: AuditLogPagination;
  onPageChange: (page: number) => void;
  onExport: () => void;
  isLoading?: boolean;
}

export default function AuditLogTable({
  data,
  pagination,
  onPageChange,
  onExport,
  isLoading = false
}: AuditLogTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? 'default' : 'destructive'}>
        {success ? 'Success' : 'Failed'}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const getVariant = (action: string) => {
      if (action.includes('CREATE')) return 'default';
      if (action.includes('UPDATE')) return 'secondary';
      if (action.includes('DELETE')) return 'destructive';
      if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'outline';
      return 'secondary';
    };

    return (
      <Badge variant={getVariant(action)}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderPagination = () => {
    const { page, totalPages = 0 } = pagination;
    
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const start = Math.max(1, page - 2);
      const end = Math.min(totalPages, page + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} ({pagination.total || 0} total entries)
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1 || isLoading}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || isLoading}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading audit logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Logs</CardTitle>
            <Button onClick={onExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found matching your criteria.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(entry.created_at)}
                        </TableCell>
                        <TableCell>
                          {getActionBadge(entry.action)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {entry.resource_type && (
                              <div className="text-sm font-medium">
                                {entry.resource_type}
                              </div>
                            )}
                            {entry.resource_id && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {truncateText(entry.resource_id, 20)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.user_id ? truncateText(entry.user_id, 20) : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(entry.success)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.ip_address || '-'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEntry(entry)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Audit Log Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information for audit log entry {entry.id}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">ID</label>
                                      <p className="text-sm text-muted-foreground font-mono">{entry.id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Action</label>
                                      <p className="text-sm text-muted-foreground">{entry.action}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">User ID</label>
                                      <p className="text-sm text-muted-foreground font-mono">{entry.user_id || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Success</label>
                                      <p className="text-sm text-muted-foreground">{entry.success ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Resource Type</label>
                                      <p className="text-sm text-muted-foreground">{entry.resource_type || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Resource ID</label>
                                      <p className="text-sm text-muted-foreground font-mono">{entry.resource_id || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">IP Address</label>
                                      <p className="text-sm text-muted-foreground font-mono">{entry.ip_address || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Created At</label>
                                      <p className="text-sm text-muted-foreground">{formatDate(entry.created_at)}</p>
                                    </div>
                                  </div>
                                  
                                  {entry.user_agent && (
                                    <div>
                                      <label className="text-sm font-medium">User Agent</label>
                                      <p className="text-sm text-muted-foreground break-all">{entry.user_agent}</p>
                                    </div>
                                  )}
                                  
                                  {entry.error_message && (
                                    <div>
                                      <label className="text-sm font-medium">Error Message</label>
                                      <p className="text-sm text-red-600 break-all">{entry.error_message}</p>
                                    </div>
                                  )}
                                  
                                  {entry.old_values && Object.keys(entry.old_values).length > 0 && (
                                    <div>
                                      <label className="text-sm font-medium">Old Values</label>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                        {JSON.stringify(entry.old_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  
                                  {entry.new_values && Object.keys(entry.new_values).length > 0 && (
                                    <div>
                                      <label className="text-sm font-medium">New Values</label>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                        {JSON.stringify(entry.new_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
