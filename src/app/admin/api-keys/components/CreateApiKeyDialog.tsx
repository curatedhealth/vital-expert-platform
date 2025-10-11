'use client';

import { Key, AlertTriangle, Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateKey: (data: { provider_id: string; key_name: string; api_key: string; expires_at?: string }) => Promise<{ id: string; key: string }>;
  providers: Array<{ id: string; name: string }>;
}

export default function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  onCreateKey,
  providers
}: CreateApiKeyDialogProps) {
  const [formData, setFormData] = useState({
    provider_id: '',
    key_name: '',
    api_key: '',
    expires_at: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<{ id: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await onCreateKey({
        provider_id: formData.provider_id,
        key_name: formData.key_name,
        api_key: formData.api_key,
        expires_at: formData.expires_at || undefined
      });
      
      setCreatedKey(result);
      setFormData({
        provider_id: '',
        key_name: '',
        api_key: '',
        expires_at: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleClose = () => {
    setCreatedKey(null);
    setError(null);
    setFormData({
      provider_id: '',
      key_name: '',
      api_key: '',
      expires_at: ''
    });
    onOpenChange(false);
  };

  if (createdKey) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Your API key has been created successfully. Copy it now as it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is the only time you'll see this API key. Make sure to copy and store it securely.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded font-mono text-sm break-all">
                  {createdKey.key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.key)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create API Key
          </DialogTitle>
          <DialogDescription>
            Create a new API key for LLM provider access.
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
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, provider_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_name">Key Name</Label>
            <Input
              id="key_name"
              placeholder="e.g., Production API Key"
              value={formData.key_name}
              onChange={(e) => setFormData(prev => ({ ...prev, key_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="Enter the API key"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Expires At (Optional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
            />
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
              disabled={isLoading || !formData.provider_id || !formData.key_name || !formData.api_key}
            >
              {isLoading ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
