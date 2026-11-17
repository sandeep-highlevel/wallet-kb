<template>
  <div>
    <div class="mb-2 flex items-center gap-2">
      <button
        class="rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-700"
        aria-label="Zoom out"
        @click="zoom = Math.max(0.4, zoom - 0.2)"
      >
        −
      </button>
      <span class="w-12 text-center text-xs text-gray-500">{{ Math.round(zoom * 100) }}%</span>
      <button
        class="rounded-md border border-gray-200 px-2 py-0.5 text-sm dark:border-gray-700"
        aria-label="Zoom in"
        @click="zoom = Math.min(2, zoom + 0.2)"
      >
        +
      </button>
    </div>
    <div
      class="max-h-[640px] overflow-auto rounded-xl bg-white p-2 ring-1 ring-gray-100 dark:ring-gray-700"
    >
      <svg
        :width="diagram.width * zoom"
        :height="diagram.height * zoom"
        :viewBox="`${diagram.minX} ${diagram.minY} ${diagram.width} ${diagram.height}`"
        role="img"
        :aria-label="label"
        font-family="Inter, system-ui, sans-serif"
      >
        <defs>
          <marker
            id="kb-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              d="M0,0 L10,5 L0,10 z"
              fill="#475569"
            />
          </marker>
        </defs>
        <!-- Shapes first, then edges, then all text: draw.io edge labels are text nodes, and a lane container would otherwise cover the lines. -->
        <g
          v-for="n in diagram.nodes"
          :key="n.id"
        >
          <rect
            v-if="n.shape === 'rect' || n.shape === 'rounded' || n.shape === 'cylinder'"
            :x="n.x"
            :y="n.y"
            :width="n.w"
            :height="n.h"
            :rx="n.shape === 'rect' ? 2 : 10"
            :fill="n.fill || '#ffffff'"
            :stroke="n.stroke || '#94a3b8'"
          />
          <ellipse
            v-else-if="n.shape === 'ellipse'"
            :cx="n.x + n.w / 2"
            :cy="n.y + n.h / 2"
            :rx="n.w / 2"
            :ry="n.h / 2"
            :fill="n.fill || '#ffffff'"
            :stroke="n.stroke || '#94a3b8'"
          />
          <polygon
            v-else-if="n.shape === 'rhombus'"
            :points="`${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}`"
            :fill="n.fill || '#fffbeb'"
            :stroke="n.stroke || '#d97706'"
          />
          <g
            v-else-if="n.shape === 'actor'"
            stroke="#475569"
            fill="none"
            stroke-width="1.5"
          >
            <circle
              :cx="n.x + n.w / 2"
              :cy="n.y + n.h * 0.15"
              :r="n.h * 0.13"
            />
            <path
              :d="`M${n.x + n.w / 2},${n.y + n.h * 0.28} V${n.y + n.h * 0.65} M${n.x},${n.y + n.h * 0.4} H${n.x + n.w} M${n.x + n.w / 2},${n.y + n.h * 0.65} L${n.x},${n.y + n.h} M${n.x + n.w / 2},${n.y + n.h * 0.65} L${n.x + n.w},${n.y + n.h}`"
            />
          </g>
        </g>
        <g
          v-for="e in diagram.edges"
          :key="e.id"
        >
          <polyline
            :points="e.points.map((p) => `${p.x},${p.y}`).join(' ')"
            fill="none"
            stroke="#64748b"
            stroke-width="1.4"
            :marker-end="e.arrow ? 'url(#kb-arrow)' : undefined"
          />
          <text
            v-if="e.label"
            :x="mid(e.points).x"
            :y="mid(e.points).y - 4"
            font-size="10"
            fill="#334155"
            text-anchor="middle"
            paint-order="stroke"
            stroke="#fff"
            stroke-width="3"
          >
            {{ e.label }}
          </text>
        </g>
        <g
          v-for="n in diagram.nodes"
          :key="`label-${n.id}`"
        >
          <text
            :x="n.x + n.w / 2"
            :y="labelY(n)"
            font-size="11"
            fill="#1e293b"
            text-anchor="middle"
          >
            <tspan
              v-for="(line, i) in n.label.split('\n')"
              :key="i"
              :x="n.x + n.w / 2"
              :dy="i === 0 ? 0 : 13"
            >
              {{ line }}
            </tspan>
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { parseDrawio, type Diagram, type DiagramNode } from '../drawio'

/** Pass draw.io XML, or a diagram already laid out in code (flow diagrams). */
const props = withDefaults(
  defineProps<{ xml?: string; diagram?: Diagram; label?: string; initialZoom?: number }>(),
  { xml: '', diagram: undefined, label: 'Wallet transaction flow diagram', initialZoom: 0.8 }
)

const diagram = computed(() => props.diagram || parseDrawio(props.xml))
const zoom = ref(props.initialZoom)

/** Midpoint of the middle segment, where the edge label sits. */
function mid(pts: { x: number; y: number }[]): { x: number; y: number } {
  const a = pts[Math.floor((pts.length - 1) / 2)]
  const b = pts[Math.ceil((pts.length - 1) / 2)]
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}
/** Vertically centre multi-line labels; actors put the label underneath. */
function labelY(n: DiagramNode): number {
  if (n.shape === 'actor') return n.y + n.h + 14
  const lines = n.label.split('\n').length
  return n.y + n.h / 2 - ((lines - 1) * 13) / 2 + 4
}
</script>
