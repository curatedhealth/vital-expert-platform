'use client';

/**
 * Organization Management Component
 * Super Admin tool for managing organizational tenants
 * Scoped to Digital Health Startup tenant
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import { Label } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { createClient } from '@/lib/supabase/client';
import { STARTUP_TENANT_SLUG } from '@/lib/constants/tenant';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  type: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
    type: 'client',
    description: '',
  });

  const supabase = createClient();

  // Fetch organizations - filtered for Digital Health Startup tenant
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', 'digital-health-startup') // Filter for startup tenant only
        .order('name', { ascending: true });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Filter organizations
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.industry && org.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle create/update
  const handleSave = async () => {
    try {
      const orgData = {
        name: formData.name,
        slug: formData.slug,
        industry: formData.industry || null,
        type: formData.type,
        metadata: {
          description: formData.description,
        },
      };

      if (editingOrg) {
        // Update
        const { error } = await supabase
          .from('tenants')
          .update(orgData)
          .eq('id', editingOrg.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('tenants')
          .insert([orgData]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingOrg(null);
      resetForm();
      fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization. Check console for details.');
    }
  };

  // Handle delete
  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', org.id);

      if (error) throw error;
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization. It may have related data.');
    }
  };

  // Handle edit
  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      industry: org.industry || '',
      type: org.type || 'client',
      description: org.metadata?.description || '',
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      industry: '',
      type: 'client',
      description: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
            <Building2 className="h-8 w-8 text-primary" />
            Organization Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage organizational tenants and their configurations
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">Across all types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(o => o.type === 'client').length}
            </div>
            <p className="text-xs text-muted-foreground">Primary clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solution Providers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(o => o.type === 'solution').length}
            </div>
            <p className="text-xs text-muted-foreground">Solution partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Providers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(o => o.type === 'platform').length}
            </div>
            <p className="text-xs text-muted-foreground">Platform integrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organizations</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchOrganizations}>
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
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-neutral-100 px-2 py-1 rounded">{org.slug}</code>
                  </TableCell>
                  <TableCell>{org.industry || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={org.type === 'client' ? 'default' : 'secondary'}>
                      {org.type || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(org)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(org)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? 'Update the organization details below.'
                : 'Add a new organizational tenant to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pharmaceutical Company"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug*</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., pharma-company"
              />
              <p className="text-sm text-muted-foreground">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Pharmaceuticals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type*</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="client">Client</option>
                <option value="solution">Solution</option>
                <option value="industry">Industry</option>
                <option value="platform">Platform</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the organization..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingOrg(null); }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.slug}>
              <Check className="h-4 w-4 mr-2" />
              {editingOrg ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

