'use client';

import { useState } from 'react';
import { IdentityHardeningService, SSOProvider } from '@/services/identity-hardening.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface SSOManagementProps {
  ssoProviders: SSOProvider[];
  onSSOUpdate: (provider: SSOProvider) => void;
  onSSOCreate: (provider: SSOProvider) => void;
  isSuperAdmin: boolean;
}

export default function SSOManagement({
  ssoProviders,
  onSSOUpdate,
  onSSOCreate,
  isSuperAdmin
}: SSOManagementProps) {
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identityService = new IdentityHardeningService();

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'saml':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'oidc':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scim':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProviderTypeBadge = (type: string) => {
    const variants = {
      saml: 'default',
      oidc: 'secondary',
      scim: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const handleCreateProvider = async (providerData: Omit<SSOProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { user } = await identityService.getCurrentUser();
      const newProvider = await identityService.createSSOProvider(providerData, user.id);
      onSSOCreate(newProvider);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SSO provider');
    }
  };

  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    try {
      // This would call an update method in the service
      // For now, just update the local state
      const updatedProvider = ssoProviders.find(p => p.id === providerId);
      if (updatedProvider) {
        updatedProvider.isActive = isActive;
        onSSOUpdate(updatedProvider);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle provider');
    }
  };

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
          <h2 className="text-lg font-medium text-gray-900">SSO Providers</h2>
          <p className="text-sm text-muted-foreground">
            Configure SAML, OIDC, and SCIM providers for enterprise authentication
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add SSO Provider</DialogTitle>
                <DialogDescription>
                  Configure a new SSO provider for enterprise authentication
                </DialogDescription>
              </DialogHeader>
              <CreateSSOProviderForm
                onSubmit={handleCreateProvider}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Providers Table */}
      <Card>
        <CardContent className="p-0">
          {ssoProviders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No SSO providers configured. Add your first provider to enable enterprise authentication.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssoProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {getProviderTypeIcon(provider.type)}
                            {provider.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Entity ID: {provider.configuration.entityId || 'Not configured'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProviderTypeBadge(provider.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>Auto-provisioning: {provider.configuration.autoProvisioning ? 'Yes' : 'No'}</div>
                          <div>Default role: {provider.configuration.defaultRole || 'None'}</div>
                          {provider.configuration.allowedDomains && (
                            <div>Domains: {provider.configuration.allowedDomains.length}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(provider.isActive)}
                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleProvider(provider.id, !provider.isActive)}
                            >
                              {provider.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(provider.updatedAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProvider(provider)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getProviderTypeIcon(provider.type)}
                                  {provider.name}
                                </DialogTitle>
                                <DialogDescription>
                                  SSO Provider Configuration
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <SSOProviderDetails provider={provider} />
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProvider(provider);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement delete
                                  console.log('Delete provider:', provider.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SSOProviderDetailsProps {
  provider: SSOProvider;
}

function SSOProviderDetails({ provider }: SSOProviderDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <p className="text-sm text-muted-foreground uppercase">{provider.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {provider.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Entity ID</label>
          <p className="text-sm text-muted-foreground font-mono">
            {provider.configuration.entityId || 'Not configured'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">SSO URL</label>
          <p className="text-sm text-muted-foreground font-mono">
            {provider.configuration.ssoUrl || 'Not configured'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Auto Provisioning</label>
          <p className="text-sm text-muted-foreground">
            {provider.configuration.autoProvisioning ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Default Role</label>
          <p className="text-sm text-muted-foreground">
            {provider.configuration.defaultRole || 'None'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Created At</label>
          <p className="text-sm text-muted-foreground">
            {format(provider.createdAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Updated At</label>
          <p className="text-sm text-muted-foreground">
            {format(provider.updatedAt, 'PPpp')}
          </p>
        </div>
      </div>

      {provider.configuration.allowedDomains && provider.configuration.allowedDomains.length > 0 && (
        <div>
          <label className="text-sm font-medium">Allowed Domains</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {provider.configuration.allowedDomains.map((domain, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {domain}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Object.keys(provider.configuration.attributeMapping || {}).length > 0 && (
        <div>
          <label className="text-sm font-medium">Attribute Mapping</label>
          <div className="space-y-2 mt-2">
            {Object.entries(provider.configuration.attributeMapping || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono">{key}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(provider.configuration.groupMapping || {}).length > 0 && (
        <div>
          <label className="text-sm font-medium">Group Mapping</label>
          <div className="space-y-2 mt-2">
            {Object.entries(provider.configuration.groupMapping || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono">{key}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CreateSSOProviderFormProps {
  onSubmit: (data: Omit<SSOProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function CreateSSOProviderForm({ onSubmit, onCancel }: CreateSSOProviderFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'saml' as const,
    isActive: true,
    configuration: {
      entityId: '',
      ssoUrl: '',
      x509Certificate: '',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      attributeMapping: {} as Record<string, string>,
      groupMapping: {} as Record<string, string>,
      autoProvisioning: true,
      defaultRole: 'user',
      allowedDomains: [] as string[]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          >
            <option value="saml">SAML</option>
            <option value="oidc">OIDC</option>
            <option value="scim">SCIM</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Entity ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.configuration.entityId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              configuration: { ...prev.configuration, entityId: e.target.value }
            }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">SSO URL</label>
          <input
            type="url"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.configuration.ssoUrl}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              configuration: { ...prev.configuration, ssoUrl: e.target.value }
            }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">X.509 Certificate</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          value={formData.configuration.x509Certificate}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            configuration: { ...prev.configuration, x509Certificate: e.target.value }
          }))}
          placeholder="Paste the X.509 certificate here..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Role</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.configuration.defaultRole}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              configuration: { ...prev.configuration, defaultRole: e.target.value }
            }))}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Allowed Domains</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.configuration.allowedDomains.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              configuration: { 
                ...prev.configuration, 
                allowedDomains: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              }
            }))}
            placeholder="example.com, company.org"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoProvisioning"
          checked={formData.configuration.autoProvisioning}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            configuration: { ...prev.configuration, autoProvisioning: e.target.checked }
          }))}
        />
        <label htmlFor="autoProvisioning" className="text-sm font-medium">
          Enable auto-provisioning
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || !formData.configuration.entityId || !formData.configuration.ssoUrl}>
          Create Provider
        </Button>
      </div>
    </form>
  );
}
