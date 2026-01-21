'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { parseGitHubUrl } from '@/lib/github/url'
import { AppShell } from '@/components/app/app-shell'
import { SupabaseMissing } from '@/components/app/supabase-missing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreatePage() {
  const [prUrl, setPrUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return <SupabaseMissing />
  }

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const parsed = parseGitHubUrl(prUrl)
      if (!parsed) {
        setError(
          'Invalid GitHub URL. Use either https://github.com/owner/repo or https://github.com/owner/repo/pull/123'
        )
        setLoading(false)
        return
      }

      if (parsed.type === 'pr') {
        // For MVP, we'll use manual input form for PRs.
        router.push(
          `/editor?manual=true&owner=${parsed.owner}&repo=${parsed.repo}&pr=${parsed.prNumber}`
        )
        return
      }

      // Repo URL: generate a project overview video and open it in the editor.
      const response = await fetch('/api/repo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: prUrl }),
      })

      const data = (await response.json().catch(() => null)) as
        | { error?: string; videoId?: string }
        | null
      if (!response.ok) {
        setError(data?.error || 'Failed to analyze repo')
        setLoading(false)
        return
      }

      if (!data?.videoId) {
        setError('Repo analysis succeeded but returned no videoId.')
        setLoading(false)
        return
      }

      router.push(`/editor?id=${data.videoId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process PR'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <AppShell
      title="Create"
      description="Paste a GitHub PR URL or repo URL to start a new video."
    >
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>GitHub link</CardTitle>
            <CardDescription>
              PR URLs open the editor in manual PR mode. Repo URLs generate a quick project overview video.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prUrl">GitHub URL</Label>
                <Input
                  id="prUrl"
                  type="url"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo or .../pull/123"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Invalid input</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing…' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>From PR to publishable video in minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Paste a PR URL or repo URL</li>
              <li>Review the generated props</li>
              <li>Preview the Remotion composition</li>
              <li>Render and download</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
