'use client';

import { useState } from 'react';
import { SystemSettingsService, SystemAnnouncement } from '@/services/system-settings.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  AlertTriangle,
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface AnnouncementManagerProps {
  announcements: SystemAnnouncement[];
  onAnnouncementUpdate: (announcement: SystemAnnouncement) => void;
  onAnnouncementCreate: (announcement: SystemAnnouncement) => void;
  onAnnouncementDelete: (announcementId: string) => void;
  isSuperAdmin: boolean;
}

export default function AnnouncementManager({
  announcements,
  onAnnouncementUpdate,
  onAnnouncementCreate,
  onAnnouncementDelete,
  isSuperAdmin
}: AnnouncementManagerProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  const systemSettingsService = new SystemSettingsService();

  const getTypeBadge = (type: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      critical: 'destructive',
      maintenance: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, startTime: string, endTime?: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < start) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (end && now > end) {
      return <Badge variant="secondary">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const handleToggleAnnouncement = async (announcementId: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAnnouncement = await systemSettingsService.toggleAnnouncement(announcementId, isActive);
      onAnnouncementUpdate(updatedAnnouncement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (announcementData: Omit<SystemAnnouncement, 'id' | 'created_at' | 'created_by'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newAnnouncement = await systemSettingsService.createSystemAnnouncement(announcementData);
      onAnnouncementCreate(newAnnouncement);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (announcementId: string, updates: Partial<SystemAnnouncement>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAnnouncement = await systemSettingsService.updateSystemAnnouncement(announcementId, updates);
      onAnnouncementUpdate(updatedAnnouncement);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await systemSettingsService.deleteSystemAnnouncement(announcementId);
      onAnnouncementDelete(announcementId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  // Filter announcements based on search, type, and active status
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && announcement.is_active) ||
                         (filterActive === 'inactive' && !announcement.is_active);
    return matchesSearch && matchesType && matchesActive;
  });

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
          <h2 className="text-lg font-medium text-gray-900">System Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Manage system-wide announcements and notifications
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create System Announcement</DialogTitle>
                <DialogDescription>
                  Create a new system-wide announcement
                </DialogDescription>
              </DialogHeader>
              <CreateAnnouncementForm
                onSubmit={handleCreateAnnouncement}
                onCancel={() => setIsCreateDialogOpen(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterActive !== 'all'
                ? 'No announcements match your filters.' 
                : 'No announcements found. Create your first announcement to get started.'
              }
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Roles</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{announcement.title}</div>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {announcement.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(announcement.type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(announcement.is_active, announcement.start_time, announcement.end_time)}
                          {isSuperAdmin && (
                            <Switch
                              checked={announcement.is_active}
                              onCheckedChange={(isActive) => handleToggleAnnouncement(announcement.id, isActive)}
                              disabled={loading}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {announcement.target_roles.length > 0 
                            ? announcement.target_roles.join(', ')
                            : 'All roles'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(announcement.start_time), 'MMM dd, HH:mm')}
                          </div>
                          {announcement.end_time && (
                            <div className="text-xs text-muted-foreground">
                              Until: {format(new Date(announcement.end_time), 'MMM dd, HH:mm')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAnnouncement(announcement)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Megaphone className="h-5 w-5" />
                                  {announcement.title}
                                </DialogTitle>
                                <DialogDescription>
                                  System announcement details
                                </DialogDescription>
                              </DialogHeader>
                              <AnnouncementDetails announcement={announcement} />
                            </DialogContent>
                          </Dialog>

                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAnnouncement(announcement);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="text-red-600 hover:text-red-700"
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

      {/* Edit Dialog */}
      {selectedAnnouncement && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>
                Update announcement settings and content
              </DialogDescription>
            </DialogHeader>
            <EditAnnouncementForm
              announcement={selectedAnnouncement}
              onSubmit={(updates) => handleUpdateAnnouncement(selectedAnnouncement.id, updates)}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Announcement Form Component
interface CreateAnnouncementFormProps {
  onSubmit: (data: Omit<SystemAnnouncement, 'id' | 'created_at' | 'created_by'>) => void;
  onCancel: () => void;
  loading: boolean;
}

function CreateAnnouncementForm({ onSubmit, onCancel, loading }: CreateAnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    is_active: true,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    target_roles: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="Enter announcement title..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
          placeholder="Enter announcement message..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time (Optional)</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_roles">Target Roles (Optional)</Label>
        <Input
          id="target_roles"
          value={formData.target_roles.join(', ')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            target_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          placeholder="user, admin, super_admin (leave empty for all roles)"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of roles. Leave empty to target all roles.
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.title || !formData.message}>
          {loading ? 'Creating...' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  );
}

// Edit Announcement Form Component
interface EditAnnouncementFormProps {
  announcement: SystemAnnouncement;
  onSubmit: (updates: Partial<SystemAnnouncement>) => void;
  onCancel: () => void;
  loading: boolean;
}

function EditAnnouncementForm({ announcement, onSubmit, onCancel, loading }: EditAnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement.title,
    message: announcement.message,
    type: announcement.type,
    is_active: announcement.is_active,
    start_time: new Date(announcement.start_time).toISOString().slice(0, 16),
    end_time: announcement.end_time ? new Date(announcement.end_time).toISOString().slice(0, 16) : '',
    target_roles: announcement.target_roles
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time (Optional)</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_roles">Target Roles</Label>
        <Input
          id="target_roles"
          value={formData.target_roles.join(', ')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            target_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          placeholder="user, admin, super_admin"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Announcement'}
        </Button>
      </div>
    </form>
  );
}

// Announcement Details Component
interface AnnouncementDetailsProps {
  announcement: SystemAnnouncement;
}

function AnnouncementDetails({ announcement }: AnnouncementDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <p className="text-sm text-muted-foreground capitalize">{announcement.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {announcement.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Start Time</label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(announcement.start_time), 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">End Time</label>
          <p className="text-sm text-muted-foreground">
            {announcement.end_time ? format(new Date(announcement.end_time), 'PPpp') : 'No end time'}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Message</label>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
          {announcement.message}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Target Roles</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {announcement.target_roles.length > 0 ? (
            announcement.target_roles.map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">All roles</Badge>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Created</label>
        <p className="text-sm text-muted-foreground">
          {format(new Date(announcement.created_at), 'PPpp')}
        </p>
      </div>
    </div>
  );
}
