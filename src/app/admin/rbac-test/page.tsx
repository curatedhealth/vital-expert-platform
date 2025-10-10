'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { useAuth } from '@/lib/auth/supabase-auth-context';

interface PermissionTest {
  userEmail: string;
  scope: string;
  action: string;
  expected: boolean;
  result?: boolean;
  error?: string;
}

interface RoleTest {
  userEmail: string;
  expectedRole: string;
  actualRole?: string;
  isAdmin?: boolean;
  error?: string;
}

export default function RBACTestPage() {
  const { user, userProfile } = useAuth();
  const [permissionTests, setPermissionTests] = useState<PermissionTest[]>([]);
  const [roleTests, setRoleTests] = useState<RoleTest[]>([]);
  const [testUser, setTestUser] = useState('hn@vitalexpert.com');
  const [testScope, setTestScope] = useState('agents');
  const [testAction, setTestAction] = useState('read');
  const [loading, setLoading] = useState(false);

  const scopes = [
    'agents', 'workflows', 'analytics', 'system_settings', 
    'user_management', 'audit_logs', 'llm_providers'
  ];

  const actions = ['create', 'read', 'update', 'delete', 'execute', 'manage'];

  const testUsers = [
    { email: 'hn@vitalexpert.com', role: 'admin' },
    { email: 'hicham.naim@curated.health', role: 'super_admin' },
    { email: 'demo@vitalexpert.com', role: 'user' },
    { email: 'test@vitalexpert.com', role: 'user' }
  ];

  const testPermission = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: testUser,
          scope: testScope,
          action: testAction
        })
      });

      const result = await response.json();
      
      const newTest: PermissionTest = {
        userEmail: testUser,
        scope: testScope,
        action: testAction,
        expected: testUsers.find(u => u.email === testUser)?.role === 'admin' || testUsers.find(u => u.email === testUser)?.role === 'super_admin',
        result: result.success,
        error: result.error
      };

      setPermissionTests(prev => [newTest, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Permission test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUserRole = async (userEmail: string) => {
    try {
      const response = await fetch('/api/admin/test-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });

      const result = await response.json();
      
      const newTest: RoleTest = {
        userEmail,
        expectedRole: testUsers.find(u => u.email === userEmail)?.role || 'user',
        actualRole: result.role,
        isAdmin: result.isAdmin,
        error: result.error
      };

      setRoleTests(prev => [newTest, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Role test failed:', error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    
    // Test all user roles
    for (const testUser of testUsers) {
      await testUserRole(testUser.email);
    }

    // Test various permission combinations
    const testCases = [
      { user: 'hn@vitalexpert.com', scope: 'agents', action: 'read' },
      { user: 'hn@vitalexpert.com', scope: 'user_management', action: 'delete' },
      { user: 'demo@vitalexpert.com', scope: 'agents', action: 'read' },
      { user: 'demo@vitalexpert.com', scope: 'user_management', action: 'delete' },
      { user: 'hicham.naim@curated.health', scope: 'system_settings', action: 'manage' }
    ];

    for (const testCase of testCases) {
      setTestUser(testCase.user);
      setTestScope(testCase.scope);
      setTestAction(testCase.action);
      await testPermission();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TestTube className="h-6 w-6" />
        <h1 className="text-2xl font-bold">RBAC System Testing</h1>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not authenticated'}</p>
            <p><strong>Role:</strong> <Badge variant="outline">{userProfile?.role || 'Unknown'}</Badge></p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Permission Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="testUser">User Email</Label>
              <Select value={testUser} onValueChange={setTestUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testUsers.map(user => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.email} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="testScope">Scope</Label>
              <Select value={testScope} onValueChange={setTestScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopes.map(scope => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="testAction">Action</Label>
              <Select value={testAction} onValueChange={setTestAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={testPermission} disabled={loading} className="w-full">
                Test Permission
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={loading} variant="outline">
              Run All Tests
            </Button>
            <Button onClick={() => setPermissionTests([])} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permission Test Results */}
      {permissionTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Permission Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {permissionTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {test.result === test.expected ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {test.userEmail} - {test.scope}:{test.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expected: {test.expected ? 'Allowed' : 'Denied'}, 
                        Result: {test.result ? 'Allowed' : 'Denied'}
                      </p>
                      {test.error && (
                        <p className="text-sm text-red-500">Error: {test.error}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={test.result === test.expected ? 'default' : 'destructive'}>
                    {test.result === test.expected ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Test Results */}
      {roleTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roleTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {test.actualRole === test.expectedRole ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{test.userEmail}</p>
                      <p className="text-sm text-gray-500">
                        Expected: {test.expectedRole}, 
                        Actual: {test.actualRole || 'Unknown'}
                        {test.isAdmin !== undefined && `, Admin: ${test.isAdmin}`}
                      </p>
                      {test.error && (
                        <p className="text-sm text-red-500">Error: {test.error}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={test.actualRole === test.expectedRole ? 'default' : 'destructive'}>
                    {test.actualRole === test.expectedRole ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
