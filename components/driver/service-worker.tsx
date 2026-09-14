'use client'

import { useEffect } from 'react'
import { getFirebaseSwUrl } from '@/lib/firebase'

export function DriverServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleRegister = () => {
        navigator.serviceWorker
          .register(getFirebaseSwUrl(), { scope: '/' })
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
