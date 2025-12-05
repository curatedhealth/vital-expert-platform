'use client';

/**
 * Roles Management Component
 * Super Admin tool for managing organizational roles
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import { createClient } from '@/lib/supabase/client';

interface OrgRole {
  id: string;
  unique_id: string;
  role_name: string;
  role_title: string;
  description: string | null;
  seniority_level: string | null;
  is_active: boolean;
  created_at: string;
}

export function RolesManagement() {
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState<string>('all');

  const supabase = createClient();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_roles')
        .select('*')
        .order('role_name', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = 
      role.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.unique_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeniority = 
      seniorityFilter === 'all' || role.seniority_level === seniorityFilter;
    
    return matchesSearch && matchesSeniority;
  });

  const seniorityLevels = ['Executive', 'Senior', 'Mid', 'Junior', 'Entry'];
  const levelCounts = seniorityLevels.reduce((acc, level) => {
    acc[level] = roles.filter(r => r.seniority_level === level).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Roles Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage organizational roles and seniority levels
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {seniorityLevels.map((level) => (
              <div key={level}>
                <div className="text-sm text-muted-foreground">{level}</div>
                <div className="text-2xl font-bold">{levelCounts[level] || 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organizational Roles ({roles.length})</CardTitle>
            <div className="flex items-center gap-4">
              <select
                value={seniorityFilter}
                onChange={(e) => setSeniorityFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Levels</option>
                {seniorityLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchRoles}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.role_name}</TableCell>
                  <TableCell>{role.role_title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        role.seniority_level === 'Executive' ? 'default' :
                        role.seniority_level === 'Senior' ? 'secondary' :
                        'outline'
                      }
                    >
                      {role.seniority_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? 'default' : 'destructive'}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

