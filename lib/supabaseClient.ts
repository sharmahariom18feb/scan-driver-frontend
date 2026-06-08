import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Singleton pattern using globalThis to prevent multiple instances in the browser context (especially during hot-reloads)
const globalForSupabase = globalThis as unknown as {
  supabase?: SupabaseClient
  supabaseAdmin?: SupabaseClient
}

const createCustomClient = (storageKey: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: storageKey,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  })
}

// In the browser, we initialize client lazily or dynamically based on the route
let clientInstance: SupabaseClient | null = null
let currentKey = ''

const getClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  const path = window.location.pathname
  const expectedKey = path.startsWith('/admin') ? 'sb-admin-auth-token' : 'sb-driver-auth-token'
  
  if (!clientInstance || currentKey !== expectedKey) {
    clientInstance = createCustomClient(expectedKey)
    currentKey = expectedKey
  }
  
  return clientInstance
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})


/**
 * Server‑side Supabase client (e.g., for API routes, getServerSideProps, etc.)
 * Utilises the service role key which should **never** be exposed to the client.
 * The key is read from the runtime environment (not prefixed with NEXT_PUBLIC).
 * Only initialized on the server side to avoid exposing the service role key
 * and to prevent multiple GoTrueClient instances in the browser.
 */
export const supabaseAdmin: SupabaseClient =
  typeof window === 'undefined'
    ? (globalForSupabase.supabaseAdmin ??
       createClient(
         supabaseUrl,
         process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? '',
         {
           auth: {
             persistSession: false,
             autoRefreshToken: false,
           },
         }
       ))
    : (null as any)


if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabaseAdmin = supabaseAdmin
}

