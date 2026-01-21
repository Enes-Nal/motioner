import React from 'react'

interface CodeComparisonProps {
  beforeCode: string
  afterCode: string
  primaryColor: string
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({
  beforeCode,
  afterCode,
  primaryColor,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '40px',
        width: '100%',
        maxWidth: '1000px',
      }}
    >
      {/* Before Code */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '18px',
            color: '#999',
            marginBottom: '12px',
            fontWeight: '600',
          }}
        >
          BEFORE
        </div>
        <div
          style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ff6b6b',
            border: '2px solid #ff6b6b40',
            overflow: 'auto',
          }}
        >
          {beforeCode}
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '48px',
          color: primaryColor,
        }}
      >
        →
      </div>

      {/* After Code */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '18px',
            color: '#999',
            marginBottom: '12px',
            fontWeight: '600',
          }}
        >
          AFTER
        </div>
        <div
          style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#51cf66',
            border: `2px solid ${primaryColor}40`,
            overflow: 'auto',
          }}
        >
          {afterCode}
        </div>
      </div>
    </div>
  )
}

