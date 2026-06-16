import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { createClient } from '@supabase/supabase-js'

// Initialize Firebase Admin SDK using the credentials from environment variables
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      console.log('Firebase Admin SDK initialized successfully.')
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not defined.')
    }
  } catch (err) {
    console.error('Firebase Admin SDK initialization failed:', err)
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? ''
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })
    }

    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const clientToUse = token
      ? createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })
      : supabaseAdminClient

    // 1. Fetch booking details from database
    const { data: booking, error: bookingError } = await clientToUse
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking details:', bookingError)
      return NextResponse.json({ error: 'Booking not found or failed to fetch details' }, { status: 404 })
    }

    // 2. Fetch all drivers who are currently online
    const { data: onlineDrivers, error: driversError } = await clientToUse
      .from('users')
      .select('id')
      .eq('role', 'DRIVER')
      .eq('is_online', true)

    if (driversError) {
      console.error('Error fetching online drivers:', driversError)
      return NextResponse.json({ error: `Failed to fetch online drivers: ${driversError.message}` }, { status: 500 })
    }

    if (!onlineDrivers || onlineDrivers.length === 0) {
      return NextResponse.json({ success: true, message: 'No online drivers found to notify' })
    }

    const driverIds = onlineDrivers.map((d) => d.id)

    // 3. Insert real-time database notifications for all online drivers
    const description = `${booking.type}: ${booking.pickup} to ${booking.drop} • ₹${booking.fare}`
    const title = 'New Booking Available!'

    const notificationsToInsert = driverIds.map((driverId) => ({
      driver_id: driverId,
      title,
      description,
      time: 'Just now',
      type: 'booking',
      read: false,
    }))

    const { error: insertError } = await clientToUse
      .from('notifications')
      .insert(notificationsToInsert)

    if (insertError) {
      console.error('Error inserting database notifications:', insertError)
    } else {
      console.log(`Inserted ${notificationsToInsert.length} database notifications successfully.`)
    }

    // 4. Fetch FCM tokens for these online drivers
    const { data: tokensData, error: tokensError } = await clientToUse
      .from('driver_fcm_tokens')
      .select('fcm_token')
      .in('driver_id', driverIds)

    if (tokensError) {
      console.error('Error fetching FCM tokens:', tokensError)
      return NextResponse.json({ error: `Failed to fetch FCM tokens: ${tokensError.message}` }, { status: 500 })
    }
    console.log("tokensData", tokensData);


    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Database notifications inserted, but no active FCM tokens found for online drivers.'
      })
    }

    const registrationTokens = tokensData.map((t) => t.fcm_token)

    // 5. Send multicast FCM notification message (or mock if Firebase Admin SDK is not initialized)
    if (!admin.apps.length) {
      console.warn('[FCM Mock] Firebase Admin SDK is not initialized. Mocking push notifications.')
      console.log('[FCM Mock] Target VAPID/Registration Tokens:', registrationTokens)
      console.log(`[FCM Mock] Notification payload: { title: "${title}", body: "${description}" }`)

      return NextResponse.json({
        success: true,
        message: 'Database notifications inserted. FCM was mocked (Firebase Admin SDK not initialized).',
        mocked: true,
        sentCount: registrationTokens.length,
        failureCount: 0,
      })
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body: description,
      },
      data: {
        bookingId: booking.id,
        click_action: '/driver-app',
      },
      tokens: registrationTokens,
    }

    const response = await admin.messaging().sendEachForMulticast(message)
    console.log(`Successfully dispatched FCM notifications. Success: ${response.successCount}, Failure: ${response.failureCount}`)

    // If there are failed tokens, we can clean them up from the database (optional but recommended)
    if (response.failureCount > 0) {
      const invalidTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(registrationTokens[idx])
          }
        }
      })

      if (invalidTokens.length > 0) {
        await supabaseAdminClient
          .from('driver_fcm_tokens')
          .delete()
          .in('fcm_token', invalidTokens)
        console.log(`Cleaned up ${invalidTokens.length} expired FCM tokens from database.`)
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
    })
  } catch (err: any) {
    console.error('Error sending push notifications via FCM:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
