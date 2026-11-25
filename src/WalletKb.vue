<template>
  <div class="min-h-screen pb-24">
    <!-- Scroll progress -->
    <div
      class="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400"
      :style="{ transform: `scaleX(${progress})` }"
      aria-hidden="true"
    />

    <header
      class="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl transition-shadow dark:border-white/10 dark:bg-[#0b0f14]/70"
      :class="scrolled ? 'shadow-[0_8px_30px_-18px_rgb(0_0_0/0.35)]' : ''"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
        <button class="group flex items-center gap-2.5" aria-label="Wallet KB home" @click="go('overview')">
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-600/30 transition-transform group-hover:rotate-[-8deg] group-hover:scale-105">
            <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 12.5h2" /><path d="M3 9.5h18" /></svg>
          </span>
          <span class="hidden text-sm font-bold tracking-tight text-gray-900 sm:block dark:text-white">Wallet KB</span>
        </button>
        <span class="hidden text-xs text-gray-400 md:block">Billing · Blade Platform</span>

        <button
          class="ml-auto flex w-full max-w-sm items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-left text-sm text-gray-400 shadow-sm transition hover:border-teal-400 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          @click="searchOpen = true"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <span class="flex-1 truncate">Search flows, controls, APIs, SDK…</span>
          <kbd class="rounded-md border border-gray-200 px-1.5 font-mono text-[10px] dark:border-white/15">⌘K</kbd>
        </button>
        <button
          class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white/80 text-gray-600 transition hover:rotate-12 hover:border-teal-400 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggle"
        >
          <Transition name="tab" mode="out-in">
            <svg v-if="isDark" key="sun" viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            <svg v-else key="moon" viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </Transition>
        </button>
      </div>

      <!-- Tabs with a sliding indicator -->
      <nav class="mx-auto max-w-7xl px-4 sm:px-8" aria-label="Knowledge base sections">
        <div ref="tabBar" class="relative -mb-px flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none]">
          <span
            class="pointer-events-none absolute top-0 h-[calc(100%-0.5rem)] rounded-lg bg-teal-500/10 ring-1 ring-teal-500/30 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] dark:bg-teal-400/10 dark:ring-teal-400/30"
            :style="indicator"
            aria-hidden="true"
          />
          <button
            v-for="t in TABS"
            :key="t.id"
            :data-tab="t.id"
            class="relative z-10 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors"
            :class="tab === t.id ? 'text-teal-700 dark:text-teal-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'"
            :aria-current="tab === t.id ? 'page' : undefined"
            @click="go(t.id)"
          >
            {{ t.label }}
            <span
              v-if="t.count != null"
              class="ml-1 rounded-full px-1.5 py-px font-mono text-[10px] transition-colors"
              :class="tab === t.id ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'"
            >{{ t.count }}</span>
          </button>
        </div>
      </nav>
    </header>

    <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8">
      <Transition name="tab" mode="out-in">
        <KbHero v-if="tab === 'overview'" key="hero" @navigate="go" @search="searchOpen = true" />
        <div v-else :key="`head-${tab}`" class="flex items-end justify-between gap-4 pt-2">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">Wallet KB</div>
            <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{{ current.title }}</h1>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{{ current.blurb }}</p>
          </div>
        </div>
      </Transition>

      <main ref="mainEl" class="kb-main">
        <Transition name="tab" mode="out-in" @after-enter="scan">
          <div :key="tab">
            <KbOverview v-if="tab === 'overview'" @navigate="go" />
            <KbFlows v-else-if="tab === 'flows'" :selected="item" @select="(id) => go('flows', id)" />
            <KbChargeTypes v-else-if="tab === 'charges'" :selected="item" @select="(id) => go('charges', id)" />
            <KbSurfaces v-else-if="tab === 'surfaces'" :selected="item" @select="(id) => go('surfaces', id)" />
            <KbCollections v-else-if="tab === 'collections'" :key="item" :selected="item" />
            <KbControls v-else-if="tab === 'controls'" />
            <KbDataPipeline v-else-if="tab === 'data'" />
            <KbWalletSdk v-else-if="tab === 'sdk'" @navigate="go" />
            <KbReferences v-else-if="tab === 'references'" />
          </div>
        </Transition>
      </main>

      <footer class="pt-10 text-center text-xs text-gray-400">
        Internal · GoHighLevel org members only · code links pinned to
        <span class="font-mono">ghl-revex-backend@{{ shortSha('revex') }}</span>
      </footer>
    </div>

    <Transition name="tab">
      <button
        v-if="scrolled"
        class="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-gray-900 text-white shadow-xl transition hover:-translate-y-1 dark:bg-teal-400 dark:text-teal-950"
        aria-label="Back to top"
        @click="toTop"
      >
        ↑
      </button>
    </Transition>

    <CommandPalette :open="searchOpen" :index="index" @close="searchOpen = false" @pick="pick" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KbHero from './components/KbHero.vue'
