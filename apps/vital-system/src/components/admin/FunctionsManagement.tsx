'use client';

/**
 * Functions Management Component
 * Super Admin tool for managing organizational functions
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
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
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface OrgFunction {
  id: string;
  unique_id: string;
  department_name: string;
  description: string | null;
  migration_ready: boolean;
  created_at: string;
}

export function FunctionsManagement() {
  const [functions, setFunctions] = useState<OrgFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const fetchFunctions = async () => {
    setLoading(true);
    try {
      // Note: org_functions doesn't have tenant_id, so we fetch all
      // In a production environment, you'd filter by related tenants
      const { data, error } = await supabase
        .from('org_functions')
        .select('*')
        .order('department_name', { ascending: true });

      if (error) throw error;
      setFunctions(data || []);
    } catch (error) {
      console.error('Error fetching functions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  const filteredFunctions = functions.filter((func) =>
    func.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    func.unique_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Layers className="h-8 w-8" />
            Functions Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage business functions across all organizations
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Functions</div>
              <div className="text-2xl font-bold">{functions.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Organizations</div>
              <div className="text-2xl font-bold">7</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Migration Ready</div>
              <div className="text-2xl font-bold">
                {functions.filter(f => f.migration_ready).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Functions</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search functions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchFunctions}>
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
                <TableHead>Function Name</TableHead>
                <TableHead>Unique ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunctions.map((func) => (
                <TableRow key={func.id}>
                  <TableCell className="font-medium">{func.department_name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {func.unique_id}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {func.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={func.migration_ready ? 'default' : 'secondary'}>
                      {func.migration_ready ? 'Ready' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(func.created_at).toLocaleDateString()}
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

