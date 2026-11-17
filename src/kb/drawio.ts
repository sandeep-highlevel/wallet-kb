// Minimal draw.io (mxGraph) reader: turns an uncompressed .drawio file into boxes, labels and
// orthogonal edges that KbDiagram renders as inline SVG. It covers the shapes used by the wallet
// diagrams (rect, rounded, ellipse, rhombus, cylinder, actor, text, arrows). It does not cover the
// full draw.io feature set. The IDP's CSP blocks the official viewer script.

export type NodeShape = 'rect' | 'rounded' | 'ellipse' | 'rhombus' | 'cylinder' | 'actor' | 'text'

export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  shape: NodeShape
  label: string
  fill?: string
  stroke?: string
}

export interface DiagramEdge {
  id: string
  points: { x: number; y: number }[]
  label: string
  arrow: boolean
}

export interface Diagram {
  width: number
  height: number
  minX: number
  minY: number
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

type Style = Record<string, string>

export function parseStyle(style: string | null): Style {
  const out: Style = {}
  for (const part of (style || '').split(';')) {
    if (!part) continue
    const eq = part.indexOf('=')
    if (eq === -1) out[part] = '1'
    else out[part.slice(0, eq)] = part.slice(eq + 1)
  }
  return out
}

/** Strip draw.io's HTML labels to plain text, keeping line breaks. */
export function labelText(value: string | null): string {
  if (!value) return ''
  const withBreaks = value.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p)>/gi, '\n')
  const doc = new DOMParser().parseFromString(`<body>${withBreaks}</body>`, 'text/html')
  return (doc.body.textContent || '')
    .replace(/ /g, ' ')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

function shapeOf(style: Style): NodeShape {
  if ('text' in style || style.shape === 'text') return 'text'
  if ('ellipse' in style || style.shape === 'ellipse' || style.shape === 'mxgraph.basic.arc')
    return 'ellipse'
  if ('rhombus' in style || style.shape === 'rhombus' || style.shape === 'hexagon') return 'rhombus'
  if (style.shape === 'cylinder3' || style.shape === 'cylinder') return 'cylinder'
  if (style.shape === 'umlActor') return 'actor'
  if (style.rounded === '1') return 'rounded'
  return 'rect'
}

const num = (el: Element | null, attr: string): number => Number(el?.getAttribute(attr) || 0)

/** Point on a node: explicit (fx, fy) fractions, else the side centre facing `toward`. */
function anchor(n: DiagramNode, toward: { x: number; y: number }, fx?: string, fy?: string) {
  if (fx !== undefined && fy !== undefined)
    return { x: n.x + Number(fx) * n.w, y: n.y + Number(fy) * n.h }
  const cx = n.x + n.w / 2
  const cy = n.y + n.h / 2
  const dx = toward.x - cx
  const dy = toward.y - cy
  if (Math.abs(dx) * n.h > Math.abs(dy) * n.w) return { x: dx > 0 ? n.x + n.w : n.x, y: cy }
  return { x: cx, y: dy > 0 ? n.y + n.h : n.y }
}

/** Insert elbows so each segment is horizontal or vertical. */
export function orthogonalize(pts: { x: number; y: number }[]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  pts.forEach((p, i) => {
    if (i > 0) {
      const prev = out[out.length - 1]
      if (prev.x !== p.x && prev.y !== p.y) out.push({ x: p.x, y: prev.y })
    }
    out.push(p)
  })
  return out
}

export function parseDrawio(xml: string): Diagram {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const cells = Array.from(doc.getElementsByTagName('mxCell'))
  const nodes = new Map<string, DiagramNode>()
  const edgeCells: Element[] = []

  for (const cell of cells) {
    if (cell.getAttribute('edge') === '1') {
      edgeCells.push(cell)
      continue
    }
    if (cell.getAttribute('vertex') !== '1') continue
    const geo = cell.querySelector('mxGeometry')
    if (!geo || geo.getAttribute('relative') === '1') continue
    const style = parseStyle(cell.getAttribute('style'))
    const parent = nodes.get(cell.getAttribute('parent') || '')
    nodes.set(cell.getAttribute('id') || '', {
      id: cell.getAttribute('id') || '',
      x: num(geo, 'x') + (parent ? parent.x : 0),
      y: num(geo, 'y') + (parent ? parent.y : 0),
      w: num(geo, 'width'),
      h: num(geo, 'height'),
      shape: shapeOf(style),
      label: labelText(cell.getAttribute('value')),
      fill: style.fillColor && style.fillColor !== 'none' ? style.fillColor : undefined,
      stroke: style.strokeColor && style.strokeColor !== 'none' ? style.strokeColor : undefined
    })
  }

  // Labels attached to edges as child vertices (style edgeLabel).
  const childLabels = new Map<string, string>()
  for (const cell of cells) {
    const parentId = cell.getAttribute('parent') || ''
    if (cell.getAttribute('vertex') === '1' && cell.getAttribute('style')?.includes('edgeLabel')) {
      const text = labelText(cell.getAttribute('value'))
      if (text)
        childLabels.set(parentId, [childLabels.get(parentId), text].filter(Boolean).join(' '))
    }
  }

  const edges: DiagramEdge[] = []
  for (const cell of edgeCells) {
    const id = cell.getAttribute('id') || ''
    const style = parseStyle(cell.getAttribute('style'))
    const geo = cell.querySelector('mxGeometry')
    const pointOf = (as: string) => {
      const p = geo?.querySelector(`mxPoint[as="${as}"]`)
      return p ? { x: num(p, 'x'), y: num(p, 'y') } : null
    }
    const waypoints = Array.from(geo?.querySelectorAll('Array[as="points"] > mxPoint') || []).map(
      (p) => ({
        x: num(p, 'x'),
        y: num(p, 'y')
      })
    )
    const src = nodes.get(cell.getAttribute('source') || '')
    const tgt = nodes.get(cell.getAttribute('target') || '')
    const srcFree = pointOf('sourcePoint')
    const tgtFree = pointOf('targetPoint')
    const centre = (n: DiagramNode) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 })
    const firstToward = waypoints[0] || (tgt ? centre(tgt) : tgtFree) || { x: 0, y: 0 }
    const lastFrom = waypoints[waypoints.length - 1] ||
      (src ? centre(src) : srcFree) || { x: 0, y: 0 }
    const start = src ? anchor(src, firstToward, style.exitX, style.exitY) : srcFree
    const end = tgt ? anchor(tgt, lastFrom, style.entryX, style.entryY) : tgtFree
    if (!start || !end) continue
    edges.push({
      id,
      points: orthogonalize([start, ...waypoints, end]),
      label: [labelText(cell.getAttribute('value')), childLabels.get(id)].filter(Boolean).join(' '),
      arrow: style.endArrow !== 'none'
    })
  }

  const all = [...nodes.values()]
  const xs = [
    ...all.flatMap((n) => [n.x, n.x + n.w]),
    ...edges.flatMap((e) => e.points.map((p) => p.x))
  ]
  const ys = [
    ...all.flatMap((n) => [n.y, n.y + n.h]),
    ...edges.flatMap((e) => e.points.map((p) => p.y))
  ]
  const pad = 20
  const minX = (xs.length ? Math.min(...xs) : 0) - pad
  const minY = (ys.length ? Math.min(...ys) : 0) - pad
  return {
    minX,
    minY,
    width: (xs.length ? Math.max(...xs) : 0) + pad - minX,
    height: (ys.length ? Math.max(...ys) : 0) + pad - minY,
    nodes: all,
    edges
  }
}
