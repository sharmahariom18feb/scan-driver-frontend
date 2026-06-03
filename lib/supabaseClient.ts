import { createClient } from '@supabase/supabase-js'

/**
 * Public Supabase client (browser / client side).
 * Uses the NEXT_PUBLIC_ env vars which are exposed to the browser.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

/**
 * Server‑side Supabase client (e.g., for API routes, getServerSideProps, etc.)
 * Utilises the service role key which should **never** be exposed to the client.
 * The key is read from the runtime environment (not prefixed with NEXT_PUBLIC).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
)
