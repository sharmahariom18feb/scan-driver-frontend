import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Normalize hostname to remove port numbers (e.g. partner.localhost:3000 -> partner.localhost)
  const currentHost = hostname.split(':')[0].toLowerCase()

  // Detect subdomains
  const isAdminSubdomain = currentHost === 'admin.scandriver.in' || currentHost.startsWith('admin.')
  const isPartnerSubdomain = currentHost === 'partner.scandriver.in' || currentHost.startsWith('partner.')

  if (isAdminSubdomain) {
    // Rewrite admin.* to the /admin path
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (isPartnerSubdomain) {
    // Rewrite partner.* to the /driver-app path
    if (!url.pathname.startsWith('/driver-app')) {
      url.pathname = `/driver-app${url.pathname}`
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
     * - PWA icons/assets (e.g., logo-sd.png, icons, screenshots, driver-manifest.json, sw.js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-sd.png|icons|screenshots|driver-manifest.json|sw.js).*)',
  ],
}
