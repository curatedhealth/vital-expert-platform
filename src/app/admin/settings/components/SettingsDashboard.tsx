'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Flag, Bell, Shield, Database, Users } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface SettingsDashboardProps {
  initialFeatureFlags: FeatureFlag[];
  initialSystemSettings: SystemSetting[];
  initialAnnouncements: Announcement[];
  isSuperAdmin: boolean;
}

export default function SettingsDashboard({
  initialFeatureFlags,
  initialSystemSettings,
  initialAnnouncements,
  isSuperAdmin
}: SettingsDashboardProps) {
  const [featureFlags, setFeatureFlags] = useState(initialFeatureFlags);
  const [systemSettings, setSystemSettings] = useState(initialSystemSettings);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isLoading, setIsLoading] = useState(false);

  const handleFeatureFlagToggle = async (flagId: string, enabled: boolean) => {
    if (!isSuperAdmin) {
      toast.error('Super admin privileges required');
      return;
    }

    setIsLoading(true);
    try {
      // Update local state
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.id === flagId ? { ...flag, enabled } : flag
        )
      );
      
      // Here you would make an API call to update the flag
      toast.success(`Feature flag ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update feature flag');
      // Revert local state
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.id === flagId ? { ...flag, enabled: !enabled } : flag
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemSettingUpdate = async (settingId: string, value: string) => {
    if (!isSuperAdmin) {
      toast.error('Super admin privileges required');
      return;
    }

    setIsLoading(true);
    try {
      // Update local state
      setSystemSettings(prev => 
        prev.map(setting => 
          setting.id === settingId ? { ...setting, value } : setting
        )
      );
      
      // Here you would make an API call to update the setting
      toast.success('System setting updated');
    } catch (error) {
      toast.error('Failed to update system setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnouncementToggle = async (announcementId: string, active: boolean) => {
    if (!isSuperAdmin) {
      toast.error('Super admin privileges required');
      return;
    }

    setIsLoading(true);
    try {
      // Update local state
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId ? { ...announcement, active } : announcement
        )
      );
      
      // Here you would make an API call to update the announcement
      toast.success(`Announcement ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnouncementBadgeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tabs defaultValue="features" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="features" className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Feature Flags
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          System Settings
        </TabsTrigger>
        <TabsTrigger value="announcements" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Announcements
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>

      {/* Feature Flags Tab */}
      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Enable or disable features across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{flag.name}</h3>
                    <Badge variant="outline">{flag.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{flag.description}</p>
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(enabled) => handleFeatureFlagToggle(flag.id, enabled)}
                  disabled={!isSuperAdmin || isLoading}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* System Settings Tab */}
      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure global system parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <Label htmlFor={setting.id}>{setting.key}</Label>
                <Input
                  id={setting.id}
                  value={setting.value}
                  onChange={(e) => handleSystemSettingUpdate(setting.id, e.target.value)}
                  disabled={!isSuperAdmin || isLoading}
                />
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Announcements Tab */}
      <TabsContent value="announcements" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Announcements
            </CardTitle>
            <CardDescription>
              Manage system-wide announcements and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <Badge className={getAnnouncementBadgeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{announcement.message}</p>
                  </div>
                  <Switch
                    checked={announcement.active}
                    onCheckedChange={(active) => handleAnnouncementToggle(announcement.id, active)}
                    disabled={!isSuperAdmin || isLoading}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                Configure authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input defaultValue="60" disabled={!isSuperAdmin} />
              </div>
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input defaultValue="5" disabled={!isSuperAdmin} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
              <CardDescription>
                Database connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Connection Pool Size</Label>
                <Input defaultValue="10" disabled={!isSuperAdmin} />
              </div>
              <div className="space-y-2">
                <Label>Query Timeout (seconds)</Label>
                <Input defaultValue="30" disabled={!isSuperAdmin} />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}