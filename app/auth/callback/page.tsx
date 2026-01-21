'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finalize = async () => {
      const supabase = createClient()

      // createBrowserClient (supabase/ssr) will automatically detect sessions in the URL
      // (PKCE code flow via ?code=... and some providers/flows may return tokens in #hash).
      // Calling getSession() forces it to parse + persist (cookie storage).
      await supabase.auth.getSession()

      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') ?? '/'
      router.replace(next)
    }

    void finalize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>Finishing GitHub authentication.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This should only take a moment.
        </CardContent>
      </Card>
    </div>
  )
}
