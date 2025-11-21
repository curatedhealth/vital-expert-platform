'use client';

import React from 'react';
import { AskExpertProvider, useAskExpert } from '@/contexts/ask-expert-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AskExpertSidebar } from './ask-expert-sidebar';

/**
 * Internal component that uses the context
 */
function AskExpertSidebarContent() {
  const { agents, selectedAgents, setSelectedAgents } = useAskExpert();

  return (
    <AskExpertSidebar
      agents={agents}
      selectedAgents={selectedAgents}
      onAgentSelect={setSelectedAgents}
    />
  );
}

/**
 * Wrapper that provides both the context and SidebarProvider
 */
export function AskExpertSidebarWrapper() {
  return (
    <AskExpertProvider>
      <SidebarProvider>
        <AskExpertSidebarContent />
      </SidebarProvider>
    </AskExpertProvider>
  );
}
