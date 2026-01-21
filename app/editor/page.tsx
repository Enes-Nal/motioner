'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Player } from '@remotion/player'
import { createClient } from '@/lib/supabase/client'
import { FeatureFlash } from '@/remotion/src/compositions/FeatureFlash'
import { RefactorSpeed } from '@/remotion/src/compositions/RefactorSpeed'
import { BugSquash } from '@/remotion/src/compositions/BugSquash'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { AppShell } from '@/components/app/app-shell'
import { SupabaseMissing } from '@/components/app/supabase-missing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type EditingTheme = 'feature' | 'refactor' | 'bug'
type EditingProps = {
  theme: EditingTheme | string
  title?: string
  primaryColor?: string
  screenshotUrl?: string
  beforeCode?: string
  afterCode?: string
  speedImprovement?: number
  bugDescription?: string
}

type VideoRow = {
  id: string
  title?: string | null
  remotion_props?: unknown
}

export default function EditorPage() {
  const hasSupabase = getSupabaseEnv().ok
  if (!hasSupabase) return <SupabaseMissing />
  return <EditorInner />
}

function EditorInner() {
  const [video, setVideo] = useState<VideoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProps, setEditingProps] = useState<EditingProps | null>(null)

  const supabase = createClient()

  async function handleManualPR(params: URLSearchParams) {
    const owner = params.get('owner')
    const repo = params.get('repo')
    const prNumber = params.get('pr')

    if (!owner || !repo || !prNumber) {
      setLoading(false)
      return
    }

    // For manual input, show a form to enter PR details
    // In production, this would fetch from GitHub API
    setVideo({ id: 'manual', title: null, remotion_props: null })
    setEditingProps({
      theme: 'feature',
      title: `PR #${prNumber} from ${owner}/${repo}`,
      primaryColor: '#3ecf8e',
      screenshotUrl: '',
    })
    setLoading(false)
  }

  async function loadVideo(videoId: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*, pull_requests(*)')
      .eq('id', videoId)
      .single()

    if (error) {
      console.error('Error loading video:', error)
      setLoading(false)
      return
    }

    setVideo({ id: data.id, title: data.title ?? null, remotion_props: data.remotion_props })
    setEditingProps((data.remotion_props as EditingProps) || null)
    setLoading(false)
  }

  useEffect(() => {
    // Get video ID or manual params from URL
    const params = new URLSearchParams(window.location.search)
    const videoId = params.get('id')
    const isManual = params.get('manual') === 'true'

    if (videoId) {
      void loadVideo(videoId)
    } else if (isManual) {
      void handleManualPR(params)
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    if (!video) return

    const { error } = await supabase
      .from('videos')
      .update({
        remotion_props: editingProps,
        title: editingProps.title,
      })
      .eq('id', video.id)

    if (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes')
    } else {
      alert('Changes saved!')
    }
  }

  async function handleRender() {
    if (!video) return

    const response = await fetch('/api/video/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: video.id,
        remotionProps: editingProps,
      }),
    })

    if (response.ok) {
      alert('Video rendering started!')
    } else {
      alert('Failed to start rendering')
    }
  }

  function getCompositionConfig(): null | {
    component: ComponentType<Record<string, unknown>>
    inputProps: Record<string, unknown>
  } {
    if (!editingProps) return null

    const commonProps = {
      title: editingProps.title || 'Untitled',
      primaryColor: editingProps.primaryColor || '#3ecf8e',
    }

    switch (editingProps.theme) {
      case 'feature':
        return {
          component: FeatureFlash,
          inputProps: {
            ...commonProps,
            screenshotUrl: editingProps.screenshotUrl || '',
          },
        }
      case 'refactor':
        return {
          component: RefactorSpeed,
          inputProps: {
            ...commonProps,
            beforeCode: editingProps.beforeCode || '',
            afterCode: editingProps.afterCode || '',
            speedImprovement: editingProps.speedImprovement || 0,
          },
        }
      case 'bug':
        return {
          component: BugSquash,
          inputProps: {
            ...commonProps,
            bugDescription: editingProps.bugDescription || '',
          },
        }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AppShell title="Editor" description="Loading your video…">
        <div className="mx-auto max-w-xl">
          <Alert>
            <AlertTitle>Loading</AlertTitle>
            <AlertDescription>Fetching your video and props…</AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }

  if (!video || !editingProps) {
    return (
      <AppShell title="Editor" description="No video found.">
        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Nothing to edit</CardTitle>
              <CardDescription>
                Create a video from a PR, then come back here to preview and render.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/create"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Create a video
              </a>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const compositionConfig = getCompositionConfig()

  return (
    <AppShell
      title="Editor"
      description="Preview and tweak props before rendering."
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{editingProps.theme}</Badge>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Remotion player preview (square).</CardDescription>
          </CardHeader>
          <CardContent>
            {compositionConfig ? (
              <div className="overflow-hidden rounded-xl border bg-black">
                <Player
                  component={compositionConfig.component}
                  inputProps={compositionConfig.inputProps}
                  durationInFrames={450}
                  compositionWidth={1080}
                  compositionHeight={1080}
                  fps={30}
                  controls
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            ) : (
              <Alert>
                <AlertTitle>Unsupported theme</AlertTitle>
                <AlertDescription>
                  This video’s theme isn’t mapped to a composition.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>These values are used as Remotion input props.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                type="text"
                value={editingProps.title || ''}
                onChange={(e) => setEditingProps({ ...editingProps, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Primary color</Label>
              <Input
                type="color"
                value={editingProps.primaryColor || '#3ecf8e'}
                onChange={(e) =>
                  setEditingProps({ ...editingProps, primaryColor: e.target.value })
                }
                className="h-10 p-1"
              />
            </div>

            {editingProps.theme === 'refactor' && (
              <>
                <div className="space-y-2">
                  <Label>Before code</Label>
                  <Textarea
                    value={editingProps.beforeCode || ''}
                    onChange={(e) =>
                      setEditingProps({ ...editingProps, beforeCode: e.target.value })
                    }
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>After code</Label>
                  <Textarea
                    value={editingProps.afterCode || ''}
                    onChange={(e) =>
                      setEditingProps({ ...editingProps, afterCode: e.target.value })
                    }
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Speed improvement (%)</Label>
                  <Input
                    type="number"
                    value={editingProps.speedImprovement || 0}
                    onChange={(e) =>
                      setEditingProps({
                        ...editingProps,
                        speedImprovement: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </>
            )}

            {editingProps.theme === 'bug' && (
              <div className="space-y-2">
                <Label>Bug description</Label>
                <Textarea
                  value={editingProps.bugDescription || ''}
                  onChange={(e) =>
                    setEditingProps({ ...editingProps, bugDescription: e.target.value })
                  }
                  rows={4}
                />
              </div>
            )}

            {editingProps.theme === 'feature' && (
              <div className="space-y-2">
                <Label>Screenshot URL</Label>
                <Input
                  type="url"
                  value={editingProps.screenshotUrl || ''}
                  onChange={(e) =>
                    setEditingProps({ ...editingProps, screenshotUrl: e.target.value })
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
              <Button onClick={handleSave} variant="outline">
                Save
              </Button>
              <Button onClick={handleRender}>Render</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
