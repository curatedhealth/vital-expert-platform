'use client';

// Prevent pre-rendering for client-side only page
export const dynamic = 'force-dynamic';

// import { KnowledgeAnalyticsDashboard } from '@/features/knowledge/components/knowledge-analytics-dashboard';

export default function KnowledgeAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your knowledge base usage and performance metrics.
        </p>
      </div>

      {/* <KnowledgeAnalyticsDashboard /> */}
      <div className="p-8 text-center text-gray-500">Knowledge Analytics Dashboard - Coming Soon</div>
    </div>
  );
}