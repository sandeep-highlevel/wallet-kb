// Billing-model view over the ChargeType catalogue: when the wallet is debited relative to
// when the product is delivered. The catalogue itself lives in data/chargeTypes.ts.
import { ALL_CHARGE_TYPES, type ChargeTypeRecord } from './data/chargeTypes'

export type BillingModel = 'bill_first' | 'usage_first' | 'reserve_settle' | 'platform' | 'unconfirmed'
export type Recurrence = 'one-off' | 'per-use' | 'monthly' | 'annual' | 'n/a'

export interface ModelInfo {
  id: BillingModel
  title: string
  short: string
  blurb: string
  /** The order of events, left to right, shown as the model's sequence. */
  sequence: string[]
}

export const MODELS: ModelInfo[] = [
  {
    id: 'bill_first',
    title: 'Bill first, usage later',
    short: 'Bill first',
    blurb: 'The wallet is debited before or at purchase. The product is provisioned or run only after the charge succeeds, so a failed bill blocks it.',
    sequence: ['Request', 'Bill wallet', 'Deliver']
  },
  {
    id: 'usage_first',
    title: 'Usage first, bill later',
    short: 'Usage first',
    blurb: 'A has-funds check may gate the request, but it does not debit. The product is used first and the charge is posted once the quantity is known.',
    sequence: ['Has-funds check', 'Deliver', 'Bill wallet']
  },
  {
    id: 'reserve_settle',
    title: 'Reserve, then settle',
    short: 'Reserve',
    blurb: 'Funds are held before use and the final amount is settled after usage.',
    sequence: ['Reserve', 'Deliver', 'Settle']
  },
  {
    id: 'platform',
    title: 'Platform ledger lines',
    short: 'Platform',
    blurb: 'Credits, refunds, Stripe recharges, churn and tax. Billing writes these itself; they are not product charges.',
    sequence: ['Event', 'Ledger line']
  },
  {
    id: 'unconfirmed',
    title: 'Not confirmed',
    short: 'Not confirmed',
    blurb: 'A billing wrapper exists but no live caller was traced, so the timing is not verified.',
    sequence: ['?']
  }
]

export interface ChargeTypeView extends ChargeTypeRecord {
  model: BillingModel
  recurrence: Recurrence
  modelDetail: string
}

/** Code-verified timing for charge types whose catalogue billTiming is "mixed" or needs a correction. */
export interface ModelOverride {
  model: BillingModel
  recurrence?: Recurrence
  modelDetail: string
}

const NUMBER_RENTAL: ModelOverride = {
  model: 'bill_first',
  recurrence: 'monthly',
  modelDetail:
    'Number rental is paid a month ahead. Purchase: non-debiting has-funds check, the number is bought on Twilio, then the first month is billed straight after (async). If that bill fails, the number is already live. Renewal: Plivo numbers are charged at the start of each month-period, using the same chargeType and a new eventId each month. Twilio ISV numbers are charged once per number per calendar month by the saas-service daily ISV cron (wallet-internal TwilioUsageCharge, category phonenumbers, eventId …-MM-YYYY-phone-number).'
}

const RCS_EXTRA = 'Billed from the Twilio usage-record delta in the daily lc-phone sweep, after Twilio has charged.'

