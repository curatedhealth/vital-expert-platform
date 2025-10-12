'use client';

import { format } from 'date-fns';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserProfile, UserPagination } from '@/services/user-management.service';

interface UserTableProps {
  data: UserProfile[];
  pagination: UserPagination;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export default function UserTable({
  data,
  pagination,
  onPageChange,
  onRoleChange,
  onStatusToggle,
  isLoading = false,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: 'destructive',
      admin: 'default',
      manager: 'secondary',
      user: 'outline',
      viewer: 'outline'
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const canModifyRole = (userRole: string) => {
    if (userRole === 'super_admin') {
    }
    return true;
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
          Page {page} of {totalPages} ({pagination.total || 0} total users)
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
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{user.full_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.department && (
                              <div className="text-xs text-muted-foreground">{user.department}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(user.role)}
                            {user.role === 'super_admin' && (
                              <ShieldCheck className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.organization || '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.is_active)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.last_login)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {user.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[600px]">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">ID</label>
                                        <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">User ID</label>
                                        <p className="text-sm text-muted-foreground font-mono">{user.user_id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Full Name</label>
                                        <p className="text-sm text-muted-foreground">{user.full_name || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Role</label>
                                        <p className="text-sm text-muted-foreground">{getRoleBadge(user.role)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <p className="text-sm text-muted-foreground">{getStatusBadge(user.is_active)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Organization</label>
                                        <p className="text-sm text-muted-foreground">{user.organization || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Department</label>
                                        <p className="text-sm text-muted-foreground">{user.department || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Last Login</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(user.last_login)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Created At</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>

                            {canModifyRole(user.role) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRoleChange(user.id, user.role)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onStatusToggle(user.id, !user.is_active)}
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
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
