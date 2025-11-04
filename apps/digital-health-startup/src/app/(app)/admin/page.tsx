/**
 * Admin Dashboard
 * Main admin page with navigation to different admin views
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import all dashboard components to prevent hydration issues
const OverviewDashboard = dynamic(
  () => import('@/components/admin/OverviewDashboard').then(mod => ({ default: mod.OverviewDashboard })),
  { ssr: false }
);

const UserManagement = dynamic(
  () => import('@/components/admin/UserManagement').then(mod => ({ default: mod.UserManagement })),
  { ssr: false }
);

const AgentManagement = dynamic(
  () => import('@/components/admin/AgentManagement').then(mod => ({ default: mod.AgentManagement })),
  { ssr: false }
);

const PromptManagement = dynamic(
  () => import('@/components/admin/PromptManagement').then(mod => ({ default: mod.PromptManagement })),
  { ssr: false }
);

const ToolManagement = dynamic(
  () => import('@/components/admin/ToolManagement').then(mod => ({ default: mod.ToolManagement })),
  { ssr: false }
);

const AgentAnalyticsDashboard = dynamic(
  () => import('@/components/admin/AgentAnalyticsDashboard').then(mod => ({ default: mod.AgentAnalyticsDashboard })),
  { ssr: false }
);

const OrganizationManagement = dynamic(
  () => import('@/components/admin/OrganizationManagement').then(mod => ({ default: mod.OrganizationManagement })),
  { ssr: false }
);

const FunctionsManagement = dynamic(
  () => import('@/components/admin/FunctionsManagement').then(mod => ({ default: mod.FunctionsManagement })),
  { ssr: false }
);

const RolesManagement = dynamic(
  () => import('@/components/admin/RolesManagement').then(mod => ({ default: mod.RolesManagement })),
  { ssr: false }
);

const PersonasManagement = dynamic(
  () => import('@/components/admin/PersonasManagement').then(mod => ({ default: mod.PersonasManagement })),
  { ssr: false }
);

const FeedbackDashboard = dynamic(
  () => import('@/app/(app)/admin/feedback-dashboard/page'),
  { ssr: false }
);

const UsageAnalyticsDashboard = dynamic(
  () => import('@/components/llm/UsageAnalyticsDashboard').then(mod => ({ default: mod.UsageAnalyticsDashboard })),
  { ssr: false }
);

const OpenAIUsageDashboard = dynamic(
  () => import('@/components/llm/OpenAIUsageDashboard').then(mod => ({ default: mod.OpenAIUsageDashboard })),
  { ssr: false }
);

const LLMProviderDashboard = dynamic(
  () => import('@/components/llm/LLMProviderDashboard').then(mod => ({ default: mod.LLMProviderDashboard })),
  { ssr: false }
);

const MetricsDashboard = dynamic(
  () => import('@/features/chat/components/metrics-dashboard').then(mod => ({ default: mod.MetricsDashboard })),
  { ssr: false }
);

const ExecutiveDashboard = dynamic(
  () => import('@/components/admin/ExecutiveDashboard'),
  { ssr: false }
);

function LoadingView() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If no view specified, redirect to overview (new default)
  useEffect(() => {
    if (mounted && !view) {
      router.replace('/admin?view=overview');
    }
  }, [view, router, mounted]);

  // Don't render anything while redirecting or not mounted
  if (!mounted || !view) {
    return <LoadingView />;
  }

  // Render appropriate view based on query param
  const renderView = () => {
    switch (view) {
      case 'executive':
        return <ExecutiveDashboard />;
      
      case 'overview':
        return (
          <div className="container mx-auto py-8">
            <OverviewDashboard />
          </div>
        );
      
      case 'users':
        return (
          <div className="container mx-auto py-8">
            <UserManagement />
          </div>
        );
      
      case 'agents':
        return (
          <div className="container mx-auto py-8">
            <AgentManagement />
          </div>
        );
      
      case 'prompts':
        return (
          <div className="container mx-auto py-8">
            <PromptManagement />
          </div>
        );
      
      case 'tools':
        return (
          <div className="container mx-auto py-8">
            <ToolManagement />
          </div>
        );
      
      case 'agent-analytics':
        return (
          <div className="container mx-auto py-8">
            <AgentAnalyticsDashboard />
          </div>
        );
      
      case 'feedback-analytics':
        return <FeedbackDashboard />;
      
      case 'usage-analytics':
        return (
          <div className="container mx-auto py-8">
            <UsageAnalyticsDashboard />
          </div>
        );
      
      case 'llm-cost-tracking':
        return (
          <div className="container mx-auto py-8">
            <OpenAIUsageDashboard />
          </div>
        );
      
      case 'llm-providers':
        return (
          <div className="container mx-auto py-8">
            <LLMProviderDashboard />
          </div>
        );
      
      case 'system-monitoring':
        return (
          <div className="container mx-auto py-8">
            <MetricsDashboard />
          </div>
        );
      
      case 'organizations':
        return (
          <div className="container mx-auto py-8">
            <OrganizationManagement />
          </div>
        );
      
      case 'functions':
        return (
          <div className="container mx-auto py-8">
            <FunctionsManagement />
          </div>
        );
      
      case 'roles':
        return (
          <div className="container mx-auto py-8">
            <RolesManagement />
          </div>
        );
      
      case 'personas':
        return (
          <div className="container mx-auto py-8">
            <PersonasManagement />
          </div>
        );
      
      default:
        // Unknown view - show overview
        return (
          <div className="container mx-auto py-8">
            <OverviewDashboard />
          </div>
        );
    }
  };

  return renderView();
}

