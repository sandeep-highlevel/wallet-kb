<template>
  <svg
    viewBox="0 0 1000 150"
    class="h-auto w-full"
    role="img"
    aria-label="Money moves from producers to billing, Blade platform, payments and data"
  >
    <defs>
      <linearGradient id="kb-edge" x1="0" x2="1">
        <stop offset="0" stop-color="#2dd4bf" stop-opacity="0.15" />
        <stop offset="0.5" stop-color="#5eead4" stop-opacity="0.8" />
        <stop offset="1" stop-color="#38bdf8" stop-opacity="0.15" />
      </linearGradient>
      <radialGradient id="kb-dot">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.4" stop-color="#5eead4" />
        <stop offset="1" stop-color="#5eead4" stop-opacity="0" />
      </radialGradient>
    </defs>

    <g v-for="(e, i) in edges" :key="`e${i}`">
      <path :d="e" fill="none" stroke="url(#kb-edge)" stroke-width="2" />
      <path :d="e" fill="none" stroke="#5eead4" stroke-opacity="0.55" stroke-width="1.5" class="kb-dash" />
      <circle v-for="p in 3" :key="p" r="7" fill="url(#kb-dot)" class="kb-particle">
        <animateMotion :path="e" :dur="`${2.4 + i * 0.15}s`" :begin="`${(p - 1) * 0.8 + i * 0.3}s`" repeatCount="indefinite" />
      </circle>
    </g>

    <g v-for="(n, i) in nodes" :key="n.title" :transform="`translate(${x(i)}, 75)`">
      <g class="kb-rise" :style="{ animationDelay: `${900 + i * 110}ms` }">
      <circle r="30" fill="none" stroke="#5eead4" stroke-opacity="0.35" class="kb-ring" :style="{ animationDelay: `${i * 0.45}s` }" />
      <rect x="-72" y="-36" width="144" height="72" rx="16" fill="rgb(255 255 255 / 0.07)" stroke="rgb(255 255 255 / 0.18)" />
      <text y="-8" text-anchor="middle" fill="#99f6e4" font-size="11" font-weight="700" letter-spacing="1.4">{{ `${i + 1} · ${n.title.toUpperCase()}` }}</text>
      <text y="13" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="600">{{ n.sub }}</text>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
const nodes = [
  { title: 'Producers', sub: 'SMS · Email · AI' },
  { title: 'Billing', sub: 'Charge worker' },
  { title: 'Blade', sub: 'Settlement' },
  { title: 'Payments', sub: 'Recharge · Stripe' },
  { title: 'Data', sub: 'Ledger · ClickHouse' }
]
const x = (i: number) => 100 + i * 200
// Gentle arcs between neighbouring nodes (alternating up and down) so particles feel alive.
const edges = nodes.slice(0, -1).map((_, i) => {
  const a = x(i) + 72
  const b = x(i + 1) - 72
  const mid = (a + b) / 2
  const bend = i % 2 ? 100 : 50
  return `M ${a} 75 Q ${mid} ${bend} ${b} 75`
})
</script>
