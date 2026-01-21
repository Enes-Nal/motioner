import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

interface SpeedometerProps {
  value: number
  primaryColor: string
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  primaryColor,
}) => {
  const frame = useCurrentFrame()

  // Animate the gauge fill
  const gaugeRotation = interpolate(
    frame,
    [0, 60],
    [-135, -135 + (value / 100) * 270],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp',
    }
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      }}
    >
      {/* Speedometer Gauge */}
      <div
        style={{
          width: '300px',
          height: '150px',
          position: 'relative',
        }}
      >
        {/* Gauge Arc */}
        <svg
          width="300"
          height="150"
          viewBox="0 0 300 150"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path
            d="M 50 150 A 100 100 0 0 1 250 150"
            fill="none"
            stroke="#333"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 50 150 A 100 100 0 0 1 250 150"
            fill="none"
            stroke={primaryColor}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 314} 314`}
            style={{
              transform: 'rotate(-135deg)',
              transformOrigin: '150px 150px',
            }}
          />
        </svg>

        {/* Needle */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: `translateX(-50%) rotate(${gaugeRotation}deg)`,
            transformOrigin: 'center bottom',
            width: '4px',
            height: '100px',
            backgroundColor: primaryColor,
            borderRadius: '2px',
            boxShadow: `0 0 20px ${primaryColor}`,
          }}
        />
      </div>

      {/* Value Display */}
      <div
        style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: primaryColor,
          textShadow: `0 0 20px ${primaryColor}40`,
        }}
      >
        {Math.round(value)}%
      </div>
      <div
        style={{
          fontSize: '24px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Faster
      </div>
    </div>
  )
}

