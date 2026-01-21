import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzePR, detectSensitiveInfo, sanitizeCode } from '@/utils/pr-analyzer'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const event = request.headers.get('x-github-event')

    // Only process merged PRs
    if (event !== 'pull_request' || payload.action !== 'closed' || !payload.pull_request.merged) {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 })
    }

    const pr = payload.pull_request
    const repo = payload.repository

    // Webhooks are server-to-server and typically won't have user cookies.
    // Use service role if configured, otherwise fall back to anon client (may fail under RLS).
    const supabase =
      process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient()

    // Try to find user by GitHub username from PR author
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('github_username', pr.user.login)
      .single()

    if (!userProfile) {
      // User not found - could create a notification or skip
      return NextResponse.json(
        { message: 'User not found for GitHub username' },
        { status: 404 }
      )
    }

    // Fetch PR diff (you'll need GitHub API token for this)
    // For now, we'll use the PR description and title
    const diffText = pr.diff_url
      ? await fetch(pr.diff_url).then((r) => r.text()).catch(() => '')
      : ''

    // Check for sensitive information
    const hasSensitiveInfo = detectSensitiveInfo(diffText)
    const sanitizedDiff = hasSensitiveInfo ? sanitizeCode(diffText) : diffText

    // Analyze PR
    const analysis = await analyzePR(
      pr.title,
      pr.body || '',
      sanitizedDiff
    )

    // Store PR in database
    const { data: prData, error: prError } = await supabase
      .from('pull_requests')
      .insert({
        user_id: userProfile.id,
        github_pr_id: pr.number,
        github_repo: repo.name,
        github_repo_owner: repo.owner.login,
        title: pr.title,
        description: pr.body || '',
        diff_text: sanitizedDiff,
        pr_url: pr.html_url,
        pr_number: pr.number,
        merged_at: pr.merged_at,
      })
      .select()
      .single()

    if (prError) {
      console.error('Error storing PR:', prError)
      return NextResponse.json(
        { error: 'Failed to store PR' },
        { status: 500 }
      )
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
        pull_request_id: prData.id,
        user_id: userProfile.id,
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
        { error: 'Failed to create video' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      videoId: videoData.id,
      prId: prData.id,
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
