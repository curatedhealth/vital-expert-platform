'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, RefreshCw, AlertTriangle } from 'lucide-react';

const testUsers = [
  {
    email: 'hicham.naim@curated.health',
    role: 'super_admin',
    name: 'Hicham Naim',
    description: 'Super Administrator - Full system access'
  },
  {
    email: 'hn@vitalexpert.com',
    role: 'admin',
    name: 'HN Admin',
    description: 'Administrator - Most admin functions'
  },
  {
    email: 'demo@vitalexpert.com',
    role: 'user',
    name: 'Demo User',
    description: 'Regular user - Limited access'
  },
  {
    email: 'test@vitalexpert.com',
    role: 'user',
    name: 'Test User',
    description: 'Test user - Basic permissions'
  }
];

export default async function DevUserSwitcher() {
  const [selectedUser, setSelectedUser] = useState('hn@vitalexpert.com');
  const [isSwitching, setIsSwitching] = useState(false);

  const switchUser = async (userEmail: string) => {
    setIsSwitching(true);
    
    // In a real implementation, you would update the auth context
    // For development, we'll just show a message
    setTimeout(() => {
      alert(`Switched to ${userEmail}. In development mode, this would update the mock user context.`);
      setIsSwitching(false);
    }, 1000);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Development User Switcher</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This is a development tool for testing different user roles. 
          In production, users would authenticate normally through Supabase.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Switch User Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testUsers.map((user) => (
              <div
                key={user.email}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUser === user.email
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedUser(user.email)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{user.name}</h3>
                  <Badge 
                    variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}
                  >
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <p className="text-xs text-gray-500">{user.description}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => switchUser(selectedUser)}
              disabled={isSwitching}
              className="flex-1"
            >
              {isSwitching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                'Switch to Selected User'
              )}
            </Button>
            <Button onClick={refreshPage} variant="outline">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current User Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Selected User:</strong> {selectedUser}</p>
            <p><strong>Role:</strong> {testUsers.find(u => u.email === selectedUser)?.role}</p>
            <p><strong>Permissions:</strong> Based on role assignment in RBAC system</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. Test Different Roles:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Switch to <strong>super_admin</strong> to test full system access</li>
              <li>• Switch to <strong>admin</strong> to test standard admin functions</li>
              <li>• Switch to <strong>user</strong> to test restricted access</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Test RBAC Functions:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Go to <strong>RBAC Testing</strong> page to test permissions</li>
              <li>• Test permission functions with different users</li>
              <li>• Verify role-based access restrictions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Test Admin Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Navigate to different admin sections</li>
              <li>• Verify access based on current role</li>
              <li>• Check audit logs for security events</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
