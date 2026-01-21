import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'

export function createAdminClient() {
  const env = getSupabaseEnv()
  if (!env.ok) {
    throw new Error(
      env.reason === 'invalid_url'
        ? 'Supabase env var NEXT_PUBLIC_SUPABASE_URL is invalid. It must be a full http(s) URL (e.g. https://xyz.supabase.co).'
        : 'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in `.env.local` (copy from `env.template`).'
    )
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Add it to `.env.local` (copy from `env.template`).'
    )
  }

  return createClient(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
