'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { SupabaseMissing } from '@/components/app/supabase-missing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function LoginInner() {
  const router = useRouter()
  const supabase = createClient()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) router.replace('/')
    }
    void checkUser()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) router.replace('/')
      }
    )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleGitHubLogin = async () => {
    setAuthError(null)
    setIsSigningIn(true)
    try {
      const redirectTo = `${(
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
      ).replace(/\/$/, '')}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
        },
      })

      if (error) {
        console.error('Error signing in:', error)
        setAuthError(error.message)
        return
      }

      if (!data?.url) {
        setAuthError('Failed to start OAuth flow (no redirect URL returned).')
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unexpected error signing in.'
      console.error('Unexpected error signing in:', e)
      setAuthError(message)
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use GitHub to connect and start turning PRs into short changelog videos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertTitle>Authentication failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleGitHubLogin} disabled={isSigningIn} className="w-full">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {isSigningIn ? 'Redirecting…' : 'Continue with GitHub'}
          </Button>
          <p className="text-xs text-muted-foreground">
            You’ll be redirected back to{' '}
            <code className="rounded bg-muted px-1">/auth/callback</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  const hasSupabase = getSupabaseEnv().ok
  if (!hasSupabase) return <SupabaseMissing />
  return <LoginInner />
}
