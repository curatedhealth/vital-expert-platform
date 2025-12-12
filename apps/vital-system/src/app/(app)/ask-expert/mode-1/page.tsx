'use client';

/**
 * Mode 1: Interactive Manual
 *
 * Uses ChatDashboard with autoSelectExpert=false for
 * user-selected expert via sidebar.
 */

import { ChatDashboard } from '@/features/interactive-chat/components/ChatDashboard';

export default function Mode1ExpertChatPage() {
  return (
    <ChatDashboard
      autoSelectExpert={false}
      tenantId="00000000-0000-0000-0000-000000000001"
    />
  );
}
