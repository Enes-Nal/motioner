import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize AI clients
const openRouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Motioner - Automated Dev-Rel',
      },
    })
  : null

const openai = process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null

// Determine which AI provider to use (priority: OpenRouter > Claude > OpenAI)
const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const useClaude = !!process.env.ANTHROPIC_API_KEY && !useOpenRouter
const useOpenAI = !!process.env.OPENAI_API_KEY && !useOpenRouter && !useClaude

if (!useOpenRouter && !useClaude && !useOpenAI) {
  console.warn(
    'Warning: No AI API key found. Set OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY'
  )
}

export interface PRAnalysis {
  theme: 'feature' | 'refactor' | 'bug'
  title: string
  highlightCode?: string
  voiceoverScript: string
  durationSeconds: number
  primaryColor: string
  beforeCode?: string
  afterCode?: string
  speedImprovement?: number
  bugDescription?: string
  screenshotUrl?: string
}

export async function analyzePR(
  prTitle: string,
  prDescription: string,
  diffText: string
): Promise<PRAnalysis> {
  const systemPrompt = `You are a creative director for developer relations videos. Your job is to analyze GitHub PRs and create engaging 30-second video concepts.

Analyze the PR and determine:
1. Theme: "feature", "refactor", or "bug"
2. A catchy title (max 60 characters)
3. Key code snippets to highlight
4. A high-energy voiceover script (15-20 seconds when spoken)
5. Visual theme color (hex code)
6. For refactors: before/after code and speed improvement percentage
7. For bugs: bug description

Return your analysis as JSON matching this structure:
{
  "theme": "feature" | "refactor" | "bug",
  "title": "string",
  "highlightCode": "string (optional)",
  "voiceoverScript": "string",
  "durationSeconds": 15,
  "primaryColor": "#hexcolor",
  "beforeCode": "string (for refactor)",
  "afterCode": "string (for refactor)",
  "speedImprovement": number (for refactor),
  "bugDescription": "string (for bug)",
  "screenshotUrl": "string (optional)"
}`

  const userPrompt = `PR Title: ${prTitle}

PR Description:
${prDescription}

Diff:
${diffText.substring(0, 4000)}`

  let content: string

  if (useOpenRouter && openRouter) {
    // Use OpenRouter with DeepSeek model
    const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free'
    
    const response = await openRouter.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const messageContent = response.choices[0]?.message?.content
    if (!messageContent) {
      throw new Error('Failed to get analysis from OpenRouter')
    }

    content = messageContent
  } else if (useClaude && anthropic) {
    // Use Anthropic Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${userPrompt}\n\nPlease respond with valid JSON only, matching the structure specified in the system prompt.`,
        },
      ],
    })

    const textContent = response.content.find(
      (item) => item.type === 'text'
    ) as { type: 'text'; text: string } | undefined

    if (!textContent) {
      throw new Error('Failed to get analysis from Claude')
    }

    content = textContent.text
  } else if (useOpenAI && openai) {
    // Use OpenAI GPT-4o
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const messageContent = response.choices[0]?.message?.content
    if (!messageContent) {
      throw new Error('Failed to get analysis from OpenAI')
    }

    content = messageContent
  } else {
    throw new Error(
      'No AI provider configured. Set OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY'
    )
  }

  // Parse JSON response (Claude may return JSON wrapped in markdown code blocks)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    // Extract JSON from markdown code block
    const match = jsonContent.match(/```(?:json)?\n([\s\S]*?)\n```/)
    if (match) {
      jsonContent = match[1]
    }
  }

  return JSON.parse(jsonContent) as PRAnalysis
}

export function detectSensitiveInfo(text: string): boolean {
  // Simple detection patterns - can be enhanced
  const patterns = [
    /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9]{20,}/i,
    /secret\s*[:=]\s*['"]?[a-zA-Z0-9]{20,}/i,
    /password\s*[:=]\s*['"]?[a-zA-Z0-9]{8,}/i,
    /token\s*[:=]\s*['"]?[a-zA-Z0-9]{20,}/i,
    /https?:\/\/[a-zA-Z0-9.-]+\.internal/i,
    /https?:\/\/[a-zA-Z0-9.-]+\.local/i,
  ]

  return patterns.some((pattern) => pattern.test(text))
}

export function sanitizeCode(code: string): string {
  // Remove potential sensitive information
  let sanitized = code

  // Replace API keys
  sanitized = sanitized.replace(
    /(api[_-]?key|secret|password|token)\s*[:=]\s*['"]?[a-zA-Z0-9]{20,}['"]?/gi,
    '$1: "***REDACTED***"'
  )

  // Replace internal URLs
  sanitized = sanitized.replace(
    /https?:\/\/[a-zA-Z0-9.-]+\.(internal|local)/gi,
    'https://***REDACTED***'
  )

  return sanitized
}

