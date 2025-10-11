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
  Building2,
  Users,
  FolderOpen,
  Settings,
  UserPlus,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { Organization, TenantPagination } from '@/services/tenant-management.service';

interface TenantTableProps {
  data: Organization[];
  pagination: TenantPagination;
  onPageChange: (page: number) => void;
  onEdit: (org: Organization) => void;
  onViewDetails: (org: Organization) => void;
  onInviteUser: (org: Organization) => void;
  isLoading?: boolean;
}

export default function TenantTable({
  data,
  pagination,
  onPageChange,
  onEdit,
  onViewDetails,
  onInviteUser,
  isLoading = false
}: TenantTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const getSubscriptionBadge = (tier: string) => {
    const variants = {
      starter: 'outline',
      professional: 'secondary',
      enterprise: 'default'
    } as const;

    const colors = {
      starter: 'text-blue-600',
      professional: 'text-green-600',
      enterprise: 'text-purple-600'
    } as const;

    return (
      <Badge variant={variants[tier as keyof typeof variants] || 'outline'}>
        <span className={colors[tier as keyof typeof colors]}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'destructive',
      trial: 'secondary',
      cancelled: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
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
          Page {page} of {totalPages} ({pagination.total || 0} total organizations)
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
            <span className="ml-2">Loading organizations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organizations found matching your criteria.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quotas</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {org.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {org.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(org.subscription_tier)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(org.subscription_status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {org.max_users} users
                            </div>
                            <div className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {org.max_projects} projects
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(org.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrg(org)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Organization Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {org.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[600px]">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">ID</label>
                                        <p className="text-sm text-muted-foreground font-mono">{org.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <p className="text-sm text-muted-foreground">{org.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Slug</label>
                                        <p className="text-sm text-muted-foreground font-mono">{org.slug}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Subscription Tier</label>
                                        <p className="text-sm text-muted-foreground">{getSubscriptionBadge(org.subscription_tier)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <p className="text-sm text-muted-foreground">{getStatusBadge(org.subscription_status)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Trial Ends</label>
                                        <p className="text-sm text-muted-foreground">
                                          {org.trial_ends_at ? formatDate(org.trial_ends_at) : 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Max Users</label>
                                        <p className="text-sm text-muted-foreground">{org.max_users}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Max Projects</label>
                                        <p className="text-sm text-muted-foreground">{org.max_projects}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Created At</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(org.created_at)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Updated At</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(org.updated_at)}</p>
                                      </div>
                                    </div>
                                    
                                    {Object.keys(org.settings).length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Settings</label>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                          {JSON.stringify(org.settings, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    
                                    {Object.keys(org.metadata).length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Metadata</label>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                          {JSON.stringify(org.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(org)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onInviteUser(org)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
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
