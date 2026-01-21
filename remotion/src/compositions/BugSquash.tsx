import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion'
import { Title } from '../components/Title'
import { BugAnimation } from '../components/BugAnimation'

export interface BugSquashProps extends Record<string, unknown> {
  title: string
  bugDescription: string
  primaryColor: string
}

export const BugSquash: React.FC<BugSquashProps> = ({
  title,
  bugDescription,
  primaryColor,
}) => {
  const frame = useCurrentFrame()

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  })

  // Bug animation: bug appears, then gets squashed
  const bugScale = interpolate(frame, [60, 120], [0, 1], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateRight: 'clamp',
  })
  const bugRotation = interpolate(frame, [120, 180], [0, 360], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateRight: 'clamp',
  })
  const bugOpacity = interpolate(frame, [180, 210], [1, 0], {
    extrapolateRight: 'clamp',
  })

  // Checkmark animation
  const checkmarkScale = interpolate(frame, [180, 240], [0, 1], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateRight: 'clamp',
  })
  const checkmarkOpacity = interpolate(frame, [180, 210], [0, 1], {
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
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: titleOpacity,
          }}
        >
          <Title text={title} primaryColor={primaryColor} />
        </AbsoluteFill>
      </Sequence>

      {/* Bug Animation Sequence */}
      <Sequence from={60} durationInFrames={150}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${bugScale}) rotate(${bugRotation}deg)`,
            opacity: bugOpacity,
          }}
        >
          <BugAnimation
            bugDescription={bugDescription}
            primaryColor={primaryColor}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Checkmark Sequence */}
      <Sequence from={180} durationInFrames={270}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${checkmarkScale})`,
            opacity: checkmarkOpacity,
          }}
        >
          <div
            style={{
              fontSize: '120px',
              color: primaryColor,
              fontWeight: 'bold',
            }}
          >
            ✓
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
