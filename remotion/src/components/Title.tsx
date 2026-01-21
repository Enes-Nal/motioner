import React from 'react'

interface TitleProps {
  text: string
  primaryColor: string
}

export const Title: React.FC<TitleProps> = ({ text, primaryColor }) => {
  return (
    <div
      style={{
        fontSize: '72px',
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        padding: '40px',
        textShadow: `0 0 40px ${primaryColor}40`,
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  )
}

