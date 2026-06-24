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
    // Example: https://res.cloudinary.com/da781iuyi/image/upload/v1719123456/driver_docs/aadhaar_x1y2z3.jpg
    const parts = url.split('/image/upload/')
    if (parts.length < 2) return null
    
    let path = parts[1]
    
    // Remove version segment (e.g. v1719123456/)
    const versionRegex = /^v\d+\//
    path = path.replace(versionRegex, '')
    
    // Remove file extension (e.g. .jpg)
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

    // 3. Parse and validate the target driver ID
    const body = await request.json()
    const { driverId } = body

    if (!driverId) {
      return NextResponse.json({ error: 'Missing driverId' }, { status: 400 })
    }

    // 4. Query driver documents and delete associated images from Cloudinary before database records are deleted
    try {
      const { data: docs, error: docsError } = await supabaseAdminClient
        .from('driver_documents')
        .select('aadhaar_front_url, aadhaar_back_url, driving_license_url, pan_card_url, selfie_url, payment')
        .eq('driver_id', driverId)
        .maybeSingle()

      if (docsError) {
        console.error('Error fetching driver documents for deletion:', docsError)
      } else if (docs) {
        const urls = [
          docs.aadhaar_front_url,
          docs.aadhaar_back_url,
          docs.driving_license_url,
          docs.pan_card_url,
          docs.selfie_url,
          docs.payment
        ].filter((url): url is string => !!url)

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (!cloudName || !apiKey || !apiSecret) {
          console.warn('Cloudinary API Key or Secret not fully configured in backend environment. Skipping Cloudinary asset deletion.')
        } else {
          const publicIds = urls
            .map(url => extractPublicIdFromUrl(url))
            .filter((id): id is string => !!id)

          if (publicIds.length > 0) {
            console.log(`Found ${publicIds.length} Cloudinary images linked to driver ${driverId} to delete...`)
            await Promise.all(
              publicIds.map(id => deleteFromCloudinary(id, cloudName, apiKey, apiSecret))
            )
          }
        }
      }
    } catch (errDocs) {
      console.error('Exception occurred during driver documents extraction/deletion:', errDocs)
    }

    // 5. Delete the user in auth.users using the SQL RPC function (authenticated as the admin caller)
    const { data: rpcResult, error: rpcError } = await userClient.rpc(
      'delete_driver_sql',
      {
        p_driver_id: driverId
      }
    )

    if (rpcError) {
      console.error('Error executing delete driver RPC:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Driver application rejected and deleted successfully!'
    })
  } catch (err: any) {
    console.error('Error in delete driver route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
