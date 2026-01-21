import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getSupabaseEnv } from '@/lib/supabase/env'

export default async function VideosPage() {
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-gray-800/50 rounded-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold mb-3">Supabase not configured</h1>
          <p className="text-gray-300 mb-6">
            Add your Supabase env vars to{' '}
            <code className="bg-gray-900/70 px-2 py-1 rounded">.env.local</code>{' '}
            (copy from{' '}
            <code className="bg-gray-900/70 px-2 py-1 rounded">env.template</code>
            ).
          </p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    )
  }

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, pull_requests(title, pr_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Videos</h1>
          <p className="text-gray-400">Manage your changelog videos</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded px-4 py-3 mb-6">
            Error loading videos: {error.message}
          </div>
        )}

        {!videos || videos.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-6">No videos yet</p>
            <Link
              href="/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
            >
              Create Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800 transition"
              >
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      video.theme === 'feature'
                        ? 'bg-blue-600'
                        : video.theme === 'refactor'
                        ? 'bg-green-600'
                        : 'bg-yellow-600'
                    }`}
                  >
                    {video.theme}
                  </span>
                  <span
                    className={`ml-2 px-3 py-1 rounded text-sm ${
                      video.status === 'completed'
                        ? 'bg-green-900 text-green-200'
                        : video.status === 'rendering'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {video.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                {video.pull_requests && (
                  <a
                    href={video.pull_requests.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mb-4 block"
                  >
                    View PR →
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/editor?id=${video.id}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-center text-sm font-semibold"
                  >
                    Edit
                  </Link>
                  {video.status === 'completed' && video.video_url && (
                    <a
                      href={video.video_url}
                      download
                      className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-center text-sm font-semibold"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

