import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 1. Verify caller session using their token
    const { data: { user }, error: authError } = await supabaseAdminClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // 2. Query public.users to check if caller is an ADMIN, using a client authenticated with the caller's JWT
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
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

    const { data: callerProfile, error: profileError } = await userClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !callerProfile || callerProfile.role !== 'ADMIN') {
      console.error('Admin verification failed:', profileError || 'Role is not ADMIN')
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 3. Parse and validate the driver ID and new password
    const body = await request.json()
    const { driverId, newPassword } = body

    if (!driverId || !newPassword) {
      return NextResponse.json({ error: 'Missing driverId or newPassword' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // 4. Update the user password in auth.users using the SQL RPC function (authenticated as the admin caller)
    const { data: rpcResult, error: rpcError } = await userClient.rpc(
      'reset_driver_password_sql',
      {
        p_driver_id: driverId,
        p_new_password: newPassword
      }
    )

    if (rpcError) {
      console.error('Error executing password reset RPC:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    // 5. Optionally insert a notification for the driver
    try {
      await userClient.from('notifications').insert({
        driver_id: driverId,
        title: 'Security Notice',
        description: 'Your account password was updated by the administrator.',
        time: 'Just now',
        type: 'system',
        read: false,
      })
    } catch (notifErr) {
      console.warn('Could not insert security notice notification:', notifErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Driver password reset successfully!'
    })
  } catch (err: any) {
    console.error('Error in reset password route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
