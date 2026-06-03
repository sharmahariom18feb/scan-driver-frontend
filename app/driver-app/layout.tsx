'use client'

import { useEffect, useState } from 'react'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleRegister = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/driver-app/' })
          .then((registration) => {
            console.log('Driver ServiceWorker registered successfully with scope:', registration.scope)
          })
          .catch((error) => {
            console.error('Driver ServiceWorker registration failed:', error)
          })
      }

      if (document.readyState === 'complete') {
        handleRegister()
      } else {
        window.addEventListener('load', handleRegister)
        return () => window.removeEventListener('load', handleRegister)
      }
    }
  }, [])

  return (
    <>
      <link rel="manifest" href="/driver-manifest.json" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="SD Partner" />
      <link rel="apple-touch-icon" href="/apple-icon.png" />

      {/* Responsive native mobile wrapper layout */}
      <div className="min-h-screen bg-slate-950 dark:bg-black flex items-center justify-center py-0 sm:py-8 transition-colors duration-300">
        <div className="w-full sm:max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px]   bg-background text-foreground sm:rounded-2xl sm:shadow-2xl overflow-hidden flex flex-col border border-border/10 relative">
          {children}
        </div>
      </div>
    </>
  )
}
