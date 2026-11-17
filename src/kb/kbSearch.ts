import type {
  AppSurface,
  ClickhouseTable,
  ControlGap,
  ReferenceGroup,
  WalletCollection,
  WalletControl,
  WalletFlow,
  WalletSdk
} from './types'

export type SearchKind =
  | 'flow'
  | 'step'
  | 'api'
  | 'worker'
  | 'cron'
  | 'collection'
  | 'table'
  | 'doc'
  | 'control'
  | 'gap'
  | 'sdk'

/** Where a hit takes the user: a KB tab (+ optional item) or an external URL. */
export interface SearchTarget {
  tab: string
  item?: string
  url?: string
}

export interface SearchEntry {
  title: string
  subtitle: string
  kind: SearchKind
  target: SearchTarget
  haystack: string
}

interface SearchSources {
  flows: WalletFlow[]
  apps: AppSurface[]
  collections: WalletCollection[]
  tables: ClickhouseTable[]
  references: ReferenceGroup[]
  controls?: WalletControl[]
  gaps?: ControlGap[]
  sdk?: WalletSdk
}

const join = (parts: (string | undefined | null)[]): string =>
  parts.filter(Boolean).join(' ').toLowerCase()

/** Flatten every dataset into one searchable list. */
export function buildSearchIndex(src: SearchSources): SearchEntry[] {
  const out: SearchEntry[] = []
  for (const f of src.flows) {
    out.push({
      title: f.name,
      subtitle: f.summary || '',
      kind: 'flow',
      target: { tab: 'flows', item: f.id },
      haystack: join([f.name, f.id, f.summary, f.trigger, ...(f.apps || [])])
    })
    for (const s of f.steps) {
      out.push({
        title: s.title || s.name,
        subtitle: `${f.name} · ${s.channel || s.path || ''}`,
        kind: 'step',
        target: { tab: 'flows', item: f.id },
        haystack: join([s.name, s.title, s.detail, s.channel, s.path, s.state])
      })
    }
  }
  for (const a of src.apps) {
    for (const x of a.apis || []) {
      out.push({
        title: `${x.method || ''} ${x.route}`.trim(),
        subtitle: `${a.id} · ${x.purpose || x.handler || ''}`,
        kind: 'api',
        target: { tab: 'surfaces', item: a.id },
        haystack: join([x.method, x.route, x.handler, x.purpose, a.id])
      })
    }
    for (const x of a.workers || []) {
      out.push({
        title: x.name,
        subtitle: `${a.id} · ${x.topic || ''}`,
        kind: 'worker',
        target: { tab: 'surfaces', item: a.id },
        haystack: join([x.name, x.topic, x.subscription, x.purpose, a.id, ...(x.handles || [])])
      })
    }
    for (const x of a.crons || []) {
      out.push({
        title: x.name,
        subtitle: `${a.id} · ${x.schedule || ''}`,
        kind: 'cron',
        target: { tab: 'surfaces', item: a.id },
        haystack: join([x.name, x.schedule, x.target, a.id])
      })
    }
  }
  for (const c of src.collections) {
    out.push({
      title: c.name,
      subtitle: `${c.database || ''} · ${c.purpose || ''}`,
      kind: 'collection',
      target: { tab: 'collections', item: c.name },
      haystack: join([
        c.name,
        c.model,
        c.database,
        c.domain,
        c.purpose,
        ...(c.fields || []).map((f) => f.name)
      ])
    })
  }
  for (const t of src.tables) {
    out.push({
      title: t.name,
      subtitle: `ClickHouse · ${t.engine || ''}`,
      kind: 'table',
      target: { tab: 'data' },
      haystack: join([t.name, t.engine, ...(t.columns || [])])
    })
  }
  for (const g of src.references) {
    for (const d of g.docs) {
      out.push({
        title: d.title,
        subtitle: d.where,
        kind: 'doc',
        target: { tab: 'references', url: d.url },
        haystack: join([d.title, d.where, g.name])
      })
    }
  }
  for (const c of src.controls || []) {
    out.push({
      title: c.name,
      subtitle: `${c.hop} · ${c.status} · ${c.objective}`,
      kind: 'control',
      target: { tab: 'controls' },
      haystack: join([c.name, c.id, c.hop, c.objective, c.description, c.weakness])
    })
  }
  for (const g of src.gaps || []) {
    out.push({
      title: g.title,
      subtitle: `${g.hop} · ${g.severity} gap`,
      kind: 'gap',
      target: { tab: 'controls' },
      haystack: join([g.title, g.id, g.hop, g.impact, g.evidence, 'gap'])
    })
  }
  if (src.sdk) {
    const pkg = src.sdk.package
    for (const m of src.sdk.methods) {
      out.push({
        title: m.name,
        subtitle: `${pkg} · ${m.httpMethod} ${m.route}`,
        kind: 'sdk',
        target: { tab: 'sdk' },
        haystack: join([m.name, m.route, m.note, pkg, 'wallet-sdk gatekeeper-sdk'])
      })
    }
    for (const e of src.sdk.errors) {
      out.push({
        title: e.code,
        subtitle: `${pkg} error · ${e.when}`,
        kind: 'sdk',
        target: { tab: 'sdk' },
        haystack: join([e.code, e.kind, e.when, e.action, 'wallet-sdk error'])
      })
    }
  }
  return out
}

/** Every whitespace-separated term must appear. Empty query returns the flows. */
export function searchIndex(index: SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const hits = terms.length
    ? index.filter((e) => terms.every((t) => e.haystack.includes(t)))
    : index.filter((e) => e.kind === 'flow')
  return hits.slice(0, limit)
}
