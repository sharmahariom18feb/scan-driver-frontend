import type { Metadata, Viewport } from 'next'
import { DriverServiceWorker } from '@/components/driver/service-worker'

export const metadata: Metadata = {
  title: 'SD Partner – Driver Dashboard',
  description:
    'ScanDriver Partner Dashboard. Manage your bookings, accept rides, track earnings and update your profile. Join Delhi NCR\'s most trusted driver network.',
  keywords:
    'ScanDriver partner, driver dashboard, driver bookings, driver earnings Delhi NCR',
  openGraph: {
    title: 'SD Partner – Driver Dashboard | ScanDriver',
    description:
      'Manage your bookings, accept rides, and track earnings on the ScanDriver Partner Dashboard.',
    url: 'https://partner.scandriver.in',
    siteName: 'ScanDriver Partner',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SD Partner – Driver Dashboard | ScanDriver',
    description:
      'Manage your bookings, accept rides, and track earnings on the ScanDriver Partner Dashboard.',
  },
  robots: {
    index: false,
    follow: false,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'SD Partner',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="manifest" href="/driver-manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
      <DriverServiceWorker />

      {/* Responsive native mobile wrapper layout */}
      <div className="min-h-screen bg-slate-950 dark:bg-black flex items-center justify-center py-0 sm:py-8 transition-colors duration-300">
        <div className="driver-app-root w-full sm:max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-background text-foreground sm:rounded-2xl sm:shadow-2xl overflow-hidden flex flex-col border border-border/10 relative">
          {children}
        </div>
      </div>
    </>
  )
}
