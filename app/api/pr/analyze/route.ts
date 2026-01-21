import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzePR, detectSensitiveInfo, sanitizeCode } from '@/utils/pr-analyzer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prTitle, prDescription, diffText, prUrl, githubRepo, githubRepoOwner, githubPrId, prNumber } =
      await request.json()

    if (!prTitle || !prDescription || !diffText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for sensitive information
    const hasSensitiveInfo = detectSensitiveInfo(diffText)
    const sanitizedDiff = hasSensitiveInfo ? sanitizeCode(diffText) : diffText

    // Analyze PR
    const analysis = await analyzePR(prTitle, prDescription, sanitizedDiff)

    // Store PR in database
    const { data: prData, error: prError } = await supabase
      .from('pull_requests')
      .insert({
        user_id: user.id,
        github_pr_id: githubPrId,
        github_repo: githubRepo,
        github_repo_owner: githubRepoOwner,
        title: prTitle,
        description: prDescription,
        diff_text: sanitizedDiff,
        pr_url: prUrl,
        pr_number: prNumber,
        merged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (prError) {
      console.error('Error storing PR:', prError)
      // Continue even if storage fails
    }

    // Create video record
    const remotionProps = {
      theme: analysis.theme,
      title: analysis.title,
      primaryColor: analysis.primaryColor,
      ...(analysis.theme === 'refactor' && {
        beforeCode: analysis.beforeCode,
        afterCode: analysis.afterCode,
        speedImprovement: analysis.speedImprovement,
      }),
      ...(analysis.theme === 'bug' && {
        bugDescription: analysis.bugDescription,
      }),
      ...(analysis.theme === 'feature' && {
        screenshotUrl: analysis.screenshotUrl,
      }),
    }

    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert({
        pull_request_id: prData?.id,
        user_id: user.id,
        theme: analysis.theme,
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
      console.error('Error creating video:', videoError)
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analysis,
      videoId: videoData.id,
      hasSensitiveInfo,
    })
  } catch (error: any) {
    console.error('PR analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze PR' },
      { status: 500 }
    )
  }
}