export const MODEL_OVERRIDES: Record<string, ModelOverride> = {
  local: NUMBER_RENTAL,
  mobile: NUMBER_RENTAL,
  toll_free: NUMBER_RENTAL,
  a2p_registration: {
    model: 'usage_first',
    recurrence: 'one-off',
    modelDetail:
      'ISV accounts only. Billed only after Twilio\'s usage record shows the registration fee, in the daily usage sweep. There is no pre-check.'
  },
  VERIFIED_CALLER_ID: {
    model: 'usage_first',
    recurrence: 'one-off',
    modelDetail: 'A charge request is queued after the caller-ID verification call. The debit happens in an external rebilling worker.'
  },
  A2P_FAST_TRACK: {
    model: 'unconfirmed',
    recurrence: 'one-off',
    modelDetail:
      'Priced at a static $2.85 plus a 5% markup by the lc-phone billing worker with fundCheck false. The message publisher is outside ghl-revex-backend, so timing is not traced.'
  },
  funnelAI: {
    model: 'bill_first',
    recurrence: 'per-use',
    modelDetail:
      'After 5 free pages, leadgen funnel-ai charges FUNNEL_AI through ai-wrapper before it publishes the page-generation job. A failed charge throws and nothing is generated (template-ai.service.ts:69 then :118).'
  },
  domainPurchase: {
    model: 'bill_first',
    recurrence: 'annual',
    modelDetail:
      'The same key bills registration, transfer-in, and annual renewal (scheduled auto-renew and manual renew). Each path charges the wallet first, then registers, transfers or renews the domain, and refunds on failure. Auto-renew disables itself after the third failed charge. There is no separate has-funds call; /bill gates it.'
  },
  workflow_premium_actions: {
    model: 'bill_first',
    recurrence: 'per-use',
    modelDetail:
      'Premium actions and premium triggers are billed before they run (BaseAction, BasePremiumAction, TriggerPubSubHandler); a failed bill blocks the action. Exception: agent-tool executions in automation-workflows-backend bill after success.'
  },
  workflow_ai: {
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail:
      'Token-billed AI actions and the AI Agent node bill after the run from aggregated token usage. Has-funds runs only on the first attempt. Child actions with useTokenBilling=false bill before executing.'
  },
  App: {
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail:
      'Developer-reported usage (UBP meters and custom /charges) is billed after the usage is reported. Location and agency has-funds pick the payer. Outbound messages from custom conversation providers and marketplace workflow app actions bill first; see the separate entry.'
  },
  Email: {
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail: 'Has-funds before send, then the email-isv billing worker bills after the send through Pub/Sub. Inbound and forwarded email are also billed as Email.'
  },
  autoCompleteAddress: {
    model: 'unconfirmed',
    recurrence: 'per-use',
    modelDetail:
      'The bill wrapper exists (common-google billing-api.ts:146) but nothing calls it; places.service only writes a GoogleApiTransaction. Either a batch biller lives elsewhere or it is unbilled.'
  },
  call_recording_storage: {
    model: 'usage_first',
    recurrence: 'monthly',
    modelDetail: 'Storage is averaged over the days elapsed and billed afterwards. It is skipped for ISV accounts in the usage-category sweep.'
  }
}

const REVEX = 'GoHighLevel/ghl-revex-backend'
const base = {
  pattern: 'A',
  repo: REVEX,
  displayNames: undefined,
  hasFunds: 'no' as const,
  hasFundsDetail: 'No pre-check on this path',
  fundCheck: 'false',
  fundCheckDetail: 'lc-phone bill payloads send fundCheck false',
  hasFundsPaths: [] as string[],
  notes: ''
}

/** Usage categories billed by the daily Twilio usage-record sweep. */
const usageCategory = (chargeType: string, product: string, note = ''): ChargeTypeRecord & ModelOverride => ({
  ...base,
  chargeType,
  product,
  family: 'Phone',
  app: 'lc-phone',
  billTiming: 'after',
  billTimingDetail: RCS_EXTRA,
  originPath: 'apps/lc-phone/src/billing/constants/billingConstants.ts:448',
  billPaths: ['apps/lc-phone/src/billing/providers/twilio/services/twilio.usage.record.service.ts:792', 'apps/lc-phone/src/billing/providers/twilio/twilio-billing.provider.ts:607'],
  notes: note,
  model: 'usage_first',
  recurrence: 'per-use',
  modelDetail: RCS_EXTRA
})

const whatsapp = (chargeType: string, detail: string, preCheck: boolean): ChargeTypeRecord & ModelOverride => ({
  ...base,
  chargeType,
  product: 'WhatsApp',
  family: 'WhatsApp',
  app: 'lc-phone',
  hasFunds: preCheck ? 'yes' : 'no',
  hasFundsDetail: preCheck ? 'Before outbound send or call' : 'No pre-check',
  billTiming: 'after',
  billTimingDetail: detail,
  originPath: 'apps/lc-phone/src/whatsapp-account/whatsapp-pricing/consts/whatsapp-pricing.const.ts:2',
  billPaths: ['apps/lc-phone/src/whatsapp-account/whatsapp-pricing/services/whatsapp-pricing.service.ts:446'],
  model: 'usage_first',
  recurrence: 'per-use',
  modelDetail: detail
})

