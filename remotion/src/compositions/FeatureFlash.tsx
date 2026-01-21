import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion'
import { Title } from '../components/Title'
import { ScreenshotDisplay } from '../components/ScreenshotDisplay'

export interface FeatureFlashProps extends Record<string, unknown> {
  title: string
  screenshotUrl: string
  primaryColor: string
}

export const FeatureFlash: React.FC<FeatureFlashProps> = ({
  title,
  screenshotUrl,
  primaryColor,
}) => {
  const frame = useCurrentFrame()

  // Title animation: zoom in with fade
  const titleScale = interpolate(frame, [0, 30], [0.8, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  })
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  })

  // Screenshot animation: slide in from bottom
  const screenshotY = interpolate(frame, [60, 120], [100, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  })
  const screenshotOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title Sequence */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
          }}
        >
          <Title text={title} primaryColor={primaryColor} />
        </AbsoluteFill>
      </Sequence>

      {/* Screenshot Sequence */}
      <Sequence from={60} durationInFrames={390}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${screenshotY}px)`,
            opacity: screenshotOpacity,
          }}
        >
          <ScreenshotDisplay url={screenshotUrl} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
