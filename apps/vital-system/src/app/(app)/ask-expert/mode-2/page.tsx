'use client';

/**
 * VITAL Platform - Mode 2: Smart Copilot
 *
 * Redirects to /ask-expert/interactive?mode=auto
 *
 * Mode 2 = Mode 1 + Automatic Agent Selection
 * - Same UI as Mode 1 (InteractiveView)
 * - Backend uses FusionSelector/GraphRAG to auto-select best expert
 * - User types first message → Backend auto-selects → Conversation starts
 *
 * Updated: December 15, 2025 - Unified with Mode 1 via shared interactive route
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Mode2SmartChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified interactive route with auto mode
    router.replace('/ask-expert/interactive?mode=auto');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-sm text-stone-500">Loading Smart Copilot...</p>
      </div>
    </div>
  );
}
