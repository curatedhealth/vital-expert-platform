'use client';

import { KnowledgeAnalyticsDashboard } from '@/features/knowledge/components/knowledge-analytics-dashboard';

export default function KnowledgeAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your knowledge base usage and performance metrics.
        </p>
      </div>

      <KnowledgeAnalyticsDashboard />
    </div>
  );
}