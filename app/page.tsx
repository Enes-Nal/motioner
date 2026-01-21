import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'

export default async function HomePage() {
  const hasSupabase = getSupabaseEnv().ok

  if (!hasSupabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Motioner</h1>
            <p className="text-gray-300 mb-8">
              Supabase isn’t configured yet. Add your Supabase project URL + anon
              key to <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code>{' '}
              (copy from <code className="bg-gray-800 px-2 py-1 rounded">env.template</code>).
            </p>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  Required:
                  <code className="block mt-2 bg-gray-900/70 p-3 rounded">
                    NEXT_PUBLIC_SUPABASE_URL
                    {'\n'}
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                </div>
                <div className="text-gray-400">
                  Find them in Supabase Dashboard → Project Settings → API.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Motioner
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Transform GitHub PRs into high-energy changelog videos for X
          </p>
          <p className="text-lg text-gray-400 mb-12">
            The Automated Dev-Rel. Turn your pull requests into 30-second viral
            videos automatically.
          </p>

          {user ? (
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Link
                  href="/create"
                  className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition"
                >
                  Create Video
                </Link>
                <Link
                  href="/editor"
                  className="inline-block bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg text-lg font-semibold transition"
                >
                  My Videos
                </Link>
              </div>
              <div className="text-gray-400">
                Welcome back, {user.email}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition"
              >
                Get Started
              </Link>
              <p className="text-sm text-gray-500">
                Sign in with GitHub to begin
              </p>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🤖 AI-Powered</h3>
              <p className="text-gray-400">
                GPT-4o analyzes your PRs and generates engaging scripts
                automatically
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🎬 Remotion</h3>
              <p className="text-gray-400">
                Programmatic video generation with React. No video editing
                skills needed.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">⚡ Fast</h3>
              <p className="text-gray-400">
                Render videos in seconds with AWS Lambda. Ready to post on X.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
