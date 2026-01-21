type GitHubRepoResponse = {
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  topics?: string[]
  default_branch: string
}

type GitHubLanguagesResponse = Record<string, number>

type GitHubReadmeResponse = {
  content: string
  encoding: 'base64'
}

function githubHeaders() {
  // Optional token for higher rate limits
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepoResponse> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch repo: ${owner}/${repo}`)
  return (await res.json()) as GitHubRepoResponse
}

export async function fetchLanguages(owner: string, repo: string): Promise<string[]> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = (await res.json()) as GitHubLanguagesResponse
  return Object.keys(data).slice(0, 6)
}

export async function fetchReadmeText(
  owner: string,
  repo: string
): Promise<string | null> {
  // Use the readme endpoint; it returns base64 content.
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = (await res.json()) as GitHubReadmeResponse
  if (!data?.content) return null
  const buff = Buffer.from(data.content, 'base64')
  return buff.toString('utf8')
}
