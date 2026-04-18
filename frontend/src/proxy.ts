import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value

  const { pathname } = request.nextUrl

  // PLAYER
  if (pathname.startsWith('/player_dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== 'PLAYER') {
      return NextResponse.redirect(new URL('/ground_owner_dashboard', request.url))
    }
  }

  // OWNER
  if (pathname.startsWith('/ground_owner_dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== 'GROUND_OWNER') {
      return NextResponse.redirect(new URL('/player_dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/player_dashboard/:path*',
    '/ground_owner_dashboard/:path*',
  ],
}