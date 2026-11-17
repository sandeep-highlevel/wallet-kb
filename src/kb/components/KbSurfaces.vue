<template>
  <div class="space-y-5">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="a in APPS"
        :key="a.id"
        class="rounded-full border px-3.5 py-1.5 text-sm transition"
        :class="
          app.id === a.id
            ? 'border-teal-600 bg-teal-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
        @click="$emit('select', a.id)"
      >
        {{ a.id }}
      </button>
    </div>

    <div
      class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ app.id }}</h2>
        <KbCodeLink
          v-if="app.root"
          :repo="repo"
          :path="app.root"
          :label="app.root"
        />
      </div>
      <p class="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {{ app.description }}
      </p>
      <details
        v-if="app.deployments?.length"
        class="mt-2"
      >
        <summary class="cursor-pointer text-xs text-gray-400">
          {{ app.deployments.length }} deployments
        </summary>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="d in app.deployments"
            :key="d"
            class="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:border-gray-700 dark:text-gray-400"
            >{{ d }}</span
          >
        </div>
      </details>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex gap-1">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="-mb-px border-b-2 px-3 py-2 text-sm font-medium"
          :class="
            tab === t.id
              ? 'border-teal-600 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          "
          @click="tab = t.id"
        >
          {{ t.label }}
          <span class="ml-1 rounded-full bg-gray-100 px-1.5 text-[11px] dark:bg-gray-800">{{
            t.count
          }}</span>
        </button>
      </div>
      <input
        v-model="query"
        placeholder="Filter this app…"
        class="mb-2 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-teal-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>

    <div
      v-if="tab === 'apis'"
      class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <table class="w-full text-sm">
        <thead
          class="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:bg-gray-900/60"
        >
          <tr>
            <th class="px-4 py-2.5">Method</th>
            <th class="px-4 py-2.5">Route & purpose</th>
            <th class="px-4 py-2.5">Code</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="(x, i) in apis"
            :key="`${x.method}${x.route}${i}`"
            class="hover:bg-gray-50/70 dark:hover:bg-gray-900/40"
          >
            <td class="px-4 py-2.5 align-top">
              <span
                class="rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                :class="METHOD_CLASS[(x.method || '').toUpperCase()] || METHOD_CLASS.GET"
                >{{ x.method }}</span
              >
            </td>
            <td class="px-4 py-2.5 align-top">
              <div class="break-all font-mono text-[12.5px] text-gray-800 dark:text-gray-100">
                {{ x.route }}
              </div>
              <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {{ x.purpose }}<span v-if="x.auth"> · 🔒 {{ x.auth }}</span>
              </div>
            </td>
            <td class="px-4 py-2.5 align-top">
              <KbCodeLink
                :repo="repo"
                :path="x.path"
                :line="x.line"
                :label="x.handler"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-if="!apis.length"
        class="p-6 text-center text-sm text-gray-400"
      >
        No APIs match.
      </p>
    </div>

    <div
      v-else-if="tab === 'workers'"
      class="space-y-3"
    >
      <div
        v-for="w in workers"
        :key="w.name"
        class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="font-semibold text-gray-900 dark:text-gray-100">{{ w.name }}</div>
          <KbCodeLink
            :repo="repo"
            :path="w.path"
            :line="w.line"
          />
        </div>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ w.purpose }}</p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <span
            v-if="w.topic"
            class="rounded-md bg-violet-50 px-2 py-0.5 font-mono text-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
            >topic {{ w.topic }}</span
          >
          <span
            v-if="w.subscription"
            class="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >sub {{ w.subscription }}</span
          >
        </div>
        <div
          v-if="w.handles?.length"
          class="mt-2 flex flex-wrap gap-1.5"
        >
          <span
            v-for="h in w.handles"
            :key="h"
            class="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:border-gray-700 dark:text-gray-400"
            >{{ h }}</span
          >
        </div>
      </div>
      <p
        v-if="!workers.length"
        class="p-6 text-center text-sm text-gray-400"
      >
        No workers.
      </p>
    </div>

    <div
      v-else
      class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <table class="w-full text-sm">
        <thead
          class="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:bg-gray-900/60"
        >
          <tr>
            <th class="px-4 py-2.5">Cron</th>
            <th class="px-4 py-2.5">Schedule</th>
            <th class="px-4 py-2.5">Calls</th>
            <th class="px-4 py-2.5">Config</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="c in crons"
            :key="c.name"
          >
            <td class="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{{ c.name }}</td>
            <td class="px-4 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-300">
              {{ c.schedule }}
            </td>
            <td class="break-all px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400">
              {{ c.target }}
            </td>
            <td class="px-4 py-2.5">
              <KbCodeLink
                :repo="c.repo || repo"
                :path="c.path"
                :line="c.line"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-if="!crons.length"
        class="p-6 text-center text-sm text-gray-400"
      >
        No crons.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { APPS, METHOD_CLASS } from '../kbData'
import KbCodeLink from './KbCodeLink.vue'

const props = defineProps<{ selected?: string }>()
defineEmits<{ (e: 'select', id: string): void }>()

const tab = ref<'apis' | 'workers' | 'crons'>('apis')
const query = ref('')
const app = computed(() => APPS.find((a) => a.id === props.selected) || APPS[0])
const repo = computed(() => app.value.repo || 'revex')
watch(app, () => (query.value = ''))

const match = (o: object) =>
  !query.value || JSON.stringify(o).toLowerCase().includes(query.value.toLowerCase())
const apis = computed(() => (app.value.apis || []).filter(match))
const workers = computed(() => (app.value.workers || []).filter(match))
const crons = computed(() => (app.value.crons || []).filter(match))
const tabs = computed(() => [
  { id: 'apis' as const, label: 'APIs', count: apis.value.length },
  { id: 'workers' as const, label: 'Workers', count: workers.value.length },
  { id: 'crons' as const, label: 'Crons', count: crons.value.length }
])
</script>
