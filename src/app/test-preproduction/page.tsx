'use client';

import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestPreProductionPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Environment Variables', status: 'pending', message: 'Checking environment configuration...' },
    { name: 'Supabase Connection', status: 'pending', message: 'Testing database connection...' },
    { name: 'Authentication System', status: 'pending', message: 'Verifying auth setup...' },
    { name: 'Admin Access', status: 'pending', message: 'Testing admin dashboard access...' },
    { name: 'API Endpoints', status: 'pending', message: 'Testing API functionality...' },
    { name: 'RBAC System', status: 'pending', message: 'Testing role-based access control...' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: Environment Variables
    try {
      const envTest = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV
      };
      
      const allPresent = Object.values(envTest).every(Boolean);
      updateTest(0, allPresent ? 'success' : 'error', 
        allPresent ? 'All environment variables present' : 'Missing environment variables',
        envTest
      );
    } catch (error) {
      updateTest(0, 'error', 'Failed to check environment variables', error);
    }

    // Test 2: Supabase Connection
    try {
      const response = await fetch('/api/debug/user-profile');
      const data = await response.json();
      
      if (response.ok || data.error === 'Not authenticated') {
        updateTest(1, 'success', 'Supabase connection working (auth required)', data);
      } else {
        updateTest(1, 'error', 'Supabase connection failed', data);
      }
    } catch (error) {
      updateTest(1, 'error', 'Failed to connect to Supabase', error);
    }

    // Test 3: Authentication System
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (response.ok) {
        updateTest(2, 'success', 'Authentication system operational', data);
      } else {
        updateTest(2, 'error', 'Authentication system error', data);
      }
    } catch (error) {
      updateTest(2, 'error', 'Authentication system not responding', error);
    }

    // Test 4: Admin Access
    try {
      const response = await fetch('/admin', { method: 'HEAD' });
      
      if (response.status === 200 || response.status === 307) {
        updateTest(3, 'success', 'Admin dashboard accessible', { status: response.status });
      } else {
        updateTest(3, 'error', 'Admin dashboard not accessible', { status: response.status });
      }
    } catch (error) {
      updateTest(3, 'error', 'Failed to access admin dashboard', error);
    }

    // Test 5: API Endpoints
    try {
      const endpoints = [
        '/api/agents-crud',
        '/api/organizational-structure',
        '/api/llm/available-models'
      ];
      
      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetch(endpoint))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      updateTest(4, successCount > 0 ? 'success' : 'error', 
        `${successCount}/${endpoints.length} API endpoints working`,
        { results: results.map(r => r.status === 'fulfilled' ? r.value.status : 'failed') }
      );
    } catch (error) {
      updateTest(4, 'error', 'API endpoints test failed', error);
    }

    // Test 6: RBAC System
    try {
      const response = await fetch('/api/admin/test-role');
      const data = await response.json();
      
      if (response.ok) {
        updateTest(5, 'success', 'RBAC system operational', data);
      } else {
        updateTest(5, 'error', 'RBAC system error', data);
      }
    } catch (error) {
      updateTest(5, 'error', 'RBAC system not responding', error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pre-Production Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of all platform functionality
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Run comprehensive tests to verify all platform functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                {test.details && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Access key platform features for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href="/login">Login Page</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin">Admin Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
