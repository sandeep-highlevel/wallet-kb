<template>
  <div class="space-y-8">
    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        How a wallet charge moves
      </h2>
      <div
        class="grid gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm md:grid-cols-5 dark:border-gray-700 dark:bg-gray-800"
      >
        <div
          v-for="(lane, i) in lanes"
          :key="lane.title"
          class="relative"
        >
          <div
            class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400"
          >
            {{ i + 1 }}. {{ lane.title }}
          </div>
          <div class="space-y-2">
            <div
              v-for="b in lane.boxes"
              :key="b.t"
              class="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900/60"
            >
              <div class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ b.t }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ b.s }}</div>
            </div>
          </div>
          <div
            v-if="i < lanes.length - 1"
            class="kb-nudge absolute -right-3 top-1/2 hidden text-teal-500 md:block"
            aria-hidden="true"
          >
            →
          </div>
        </div>
      </div>
      <button
        class="mt-3 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
        @click="$emit('navigate', 'flows', 'wallet_charge')"
      >
        Open the wallet charge flow →
      </button>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Start exploring</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="t in tiles"
          :key="t.tab"
          class="group rounded-2xl border border-gray-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-700"
          @click="$emit('navigate', t.tab)"
        >
          <div
            class="text-base font-semibold text-gray-900 group-hover:text-teal-800 dark:text-gray-100 dark:group-hover:text-teal-300"
          >
            {{ t.title }}
          </div>
          <p class="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {{ t.body }}
          </p>
        </button>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Flows by area</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="g in groups"
          :key="g.name"
          class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ g.name }}
          </div>
          <ul class="space-y-1">
            <li
              v-for="f in g.flows"
              :key="f.id"
            >
              <button
                class="text-left text-sm text-gray-600 hover:text-teal-700 dark:text-gray-300 dark:hover:text-teal-400"
                @click="$emit('navigate', 'flows', f.id)"
              >
                {{ f.name }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FLOWS } from '../kbData'

defineEmits<{ (e: 'navigate', tab: string, item?: string): void }>()

const lanes = [
  {
    title: 'Producers',
    boxes: [
      { t: 'SMS · Email · AI · Phone', s: 'product usage' },
      { t: 'Gatekeeper', s: 'reserve → bill retry' }
    ]
  },
  {
    title: 'Billing',
    boxes: [
      { t: 'Bill / has-funds API', s: 'apps/billing' },
      { t: 'Charge worker', s: 'chargeV5 + PENDING txn' }
    ]
  },
  {
    title: 'Blade platform',
    boxes: [
      { t: 'Settlement', s: 'cron + CDC, batches ≤ 1000' },
      { t: 'Wallet balance', s: 'company / location' }
    ]
  },
  {
    title: 'Payments',
    boxes: [
      { t: 'Recharge worker', s: 'auto / manual' },
      { t: 'Stripe webhooks', s: 'stripe-consumer' }
    ]
  },
  {
    title: 'Data',
    boxes: [
      { t: 'TigerBeetle ledger', s: 'double entry' },
      { t: 'ClickHouse · Snowflake', s: 'analytics, BI, recon' }
    ]
  }
]

const tiles = [
  {
    tab: 'flows',
    title: 'Wallet flows',
    body: 'Step-by-step journeys with the API, worker or cron behind every state.'
  },
  {
    tab: 'charges',
    title: 'Charge types & billing models',
    body: 'Which products bill the wallet first and deliver later, and which deliver first and bill later.'
  },
  {
    tab: 'surfaces',
    title: 'APIs & workers',
    body: 'Every route, Pub/Sub worker and cron across the wallet apps.'
  },
  {
    tab: 'collections',
    title: 'Collections & indexes',
    body: 'MongoDB collections, key fields, indexes and who uses them.'
  },
  {
    tab: 'controls',
    title: 'Controls & gaps',
    body: 'What keeps each hop complete and accurate, what is automated, and what is missing.'
  },
  {
    tab: 'data',
    title: 'Data pipeline',
    body: 'Mongo → Pub/Sub → ClickHouse, Snowflake and TigerBeetle.'
  },
  {
    tab: 'references',
    title: 'Diagrams & docs',
    body: 'The wallet transaction diagram, ClickUp PRDs, KT notes, repos.'
  }
]

const groups = computed(() => {
  const byGroup = new Map<string, typeof FLOWS>()
  for (const f of FLOWS) byGroup.set(f.group, [...(byGroup.get(f.group) || []), f])
  return [...byGroup.entries()].map(([name, flows]) => ({ name, flows }))
})
</script>
