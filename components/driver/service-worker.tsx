'use client'

import { useEffect } from 'react'

export function DriverServiceWorker() {
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

  return null
}
