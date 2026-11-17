// Shapes of the Wallet Knowledge Base datasets in ./data (generated from a read-only
// code pass over ghl-revex-backend and saas-service at the SHAs pinned in kbLinks.ts).

export interface CodeRef {
  repo?: string
  path?: string
  line?: number | null
  label?: string
}

export type StepKind =
  | 'api'
  | 'pubsub-worker'
  | 'cron'
  | 'webhook'
  | 'cdc/change-stream'
  | 'cloud-task'
  | 'service'

export interface FlowStep extends CodeRef {
  name: string
  title: string
  detail?: string
  kind?: StepKind | string
  channel?: string
  state?: string
}

export interface WalletFlow {
  id: string
  name: string
  group: string
  subject?: string
  apps?: string[]
  trigger?: string
  instanceKey?: string
  summary?: string
  steps: FlowStep[]
  terminal?: { success?: string[]; failure?: string[] }
  gotchas?: string[]
}

export interface ApiSurface {
  method?: string
  route: string
  handler?: string
  auth?: string
  purpose?: string
  path?: string
  line?: number
}

export interface WorkerSurface {
  name: string
  path?: string
  line?: number
  topic?: string
  subscription?: string
  handles?: string[]
  purpose?: string
}

export interface CronSurface {
  name: string
  schedule?: string
  target?: string
  path?: string
  line?: number
  repo?: string
}

export interface AppSurface {
  id: string
  repo?: string
  root?: string
  description?: string
  deployments?: string[]
  apis?: ApiSurface[]
  workers?: WorkerSurface[]
  crons?: CronSurface[]
}

export interface CollectionIndex {
  keys: Record<string, number | string>
  options?: Record<string, unknown>
  declaredIn?: string
}

export interface WalletCollection {
  name: string
  model?: string
  database?: string
  domain?: string
  purpose?: string
  repo?: string
  path?: string
  line?: number
  fields?: { name: string; type?: string }[]
  indexes?: CollectionIndex[]
  usedBy?: string[]
  notes?: string
}

export interface DataStore {
  id: string
  name: string
  kind: string
  purpose?: string
}

export interface DataPipeline {
  id: string
  from: string
  to: string
  mechanism?: string
  objects?: string[]
  cadence?: string
  owner?: string
  refs?: CodeRef[]
  confidence?: string
}

export interface ClickhouseTable {
  name: string
  engine?: string
  orderBy?: string
  columns?: string[]
  refs?: CodeRef[]
}

export interface RepoLink {
  name?: string
  url: string | null
  ref?: string | null
  note?: string
}

export interface DataflowMap {
  repos: Record<string, RepoLink>
  stores: DataStore[]
  pipelines: DataPipeline[]
  clickhouseTables: ClickhouseTable[]
  snowflake?: {
    summary?: string
    evidence?: (string | (CodeRef & { note?: string; url?: string }))[]
  }
  consumers?: { name: string; reads?: string[]; refs?: CodeRef[] }[]
  gaps?: string[]
}

export interface ReferenceDoc {
  title: string
  where: string
  url: string
}

export interface ReferenceGroup {
  name: string
  docs: ReferenceDoc[]
}

export interface CodeRepo {
  name: string
  url: string
  stack: string
  role: string
  parts: { path: string; note: string }[]
}

export type ControlHop =
  | 'Funding'
  | 'Charging'
  | 'Settlement'
  | 'Refunds & adjustments'
  | 'Ledger'
  | 'Reconciliation'
  | 'Data export'

export type ControlStatus = 'Live' | 'In progress' | 'Missing'

export interface WalletControl {
  id: string
  name: string
  hop: ControlHop | string
  objective: string
  type: 'Preventive' | 'Detective' | string
  automation: 'Automated' | 'Manual' | 'Partial' | string
  status: ControlStatus | string
  description: string
  refs?: CodeRef[]
  weakness?: string
}

export interface ControlGap {
  id: string
  title: string
  hop: ControlHop | string
  impact: string
  evidence?: string
  severity: 'High' | 'Medium' | 'Low' | string
}

export interface ControlsCatalog {
  repos?: Record<string, RepoLink>
  controls: WalletControl[]
  gaps: ControlGap[]
}

export type SdkErrorKind = 'business' | 'client' | 'transport'

export interface SdkMethod {
  name: string
  signature: string
  httpMethod: string
  /** Gatekeeper route without the `/revex-wallet-gatekeeper/` prefix. */
  route: string
  holds: string
  safeToRepeat: boolean
  note: string
  sdkRef: CodeRef
}

export interface SdkError {
  code: string
  kind: SdkErrorKind | string
  when: string
  action: string
  /** Only emitted by Gatekeeper once ghl-revex-backend#17529 merges. */
  needsGatekeeperPr?: boolean
}

export interface SdkOption {
  name: string
  required: boolean
  defaultValue: string
  purpose: string
}

export interface WalletSdk {
  package: string
  version: string
  distTag: string
  renamedFrom: string
  summary: string
  source: CodeRef
  readmeUrl: string
  gatekeeperPr: { number: number; url: string; title: string; state: string }
  adoption: string
  repos: Record<string, RepoLink>
  options: SdkOption[]
  methods: SdkMethod[]
  errors: SdkError[]
  remoteConfig: {
    route: CodeRef
    onGatekeeperMaster: boolean
    sets: string[]
    precedence: string[]
    polling: { label: string; value: string }[]
    changeHow: string
  }
  metrics: { name: string; type: string; labels: string }[]
  headers: { name: string; carries: string }[]
  semantics: { title: string; detail: string }[]
  billableFlow: WalletFlow
}
