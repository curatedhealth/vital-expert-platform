/**
 * Panels Templates API (Stub)
 *
 * This endpoint exists primarily to satisfy frontend fetches from
 * `/app/(app)/ask-panel/page.tsx` and to avoid noisy HTML 404 errors
 * being logged in the browser console during local development.
 *
 * In production this can be extended to load panel templates from
 * Supabase, but for now it simply signals `success: false` so the
 * UI falls back to the local `PANEL_TEMPLATES` constant.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    panels: [],
    message:
      'Remote panel templates not configured; falling back to local PANEL_TEMPLATES.',
  });
}


