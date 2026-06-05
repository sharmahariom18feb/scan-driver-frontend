import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'ScanDriver Admin Portal',
  description: 'Administrative backend for managing bookings, verifying drivers, and analyzing ride statistics.',
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {children}
    </div>
  )
}
