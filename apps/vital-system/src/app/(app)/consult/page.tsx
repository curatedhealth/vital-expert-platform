'use client';

/**
 * VITAL Consult Service (/consult)
 *
 * Multi-expert panel discussions - Ask Panel functionality
 * Supports 6 panel types:
 * - Structured: Sequential moderated discussion
 * - Open: Free-form brainstorming
 * - Socratic: Dialectical questioning
 * - Adversarial: Pro/con debate
 * - Delphi: Iterative consensus with voting
 * - Hybrid: Human-AI collaborative panels
 */

import { redirect } from 'next/navigation';

// Redirect to ask-panel for now - can be expanded later
export default function ConsultPage() {
  redirect('/ask-panel');
}
