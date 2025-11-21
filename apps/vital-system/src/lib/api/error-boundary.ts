/**
 * Error Boundary for API Routes
 * Wraps API route handlers with error handling
 */

import { NextRequest, NextResponse } from 'next/server';

type APIHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorBoundary(handler: APIHandler): APIHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        },
        { status: 500 }
      );
    }
  };
}
