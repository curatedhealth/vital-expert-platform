import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      langgraph: 'available',
      streaming: 'available',
      agents: 'available'
    },
    backend: 'vercel-mock-langgraph',
    endpoints: {
      autonomous: {
        start: '/api/backend/autonomous/start',
        stream: '/api/backend/autonomous/stream'
      },
      consultation: {
        start: '/api/backend/consultation/start',
        stream: '/api/backend/consultation/stream'
      }
    }
  });
}
