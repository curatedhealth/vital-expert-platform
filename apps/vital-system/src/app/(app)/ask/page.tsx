'use client';

/**
 * VITAL Ask Service - Main Page (/ask)
 *
 * Interactive expert consultation combining Mode 1 and Mode 2.
 * - Mode 1: Manual expert selection
 * - Mode 2: Automatic expert selection via Fusion Intelligence
 *
 * Uses the existing InteractiveView component from features/ask-expert
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { InteractiveView, type InteractiveMode } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Loading Component
// ============================================================================

function AskLoadingState() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Content
// ============================================================================

interface ConversationData {
  id: string;
  title: string;
  metadata?: {
    agent_id?: string;
    mode?: string;
  };
  context?: {
    messages?: Array<{
      role: string;
      content: string;
      timestamp?: string;
    }>;
  };
  agent?: {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

function AskContent({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get mode from URL params (default to 'auto' for Mode 2)
  const modeParam = searchParams.get('mode') || 'auto';
  const mode: InteractiveMode = modeParam === 'manual' ? 'mode1' : 'mode2';

  // Get conversation ID for loading existing conversations
  const conversationId = searchParams.get('conversationId');

  // State for loaded conversation
  const [loadedConversation, setLoadedConversation] = useState<ConversationData | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Load conversation if ID is provided
  useEffect(() => {
    if (!conversationId) {
      setLoadedConversation(null);
      return;
    }

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.conversation) {
            setLoadedConversation(data.conversation);
          }
        }
      } catch (error) {
        console.error('[AskPage] Error loading conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: 'manual' | 'auto') => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', newMode);
    router.push(url.pathname + url.search);
  }, [router]);

  if (isLoadingConversation) {
    return <AskLoadingState />;
  }

  return (
    <InteractiveView
      tenantId={tenantId}
      mode={mode}
      onModeChange={handleModeChange}
      loadedConversation={loadedConversation ? {
        id: loadedConversation.id,
        title: loadedConversation.title,
        messages: loadedConversation.context?.messages?.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
        })) || [],
        agent: loadedConversation.agent ? {
          id: loadedConversation.agent.id,
          name: loadedConversation.agent.display_name || loadedConversation.agent.name,
          description: loadedConversation.agent.description,
          avatar: loadedConversation.agent.avatar_url,
        } : undefined,
      } : undefined}
    />
  );
}

// ============================================================================
// Page with Tenant Context
// ============================================================================

function AskPageWithTenant() {
  const { tenantId, isLoading: tenantLoading } = useTenant();

  if (tenantLoading) {
    return <AskLoadingState />;
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No tenant configured</p>
      </div>
    );
  }

  return <AskContent tenantId={tenantId} />;
}

// ============================================================================
// Page Export with Suspense
// ============================================================================

export default function AskPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AskLoadingState />}>
        <AskPageWithTenant />
      </Suspense>
    </ErrorBoundary>
  );
}
