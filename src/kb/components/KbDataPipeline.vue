<template>
  <div class="space-y-8">
    <!-- Stores laid out left → right by role -->
    <section
      class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div
        class="grid min-w-[880px] gap-3"
        :style="{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="lane in lanes"
          :key="lane.kind"
          class="min-w-0 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60"
        >
          <div
            class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400"
          >
            {{ lane.label }}
          </div>
          <div class="space-y-2">
            <div
              v-for="s in lane.stores"
              :key="s.id"
              :title="s.purpose"
              class="break-words rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 [overflow-wrap:anywhere] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {{ s.name }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Pipelines</h2>
      <div class="space-y-3">
        <div
          v-for="p in DATAFLOW.pipelines"
          :key="p.id"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
            <div
              class="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 dark:bg-gray-900/60 dark:text-gray-100"
            >
              {{ storeName(p.from) }}
            </div>
            <div class="max-w-xs text-center text-xs text-gray-600 dark:text-gray-300">
              <div class="text-lg leading-none text-teal-500">⟶</div>
              {{ p.mechanism }}
              <div
                v-if="p.cadence"
                class="text-gray-400"
              >
                {{ p.cadence }}
              </div>
            </div>
            <div
              class="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 dark:bg-gray-900/60 dark:text-gray-100"
            >
              {{ storeName(p.to) }}
            </div>
          </div>
          <div
            v-if="p.objects?.length"
            class="mt-3 flex flex-wrap gap-1.5"
          >
            <span
              v-for="o in p.objects"
              :key="o"
              class="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:border-gray-700 dark:text-gray-400"
              >{{ o }}</span
            >
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              v-if="p.owner"
              class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400"
              >{{ p.owner }}</span
            >
            <span
              v-if="p.confidence"
              class="rounded-md px-1.5 py-0.5 text-[11px]"
              :class="
                p.confidence === 'verified'
                  ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              "
              >{{ p.confidence }}</span
            >
            <KbCodeLink
              v-for="(r, i) in p.refs || []"
              :key="i"
              :repo="r.repo"
              :path="r.path"
              :line="r.line"
              :label="r.label"
            />
          </div>
        </div>
      </div>
    </section>

    <section v-if="DATAFLOW.clickhouseTables.length">
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        ClickHouse tables & views
      </h2>
      <div
        class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <table class="w-full text-sm">
          <thead
            class="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:bg-gray-900/60"
          >
            <tr>
              <th class="px-4 py-2.5">Table</th>
              <th class="px-4 py-2.5">Engine / order key</th>
              <th class="px-4 py-2.5">Columns</th>
              <th class="px-4 py-2.5">Source</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="t in DATAFLOW.clickhouseTables"
              :key="t.name"
            >
              <td
                class="px-4 py-2.5 align-top font-mono text-xs font-semibold text-gray-900 dark:text-gray-100"
              >
                {{ t.name }}
              </td>
              <td class="px-4 py-2.5 align-top text-xs text-gray-600 dark:text-gray-300">
                {{ t.engine }}
                <div class="font-mono text-gray-400">{{ t.orderBy }}</div>
              </td>
              <td class="px-4 py-2.5 align-top">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="c in (t.columns || []).slice(0, 12)"
                    :key="c"
                    class="rounded border border-gray-200 px-1 font-mono text-[10.5px] text-gray-600 dark:border-gray-700 dark:text-gray-400"
                    >{{ c }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-2.5 align-top">
                <KbCodeLink
                  v-for="(r, i) in (t.refs || []).slice(0, 2)"
                  :key="i"
                  :repo="r.repo"
                  :path="r.path"
                  :line="r.line"
                  :label="r.label"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div
        class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Snowflake</h2>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {{ DATAFLOW.snowflake?.summary }}
        </p>
      </div>
      <div
        v-if="DATAFLOW.gaps?.length"
        class="rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30"
      >
        <h2 class="text-lg font-semibold text-amber-800 dark:text-amber-300">Known gaps</h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/80 dark:text-amber-200/80">
          <li
            v-for="g in DATAFLOW.gaps"
            :key="g"
          >
            {{ g }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="DATAFLOW.consumers?.length">
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Who reads it</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="c in DATAFLOW.consumers"
          :key="c.name"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="font-semibold text-gray-900 dark:text-gray-100">{{ c.name }}</div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="r in c.reads || []"
              :key="r"
              class="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:border-gray-700 dark:text-gray-400"
              >{{ r }}</span
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DATAFLOW } from '../kbData'
import KbCodeLink from './KbCodeLink.vue'

const LANE_ORDER: [string, string][] = [
  ['oltp', 'Operational'],
  ['queue', 'Streams & queues'],
  ['cache', 'Cache'],
  ['ledger', 'Ledger'],
  ['olap', 'Analytics'],
  ['object', 'Data lake'],
  ['warehouse', 'Warehouse']
]
const lanes = LANE_ORDER.map(([kind, label]) => ({
  kind,
  label,
  stores: DATAFLOW.stores.filter((s) => s.kind === kind)
})).filter((l) => l.stores.length)
const storeName = (id: string) => DATAFLOW.stores.find((s) => s.id === id)?.name || id
</script>
