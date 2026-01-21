import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion'
import { Title } from '../components/Title'
import { CodeComparison } from '../components/CodeComparison'
import { Speedometer } from '../components/Speedometer'

export interface RefactorSpeedProps extends Record<string, unknown> {
  title: string
  beforeCode: string
  afterCode: string
  speedImprovement: number
  primaryColor: string
}

export const RefactorSpeed: React.FC<RefactorSpeedProps> = ({
  title,
  beforeCode,
  afterCode,
  speedImprovement,
  primaryColor,
}) => {
  const frame = useCurrentFrame()

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  })

  // Code comparison animation
  const codeOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateRight: 'clamp',
  })

  // Speedometer animation
  const speedometerValue = interpolate(
    frame,
    [180, 300],
    [0, speedImprovement],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp',
    }
  )
  const speedometerOpacity = interpolate(frame, [180, 210], [0, 1], {
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

      {/* Code Comparison Sequence */}
      <Sequence from={60} durationInFrames={180}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: codeOpacity,
            padding: '40px',
          }}
        >
          <CodeComparison
            beforeCode={beforeCode}
            afterCode={afterCode}
            primaryColor={primaryColor}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Speedometer Sequence */}
      <Sequence from={180} durationInFrames={270}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: speedometerOpacity,
          }}
        >
          <Speedometer
            value={speedometerValue}
            primaryColor={primaryColor}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
