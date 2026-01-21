export type VideoTheme = 'feature' | 'refactor' | 'bug'

export interface BaseVideoProps {
  title: string
  primaryColor: string
}

export interface FeatureFlashProps extends BaseVideoProps {
  theme: 'feature'
  screenshotUrl: string
}

export interface RefactorSpeedProps extends BaseVideoProps {
  theme: 'refactor'
  beforeCode: string
  afterCode: string
  speedImprovement: number
}

export interface BugSquashProps extends BaseVideoProps {
  theme: 'bug'
  bugDescription: string
}

export type VideoProps = FeatureFlashProps | RefactorSpeedProps | BugSquashProps

