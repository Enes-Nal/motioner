import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

export async function createClient() {
  const env = getSupabaseEnv()
  if (!env.ok) {
    throw new Error(
      env.reason === 'invalid_url'
        ? 'Supabase env var NEXT_PUBLIC_SUPABASE_URL is invalid. It must be a full http(s) URL (e.g. https://xyz.supabase.co).'
        : 'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in `.env.local` (copy from `env.template`).'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(
    env.url,
    env.key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

