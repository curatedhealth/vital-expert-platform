'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Database,
  Key,
  Server,
  RefreshCw
} from 'lucide-react';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';

interface DiagnosticResult {
  timestamp: string;
  status: 'checking' | 'healthy' | 'degraded' | 'failed' | 'error';
  tests: Record<string, {
    status: 'checking' | 'passed' | 'failed';
    details: any;
  }>;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  summary?: {
    total_tests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export default function SupabaseDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/supabase');
      const data = await response.json();
      setDiagnostics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800 border-green-200',
      passed: 'bg-green-100 text-green-800 border-green-200',
      degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      checking: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              Supabase Connection Diagnostics
            </h1>
            <p className="text-neutral-600 mt-2">
              Comprehensive testing of your Supabase configuration and connectivity
            </p>
          </div>
          
          <Button onClick={runDiagnostics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Diagnostic Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Status */}
        {diagnostics && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Status</span>
                {getStatusBadge(diagnostics.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostics.summary && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-neutral-900">
                      {diagnostics.summary.total_tests}
                    </div>
                    <div className="text-sm text-neutral-600">Total Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {diagnostics.summary.passed}
                    </div>
                    <div className="text-sm text-neutral-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {diagnostics.summary.failed}
                    </div>
                    <div className="text-sm text-neutral-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {diagnostics.summary.warnings}
                    </div>
                    <div className="text-sm text-neutral-600">Warnings</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-xs text-neutral-500">
                Last run: {new Date(diagnostics.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {diagnostics && Object.entries(diagnostics.tests).map(([testName, test]) => (
          <Card key={testName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  {testName.replace(/_/g, ' ').toUpperCase()}
                </span>
                {getStatusBadge(test.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-neutral-50 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(test.details, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}

        {/* Errors */}
        {diagnostics && diagnostics.errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <XCircle className="w-5 h-5" />
                Errors ({diagnostics.errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnostics.errors.map((error, i) => (
                  <li key={i} className="text-red-700 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {diagnostics && diagnostics.warnings.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertTriangle className="w-5 h-5" />
                Warnings ({diagnostics.warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnostics.warnings.map((warning, i) => (
                  <li key={i} className="text-yellow-700 text-sm flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {diagnostics && diagnostics.recommendations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Server className="w-5 h-5" />
                Recommendations ({diagnostics.recommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {diagnostics.recommendations.map((rec, i) => (
                  <li key={i} className="text-blue-900 text-sm flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">{i + 1}.</span>
                    <span className="whitespace-pre-wrap">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Fix Guide */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Key className="w-5 h-5" />
              Quick Fix Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">1. Check Environment Variables</h4>
              <p className="text-purple-800 mb-2">
                Create or update <code className="bg-purple-100 px-2 py-1 rounded">apps/vital-system/.env.local</code>:
              </p>
              <pre className="bg-white p-3 rounded border border-purple-200 text-xs overflow-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-purple-900 mb-2">2. Restart Next.js</h4>
              <p className="text-purple-800">
                After updating .env.local, restart your development server.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-purple-900 mb-2">3. Check Database</h4>
              <p className="text-purple-800">
                Ensure your agents table exists and has data. Run migrations if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

