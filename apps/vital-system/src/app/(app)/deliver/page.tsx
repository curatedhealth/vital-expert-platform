'use client';

/**
 * VITAL Deliver Service (/deliver)
 *
 * Execute automated AI workflows
 * Provides access to workflow templates, execution, and monitoring
 */

import { redirect } from 'next/navigation';

// Redirect to workflows for now - can be expanded later
export default function DeliverPage() {
  redirect('/workflows');
}
