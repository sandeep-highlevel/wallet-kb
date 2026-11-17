<template>
  <div class="space-y-8">
    <section
      class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ sdk.package }}
            </h2>
            <span
              class="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
              >v{{ sdk.version }} · {{ sdk.distTag }}</span
            >
          </div>
          <p class="mt-1 text-xs text-gray-400">
            Renamed from <code>{{ sdk.renamedFrom }}</code>
          </p>
        </div>
        <a
          :href="sdk.readmeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-teal-400 dark:border-gray-700 dark:text-gray-200"
          >README ↗</a
        >
      </div>
      <p class="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {{ sdk.summary }}
      </p>
      <div
        class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
      >
        <span class="font-semibold">Depends on an open Gatekeeper PR.</span>
        <code>GET /sdk-config</code> and the codes marked <em>needs PR</em> below exist only on
        <a
          :href="sdk.gatekeeperPr.url"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium underline"
          >ghl-revex-backend#{{ sdk.gatekeeperPr.number }}</a
        >
        ({{ sdk.gatekeeperPr.state }}). Against Gatekeeper master the SDK falls back to HTTP-status
        mapping and built-in defaults. {{ sdk.adoption }}
      </div>
    </section>

    <section
      class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        How a billable action works
      </h2>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Validate and hold, do the work, then settle the hold: charge it or release it.
      </p>
      <KbDiagram
        :diagram="billableDiagram"
        :label="sdk.billableFlow.name"
        :initial-zoom="1"
      />
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Methods (one per Gatekeeper route)
      </h2>
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="m in sdk.methods"
          :key="m.name"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ m.name }}
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="
                m.safeToRepeat
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
              "
              >{{ m.safeToRepeat ? 'Safe to repeat' : 'Not safe to repeat' }}</span
            >
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[11px] font-semibold"
              :class="METHOD_CLASS[m.httpMethod]"
              >{{ m.httpMethod }}</span
            >
            <span class="font-mono text-xs text-gray-600 dark:text-gray-300">{{ m.route }}</span>
            <span class="text-xs text-gray-400">· Holds: {{ m.holds }}</span>
          </div>
          <code class="mt-2 block break-words text-[11.5px] text-gray-500 dark:text-gray-400">{{
            m.signature
          }}</code>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ m.note }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <KbCodeLink
              v-bind="m.sdkRef"
              label="SDK"
            />
            <KbCodeLink
              v-if="routeRef(m)"
              repo="revex"
              v-bind="routeRef(m)"
              label="Gatekeeper route"
            />
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Error codes ({{ sdk.errors.length }})
      </h2>
      <p class="mb-3 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
        Every failure is a <code>WalletError</code> with one of these codes. Codes are a public
        contract: added, never renamed.
      </p>
      <div
        class="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <table class="w-full min-w-[760px] text-sm">
          <thead class="text-left text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th class="px-4 py-2.5">Code</th>
              <th class="px-4 py-2.5">When</th>
              <th class="px-4 py-2.5">What the caller should do</th>
            </tr>
          </thead>
          <tbody
            v-for="g in errorGroups"
            :key="g.kind"
          >
            <tr class="bg-gray-50 dark:bg-gray-900/40">
              <td
                colspan="3"
                class="px-4 py-1.5 text-xs font-semibold capitalize text-gray-500 dark:text-gray-400"
              >
                {{ g.kind }}
              </td>
            </tr>
            <tr
              v-for="e in g.errors"
              :key="e.code"
              class="border-t border-gray-100 align-top dark:border-gray-700"
            >
              <td class="whitespace-nowrap px-4 py-2.5">
                <span class="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">{{
                  e.code
                }}</span>
                <span
                  v-if="e.needsGatekeeperPr"
                  class="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                  >needs PR</span
                >
              </td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-300">{{ e.when }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-300">{{ e.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div
        class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Runtime settings: <code class="text-base">GET /sdk-config</code>
          </h2>
          <KbCodeLink v-bind="cfg.route" />
        </div>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sets, per caller: {{ cfg.sets.join(' · ') }}.
        </p>
        <h3 class="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Precedence, first match wins
        </h3>
        <ol
          class="mt-1 list-decimal space-y-0.5 pl-5 font-mono text-xs text-gray-700 dark:text-gray-300"
        >
          <li
            v-for="p in cfg.precedence"
            :key="p"
          >
            {{ p }}
          </li>
        </ol>
        <h3 class="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Polling</h3>
        <dl class="mt-1 space-y-1 text-sm">
          <div
            v-for="p in cfg.polling"
            :key="p.label"
            class="flex gap-3"
          >
            <dt class="w-40 shrink-0 text-gray-500 dark:text-gray-400">{{ p.label }}</dt>
            <dd class="text-gray-700 dark:text-gray-200">{{ p.value }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">{{ cfg.changeHow }}</p>
      </div>

      <div
        class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Observability</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Recorded client-side for every call, success or failure. Names kept the
          <code>gatekeeper_</code> prefix on purpose: live dashboards depend on them.
        </p>
        <div
          v-for="m in sdk.metrics"
          :key="m.name"
          class="mt-3"
        >
          <div class="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
            {{ m.name }} <span class="font-sans font-normal text-gray-400">({{ m.type }})</span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ m.labels }}</div>
        </div>
        <h3 class="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Headers</h3>
        <div
          v-for="h in sdk.headers"
          :key="h.name"
          class="mt-1 text-xs"
        >
          <code class="text-gray-800 dark:text-gray-200">{{ h.name }}</code>
          <span class="text-gray-500 dark:text-gray-400"> — {{ h.carries }}</span>
        </div>
        <h3 class="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Client options
        </h3>
        <div
          v-for="o in sdk.options"
          :key="o.name"
          class="mt-1.5 text-xs"
        >
          <code class="font-semibold text-gray-800 dark:text-gray-200">{{ o.name }}</code>
          <span class="text-gray-400">
            {{ o.required ? '· required' : `· default ${o.defaultValue}` }}</span
          >
          <div class="text-gray-500 dark:text-gray-400">{{ o.purpose }}</div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Behaviour worth knowing
      </h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="s in sdk.semantics"
          :key="s.title"
          class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ s.title }}</div>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ s.detail }}</p>
        </div>
      </div>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Gatekeeper gaps the SDK documents are listed under
        <button
          class="font-medium text-teal-700 hover:underline dark:text-teal-400"
          @click="emit('navigate', 'controls')"
        >
          Controls &amp; gaps</button
        >.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { APPS, METHOD_CLASS, WALLET_SDK } from '../kbData'
import { errorsByKind, gatekeeperRoute } from '../kbSdk'
import { buildFlowDiagram } from '../flowDiagram'
import type { SdkMethod } from '../types'
import KbCodeLink from './KbCodeLink.vue'
import KbDiagram from './KbDiagram.vue'

const emit = defineEmits<{ navigate: [tab: string] }>()

const sdk = WALLET_SDK
const cfg = sdk.remoteConfig
const errorGroups = errorsByKind(sdk.errors)
const billableDiagram = buildFlowDiagram(sdk.billableFlow)

function routeRef(m: SdkMethod) {
  const api = gatekeeperRoute(APPS, m.httpMethod, m.route)
  return api ? { path: api.path, line: api.line } : undefined
}
</script>
