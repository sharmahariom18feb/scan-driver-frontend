import { NextResponse } from 'next/server'
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
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // 1. Verify caller session
    const {
      data: { user },
      error: authError,
    } = await supabaseAdminClient.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // 2. Query public.users to check if caller is an ADMIN
    const { data: callerProfile, error: profileError } = await supabaseAdminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !callerProfile || callerProfile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 3. Parse request payload
    const body = await request.json()
    const { booking_id, driver_id, action = 'add' } = body

    if (!booking_id || !driver_id) {
      return NextResponse.json({ error: 'Missing booking_id or driver_id' }, { status: 400 })
    }

    if (action === 'remove') {
      const { error: deleteError } = await supabaseAdminClient
        .from('booking_applications')
        .delete()
        .eq('booking_id', booking_id)
        .eq('driver_id', driver_id)

      if (deleteError) {
        throw deleteError
      }

      return NextResponse.json({
        success: true,
        message: 'Applicant removed successfully',
      })
    }

    // Action === 'add'
    // Check if application already exists
    const { data: existingApp, error: fetchErr } = await supabaseAdminClient
      .from('booking_applications')
      .select('*')
      .eq('booking_id', booking_id)
      .eq('driver_id', driver_id)
      .maybeSingle()

    if (fetchErr) throw fetchErr

    let application = existingApp

    if (existingApp) {
      if (existingApp.status === 'rejected') {
        const { data: updatedApp, error: updateErr } = await supabaseAdminClient
          .from('booking_applications')
          .update({ status: 'pending' })
          .eq('id', existingApp.id)
          .select()
          .single()
        if (updateErr) throw updateErr
        application = updatedApp
      }
    } else {
      const { data: newApp, error: insertError } = await supabaseAdminClient
        .from('booking_applications')
        .insert({
          booking_id,
          driver_id,
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError
      application = newApp
    }

    // Optional notification to the driver
    try {
      // Get booking basic info for notification context
      const { data: bookingData } = await supabaseAdminClient
        .from('bookings')
        .select('pickup, drop, vehicle')
        .eq('id', booking_id)
        .maybeSingle()

      const vehicleInfo = bookingData?.vehicle ? ` (${bookingData.vehicle})` : ''
      const pickupInfo = bookingData?.pickup ? `. Pickup: ${bookingData.pickup}` : ''

      await supabaseAdminClient.from('notifications').insert({
        driver_id,
        title: 'Shortlisted for Monthly Booking! 📋',
        description: `Admin added you to the applicant list for Monthly Booking #${booking_id}${vehicleInfo}${pickupInfo}.`,
        time: 'Just now',
        type: 'booking',
        read: false,
      })
    } catch (notifErr) {
      console.warn('Could not insert driver notification:', notifErr)
    }

    return NextResponse.json({
      success: true,
      application,
      message: 'Driver added to applicant list successfully',
    })
  } catch (error: any) {
    console.error('Error in manage-booking-applicant:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
