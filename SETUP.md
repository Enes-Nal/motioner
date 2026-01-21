# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- An AI API key (OpenRouter recommended, or OpenAI / Anthropic)
- A GitHub account (for OAuth)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
cd remotion
npm install
cd ..
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API and copy:
   - Project URL
   - `anon` public key
3. Run migrations:
   ```bash
   npx supabase init
   npx supabase db push
   ```

### 3. Configure GitHub OAuth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable GitHub provider
4. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
5. Add them to Supabase GitHub provider settings

### 4. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
# Optional server-only (webhooks, cron jobs, etc):
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run Development Servers

Terminal 1 (Next.js):
```bash
npm run dev
```

Terminal 2 (Remotion Studio - optional, for video preview):
```bash
npm run remotion:dev
```

### 6. Access the Application

- Next.js app: http://localhost:3001
- Remotion Studio: http://localhost:3000 (when using Remotion Player in editor)

## GitHub Webhook Setup (Optional)

To automatically process PRs when they're merged:

1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add webhook:
   - Payload URL: `https://your-domain.com/api/webhooks/github`
   - Content type: `application/json`
   - Events: `Pull requests`
   - Secret: (optional, add verification if needed)

## Testing the Application

1. Sign in with GitHub at `/login`
2. Go to `/create` and enter a GitHub PR URL
3. The AI will analyze the PR and generate video props
4. Edit the video in the HITL editor at `/editor`
5. Render the video (requires Remotion Lambda setup for production)

## Production Deployment

### Remotion Lambda Setup

For production video rendering, set up Remotion Lambda:

1. Follow [Remotion Lambda documentation](https://www.remotion.dev/docs/lambda)
2. Configure AWS credentials
3. Update `/api/video/render` to use Remotion Lambda

### Environment Variables for Production

Add to your hosting platform (Vercel, etc.):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `REMOTION_LAMBDA_REGION` (if using Remotion Lambda)
- `REMOTION_LAMBDA_ACCESS_KEY_ID` (if using Remotion Lambda)
- `REMOTION_LAMBDA_SECRET_ACCESS_KEY` (if using Remotion Lambda)

## Troubleshooting

### Remotion Player not working

Make sure Remotion components are properly imported and the Player is configured correctly. Check browser console for errors.

### Database errors

Ensure migrations have been run and RLS policies are correctly set up. Check Supabase logs for detailed error messages.

### OpenAI API errors

Verify your API key is correct and you have sufficient credits. Check the API usage dashboard.

### GitHub OAuth not working

Verify callback URL matches exactly in both GitHub OAuth App settings and Supabase provider settings.
