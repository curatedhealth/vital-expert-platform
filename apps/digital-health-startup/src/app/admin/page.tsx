/**
 * Admin Dashboard
 * Main admin page with navigation to different admin views
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AgentAnalyticsDashboard } from '@/components/admin/AgentAnalyticsDashboard';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  // If no view specified, redirect to agent analytics (new default)
  useEffect(() => {
    if (!view) {
      router.replace('/admin?view=agent-analytics');
    }
  }, [view, router]);

  if (view === 'agent-analytics') {
    return (
      <div className="container mx-auto py-8">
        <AgentAnalyticsDashboard />
      </div>
    );
  }

  // Default: redirect to LLM management (legacy)
  useEffect(() => {
    if (view !== 'agent-analytics') {
      router.replace('/dashboard/llm-management?view=admin');
    }
  }, [view, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}
