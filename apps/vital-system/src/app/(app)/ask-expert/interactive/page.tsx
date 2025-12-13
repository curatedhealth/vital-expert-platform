'use client';

/**
 * VITAL Platform - Interactive Expert Chat
 *
 * Mode 1: Manual expert selection (user picks) - ?mode=manual
 * Mode 2: Auto expert selection (Fusion Intelligence) - ?mode=auto
 *
 * Query params:
 * - mode: 'manual' | 'auto'
 * - conversationId: UUID to load existing conversation
 *
 * Updated: December 12, 2025 - Added conversation loading support
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { InteractiveView, type InteractiveMode } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

function InteractiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get('mode');
  const conversationId = searchParams.get('conversationId');

  // State for loaded conversation
  const [loadedConversation, setLoadedConversation] = useState<ConversationData | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Map URL param to InteractiveMode type
  const mode: InteractiveMode = modeParam === 'auto' ? 'mode2' : 'mode1';

  // Load conversation data when conversationId is present
  useEffect(() => {
    if (!conversationId) {
      setLoadedConversation(null);
      setLoadError(null);
      return;
    }

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/ask-expert?conversationId=${conversationId}`);
        if (!response.ok) {
          throw new Error('Failed to load conversation');
        }
        const data = await response.json();
        if (data.success && data.conversation) {
          setLoadedConversation(data.conversation);
        } else {
          throw new Error('Conversation not found');
        }
      } catch (error) {
        console.error('[InteractiveContent] Error loading conversation:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load conversation');
      } finally {
        setIsLoadingConversation(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Handle mode change by updating URL
  const handleModeChange = useCallback((newMode: InteractiveMode) => {
    const param = newMode === 'mode2' ? 'auto' : 'manual';
    const url = conversationId
      ? `/ask-expert/interactive?mode=${param}&conversationId=${conversationId}`
      : `/ask-expert/interactive?mode=${param}`;
    router.push(url);
  }, [router, conversationId]);

  // Show loading state while loading conversation
  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Show error state if conversation failed to load
  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <button
            onClick={() => router.push('/ask-expert/interactive?mode=manual')}
            className="text-sm text-primary hover:underline"
          >
            Start a new conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <InteractiveView
        mode={mode}
        tenantId="00000000-0000-0000-0000-000000000001"
        onModeChange={handleModeChange}
        initialConversation={loadedConversation || undefined}
        sessionId={conversationId || undefined}
        initialExpertId={loadedConversation?.agent?.id || loadedConversation?.metadata?.agent_id}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Interactive Chat...</p>
      </div>
    </div>
  );
}

export default function InteractiveExpertPage() {
  return (
    <ErrorBoundary componentName="InteractiveExpertPage">
      <Suspense fallback={<LoadingState />}>
        <InteractiveContent />
      </Suspense>
    </ErrorBoundary>
  );
}
