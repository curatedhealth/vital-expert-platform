'use client';

/**
 * VITAL Platform - Mode 1: Expert Chat (Interactive Manual)
 *
 * Redirects to /ask-expert/interactive?mode=manual
 *
 * Mode 1: Manual Expert Selection
 * - User manually selects an expert via ExpertPicker sidebar
 * - Then has an interactive conversation with SSE streaming
 *
 * Updated: December 15, 2025 - Unified with Mode 2 via shared interactive route
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Mode1ExpertChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified interactive route with manual mode
    router.replace('/ask-expert/interactive?mode=manual');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Expert Chat...</p>
      </div>
    </div>
  );
}
