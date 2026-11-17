<template>
  <div class="space-y-8">
    <section
      class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Wallet transaction flow
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Usage, manual recharge and auto recharge, from product bill to settlement.
          </p>
        </div>
        <a
          :href="WALLET_TXN_FLOW_DRAWIO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-teal-400 dark:border-gray-700 dark:text-gray-200"
          >Open in draw.io ↗</a
        >
      </div>
      <KbDiagram :xml="WALLET_TXN_FLOW_XML" />
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Docs</h2>
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="g in REFERENCE_GROUPS"
          :key="g.name"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-1 px-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ g.name }}
          </div>
          <a
            v-for="d in g.docs"
            :key="d.url"
            :href="d.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/50"
          >
            <div class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ d.title }}</div>
            <div class="text-xs text-gray-400">{{ d.where }}</div>
          </a>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Code repositories</h2>
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="r in CODE_REPOS"
          :key="r.name"
          class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="font-semibold text-gray-900 dark:text-gray-100">{{ r.name }}</div>
            <a
              :href="r.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
              >GitHub ↗</a
            >
          </div>
          <div class="text-xs text-gray-400">{{ r.stack }}</div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ r.role }}</p>
          <div
            v-if="r.parts.length"
            class="mt-3 space-y-1.5"
          >
            <div
              v-for="p in r.parts"
              :key="p.path"
              class="flex items-baseline justify-between gap-3"
            >
              <a
                :href="`${r.url}/tree/master/${p.path}`"
                target="_blank"
                rel="noopener noreferrer"
                class="font-mono text-xs text-teal-700 hover:underline dark:text-teal-400"
                >{{ p.path }}</a
              >
              <span class="text-right text-xs text-gray-500 dark:text-gray-400">{{ p.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CODE_REPOS, REFERENCE_GROUPS, WALLET_TXN_FLOW_DRAWIO_URL } from '../data/references'
import { WALLET_TXN_FLOW_XML } from '../data/walletTxnFlowDiagram'
import KbDiagram from './KbDiagram.vue'
</script>
