import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if trying to access admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Add your authentication check here
    const isAdmin = request.cookies.get('isAdmin')?.value === 'true'
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}