# Motioner - The Automated Dev-Rel

Transform GitHub PRs into 30-second high-energy changelog videos for X (Twitter).

## Features

- 🤖 **AI-Powered Analysis**: GPT-4o analyzes PRs and generates engaging scripts
- 🎬 **Remotion Templates**: Three core templates (Feature Flash, Refactor/Speed, Bug Squash)
- ⚡ **Fast Rendering**: Ready for AWS Lambda or Remotion Lambda integration
- 🎨 **HITL Interface**: Human-in-the-loop editor to review and tweak before rendering
- 🔒 **Brand Safety**: Automatic detection and sanitization of sensitive information

## Tech Stack

- **Frontend**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Video**: Remotion (React-based programmatic video)
- **AI**: OpenAI GPT-4o
- **Auth**: Supabase Auth with GitHub OAuth

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run migrations:
     ```bash
     npx supabase db push
     ```
   - Configure GitHub OAuth in Supabase Dashboard

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Fill in your Supabase and OpenAI credentials
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Start Remotion Studio** (in a separate terminal):
   ```bash
   cd remotion
   npm install
   npm run dev
   ```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── pr/           # PR analysis endpoints
│   │   └── video/        # Video rendering endpoints
│   ├── editor/            # HITL editor interface
│   └── auth/             # Auth callbacks
├── remotion/              # Remotion video project
│   └── src/
│       ├── compositions/  # Video templates
│       └── components/   # Reusable video components
├── lib/                   # Shared utilities
│   └── supabase/         # Supabase client helpers
├── utils/                 # Utility functions
│   └── pr-analyzer.ts    # PR analysis logic
└── supabase/
    └── migrations/       # Database migrations
```

## Core Templates

1. **Feature Flash**: High-energy showcase of new features with UI screenshots
2. **Refactor/Speed**: Split-screen code comparison with speedometer gauge
3. **Bug Squash**: Playful animation showing bug fixes

## API Endpoints

### POST `/api/pr/analyze`
Analyzes a GitHub PR and generates video props.

**Request Body**:
```json
{
  "prTitle": "string",
  "prDescription": "string",
  "diffText": "string",
  "prUrl": "string",
  "githubRepo": "string",
  "githubRepoOwner": "string",
  "githubPrId": "number",
  "prNumber": "number"
}
```

### POST `/api/video/render`
Starts video rendering process.

**Request Body**:
```json
{
  "videoId": "uuid",
  "remotionProps": {}
}
```

## Roadmap

### MVP (Current)
- ✅ Basic Remotion templates
- ✅ PR analysis with GPT-4o
- ✅ HITL editor interface
- ✅ Database schema

### V1 (Future)
- [ ] GitHub webhook integration
- [ ] AWS Lambda rendering
- [ ] Multi-modal inputs (video transcription)
- [ ] X (Twitter) OAuth integration
- [ ] Automated posting
- [ ] 20+ custom brand themes
- [ ] Background music sync

## License

MIT
