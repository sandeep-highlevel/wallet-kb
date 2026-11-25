<template>
  <div class="space-y-8">
    <!-- Model cards -->
    <div class="grid gap-4 md:grid-cols-2">
      <button
        v-for="m in primary"
        :key="m.id"
        class="group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 dark:bg-gray-800"
        :class="focus === m.id ? 'border-teal-400 ring-2 ring-teal-400/30 dark:border-teal-500' : 'border-gray-200/80 dark:border-gray-700'"
        @click="toggleFocus(m.id)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider" :class="TONE[m.id].text">{{ m.short }}</div>
            <div class="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{{ m.title }}</div>
          </div>
          <div class="text-right">
            <div class="font-mono text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{{ counts[m.id] }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">charge types</div>
          </div>
        </div>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{{ m.blurb }}</p>
        <!-- Animated sequence: a dot travels the steps; the billing step glows. -->
        <div class="relative mt-4 flex items-center gap-2">
          <template v-for="(s, i) in m.sequence" :key="s">
            <span
              class="relative rounded-lg px-2.5 py-1 text-xs font-semibold"
              :class="s === 'Bill wallet' ? `${TONE[m.id].chip} ct-glow` : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'"
              :style="{ animationDelay: `${i * 0.6}s` }"
            >{{ i + 1 }} · {{ s }}</span>
            <span v-if="i < m.sequence.length - 1" class="relative h-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden="true">
              <span class="ct-dot absolute -top-[3px] h-[7px] w-[7px] rounded-full" :class="TONE[m.id].dot" :style="{ animationDelay: `${i * 0.6}s` }" />
            </span>
          </template>
        </div>
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <input
        v-model="query"
        type="search"
        placeholder="Filter by charge type, product, app…"
        class="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        aria-label="Filter charge types"
      />
      <button
        v-for="f in families"
        :key="f"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="family === f ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300' : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300'"
        @click="family = f"
      >{{ f }}</button>
      <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">{{ filtered.length }} of {{ CHARGE_TYPE_VIEWS.length }}</span>
    </div>

    <!-- Side-by-side comparison -->
    <div class="grid gap-6" :class="focus ? '' : 'lg:grid-cols-2'">
      <section v-for="m in visiblePrimary" :key="m.id" :aria-label="m.title">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <span class="h-2.5 w-2.5 rounded-full" :class="TONE[m.id].dot" />
          {{ m.title }}
          <span class="font-mono text-sm font-normal text-gray-400">{{ byModel[m.id].length }}</span>
        </h2>
        <p v-if="!byModel[m.id].length" class="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700">
          Nothing matches the filter.
        </p>
        <div class="space-y-3">
          <ProductCard v-for="g in groupByProduct(byModel[m.id])" :key="`${m.id}-${g.family}-${g.product}`" :group="g" :tone="TONE[m.id]" :active="active?.chargeType" @open="open" />
        </div>
      </section>
    </div>

    <!-- Other models -->
    <section v-for="m in secondary" :key="m.id" :aria-label="m.title">
      <details class="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800" :open="m.id === 'reserve_settle'">
        <summary class="flex cursor-pointer list-none items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          <span class="h-2.5 w-2.5 rounded-full" :class="TONE[m.id].dot" />
          {{ m.title }}
          <span class="font-mono text-sm font-normal text-gray-400">{{ byModel[m.id].length }}</span>
          <span class="ml-auto text-xs text-gray-400 transition group-open:rotate-90">▶</span>
        </summary>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ m.blurb }}</p>
        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <ProductCard v-for="g in groupByProduct(byModel[m.id])" :key="`${m.id}-${g.family}-${g.product}`" :group="g" :tone="TONE[m.id]" :active="active?.chargeType" @open="open" />
        </div>
      </details>
    </section>

    <!-- Detail drawer -->
    <Transition name="drawer">
      <div v-if="active" class="fixed inset-0 z-40 flex justify-end bg-slate-950/30 backdrop-blur-sm" @click.self="close">
        <aside
          class="drawer-panel h-full w-full max-w-xl overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          role="dialog"
          aria-modal="true"
          :aria-label="`Charge type ${active.chargeType}`"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ active.family }} · {{ active.product }}</div>
              <h3 class="mt-1 break-all font-mono text-xl font-semibold text-gray-900 dark:text-gray-50">{{ active.chargeType }}</h3>
            </div>
            <button class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close" @click="close">✕</button>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span class="rounded-full px-2.5 py-1 font-semibold" :class="TONE[active.model].chip">{{ modelInfo(active.model).title }}</span>
            <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ active.recurrence }}</span>
            <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{{ active.repo.replace('GoHighLevel/', '') }}{{ active.app ? ` · ${active.app}` : '' }}</span>
          </div>

          <dl class="mt-5 space-y-3 text-sm">
            <div><dt class="font-semibold text-gray-900 dark:text-gray-100">When the wallet is charged</dt><dd class="text-gray-600 dark:text-gray-300">{{ active.modelDetail }}</dd></div>
            <div><dt class="font-semibold text-gray-900 dark:text-gray-100">Has-funds check</dt><dd class="text-gray-600 dark:text-gray-300">{{ active.hasFunds }} · {{ active.hasFundsDetail }}</dd></div>
            <div><dt class="font-semibold text-gray-900 dark:text-gray-100">fundCheck on /bill</dt><dd class="text-gray-600 dark:text-gray-300">{{ active.fundCheck }} · {{ active.fundCheckDetail }}</dd></div>
            <div v-if="active.notes"><dt class="font-semibold text-gray-900 dark:text-gray-100">Notes</dt><dd class="text-gray-600 dark:text-gray-300">{{ active.notes }}</dd></div>
          </dl>

          <div v-if="steps.length" class="mt-6">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Execution flow</h4>
            <ol class="mt-2 space-y-2 border-l-2 border-teal-200 pl-4 dark:border-teal-900">
              <li v-for="(s, i) in steps" :key="i" class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{{ s }}</li>
            </ol>
          </div>

          <div v-if="links.length" class="mt-6">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Code</h4>
            <ul class="mt-2 space-y-1.5">
              <li v-for="l in links" :key="l.label + l.path" class="text-sm">
                <span class="text-gray-500">{{ l.label }}:&nbsp;</span>
                <a :href="l.url" target="_blank" rel="noopener" class="break-all font-mono text-xs text-teal-700 hover:underline dark:text-teal-400">{{ l.path }}</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ProductCard, { type Tone } from './KbChargeTypeCard.vue'
