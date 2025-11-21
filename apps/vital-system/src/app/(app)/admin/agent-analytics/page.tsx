/**
 * Agent Analytics Page
 * Admin dashboard view for agent operations analytics
 */

'use client';

import { AgentAnalyticsDashboard } from '@/components/admin/AgentAnalyticsDashboard';

export default function AgentAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <AgentAnalyticsDashboard />
    </div>
  );
}

