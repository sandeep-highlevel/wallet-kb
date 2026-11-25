<template>
  <div class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition dark:border-gray-700 dark:bg-gray-800" :class="tone.ring">
    <div class="flex items-baseline justify-between gap-3">
      <div class="min-w-0">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{{ group.family }}</div>
        <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ group.product }}</div>
      </div>
      <span v-if="recurrences" class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400">{{ recurrences }}</span>
    </div>
    <div class="mt-2.5 flex flex-wrap gap-1.5">
      <button
        v-for="r in group.items"
        :key="r.chargeType"
        class="rounded-md px-2 py-0.5 font-mono text-[11.5px] transition hover:-translate-y-px"
        :class="r.chargeType === active ? `${tone.chip} ring-2 ring-current/30` : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-950'"
        :title="r.modelDetail"
        @click="$emit('open', r.chargeType)"
      >{{ r.chargeType }}</button>
    </div>
  </div>
</template>

<script lang="ts">
export interface Tone {
  text: string
  chip: string
  dot: string
  ring: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductGroup } from '../chargeModels'

const props = defineProps<{ group: ProductGroup; tone: Tone; active?: string }>()
defineEmits<{ (e: 'open', chargeType: string): void }>()

const recurrences = computed(() => {
  const set = [...new Set(props.group.items.map((r) => r.recurrence).filter((r) => r !== 'per-use' && r !== 'n/a'))]
  return set.join(' · ')
})
</script>
