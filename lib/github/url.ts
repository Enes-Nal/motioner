export type ParsedGitHubUrl =
  | { type: 'pr'; owner: string; repo: string; prNumber: number }
  | { type: 'repo'; owner: string; repo: string }

export function parseGitHubUrl(input: string): ParsedGitHubUrl | null {
  const trimmed = (input || '').trim()
  if (!trimmed) return null

  // Normalize (support optional protocol, trailing slash, query, fragments)
  const prMatch = trimmed.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:[/?#]|$)/i
  )
  if (prMatch) {
    const [, owner, repo, pr] = prMatch
    return { type: 'pr', owner, repo, prNumber: Number(pr) }
  }

  const repoMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)(?:[/?#]|$)/i)
  if (repoMatch) {
    const [, owner, repo] = repoMatch
    return { type: 'repo', owner, repo }
  }

  return null
}
