'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Key,
  RotateCcw,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ApiKey, ApiKeyPagination } from '@/services/api-key-management.service';

interface ApiKeyTableProps {
  data: ApiKey[];
  pagination: ApiKeyPagination;
  onPageChange: (page: number) => void;
  onRotate: (keyId: string) => void;
  onRevoke: (keyId: string) => void;
  isLoading?: boolean;
}

export default function ApiKeyTable({
  data,
  pagination,
  onPageChange,
  onRotate,
  onRevoke,
  isLoading = false
}: ApiKeyTableProps) {
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Active' : 'Revoked'}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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
          Page {page} of {totalPages} ({pagination.total || 0} total keys)
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
            <span className="ml-2">Loading API keys...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found matching your criteria.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Key Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{key.key_name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {key.id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.provider_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {maskApiKey(key.key_hash)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.key_hash)}
                            >
                              {copiedKey === key.key_hash ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(key.is_active)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(key.last_used_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.usage_count}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedKey(key)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>API Key Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {key.key_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[600px]">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">ID</label>
                                        <p className="text-sm text-muted-foreground font-mono">{key.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Key Name</label>
                                        <p className="text-sm text-muted-foreground">{key.key_name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Provider</label>
                                        <p className="text-sm text-muted-foreground">{key.provider_name || 'Unknown'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <p className="text-sm text-muted-foreground">{getStatusBadge(key.is_active)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Created At</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(key.created_at)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Expires At</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(key.expires_at)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Last Used</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(key.last_used_at)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Usage Count</label>
                                        <p className="text-sm text-muted-foreground">{key.usage_count}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Key Hash</label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <code className="text-xs bg-muted p-2 rounded font-mono flex-1">
                                          {key.key_hash}
                                        </code>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(key.key_hash)}
                                        >
                                          {copiedKey === key.key_hash ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>

                            {key.is_active && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRotate(key.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRevoke(key.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
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
              
              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
