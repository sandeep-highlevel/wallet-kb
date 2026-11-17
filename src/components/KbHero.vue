<template>
  <section
    ref="el"
    class="relative isolate overflow-hidden rounded-3xl bg-[#071a1c] px-6 pb-6 pt-10 text-white shadow-2xl shadow-teal-950/30 sm:px-10 sm:pt-12"
    @pointermove="onMove"
  >
    <!-- Aurora -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div data-hero="blob" class="kb-blob absolute -left-24 -top-32 h-96 w-96 rounded-full bg-teal-500/40 blur-3xl" />
      <div data-hero="blob" class="kb-blob absolute -right-20 top-0 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" style="animation-delay: -6s" />
      <div data-hero="blob" class="kb-blob absolute bottom-[-10rem] left-1/3 h-96 w-[34rem] rounded-full bg-emerald-400/20 blur-3xl" style="animation-delay: -12s" />
      <div
        class="absolute inset-0 opacity-[0.14]"
        style="background-image: linear-gradient(rgb(255 255 255 / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.5) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)"
      />
      <div
        class="absolute inset-0 transition-opacity duration-500"
        :style="{ background: `radial-gradient(520px circle at ${mx}px ${my}px, rgb(94 234 212 / 0.16), transparent 60%)` }"
      />
    </div>

    <div data-hero="badge" class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200 backdrop-blur">
      <span class="relative flex h-2 w-2">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-70" />
        <span class="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
      </span>
      Blade Platform · Wallet
    </div>

    <h1 class="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight [perspective:600px] sm:text-6xl">
      <span ref="lead">How money moves through</span>{{ ' ' }}
      <span data-hero="accent" class="kb-shimmer inline-block bg-gradient-to-r from-teal-200 via-white to-sky-300 bg-clip-text text-transparent">HighLevel wallets</span>
    </h1>
    <p data-hero="copy" class="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
      Who charges, who recharges, which worker settles, where the data lands, and the line of code behind every step.
    </p>

    <div data-hero="actions" class="mt-6 flex flex-wrap items-center gap-3">
      <button
        v-magnetic="0.25"
        class="group inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-teal-950 shadow-lg shadow-teal-500/30 transition hover:-translate-y-0.5 hover:bg-teal-300"
        @click="$emit('navigate', 'flows', 'wallet_charge')"
      >
        Follow a wallet charge
        <span class="transition-transform group-hover:translate-x-1">→</span>
      </button>
      <button
        v-magnetic="0.25"
        class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
        @click="$emit('search')"
      >
        Search everything
        <kbd class="rounded-md border border-white/20 px-1.5 font-mono text-[10px] text-slate-300">⌘K</kbd>
      </button>
      <span class="font-mono text-[11px] text-slate-400">
        pinned: ghl-revex-backend@{{ revexSha }} · saas-service@{{ saasSha }}
      </span>
    </div>

    <dl class="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div
        v-for="s in stats"
        :key="s.label"
        data-hero="stat" class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur transition hover:border-teal-300/40 hover:bg-white/[0.07]"
      >
        <dt class="text-[11px] font-medium uppercase tracking-wider text-slate-400">{{ s.label }}</dt>
        <dd class="mt-1 font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">{{ s.value.value }}</dd>
      </div>
    </dl>

    <div data-hero="flow" class="mt-6 hidden md:block">
      <HeroFlow />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HeroFlow from './HeroFlow.vue'
import { useCountUp } from '../composables/useCountUp'
import { gsap, SplitText } from '../composables/gsap'
import { vMagnetic } from '../composables/magnetic'
import { prefersReducedMotion } from '../composables/motion'
import { KB_TOTALS } from '../kb/kbData'
import { PINNED_REPOS } from '../kb/kbLinks'

defineEmits<{ (e: 'navigate', tab: string, item?: string): void; (e: 'search'): void }>()

const revexSha = (PINNED_REPOS.revex?.ref || '').slice(0, 7)
const saasSha = (PINNED_REPOS.saas?.ref || '').slice(0, 7)

const stats = [
  { label: 'Wallet flows', value: useCountUp(KB_TOTALS.flows, 1200, 300) },
  { label: 'Code-linked steps', value: useCountUp(KB_TOTALS.steps, 1500, 360) },
  { label: 'HTTP APIs', value: useCountUp(KB_TOTALS.apis, 1500, 420) },
  { label: 'Workers & crons', value: useCountUp(KB_TOTALS.workers, 1500, 480) },
  { label: 'Collections', value: useCountUp(KB_TOTALS.collections, 1500, 540) }
]

const el = ref<HTMLElement | null>(null)
const lead = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

// Intro: badge drops in, headline words flip up, copy and actions follow, stats pop, blobs parallax on scroll.
onMounted(() => {
  if (prefersReducedMotion() || !el.value) return
  ctx = gsap.context(() => {
    const q = (k: string) => `[data-hero="${k}"]`
    const split = lead.value ? new SplitText(lead.value, { type: 'words', wordsClass: 'inline-block' }) : null
    const CLEAR = 'opacity,visibility,transform,translate,rotate,scale,filter'
    const hidden = { autoAlpha: 0 }
    const shown = { autoAlpha: 1, x: 0, y: 0, yPercent: 0, rotateX: 0, scale: 1, filter: 'blur(0px)', clearProps: CLEAR }
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(q('badge'), { ...hidden, y: -16 }, { ...shown, duration: 0.6 })
      .fromTo(split?.words ?? [], { ...hidden, yPercent: 110, rotateX: -70, transformOrigin: '50% 100%' }, { ...shown, duration: 0.8, stagger: 0.06 }, '-=0.3')
      .fromTo(q('accent'), { ...hidden, y: 30, scale: 0.92, filter: 'blur(10px)' }, { ...shown, duration: 0.9 }, '-=0.5')
      .fromTo(q('copy'), { ...hidden, y: 18 }, { ...shown, duration: 0.7 }, '-=0.6')
      .fromTo(`${q('actions')} > *`, { ...hidden, y: 14 }, { ...shown, duration: 0.6, stagger: 0.08 }, '-=0.5')
      .fromTo(q('stat'), { ...hidden, y: 24, scale: 0.94 }, { ...shown, duration: 0.7, stagger: 0.07, ease: 'back.out(1.6)' }, '-=0.4')
      .fromTo(q('flow'), { ...hidden, y: 20 }, { ...shown, duration: 0.8 }, '-=0.5')
    gsap.utils.toArray<HTMLElement>(q('blob')).forEach((b, i) => {
      gsap.to(b, { yPercent: 30 + i * 15, ease: 'none', scrollTrigger: { trigger: el.value, start: 'top top', end: 'bottom top', scrub: true } })
    })
  }, el.value)
})
onBeforeUnmount(() => ctx?.revert())
const mx = ref(-999)
const my = ref(-999)
function onMove(e: PointerEvent) {
  const r = el.value?.getBoundingClientRect()
  if (!r) return
  mx.value = e.clientX - r.left
  my.value = e.clientY - r.top
}
</script>
