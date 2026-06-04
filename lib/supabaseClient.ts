import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Singleton pattern using globalThis to prevent multiple instances in the browser context (especially during hot-reloads)
const globalForSupabase = globalThis as unknown as {
  supabase?: SupabaseClient
  supabaseAdmin?: SupabaseClient
}

/**
 * Public Supabase client (browser / client side).
 * Uses the NEXT_PUBLIC_ env vars which are exposed to the browser.
 */
export const supabase: SupabaseClient =
  globalForSupabase.supabase ??
  createClient(supabaseUrl, supabaseAnonKey)

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase
}

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

