import React from 'react'

interface ScreenshotDisplayProps {
  url: string
}

export const ScreenshotDisplay: React.FC<ScreenshotDisplayProps> = ({
  url,
}) => {
  if (!url) {
    return (
      <div
        style={{
          width: '800px',
          height: '600px',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '24px',
        }}
      >
        Screenshot Placeholder
      </div>
    )
  }

  return (
    <img
      src={url}
      alt="Feature Screenshot"
      style={{
        maxWidth: '900px',
        maxHeight: '700px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    />
  )
}

