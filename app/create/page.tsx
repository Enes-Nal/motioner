'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseEnv } from '@/lib/supabase/env'

export default function CreatePage() {
  const [prUrl, setPrUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-8">
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

      // Parse PR URL
      const urlMatch = prUrl.match(
        /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
      )
      if (!urlMatch) {
        setError('Invalid GitHub PR URL. Format: https://github.com/owner/repo/pull/123')
        setLoading(false)
        return
      }

      const [, owner, repo, prNumber] = urlMatch

      // For MVP, we'll use manual input form
      // In production, this would fetch from GitHub API
      router.push(`/editor?manual=true&owner=${owner}&repo=${repo}&pr=${prNumber}`)
    } catch (err: any) {
      setError(err.message || 'Failed to process PR')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-gray-800/50 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Create Changelog Video</h1>
        <p className="text-gray-400 mb-8">
          Enter a GitHub PR URL to generate a changelog video
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="prUrl"
              className="block text-sm font-medium mb-2"
            >
              GitHub PR URL
            </label>
            <input
              id="prUrl"
              type="url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-lg"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded px-4 py-3 text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-4 rounded-lg font-semibold transition"
          >
            {loading ? 'Processing...' : 'Create Video'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-lg font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Paste your merged GitHub PR URL</li>
            <li>AI analyzes the PR and generates a video concept</li>
            <li>Edit and customize in the HITL editor</li>
            <li>Render and download your changelog video</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

