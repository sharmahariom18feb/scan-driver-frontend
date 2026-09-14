'use client'

import { useEffect } from 'react'

export function DriverServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleRegister = () => {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Driver FCM ServiceWorker registered successfully with scope:', registration.scope)
          })
          .catch((error) => {
            console.error('Driver FCM ServiceWorker registration failed:', error)
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
