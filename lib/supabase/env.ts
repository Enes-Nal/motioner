export function getSupabaseEnv() {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!urlRaw || !key) {
    return { ok: false as const, reason: 'missing' as const }
  }

  let url: string
  try {
    const parsed = new URL(urlRaw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false as const, reason: 'invalid_url' as const }
    }
    url = parsed.toString()
  } catch {
    return { ok: false as const, reason: 'invalid_url' as const }
  }

  return { ok: true as const, url, key }
}


