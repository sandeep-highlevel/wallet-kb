<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="d in ['All', ...domains]"
        :key="d"
        class="rounded-full border px-3.5 py-1.5 text-sm transition"
        :class="
          domain === d
            ? 'border-teal-600 bg-teal-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
        @click="domain = d"
      >
        {{ d }}
      </button>
      <input
        v-model="query"
        placeholder="Filter by name or field…"
        class="ml-auto w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-teal-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </div>

    <div class="space-y-3">
      <details
        v-for="c in visible"
        :id="`kb-coll-${c.name}-${c.database}`"
        :key="`${c.name}-${c.database}`"
        :open="c.name === selected"
        class="group rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <summary class="flex cursor-pointer list-none items-start gap-3 p-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-[15px] font-semibold text-gray-900 dark:text-gray-100">{{
                c.name
              }}</span>
              <span
                v-if="c.domain"
                class="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                >{{ c.domain }}</span
              >
              <span
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400"
                >{{ (c.indexes || []).length }} indexes</span
              >
              <span
                v-if="c.notes"
                class="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                >needs attention</span
              >
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ c.purpose }}</p>
            <div class="mt-0.5 text-xs text-gray-400">
              <span v-if="c.model"
                >Model
                <b class="font-medium text-gray-500 dark:text-gray-300">{{ c.model }}</b></span
              >
              <span v-if="c.database"> · DB {{ c.database }}</span>
            </div>
          </div>
          <span
            class="text-gray-400 transition group-open:rotate-90"
            aria-hidden="true"
            >›</span
          >
        </summary>
        <div class="grid gap-5 border-t border-gray-100 p-4 md:grid-cols-2 dark:border-gray-700">
          <div>
            <h4 class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Indexes
            </h4>
            <div
              v-for="(ix, i) in c.indexes || []"
              :key="i"
              class="mb-1.5 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800 dark:bg-gray-900/60 dark:text-gray-200"
            >
              <span>{ {{ keysText(ix.keys) }} }</span>
              <span
                v-for="o in optionChips(ix.options)"
                :key="o.text"
                class="rounded px-1.5 text-[10.5px]"
                :class="
                  o.ttl
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
                "
                >{{ o.text }}</span
              >
              <span
                v-if="ix.declaredIn"
                class="ml-auto font-sans text-[11px] text-gray-400"
                >{{ ix.declaredIn }}</span
              >
            </div>
            <p
              v-if="!(c.indexes || []).length"
              class="text-sm text-gray-400"
            >
              No indexes declared in code.
            </p>
            <div
              v-if="c.notes"
              class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
            >
              {{ c.notes }}
            </div>
          </div>
          <div>
            <h4 class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Key fields
            </h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="f in c.fields || []"
                :key="f.name"
                class="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11.5px] text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                {{ f.name }} <span class="text-gray-400">{{ f.type }}</span>
              </span>
            </div>
            <template v-if="c.usedBy?.length">
              <h4
                class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400"
              >
                Used by
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="u in c.usedBy"
                  :key="u"
                  class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11.5px] text-gray-600 dark:bg-gray-900 dark:text-gray-400"
                  >{{ u }}</span
                >
              </div>
            </template>
            <h4 class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Schema
            </h4>
            <KbCodeLink
              :repo="c.repo"
              :path="c.path"
              :line="c.line"
            />
          </div>
        </div>
      </details>
      <p
        v-if="!visible.length"
        class="p-6 text-center text-sm text-gray-400"
      >
        No collections match.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { COLLECTIONS } from '../kbData'
import KbCodeLink from './KbCodeLink.vue'

const props = defineProps<{ selected?: string }>()

const domain = ref('All')
const query = ref('')
const domains = [...new Set(COLLECTIONS.map((c) => c.domain).filter((d): d is string => !!d))]
const visible = computed(() => {
  const q = query.value.toLowerCase()
  return COLLECTIONS.filter(
    (c) =>
      (domain.value === 'All' || c.domain === domain.value) &&
      (!q || JSON.stringify(c).toLowerCase().includes(q))
  )
})

const keysText = (keys: Record<string, unknown>) =>
  Object.entries(keys)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
function optionChips(opts: Record<string, unknown> = {}) {
  return Object.entries(opts)
    .filter(([k]) => k !== 'name' && k !== 'background')
    .map(([k, v]) => {
      const ttl = /expire/i.test(k)
      const val = typeof v === 'object' ? JSON.stringify(v) : v === true ? '' : String(v)
      return { ttl, text: ttl ? `TTL ${val}s` : `${k}${val ? ` ${val}` : ''}` }
    })
}

onMounted(async () => {
  if (!props.selected) return
  await nextTick()
  const target = [...document.querySelectorAll<HTMLElement>('[id^="kb-coll-"]')].find((el) =>
    el.id.startsWith(`kb-coll-${props.selected}-`)
  )
  target?.scrollIntoView({ block: 'start', behavior: 'smooth' })
})
</script>
