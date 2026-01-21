import { getSupabaseEnv } from '@/lib/supabase/env'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Create a redirect response up-front so we can attach auth cookies to it.
  const response = NextResponse.redirect(new URL(next, request.url))

  if (!code) {
    return response
  }

  const env = getSupabaseEnv()
  if (!env.ok) {
    return response
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.exchangeCodeForSession(code)

  return response
}
