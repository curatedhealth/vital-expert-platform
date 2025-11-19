'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { WorkflowBuilder } from '@/components/langgraph-gui/WorkflowBuilder';
import { PageHeader } from '@/components/page-header';

/**
 * Ask Panel v1 Page
 * Visual workflow builder for creating and executing AI-powered panel discussions
 * Integrated into VITAL dashboard layout
 */
export default function AskPanelV1Page() {
  return (
    <div className="flex h-full flex-col min-h-0 overflow-hidden">
      <PageHeader
        icon={Sparkles}
        title="Ask Panel v1"
        description="Visual workflow builder for creating and executing AI-powered panel discussions"
      />
      <div className="flex-1 overflow-hidden min-h-0">
        <WorkflowBuilder
          apiBaseUrl="/api/langgraph-gui"
          embedded={true}
          className="h-full"
        />
      </div>
    </div>
  );
}