import { CHARGE_TYPE_VIEWS, MODELS, codeUrl, countByModel, groupByProduct, type BillingModel, type ChargeTypeView } from '../chargeModels'

const props = defineProps<{ selected?: string }>()
const emit = defineEmits<{ (e: 'select', id: string | undefined): void }>()

const TONE: Record<BillingModel, Tone> = {
  bill_first: { text: 'text-amber-600 dark:text-amber-400', chip: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300', dot: 'bg-amber-500', ring: 'hover:border-amber-300 dark:hover:border-amber-600' },
  usage_first: { text: 'text-teal-600 dark:text-teal-400', chip: 'bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300', dot: 'bg-teal-500', ring: 'hover:border-teal-300 dark:hover:border-teal-600' },
  reserve_settle: { text: 'text-violet-600 dark:text-violet-400', chip: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300', dot: 'bg-violet-500', ring: 'hover:border-violet-300 dark:hover:border-violet-600' },
  platform: { text: 'text-slate-600 dark:text-slate-400', chip: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300', dot: 'bg-slate-400', ring: 'hover:border-slate-300 dark:hover:border-slate-600' },
  unconfirmed: { text: 'text-rose-600 dark:text-rose-400', chip: 'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300', dot: 'bg-rose-500', ring: 'hover:border-rose-300 dark:hover:border-rose-600' }
}

const counts = computed(() => countByModel(CHARGE_TYPE_VIEWS))
const primary = MODELS.filter((m) => m.id === 'bill_first' || m.id === 'usage_first')
const secondary = computed(() => MODELS.filter((m) => !primary.includes(m) && counts.value[m.id] > 0))
const modelInfo = (id: BillingModel) => MODELS.find((m) => m.id === id) ?? MODELS[0]

const focus = ref<BillingModel | null>(null)
const toggleFocus = (id: BillingModel) => (focus.value = focus.value === id ? null : id)
const visiblePrimary = computed(() => (focus.value && primary.some((m) => m.id === focus.value) ? primary.filter((m) => m.id === focus.value) : primary))

const families = computed(() => ['All', ...new Set(CHARGE_TYPE_VIEWS.map((r) => r.family))])
const family = ref('All')
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return CHARGE_TYPE_VIEWS.filter((r) => {
    if (family.value !== 'All' && r.family !== family.value) return false
    if (!q) return true
    return [r.chargeType, r.product, r.repo, r.app, r.family, ...(r.displayNames || [])].filter(Boolean).join(' ').toLowerCase().includes(q)
  })
})

const byModel = computed(() => {
  const out: Record<BillingModel, ChargeTypeView[]> = { bill_first: [], usage_first: [], reserve_settle: [], platform: [], unconfirmed: [] }
  for (const r of filtered.value) out[r.model].push(r)
  return out
})

const active = computed(() => CHARGE_TYPE_VIEWS.find((r) => r.chargeType === props.selected) ?? null)
const open = (id: string) => emit('select', id)
const close = () => emit('select', undefined)

const steps = computed(() => (active.value?.flow ? active.value.flow.split(/\s(?=\d+\.\s)/).map((s) => s.trim()).filter(Boolean) : []))
const links = computed(() => {
  const r = active.value
  if (!r) return []
  const rows = [
    ...(r.originPath ? [['Defined in', r.originPath]] : []),
    ...(r.hasFundsPaths || []).map((p) => ['has-funds call', p]),
    ...(r.billPaths || []).map((p) => ['/bill call', p])
  ]
  return rows.map(([label, path]) => ({ label, path, url: codeUrl(r, path) }))
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && active.value) close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(active, (a) => document.body.classList.toggle('overflow-hidden', !!a))
onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
</script>

<style scoped>
@keyframes ct-travel {
  0% { left: 0; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { left: calc(100% - 7px); opacity: 0; }
}
@keyframes ct-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgb(245 158 11 / 0); }
  50% { box-shadow: 0 0 0 4px rgb(20 184 166 / 0.18); }
}
.ct-dot { animation: ct-travel 1.8s ease-in-out infinite; }
.ct-glow { animation: ct-glow 1.8s ease-in-out infinite; }
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel, .drawer-leave-to .drawer-panel { transform: translateX(40px); }
</style>
