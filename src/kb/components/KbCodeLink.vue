<template>
  <a
    v-if="url"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :title="title"
    class="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[11.5px] text-teal-800 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:hover:bg-teal-900/60"
  >
    <svg
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
    <span class="truncate">{{ text }}</span>
  </a>
  <code
    v-else-if="path"
    class="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11.5px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    >{{ text }}</code
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { REPO_LINKS } from '../kbData'
import { githubUrl, shortRef } from '../kbLinks'

const props = defineProps<{
  repo?: string
  path?: string
  line?: number | null
  label?: string
}>()

const url = computed(() => githubUrl(REPO_LINKS, props.repo || 'revex', props.path, props.line))
const text = computed(() => props.label || shortRef(props.path, props.line))
const title = computed(() => {
  const repoName = REPO_LINKS[props.repo || 'revex']?.name || props.repo
  return `${repoName}/${props.path || ''}${props.line ? `:${props.line}` : ''}`
})
</script>
