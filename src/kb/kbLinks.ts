import type { RepoLink } from './types'

/** Commits the generated datasets were read from. Links pin to these so they never drift. */
export const PINNED_REPOS: Record<string, RepoLink> = {
  revex: {
    name: 'ghl-revex-backend',
    url: 'https://github.com/GoHighLevel/ghl-revex-backend',
    ref: '711e705609d1583ab7e37d48841139843ca68de1'
  },
  saas: {
    name: 'saas-service',
    url: 'https://github.com/GoHighLevel/saas-service',
    ref: '84344d9d621648cfcfcefa0dd937a5384169ab65'
  }
}

/** Merge extra repo maps under the pinned ones; pinned entries always win. */
export function buildRepoLinks(extra: Record<string, RepoLink> = {}): Record<string, RepoLink> {
  const merged: Record<string, RepoLink> = {}
  for (const [key, link] of Object.entries({ ...extra, ...PINNED_REPOS })) {
    merged[key] = { name: key, ...link }
  }
  return merged
}

/** GitHub blob permalink for a repo key + path (+ optional line), or null when unknown. */
export function githubUrl(
  links: Record<string, RepoLink>,
  repo: string | undefined,
  path: string | undefined,
  line?: number | null
): string | null {
  const link = repo ? links[repo] : undefined
  if (!link || !link.url || !path) return null
  const base = link.url.replace(/\.git$/, '')
  const cleanPath = path.replace(/^\/+/, '')
  return `${base}/blob/${link.ref || 'master'}/${cleanPath}${line ? `#L${line}` : ''}`
}

/** Short label like `controllers/billing.controller.ts:48`. */
export function shortRef(path: string | undefined, line?: number | null): string {
  if (!path) return ''
  const tail = path.split('/').slice(-2).join('/')
  return line ? `${tail}:${line}` : tail
}
