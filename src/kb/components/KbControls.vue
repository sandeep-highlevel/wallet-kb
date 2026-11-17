<template>
  <div class="space-y-8">
    <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          {{ s.value }}
        </div>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ s.label }}</div>
      </div>
    </section>

    <p class="max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
      What makes each hop of the order-to-cash path complete and accurate, whether that check runs
      on its own, and where it lives in code. Controls marked
      <span class="font-semibold">In progress</span> link to unmerged branches.
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="h in hopFilters"
        :key="h.id"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="
          hop === h.id
            ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
            : 'border-gray-200 text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:text-gray-300'
        "
        @click="hop = h.id"
      >
        {{ h.label }}
      </button>
      <span class="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
      <button
        v-for="s in statusFilters"
        :key="s.id"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="
          status === s.id
            ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
            : 'border-gray-200 text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:text-gray-300'
        "
        @click="status = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <section
      v-for="g in groups"
      :key="g.hop"
    >
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{{ g.hop }}</h2>
      <div
        class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <table class="w-full min-w-[880px] text-sm">
          <thead
            class="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:bg-gray-900/60"
          >
            <tr>
              <th class="w-[42%] px-4 py-2.5">Control</th>
              <th class="px-4 py-2.5">Objective</th>
              <th class="px-4 py-2.5">Type</th>
              <th class="px-4 py-2.5">Status</th>
              <th class="px-4 py-2.5">Code</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="c in g.controls"
              :key="c.id"
            >
              <td class="px-4 py-3 align-top">
                <div class="font-semibold text-gray-900 dark:text-gray-100">{{ c.name }}</div>
                <p class="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {{ c.description }}
                </p>
                <p
                  v-if="c.weakness"
                  class="mt-1.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300"
                >
                  Weakness: {{ c.weakness }}
                </p>
              </td>
              <td class="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                {{ c.objective }}
              </td>
              <td class="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                {{ c.type }}
                <div class="text-gray-400">{{ c.automation }}</div>
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  class="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="STATUS_CLASS[c.status] || STATUS_CLASS.Missing"
                  >{{ c.status }}</span
                >
              </td>
              <td class="px-4 py-3 align-top">
                <div class="flex max-w-[260px] flex-col items-start gap-1">
                  <KbCodeLink
                    v-for="(r, i) in c.refs || []"
                    :key="i"
                    :repo="r.repo"
                    :path="r.path"
                    :line="r.line"
                    :label="r.label"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p
      v-if="!groups.length"
      class="text-sm text-gray-400"
    >
      No controls match these filters.
    </p>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Gaps ({{ CONTROL_GAPS.length }})
      </h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="gap in gaps"
          :key="gap.id"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="font-semibold text-gray-900 dark:text-gray-100">{{ gap.title }}</div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="SEVERITY_CLASS[gap.severity] || SEVERITY_CLASS.Low"
              >{{ gap.severity }}</span
            >
          </div>
          <div class="mt-0.5 text-[11px] uppercase tracking-wider text-teal-700 dark:text-teal-400">
            {{ gap.hop }}
          </div>
          <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {{ gap.impact }}
          </p>
          <p
            v-if="gap.evidence"
            class="mt-2 break-words font-mono text-[11px] text-gray-400 [overflow-wrap:anywhere]"
          >
            {{ gap.evidence }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CONTROLS, CONTROL_GAPS } from '../kbData'
import { groupControls, HOP_ORDER, sortGaps, statusCounts } from '../kbControls'
import KbCodeLink from './KbCodeLink.vue'

const STATUS_CLASS: Record<string, string> = {
  Live: 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  'In progress': 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  Missing: 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
}
const SEVERITY_CLASS: Record<string, string> = {
  High: 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
  Medium: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
}

const counts = statusCounts(CONTROLS)
const stats = [
  { value: CONTROLS.length, label: 'Controls' },
  { value: counts.Live, label: 'Live' },
  { value: counts['In progress'], label: 'In progress' },
  { value: CONTROL_GAPS.length, label: 'Gaps' }
]

const hop = ref('')
const status = ref('')
const presentHops = HOP_ORDER.filter((h) => CONTROLS.some((c) => c.hop === h))
const hopFilters = [{ id: '', label: 'All hops' }, ...presentHops.map((h) => ({ id: h, label: h }))]
const statusFilters = [
  { id: '', label: 'Any status' },
  ...Object.keys(STATUS_CLASS).map((s) => ({ id: s, label: s }))
]

const groups = computed(() =>
  groupControls(CONTROLS, { hop: hop.value || undefined, status: status.value || undefined })
)
const gaps = sortGaps(CONTROL_GAPS)
</script>
