import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeRepoOverview } from '@/utils/pr-analyzer'
import { fetchLanguages, fetchReadmeText, fetchRepo } from '@/lib/github/api'
import { parseGitHubUrl } from '@/lib/github/url'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repoUrl } = await request.json()
    if (!repoUrl) {
      return NextResponse.json({ error: 'Repo URL is required' }, { status: 400 })
    }

    const parsed = parseGitHubUrl(repoUrl)
    if (!parsed || parsed.type !== 'repo') {
      return NextResponse.json(
        { error: 'Invalid GitHub repo URL. Format: https://github.com/owner/repo' },
        { status: 400 }
      )
    }

    const { owner, repo } = parsed

    const [repoInfo, languages, readmeText] = await Promise.all([
      fetchRepo(owner, repo),
      fetchLanguages(owner, repo),
      fetchReadmeText(owner, repo),
    ])

    const analysis = await analyzeRepoOverview({
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      readmeText,
      languages,
      topics: repoInfo.topics || [],
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
    })

    const remotionProps = {
      theme: 'feature',
      title: analysis.title,
      primaryColor: analysis.primaryColor,
      screenshotUrl: analysis.screenshotUrl || '',
      // If the model provided highlightCode, keep it around (editor doesn't render it today for "feature",
      // but we store it and can use it later).
      highlightCode: analysis.highlightCode || '',
      repoFullName: repoInfo.full_name,
    }

    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert({
        pull_request_id: null,
        user_id: user.id,
        theme: 'feature',
        title: analysis.title,
        voiceover_script: analysis.voiceoverScript,
        highlight_code: analysis.highlightCode,
        duration_seconds: analysis.durationSeconds,
        remotion_props: remotionProps,
        status: 'pending',
      })
      .select()
      .single()

    if (videoError) {
      console.error('Error creating repo video record:', videoError)
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 })
    }

    return NextResponse.json({
      analysis,
      videoId: videoData.id,
      repo: repoInfo.full_name,
    })
  } catch (error: unknown) {
    console.error('Repo analysis error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze repo'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
