import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? ''
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { booking, booking_id } = body

    // 1. If booking object is not passed directly, fetch booking from Supabase using booking_id
    if (!booking && booking_id) {
      const { data, error } = await supabaseAdminClient
        .from('bookings')
        .select('*')
        .eq('id', booking_id)
        .single()

      if (error || !data) {
        console.error('[Twilio Admin Notify] Error fetching booking:', error)
        return NextResponse.json(
          { error: 'Booking not found or failed to fetch details' },
          { status: 404 }
        )
      }
      booking = data
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Missing booking details or booking_id' },
        { status: 400 }
      )
    }

    // 2. Read Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    let fromNumber = process.env.TWILIO_PHONE_NUMBER
    let adminPhone = process.env.ADMIN_PHONE_NUMBER
    const isWhatsApp = process.env.TWILIO_IS_WHATSAPP === 'true'

    const isPlaceholder =
      !accountSid ||
      !authToken ||
      !fromNumber ||
      !adminPhone ||
      accountSid.includes('your_twilio') ||
      authToken.includes('your_twilio') ||
      fromNumber.includes('your_twilio') ||
      adminPhone.includes('9876543210')

    // 3. Format notification message
    const formattedFare = booking.fare ? `₹${Number(booking.fare).toLocaleString('en-IN')}` : 'N/A'
    const formattedDateTime = booking.date_time
      ? new Date(booking.date_time).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Immediate / Not specified'

    let smsBody = `🚨 NEW BOOKING RECEIVED 🚨\n`
    // smsBody += `Booking ID: #${booking.id || 'N/A'}\n`
    // smsBody += `Customer: ${booking.customer_name || 'N/A'}\n`
    // smsBody += `Phone: ${booking.phone || 'N/A'}\n`
    // smsBody += `Trip Type: ${booking.type || 'N/A'}\n`
    // smsBody += `Vehicle: ${booking.vehicle || 'N/A'}\n`
    // smsBody += `Pickup: ${booking.pickup || 'N/A'}\n`
    // if (booking.drop) {
    //   smsBody += `Drop: ${booking.drop}\n`
    // }
    // smsBody += `Date/Time: ${formattedDateTime}\n`
    // smsBody += `Fare: ${formattedFare}\n`
    // if (booking.special_instructions) {
    //   smsBody += `Notes: ${booking.special_instructions}\n`
    // }

    // 4. Handle unconfigured/mocked credentials gracefully
    if (isPlaceholder) {
      console.warn(
        '[Twilio Admin Notify Mock] Twilio environment variables are not fully configured.'
      )
      console.log(`[Twilio Admin Notify Mock] Target Admin Phone: ${adminPhone || 'NOT SET'}`)
      console.log(`[Twilio Admin Notify Mock] Message Content:\n${smsBody}`)

      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Notification logged to server console (Twilio credentials not configured).',
        smsBody,
      })
    }

    let targetFromNumber = fromNumber as string
    let targetAdminPhone = adminPhone as string

    // Adjust for WhatsApp if enabled
    if (isWhatsApp) {
      if (!targetFromNumber.startsWith('whatsapp:')) {
        targetFromNumber = `whatsapp:${targetFromNumber}`
      }
      if (!targetAdminPhone.startsWith('whatsapp:')) {
        targetAdminPhone = `whatsapp:${targetAdminPhone}`
      }
    }

    // 5. Send message via Twilio API
    const client = twilio(accountSid, authToken)
    const message = await client.messages.create({
      body: smsBody,
      from: targetFromNumber,
      to: targetAdminPhone,
    })

    console.log(`[Twilio Admin Notify] SMS dispatched successfully. SID: ${message.sid}`)

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
    })
  } catch (err: any) {
    console.error('[Twilio Admin Notify] Error sending notification:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error while sending notification' },
      { status: 500 }
    )
  }
}
