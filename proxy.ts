import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Normalize hostname to remove port numbers (e.g. partner.localhost:3000 -> partner.localhost)
  const currentHost = hostname.split(':')[0].toLowerCase()

  // Detect if the domain is partner.scandriver.in or starts with partner. (for local dev testing like partner.localhost)
  const isPartnerSubdomain = currentHost === 'partner.scandriver.in' || currentHost.startsWith('partner.')

  if (isPartnerSubdomain) {
    // If the partner domain is accessed at the root path '/', rewrite to the driver-app page
    if (url.pathname === '/') {
      url.pathname = '/driver-app'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - PWA icons/assets (e.g., logo-sd.png, manifest, sw.js, screenshots)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-sd.png|icons|screenshots|driver-manifest.json|sw.js).*)',
  ],
}