/** Charge types confirmed in code that the catalogue does not list yet. */
export const EXTRA_CHARGE_TYPES: Array<ChargeTypeRecord & ModelOverride> = [
  {
    ...base,
    chargeType: 'national',
    product: 'LC Phone',
    family: 'Phone',
    app: 'lc-phone',
    hasFunds: 'yes',
    hasFundsDetail: 'validateFundsForPurchase before buying (non-debiting, fails open)',
    billTiming: 'mixed',
    billTimingDetail: NUMBER_RENTAL.modelDetail,
    originPath: 'apps/lc-phone/src/numbers/numbers.service.ts:2099',
    billPaths: ['apps/lc-phone/src/numbers/numbers.service.ts:2223', 'apps/lc-phone/src/billing/plivo-monthly-billing.service.ts:230'],
    notes: 'National number subtype; same purchase and renewal path as local, mobile and toll_free.',
    ...NUMBER_RENTAL
  },
  {
    ...base,
    chargeType: '<productCode>',
    displayNames: ['wallet subscription', 'reselling lifetime plan'],
    product: 'Wallet subscriptions',
    family: 'Subscriptions',
    app: 'wallet-subscriptions',
    hasFunds: 'yes',
    hasFundsDetail: 'Funds checked inside /bill (fundCheck not sent, so it defaults to true)',
    fundCheck: 'omitted→true',
    fundCheckDetail: 'subscription.helper.ts sends no fundCheck',
    billTiming: 'before',
    billTimingDetail: 'Charge covers [date, nextExecutionAt]',
    originPath: 'apps/wallet-subscriptions/src/subscriptions/subscription.helper.ts:61',
    billPaths: ['apps/wallet-subscriptions/src/subscriptions/subscription.service.ts:397', 'apps/reselling/src/subscription/subscription-payment.service.ts:1105'],
    notes: 'The chargeType is the product\'s productCode, configured in the database. Reselling lifetime plans use the same path.',
    model: 'bill_first',
    recurrence: 'monthly',
    modelDetail:
      'The wallet is billed for the whole period [today, nextExecutionAt] first. Only after the bill succeeds is the invoice set PAID and the subscription set ACTIVE with the next run date. A failed bill goes to a retry worker. Renewals are charged at the start of each new period.'
  },
  {
    ...base,
    chargeType: 'phone_numbers',
    product: 'LC Phone (agency Twilio)',
    family: 'Phone',
    app: 'lc-phone',
    billTiming: 'after',
    billTimingDetail: 'Twilio usage-record delta',
    originPath: 'apps/lc-phone/src/billing/constants/billingConstants.ts:434',
    billPaths: ['apps/lc-phone/src/billing/providers/twilio/services/twilio.usage.record.service.ts:792'],
    notes: 'Non-ISV accounts with rebilling on. Skipped for ISV accounts.',
    model: 'usage_first',
    recurrence: 'monthly',
    modelDetail: 'Number rental on the agency\'s own Twilio account. It is rebilled after Twilio has charged, from the usage-record delta in the daily sweep.'
  },
  {
    ...base,
    chargeType: 'rcs_activation_fee',
    product: 'RCS sender',
    family: 'Phone',
    app: 'lc-cpaas-compliance',
    billTiming: 'after',
    billTimingDetail: 'Charged when the RCS registration is approved',
    originPath: 'apps/lc-cpaas-compliance/src/rcs-registrations/providers/twilio/twilioRcsRegistration.service.ts:548',
    billPaths: ['apps/lc-phone/src/billing/billing.service.ts:364'],
    notes: '$500, deduped per sender.',
    model: 'usage_first',
    recurrence: 'one-off',
    modelDetail: 'Published from the approval side effects, after the RCS sender registration is approved. The first annual verification fee can be added to the same charge.'
  },
  {
    ...base,
    chargeType: 'annual_rcs_brand_verification_fees',
    product: 'RCS sender',
    family: 'Phone',
    app: 'lc-phone',
    billTiming: 'before',
    billTimingDetail: 'Charged on each anniversary for the coming year',
    originPath: 'apps/lc-phone/src/billing/constants/billingConstants.ts:357',
    billPaths: ['apps/lc-phone/src/billing/billing.service.ts:579'],
    notes: '$200 per year, deduped with chargeExists and a compliance record.',
    model: 'bill_first',
    recurrence: 'annual',
    modelDetail: 'A daily lc-cpaas-pam sweep charges the yearly brand verification fee on or after each anniversary, for the year ahead.'
  },
  usageCategory('rcs_carrier_fees', 'LC Phone'),
  usageCategory('international_number_porting', 'LC Phone'),
  whatsapp('whatsapp_service_message', 'Billed from the Meta status webhook pricing object after the message is sent.', true),
  whatsapp('whatsapp_free_entry_point_message', 'Billed from the Meta status webhook pricing object after the message is sent.', true),
  whatsapp('whatsapp_inbound_message', 'Billed when the inbound message is received.', false),
  whatsapp('whatsapp_inbound_calls', 'Priced from call duration (pulses) after the call.', false),
  {
    ...base,
    chargeType: 'domainRedemption',
    product: 'Domain Purchase',
    family: 'Leadgen',
    repo: 'GoHighLevel/leadgen-backend',
    app: 'domains',
    hasFunds: 'yes',
    hasFundsDetail: 'checkFundsForRestore before the two /bill calls',
    fundCheck: 'omitted→true',
    fundCheckDetail: 'reselling.service bill body omits fundCheck',
    billTiming: 'before',
    billTimingDetail: 'Charge redemption and the renewal part, then restore',
    originPath: 'apps/domains/helper/const.ts:21',
    billPaths: ['apps/domains/src/reselling/reselling.service.ts:2731', 'apps/domains/src/reselling/reselling.service.ts:2820'],
    notes: 'Expired-domain restore. The renewal part is billed as domainPurchase.',
    model: 'bill_first',
    recurrence: 'one-off',
    modelDetail: 'Restoring an expired domain: a has-funds check, then two /bill calls (redemption fee and the renewal part), then the Cloudflare restore.'
  },
  {
    ...base,
    chargeType: 'App (outbound/actions)',
    displayNames: ['App'],
    product: 'Marketplace App',
    family: 'Marketplace',
    repo: 'GoHighLevel/marketplace-backend',
    app: 'conversations',
    hasFunds: 'yes',
    hasFundsDetail: 'Through pay() before dispatch',
    fundCheck: 'omitted→true',
    fundCheckDetail: 'MarketplaceTransaction',
    billTiming: 'before',
    billTimingDetail: 'Billed before dispatch or execution',
    originPath: 'apps/conversations/src/models/firestore/message.ts:3091',
    billPaths: ['apps/conversations/src/models/firestore/message.ts:4326'],
    notes: 'Same product key App; shown separately because the timing differs. Outbound billing errors are swallowed.',
    model: 'bill_first',
    recurrence: 'per-use',
    modelDetail:
      'Outbound messages from custom conversation providers are billed before dispatch, and marketplace workflow app actions and triggers are skipped if billing fails. Inbound messages are billed on receipt.'
  },
  {
    ...base,
    chargeType: 'emailWarmup',
    product: 'LC Email',
    family: 'Email',
    repo: 'GoHighLevel/marketplace-backend',
    app: 'email-isv',
    hasFunds: 'partial',
    hasFundsDetail: 'Warm-up pauses on insufficient funds',
    fundCheck: 'false',
    fundCheckDetail: 'SMTP webhook worker',
    billTiming: 'after',
    billTimingDetail: 'Billed from the SMTP webhook',
    originPath: 'apps/email-isv/src/const.ts:147',
    billPaths: ['apps/email-isv/workers/handlers/smtpWebhookWorker.handler.ts:190'],
    notes: 'Price is $0 while BETA_CUSTOMERS is enabled.',
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail: 'Email domain warm-up sends are billed from the SMTP webhook after they go out.'
  },
  ...['aiStudio', 'emailAI', 'creatorStudio', 'voiceAIWidget', 'voiceAIOutbound', 'conversation_AI'].map(
    (chargeType): ChargeTypeRecord & ModelOverride => ({
      ...base,
      chargeType,
      product: chargeType === 'conversation_AI' ? 'Conversation AI' : chargeType === 'aiStudio' ? 'AI Studio' : chargeType.startsWith('voiceAI') ? 'Voice AI' : chargeType === 'emailAI' ? 'Email AI' : 'Creator Studio',
      family: 'AI',
      repo: 'GoHighLevel/ai-backend',
      app: 'ai-wrapper',
      hasFunds: 'yes',
      hasFundsDetail: 'ai-wrapper /has-funds or /allowed before the model runs',
      fundCheck: 'false',
      fundCheckDetail: 'ai-wrapper /charge',
      billTiming: 'after',
      billTimingDetail: 'Charged through ai-wrapper /charge after usage',
      originPath: 'apps/ai-wrapper/src/billing/product-mapping.ts:7',
      billPaths: ['apps/ai-wrapper/src/helpers/billingHelper.ts:433'],
      notes: chargeType === 'aiStudio' ? 'AI Studio Cloud: one /charge per backend per finished UTC hour.' : chargeType === 'conversation_AI' ? 'Split key; legacy conversationAI.' : '',
      model: 'usage_first',
      recurrence: chargeType === 'aiStudio' ? 'monthly' : 'per-use',
      modelDetail:
        chargeType === 'aiStudio'
          ? 'Backend-hours are charged after each finished UTC hour.'
          : 'Has-funds before the model runs, charge through ai-wrapper /charge after usage. With the walletGatekeeper flag on (off by default) it becomes reserve-then-settle.'
    })
  ),
  {
    ...base,
    chargeType: 'CallSMSCharge',
    product: 'LC Phone (wallet-internal)',
    family: 'Phone',
    repo: 'GoHighLevel/saas-service',
    app: null,
    hasFunds: 'yes',
    hasFundsDetail: 'Pre-send check in marketplace conversations',
    fundCheck: 'na',
    fundCheckDetail: 'Direct wallet transaction, not /bill',
    billTiming: 'after',
    billTimingDetail: 'After the message or call completes',
    originPath: 'src/handlers/callSMSCharge/index.ts:330',
    billPaths: ['src/handlers/callSMSCharge/processCompletedMessage.ts:324'],
    notes: 'saas-service owns this wallet path; it does not go through /bill.',
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail: 'SMS and calls on the saas-service path are written as a direct wallet transaction after the message or call completes.'
  },
  {
    ...base,
    chargeType: 'TwilioUsageCharge',
    product: 'LC Phone (wallet-internal)',
    family: 'Phone',
    repo: 'GoHighLevel/saas-service',
    app: null,
    hasFunds: 'no',
    hasFundsDetail: 'No pre-check',
    fundCheck: 'na',
    fundCheckDetail: 'Direct wallet transaction, not /bill',
    billTiming: 'after',
    billTimingDetail: 'Daily cron from Twilio usage records',
    originPath: 'src/handlers/callSMSCharge/index.ts:439',
    billPaths: ['src/handlers/callSMSCharge/twilioUsageRecordsBilling.ts:52', 'src/handlers/isvMode/isvMode.services.ts:1284'],
    notes: 'Exception: the phonenumbers category is number rental, charged once per number per month while the number is held.',
    model: 'usage_first',
    recurrence: 'per-use',
    modelDetail:
      'Usage categories (recording storage and others) are billed after the fact from Twilio usage records. The phonenumbers category is the exception: ISV number rental is charged once per number per calendar month, ahead of use.'
  },
  {
    ...base,
    chargeType: '<gatekeeper event>',
    displayNames: ['gatekeeper', 'validate-and-bill-event'],
    product: 'Gatekeeper-metered usage',
    family: 'Platform',
    app: 'revex-wallet-gatekeeper',
    hasFunds: 'yes',
    hasFundsDetail: 'Funds evaluated on the wallet snapshot (funds.evaluator.ts:38)',
    fundCheck: 'na',
    fundCheckDetail: 'Settles through billing v2/bill',
    billTiming: 'mixed',
    billTimingDetail: 'Reserve in Redis, settle through v2/bill',
    originPath: 'apps/revex-wallet-gatekeeper/src/controllers/gatekeeper.controller.ts:108',
    billPaths: ['apps/revex-wallet-gatekeeper/src/redis/gatekeeperRedis.service.ts:630', 'apps/revex-wallet-gatekeeper/src/services/event.service.ts:506'],
    notes: 'Any product or sub-product routed through Gatekeeper.',
    model: 'reserve_settle',
    recurrence: 'per-use',
    modelDetail:
      'Reserve does not debit the wallet: it atomically increments Redis usage counters (INCRBYFLOAT) plus a meta hash, and a worker writes durable Mongo counters. Settle calls billing v2/bill; if it fails, the counters are reverted. validate-and-bill-event reserves and bills in one call. AI products switch to this path when an agency has the walletGatekeeper flag on (off by default).'
  }
]

