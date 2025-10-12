'use client';

import { Loader2, Save, User, Building, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/supabase-auth-context';


export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    institution: '',
    specialty: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      setFormData({
        full_name: userProfile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        role: userProfile.role || 'user',
        institution: userProfile.institution || user.user_metadata?.institution || '',
        specialty: userProfile.specialty || user.user_metadata?.specialty || '',
        bio: userProfile.bio || ''
      });
    }
  }, [user, userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          institution: formData.institution,
          specialty: formData.specialty
        }
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        alert('Failed to update profile');
        return;
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          institution: formData.institution,
          specialty: formData.specialty,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        alert('Failed to update profile');
        return;
      }

      alert('Profile updated successfully!');
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Your professional details and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: string) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="physician">Physician</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('institution', e.target.value)}
                  placeholder="Your organization or institution"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('specialty', e.target.value)}
                placeholder="Your area of expertise or specialty"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>
              Manage your account security and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-gray-500">
                  Status: <span className="text-green-600 font-medium">Active</span>
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
