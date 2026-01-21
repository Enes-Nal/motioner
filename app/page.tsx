import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SupabaseMissing } from '@/components/app/supabase-missing'

export default async function HomePage() {
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return <SupabaseMissing />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="relative">
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-tight">
              <span className="text-primary">Motioner</span>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <ButtonLink href="/create" size="sm">
                  Create
                </ButtonLink>
                <ButtonLink href="/videos" size="sm" variant="outline">
                  Videos
                </ButtonLink>
              </>
            ) : (
              <ButtonLink href="/login" size="sm">
                Sign in
              </ButtonLink>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <Badge className="w-fit" variant="default">
              Supabase-first workflow
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Turn PRs into crisp changelog videos.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Motioner analyzes GitHub pull requests, generates a script, and lets you review a
              Remotion preview before rendering.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {user ? (
                <>
                  <ButtonLink href="/create" size="lg">
                    Create a video
                  </ButtonLink>
                  <ButtonLink href="/videos" size="lg" variant="outline">
                    View videos
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/login" size="lg">
                    Get started
                  </ButtonLink>
                  <ButtonLink href="/login" size="lg" variant="outline">
                    Sign in with GitHub
                  </ButtonLink>
                </>
              )}
            </div>
            {user?.email && (
              <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
            )}
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-powered analysis</CardTitle>
                <CardDescription>
                  Generate a script and video props from your PR diff and metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Keeps things concise and brand-safe for public changelogs.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Human-in-the-loop editor</CardTitle>
                <CardDescription>
                  Review the composition, tweak props, then render.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Built for speed: preview first, then ship.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Remotion templates</CardTitle>
                <CardDescription>
                  Feature, refactor, and bug-fix styles out of the box.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Export square videos ready for X.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
