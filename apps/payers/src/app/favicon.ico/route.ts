import { NextRequest, NextResponse } from 'next/server'

// Redirect /favicon.ico to a bundled PNG so browsers stop 404-ing
export async function GET(request: NextRequest) {
  const url = new URL('/icons/png/general/icon_0001.png', request.url)
  return NextResponse.redirect(url, 307)
}


