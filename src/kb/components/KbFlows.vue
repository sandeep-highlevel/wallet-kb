<template>
  <!-- Flow detail -->
  <div
    v-if="flow"
    class="space-y-6"
  >
    <button
      class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-700 dark:text-gray-400 dark:hover:text-teal-400"
      @click="$emit('select', undefined)"
    >
      ← All flows
    </button>
    <div>
      <div class="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
        {{ flow.group }}
      </div>
      <h2 class="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
        {{ flow.name }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {{ flow.summary }}
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="m in meta"
        :key="m.label"
        class="rounded-xl border border-gray-200/80 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {{ m.label }}
        </div>
        <div
          class="mt-1 text-sm text-gray-800 dark:text-gray-100"
          :class="m.mono ? 'font-mono text-xs' : ''"
        >
          {{ m.value }}
        </div>
      </div>
    </div>

    <section
      class="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Flow diagram</h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="k in kindsUsed"
            :key="k"
            class="rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="kindClass(k)"
            >{{ k }}</span
          >
        </div>
      </div>
      <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
        One column per app, read top to bottom. Arrows into a worker name the topic it listens on.
        Numbers match the steps below.
      </p>
      <KbDiagram
        v-if="diagram"
        :key="flow.id"
        :diagram="diagram"
        :label="`${flow.name} flow diagram`"
        :initial-zoom="1"
      />
    </section>

    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Steps</h3>
    <ol class="relative space-y-3">
      <li
        v-for="(s, i) in flow.steps"
        :key="`${s.name}-${i}`"
        class="relative grid grid-cols-[40px_1fr] gap-3"
      >
        <div
          v-if="i < flow.steps.length - 1"
          class="absolute left-[19px] top-10 bottom-[-12px] w-0.5 bg-teal-100 dark:bg-teal-900/60"
          aria-hidden="true"
        />
        <div
          class="z-10 grid h-10 w-10 place-items-center rounded-full border-2 border-teal-500 bg-white text-sm font-bold text-teal-700 dark:bg-gray-900 dark:text-teal-300"
        >
          {{ i + 1 }}
        </div>
        <div
          class="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ s.title || s.name }}
            </h3>
            <span
              v-if="s.kind"
              class="rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="kindClass(s.kind)"
              >{{ s.kind }}</span
            >
          </div>
          <p
            v-if="s.detail"
            class="mt-1 text-sm text-gray-600 dark:text-gray-300"
          >
            {{ s.detail }}
          </p>
          <div class="mt-2.5 flex flex-wrap items-center gap-2">
            <span class="font-mono text-[11px] text-gray-400">{{ s.name }}</span>
            <code
              v-if="s.channel"
              class="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11.5px] text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >{{ s.channel }}</code
            >
            <span
              v-if="s.state"
              class="rounded-md border border-dashed border-gray-300 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:border-gray-600 dark:text-gray-300"
              >→ {{ s.state }}</span
            >
            <KbCodeLink
              :repo="s.repo"
              :path="s.path"
              :line="s.line"
            />
          </div>
        </div>
      </li>
    </ol>

    <div
      v-if="flow.terminal"
      class="grid gap-3 md:grid-cols-2"
    >
      <div class="rounded-xl border-l-4 border-teal-500 bg-white px-4 py-3 dark:bg-gray-800">
        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Ends well when</div>
        <ul class="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li
            v-for="x in flow.terminal.success || []"
            :key="x"
          >
            {{ x }}
          </li>
        </ul>
      </div>
      <div class="rounded-xl border-l-4 border-rose-400 bg-white px-4 py-3 dark:bg-gray-800">
        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Fails when</div>
        <ul class="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li
            v-for="x in flow.terminal.failure || []"
            :key="x"
          >
            {{ x }}
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="flow.gotchas?.length"
      class="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/30"
    >
      <div class="text-sm font-semibold text-amber-800 dark:text-amber-300">Watch out</div>
      <ul class="mt-1.5 list-disc space-y-1 pl-5 text-sm text-amber-900/80 dark:text-amber-200/80">
        <li
          v-for="g in flow.gotchas"
          :key="g"
        >
          {{ g }}
        </li>
      </ul>
    </div>
  </div>

  <!-- Flow list -->
  <div
    v-else
    class="space-y-5"
  >
    <div class="flex flex-wrap gap-2">
      <button
        v-for="g in ['All', ...groups]"
        :key="g"
        class="rounded-full border px-3.5 py-1.5 text-sm transition"
        :class="
          group === g
            ? 'border-teal-600 bg-teal-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
        @click="group = g"
      >
        {{ g }}
      </button>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="f in visible"
        :key="f.id"
        class="flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-700"
        @click="$emit('select', f.id)"
      >
        <div class="flex items-center justify-between">
          <span
            class="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
            >{{ f.group }}</span
          >
          <span class="text-xs text-gray-400">{{ f.steps.length }} steps</span>
        </div>
        <div class="font-semibold text-gray-900 dark:text-gray-100">{{ f.name }}</div>
        <p class="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{{ f.summary }}</p>
        <div class="mt-auto flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="a in f.apps || []"
            :key="a"
            class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400"
            >{{ a }}</span
          >
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FLOWS, KIND_CLASS } from '../kbData'
import { buildFlowDiagram } from '../flowDiagram'
import KbCodeLink from './KbCodeLink.vue'
import KbDiagram from './KbDiagram.vue'

const props = defineProps<{ selected?: string }>()
defineEmits<{ (e: 'select', id: string | undefined): void }>()

const group = ref('All')
const groups = [...new Set(FLOWS.map((f) => f.group))]
const visible = computed(() =>
  FLOWS.filter((f) => group.value === 'All' || f.group === group.value)
)
const flow = computed(() => FLOWS.find((f) => f.id === props.selected))
const meta = computed(() =>
  flow.value
    ? [
        { label: 'Trigger', value: flow.value.trigger || '—' },
        { label: 'Subject', value: flow.value.subject || '—' },
        { label: 'Instance key', value: flow.value.instanceKey || '—', mono: true },
        { label: 'Apps', value: (flow.value.apps || []).join(', ') || '—' }
      ]
    : []
)
const diagram = computed(() => (flow.value ? buildFlowDiagram(flow.value) : undefined))
const kindsUsed = computed(() => [
  ...new Set((flow.value?.steps || []).map((s) => s.kind || 'service'))
])
const kindClass = (k: string) => KIND_CLASS[k] || KIND_CLASS.service
</script>
