'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertTriangle } from 'lucide-react';

interface CreateTenantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTenant: (data: {
    name: string;
    slug: string;
    subscription_tier: string;
    max_users: number;
    max_projects: number;
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
  }) => Promise<void>;
}

export default function CreateTenantDialog({
  isOpen,
  onOpenChange,
  onCreateTenant
}: CreateTenantDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subscription_tier: 'starter',
    max_users: 5,
    max_projects: 3,
    settings: '',
    metadata: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Generate slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      let settings = {};
      let metadata = {};

      try {
        settings = formData.settings ? JSON.parse(formData.settings) : {};
      } catch (err) {
        throw new Error('Invalid JSON in settings field');
      }

      try {
        metadata = formData.metadata ? JSON.parse(formData.metadata) : {};
      } catch (err) {
        throw new Error('Invalid JSON in metadata field');
      }

      await onCreateTenant({
        name: formData.name,
        slug,
        subscription_tier: formData.subscription_tier,
        max_users: formData.max_users,
        max_projects: formData.max_projects,
        settings,
        metadata
      });

      // Reset form
      setFormData({
        name: '',
        slug: '',
        subscription_tier: 'starter',
        max_users: 5,
        max_projects: 3,
        settings: '',
        metadata: ''
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      name: '',
      slug: '',
      subscription_tier: 'starter',
      max_users: 5,
      max_projects: 3,
      settings: '',
      metadata: ''
    });
    onOpenChange(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Organization
          </DialogTitle>
          <DialogDescription>
            Create a new organization with subscription tier and quotas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              placeholder="Acme Healthcare Corp"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  name,
                  slug: prev.slug || generateSlug(name)
                }));
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="acme-healthcare-corp"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier for the organization
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription_tier">Subscription Tier</Label>
            <Select
              value={formData.subscription_tier}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_tier: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subscription tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">
                  <div className="flex flex-col">
                    <span className="font-medium">Starter</span>
                    <span className="text-xs text-muted-foreground">Basic features, 5 users, 3 projects</span>
                  </div>
                </SelectItem>
                <SelectItem value="professional">
                  <div className="flex flex-col">
                    <span className="font-medium">Professional</span>
                    <span className="text-xs text-muted-foreground">Advanced features, 25 users, 15 projects</span>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex flex-col">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-xs text-muted-foreground">Full features, unlimited users/projects</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_users">Max Users</Label>
              <Input
                id="max_users"
                type="number"
                min="1"
                value={formData.max_users}
                onChange={(e) => setFormData(prev => ({ ...prev, max_users: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_projects">Max Projects</Label>
              <Input
                id="max_projects"
                type="number"
                min="1"
                value={formData.max_projects}
                onChange={(e) => setFormData(prev => ({ ...prev, max_projects: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings">Settings (JSON)</Label>
            <Textarea
              id="settings"
              placeholder='{"theme": "dark", "notifications": true}'
              value={formData.settings}
              onChange={(e) => setFormData(prev => ({ ...prev, settings: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON configuration for the organization
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              placeholder='{"industry": "healthcare", "region": "us-west"}'
              value={formData.metadata}
              onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional metadata for analytics and reporting
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug}
            >
              {isLoading ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
