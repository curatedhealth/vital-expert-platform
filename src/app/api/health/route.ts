import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    routes: {
      chat: '/api/chat',
      chatAutonomous: '/api/chat/autonomous',
      chatLangchain: '/api/chat/langchain-enhanced',
      health: '/api/health'
    },
    version: '1.0.0'
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
