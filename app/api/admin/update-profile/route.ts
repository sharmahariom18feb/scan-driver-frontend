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

    // 1. Verify caller session
    const { data: { user }, error: authError } = await supabaseAdminClient.auth.getUser(token)
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
      console.error('Admin verification failed:', profileError || 'Role is not ADMIN')
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { driverId, userData, profileData, documentData } = body

    if (!driverId) {
      return NextResponse.json({ error: 'Missing driverId' }, { status: 400 })
    }

    // 4. Update users table
    if (userData && Object.keys(userData).length > 0) {
      const finalUserData = { ...userData }
      let { error: userUpdateError } = await supabaseAdminClient
        .from('users')
        .update(finalUserData)
        .eq('id', driverId)

      // Fallback if current_address column has not been migrated yet in Supabase schema
      if (userUpdateError && userUpdateError.message?.includes('current_address')) {
        delete finalUserData.current_address
        const retry = await supabaseAdminClient
          .from('users')
          .update(finalUserData)
          .eq('id', driverId)
        userUpdateError = retry.error
      }

      if (userUpdateError) {
        throw new Error(`Failed to update users table: ${userUpdateError.message}`)
      }
    }

    // 5. Update/Upsert driver_profiles table
    if (profileData && Object.keys(profileData).length > 0) {
      const finalProfileData = { ...profileData }
      let { error: profileUpdateError } = await supabaseAdminClient
        .from('driver_profiles')
        .upsert({ id: driverId, ...finalProfileData }, { onConflict: 'id' })

      // Fallback if current_address column has not been migrated yet in Supabase schema
      if (profileUpdateError && profileUpdateError.message?.includes('current_address')) {
        delete finalProfileData.current_address
        const retry = await supabaseAdminClient
          .from('driver_profiles')
          .upsert({ id: driverId, ...finalProfileData }, { onConflict: 'id' })
        profileUpdateError = retry.error
      }

      if (profileUpdateError) {
        throw new Error(`Failed to update driver_profiles table: ${profileUpdateError.message}`)
      }
    }

    // 6. Update/Upsert driver_documents table (references, etc)
    if (documentData && Object.keys(documentData).length > 0) {
      const { data: docsCheck } = await supabaseAdminClient
        .from('driver_documents')
        .select('driver_id')
        .eq('driver_id', driverId)
        .maybeSingle()

      if (docsCheck) {
        const { error: docsUpdateError } = await supabaseAdminClient
          .from('driver_documents')
          .update(documentData)
          .eq('driver_id', driverId)

        if (docsUpdateError) {
          throw new Error(`Failed to update driver_documents: ${docsUpdateError.message}`)
        }
      } else {
        const { error: docsInsertError } = await supabaseAdminClient
          .from('driver_documents')
          .insert({ driver_id: driverId, ...documentData })

        if (docsInsertError) {
          throw new Error(`Failed to insert driver_documents: ${docsInsertError.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile details updated successfully!'
    })
  } catch (err: any) {
    console.error('Error in update-profile route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
