import type { ApiSurface, AppSurface, SdkError } from './types'

/** Order the error table reads in: what the caller must act on, then caller bugs, then transport. */
export const ERROR_KIND_ORDER = ['business', 'client', 'transport']

export interface SdkErrorGroup {
  kind: string
  errors: SdkError[]
}

const kindRank = (kind: string): number => {
  const i = ERROR_KIND_ORDER.indexOf(kind)
  return i === -1 ? ERROR_KIND_ORDER.length : i
}

/** Errors grouped by kind in {@link ERROR_KIND_ORDER}; unknown kinds sort last. */
export function errorsByKind(errors: SdkError[]): SdkErrorGroup[] {
  const groups = new Map<string, SdkError[]>()
  for (const e of errors) groups.set(e.kind, [...(groups.get(e.kind) || []), e])
  return [...groups.entries()]
    .sort(([a], [b]) => kindRank(a) - kindRank(b))
    .map(([kind, list]) => ({ kind, errors: list }))
}

const GATEKEEPER_APP = 'revex-wallet-gatekeeper'

/** The Gatekeeper surface entry an SDK method calls, or undefined when it isn't on master. */
export function gatekeeperRoute(
  apps: AppSurface[],
  method: string,
  route: string
): ApiSurface | undefined {
  const full = `/${GATEKEEPER_APP}/${route.replace(/^\/+/, '')}`
  return apps
    .find((a) => a.id === GATEKEEPER_APP)
    ?.apis?.find((x) => x.method === method && x.route === full)
}
