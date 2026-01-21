import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { AppShell } from '@/components/app/app-shell'
import { SupabaseMissing } from '@/components/app/supabase-missing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function VideosPage() {
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return <SupabaseMissing />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AppShell title="Videos" description="Manage your changelog videos.">
        <div className="mx-auto max-w-xl">
          <Alert>
            <AlertTitle>Please sign in</AlertTitle>
            <AlertDescription>
              You need an account to view and manage your videos.{' '}
              <Link href="/login" className="underline underline-offset-4">
                Sign in with GitHub
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, pull_requests(title, pr_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <AppShell
      title="Videos"
      description="Manage your changelog videos."
      actions={<ButtonLink href="/create" variant="default" size="sm">New</ButtonLink>}
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Failed to load videos</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!videos || videos.length === 0 ? (
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>No videos yet</CardTitle>
            <CardDescription>Create your first changelog video from a PR.</CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink href="/create">Create a video</ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const themeVariant =
              video.theme === 'feature'
                ? ('default' as const)
                : video.theme === 'refactor'
                ? ('success' as const)
                : ('warning' as const)
            const statusVariant =
              video.status === 'completed'
                ? ('success' as const)
                : video.status === 'rendering'
                ? ('warning' as const)
                : ('secondary' as const)

            return (
              <Card key={video.id} className="transition hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={themeVariant}>{video.theme}</Badge>
                    <Badge variant={statusVariant}>{video.status}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                  <CardDescription>
                    {video.pull_requests?.title ? video.pull_requests.title : '—'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {video.pull_requests?.pr_url && (
                    <a
                      href={video.pull_requests.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View PR →
                    </a>
                  )}
                  <div className="flex gap-2">
                    <ButtonLink
                      href={`/editor?id=${video.id}`}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </ButtonLink>
                    {video.status === 'completed' && video.video_url && (
                      <a
                        href={video.video_url}
                        download
                        className="flex h-9 flex-1 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
