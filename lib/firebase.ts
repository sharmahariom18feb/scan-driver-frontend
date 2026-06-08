import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, Messaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (safely checks if app is already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

let messaging: Messaging | null = null

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app)
  } catch (err) {
    console.error('Firebase messaging is not supported in this browser.', err)
  }
}

export { app, messaging }

/**
 * Requests browser permission for notifications and generates/returns the FCM token.
 */
export const requestForToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !messaging) return null
  
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      if (currentToken) {
        return currentToken
      } else {
        console.warn('No registration token available. Request permission to generate one.')
        return null
      }
    } else {
      console.warn('Notification permission not granted by user.')
      return null
    }
  } catch (err) {
    console.error('An error occurred while retrieving FCM token:', err)
    return null
  }
}
