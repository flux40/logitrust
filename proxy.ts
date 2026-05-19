// proxy.ts - Alternative to middleware for Next.js 16
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Your middleware logic here
  const response = NextResponse.next()
  
  // Add any proxy logic
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}