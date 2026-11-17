<template>
  <Transition name="palette">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-md"
      @click.self="$emit('close')"
    >
      <div
        class="palette-card w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-slate-900/95"
        role="dialog"
        aria-modal="true"
        aria-label="Search the knowledge base"
      >
        <div class="flex items-center gap-3 border-b border-gray-100 px-5 dark:border-white/10">
          <svg class="h-5 w-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref="input"
            v-model="query"
            placeholder="Search flows, APIs, workers, collections, controls, SDK…"
            class="w-full bg-transparent py-4 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
            aria-label="Search"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="choose(hits[sel])"
            @keydown.esc.prevent="$emit('close')"
          />
          <span class="whitespace-nowrap font-mono text-[11px] text-gray-400">{{ hits.length }} results</span>
        </div>
        <div ref="list" class="max-h-[55vh] overflow-y-auto p-2">
            <button
              v-for="(h, i) in hits"
              :key="`${h.kind}-${h.title}-${i}`"
              :data-i="i"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
              :class="i === sel ? 'bg-teal-50 dark:bg-teal-400/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'"
              @mouseenter="sel = i"
              @click="choose(h)"
            >
              <span class="h-8 w-1 rounded-full transition-colors" :class="i === sel ? 'bg-teal-500' : 'bg-transparent'" />
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{{ h.title }}</div>
                <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ h.subtitle }}</div>
              </div>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="kindClass(h.kind)">{{ h.kind }}</span>
              <span v-if="h.target.url" class="text-xs text-gray-400" aria-label="opens in a new tab">↗</span>
            </button>
          <p v-if="!hits.length" class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Nothing matches. Try a route, topic, collection or event name.
          </p>
        </div>
        <div class="flex items-center gap-4 border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-400 dark:border-white/10">
          <span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> move</span>
          <span><kbd class="kbd">↵</kbd> open</span>
          <span><kbd class="kbd">esc</kbd> close</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { searchIndex, type SearchEntry } from '../kb/kbSearch'

const props = defineProps<{ open: boolean; index: SearchEntry[] }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'pick', hit: SearchEntry): void }>()

const query = ref('')
const sel = ref(0)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const hits = computed(() => searchIndex(props.index, query.value))

watch(query, () => (sel.value = 0))
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    query.value = ''
    sel.value = 0
    await nextTick()
    input.value?.focus()
  }
)
watch(sel, async (i) => {
  await nextTick()
  list.value?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest' })
})

function move(d: number) {
  if (hits.value.length) sel.value = (sel.value + d + hits.value.length) % hits.value.length
}
function choose(h: SearchEntry | undefined) {
  if (h) emit('pick', h)
}

const KIND_TINT: Record<string, string> = {
  flow: 'bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300',
  api: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
  worker: 'bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300',
  collection: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  control: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  gap: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
}
const kindClass = (kind: string) =>
  KIND_TINT[kind.toLowerCase()] || 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300'
</script>

<style scoped>
.kbd {
  border: 1px solid rgb(156 163 175 / 0.4);
  border-radius: 4px;
  padding: 0 4px;
  font-family: var(--font-mono);
}
</style>
