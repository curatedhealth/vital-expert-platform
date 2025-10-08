/**
 * RAG Performance Admin Dashboard
 * Comprehensive monitoring and analytics for RAG system performance
 */

'use client';

import { RAGPerformanceDashboard } from '@/components/rag/RAGPerformanceDashboard';

export default function RAGPerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <RAGPerformanceDashboard />
    </div>
  );
}
