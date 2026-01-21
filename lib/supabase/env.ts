export function getSupabaseEnv() {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL
  const keyRaw =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Be forgiving about common copy/paste issues in .env files.
  // (e.g. accidental leading '.' or whitespace)
  const urlCandidate = urlRaw?.trim().replace(/^\.+/, '')
  const keyCandidate = keyRaw?.trim()

  if (!urlCandidate || !keyCandidate) {
    return { ok: false as const, reason: 'missing' as const }
  }

  let url: string
  try {
    const parsed = new URL(urlCandidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false as const, reason: 'invalid_url' as const }
    }
    url = parsed.toString()
  } catch {
    return { ok: false as const, reason: 'invalid_url' as const }
  }

  return { ok: true as const, url, key: keyCandidate }
}
