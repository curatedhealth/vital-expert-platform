'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  MessageSquare,
  Webhook,
  Smartphone,
  RefreshCw,
  CheckCircle,
  Clock,
  TestTube
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function NotificationChannels() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as const,
    config: {} as Record<string, any>,
    isActive: true,
    createdBy: 'admin'
  });

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/admin/alerts/channels');
      if (!response.ok) throw new Error('Failed to fetch notification channels');
      
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching notification channels:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchChannels();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateChannel = async () => {
    try {
      const response = await fetch('/api/admin/alerts/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create notification channel');

      await fetchChannels();
      setShowCreateDialog(false);
      setFormData({
        name: '',
        type: 'email',
        config: {},
        isActive: true,
        createdBy: 'admin'
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  };

  const handleUpdateChannel = async (id: string, updates: Partial<NotificationChannel>) => {
    try {
      const response = await fetch(`/api/admin/alerts/channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update notification channel');

      await fetchChannels();
      setEditingChannel(null);
    } catch (error) {
      console.error('Error updating notification channel:', error);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification channel?')) return;

    try {
      const response = await fetch(`/api/admin/alerts/channels/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete notification channel');

      await fetchChannels();
    } catch (error) {
      console.error('Error deleting notification channel:', error);
    }
  };

  const handleTestChannel = async (id: string) => {
    setTestingChannel(id);
    try {
      const response = await fetch(`/api/admin/alerts/channels/${id}/test`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to test notification channel');

      alert('Test notification sent successfully!');
    } catch (error) {
      console.error('Error testing notification channel:', error);
      alert('Failed to send test notification');
    } finally {
      setTestingChannel(null);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      slack: MessageSquare,
      webhook: Webhook,
      sms: Smartphone
    };
    const Icon = icons[type as keyof typeof icons] || Mail;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      slack: 'bg-purple-100 text-purple-800',
      webhook: 'bg-green-100 text-green-800',
      sms: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    );
  };

  const getConfigFields = (type: string) => {
    switch (type) {
      case 'email':
        return [
          { key: 'email', label: 'Email Address', type: 'email' },
          { key: 'subject', label: 'Subject Template', type: 'text' }
        ];
      case 'slack':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'url' },
          { key: 'channel', label: 'Channel', type: 'text' },
          { key: 'username', label: 'Username', type: 'text' }
        ];
      case 'webhook':
        return [
          { key: 'url', label: 'Webhook URL', type: 'url' },
          { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH'] },
          { key: 'headers', label: 'Headers (JSON)', type: 'textarea' }
        ];
      case 'sms':
        return [
          { key: 'phoneNumber', label: 'Phone Number', type: 'tel' },
          { key: 'provider', label: 'Provider', type: 'select', options: ['twilio', 'aws_sns'] },
          { key: 'apiKey', label: 'API Key', type: 'password' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading notification channels...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Channels</h2>
          <p className="text-gray-600">Configure notification channels for alerts</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Notification Channel</DialogTitle>
              <DialogDescription>
                Configure a new notification channel for alert delivery
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Admin Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Channel Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any, config: {} })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getConfigFields(formData.type).map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : 'space-y-2'}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === 'select' ? (
                    <Select
                      value={formData.config[field.key] || ''}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        config: { ...formData.config, [field.key]: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={formData.config[field.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, [field.key]: e.target.value }
                      })}
                      placeholder={`Enter ${field.label}`}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={formData.config[field.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, [field.key]: e.target.value }
                      })}
                      placeholder={`Enter ${field.label}`}
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChannel}>Create Channel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification Channels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Configure channels for delivering alert notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium">{channel.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(channel.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(channel.type)}
                        {channel.type}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      {Object.entries(channel.config).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span className="font-mono text-xs">
                            {typeof value === 'string' && value.length > 50 
                              ? `${value.substring(0, 50)}...` 
                              : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(channel.isActive)}
                      <span className="text-sm">
                        {channel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(channel.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChannel(channel.id)}
                        disabled={testingChannel === channel.id}
                      >
                        {testingChannel === channel.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingChannel(channel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