export function modelFromTiming(timing: ChargeTypeRecord['billTiming']): BillingModel {
  if (timing === 'before') return 'bill_first'
  if (timing === 'after') return 'usage_first'
  if (timing === 'na') return 'platform'
  return 'unconfirmed'
}

function defaultRecurrence(r: ChargeTypeRecord): Recurrence {
  return r.billTiming === 'na' ? 'n/a' : 'per-use'
}

export function toView(r: ChargeTypeRecord & Partial<ModelOverride>): ChargeTypeView {
  const o = MODEL_OVERRIDES[r.chargeType]
  return {
    ...r,
    model: o?.model ?? r.model ?? modelFromTiming(r.billTiming),
    recurrence: o?.recurrence ?? r.recurrence ?? defaultRecurrence(r),
    modelDetail: o?.modelDetail ?? r.modelDetail ?? r.billTimingDetail
  }
}

export const CHARGE_TYPE_VIEWS: ChargeTypeView[] = [...ALL_CHARGE_TYPES, ...EXTRA_CHARGE_TYPES]
  .map(toView)
  .sort((a, b) => a.chargeType.localeCompare(b.chargeType))

export interface ProductGroup {
  product: string
  family: string
  items: ChargeTypeView[]
}

/** Groups charge types by product within one billing model, largest families first. */
export function groupByProduct(rows: ChargeTypeView[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>()
  for (const r of rows) {
    const key = `${r.family}::${r.product}`
    const g = map.get(key) ?? { product: r.product, family: r.family, items: [] }
    g.items.push(r)
    map.set(key, g)
  }
  return [...map.values()].sort(
    (a, b) => a.family.localeCompare(b.family) || b.items.length - a.items.length || a.product.localeCompare(b.product)
  )
}

export function countByModel(rows: ChargeTypeView[]): Record<BillingModel, number> {
  const out: Record<BillingModel, number> = { bill_first: 0, usage_first: 0, reserve_settle: 0, platform: 0, unconfirmed: 0 }
  for (const r of rows) out[r.model]++
  return out
}

const DEFAULT_BRANCH: Record<string, string> = { 'leadgen-backend': 'main' }

/** "apps/x/y.ts:45,126" in a repo → GitHub blob URL with the first line anchored. */
export function codeUrl(r: ChargeTypeRecord, raw: string): string {
  let rel = raw.replace(/^GoHighLevel\//, '')
  const other = rel.match(/^(marketplace-backend|ai-backend|automation-workflows-backend|leadgen-backend|ghl-revex-backend|saas-service)\//)
  let repo = r.repo.replace(/^GoHighLevel\//, '')
  if (other) {
    repo = other[1]
    rel = rel.slice(repo.length + 1)
  } else if (r.app && !rel.startsWith('apps/') && !rel.startsWith('src/') && !rel.startsWith('libs/')) {
    rel = `apps/${r.app}/${rel}`
  }
  if (rel.includes('...')) return `https://github.com/GoHighLevel/${repo}`
  const m = rel.match(/^([^:\s]+)(?::(\d+))?/)
  const file = m ? m[1] : rel
  const line = m?.[2]
  const url = `https://github.com/GoHighLevel/${repo}/blob/${DEFAULT_BRANCH[repo] || 'master'}/${file}`
  return line ? `${url}#L${line}` : url
}
