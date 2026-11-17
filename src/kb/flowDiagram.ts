// Turns a wallet flow's step list into a swimlane diagram: one column per app, one row per step,
// top to bottom from the trigger to the outcomes. KbDiagram renders the result as inline SVG, so
// every flow gets a picture generated from the same data as its step list.

import type { Diagram, DiagramEdge, DiagramNode } from './drawio'
import type { FlowStep, WalletFlow } from './types'

const LANE_W = 240
const BOX_W = 200
const BOX_H = 56
const ROW_H = 92
const HEADER_H = 36
const TOP = HEADER_H + 16
const LABEL_CHARS = 30
const HOP_CHARS = 34

interface KindColor {
  fill: string
  stroke: string
}

export const KIND_COLORS: Record<string, KindColor> = {
  api: { fill: '#f0f9ff', stroke: '#0ea5e9' },
  'pubsub-worker': { fill: '#f5f3ff', stroke: '#8b5cf6' },
  worker: { fill: '#f5f3ff', stroke: '#8b5cf6' },
  cron: { fill: '#fffbeb', stroke: '#f59e0b' },
  'cloud-task': { fill: '#fffbeb', stroke: '#f59e0b' },
  webhook: { fill: '#fff1f2', stroke: '#f43f5e' },
  'cdc/change-stream': { fill: '#f7fee7', stroke: '#84cc16' },
  service: { fill: '#ffffff', stroke: '#94a3b8' }
}

/** Step kinds whose incoming hop crosses a topic or queue worth naming on the arrow. */
const ASYNC_KINDS = new Set(['pubsub-worker', 'cloud-task', 'cdc/change-stream'])

/** The app a step runs in: the monorepo app folder, or the repo for single-app repos. */
export function stepLane(step: FlowStep): string {
  const m = /^(?:apps|libs|packages)\/([^/]+)\//.exec(step.path || '')
  return m ? m[1] : step.repo || 'other'
}

/** Lanes in the order the flow's steps first enter them. */
export function flowLanes(flow: WalletFlow): string[] {
  return [...new Set(flow.steps.map(stepLane))]
}

/** Greedy word wrap; the last allowed line ends in an ellipsis when text is left over. */
export function wrapLabel(text: string, maxChars: number, maxLines: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let i = 0
  while (i < words.length && lines.length < maxLines) {
    if (lines.length === maxLines - 1) {
      const rest = words.slice(i).join(' ')
      lines.push(rest.length > maxChars ? `${rest.slice(0, maxChars - 1)}…` : rest)
      break
    }
    let line = words[i++]
    while (i < words.length && `${line} ${words[i]}`.length <= maxChars) line += ` ${words[i++]}`
    lines.push(line.length > maxChars ? `${line.slice(0, maxChars - 1)}…` : line)
  }
  return lines.join('\n')
}

const rowY = (row: number): number => TOP + row * ROW_H
const colX = (col: number): number => col * LANE_W + (LANE_W - BOX_W) / 2

function box(id: string, col: number, row: number, label: string, color: KindColor): DiagramNode {
  return {
    id,
    x: colX(col),
    y: rowY(row),
    w: BOX_W,
    h: BOX_H,
    shape: 'rounded',
    label,
    fill: color.fill,
    stroke: color.stroke
  }
}

/** Arrow from the bottom of one box to the top of another, with a dog-leg across lanes. */
function link(id: string, from: DiagramNode, to: DiagramNode, label = ''): DiagramEdge {
  const a = { x: from.x + from.w / 2, y: from.y + from.h }
  const b = { x: to.x + to.w / 2, y: to.y }
  const midY = (a.y + b.y) / 2
  const points = a.x === b.x ? [a, b] : [a, { x: a.x, y: midY }, { x: b.x, y: midY }, b]
  return { id, points, label, arrow: true }
}

function hopLabel(prev: FlowStep, next: FlowStep): string {
  if (!next.kind || !ASYNC_KINDS.has(next.kind) || !next.channel) return ''
  if (next.channel === prev.channel) return ''
  // "topic (EVENT_A / EVENT_B)": the event says more than the topic, which the step card shows.
  const event = /\(([^)]+)\)\s*$/.exec(next.channel)?.[1] || next.channel
  return event.length > HOP_CHARS ? `${event.slice(0, HOP_CHARS - 1)}…` : event
}

function outcomeLabel(title: string, items: string[], noun: [string, string]): string {
  const count = `${items.length} ${items.length === 1 ? noun[0] : noun[1]}`
  return `${title} (${count})\n${wrapLabel(items[0], LABEL_CHARS + 2, 2)}`
}

export function buildFlowDiagram(flow: WalletFlow): Diagram {
  const lanes = flowLanes(flow)
  const cols = Math.max(lanes.length, 2)
  const colOf = (s: FlowStep): number => lanes.indexOf(stepLane(s))

  const steps = flow.steps.map((s, i) =>
    box(
      `step-${i}`,
      colOf(s),
      i + 1,
      wrapLabel(`${i + 1}. ${s.title || s.name}`, LABEL_CHARS, 3),
      KIND_COLORS[s.kind || 'service'] || KIND_COLORS.service
    )
  )
  const start = box(
    'start',
    colOf(flow.steps[0]),
    0,
    `Trigger\n${wrapLabel(flow.trigger || flow.name, LABEL_CHARS + 2, 2)}`,
    { fill: '#f0fdfa', stroke: '#14b8a6' }
  )

  const edges: DiagramEdge[] = [link('start-0', start, steps[0])]
  for (let i = 1; i < steps.length; i++) {
    edges.push(
      link(`step-${i - 1}-${i}`, steps[i - 1], steps[i], hopLabel(flow.steps[i - 1], flow.steps[i]))
    )
  }

  const last = steps[steps.length - 1]
  const lastCol = colOf(flow.steps[flow.steps.length - 1])
  const endRow = steps.length + 1
  const outcomes: DiagramNode[] = []
  const success = flow.terminal?.success || []
  const failure = flow.terminal?.failure || []
  if (success.length) {
    outcomes.push(
      box(
        'end-success',
        lastCol,
        endRow,
        outcomeLabel('Ends well', success, ['outcome', 'outcomes']),
        {
          fill: '#ecfdf5',
          stroke: '#10b981'
        }
      )
    )
  }
  if (failure.length) {
    const col = success.length ? (lastCol + 1 < cols ? lastCol + 1 : lastCol - 1) : lastCol
    outcomes.push(
      box(
        'end-failure',
        col,
        endRow,
        outcomeLabel('Fails', failure, ['failure path', 'failure paths']),
        { fill: '#fff1f2', stroke: '#f43f5e' }
      )
    )
  }
  for (const o of outcomes) edges.push(link(o.id, last, o))

  const height = rowY(outcomes.length ? endRow : steps.length) + BOX_H + 20
  const laneNodes = lanes.flatMap((name, col): DiagramNode[] => [
    {
      id: `lane-${name}`,
      x: col * LANE_W + 4,
      y: 0,
      w: LANE_W - 8,
      h: height,
      shape: 'rect',
      label: '',
      fill: '#f8fafc',
      stroke: '#e2e8f0'
    },
    {
      id: `laneh-${name}`,
      x: col * LANE_W,
      y: 4,
      w: LANE_W,
      h: HEADER_H - 8,
      shape: 'text',
      label: name
    }
  ])

  return {
    minX: 0,
    minY: 0,
    width: cols * LANE_W,
    height,
    nodes: [...laneNodes, start, ...steps, ...outcomes],
    edges
  }
}
