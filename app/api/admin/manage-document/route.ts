import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? ''
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Helper to extract Cloudinary public_id from secure URL
function extractPublicIdFromUrl(url: string): string | null {
  if (!url) return null
  try {
    const parts = url.split('/image/upload/')
    if (parts.length < 2) return null
    
    let path = parts[1]
    const versionRegex = /^v\d+\//
    path = path.replace(versionRegex, '')
    
    const dotIndex = path.lastIndexOf('.')
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex)
    }
    
    return path
  } catch (error) {
    console.error('Failed to extract public_id from Cloudinary URL:', error)
    return null
  }
}

// Helper to delete an image from Cloudinary using signed signature
async function deleteFromCloudinary(publicId: string, cloudName: string, apiKey: string, apiSecret: string) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signatureInput = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(signatureInput).digest('hex')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: apiKey,
        timestamp: timestamp,
        signature: signature,
      }),
    })

    const result = await response.json()
    if (result.result !== 'ok') {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, result)
    } else {
      console.log(`Successfully deleted image ${publicId} from Cloudinary`)
    }
  } catch (err) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, err)
  }
}

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
    const { driverId, action, documentField, newUrl } = body

    if (!driverId || !action || !documentField) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const allowedFields = ['aadhaar_front_url', 'aadhaar_back_url', 'driving_license_url', 'pan_card_url', 'selfie_url', 'payment']
    if (!allowedFields.includes(documentField)) {
      return NextResponse.json({ error: 'Invalid document field' }, { status: 400 })
    }

    // 4. Query current document URL
    const { data: docsRecord, error: fetchError } = await supabaseAdminClient
      .from('driver_documents')
      .select(documentField)
      .eq('driver_id', driverId)
      .maybeSingle()

    if (fetchError) {
      throw new Error(`Failed to query driver documents: ${fetchError.message}`)
    }

    const currentUrl = docsRecord?.[documentField]

    // 5. Delete current file from Cloudinary if it exists
    if (currentUrl) {
      const publicId = extractPublicIdFromUrl(currentUrl)
      if (publicId) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (cloudName && apiKey && apiSecret && cloudName !== 'your_cloud_name') {
          await deleteFromCloudinary(publicId, cloudName, apiKey, apiSecret)
        } else {
          console.warn('Cloudinary not fully configured. Skipping Cloudinary asset deletion.')
        }
      }
    }

    // 6. Update database record
    const targetValue = action === 'delete' ? null : (newUrl || null)

    // Check if the record exists
    const { data: existsCheck } = await supabaseAdminClient
      .from('driver_documents')
      .select('driver_id')
      .eq('driver_id', driverId)
      .maybeSingle()

    if (existsCheck) {
      const { error: updateError } = await supabaseAdminClient
        .from('driver_documents')
        .update({ [documentField]: targetValue })
        .eq('driver_id', driverId)

      if (updateError) {
        throw new Error(`Failed to update database: ${updateError.message}`)
      }
    } else {
      // If it doesn't exist, and action is replace/upload, insert a new record
      if (action === 'replace') {
        const { error: insertError } = await supabaseAdminClient
          .from('driver_documents')
          .insert({
            driver_id: driverId,
            [documentField]: targetValue
          })

        if (insertError) {
          throw new Error(`Failed to insert document record: ${insertError.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Document ${action === 'delete' ? 'deleted' : 'updated'} successfully!`
    })
  } catch (err: any) {
    console.error('Error in manage-document route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