import CommandPalette from './components/CommandPalette.vue'
import KbOverview from './kb/components/KbOverview.vue'
import KbFlows from './kb/components/KbFlows.vue'
import KbSurfaces from './kb/components/KbSurfaces.vue'
import KbCollections from './kb/components/KbCollections.vue'
import KbControls from './kb/components/KbControls.vue'
import KbDataPipeline from './kb/components/KbDataPipeline.vue'
import KbReferences from './kb/components/KbReferences.vue'
import KbWalletSdk from './kb/components/KbWalletSdk.vue'
import KbChargeTypes from './kb/components/KbChargeTypes.vue'
import { CHARGE_TYPE_VIEWS, MODELS } from './kb/chargeModels'
import { APPS, COLLECTIONS, CONTROL_GAPS, CONTROLS, DATAFLOW, FLOWS, WALLET_SDK } from './kb/kbData'
import { PINNED_REPOS } from './kb/kbLinks'
import { buildSearchIndex, type SearchEntry } from './kb/kbSearch'
import { REFERENCE_GROUPS } from './kb/data/references'
import { useTheme } from './composables/useTheme'
import { useReveal } from './composables/useReveal'
import { prefersReducedMotion } from './composables/motion'

const TABS = [
  { id: 'overview', label: 'Overview', title: 'Overview', blurb: '' },
  { id: 'flows', label: 'Wallet flows', count: FLOWS.length, title: 'Wallet flows', blurb: 'Step-by-step journeys with the API, worker or cron behind every state.' },
  { id: 'charges', label: 'Charge types', count: CHARGE_TYPE_VIEWS.length, title: 'Charge types & billing models', blurb: 'Which products bill the wallet first and deliver later, and which deliver first and bill later, for every charge type.' },
  { id: 'surfaces', label: 'APIs & workers', title: 'APIs & workers', blurb: 'Every route, Pub/Sub worker and cron across the wallet apps.' },
  { id: 'collections', label: 'Collections', count: COLLECTIONS.length, title: 'Collections & indexes', blurb: 'MongoDB collections, key fields, indexes and who uses them.' },
  { id: 'controls', label: 'Controls & gaps', count: CONTROLS.length, title: 'Controls & gaps', blurb: 'What keeps each hop complete and accurate, what is automated, and what is missing.' },
  { id: 'data', label: 'Data pipeline', title: 'Data pipeline', blurb: 'Mongo → Pub/Sub → ClickHouse, Snowflake and TigerBeetle.' },
  { id: 'sdk', label: 'Wallet SDK', title: 'Wallet SDK', blurb: 'The client SDK that products use to charge and check wallets.' },
  { id: 'references', label: 'Diagrams & docs', title: 'Diagrams & docs', blurb: 'The wallet transaction diagram, ClickUp PRDs, KT notes and repos.' }
]

const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()

// Tab and selected item live in the query string so views are shareable.
const tab = computed(() => {
  const t = String(route.query.tab || 'overview')
  return TABS.some((x) => x.id === t) ? t : 'overview'
})
const item = computed(() => (route.query.item ? String(route.query.item) : undefined))
const current = computed(() => TABS.find((t) => t.id === tab.value) ?? TABS[0])

function go(nextTab: string, nextItem?: string) {
  router.push({ query: { ...route.query, tab: nextTab, item: nextItem || undefined } })
}
// Charge types open in a drawer, so picking one must not scroll the page.
watch([tab, item], ([t], [prevTab]) => {
  if (t === 'charges' && t === prevTab) return
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
})

const shortSha = (key: string) => (PINNED_REPOS[key]?.ref || '').slice(0, 7)

// ── Sliding tab indicator ──────────────────────────────────────────────
const tabBar = ref<HTMLElement | null>(null)
const indicator = ref<Record<string, string>>({ opacity: '0' })
async function moveIndicator() {
  await nextTick()
  const btn = tabBar.value?.querySelector<HTMLElement>(`[data-tab="${tab.value}"]`)
  if (!btn) return
  indicator.value = { left: `${btn.offsetLeft}px`, width: `${btn.offsetWidth}px`, opacity: '1' }
  btn.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
watch(tab, moveIndicator)

// ── Scroll state ───────────────────────────────────────────────────────
const progress = ref(0)
const scrolled = ref(false)
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
  scrolled.value = window.scrollY > 240
}
const toTop = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })

// ── Scroll reveal ──────────────────────────────────────────────────────
const mainEl = ref<HTMLElement | null>(null)
const { scan } = useReveal(mainEl)

// ── Search ─────────────────────────────────────────────────────────────
const chargeEntries: SearchEntry[] = CHARGE_TYPE_VIEWS.map((r): SearchEntry => ({
  kind: 'charge type' as SearchEntry['kind'],
  title: r.chargeType,
  subtitle: `${r.product} · ${MODELS.find((m) => m.id === r.model)?.title ?? r.model}`,
  target: { tab: 'charges', item: r.chargeType },
  haystack: [r.chargeType, r.product, r.app, r.family, r.model.replace('_', ' '), ...(r.displayNames || [])].filter(Boolean).join(' ').toLowerCase()
}))
const index = [...chargeEntries, ...buildSearchIndex({
  flows: FLOWS,
  apps: APPS,
  collections: COLLECTIONS,
  tables: DATAFLOW.clickhouseTables,
  references: REFERENCE_GROUPS,
  controls: CONTROLS,
  gaps: CONTROL_GAPS,
  sdk: WALLET_SDK
})]
const searchOpen = ref(false)
function pick(h: SearchEntry) {
  searchOpen.value = false
  if (h.target.url) window.open(h.target.url, '_blank', 'noopener')
  else go(h.target.tab, h.target.item)
}
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = !searchOpen.value
  } else if (e.key === '/' && !searchOpen.value && !(e.target instanceof HTMLInputElement)) {
    e.preventDefault()
    searchOpen.value = true
  } else if (e.key === 'Escape') {
    searchOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', moveIndicator)
  moveIndicator()
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', moveIndicator)
})
</script>
