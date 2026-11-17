import type { ControlGap, WalletControl } from './types'

/** Order of hops in the order-to-cash path; unknown hops sort after these. */
export const HOP_ORDER = [
  'Funding',
  'Charging',
  'Settlement',
  'Refunds & adjustments',
  'Ledger',
  'Reconciliation',
  'Data export'
]

const SEVERITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

const hopRank = (hop: string) => {
  const i = HOP_ORDER.indexOf(hop)
  return i === -1 ? HOP_ORDER.length : i
}

export interface ControlHopGroup {
  hop: string
  controls: WalletControl[]
}

/** Controls grouped by hop in process order, optionally narrowed to one hop/status. */
export function groupControls(
  controls: WalletControl[],
  filter: { hop?: string; status?: string } = {}
): ControlHopGroup[] {
  const groups = new Map<string, WalletControl[]>()
  for (const c of controls) {
    if (filter.hop && c.hop !== filter.hop) continue
    if (filter.status && c.status !== filter.status) continue
    groups.set(c.hop, [...(groups.get(c.hop) || []), c])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => hopRank(a) - hopRank(b))
    .map(([hop, list]) => ({ hop, controls: list }))
}

/** Count of controls per status, with every status present (0 when absent). */
export function statusCounts(controls: WalletControl[]): Record<string, number> {
  const counts: Record<string, number> = { Live: 0, 'In progress': 0, Missing: 0 }
  for (const c of controls) counts[c.status] = (counts[c.status] || 0) + 1
  return counts
}

/** Gaps ordered High → Low, then by hop. */
export function sortGaps(gaps: ControlGap[]): ControlGap[] {
  return [...gaps].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3) ||
      hopRank(a.hop) - hopRank(b.hop)
  )
}
