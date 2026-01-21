import React from 'react'
import { Composition } from 'remotion'
import { FeatureFlash, type FeatureFlashProps } from './compositions/FeatureFlash'
import { RefactorSpeed, type RefactorSpeedProps } from './compositions/RefactorSpeed'
import { BugSquash, type BugSquashProps } from './compositions/BugSquash'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<Record<string, unknown>, FeatureFlashProps>
        id="FeatureFlash"
        component={FeatureFlash}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          title: 'New Feature Released!',
          screenshotUrl: '',
          primaryColor: '#6366f1',
        }}
      />
      <Composition<Record<string, unknown>, RefactorSpeedProps>
        id="RefactorSpeed"
        component={RefactorSpeed}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          title: 'Performance Improved',
          beforeCode: 'const result = await db.query(key);',
          afterCode: 'const result = await cache.get(key) || await db.query(key);',
          speedImprovement: 40,
          primaryColor: '#10b981',
        }}
      />
      <Composition<Record<string, unknown>, BugSquashProps>
        id="BugSquash"
        component={BugSquash}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          title: 'Bug Fixed',
          bugDescription: 'Fixed critical issue',
          primaryColor: '#f59e0b',
        }}
      />
    </>
  )
}
