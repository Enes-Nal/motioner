'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Player } from '@remotion/player'
import { createClient } from '@/lib/supabase/client'
import { FeatureFlash } from '@/remotion/src/compositions/FeatureFlash'
import { RefactorSpeed } from '@/remotion/src/compositions/RefactorSpeed'
import { BugSquash } from '@/remotion/src/compositions/BugSquash'
import { getSupabaseEnv } from '@/lib/supabase/env'

export default function EditorPage() {
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingProps, setEditingProps] = useState<any>(null)
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-gray-800/50 rounded-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold mb-4">Supabase not configured</h1>
          <p className="text-gray-300">
            Create a <code className="bg-gray-900/70 px-2 py-1 rounded">.env.local</code>{' '}
            (copy from <code className="bg-gray-900/70 px-2 py-1 rounded">env.template</code>) and set:
          </p>
          <code className="block mt-4 bg-gray-900/70 p-3 rounded text-sm">
            NEXT_PUBLIC_SUPABASE_URL{'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
        </div>
      </div>
    )
  }

  const supabase = createClient()

  useEffect(() => {
    // Get video ID or manual params from URL
    const params = new URLSearchParams(window.location.search)
    const videoId = params.get('id')
    const isManual = params.get('manual') === 'true'

    if (videoId) {
      loadVideo(videoId)
    } else if (isManual) {
      // Handle manual PR input
      handleManualPR(params)
    } else {
      setLoading(false)
    }
  }, [])

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
    setEditingProps({
      theme: 'feature',
      title: `PR #${prNumber} from ${owner}/${repo}`,
      primaryColor: '#6366f1',
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

    setVideo(data)
    setEditingProps(data.remotion_props || {})
    setLoading(false)
  }

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
    component: ComponentType<any>
    inputProps: Record<string, unknown>
  } {
    if (!editingProps) return null

    const commonProps = {
      title: editingProps.title || 'Untitled',
      primaryColor: editingProps.primaryColor || '#6366f1',
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!video || !editingProps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No video found</div>
      </div>
    )
  }

  const compositionConfig = getCompositionConfig()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Editor</h1>
          <p className="text-gray-400">Edit your changelog video before rendering</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Pane: Remotion Player */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {compositionConfig && (
              <div className="bg-black rounded-lg overflow-hidden">
                <Player
                  component={compositionConfig.component}
                  inputProps={compositionConfig.inputProps}
                  durationInFrames={450}
                  compositionWidth={1080}
                  compositionHeight={1080}
                  fps={30}
                  controls
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Pane: Editing Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Properties</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editingProps.title || ''}
                  onChange={(e) =>
                    setEditingProps({ ...editingProps, title: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={editingProps.primaryColor || '#6366f1'}
                  onChange={(e) =>
                    setEditingProps({
                      ...editingProps,
                      primaryColor: e.target.value,
                    })
                  }
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded"
                />
              </div>

              {editingProps.theme === 'refactor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Before Code
                    </label>
                    <textarea
                      value={editingProps.beforeCode || ''}
                      onChange={(e) =>
                        setEditingProps({
                          ...editingProps,
                          beforeCode: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 font-mono text-sm"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      After Code
                    </label>
                    <textarea
                      value={editingProps.afterCode || ''}
                      onChange={(e) =>
                        setEditingProps({
                          ...editingProps,
                          afterCode: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 font-mono text-sm"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Speed Improvement (%)
                    </label>
                    <input
                      type="number"
                      value={editingProps.speedImprovement || 0}
                      onChange={(e) =>
                        setEditingProps({
                          ...editingProps,
                          speedImprovement: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                    />
                  </div>
                </>
              )}

              {editingProps.theme === 'bug' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bug Description
                  </label>
                  <textarea
                    value={editingProps.bugDescription || ''}
                    onChange={(e) =>
                      setEditingProps({
                        ...editingProps,
                        bugDescription: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                    rows={3}
                  />
                </div>
              )}

              {editingProps.theme === 'feature' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Screenshot URL
                  </label>
                  <input
                    type="url"
                    value={editingProps.screenshotUrl || ''}
                    onChange={(e) =>
                      setEditingProps({
                        ...editingProps,
                        screenshotUrl: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleRender}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-semibold"
                >
                  Render Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
