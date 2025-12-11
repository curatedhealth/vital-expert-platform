import { NextResponse } from 'next/server';

// Temporary redirect from legacy /prism to /prompts
export function GET() {
  return NextResponse.redirect(new URL('/prompts', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

export function POST() {
  return NextResponse.redirect(new URL('/prompts', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
