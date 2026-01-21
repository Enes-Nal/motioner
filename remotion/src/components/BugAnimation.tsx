import React from 'react'

interface BugAnimationProps {
  bugDescription: string
  primaryColor: string
}

export const BugAnimation: React.FC<BugAnimationProps> = ({
  bugDescription,
  primaryColor,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
      }}
    >
      {/* Bug Icon */}
      <div
        style={{
          fontSize: '120px',
          color: primaryColor,
        }}
      >
        🐛
      </div>
      <div
        style={{
          fontSize: '32px',
          color: '#fff',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        {bugDescription}
      </div>
    </div>
  )
}

