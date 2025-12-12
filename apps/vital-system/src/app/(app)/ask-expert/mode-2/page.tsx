'use client';

/**
 * Mode 2: Interactive Auto
 *
 * Uses ChatDashboard with autoSelectExpert=true for
 * Fusion Intelligence automatic expert selection.
 */

import { ChatDashboard } from '@/features/interactive-chat/components/ChatDashboard';

export default function Mode2SmartChatPage() {
  return (
    <ChatDashboard
      autoSelectExpert={true}
      tenantId="00000000-0000-0000-0000-000000000001"
    />
  );
}
