# Remotion Video Templates

This directory contains the Remotion video compositions for Motioner.

## Structure

- `src/compositions/` - Main video templates (FeatureFlash, RefactorSpeed, BugSquash)
- `src/components/` - Reusable video components (Title, CodeComparison, etc.)
- `src/Root.tsx` - Composition registry
- `src/index.ts` - Entry point

## Development

```bash
npm run dev
```

This starts Remotion Studio where you can preview and develop video compositions.

## Building

```bash
npm run build
```

## Rendering

For local rendering:
```bash
npx remotion render src/index.ts FeatureFlash out/video.mp4
```

For production, use Remotion Lambda (configured in the main Next.js app).

## Compositions

### FeatureFlash
High-energy showcase of new features with UI screenshots.

**Props:**
- `title: string`
- `screenshotUrl: string`
- `primaryColor: string`

### RefactorSpeed
Split-screen code comparison with animated speedometer.

**Props:**
- `title: string`
- `beforeCode: string`
- `afterCode: string`
- `speedImprovement: number`
- `primaryColor: string`

### BugSquash
Playful animation showing bug fixes.

**Props:**
- `title: string`
- `bugDescription: string`
- `primaryColor: string`

## Customization

All compositions use a consistent design system:
- 1080x1080 resolution (1:1 aspect ratio for X/Twitter)
- 30 FPS
- 15 seconds duration (450 frames)
- Dark theme with customizable primary color

