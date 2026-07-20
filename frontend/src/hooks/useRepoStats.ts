import { useEffect, useState } from 'react'

export interface RepoStats {
  stars: number | null
  forks: number | null
  issues: number | null
  license: string | null
  language: string | null
  updated: string | null
  description: string | null
}

const FALLBACK: RepoStats = {
  stars: null,
  forks: null,
  issues: null,
  license: null,
  language: 'Rust',
  updated: null,
  description: null,
}

let cache: RepoStats | null = null

/** Live stats from the GitHub API (client-side). Falls back gracefully. */
export function useRepoStats(repo = 'ammaar-engineer/RacerFS'): RepoStats {
  const [stats, setStats] = useState<RepoStats>(cache ?? FALLBACK)

  useEffect(() => {
    if (cache) return
    let alive = true
    
    // Delay API call to let entrance animations complete smoothly
    const timer = setTimeout(() => {
      fetch(`https://api.github.com/repos/${repo}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => {
          if (!alive) return
          cache = {
            stars: d.stargazers_count ?? null,
            forks: d.forks_count ?? null,
            issues: d.open_issues_count ?? null,
            license: d.license?.spdx_id && d.license.spdx_id !== 'NOASSERTION' ? d.license.spdx_id : null,
            language: d.language ?? 'Rust',
            updated: d.pushed_at ?? null,
            description: d.description ?? null,
          }
          setStats(cache!)
        })
        .catch(() => {})
    }, 1500)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [repo])

  return stats
}
