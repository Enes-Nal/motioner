import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId, remotionProps } = await request.json()

    if (!videoId || !remotionProps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update video status to rendering
    await supabase
      .from('videos')
      .update({ status: 'rendering' })
      .eq('id', videoId)
      .eq('user_id', user.id)

    // TODO: Integrate with Remotion Lambda or local rendering
    // For now, return success
    // In production, this would trigger a Lambda function or use Remotion Lambda

    return NextResponse.json({
      success: true,
      message: 'Video rendering started',
      videoId,
    })
  } catch (error: any) {
    console.error('Video render error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start video render' },
      { status: 500 }
    )
  }
}

