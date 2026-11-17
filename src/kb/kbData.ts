import flowsJson from './data/flows.json'
import surfacesJson from './data/surfaces.json'
import collectionsJson from './data/collections.json'
import dataflowJson from './data/dataflow.json'
import controlsJson from './data/controls.json'
import walletSdkJson from './data/walletSdk.json'
import { buildRepoLinks } from './kbLinks'
import type {
  AppSurface,
  ControlsCatalog,
  DataflowMap,
  WalletCollection,
  WalletFlow,
  WalletSdk
} from './types'

export const FLOWS = (flowsJson as { flows: WalletFlow[] }).flows
export const APPS = (surfacesJson as { apps: AppSurface[] }).apps
export const COLLECTIONS = (collectionsJson as unknown as { collections: WalletCollection[] })
  .collections
export const DATAFLOW = dataflowJson as unknown as DataflowMap
const CONTROLS_CATALOG = controlsJson as unknown as ControlsCatalog
export const CONTROLS = CONTROLS_CATALOG.controls
export const CONTROL_GAPS = CONTROLS_CATALOG.gaps
export const WALLET_SDK = walletSdkJson as unknown as WalletSdk
// Controls and the SDK can cite other repos and unmerged branches, so their repo maps join the dataflow one.
export const REPO_LINKS = buildRepoLinks({
  ...DATAFLOW.repos,
  ...CONTROLS_CATALOG.repos,
  ...WALLET_SDK.repos
})

export const KB_TOTALS = {
  flows: FLOWS.length,
  steps: FLOWS.reduce((n, f) => n + f.steps.length, 0),
  apis: APPS.reduce((n, a) => n + (a.apis || []).length, 0),
  workers: APPS.reduce((n, a) => n + (a.workers || []).length + (a.crons || []).length, 0),
  collections: COLLECTIONS.length,
  indexes: COLLECTIONS.reduce((n, c) => n + (c.indexes || []).length, 0)
}

/** Step-kind chip classes (soft tints that read well in light and dark). */
export const KIND_CLASS: Record<string, string> = {
  api: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  'pubsub-worker': 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  worker: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  cron: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'cloud-task': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  webhook: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  'cdc/change-stream': 'bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300',
  service: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

export const METHOD_CLASS: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  POST: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  PUT: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  PATCH: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  DELETE: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
}
